const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const config = require('./config');
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

    const remoteUrl = `https://x-access-token:${token}@github.com/${config.github.owner}/${config.github.repo}.git`;
    
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
                console.error(`Error: ${err && err.message ? err.message : 'Unknown error'}`);
                // For git commands, stderr might contain useful info even on "success"
                const errorMessage = stderr || (err && err.message) || 'Unknown error occurred';
                return reject(errorMessage);
            }
            console.log(`✅ Command successful: ${command}`);
            resolve(stdout || '');
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

        // Check if there are any staged changes to commit
        const status = await runCommand('git status --porcelain');
        if (!status.trim()) {
            console.log('ℹ️ No changes to commit.');
            return res.status(400).json({
                success: false,
                message: 'ℹ️ No changes detected — nothing to commit.',
                details: {
                    roleTitle: roleData.title,
                    roleId: roleData.id,
                    timestamp: new Date().toISOString(),
                    reason: 'No file changes were detected after staging'
                }
            });
        }

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
        
        // Provide more specific error messages
        let errorMessage = '❌ Failed to submit role to GitHub';
        let errorDetails = error && error.message ? error.message : 'Unknown error occurred';
        
        if (error && error.message && error.message.includes('repository') && error.message.includes('not found')) {
            errorMessage = '❌ GitHub repository not found';
            errorDetails = 'The repository URL is incorrect or the repository doesn\'t exist. Please check your repository settings.';
        } else if (error && error.message && error.message.includes('authentication')) {
            errorMessage = '❌ Authentication failed';
            errorDetails = 'Your GitHub token may be invalid or expired. Please check your token permissions.';
        } else if (error && error.message && error.message.includes('network')) {
            errorMessage = '❌ Network error';
            errorDetails = 'Unable to connect to GitHub. Please check your internet connection.';
        } else if (error && error.message && error.message.includes('nothing to commit')) {
            errorMessage = 'ℹ️ No changes to commit';
            errorDetails = 'No file changes were detected. The role may already exist or no modifications were made.';
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage,
            error: errorDetails,
            troubleshooting: {
                checkRepository: 'Verify the repository URL in config.js',
                checkToken: 'Ensure your GitHub token has repo permissions',
                checkNetwork: 'Test your internet connection',
                checkChanges: 'Ensure the role submission creates actual file changes',
                checkGitStatus: 'Run "git status" to see current repository state'
            },
            timestamp: new Date().toISOString()
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
            status: status || 'Working directory clean',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Failed to get Git status',
            error: error && error.message ? error.message : 'Unknown error occurred',
            timestamp: new Date().toISOString()
        });
    }
});

// API endpoint to check if role submission would create changes
app.post('/api/check-changes', async (req, res) => {
    try {
        const roleData = req.body.roleData;
        
        if (!roleData) {
            return res.status(400).json({ 
                success: false, 
                message: '❌ No role data provided' 
            });
        }

        // Get current status before staging
        const beforeStatus = await runCommand('git status --porcelain');
        
        // Stage changes (this simulates what would happen during submission)
        await runCommand('git add .');
        
        // Get status after staging
        const afterStatus = await runCommand('git status --porcelain');
        
        // Reset staging area to original state
        await runCommand('git reset');
        
        const hasChanges = afterStatus.trim() !== beforeStatus.trim();
        
        res.json({
            success: true,
            hasChanges: hasChanges,
            message: hasChanges ? '✅ Changes detected' : 'ℹ️ No changes detected',
            beforeStatus: beforeStatus || 'Working directory clean',
            afterStatus: afterStatus || 'Working directory clean',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Failed to check for changes',
            error: error && error.message ? error.message : 'Unknown error occurred',
            timestamp: new Date().toISOString()
        });
    }
});

// API endpoint to update an existing role
app.put('/api/update-role', async (req, res) => {
    try {
        const { oldId, updatedRole } = req.body;
        
        if (!oldId || !updatedRole) {
            return res.status(400).json({ 
                success: false, 
                message: '❌ Missing role data' 
            });
        }

        console.log('🔄 Updating role:', oldId);

        // Configure Git remote if not already done
        configureGitRemote();

        // Add all changes
        await runCommand('git add .');
        console.log('✅ Files staged for commit');

        // Check if there are any staged changes to commit
        const status = await runCommand('git status --porcelain');
        if (!status.trim()) {
            console.log('ℹ️ No changes to commit.');
            return res.status(400).json({
                success: false,
                message: 'ℹ️ No changes detected — nothing to commit.',
                details: {
                    roleTitle: updatedRole.title,
                    roleId: updatedRole.id,
                    timestamp: new Date().toISOString(),
                    reason: 'No file changes were detected after staging'
                }
            });
        }

        // Commit changes
        const commitMessage = `Edit role: ${updatedRole.title}`;
        await runCommand(`git commit -m "${commitMessage}"`);
        console.log('✅ Changes committed');

        // Push to GitHub
        await runCommand('git push origin main');
        console.log('✅ Changes pushed to GitHub');

        // Success response
        res.json({
            success: true,
            message: '✅ Role updated and pushed to GitHub successfully!',
            details: {
                roleTitle: updatedRole.title,
                roleId: updatedRole.id,
                oldId: oldId,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Git operation failed:', error);
        
        let errorMessage = '❌ Failed to update role on GitHub';
        let errorDetails = error && error.message ? error.message : 'Unknown error occurred';
        
        res.status(500).json({
            success: false,
            message: errorMessage,
            error: errorDetails,
            timestamp: new Date().toISOString()
        });
    }
});

// API endpoint to delete a role
app.delete('/api/delete-role/:id', async (req, res) => {
    try {
        const roleId = req.params.id;
        
        if (!roleId) {
            return res.status(400).json({ 
                success: false, 
                message: '❌ No role ID provided' 
            });
        }

        console.log('🔄 Deleting role:', roleId);

        // Configure Git remote if not already done
        configureGitRemote();

        // Add all changes
        await runCommand('git add .');
        console.log('✅ Files staged for commit');

        // Check if there are any staged changes to commit
        const status = await runCommand('git status --porcelain');
        if (!status.trim()) {
            console.log('ℹ️ No changes to commit.');
            return res.status(400).json({
                success: false,
                message: 'ℹ️ No changes detected — nothing to commit.',
                details: {
                    roleId: roleId,
                    timestamp: new Date().toISOString(),
                    reason: 'No file changes were detected after staging'
                }
            });
        }

        // Commit changes
        const commitMessage = `Remove role: ${roleId}`;
        await runCommand(`git commit -m "${commitMessage}"`);
        console.log('✅ Changes committed');

        // Push to GitHub
        await runCommand('git push origin main');
        console.log('✅ Changes pushed to GitHub');

        // Success response
        res.json({
            success: true,
            message: '✅ Role deleted and changes pushed to GitHub successfully!',
            details: {
                roleId: roleId,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Git operation failed:', error);
        
        let errorMessage = '❌ Failed to delete role from GitHub';
        let errorDetails = error && error.message ? error.message : 'Unknown error occurred';
        
        res.status(500).json({
            success: false,
            message: errorMessage,
            error: errorDetails,
            timestamp: new Date().toISOString()
        });
    }
});

// API endpoint to update role status
app.patch('/api/update-role-status/:id', async (req, res) => {
    try {
        const roleId = req.params.id;
        const { status } = req.body;
        
        if (!roleId || !status) {
            return res.status(400).json({ 
                success: false, 
                message: '❌ Missing role ID or status' 
            });
        }

        console.log('🔄 Updating status for role:', roleId, 'to:', status);

        // Configure Git remote if not already done
        configureGitRemote();

        // Add all changes
        await runCommand('git add .');
        console.log('✅ Files staged for commit');

        // Check if there are any staged changes to commit
        const gitStatus = await runCommand('git status --porcelain');
        if (!gitStatus.trim()) {
            console.log('ℹ️ No changes to commit.');
            return res.status(400).json({
                success: false,
                message: 'ℹ️ No changes detected — nothing to commit.',
                details: {
                    roleId: roleId,
                    status: status,
                    timestamp: new Date().toISOString(),
                    reason: 'No file changes were detected after staging'
                }
            });
        }

        // Commit changes
        const commitMessage = `Update status of role: ${roleId} to ${status}`;
        await runCommand(`git commit -m "${commitMessage}"`);
        console.log('✅ Changes committed');

        // Push to GitHub
        await runCommand('git push origin main');
        console.log('✅ Changes pushed to GitHub');

        // Success response
        res.json({
            success: true,
            message: '✅ Role status updated and pushed to GitHub successfully!',
            details: {
                roleId: roleId,
                status: status,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Git operation failed:', error);
        
        let errorMessage = '❌ Failed to update role status on GitHub';
        let errorDetails = error && error.message ? error.message : 'Unknown error occurred';
        
        res.status(500).json({
            success: false,
            message: errorMessage,
            error: errorDetails,
            timestamp: new Date().toISOString()
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