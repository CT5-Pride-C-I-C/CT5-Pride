const express = require('express');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const { createClient } = require('@supabase/supabase-js');

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

// Get all roles
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

// 🔄 GET /api/membership/:id/stripe
// Retrieves Stripe subscription info for a CT5 Pride member
app.get('/api/membership/:id/stripe', requireSupabaseAuth, async (req, res) => {
  try {
    const Stripe = require('stripe');
    
    // Initialize Stripe with environment variable
    if (!config.STRIPE_SECRET_KEY) {
      return res.status(500).json({ success: false, error: 'Stripe configuration missing' });
    }
    
    const stripe = new Stripe(config.STRIPE_SECRET_KEY);
    const memberId = req.params.id;

    // Step 1: Look up the member in Supabase
    const { data: member, error: memberError } = await supabase
      .from('memberships')
      .select('stripe_customer_id')
      .eq('id', memberId)
      .single();

    if (memberError || !member || !member.stripe_customer_id) {
      return res.status(404).json({ success: false, error: 'Member not found or missing Stripe ID' });
    }

    // Step 2: Fetch subscription(s) for this Stripe customer
    const subscriptions = await stripe.subscriptions.list({
      customer: member.stripe_customer_id,
      status: 'active',
      limit: 1
    });

    const subscription = subscriptions.data[0];

    if (!subscription) {
      return res.status(404).json({ success: false, error: 'No active subscriptions found' });
    }

    return res.json({
      success: true,
      renewal_date: new Date(subscription.current_period_end * 1000).toISOString(),
      start_date: new Date(subscription.current_period_start * 1000).toISOString(),
      plan: subscription.plan?.nickname || subscription.plan?.id || 'Unknown Plan',
      status: subscription.status,
      amount: subscription.plan?.amount || 0,
      currency: subscription.plan?.currency || 'gbp'
    });

  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ success: false, error: 'Stripe API error: ' + err.message });
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
  console.log('💳 Stripe integration ready for membership renewals');
}); 