# 🚀 CT5 Pride Admin System Setup Guide

## 📋 Overview

This admin system allows you to add volunteer roles through a web form that automatically updates your website via GitHub Actions. No server required!

## 🔧 Setup Steps

### Step 1: GitHub Personal Access Token

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/tokens
   - Click "Generate new token (classic)"

2. **Configure Token**
   - **Note**: "CT5 Pride Admin Token"
   - **Expiration**: Choose your preference (90 days recommended)
   - **Scopes**: Select these permissions:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)

3. **Copy Token**
   - Click "Generate token"
   - **IMPORTANT**: Copy the token immediately (you won't see it again!)

### Step 2: Repository Settings (Already Configured)

✅ **Repository URL**: `CT5-Pride-C-I-C/CT5-Pride`
✅ **GitHub Token**: `admin-roles-token` (you'll enter this when using the form)
✅ **Permissions**: Full admin access
✅ **Expiration**: Never expires

2. **Commit and Push Changes**
   ```bash
   git add .
   git commit -m "Add admin system files"
   git push
   ```

### Step 3: Test the System

1. **Open Admin Form**
   - Visit: `your-netlify-url/admin-add-role.html`
   - Or open locally: `admin-add-role.html`

2. **Fill Out a Test Role**
   - Complete all required fields
   - Click "Preview Role" to see how it will look
   - Click "Save Role" to submit

3. **Enter GitHub Token**
   - When prompted, paste your GitHub token (admin-roles-token)
   - The system will send the role to GitHub Actions

4. **Check Progress**
   - Go to your GitHub repository
   - Click "Actions" tab
   - You'll see the workflow running

5. **Wait for Deployment**
   - GitHub Actions will update `js/main.js`
   - Netlify will automatically deploy the changes
   - Your website will update in 1-2 minutes

## 🔄 How It Works

### 1. Form Submission
```
User fills form → JavaScript sends data to GitHub API
```

### 2. GitHub Actions Processing
```
GitHub receives data → Runs workflow → Updates js/main.js → Commits changes
```

### 3. Netlify Deployment
```
Netlify detects changes → Rebuilds website → Deploys updates
```

## 🛠️ Troubleshooting

### Common Issues

#### "GitHub API Error: Not Found"
- **Cause**: Wrong repository name in `js/admin.js`
- **Fix**: Update the repository URL to match your actual repo

#### "GitHub API Error: Bad credentials"
- **Cause**: Invalid or expired token
- **Fix**: Generate a new token and try again

#### "GitHub API Error: Insufficient scopes"
- **Cause**: Token doesn't have required permissions
- **Fix**: Regenerate token with `repo` and `workflow` scopes

#### Workflow Fails in GitHub Actions
- **Check**: Go to repository → Actions tab → Click failed workflow
- **Common causes**:
  - Syntax error in `js/main.js`
  - Missing required fields in form
  - Network issues

### Debugging Steps

1. **Check Browser Console**
   - Press F12 → Console tab
   - Look for error messages

2. **Check GitHub Actions Logs**
   - Repository → Actions → Click workflow run
   - Check each step for errors

3. **Verify Token Permissions**
   - Go to https://github.com/settings/tokens
   - Check if token has required scopes

## 🔒 Security Notes

### Token Security
- **Never commit your token** to the repository
- **Store it securely** (password manager recommended)
- **Regenerate regularly** (every 90 days)
- **Use minimal permissions** (only what's needed)

### Repository Security
- **Public repositories**: Anyone can see your code
- **Private repositories**: Only you and collaborators can see
- **Consider making repo private** if concerned about security

## 📱 Usage Tips

### Best Practices
1. **Always preview** roles before saving
2. **Use descriptive titles** for easy identification
3. **Test with draft status** first
4. **Check the live site** after deployment

### Form Guidelines
- **Role ID**: Auto-generated, but you can customize
- **Status**: Use "draft" for testing, "open" for live roles
- **Criteria**: One requirement per line, start with bullet points
- **Description**: Supports HTML formatting

### Workflow Monitoring
- **GitHub Actions**: Check progress in repository Actions tab
- **Netlify**: Monitor deployment in Netlify dashboard
- **Live Site**: Verify changes appear on your website

## 🆘 Support

### If Something Goes Wrong
1. **Check this guide** for common solutions
2. **Review GitHub Actions logs** for specific errors
3. **Verify token permissions** and repository settings
4. **Test with a simple role** to isolate issues

### Getting Help
- **GitHub Issues**: Create an issue in your repository
- **Documentation**: Check GitHub Actions and Netlify docs
- **Community**: Ask in relevant forums or communities

## 🎉 Success!

Once everything is working:
- ✅ **Fill out forms** to add roles
- ✅ **Preview before saving** to check formatting
- ✅ **Monitor progress** in GitHub Actions
- ✅ **See live updates** on your website
- ✅ **No manual file editing** required!

Your admin system is now fully automated! 🚀 