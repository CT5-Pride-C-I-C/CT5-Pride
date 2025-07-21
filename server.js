const express = require('express');
const path = require('path');
const fs = require('fs');
const config = require('./config');

const app = express();
const PORT = process.env.PORT || 3000;

const adminDir = path.join(__dirname, 'admin');

// 1. Serve static files from /admin
app.use(express.static(adminDir));

// 2. Route / to serve admin/index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(adminDir, 'index.html'));
});

// 3. Wildcard route for SPA client-side routing
app.get('*', (req, res, next) => {
  // If the request is for a file that doesn't exist, serve 404.html if present
  const requestedPath = path.join(adminDir, req.path);
  if (fs.existsSync(requestedPath) && fs.lstatSync(requestedPath).isFile()) {
    return res.sendFile(requestedPath);
  }
  // 4. Serve index.html for all other routes (SPA fallback)
  const indexPath = path.join(adminDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  // 5. Serve 404.html if it exists, otherwise plain 404
  const notFoundPath = path.join(adminDir, '404.html');
  if (fs.existsSync(notFoundPath)) {
    return res.status(404).sendFile(notFoundPath);
  }
  res.status(404).send('404 Not Found');
});

app.listen(PORT, () => {
  console.log(`🚀 CT5 Pride Admin server running on port ${PORT}`);
  console.log(`📁 Serving admin dashboard from: ${adminDir}`);
  console.log('🌐 Visit: https://admin.ct5pride.co.uk/');
}); 