# CT5 Pride Community Website

A modern, accessible website for the CT5 Pride community with an admin panel for managing volunteer roles.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Git
- GitHub Personal Access Token

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/ct5pride/CT5-pride.git
   cd CT5-pride
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure GitHub Token**
   
   **Option A: Use the setup script (Recommended)**
   ```bash
   npm run setup
   ```
   This will guide you through creating a `.env` file with your GitHub token.

   **Option B: Manual setup**
   Create a `.env` file in the root directory:
   ```
   GITHUB_TOKEN=your_github_token_here
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the website**
   - Main site: http://localhost:3000
   - Admin panel: http://localhost:3000/admin-add-role.html

## 🔧 GitHub Token Setup

To get your GitHub Personal Access Token:

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "CT5 Pride Admin")
4. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
5. Click "Generate token"
6. Copy the token and use it in the setup

## 📁 Project Structure

```
CT5-Pride/
├── index.html              # Main homepage
├── admin-add-role.html     # Admin panel
├── js/
│   ├── main.js            # Main JavaScript
│   └── admin.js           # Admin functionality
├── css/
│   ├── style.css          # Main styles
│   └── admin.css          # Admin styles
├── server.js              # Node.js server
├── package.json           # Dependencies
├── .env                   # Environment variables (not in git)
└── .gitignore            # Git ignore rules
```

## ✨ Features

### Admin Panel
- **Secure Authentication**: Password-protected admin access
- **Role Management**: Add, edit, and manage volunteer roles
- **Live Preview**: See how roles will appear before publishing
- **Git Integration**: Automatic commits and pushes to GitHub
- **Confirmation Messages**: Clear success/error feedback

### Website Features
- **Responsive Design**: Works on all devices
- **Accessibility**: WCAG compliant
- **Modern UI**: Clean, professional design
- **Fast Loading**: Optimized performance

## 🔒 Security

- GitHub tokens are stored securely in `.env` files
- `.env` files are excluded from version control
- Admin panel requires authentication
- All Git operations are logged for audit purposes

## 🛠️ Development

### Running in Development Mode
```bash
npm run dev
```

### File Structure for Adding Content
- **HTML Pages**: Add new pages in the root directory
- **Styles**: Add CSS files in the `css/` directory
- **Scripts**: Add JavaScript files in the `js/` directory
- **Images**: Add images in the `Images/` directory

### Adding New Volunteer Roles
1. Access the admin panel at `/admin-add-role.html`
2. Enter the admin password: `CT5Pride2024!`
3. Fill out the role form
4. Preview the role
5. Submit to automatically commit and push to GitHub

## 📝 Troubleshooting

### Common Issues

**"GitHub token not configured"**
- Make sure you have a `.env` file with `GITHUB_TOKEN=your_token`
- Verify your token has the correct permissions
- Run `npm run setup` to reconfigure

**"Git push failed"**
- Check your internet connection
- Verify your GitHub token is valid
- Ensure you have write access to the repository

**"Server not starting"**
- Make sure Node.js is installed
- Run `npm install` to install dependencies
- Check if port 3000 is available

### Getting Help
- Check the server console for detailed error messages
- Verify your `.env` file is properly configured
- Ensure all dependencies are installed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- CT5 Pride community
- All volunteers and contributors
- Open source community 