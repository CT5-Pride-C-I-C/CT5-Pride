// CT5 Pride Configuration
// Update these settings with your actual GitHub repository information

module.exports = {
    // GitHub Repository Configuration
    github: {
        // Replace with your actual GitHub username/organization
        owner: 'CT5-pride-C-I-C',
        // Replace with your actual repository name
        repo: 'CT5-Pride',
        // The branch to push to (usually 'main' or 'master')
        branch: 'main'
    },
    
    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        host: 'localhost'
    },
    
    // Git Configuration
    git: {
        // Commit message template
        commitMessageTemplate: 'Add new role: {title}',
        // Author information (optional)
        author: {
            name: 'CT5 Pride Admin',
            email: 'admin@ct5pride.org'
        }
    }
}; 