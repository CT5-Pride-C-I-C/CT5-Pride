const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();

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
app.use(express.static('.'));

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

    const remoteUrl = `https://x-access-token:${token}@github.com/${config.github.owner}/${config.github.repo}.git`;
    
    exec(`git remote set-url origin "${remoteUrl}"`, (err, stdout, stderr) => {
        if (err) {
            console.error('❌ Failed to configure Git remote:', err.message);
            console.error('💡 This may be due to:');
            console.error('   - Invalid GitHub token');
            console.error('   - Repository not found');
            console.error('   - Insufficient token permissions');
            return false;
        }
        console.log('✅ Git remote configured successfully');
        console.log(`🔗 Repository: ${config.github.owner}/${config.github.repo}`);
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

        // Load current config.js
        const configPath = path.join(__dirname, 'js', 'config.js');
        let configContent = fs.readFileSync(configPath, 'utf8');
        
        // Parse the roles array from config.js
        const rolesMatch = configContent.match(/export const roles = (\[[\s\S]*?\]);/);
        if (!rolesMatch) {
            throw new Error('Could not find roles array in config.js');
        }
        
        // Parse the roles array - use JSON.parse instead of eval for safety
        const rolesString = rolesMatch[1];
        let roles;
        try {
            roles = JSON.parse(rolesString);
        } catch (parseError) {
            console.error('Error parsing roles:', parseError);
            throw new Error('Invalid JSON in roles array');
        }
        
        // Check if role with same ID already exists
        if (roles.find(role => role.id === roleData.id)) {
            return res.status(400).json({
                success: false,
                message: `❌ Role with ID "${roleData.id}" already exists`
            });
        }
        
        // Add the new role to the array
        roles.push(roleData);
        
        // Create new config content with updated roles
        const updatedRolesString = JSON.stringify(roles, null, 4);
        const updatedConfigContent = configContent.replace(
            /export const roles = (\[[\s\S]*?\]);/,
            `export const roles = ${updatedRolesString};`
        );
        
        // Write the updated config back to file
        fs.writeFileSync(configPath, updatedConfigContent, 'utf8');

        // Configure Git remote if not already done
        configureGitRemote();

        // Add the updated config.js file
        await runCommand('git add js/config.js');

        // Commit changes
        const commitMessage = `Add new role: ${roleData.title}`;
        await runCommand(`git commit -m "${commitMessage}"`);

        // Push to GitHub
        await runCommand('git push origin main');

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
        console.error('❌ Submit operation failed:', error);
        
        // Provide more specific error messages
        let errorMessage = '❌ Failed to submit role';
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

        // Load current config.js
        const configPath = path.join(__dirname, 'js', 'config.js');
        let configContent = fs.readFileSync(configPath, 'utf8');
        
        // Parse the roles array from config.js
        const rolesMatch = configContent.match(/export const roles = (\[[\s\S]*?\]);/);
        if (!rolesMatch) {
            throw new Error('Could not find roles array in config.js');
        }
        
        // Parse the roles array - use JSON.parse instead of eval for safety
        const rolesString = rolesMatch[1];
        let roles;
        try {
            roles = JSON.parse(rolesString);
        } catch (parseError) {
            console.error('Error parsing roles:', parseError);
            throw new Error('Invalid JSON in roles array');
        }
        
        // Find the role to update
        const roleIndex = roles.findIndex(role => role.id === oldId);
        if (roleIndex === -1) {
            return res.status(404).json({
                success: false,
                message: `❌ Role with ID "${oldId}" not found`
            });
        }
        
        // Update the role
        roles[roleIndex] = { ...roles[roleIndex], ...updatedRole };
        
        // Create new config content with updated roles
        const updatedRolesString = JSON.stringify(roles, null, 4);
        const updatedConfigContent = configContent.replace(
            /export const roles = (\[[\s\S]*?\]);/,
            `export const roles = ${updatedRolesString};`
        );
        
        // Write the updated config back to file
        fs.writeFileSync(configPath, updatedConfigContent, 'utf8');
        console.log('✅ Role updated in config.js');

        // Configure Git remote if not already done
        configureGitRemote();

        // Add the updated config.js file
        await runCommand('git add js/config.js');
        console.log('✅ Updated config.js staged for commit');

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
        console.error('❌ Update operation failed:', error);
        
        let errorMessage = '❌ Failed to update role';
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

        // Load current config.js
        const configPath = path.join(__dirname, 'js', 'config.js');
        
        let configContent;
        try {
            configContent = fs.readFileSync(configPath, 'utf8');
        } catch (fileError) {
            console.error('❌ Failed to read config.js:', fileError);
            return res.status(500).json({
                success: false,
                message: '❌ Failed to read configuration file',
                error: fileError.message
            });
        }
        
        // Parse the roles array from config.js using proper regex
        const rolesMatch = configContent.match(/export const roles = (\[[\s\S]*?\]);/);
        if (!rolesMatch) {
            console.error('❌ Could not find roles array in config.js');
            return res.status(500).json({
                success: false,
                message: '❌ Could not find roles array in configuration file'
            });
        }
        
        // Parse the roles array - use JSON.parse for safety
        const rolesString = rolesMatch[1];
        let roles;
        try {
            roles = JSON.parse(rolesString);
        } catch (parseError) {
            console.error('❌ Error parsing roles JSON:', parseError);
            return res.status(500).json({
                success: false,
                message: '❌ Invalid JSON in roles array',
                error: parseError.message
            });
        }
        
        // Find the role to delete
        const roleToDelete = roles.find(role => role.id === roleId);
        if (!roleToDelete) {
            return res.status(404).json({
                success: false,
                message: `❌ Role with ID "${roleId}" not found`
            });
        }
        
        // Remove the role from the array
        const updatedRoles = roles.filter(role => role.id !== roleId);
        
        // Create new config content with updated roles
        const updatedRolesString = JSON.stringify(updatedRoles, null, 4);
        const updatedConfigContent = configContent.replace(
            /export const roles = (\[[\s\S]*?\]);/,
            `export const roles = ${updatedRolesString};`
        );
        
        // Write the updated config back to file
        try {
            fs.writeFileSync(configPath, updatedConfigContent, 'utf8');
        } catch (writeError) {
            console.error('❌ Failed to write config.js:', writeError);
            return res.status(500).json({
                success: false,
                message: '❌ Failed to update configuration file',
                error: writeError.message
            });
        }

        // Configure Git remote if not already done
        try {
            configureGitRemote();
        } catch (gitConfigError) {
            console.error('❌ Git configuration failed:', gitConfigError);
            return res.status(500).json({
                success: false,
                message: '❌ Git configuration failed',
                error: gitConfigError.message
            });
        }

        // Add the updated config.js file
        try {
            await runCommand('git add js/config.js');
        } catch (addError) {
            console.error('❌ Git add failed:', addError);
            return res.status(500).json({
                success: false,
                message: '❌ Failed to stage changes',
                error: addError.message
            });
        }

        // Commit changes
        const commitMessage = `Remove role: ${roleToDelete.title}`;
        try {
            await runCommand(`git commit -m "${commitMessage}"`);
        } catch (commitError) {
            console.error('❌ Git commit failed:', commitError);
            return res.status(500).json({
                success: false,
                message: '❌ Failed to commit changes',
                error: commitError.message
            });
        }

        // Push to GitHub
        try {
            await runCommand('git push origin main');
        } catch (pushError) {
            console.error('❌ Git push failed:', pushError);
            return res.status(500).json({
                success: false,
                message: '❌ Failed to push changes to GitHub',
                error: pushError.message
            });
        }

        // Success response
        res.json({
            success: true,
            message: '✅ Role deleted and changes pushed to GitHub successfully!',
            details: {
                roleId: roleId,
                roleTitle: roleToDelete.title,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Delete operation failed:', error);
        
        let errorMessage = '❌ Failed to delete role';
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

// API endpoint to get current roles
app.get('/api/roles', (req, res) => {
    try {
        // Load current config.js
        const configPath = path.join(__dirname, 'js', 'config.js');
        let configContent = fs.readFileSync(configPath, 'utf8');
        
        // Parse the roles array from config.js
        const rolesMatch = configContent.match(/export const roles = (\[[\s\S]*?\]);/);
        if (!rolesMatch) {
            throw new Error('Could not find roles array in config.js');
        }
        
        // Parse the roles array - use JSON.parse instead of eval for safety
        const rolesString = rolesMatch[1];
        let roles;
        try {
            roles = JSON.parse(rolesString);
        } catch (parseError) {
            console.error('❌ Error parsing roles JSON:', parseError);
            throw new Error('Invalid JSON in roles array');
        }
        
        res.json({
            success: true,
            roles: roles,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Failed to load roles:', error);
        res.status(500).json({
            success: false,
            message: '❌ Failed to load roles',
            error: error.message,
            timestamp: new Date().toISOString()
        });
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

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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
        console.log('✅ GitHub token loaded from .env');
        console.log(`🔑 Token: ${process.env.GITHUB_TOKEN.substring(0, 10)}...${process.env.GITHUB_TOKEN.substring(process.env.GITHUB_TOKEN.length - 4)}`);
        configureGitRemote();
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