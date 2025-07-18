# CT5 Pride Website

A static website for CT5 Pride, featuring a Netlify CMS-powered admin panel for managing volunteer roles and applications.

## Deployment Instructions

1. **Create a GitHub Repository**
   - Create a new repository on GitHub
   - Push this codebase to the repository

2. **Deploy to Netlify**
   - Go to [Netlify](https://www.netlify.com/)
   - Click "New site from Git"
   - Choose your GitHub repository
   - Configure build settings:
     - Build command: leave empty
     - Publish directory: `/`
   - Click "Deploy site"

3. **Enable Netlify Identity**
   - Go to your site settings in Netlify
   - Navigate to "Identity"
   - Click "Enable Identity"
   - Under "Registration preferences", choose "Invite only"
   - Enable "Git Gateway" in Identity > Services

4. **Configure Netlify CMS**
   - Go to Settings > Identity
   - Scroll to "External providers" and add GitHub
   - Under "Services > Git Gateway", click "Enable Git Gateway"

5. **Invite Admin Users**
   - Go to the Identity tab in your Netlify dashboard
   - Click "Invite users"
   - Enter email addresses for admin access
   - Users will receive an invitation email

## Local Development

1. Clone the repository
2. Serve the site using a local server
3. Access the admin panel at `/admin/`

## File Structure

```
/
├── admin/
│   ├── index.html    # CMS entry point
│   └── config.yml    # CMS configuration
├── data/
│   ├── roles/        # Volunteer role markdown files
│   └── applications/ # Application markdown files
├── css/
│   └── style.css
├── js/
│   └── main.js
├── images/
└── netlify.toml      # Netlify configuration
```

## Content Management

- Access the admin panel at `your-site.netlify.app/admin/`
- Create and manage volunteer roles
- View submitted applications
- Upload and manage media files

## Security

- Admin panel access is restricted to invited users only
- All content changes are version-controlled
- Secure file uploads handled by Netlify
- HTTPS enforced by default

## Support

For technical support or questions about the CMS:
1. Check Netlify's documentation: https://docs.netlify.com/
2. Contact your development team
3. Visit Netlify CMS docs: https://www.netlifycms.org/docs/intro/
