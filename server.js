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

// CORS middleware for admin domain
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Security headers including Permissions-Policy to suppress Chrome warnings
app.use((req, res, next) => {
  // Permissions Policy to suppress Chrome tracking warnings
  res.setHeader('Permissions-Policy', 'interest-cohort=(), browsing-topics=(), attribution-reporting=()');
  
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
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
    console.log('🌐 Public roles API called');
    
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('status', 'open')  // Only show published/open roles
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Public roles fetch error:', error);
      return res.status(400).json({ success: false, message: error.message });
    }

    console.log(`✅ Found ${data.length} published roles`);
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
    console.log('📥 Application submission received');
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
      cv_url: cvUrl,
      cover_letter: coverLetterContent,
      cover_letter_url: coverLetterUrl,
      status: 'pending',
      submitted_at: new Date().toISOString(),
      privacy_consent: !!privacyConsent
    };

    console.log('💾 Inserting application data:', applicationData);

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

// Get events from Eventbrite
app.get('/api/events', requireSupabaseAuth, async (req, res) => {
  try {
    const response = await fetch(`https://www.eventbriteapi.com/v3/organizations/me/events/`, {
      headers: {
        'Authorization': `Bearer ${config.EVENTBRITE_PRIVATE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Eventbrite API error: ${response.status}`);
    }

    const eventbriteData = await response.json();
    
    // Also get synced events from Supabase
    const { data: localEvents, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Local events fetch error:', error);
    }

    res.json({ 
      success: true, 
      eventbriteEvents: eventbriteData.events || [],
      localEvents: localEvents || [] 
    });
  } catch (err) {
    console.error('Get events error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

// Sync event from Eventbrite to local database
app.post('/api/events/sync', requireSupabaseAuth, async (req, res) => {
  try {
    const { eventbriteId, eventbriteUrl } = req.body;
    
    if (!eventbriteId && !eventbriteUrl) {
      return res.status(400).json({ success: false, message: 'Eventbrite ID or URL is required' });
    }

    // Extract ID from URL if provided
    let eventId = eventbriteId;
    if (eventbriteUrl && !eventId) {
      const urlMatch = eventbriteUrl.match(/events\/(\d+)/);
      if (urlMatch) {
        eventId = urlMatch[1];
      } else {
        return res.status(400).json({ success: false, message: 'Invalid Eventbrite URL format' });
      }
    }

    // Fetch event details from Eventbrite
    const response = await fetch(`https://www.eventbriteapi.com/v3/events/${eventId}/`, {
      headers: {
        'Authorization': `Bearer ${config.EVENTBRITE_PRIVATE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(400).json({ success: false, message: 'Event not found on Eventbrite' });
    }

    const eventData = await response.json();

    // Store in local database
    const { data, error } = await supabase
      .from('events')
      .insert([{
        eventbrite_id: eventId,
        title: eventData.name.text,
        description: eventData.description.text,
        start_time: eventData.start.utc,
        end_time: eventData.end.utc,
        url: eventData.url,
        status: eventData.status,
        synced_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.json({ success: true, event: data[0] });
  } catch (err) {
    console.error('Sync event error:', err);
    res.status(500).json({ success: false, message: 'Failed to sync event' });
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

// ==================== STATIC FILE SERVING ====================

// Serve Images directory at root level for logo and assets  
app.use('/Images', express.static(path.join(__dirname, 'Images')));

// CRITICAL: Serve static files from /admin directory with explicit paths
// This ensures CSS and JS files are served correctly before wildcard route
app.use('/css', express.static(path.join(adminDir, 'css')));
app.use('/js', express.static(path.join(adminDir, 'js')));

// Serve all other static files from /admin (for any other assets)
app.use(express.static(adminDir));

// Route / to serve admin/index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(adminDir, 'index.html'));
});

// Wildcard route for SPA client-side routing (MUST be last)
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }

  // For SPA client-side routing, serve index.html for all non-file routes
  const indexPath = path.join(adminDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  
  // Fallback 404
  res.status(404).send('404 Not Found');
});

app.listen(PORT, () => {
  console.log(`🚀 CT5 Pride Admin server running on port ${PORT}`);
  console.log(`📁 Serving admin dashboard from: ${adminDir}`);
  console.log('🌐 Visit: https://admin.ct5pride.co.uk/');
  console.log('🔐 API endpoints protected with Supabase Auth');
  console.log('📊 Analytics, roles, applications, events, and memberships APIs ready');
}); 