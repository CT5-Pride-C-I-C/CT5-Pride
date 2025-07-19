const express = require('express');
const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Configure Git remote with token
function configureGitRemote() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        console.error('❌ GITHUB_TOKEN not found in environment variables');
        return false;
    }

    const remoteUrl = `https://x-access-token:${token}@github.com/ct5pride/CT5-pride.git`;
    
    exec(`git remote set-url origin "${remoteUrl}"`, (err, stdout, stderr) => {
        if (err) {
            console.error('❌ Failed to configure Git remote:', err);
            return false;
        }
        console.log('✅ Git remote configured successfully');
        return true;
    });
}

// Helper function to run Git commands
function runCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, { cwd: __dirname }, (err, stdout, stderr) => {
            if (err) {
                console.error(`❌ Command failed: ${command}`);
                console.error(`Error: ${err.message}`);
                return reject(stderr || err.message);
            }
            console.log(`✅ Command successful: ${command}`);
            resolve(stdout);
        });
    });
}

// API endpoint to handle role submissions and Git operations
app.post('/api/submit-role', async (req, res) => {
    try {
        const roleData = req.body.roleData;
        
        if (!roleData) {
            return res.status(400).json({ 
                success: false, 
                message: '❌ No role data provided' 
            });
        }

        console.log('🔄 Starting Git operations...');

        // Configure Git remote if not already done
        configureGitRemote();

        // Add all changes
        await runCommand('git add .');
        console.log('✅ Files staged for commit');

        // Commit changes
        const commitMessage = `Add new role: ${roleData.title}`;
        await runCommand(`git commit -m "${commitMessage}"`);
        console.log('✅ Changes committed');

        // Push to GitHub
        await runCommand('git push origin main');
        console.log('✅ Changes pushed to GitHub');

        // Success response
        res.json({
            success: true,
            message: '✅ Role submitted and pushed to GitHub successfully!',
            details: {
                roleTitle: roleData.title,
                roleId: roleData.id,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Git operation failed:', error);
        res.status(500).json({
            success: false,
            message: '❌ Failed to submit role to GitHub',
            error: error.message
        });
    }
});

// API endpoint to check Git status
app.get('/api/git-status', async (req, res) => {
    try {
        const status = await runCommand('git status --porcelain');
        const isClean = status.trim() === '';
        
        res.json({
            success: true,
            isClean: isClean,
            hasChanges: !isClean,
            status: status || 'Working directory clean'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Failed to get Git status',
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    const tokenConfigured = !!process.env.GITHUB_TOKEN;
    res.json({
        success: true,
        message: '✅ Server is running',
        gitTokenConfigured: tokenConfigured,
        timestamp: new Date().toISOString()
    });
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 CT5 Pride server running on port ${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    
    // Check if GitHub token is configured
    if (process.env.GITHUB_TOKEN) {
        console.log('✅ GitHub token configured');
        configureGitRemote();
    } else {
        console.log('❌ GitHub token not found in environment variables');
        console.log('Please create a .env file with GITHUB_TOKEN=your_token_here');
    }
}); 