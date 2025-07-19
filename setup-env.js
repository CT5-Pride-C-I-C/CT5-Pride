#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🔧 CT5 Pride Environment Setup');
console.log('==============================\n');

// Check if .env already exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists!');
    rl.question('Do you want to overwrite it? (y/N): ', (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
            createEnvFile();
        } else {
            console.log('Setup cancelled.');
            rl.close();
        }
    });
} else {
    createEnvFile();
}

function createEnvFile() {
    console.log('\n📝 Please provide your GitHub Personal Access Token.');
    console.log('You can create one at: https://github.com/settings/tokens');
    console.log('Make sure it has the following permissions:');
    console.log('  - repo (Full control of private repositories)');
    console.log('  - workflow (Update GitHub Action workflows)\n');
    
    rl.question('GitHub Token: ', (token) => {
        if (!token.trim()) {
            console.log('❌ Token cannot be empty. Setup cancelled.');
            rl.close();
            return;
        }
        
        // Create .env file content
        const envContent = `GITHUB_TOKEN=${token.trim()}`;
        
        try {
            fs.writeFileSync(envPath, envContent);
            console.log('\n✅ .env file created successfully!');
            console.log('📁 Location: ' + envPath);
            console.log('\n🚀 You can now start the server with:');
            console.log('   npm install');
            console.log('   npm start');
            console.log('\n🔒 Remember: Never commit your .env file to version control!');
        } catch (error) {
            console.error('❌ Error creating .env file:', error.message);
        }
        
        rl.close();
    });
}

rl.on('close', () => {
    process.exit(0);
}); 