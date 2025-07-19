#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🔧 CT5 Pride Repository Setup');
console.log('=============================\n');

console.log('This script will help you configure your GitHub repository settings.');
console.log('You need to provide your GitHub username/organization and repository name.\n');

function updateConfig() {
    rl.question('GitHub username or organization (e.g., "ct5pride" or "CT5-Pride-C-I-C"): ', (owner) => {
        if (!owner.trim()) {
            console.log('❌ Username cannot be empty. Setup cancelled.');
            rl.close();
            return;
        }
        
        rl.question('Repository name (e.g., "CT5-pride" or "ct5-pride"): ', (repo) => {
            if (!repo.trim()) {
                console.log('❌ Repository name cannot be empty. Setup cancelled.');
                rl.close();
                return;
            }
            
            rl.question('Branch name (usually "main" or "master"): ', (branch) => {
                if (!branch.trim()) {
                    branch = 'main'; // Default to main
                }
                
                // Read current config
                const configPath = path.join(__dirname, 'config.js');
                let configContent = fs.readFileSync(configPath, 'utf8');
                
                // Update the config values
                configContent = configContent.replace(
                    /owner: ['"][^'"]*['"]/,
                    `owner: '${owner.trim()}'`
                );
                configContent = configContent.replace(
                    /repo: ['"][^'"]*['"]/,
                    `repo: '${repo.trim()}'`
                );
                configContent = configContent.replace(
                    /branch: ['"][^'"]*['"]/,
                    `branch: '${branch.trim()}'`
                );
                
                try {
                    fs.writeFileSync(configPath, configContent);
                    console.log('\n✅ Repository configuration updated successfully!');
                    console.log(`📁 GitHub: ${owner.trim()}/${repo.trim()}`);
                    console.log(`🌿 Branch: ${branch.trim()}`);
                    console.log('\n🚀 You can now restart the server and test the admin panel.');
                    console.log('   npm start');
                } catch (error) {
                    console.error('❌ Error updating configuration:', error.message);
                }
                
                rl.close();
            });
        });
    });
}

// Check if config.js exists
const configPath = path.join(__dirname, 'config.js');
if (fs.existsSync(configPath)) {
    console.log('📁 Configuration file found.');
    rl.question('Do you want to update the repository settings? (Y/n): ', (answer) => {
        if (answer.toLowerCase() === 'n' || answer.toLowerCase() === 'no') {
            console.log('Setup cancelled.');
            rl.close();
        } else {
            updateConfig();
        }
    });
} else {
    console.log('❌ Configuration file not found. Please ensure config.js exists.');
    rl.close();
}

rl.on('close', () => {
    process.exit(0);
}); 