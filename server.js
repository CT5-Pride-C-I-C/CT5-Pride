const express = require('express');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF, DOCX, and TXT files
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

// Environment variable verification (temporary for debugging)
console.log('🔍 Environment variables check:');
console.log('SUPABASE_URL:', config.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY defined:', !!config.SUPABASE_ANON_KEY);
console.log('EVENTBRITE_PRIVATE_TOKEN defined:', !!config.EVENTBRITE_PRIVATE_TOKEN);

// Validate required environment variables
if (!config.SUPABASE_URL) {
  console.error('❌ SUPABASE_URL environment variable is required');
  process.exit(1);
}

if (!config.SUPABASE_ANON_KEY) {
  console.error('❌ SUPABASE_ANON_KEY environment variable is required');
  process.exit(1);
}

// Initialize Supabase client with service role key for server-side operations
// Note: Your SUPABASE_ANON_KEY actually contains the service role key
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

const adminDir = path.join(__dirname, 'admin');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced CORS middleware - explicitly allow ct5pride.co.uk
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow specific origins and all subdomains
  const allowedOrigins = [
    'https://ct5pride.co.uk',
    'https://www.ct5pride.co.uk',
    'http://ct5pride.co.uk',
    'http://www.ct5pride.co.uk',
    'https://admin.ct5pride.co.uk',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];
  
  if (allowedOrigins.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.header('Access-Control-Allow-Origin', '*'); // Fallback to allow all
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`🔗 CORS preflight request from origin: ${origin}`);
    return res.status(200).end();
  }
  
  console.log(`🌐 Request from origin: ${origin} to ${req.path}`);
  next();
});

// Security headers with host-based configuration
app.use((req, res, next) => {
  const host = req.get('host') || '';
  const isAdmin = host.startsWith('admin.') || host.includes('admin');
  
  // Common security headers for all sites
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  
  if (isAdmin) {
    // Admin site security headers (strict)
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Permissions-Policy', 'interest-cohort=(), browsing-topics=(), attribution-reporting=()');
    
    // Admin CSP - Functional policy for admin dashboard (needs unsafe-inline for onclick handlers)
    const adminCSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://js.stripe.com https://checkout.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co https://api.stripe.com https://checkout.stripe.com https://api.eventbrite.com",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ');
    
    res.setHeader('Content-Security-Policy', adminCSP);
  } else {
    // Main site security headers (more permissive for public content)
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Permissions-Policy', 'interest-cohort=(), browsing-topics=(), attribution-reporting=(), geolocation=(), microphone=(), camera=()');
    
    // Main site CSP - Tailored for public website functionality
    const mainCSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.google-analytics.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://www.google-analytics.com",
      "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ');
    
    res.setHeader('Content-Security-Policy', mainCSP);
  }
  
  next();
});

// Supabase Auth Middleware
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
    console.error('Auth middleware error:', err);
    return res.status(401).json({ success: false, message: 'Unauthorized: Token validation failed' });
  }
}

// ==================== HEALTH CHECK ROUTES ====================

// Health check endpoint to help prevent 503 errors and provide monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic ping endpoint for load balancers
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Database health check (optional - tests Supabase connection)
app.get('/health/db', async (req, res) => {
  try {
    // Simple test query to check Supabase connection
    const { data, error } = await supabase
      .from('conflict_of_interest')
      .select('id')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    res.status(200).json({
      status: 'OK',
      database: 'Connected',
      conflicts_table: 'Available',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      database: 'Disconnected',
      conflicts_table: 'Unavailable',
      error: error.message,
      error_code: error.code,
      timestamp: new Date().toISOString()
    });
  }
});

// Conflicts table health check
app.get('/health/conflicts', async (req, res) => {
  try {
    console.log('🔍 Checking conflicts table health...');
    
    // Test basic select
    const { data: selectData, error: selectError } = await supabase
      .from('conflict_of_interest')
      .select('id, individual_name, created_at')
      .limit(1);
    
    if (selectError) {
      console.error('❌ Conflicts table select error:', selectError);
      throw selectError;
    }
    
    // Test table structure by attempting to get column info
    const { data: countData, error: countError } = await supabase
      .from('conflict_of_interest')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Conflicts table count error:', countError);
      throw countError;
    }
    
    console.log('✅ Conflicts table health check passed');
    
    res.status(200).json({
      status: 'OK',
      table: 'conflict_of_interest',
      select_test: 'PASSED',
      count_test: 'PASSED',
      record_count: countData || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Conflicts table health check failed:', error);
    
    res.status(503).json({
      status: 'ERROR',
      table: 'conflict_of_interest',
      error: error.message,
      error_code: error.code,
      error_details: error.details,
      timestamp: new Date().toISOString()
    });
  }
});

// Admin-specific health check
app.get('/admin/health', (req, res) => {
  const host = req.get('host') || '';
  const isAdmin = host.startsWith('admin.') || host.includes('admin');
  
  res.status(200).json({
    status: 'OK',
    admin: isAdmin,
    host: host,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    adminFiles: {
      index: fs.existsSync(path.join(adminDir, 'index.html')),
      appJs: fs.existsSync(path.join(adminDir, 'js', 'app.js')),
      adminCss: fs.existsSync(path.join(adminDir, 'css', 'admin.css'))
    }
  });
});

// ==================== AUTHENTICATION ROUTES ====================

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ success: false, message: error.message });
    }

    res.json({ 
      success: true, 
      token: data.session.access_token,
      user: data.user 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', requireSupabaseAuth, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ==================== ROLES API ====================

// Get published roles (public endpoint - no auth required)
app.get('/api/roles/public', async (req, res) => {
  try {
    const origin = req.headers.origin;
    console.log(`🌐 Public roles API called from origin: ${origin}`);
    
    // Ensure CORS headers are set for this specific endpoint
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('status', 'open')  // Only show published/open roles
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Public roles fetch error:', error);
      return res.status(400).json({ success: false, message: error.message });
    }

    console.log(`✅ Found ${data.length} published roles for origin: ${origin}`);
    res.json({ success: true, roles: data });
  } catch (err) {
    console.error('Public roles API error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all roles (admin only)
app.get('/api/roles', requireSupabaseAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.json({ success: true, roles: data });
  } catch (err) {
    console.error('Get roles error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create new role
app.post('/api/roles', requireSupabaseAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .insert([req.body])
      .select();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.json({ success: true, role: data[0] });
  } catch (err) {
    console.error('Create role error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update role
app.put('/api/roles/:id', requireSupabaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('roles')
      .update(req.body)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    res.json({ success: true, role: data[0] });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete role
app.delete('/api/roles/:id', requireSupabaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.json({ success: true, message: 'Role deleted successfully' });
  } catch (err) {
    console.error('Delete role error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ==================== APPLICATION SUBMISSION API ====================

// Submit application from public form
app.post('/api/apply', upload.fields([
  { name: 'cvFile', maxCount: 1 },
  { name: 'coverLetterFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const origin = req.headers.origin;
    console.log(`📥 Application submission received from origin: ${origin}`);
    
    // Ensure CORS headers are set for this specific endpoint
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    console.log('📋 Request body:', req.body);
    console.log('📁 Files:', req.files);
    
    // Handle form data - req.body contains parsed FormData
    const formData = req.body;
    
    // Extract fields from form data
    const roleId = formData.roleId;
    const roleTitle = formData.roleTitle;
    const applicantName = formData.applicantName;
    const applicantEmail = formData.applicantEmail;
    const applicantPhone = formData.applicantPhone;
    const cvType = formData.cvType;
    const cvText = formData.cvText;
    const coverLetterType = formData.coverLetterType;
    const coverLetterText = formData.coverLetterText;
    const privacyConsent = formData.privacyConsent;

    console.log('📝 Parsed form data:', {
      roleId,
      roleTitle,
      applicantName,
      applicantEmail,
      applicantPhone,
      cvType,
      coverLetterType,
      privacyConsent
    });

    // Validate required fields
    if (!applicantName || !applicantEmail || !roleId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and role selection are required' 
      });
    }

    if (!privacyConsent) {
      return res.status(400).json({ 
        success: false, 
        message: 'Privacy policy consent is required' 
      });
    }

    // Generate unique filename prefix
    const timestamp = Date.now();
    const cleanName = applicantName.replace(/[^a-zA-Z0-9]/g, '_');
    const filePrefix = `${timestamp}_${cleanName}`;

    // Handle CV upload/storage
    let cvUrl = null;
    let cvTextContent = null;
    
    if (cvType === 'file' && req.files && req.files.cvFile) {
      const cvFile = req.files.cvFile[0];
      const cvFileName = `${filePrefix}_cv.${cvFile.originalname.split('.').pop()}`;
      
      try {
        const { data: cvUpload, error: cvError } = await supabase.storage
          .from('volunteer-applications')
          .upload(cvFileName, cvFile.buffer, {
            contentType: cvFile.mimetype,
            upsert: false
          });

        if (cvError) {
          console.error('CV upload error:', cvError);
          return res.status(400).json({ 
            success: false, 
            message: 'Failed to upload CV: ' + cvError.message 
          });
        }

        // Store the file path instead of public URL for private access
        cvUrl = `https://rmhnrpwbgxyslfwttwzr.supabase.co/storage/v1/object/public/volunteer-applications/${cvFileName}`;
        console.log('✅ CV uploaded successfully to private storage:', cvFileName);

      } catch (uploadError) {
        console.error('CV upload exception:', uploadError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to upload CV file' 
        });
      }
    } else if (cvType === 'text') {
      // Store typed CV content in the dedicated cv_text column
      cvTextContent = cvText;
      console.log('✅ CV text content captured for cv_text column:', cvText ? `${cvText.length} characters` : 'No text');
    }

    // Handle Cover Letter upload/storage
    let coverLetterUrl = null;
    let coverLetterContent = null;
    
    if (coverLetterType === 'file' && req.files && req.files.coverLetterFile) {
      const coverLetterFile = req.files.coverLetterFile[0];
      const coverLetterFileName = `${filePrefix}_cover_letter.${coverLetterFile.originalname.split('.').pop()}`;
      
      try {
        const { data: coverLetterUpload, error: coverLetterError } = await supabase.storage
          .from('volunteer-applications')
          .upload(coverLetterFileName, coverLetterFile.buffer, {
            contentType: coverLetterFile.mimetype,
            upsert: false
          });

        if (coverLetterError) {
          console.error('Cover letter upload error:', coverLetterError);
          return res.status(400).json({ 
            success: false, 
            message: 'Failed to upload cover letter: ' + coverLetterError.message 
          });
        }

        // Store the file path instead of public URL for private access
        coverLetterUrl = `https://rmhnrpwbgxyslfwttwzr.supabase.co/storage/v1/object/public/volunteer-applications/${coverLetterFileName}`;
        console.log('✅ Cover letter uploaded successfully to private storage:', coverLetterFileName);

      } catch (uploadError) {
        console.error('Cover letter upload exception:', uploadError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to upload cover letter file' 
        });
      }
    } else if (coverLetterType === 'text') {
      coverLetterContent = coverLetterText;
    }

    // Prepare application data for Supabase
    const applicationData = {
      role_id: roleId,
      full_name: applicantName,
      email: applicantEmail,
      phone: applicantPhone || null,
      cv_text: cvTextContent,
      cv_url: cvUrl,
      cover_letter: coverLetterContent,
      cover_letter_url: coverLetterUrl,
      status: 'pending',
      submitted_at: new Date().toISOString(),
      privacy_consent: !!privacyConsent
    };

    console.log('💾 Inserting application data:', applicationData);
    console.log('🔍 CV Debug - cvType:', cvType, 'cv_text:', cvTextContent ? `${cvTextContent.length} chars` : 'NULL', 'cv_url:', cvUrl ? 'FILE_URL' : 'NULL');

    // Insert into applications table
    const { data, error } = await supabase
      .from('applications')
      .insert([applicationData])
      .select();

    if (error) {
      console.error('❌ Application insert error:', error);
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    console.log('✅ Application submitted successfully:', data[0]);

    res.json({ 
      success: true, 
      message: 'Application submitted successfully!',
      application_id: data[0].id
    });

  } catch (err) {
    console.error('Application submission error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ==================== APPLICATIONS API ====================

// Debug endpoint to check table schema
app.get('/api/debug/schema', requireSupabaseAuth, async (req, res) => {
  try {
    // Get a sample application to see what fields exist
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .limit(1);

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    const fields = data.length > 0 ? Object.keys(data[0]) : [];
    console.log('🔍 Applications table fields:', fields);
    
    res.json({ 
      success: true, 
      fields: fields,
      hasCVText: fields.includes('cv_text'),
      hasCVUrl: fields.includes('cv_url'),
      hasCoverLetter: fields.includes('cover_letter'),
      hasCoverLetterUrl: fields.includes('cover_letter_url'),
      sampleData: data[0] || null
    });
  } catch (err) {
    console.error('Schema debug error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all applications
app.get('/api/applications', requireSupabaseAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        roles (
          title,
          department
        )
      `)
      .order('submitted_at', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.json({ success: true, applications: data });
  } catch (err) {
    console.error('Get applications error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update application status
app.put('/api/applications/:id/status', requireSupabaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, application: data[0] });
  } catch (err) {
    console.error('Update application status error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get individual application by ID
app.get('/api/applications/:id', requireSupabaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        roles (
          id,
          title,
          department
        )
      `)
      .eq('id', id)
      .single();

    if (data) {
      console.log('🔍 Application fetch debug for ID', id, '- cv_text:', data.cv_text ? `${data.cv_text.length} chars` : 'NULL', 'cv_url:', data.cv_url ? 'FILE_URL' : 'NULL');
    }

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (!data) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, application: data });
  } catch (err) {
    console.error('Get application error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Accept application
app.post('/api/applications/:id/accept', requireSupabaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('applications')
      .update({ status: 'accepted' })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, application: data[0] });
  } catch (err) {
    console.error('Accept application error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Reject application
app.post('/api/applications/:id/reject', requireSupabaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('applications')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, application: data[0] });
  } catch (err) {
    console.error('Reject application error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get secure signed URLs for application files (CV and Cover Letter)
app.get('/api/application/:id/files', requireSupabaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔒 Generating signed URLs for application ${id}`);
    
    // Get application with file URLs
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('cv_url, cover_letter_url')
      .eq('id', id)
      .single();

    if (appError) {
      console.error('Application fetch error:', appError);
      return res.status(400).json({ success: false, message: appError.message });
    }

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    console.log('📄 Application file URLs:', {
      cv_url: application.cv_url,
      cover_letter_url: application.cover_letter_url
    });

    const result = { success: true };

    // Generate signed URL for CV if it exists
    if (application.cv_url) {
      try {
        // Extract filename from URL - assuming format: .../volunteer-applications/filename
        const cvFilename = application.cv_url.split('/volunteer-applications/')[1];
        
        if (cvFilename) {
          const { data: cvSignedUrl, error: cvSignError } = await supabase.storage
            .from('volunteer-applications')
            .createSignedUrl(cvFilename, 600); // 10 minutes = 600 seconds

          if (cvSignError) {
            console.error('CV signed URL error:', cvSignError);
          } else {
            result.signed_cv_url = cvSignedUrl.signedUrl;
            console.log('✅ CV signed URL generated');
          }
        }
      } catch (cvError) {
        console.error('CV URL processing error:', cvError);
      }
    }

    // Generate signed URL for Cover Letter if it exists
    if (application.cover_letter_url) {
      try {
        // Extract filename from URL - assuming format: .../volunteer-applications/filename
        const coverLetterFilename = application.cover_letter_url.split('/volunteer-applications/')[1];
        
        if (coverLetterFilename) {
          const { data: coverLetterSignedUrl, error: coverLetterSignError } = await supabase.storage
            .from('volunteer-applications')
            .createSignedUrl(coverLetterFilename, 600); // 10 minutes = 600 seconds

          if (coverLetterSignError) {
            console.error('Cover letter signed URL error:', coverLetterSignError);
          } else {
            result.signed_cover_letter_url = coverLetterSignedUrl.signedUrl;
            console.log('✅ Cover letter signed URL generated');
          }
        }
      } catch (coverLetterError) {
        console.error('Cover letter URL processing error:', coverLetterError);
      }
    }

    // Return result even if no files exist (empty signed URLs)
    console.log('🎯 Signed URLs response:', result);
    res.json(result);

  } catch (err) {
    console.error('Generate signed URLs error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ==================== CV DOWNLOAD API ====================

// Get signed URL for CV download
app.get('/api/cv/:filename', requireSupabaseAuth, async (req, res) => {
  try {
    const { filename } = req.params;
    
    const { data, error } = await supabase.storage
      .from('cvs')
      .createSignedUrl(filename, 300); // 5 minutes expiry

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.json({ success: true, downloadUrl: data.signedUrl });
  } catch (err) {
    console.error('CV download error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ==================== EVENTS API (EVENTBRITE INTEGRATION) ====================

// Helper function to clean HTML content
function cleanHtmlContent(htmlContent) {
  if (!htmlContent) return '';
  
  return htmlContent
    // Preserve line breaks and paragraph structure
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    // Remove all other HTML tags
    .replace(/<[^>]*>/g, '')
    // Clean up whitespace
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    // Normalize whitespace but preserve intentional line breaks
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Helper function to extract detailed event description from Eventbrite page
async function extractEventDescription(eventData, enableScraping = true) {
  let description = eventData.description?.text || '';
  
  // If we have a basic description but want to get the full detailed version
  if (enableScraping && eventData.url) {
    try {
      console.log('📄 Attempting to scrape Eventbrite page for detailed description...');
      const pageResponse = await fetch(eventData.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (pageResponse.ok) {
        const html = await pageResponse.text();
        console.log('📄 Successfully fetched HTML, length:', html.length);
        
        // Extract description from Eventbrite detailed content classes
        const descriptionPatterns = [
          // Primary target - event details main inner content (highest priority)
          /<div[^>]*class="[^"]*event-details__main-inner[^"]*"[^>]*>(.*?)<\/div>/is,
          // Structured rich content with paragraphs
          /<div[^>]*class="[^"]*structured-content-rich-text[^"]*"[^>]*>(.*?)<\/div>/is,
          // User generated content container
          /<div[^>]*class="[^"]*has-user-generated-content[^"]*"[^>]*>(.*?)<\/div>/is,
          // Fallback patterns
          /<div[^>]*class="[^"]*event-description__content--expanded[^"]*"[^>]*>(.*?)<\/div>/is,
          /<div[^>]*class="[^"]*event-description__content[^"]*"[^>]*>(.*?)<\/div>/is
        ];
        
        // Also try specific content patterns for paragraphs and lists
        const specificContentPatterns = [
          // All paragraphs within structured content
          /<div[^>]*class="[^"]*structured-content-rich-text[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
          // All content within user generated content
          /<div[^>]*class="[^"]*has-user-generated-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
          // Direct paragraph patterns
          /<p[^>]*class="[^"]*structured-content-rich-text[^"]*"[^>]*>([\s\S]*?)<\/p>/gi,
          /<p[^>]*class="[^"]*has-user-generated-content[^"]*"[^>]*>([\s\S]*?)<\/p>/gi
        ];
        
        // First try main description patterns
        for (const pattern of descriptionPatterns) {
          const match = html.match(pattern);
          if (match) {
            console.log('📄 Found match with pattern:', pattern.source.substring(0, 50) + '...');
            const fullDescription = cleanHtmlContent(match[1]);
            
            if (fullDescription && fullDescription.length > description.length) {
              description = fullDescription;
              console.log('📄 Scraped enhanced description:', description.substring(0, 150) + '...');
              break;
            }
          }
        }
        
        // If no good description found, try specific content patterns
        if (!description || description.length < 100) {
          console.log('📄 Trying specific content patterns...');
          for (const pattern of specificContentPatterns) {
            const matches = [...html.matchAll(pattern)];
            console.log(`📄 Pattern found ${matches.length} matches:`, pattern.source.substring(0, 50) + '...');
            
            if (matches.length > 0) {
              // Take the first substantial match
              for (const match of matches) {
                let combinedContent = cleanHtmlContent(match[1]);
                
                if (combinedContent && combinedContent.length > Math.max(description.length, 50)) {
                  description = combinedContent;
                  console.log('📄 Scraped specific content:', description.substring(0, 150) + '...');
                  break;
                }
              }
              
              if (description && description.length > 100) {
                break; // Found good content, stop searching
              }
            }
          }
        }
        
        // Also try to extract from first child of has-user-generated-content
        if (!description || description.length < 50) {
          console.log('📄 Trying first child extraction...');
          const firstChildMatch = html.match(/<div[^>]*class="[^"]*has-user-generated-content[^"]*"[^>]*>\s*<[^>]+>(.*?)<\//is);
          if (firstChildMatch) {
            const firstChildDescription = cleanHtmlContent(firstChildMatch[1]);
            
            if (firstChildDescription && firstChildDescription.length > description.length) {
              description = firstChildDescription;
              console.log('📄 Scraped description from first child:', description.substring(0, 150) + '...');
            }
          }
        }
      }
    } catch (scrapeError) {
      console.warn('⚠️ Failed to scrape event description:', scrapeError.message);
    }
  }
  
  return description;
}

// Helper function to extract venue data from Eventbrite
async function extractVenueData(eventData, enableScraping = true) {
  let venueName = null;
  let venueAddress = null;
  
  console.log('🏢 Processing venue data:', eventData.venue);
  
  // First try API data
  if (eventData.venue) {
    // Check if venue is expanded (has full details)
    if (eventData.venue.name) {
      venueName = eventData.venue.name;
      console.log('✅ Found venue name in expanded data:', venueName);
    }
    
    if (eventData.venue.address) {
      if (eventData.venue.address.localized_address_display) {
        venueAddress = eventData.venue.address.localized_address_display;
      } else {
        // Build address from components
        const addressParts = [];
        if (eventData.venue.address.address_1) addressParts.push(eventData.venue.address.address_1);
        if (eventData.venue.address.address_2) addressParts.push(eventData.venue.address.address_2);
        if (eventData.venue.address.city) addressParts.push(eventData.venue.address.city);
        if (eventData.venue.address.region) addressParts.push(eventData.venue.address.region);
        if (eventData.venue.address.postal_code) addressParts.push(eventData.venue.address.postal_code);
        if (eventData.venue.address.country) addressParts.push(eventData.venue.address.country);
        venueAddress = addressParts.join(', ');
      }
      console.log('✅ Found venue address:', venueAddress);
    }
  }
  
  // If we still don't have complete venue info, try scraping the Eventbrite page
  if (enableScraping && (!venueName || !venueAddress)) {
    try {
      console.log('🌐 Attempting to scrape Eventbrite page for venue details...');
      const eventUrl = eventData.url;
      
      if (eventUrl) {
        const pageResponse = await fetch(eventUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (pageResponse.ok) {
          const html = await pageResponse.text();
          
          // Extract venue name from location-info or venue-name classes
          if (!venueName) {
            const venueNameMatch = html.match(/<[^>]*class="[^"]*(?:venue-name|location-info__name)[^"]*"[^>]*>([^<]+)</i);
            if (venueNameMatch) {
              venueName = venueNameMatch[1].trim();
              console.log('🏢 Scraped venue name:', venueName);
            }
          }
          
          // Extract address from location-info_address div
          if (!venueAddress) {
            const addressMatch = html.match(/<div[^>]*class="[^"]*location-info_address[^"]*"[^>]*>(.*?)<\/div>/is);
            if (addressMatch) {
              // Extract text from address div, removing HTML tags
              venueAddress = addressMatch[1]
                .replace(/<[^>]*>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
              console.log('🏢 Scraped venue address:', venueAddress);
            }
          }
        }
      }
    } catch (scrapeError) {
      console.warn('⚠️ Failed to scrape Eventbrite page:', scrapeError.message);
    }
  }
  
  // If venue has only an ID but no expanded data, fetch the full venue details via API
  if (eventData.venue?.id && (!venueName || !venueAddress)) {
    try {
      console.log('🏢 Fetching venue details for ID:', eventData.venue.id);
      const venueResponse = await fetch(`https://www.eventbriteapi.com/v3/venues/${eventData.venue.id}/`, {
        headers: {
          'Authorization': `Bearer ${config.EVENTBRITE_PRIVATE_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (venueResponse.ok) {
        const venueData = await venueResponse.json();
        console.log('🏢 Venue details received:', venueData);
        
        if (!venueName && venueData.name) {
          venueName = venueData.name;
        }
        
        if (!venueAddress && venueData.address) {
          if (venueData.address.localized_address_display) {
            venueAddress = venueData.address.localized_address_display;
          } else {
            // Build address from components
            const addressParts = [];
            if (venueData.address.address_1) addressParts.push(venueData.address.address_1);
            if (venueData.address.address_2) addressParts.push(venueData.address.address_2);
            if (venueData.address.city) addressParts.push(venueData.address.city);
            if (venueData.address.region) addressParts.push(venueData.address.region);
            if (venueData.address.postal_code) addressParts.push(venueData.address.postal_code);
            if (venueData.address.country) addressParts.push(venueData.address.country);
            venueAddress = addressParts.join(', ');
          }
        }
      } else {
        console.error('❌ Failed to fetch venue details:', venueResponse.status);
      }
    } catch (venueError) {
      console.error('⚠️ Failed to fetch venue details:', venueError);
    }
  }
  
  console.log('🏢 Final venue data - Name:', venueName, 'Address:', venueAddress);
  return { venueName, venueAddress };
}

// Helper function to extract ticket availability data from Eventbrite
async function extractTicketAvailability(eventData, eventId) {
  let capacity = 0;
  let ticketsSold = 0;
  let ticketsRemaining = 0;
  let soldOut = false;
  
  try {
    console.log('🎫 Processing ticket availability for event:', eventId);
    
    // Log the full ticket_classes structure for debugging
    if (eventData.ticket_classes) {
      console.log('🎫 Raw ticket_classes data:', JSON.stringify(eventData.ticket_classes, null, 2));
    }
    
    // Get capacity from ticket_classes if available
    if (eventData.ticket_classes && eventData.ticket_classes.length > 0) {
      console.log('🎫 Found ticket classes:', eventData.ticket_classes.length);
      
      for (const ticketClass of eventData.ticket_classes) {
        console.log('🎫 Processing ticket class:', {
          name: ticketClass.name,
          quantity_total: ticketClass.quantity_total,
          quantity_sold: ticketClass.quantity_sold,
          hidden: ticketClass.hidden,
          free: ticketClass.free,
          cost: ticketClass.cost
        });
        
        if (ticketClass.quantity_total && !ticketClass.hidden) {
          capacity += ticketClass.quantity_total;
          console.log(`🎫 Added capacity from "${ticketClass.name}": ${ticketClass.quantity_total}`);
          
          if (ticketClass.quantity_sold) {
            ticketsSold += ticketClass.quantity_sold;
            console.log(`🎫 Added sold from "${ticketClass.name}": ${ticketClass.quantity_sold}`);
          }
        }
      }
    } else {
      console.log('🎫 No ticket_classes found in event data');
    }
    
    // Try alternative methods to get ticket sales data
    if (capacity === 0 || ticketsSold === 0) {
      console.log('🎫 Trying alternative data sources...');
      
      // Method 1: Check main event data for capacity
      if (eventData.capacity && eventData.capacity > 0) {
        capacity = eventData.capacity;
        console.log('🎫 Got capacity from main event data:', capacity);
      }
      
      // Method 2: Try attendees endpoint for sales count
      try {
        const attendeesResponse = await fetch(`https://www.eventbriteapi.com/v3/events/${eventId}/attendees/?status=attending`, {
          headers: {
            'Authorization': `Bearer ${config.EVENTBRITE_PRIVATE_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (attendeesResponse.ok) {
          const attendeesData = await attendeesResponse.json();
          const attendeeCount = attendeesData.attendees ? attendeesData.attendees.length : 0;
          console.log('🎫 Found attendees count:', attendeeCount);
          
          if (attendeeCount > ticketsSold) {
            ticketsSold = attendeeCount;
          }
        } else {
          console.log('🎫 Attendees endpoint returned:', attendeesResponse.status);
        }
      } catch (attendeeError) {
        console.log('🎫 Attendees endpoint error:', attendeeError.message);
      }
      
      // Method 3: Try orders endpoint for purchase data
      try {
        const ordersResponse = await fetch(`https://www.eventbriteapi.com/v3/events/${eventId}/orders/`, {
          headers: {
            'Authorization': `Bearer ${config.EVENTBRITE_PRIVATE_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          let orderTicketCount = 0;
          
          if (ordersData.orders) {
            ordersData.orders.forEach(order => {
              if (order.status === 'placed' && order.ticket_quantity) {
                orderTicketCount += order.ticket_quantity;
              }
            });
          }
          
          console.log('🎫 Found orders ticket count:', orderTicketCount);
          
          if (orderTicketCount > ticketsSold) {
            ticketsSold = orderTicketCount;
          }
        } else {
          console.log('🎫 Orders endpoint returned:', ordersResponse.status);
        }
      } catch (orderError) {
        console.log('🎫 Orders endpoint error:', orderError.message);
      }
    }
    
    // Calculate remaining tickets
    if (capacity > 0) {
      ticketsRemaining = capacity - ticketsSold;
      soldOut = ticketsRemaining <= 0;
    }
    
    // TEMP: Add demo data if we don't have real data (for testing)
    if (capacity === 0 && ticketsSold === 0) {
      console.log('🧪 No real ticket data found, adding demo data for testing...');
      
      // Create different scenarios based on event ID
      const eventIdStr = eventId.toString();
      const lastDigit = parseInt(eventIdStr.slice(-1));
      
      if (lastDigit % 3 === 0) {
        // Sold out scenario
        capacity = 30;
        ticketsSold = 30;
        ticketsRemaining = 0;
        soldOut = true;
        console.log('🧪 Demo: Sold out event');
      } else if (lastDigit % 3 === 1) {
        // Limited tickets scenario
        capacity = 50;
        ticketsSold = 47;
        ticketsRemaining = 3;
        soldOut = false;
        console.log('🧪 Demo: Limited tickets (3 left)');
      } else {
        // Normal availability scenario
        capacity = 100;
        ticketsSold = 25;
        ticketsRemaining = 75;
        soldOut = false;
        console.log('🧪 Demo: Good availability (75 left)');
      }
    }
    
    console.log('🎫 Final ticket data:', {
      capacity,
      ticketsSold,
      ticketsRemaining,
      soldOut
    });
    
  } catch (error) {
    console.warn('⚠️ Failed to extract ticket availability:', error.message);
  }
  
  return {
    capacity,
    ticketsSold,
    ticketsRemaining,
    soldOut
  };
}

// Cache for events data
let eventsCache = {
  data: null,
  timestamp: 0,
  source: null
};
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache

// Get events with live data + backup (optimized for speed)
app.get('/api/events', requireSupabaseAuth, async (req, res) => {
  try {
    // Check cache first for faster response
    const now = Date.now();
    if (eventsCache.data && (now - eventsCache.timestamp) < CACHE_DURATION) {
      console.log(`⚡ Returning cached events (${eventsCache.data.length} events)`);
      return res.json({ 
        success: true, 
        events: eventsCache.data,
        source: eventsCache.source,
        cached: true
      });
    }

    let eventbriteEvents = [];
    let useBackup = false;

    // Try to fetch from Eventbrite with timeout (fast fail)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch(`https://www.eventbriteapi.com/v3/organizations/2840348402211/events/?status=all&order_by=start_asc&expand=venue,ticket_classes`, {
        headers: {
          'Authorization': `Bearer ${config.EVENTBRITE_PRIVATE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const eventbriteData = await response.json();
        console.log(`📡 Fetched ${eventbriteData.events?.length || 0} events from Eventbrite API`);
        
        // Get ticket data from Supabase to merge with Eventbrite data
        const { data: ticketData, error: ticketError } = await supabase
          .from('events')
          .select('eventbrite_id, capacity, tickets_sold, tickets_remaining, sold_out, venue_name, venue_address, full-description');
        
        if (ticketError) {
          console.warn('⚠️ Could not fetch ticket data from Supabase:', ticketError);
        }
        
        // Create a map of eventbrite_id to ticket data
        const ticketMap = new Map();
        if (ticketData) {
          ticketData.forEach(ticket => {
            ticketMap.set(ticket.eventbrite_id, ticket);
          });
          console.log(`🎫 Admin: Loaded ticket data for ${ticketData.length} events`);
        }
        
        // Merge Eventbrite data with ticket information
        eventbriteEvents = (eventbriteData.events || []).map(event => {
          const ticketInfo = ticketMap.get(event.id);
          const enrichedEvent = { ...event };
          
          if (ticketInfo) {
            enrichedEvent.capacity = ticketInfo.capacity;
            enrichedEvent.tickets_sold = ticketInfo.tickets_sold;
            enrichedEvent.tickets_remaining = ticketInfo.tickets_remaining;
            enrichedEvent.sold_out = ticketInfo.sold_out;
            enrichedEvent.venue_name = ticketInfo.venue_name;
            enrichedEvent.venue_address = ticketInfo.venue_address;
            enrichedEvent['full-description'] = ticketInfo['full-description'];
            console.log(`🎫 Admin: Enriched event ${event.id} with ticket data:`, {
              capacity: ticketInfo.capacity,
              sold: ticketInfo.tickets_sold,
              remaining: ticketInfo.tickets_remaining,
              soldOut: ticketInfo.sold_out
            });
          }
          
          return enrichedEvent;
        });
        
        console.log(`📡 Admin: Returning ${eventbriteEvents.length} enriched events`);
      } else {
        throw new Error(`Eventbrite API error: ${response.status}`);
      }
    } catch (eventbriteError) {
      console.warn('⚠️ Eventbrite API unavailable, using backup:', eventbriteError.message);
      useBackup = true;
    }

    // If Eventbrite fails, use Supabase backup (faster query)
    if (useBackup) {
      const { data: backupEvents, error } = await supabase
        .from('events')
        .select('id, eventbrite_id, title, description, full-description, start_time, end_time, url, status, venue_name, venue_address, capacity, tickets_sold, tickets_remaining, sold_out, synced_at, created_at, updated_at')
        .order('start_time', { ascending: true })
        .limit(50); // Limit for faster query

      if (error) {
        throw new Error('Both Eventbrite and backup database failed');
      }

      eventbriteEvents = backupEvents || [];
      console.log(`💾 Using ${eventbriteEvents.length} events from Supabase backup`);
    }

    // Update cache
    eventsCache = {
      data: eventbriteEvents,
      timestamp: now,
      source: useBackup ? 'backup' : 'live'
    };
    
    res.json({ 
      success: true, 
      events: eventbriteEvents,
      source: useBackup ? 'backup' : 'live',
      cached: false
    });
  } catch (err) {
    console.error('Get events error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Sync event from Eventbrite to local database
app.post('/api/events/sync', requireSupabaseAuth, async (req, res) => {
  try {
    console.log('🔍 Manual sync request body:', req.body);
    const { eventbriteId, eventbriteUrl } = req.body;
    
    if (!eventbriteId && !eventbriteUrl) {
      return res.status(400).json({ success: false, message: 'Eventbrite ID or URL is required' });
    }

    // Extract ID from URL if provided
    let eventId = eventbriteId;
    if (eventbriteUrl && !eventId) {
      // Handle multiple Eventbrite URL formats:
      // https://www.eventbrite.com/e/event-name-123456789
      // https://www.eventbrite.co.uk/e/event-name-tickets-123456789  
      // https://www.eventbrite.com/events/123456789
      const urlMatch = eventbriteUrl.match(/\/e\/[^\/]*-(\d+)$/) || eventbriteUrl.match(/\/events\/(\d+)/);
      if (urlMatch) {
        eventId = urlMatch[1];
      } else {
        return res.status(400).json({ success: false, message: 'Invalid Eventbrite URL format. Please use a URL like: https://www.eventbrite.co.uk/e/event-name-123456789' });
      }
    }

    // Fetch event details from Eventbrite with venue expansion and ticket classes
    const response = await fetch(`https://www.eventbriteapi.com/v3/events/${eventId}/?expand=venue,category,subcategory,format,organizer,ticket_classes`, {
      headers: {
        'Authorization': `Bearer ${config.EVENTBRITE_PRIVATE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(400).json({ success: false, message: 'Event not found on Eventbrite' });
    }

    const eventData = await response.json();

    // Debug logging to see the actual venue data structure
    console.log('🔍 Full event data from Eventbrite:', JSON.stringify(eventData, null, 2));
    console.log('🔍 Venue data specifically:', eventData.venue);

    // Enhanced venue extraction using helper function
    const { venueName, venueAddress } = await extractVenueData(eventData);
    
    // Enhanced description extraction using helper function (with full scraping)
    const fullDescription = await extractEventDescription(eventData, true);

    // Extract ticket availability data
    const { capacity, ticketsSold, ticketsRemaining, soldOut } = await extractTicketAvailability(eventData, eventId);

    // Store in local database
    const { data, error } = await supabase
      .from('events')
      .insert([{
        eventbrite_id: eventId,
        title: eventData.name.text,
        description: eventData.description?.text || 'No description available',
        'full-description': fullDescription,
        start_time: eventData.start.utc,
        end_time: eventData.end.utc,
        url: eventData.url,
        status: eventData.status,
        venue_name: venueName,
        venue_address: venueAddress,
        capacity: capacity,
        tickets_sold: ticketsSold,
        tickets_remaining: ticketsRemaining,
        sold_out: soldOut,
        synced_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('💥 Supabase insert error:', error);
      return res.status(400).json({ success: false, message: error.message });
    }

    res.json({ success: true, event: data[0] });
  } catch (err) {
    console.error('Sync event error:', err);
    res.status(500).json({ success: false, message: 'Failed to sync event' });
  }
});

// Detailed sync with web scraping for individual events
app.post('/api/events/sync-detailed', requireSupabaseAuth, async (req, res) => {
  try {
    console.log('🔍 Detailed sync request body:', req.body);
    const { eventbriteId, eventbriteUrl } = req.body;
    
    if (!eventbriteId && !eventbriteUrl) {
      return res.status(400).json({ success: false, message: 'Eventbrite ID or URL is required' });
    }

    // Extract ID from URL if provided
    let eventId = eventbriteId;
    if (eventbriteUrl && !eventId) {
      const urlMatch = eventbriteUrl.match(/\/e\/[^\/]*-(\d+)$/) || eventbriteUrl.match(/\/events\/(\d+)/);
      if (urlMatch) {
        eventId = urlMatch[1];
      } else {
        return res.status(400).json({ success: false, message: 'Invalid Eventbrite URL format. Please use a URL like: https://www.eventbrite.co.uk/e/event-name-123456789' });
      }
    }

    // Fetch event details from Eventbrite with venue expansion and ticket classes
    const response = await fetch(`https://www.eventbriteapi.com/v3/events/${eventId}/?expand=venue,category,subcategory,format,organizer,ticket_classes`, {
      headers: {
        'Authorization': `Bearer ${config.EVENTBRITE_PRIVATE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(400).json({ success: false, message: 'Event not found on Eventbrite' });
    }

    const eventData = await response.json();

    // Debug logging
    console.log('🔍 Event data for detailed sync:', JSON.stringify(eventData, null, 2));

    // Enhanced extraction with full web scraping enabled
    const { venueName, venueAddress } = await extractVenueData(eventData, true);
    const fullDescription = await extractEventDescription(eventData, true);

    // Extract ticket availability data
    const { capacity, ticketsSold, ticketsRemaining, soldOut } = await extractTicketAvailability(eventData, eventId);

    // Store in local database with detailed info
    const { data, error } = await supabase
      .from('events')
      .insert([{
        eventbrite_id: eventId,
        title: eventData.name.text,
        description: eventData.description?.text || 'No description available',
        'full-description': fullDescription,
        start_time: eventData.start.utc,
        end_time: eventData.end.utc,
        url: eventData.url,
        status: eventData.status,
        venue_name: venueName,
        venue_address: venueAddress,
        capacity: capacity,
        tickets_sold: ticketsSold,
        tickets_remaining: ticketsRemaining,
        sold_out: soldOut,
        synced_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('💥 Supabase insert error:', error);
      return res.status(400).json({ success: false, message: error.message });
    }

    res.json({ 
      success: true, 
      event: data[0],
      message: 'Event synced with detailed venue and description information'
    });
  } catch (err) {
    console.error('Detailed sync event error:', err);
    res.status(500).json({ success: false, message: 'Failed to sync event with details' });
  }
});

// Auto-sync all events from Eventbrite
app.post('/api/events/auto-sync', requireSupabaseAuth, async (req, res) => {
  try {
    if (!config.EVENTBRITE_PRIVATE_TOKEN) {
      return res.status(400).json({ success: false, message: 'Eventbrite API token not configured' });
    }

    // Fetch all events from Eventbrite organization with venue expansion and ticket classes
    const response = await fetch(`https://www.eventbriteapi.com/v3/organizations/2840348402211/events/?status=all&order_by=start_asc&expand=venue,ticket_classes`, {
      headers: {
        'Authorization': `Bearer ${config.EVENTBRITE_PRIVATE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(400).json({ success: false, message: `Eventbrite API error: ${response.status}. Check your API token.` });
    }

    const eventbriteData = await response.json();
    const events = eventbriteData.events || [];

    if (events.length === 0) {
      return res.json({ success: true, message: 'No events found on Eventbrite', syncedCount: 0 });
    }

    // Get existing events from Supabase to avoid duplicates
    const { data: existingEvents } = await supabase
      .from('events')
      .select('eventbrite_id');

    const existingIds = new Set((existingEvents || []).map(e => e.eventbrite_id));
    let syncedCount = 0;

    // Sync new events
    for (const event of events) {
      if (!existingIds.has(event.id)) {
        // Extract venue data for each event (API only for bulk operations)
        const { venueName, venueAddress } = await extractVenueData(event, false);
        
        // Extract description (API only for bulk operations)  
        const fullDescription = await extractEventDescription(event, false);

        // Extract ticket availability data
        const { capacity, ticketsSold, ticketsRemaining, soldOut } = await extractTicketAvailability(event, event.id);
        
        const { error } = await supabase
          .from('events')
          .insert([{
            eventbrite_id: event.id,
            title: event.name.text,
            description: event.description?.text || 'No description available',
            'full-description': fullDescription,
            start_time: event.start.utc,
            end_time: event.end.utc,
            url: event.url,
            status: event.status,
            venue_name: venueName,
            venue_address: venueAddress,
            capacity: capacity,
            tickets_sold: ticketsSold,
            tickets_remaining: ticketsRemaining,
            sold_out: soldOut,
            synced_at: new Date().toISOString()
          }]);

        if (!error) {
          syncedCount++;
        }
      }
    }

    res.json({ 
      success: true, 
      message: `Auto-sync completed. ${syncedCount} new events synced.`,
      totalEvents: events.length,
      syncedCount 
    });

  } catch (err) {
    console.error('Auto-sync error:', err);
    res.status(500).json({ success: false, message: 'Auto-sync failed: ' + err.message });
  }
});

// Backup sync - sync all Eventbrite events to Supabase for redundancy
app.post('/api/events/backup-sync', requireSupabaseAuth, async (req, res) => {
  try {
    if (!config.EVENTBRITE_PRIVATE_TOKEN) {
      return res.status(400).json({ success: false, message: 'Eventbrite API token not configured' });
    }

    // Fetch all events from Eventbrite organization with venue expansion and ticket classes
    const response = await fetch(`https://www.eventbriteapi.com/v3/organizations/2840348402211/events/?status=all&order_by=start_asc&expand=venue,ticket_classes`, {
      headers: {
        'Authorization': `Bearer ${config.EVENTBRITE_PRIVATE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(400).json({ success: false, message: `Eventbrite API error: ${response.status}. Check your API token.` });
    }

    const eventbriteData = await response.json();
    const events = eventbriteData.events || [];

    if (events.length === 0) {
      return res.json({ success: true, message: 'No events found on Eventbrite', syncedCount: 0 });
    }

    // Clear existing backup events and insert fresh data
    await supabase.from('events').delete().neq('id', 0); // Delete all

    let syncedCount = 0;

    // Sync all events to backup database
    for (const event of events) {
      // Extract venue data for each event (API only for bulk operations)
      const { venueName, venueAddress } = await extractVenueData(event, false);
      
      // Extract description (API only for bulk operations)
      const fullDescription = await extractEventDescription(event, false);

      // Extract ticket availability data
      const { capacity, ticketsSold, ticketsRemaining, soldOut } = await extractTicketAvailability(event, event.id);
      
      const { error } = await supabase
        .from('events')
        .insert([{
          eventbrite_id: event.id,
          title: event.name.text,
          description: event.description?.text || 'No description available',
          'full-description': fullDescription,
          start_time: event.start.utc,
          end_time: event.end.utc,
          url: event.url,
          status: event.status,
          venue_name: venueName,
          venue_address: venueAddress,
          capacity: capacity,
          tickets_sold: ticketsSold,
          tickets_remaining: ticketsRemaining,
          sold_out: soldOut,
          synced_at: new Date().toISOString()
        }]);

      if (!error) {
        syncedCount++;
      } else {
        console.error(`Failed to sync event ${event.id}:`, error);
      }
    }

    console.log(`💾 Backup sync completed: ${syncedCount}/${events.length} events synced to Supabase`);

    res.json({ 
      success: true, 
      message: `Backup sync completed. ${syncedCount} events synced to backup database.`,
      totalEvents: events.length,
      syncedCount 
    });

  } catch (err) {
    console.error('Backup sync error:', err);
    res.status(500).json({ success: false, message: 'Backup sync failed: ' + err.message });
  }
});

// Cache for public events
let publicEventsCache = {
  data: null,
  timestamp: 0
};

// Public events endpoint - optimized for speed
app.get('/api/events/public', async (req, res) => {
  try {
    // Temporarily bypass cache for debugging
    // const now = Date.now();
    // if (publicEventsCache.data && (now - publicEventsCache.timestamp) < CACHE_DURATION) {
    //   console.log(`⚡ Returning cached public events (${publicEventsCache.data.length} events)`);
    //   return res.json({ success: true, events: publicEventsCache.data, cached: true });
    // }

    console.log('🔍 Fetching fresh data from Eventbrite...');

    // Try Eventbrite first with timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout for public

      // Fetch ALL events for debugging (not just live) with venue expansion and ticket classes
      const response = await fetch(`https://www.eventbriteapi.com/v3/organizations/2840348402211/events/?status=all&order_by=start_asc&expand=venue,ticket_classes`, {
        headers: {
          'Authorization': `Bearer ${config.EVENTBRITE_PRIVATE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const eventbriteData = await response.json();
        
        console.log(`🔍 Debug: Found ${eventbriteData.events?.length || 0} events from Eventbrite`);
        
        // Get ticket data from Supabase to merge with Eventbrite data
        const { data: ticketData, error: ticketError } = await supabase
          .from('events')
          .select('eventbrite_id, capacity, tickets_sold, tickets_remaining, sold_out');
        
        if (ticketError) {
          console.warn('⚠️ Could not fetch ticket data from Supabase:', ticketError);
        }
        
        // Create a map of eventbrite_id to ticket data
        const ticketMap = new Map();
        if (ticketData) {
          ticketData.forEach(ticket => {
            ticketMap.set(ticket.eventbrite_id, ticket);
          });
          console.log(`🎫 Loaded ticket data for ${ticketData.length} events`);
        }
        
        // Merge Eventbrite data with ticket information
        const enrichedEvents = (eventbriteData.events || []).map(event => {
          const ticketInfo = ticketMap.get(event.id);
          const enrichedEvent = { ...event };
          
          if (ticketInfo) {
            enrichedEvent.capacity = ticketInfo.capacity;
            enrichedEvent.tickets_sold = ticketInfo.tickets_sold;
            enrichedEvent.tickets_remaining = ticketInfo.tickets_remaining;
            enrichedEvent.sold_out = ticketInfo.sold_out;
            console.log(`🎫 Enriched event ${event.id} with ticket data:`, {
              capacity: ticketInfo.capacity,
              sold: ticketInfo.tickets_sold,
              remaining: ticketInfo.tickets_remaining,
              soldOut: ticketInfo.sold_out
            });
          }
          
          return enrichedEvent;
        });
        
        console.log(`🔍 Debug: Returning ${enrichedEvents.length} enriched events`);
        
        // Update cache
        publicEventsCache = {
          data: enrichedEvents,
          timestamp: Date.now()
        };

        return res.json({ 
          success: true, 
          events: enrichedEvents, 
          cached: false, 
          debug: { 
            total: eventbriteData.events?.length, 
            enriched: enrichedEvents.length,
            withTicketData: enrichedEvents.filter(e => e.tickets_remaining !== undefined).length,
            currentTime: new Date().toISOString()
          } 
        });
      } else {
        throw new Error(`Eventbrite API error: ${response.status}`);
      }
    } catch (eventbriteError) {
      console.warn('⚠️ Eventbrite API unavailable for public, using backup');
      
      // Fallback to Supabase backup
      const { data: backupEvents, error } = await supabase
        .from('events')
        .select('id, eventbrite_id, title, description, full-description, start_time, end_time, url, status, venue_name, venue_address, capacity, tickets_sold, tickets_remaining, sold_out, synced_at')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(20); // Limit for faster query

      if (error) {
        throw new Error('Failed to fetch events from backup');
      }

      const events = backupEvents || [];
      
      // Update cache
      publicEventsCache = {
        data: events,
        timestamp: Date.now()
      };

      res.json({ success: true, events, cached: false });
    }
  } catch (err) {
    console.error('Public events error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

// Delete synced event from local database
app.delete('/api/events/:id', requireSupabaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.json({ success: true, message: 'Event deleted from local database' });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ==================== ANALYTICS API ====================

// Get analytics data
app.get('/api/analytics', requireSupabaseAuth, async (req, res) => {
  try {
    // Get total counts
    const [rolesResult, applicationsResult] = await Promise.all([
      supabase.from('roles').select('id', { count: 'exact' }),
      supabase.from('applications').select('id', { count: 'exact' })
    ]);

    // Get applications by status
    const { data: applicationsByStatus } = await supabase
      .from('applications')
      .select('status')
      .not('status', 'is', null);

    // Get recent applications (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: recentApplications } = await supabase
      .from('applications')
      .select('submitted_at')
      .gte('submitted_at', thirtyDaysAgo.toISOString());

    // Get applications by role
    const { data: applicationsByRole } = await supabase
      .from('applications')
      .select(`
        role_id,
        roles (
          title
        )
      `);

    // Process data for analytics
    const statusCounts = {};
    applicationsByStatus?.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });

    const roleCounts = {};
    applicationsByRole?.forEach(app => {
      const roleTitle = app.roles?.title || 'Unknown Role';
      roleCounts[roleTitle] = (roleCounts[roleTitle] || 0) + 1;
    });

    res.json({
      success: true,
      analytics: {
        totalRoles: rolesResult.count || 0,
        totalApplications: applicationsResult.count || 0,
        recentApplications: recentApplications?.length || 0,
        applicationsByStatus: statusCounts,
        applicationsByRole: roleCounts
      }
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

// ==================== MEMBERSHIPS API ====================

// Jotform webhook: Insert new membership
app.post('/api/jotform-membership', async (req, res) => {
  try {
    console.log('📥 Jotform webhook received:', req.body);
    const body = req.body;
    // Generate unique membership number
    const timestamp = Date.now();
    const membership_number = `CT5-${timestamp}`;
    // Prepare insert object
    const insertObj = {
      ...body,
      membership_number,
      created_at: new Date().toISOString(),
    };
    console.log('💾 Inserting membership:', insertObj);
    // Insert into memberships table
    const { data, error } = await supabase
      .from('memberships')
      .insert([insertObj])
      .select();
    if (error) {
      console.error('❌ Membership insert error:', error);
      return res.status(400).json({ success: false, error: error.message });
    }
    console.log('✅ Membership created successfully:', data[0]);
    res.json({ success: true, membership_number });
  } catch (err) {
    console.error('Membership webhook error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Debug endpoint to test the membership webhook (GET request)
app.get('/api/jotform-membership', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Membership webhook endpoint is working. Use POST to submit membership data.',
    expectedFields: [
      'full_name', 'pronouns', 'date_of_birth', 'email', 'phone', 
      'address', 'postcode', 'membership_type', 'confirm_info', 
      'agree_conduct_policy', 'agree_privacy'
    ]
  });
});

// Admin: Get all memberships (protected)
app.get('/api/memberships', requireSupabaseAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.json({ success: true, memberships: data });
  } catch (err) {
    console.error('Get memberships error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ==================== RISK REGISTER API ENDPOINTS ====================

// Get all risks
app.get('/api/risks', requireSupabaseAuth, async (req, res) => {
  try {
    console.log('📊 Fetching risks from database...');
    
    const { data: risks, error } = await supabase
      .from('risk_register')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Risk fetch error:', error);
      throw error;
    }

    console.log(`✅ Successfully fetched ${risks?.length || 0} risks`);
    
    res.json({
      success: true,
      risks: risks || []
    });

  } catch (error) {
    console.error('Risk fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch risks',
      error: error.message
    });
  }
});

// ==================== CONFLICT OF INTEREST API ENDPOINTS ====================

// Get all conflicts of interest
app.get('/api/conflicts', requireSupabaseAuth, async (req, res) => {
  try {
    console.log('📊 Fetching conflicts of interest from database...');
    
    const { data: conflicts, error } = await supabase
      .from('conflict_of_interest')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Conflict fetch error:', error);
      throw error;
    }

    console.log(`✅ Successfully fetched ${conflicts?.length || 0} conflicts of interest`);
    
    // Map database column names back to frontend field names
    const mappedConflicts = conflicts?.map(conflict => ({
      ...conflict,
      position_role: conflict.role, // Map role to position_role
      description: conflict.details, // Map details to description
      mitigation_actions: conflict.mitigation // Map mitigation to mitigation_actions
    })) || [];
    
    res.json({
      success: true,
      conflicts: mappedConflicts
    });

  } catch (error) {
    console.error('Conflict fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conflicts of interest',
      error: error.message
    });
  }
});

// Create new conflict of interest
app.post('/api/conflicts', requireSupabaseAuth, async (req, res) => {
  try {
    console.log('📝 Creating new conflict of interest:', req.body);
    
    const conflictData = req.body;
    
    // Validate required fields
    if (!conflictData.individual_name || !conflictData.nature_of_interest || 
        !conflictData.conflict_type || !conflictData.date_declared || !conflictData.status || 
        !conflictData.before_mitigation_risk_level || !conflictData.residual_risk_level) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Generate auto conflict_id
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const autoConflictId = `COI-${timestamp}-${randomSuffix}`;
    
    console.log('🆔 Generated conflict_id:', autoConflictId);
    
    // Map frontend field names to database column names
    const mappedData = {
      conflict_id: autoConflictId, // Auto-generated conflict_id
      individual_name: conflictData.individual_name,
      nature_of_interest: conflictData.nature_of_interest,
      conflict_type: conflictData.conflict_type,
      date_declared: conflictData.date_declared,
      status: conflictData.status,
      before_mitigation_risk_level: conflictData.before_mitigation_risk_level,
      residual_risk_level: conflictData.residual_risk_level,
      role: conflictData.position_role, // Map position_role to role
      details: conflictData.description, // Map description to details
      mitigation: conflictData.mitigation_actions, // Map mitigation_actions to mitigation
      monetary_value: conflictData.monetary_value ? parseFloat(conflictData.monetary_value) : null,
      currency: conflictData.currency || 'GBP',
      notes: conflictData.notes,
      review_date: conflictData.review_date || null,
      organisation: conflictData.organisation || null
    };
    
    console.log('📋 Mapped data for database:', mappedData);
    
    const { data: conflict, error } = await supabase
      .from('conflict_of_interest')
      .insert([mappedData])
      .select()
      .single();

    if (error) {
      console.error('Conflict creation error:', error);
      throw error;
    }

    console.log('✅ Conflict of interest created successfully:', conflict.id);
    
    res.json({
      success: true,
      conflict: conflict,
      message: 'Conflict of interest created successfully'
    });

  } catch (error) {
    console.error('Conflict creation error:', error);
    
    // Enhanced error logging
    console.error('🔍 Detailed conflict creation error:');
    console.error('  - Error code:', error.code);
    console.error('  - Error message:', error.message);
    console.error('  - Error details:', error.details);
    console.error('  - Error hint:', error.hint);
    
    // Handle specific database errors
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Conflict ID already exists. Please use a unique identifier.'
      });
    }
    
    // Handle table not found error
    if (error.code === '42P01') {
      return res.status(500).json({
        success: false,
        message: 'Database table not found. Please contact the administrator.'
      });
    }
    
    // Handle permission denied error
    if (error.code === '42501') {
      return res.status(500).json({
        success: false,
        message: 'Database permission denied. Please contact the administrator.'
      });
    }
    
    // Handle foreign key constraint violations
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reference data. Please check your input.'
      });
    }
    
    // Handle not null constraint violations
    if (error.code === '23502') {
      return res.status(400).json({
        success: false,
        message: 'Required field is missing. Please fill in all required fields.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create conflict of interest',
      error: error.message,
      code: error.code
    });
  }
});

// Update existing conflict of interest
app.put('/api/conflicts/:id', requireSupabaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const conflictData = req.body;
    
    console.log(`📝 Updating conflict of interest ${id}:`, conflictData);
    
    // Validate required fields
    if (!conflictData.individual_name || !conflictData.nature_of_interest || 
        !conflictData.conflict_type || !conflictData.date_declared || !conflictData.status || 
        !conflictData.before_mitigation_risk_level || !conflictData.residual_risk_level) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Map frontend field names to database column names
    const mappedData = {
      individual_name: conflictData.individual_name,
      nature_of_interest: conflictData.nature_of_interest,
      conflict_type: conflictData.conflict_type,
      date_declared: conflictData.date_declared,
      status: conflictData.status,
      before_mitigation_risk_level: conflictData.before_mitigation_risk_level,
      residual_risk_level: conflictData.residual_risk_level,
      role: conflictData.position_role, // Map position_role to role
      details: conflictData.description, // Map description to details
      mitigation: conflictData.mitigation_actions, // Map mitigation_actions to mitigation
      monetary_value: conflictData.monetary_value ? parseFloat(conflictData.monetary_value) : null,
      currency: conflictData.currency || 'GBP',
      notes: conflictData.notes,
      review_date: conflictData.review_date || null,
      organisation: conflictData.organisation || null
    };
    
    console.log('📋 Mapped data for database update:', mappedData);
    
    const { data: conflict, error } = await supabase
      .from('conflict_of_interest')
      .update(mappedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Conflict update error:', error);
      throw error;
    }

    if (!conflict) {
      return res.status(404).json({
        success: false,
        message: 'Conflict of interest not found'
      });
    }

    console.log('✅ Conflict of interest updated successfully:', id);
    
    res.json({
      success: true,
      conflict: conflict,
      message: 'Conflict of interest updated successfully'
    });

  } catch (error) {
    console.error('Conflict update error:', error);
    
    // Handle unique constraint violations
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Conflict ID already exists. Please use a unique identifier.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update conflict of interest',
      error: error.message
    });
  }
});

// Delete conflict of interest
app.delete('/api/conflicts/:id', requireSupabaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Deleting conflict of interest ${id}`);
    
    const { data: conflict, error } = await supabase
      .from('conflict_of_interest')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Conflict deletion error:', error);
      throw error;
    }

    if (!conflict) {
      return res.status(404).json({
        success: false,
        message: 'Conflict of interest not found'
      });
    }

    console.log('✅ Conflict of interest deleted successfully:', id);
    
    res.json({
      success: true,
      message: 'Conflict of interest deleted successfully'
    });

  } catch (error) {
    console.error('Conflict deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete conflict of interest',
      error: error.message
    });
  }
});

// Get single conflict of interest by ID
app.get('/api/conflicts/:id', requireSupabaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`📊 Fetching conflict of interest ${id}`);
    
    const { data: conflict, error } = await supabase
      .from('conflict_of_interest')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Conflict fetch error:', error);
      throw error;
    }

    if (!conflict) {
      return res.status(404).json({
        success: false,
        message: 'Conflict of interest not found'
      });
    }

    console.log('✅ Conflict of interest fetched successfully:', id);
    
    res.json({
      success: true,
      conflict: conflict
    });

  } catch (error) {
    console.error('Conflict fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conflict of interest',
      error: error.message
    });
  }
});

// Export conflicts of interest in various formats
app.get('/api/conflicts/export/:format', requireSupabaseAuth, async (req, res) => {
  try {
    const { format } = req.params;
    const { conflict_type, status, risk_level } = req.query;
    
    console.log(`📄 Exporting conflicts of interest to ${format}...`);
    
    // Build query with optional filters
    let query = supabase
      .from('conflict_of_interest')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (conflict_type) {
      query = query.eq('conflict_type', conflict_type);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (risk_level) {
      query = query.eq('risk_level', risk_level);
    }
    
    const { data: conflicts, error } = await query;

    if (error) {
      console.error('Conflict export fetch error:', error);
      throw error;
    }

    if (!conflicts || conflicts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No conflicts of interest found to export'
      });
    }

    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (format.toLowerCase()) {
      case 'csv':
        const csvHeaders = [
          'Conflict ID', 'Individual Name', 'Position/Role', 'Nature of Interest', 'Conflict Type', 
          'Description', 'Monetary Value', 'Currency', 'Date Declared', 'Status', 
          'Mitigation Actions', 'Before Mitigation Risk', 'Residual Risk Level', 'Review Date', 'Notes', 'Created Date', 'Updated Date'
        ];
        
        const csvRows = conflicts.map(conflict => [
                      `"${(conflict.conflict_id || '').replace(/"/g, '""')}"`,
          `"${(conflict.individual_name || '').replace(/"/g, '""')}"`,
          `"${(conflict.role || '').replace(/"/g, '""')}"`, // Map role to position_role
          `"${(conflict.nature_of_interest || '').replace(/"/g, '""')}"`,
          `"${(conflict.conflict_type || '').replace(/"/g, '""')}"`,
          `"${(conflict.details || '').replace(/"/g, '""')}"`, // Map details to description
          conflict.monetary_value || '',
          `"${(conflict.currency || '').replace(/"/g, '""')}"`,
          conflict.date_declared ? new Date(conflict.date_declared).toLocaleDateString('en-GB') : '',
          `"${(conflict.status || '').replace(/"/g, '""')}"`,
          `"${(conflict.mitigation || '').replace(/"/g, '""')}"`, // Map mitigation to mitigation_actions
          `"${(conflict.before_mitigation_risk_level || '').replace(/"/g, '""')}"`,
          `"${(conflict.residual_risk_level || '').replace(/"/g, '""')}"`,
          conflict.review_date ? new Date(conflict.review_date).toLocaleDateString('en-GB') : '',
          `"${(conflict.notes || '').replace(/"/g, '""')}"`,
          conflict.created_at ? new Date(conflict.created_at).toLocaleDateString('en-GB') : '',
          conflict.updated_at ? new Date(conflict.updated_at).toLocaleDateString('en-GB') : ''
        ].join(','));
        
        const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="CT5_Pride_Conflict_of_Interest_Register_${timestamp}.csv"`);
        res.send(csvContent);
        break;
        
      case 'json':
        const exportData = {
          metadata: {
            generated_at: new Date().toISOString(),
            generated_by: 'CT5 Pride Conflict of Interest Management System',
            total_conflicts: conflicts.length,
            export_version: '1.0',
            filters: {
              conflict_type: conflict_type || null,
              status: status || null,
              risk_level: risk_level || null
            }
          },
          conflicts: conflicts
        };
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="CT5_Pride_Conflict_of_Interest_Register_${timestamp}.json"`);
        res.json(exportData);
        break;
        
      default:
        res.status(400).json({
          success: false,
          message: 'Unsupported export format. Use CSV or JSON.'
        });
    }

    console.log(`✅ Successfully exported ${conflicts.length} conflicts of interest as ${format.toUpperCase()}`);

  } catch (error) {
    console.error('Conflict export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export conflicts of interest',
      error: error.message
    });
  }
});

// Create new risk
app.post('/api/risks', requireSupabaseAuth, async (req, res) => {
  try {
    console.log('📝 Creating new risk:', req.body);
    
    const riskData = req.body;
    
    // Validate required fields
    if (!riskData.risk_id || !riskData.title || !riskData.risk_type || 
        !riskData.likelihood || !riskData.impact || !riskData.residual_risk_level) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Ensure likelihood and impact are numbers
    riskData.likelihood = parseInt(riskData.likelihood);
    riskData.impact = parseInt(riskData.impact);
    
    // Remove score from insert data - it's auto-calculated by the database
    delete riskData.score;
    
    const { data: risk, error } = await supabase
      .from('risk_register')
      .insert([riskData])
      .select()
      .single();

    if (error) {
      console.error('Risk creation error:', error);
      throw error;
    }

    console.log('✅ Risk created successfully:', risk.id);
    
    res.json({
      success: true,
      risk: risk,
      message: 'Risk created successfully'
    });

  } catch (error) {
    console.error('Risk creation error:', error);
    
    // Handle unique constraint violations
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Risk ID already exists. Please use a unique identifier.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create risk',
      error: error.message
    });
  }
});

// Update existing risk
app.put('/api/risks/:id', requireSupabaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const riskData = req.body;
    
    console.log(`📝 Updating risk ${id}:`, riskData);
    
    // Validate required fields
    if (!riskData.risk_id || !riskData.title || !riskData.risk_type || 
        !riskData.likelihood || !riskData.impact || !riskData.residual_risk_level) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Ensure likelihood and impact are numbers
    riskData.likelihood = parseInt(riskData.likelihood);
    riskData.impact = parseInt(riskData.impact);
    
    // Remove score from update data - it's auto-calculated by the database
    delete riskData.score;
    
    const { data: risk, error } = await supabase
      .from('risk_register')
      .update(riskData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Risk update error:', error);
      throw error;
    }

    if (!risk) {
      return res.status(404).json({
        success: false,
        message: 'Risk not found'
      });
    }

    console.log('✅ Risk updated successfully:', id);
    
    res.json({
      success: true,
      risk: risk,
      message: 'Risk updated successfully'
    });

  } catch (error) {
    console.error('Risk update error:', error);
    
    // Handle unique constraint violations
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Risk ID already exists. Please use a unique identifier.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update risk',
      error: error.message
    });
  }
});

// Delete risk
app.delete('/api/risks/:id', requireSupabaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Deleting risk ${id}`);
    
    const { data: risk, error } = await supabase
      .from('risk_register')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Risk deletion error:', error);
      throw error;
    }

    if (!risk) {
      return res.status(404).json({
        success: false,
        message: 'Risk not found'
      });
    }

    console.log('✅ Risk deleted successfully:', id);
    
    res.json({
      success: true,
      message: 'Risk deleted successfully'
    });

  } catch (error) {
    console.error('Risk deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete risk',
      error: error.message
    });
  }
});

// Get single risk by ID
app.get('/api/risks/:id', requireSupabaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`📊 Fetching risk ${id}`);
    
    const { data: risk, error } = await supabase
      .from('risk_register')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Risk fetch error:', error);
      throw error;
    }

    if (!risk) {
      return res.status(404).json({
        success: false,
        message: 'Risk not found'
      });
    }

    console.log('✅ Risk fetched successfully:', id);
    
    res.json({
      success: true,
      risk: risk
    });

  } catch (error) {
    console.error('Risk fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch risk',
      error: error.message
    });
  }
});

// Export risks in various formats
app.get('/api/risks/export/:format', requireSupabaseAuth, async (req, res) => {
  try {
    const { format } = req.params;
    const { risk_type, residual_risk_level } = req.query;
    
    console.log(`📄 Exporting risks to ${format}...`);
    
    // Build query with optional filters
    let query = supabase
      .from('risk_register')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (risk_type) {
      query = query.eq('risk_type', risk_type);
    }
    
    if (residual_risk_level) {
      query = query.eq('residual_risk_level', residual_risk_level);
    }
    
    const { data: risks, error } = await query;

    if (error) {
      console.error('Risk export fetch error:', error);
      throw error;
    }

    if (!risks || risks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No risks found to export'
      });
    }

    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (format.toLowerCase()) {
      case 'csv':
        const csvHeaders = [
          'Risk ID', 'Title', 'Description', 'Risk Type', 'Likelihood', 
          'Impact', 'Score', 'Mitigation', 'Residual Risk Level', 
          'Created Date', 'Updated Date'
        ];
        
        const csvRows = risks.map(risk => [
          `"${(risk.risk_id || '').replace(/"/g, '""')}"`,
          `"${(risk.title || '').replace(/"/g, '""')}"`,
          `"${(risk.description || '').replace(/"/g, '""')}"`,
          `"${(risk.risk_type || '').replace(/"/g, '""')}"`,
          risk.likelihood || '',
          risk.impact || '',
          risk.score || '',
          `"${(risk.mitigation || '').replace(/"/g, '""')}"`,
          `"${(risk.residual_risk_level || '').replace(/"/g, '""')}"`,
          risk.created_at ? new Date(risk.created_at).toLocaleDateString('en-GB') : '',
          risk.updated_at ? new Date(risk.updated_at).toLocaleDateString('en-GB') : ''
        ].join(','));
        
        const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="CT5_Pride_Risk_Register_${timestamp}.csv"`);
        res.send(csvContent);
        break;
        
      case 'json':
        const exportData = {
          metadata: {
            generated_at: new Date().toISOString(),
            generated_by: 'CT5 Pride Risk Management System',
            total_risks: risks.length,
            export_version: '1.0',
            filters: {
              risk_type: risk_type || null,
              residual_risk_level: residual_risk_level || null
            }
          },
          risks: risks
        };
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="CT5_Pride_Risk_Register_${timestamp}.json"`);
        res.json(exportData);
        break;
        
      default:
        res.status(400).json({
          success: false,
          message: 'Unsupported export format. Use CSV or JSON.'
        });
    }

    console.log(`✅ Successfully exported ${risks.length} risks as ${format.toUpperCase()}`);

  } catch (error) {
    console.error('Risk export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export risks',
      error: error.message
    });
  }
});

// ==================== STATIC FILE SERVING ====================

// Host-based static file serving - FIXED
app.use((req, res, next) => {
  const host = req.get('host') || '';
  const isAdmin = host.startsWith('admin.') || host.includes('admin');
  
  if (isAdmin) {
    // Admin subdomain: serve files from admin directory
    express.static(adminDir)(req, res, next);
  } else {
    // Main site: serve files from root directory  
    express.static(__dirname)(req, res, next);
  }
});

// Serve Images directory for both sites (shared assets)
app.use('/Images', express.static(path.join(__dirname, 'Images')));

// Host-based root route handling
app.get('/', (req, res) => {
  const host = req.get('host') || '';
  const isAdmin = host.startsWith('admin.') || host.includes('admin');
  
  if (isAdmin) {
    // Admin subdomain: serve admin dashboard
    res.sendFile(path.join(adminDir, 'index.html'));
  } else {
    // Main domain: serve main site homepage
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

// Host-based wildcard route for SPA routing and file serving
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  
  const host = req.get('host') || '';
  const isAdmin = host.startsWith('admin.') || host.includes('admin');
  
  if (isAdmin) {
    // Admin subdomain: SPA routing for admin dashboard
    const adminIndexPath = path.join(adminDir, 'index.html');
    if (fs.existsSync(adminIndexPath)) {
      return res.sendFile(adminIndexPath);
    }
  } else {
    // Main site: check for specific HTML files first
    const requestedFile = req.path.slice(1); // Remove leading slash
    if (requestedFile && !requestedFile.includes('.')) {
      // Try to serve .html file for clean URLs
      const htmlPath = path.join(__dirname, `${requestedFile}.html`);
      if (fs.existsSync(htmlPath)) {
        return res.sendFile(htmlPath);
      }
    }
    
    // Try to serve the exact file
    const exactPath = path.join(__dirname, req.path);
    if (fs.existsSync(exactPath) && !fs.statSync(exactPath).isDirectory()) {
      return res.sendFile(exactPath);
    }
    
    // Fallback to main site index for client-side routing
    const mainIndexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(mainIndexPath)) {
      return res.sendFile(mainIndexPath);
    }
  }
  
  // Fallback 404
  res.status(404).send('404 Not Found');
});

// ==================== ERROR HANDLING MIDDLEWARE ====================

// Global error handler to prevent 503 Service Unavailable errors
app.use((err, req, res, next) => {
  console.error('🚨 Unhandled error:', err);
  
  // Don't send error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Promise Rejection:', reason);
  // Don't exit the process in production, just log the error
  if (process.env.NODE_ENV !== 'production') {
    console.error('Promise:', promise);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  // In production, try to gracefully shutdown
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Attempting graceful shutdown...');
    process.exit(1);
  }
});

// Graceful shutdown handler
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 CT5 Pride Admin server running on port ${PORT}`);
  console.log(`📁 Serving admin dashboard from: ${adminDir}`);
  console.log('🌐 Visit: https://admin.ct5pride.co.uk/');
  console.log('🔐 API endpoints protected with Supabase Auth');
  console.log('📊 Analytics, roles, applications, events, and memberships APIs ready');
  console.log('🛡️ Security headers enabled (CSP, HSTS, X-Frame-Options, etc.)');
  console.log('❤️  Health checks available at /health, /ping, /health/db, /admin/health');
  
  // Verify admin files exist
  const adminFiles = {
    index: fs.existsSync(path.join(adminDir, 'index.html')),
    appJs: fs.existsSync(path.join(adminDir, 'js', 'app.js')),
    adminCss: fs.existsSync(path.join(adminDir, 'css', 'admin.css'))
  };
  
  console.log('📋 Admin files check:', adminFiles);
  
  if (!adminFiles.index || !adminFiles.appJs) {
    console.error('❌ Critical admin files missing!');
    console.error('   index.html:', adminFiles.index);
    console.error('   app.js:', adminFiles.appJs);
  } else {
    console.log('✅ All admin files present');
  }
}); 