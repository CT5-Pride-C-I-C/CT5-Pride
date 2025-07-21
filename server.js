const express = require('express');
const { exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const config = require('./config');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration (production-safe)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Eventbrite API configuration
const EVENTBRITE_API_BASE = 'https://www.eventbriteapi.com/v3';
const EVENTBRITE_API_KEY = process.env.EVENTBRITE_API_KEY;
const EVENTBRITE_PRIVATE_TOKEN = process.env.EVENTBRITE_PRIVATE_TOKEN;
const EVENTBRITE_PUBLIC_TOKEN = process.env.EVENTBRITE_PUBLIC_TOKEN;
const EVENTBRITE_CLIENT_SECRET = process.env.EVENTBRITE_CLIENT_SECRET;

// Validate Eventbrite configuration
function validateEventbriteConfig() {
    const missingTokens = [];
    
    if (!EVENTBRITE_API_KEY) missingTokens.push('EVENTBRITE_API_KEY');
    if (!EVENTBRITE_PRIVATE_TOKEN) missingTokens.push('EVENTBRITE_PRIVATE_TOKEN');
    if (!EVENTBRITE_PUBLIC_TOKEN) missingTokens.push('EVENTBRITE_PUBLIC_TOKEN');
    if (!EVENTBRITE_CLIENT_SECRET) missingTokens.push('EVENTBRITE_CLIENT_SECRET');
    
    if (missingTokens.length > 0) {
        console.warn('⚠️  Missing Eventbrite tokens:', missingTokens.join(', '));
        console.log('📝 Please add the following to your .env file:');
        console.log('   EVENTBRITE_API_KEY=your_api_key');
        console.log('   EVENTBRITE_PRIVATE_TOKEN=your_private_token');
        console.log('   EVENTBRITE_PUBLIC_TOKEN=your_public_token');
        console.log('   EVENTBRITE_CLIENT_SECRET=your_client_secret');
        return false;
    }
    
    console.log('✅ All Eventbrite tokens loaded successfully');
    console.log(`🔑 API Key: ${EVENTBRITE_API_KEY.substring(0, 5)}...`);
    console.log(`🔑 Private Token: ${EVENTBRITE_PRIVATE_TOKEN.substring(0, 5)}...`);
    console.log(`🔑 Public Token: ${EVENTBRITE_PUBLIC_TOKEN.substring(0, 5)}...`);
    console.log(`🔑 Client Secret: ${EVENTBRITE_CLIENT_SECRET.substring(0, 5)}...`);
    return true;
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
// app.use(express.static('.'));
// Serve only admin dashboard assets
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/Images', express.static(path.join(__dirname, 'Images')));

// Supabase Auth middleware for admin API protection
async function requireSupabaseAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }
    const token = authHeader.replace('Bearer ', '');
    try {
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data || !data.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
        }
        req.supabaseUser = data.user;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Token validation failed' });
    }
}

// Apply to all admin API routes
app.use(['/api/roles', '/api/applications', '/api/submit-role', '/api/update-role', '/api/delete-role', '/api/apply', '/api/cv', '/api/applications', '/api/applications/:id', '/api/applications/:id/status'], requireSupabaseAuth);

// Configure Git remote with token
function configureGitRemote() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        console.error('❌ GITHUB_TOKEN not found in environment variables');
        console.log('⚠️  Git operations will be skipped until token is configured');
        return false;
    }

    // Validate token format (basic check)
    if (!token.startsWith('github_pat_') && !token.startsWith('ghp_')) {
        console.warn('⚠️  Token format may be invalid. Expected format: github_pat_... or ghp_...');
    }

    try {
        const remotes = execSync('git remote').toString().trim();
        if (!remotes.includes('origin')) {
            console.warn("⚠️  No 'origin' remote found — skipping Git remote set-url.");
            return false;
        } else {
            execSync(`git remote set-url origin https://x-access-token:${token}@github.com/CT5-pride-C-I-C/CT5-Pride.git`);
            console.log("✅ Git remote configured successfully");
            return true;
        }
    } catch (error) {
        console.error("❌ Failed to configure Git remote:", error.message);
        return false;
    }
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

// Supabase: Submit new role
app.post('/api/submit-role', async (req, res) => {
    try {
        const roleData = req.body.roleData;
        if (!roleData) {
            return res.status(400).json({ success: false, message: 'No role data provided' });
        }
        // Insert new role into Supabase
        const { data, error } = await supabase
            .from('roles')
            .insert([roleData])
            .select();
        if (error) throw error;
        res.json({ success: true, message: 'Role submitted successfully!', role: data[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to submit role', error: error.message });
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

// Supabase: Update existing role
app.put('/api/update-role', async (req, res) => {
    try {
        const { oldId, updatedRole } = req.body;
        if (!oldId || !updatedRole) {
            return res.status(400).json({ success: false, message: 'Missing role data' });
        }
        // Update role in Supabase
        const { data, error } = await supabase
            .from('roles')
            .update(updatedRole)
            .eq('id', oldId)
            .select();
        if (error) throw error;
        res.json({ success: true, message: 'Role updated successfully!', role: data[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update role', error: error.message });
    }
});

// Supabase: Delete a role
app.delete('/api/delete-role/:id', async (req, res) => {
    try {
        const roleId = req.params.id;
        if (!roleId) {
            return res.status(400).json({ success: false, message: 'No role ID provided' });
        }
        // Delete role from Supabase
        const { error } = await supabase
            .from('roles')
            .delete()
            .eq('id', roleId);
        if (error) throw error;
        res.json({ success: true, message: 'Role deleted successfully!', roleId });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete role', error: error.message });
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

// Supabase: Get all roles
app.get('/api/roles', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('roles')
            .select('*')
            .order('posted_date', { ascending: false });
        if (error) throw error;
        res.json({ success: true, roles: data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to load roles', error: error.message });
    }
});

// Eventbrite API endpoints

// Helper function to make Eventbrite API calls
async function makeEventbriteRequest(endpoint, options = {}) {
    if (!EVENTBRITE_PRIVATE_TOKEN) {
        throw new Error('Eventbrite private token not configured');
    }

    const url = `${EVENTBRITE_API_BASE}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${EVENTBRITE_PRIVATE_TOKEN}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Eventbrite API error: ${response.status} - ${errorText}`);
    }

    return response.json();
}

// Helper function to load events config
function loadEventsConfig() {
    const configPath = path.join(__dirname, 'events-config.json');
    try {
        if (fs.existsSync(configPath)) {
            const content = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.error('Error loading events config:', error);
    }
    return { events: [], lastUpdated: null, version: '1.0.0' };
}

// Helper function to save events config
function saveEventsConfig(config) {
    const configPath = path.join(__dirname, 'events-config.json');
    config.lastUpdated = new Date().toISOString();
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
}

// Remove multer and all file system logic
// (All file upload, applications.json, and cover letter logic has been migrated to Supabase)

// GET /api/eventbrite-events - Get all events from local config
app.get('/api/eventbrite-events', (req, res) => {
    try {
        const config = loadEventsConfig();
        res.json({
            success: true,
            events: config.events,
            lastUpdated: config.lastUpdated,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Failed to load events:', error);
        res.status(500).json({
            success: false,
            message: '❌ Failed to load events',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/fetch-event - Fetch event details from Eventbrite
app.post('/api/fetch-event', async (req, res) => {
    try {
        const { eventId } = req.body;
        
        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: '❌ Event ID is required'
            });
        }

        console.log(`🔍 Fetching event details for ID: ${eventId}`);

        // Fetch event details from Eventbrite API
        const eventData = await makeEventbriteRequest(`/events/${eventId}/`);
        
        // Clean and format the event data
        const event = {
            id: eventData.id,
            title: eventData.name?.text || eventData.name,
            description: eventData.description?.text || eventData.description,
            start_date: eventData.start?.utc || eventData.start_date,
            end_date: eventData.end?.utc || eventData.end_date,
            status: eventData.status,
            url: eventData.url,
            venue: eventData.venue ? {
                name: eventData.venue.name,
                address: eventData.venue.address,
                city: eventData.venue.city,
                country: eventData.venue.country
            } : null,
            logo: eventData.logo?.url,
            category: eventData.category?.name,
            format: eventData.format?.name
        };

        res.json({
            success: true,
            event: event,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Failed to fetch event:', error);
        res.status(500).json({
            success: false,
            message: '❌ Failed to fetch event details',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/add-event - Add event to local config and commit to Git
app.post('/api/add-event', async (req, res) => {
    try {
        const eventData = req.body;
        
        if (!eventData || !eventData.id) {
            return res.status(400).json({
                success: false,
                message: '❌ Invalid event data'
            });
        }

        console.log(`➕ Adding event: ${eventData.title}`);

        // Load current events config
        const config = loadEventsConfig();
        
        // Check if event already exists
        if (config.events.find(e => e.id === eventData.id)) {
            return res.status(400).json({
                success: false,
                message: `❌ Event with ID "${eventData.id}" already exists`
            });
        }
        
        // Add the new event
        config.events.push(eventData);
        
        // Save updated config
        saveEventsConfig(config);

        // Configure Git remote if not already done
        configureGitRemote();

        // Add the events config file
        await runCommand('git add events-config.json');

        // Commit changes
        const commitMessage = `Add new event: ${eventData.title}`;
        await runCommand(`git commit -m "${commitMessage}"`);

        // Push to GitHub
        await runCommand('git push origin main');

        res.json({
            success: true,
            message: '✅ Event added and pushed to GitHub successfully!',
            details: {
                eventTitle: eventData.title,
                eventId: eventData.id,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Failed to add event:', error);
        res.status(500).json({
            success: false,
            message: '❌ Failed to add event',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// DELETE /api/delete-event/:id - Delete event from local config and commit to Git
app.delete('/api/delete-event/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        
        console.log(`🗑️ Deleting event with ID: ${eventId}`);

        // Load current events config
        const config = loadEventsConfig();
        
        // Find the event to delete
        const eventIndex = config.events.findIndex(e => e.id === eventId);
        if (eventIndex === -1) {
            return res.status(404).json({
                success: false,
                message: `❌ Event with ID "${eventId}" not found`
            });
        }
        
        const eventToDelete = config.events[eventIndex];
        
        // Remove the event
        config.events.splice(eventIndex, 1);
        
        // Save updated config
        saveEventsConfig(config);

        // Configure Git remote if not already done
        configureGitRemote();

        // Add the events config file
        await runCommand('git add events-config.json');

        // Commit changes
        const commitMessage = `Remove event: ${eventToDelete.title}`;
        await runCommand(`git commit -m "${commitMessage}"`);

        // Push to GitHub
        await runCommand('git push origin main');

        res.json({
            success: true,
            message: '✅ Event deleted and pushed to GitHub successfully!',
            details: {
                eventId: eventId,
                eventTitle: eventToDelete.title,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Failed to delete event:', error);
        res.status(500).json({
            success: false,
            message: '❌ Failed to delete event',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Supabase: Generate signed download URL for CVs (admin only)
app.get('/api/cv/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        if (!filename) {
            return res.status(400).json({ success: false, message: 'No filename provided' });
        }
        // Generate signed download URL (5 min expiry)
        const { data, error } = await supabase
            .storage
            .from('volunteer-applications')
            .createSignedUrl(filename, 300);
        if (error) throw error;
        res.json({ success: true, url: data.signedUrl });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to generate download URL', error: error.message });
    }
});

// Supabase: Delete an application (admin only)
app.delete('/api/applications/:id', async (req, res) => {
    try {
        const applicationId = req.params.id;
        if (!applicationId) {
            return res.status(400).json({ success: false, message: 'No application ID provided' });
        }
        const { error } = await supabase
            .from('applications')
            .delete()
            .eq('id', applicationId);
        if (error) throw error;
        res.json({ success: true, message: 'Application deleted successfully!', applicationId });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete application', error: error.message });
    }
});

// Supabase: Update application status (admin only)
app.patch('/api/applications/:id/status', async (req, res) => {
    try {
        const applicationId = req.params.id;
        const { status, reviewedBy } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }
        const { data, error } = await supabase
            .from('applications')
            .update({
                status,
                reviewed_at: new Date().toISOString(),
                reviewed_by: reviewedBy || 'admin'
            })
            .eq('id', applicationId)
            .select();
        if (error) throw error;
        res.json({ success: true, message: 'Application status updated successfully!', application: data[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update application status', error: error.message });
    }
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-add-role.html'));
});

// Catch-all 404 handler for unmatched routes
app.use((req, res) => {
    res.status(404).send('404 Not Found: This admin panel does not serve public site pages.');
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 CT5 Pride server running on port ${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    
    // Validate Eventbrite configuration
    console.log('\n🎉 Eventbrite Integration Status:');
    validateEventbriteConfig();
    
    // Check if GitHub token is configured
    console.log('\n🔗 GitHub Integration Status:');
    if (process.env.GITHUB_TOKEN) {
        console.log('✅ GitHub token loaded');
        console.log(`🔑 Token: ${process.env.GITHUB_TOKEN.substring(0, 10)}...${process.env.GITHUB_TOKEN.substring(process.env.GITHUB_TOKEN.length - 4)}`);
        
        // Attempt remote configuration and show result
        console.log('🔄 Attempting remote configuration...');
        const remoteResult = configureGitRemote();
        if (remoteResult) {
            console.log('✅ Remote configuration successful');
        } else {
            console.log('⚠️  Remote configuration failed or skipped');
        }
    } else {
        console.log('⚠️  GITHUB_TOKEN not found in environment variables');
        console.log('📝 Please add the following to your .env file:');
        console.log('   GITHUB_TOKEN=your_actual_token_here');
        console.log('🔗 Get a token from: https://github.com/settings/tokens');
        console.log('⚠️  Git operations will be skipped until token is configured');
    }
    
    console.log('\n✨ CT5 Pride Eventbrite Integration Ready!');
    console.log('   • Admin panel: /admin-add-role.html');
    console.log('   • Events page: /events.html');
    console.log('   • API endpoints: /api/eventbrite-events, /api/fetch-event, etc.');
}); 