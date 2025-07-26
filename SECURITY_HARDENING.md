# CT5 Pride Admin Security Hardening

This document outlines the security improvements implemented to harden the admin.ct5pride.co.uk application.

## Security Headers Implemented

### 1. X-Frame-Options: DENY
**Purpose:** Prevents clickjacking attacks by blocking the site from being embedded in frames/iframes.
**Implementation:** Server header + HTML meta tag
**Status:** ✅ Implemented

### 2. X-Content-Type-Options: nosniff
**Purpose:** Prevents browsers from MIME-type sniffing, reducing risk of malicious file execution.
**Implementation:** Server header + HTML meta tag
**Status:** ✅ Implemented

### 3. Strict-Transport-Security (HSTS)
**Purpose:** Forces HTTPS connections and prevents protocol downgrade attacks.
**Configuration:** `max-age=31536000; includeSubDomains; preload` (1 year)
**Implementation:** Server header
**Status:** ✅ Implemented

### 4. Content-Security-Policy (CSP)
**Purpose:** Prevents XSS, code injection, and other content injection attacks.
**Configuration:**
- `default-src 'self'` - Only allow resources from same origin by default
- `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://js.stripe.com https://checkout.stripe.com` - Allow scripts from trusted CDNs
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net` - Allow styles from trusted sources
- `font-src 'self' https://fonts.gstatic.com` - Allow fonts from Google Fonts
- `img-src 'self' data: https: blob:` - Allow images from various sources
- `connect-src 'self' https://*.supabase.co https://api.stripe.com https://checkout.stripe.com https://api.eventbrite.com` - Allow API connections
- `frame-src 'none'` - Block all frames
- `frame-ancestors 'none'` - Block embedding in frames (alternative to X-Frame-Options)
- `object-src 'none'` - Block plugins like Flash
- `base-uri 'self'` - Restrict base tag to same origin
- `form-action 'self'` - Restrict form submissions to same origin
- `upgrade-insecure-requests` - Automatically upgrade HTTP to HTTPS

**Status:** ✅ Implemented

### 5. Additional Security Headers
- **Referrer-Policy:** `strict-origin-when-cross-origin` - Controls referrer information
- **X-Permitted-Cross-Domain-Policies:** `none` - Blocks cross-domain policies
- **X-XSS-Protection:** `1; mode=block` - Legacy XSS protection (backup for old browsers)

**Status:** ✅ Implemented

## Health Check Endpoints

### 1. /health
**Purpose:** Basic application health check with system information
**Response:** JSON with status, uptime, memory usage, environment
**Status:** ✅ Implemented

### 2. /ping
**Purpose:** Simple ping endpoint for load balancers
**Response:** Plain text "pong"
**Status:** ✅ Implemented

### 3. /health/db
**Purpose:** Database connectivity check
**Response:** JSON with database connection status
**Status:** ✅ Implemented

## Error Handling Improvements

### 1. Global Error Handler
**Purpose:** Catches all unhandled errors and returns proper HTTP responses instead of 503 Service Unavailable
**Features:**
- Development vs production error messages
- Proper error logging
- Graceful error responses

**Status:** ✅ Implemented

### 2. Process Event Handlers
**Purpose:** Handle unhandled promise rejections and uncaught exceptions
**Features:**
- Unhandled promise rejection logging
- Uncaught exception handling
- Graceful shutdown on SIGTERM/SIGINT

**Status:** ✅ Implemented

## 503 Service Unavailable Mitigation

The following measures help prevent 503 errors:

1. **Health check endpoints** - Allow monitoring systems to verify application health
2. **Global error handling** - Prevents uncaught errors from crashing the application
3. **Graceful shutdown** - Handles termination signals properly
4. **Process event handlers** - Logs and handles unexpected errors

## Security Testing Recommendations

After deployment, test the security headers using:

1. **SSL Labs SSL Test:** https://www.ssllabs.com/ssltest/
2. **Security Headers:** https://securityheaders.com/
3. **Mozilla Observatory:** https://observatory.mozilla.org/

Expected results:
- All security headers should receive A+ ratings
- No missing security headers warnings
- HSTS preload eligibility

## Maintenance

### Regular Updates
- Keep Node.js and dependencies updated
- Monitor security advisories for Supabase, Express, and other dependencies
- Review and update CSP policies as new features are added

### Monitoring
- Monitor health check endpoints
- Set up alerts for 503 errors
- Review error logs regularly

### CSP Policy Updates
If new external services are added, update the CSP policy in `server.js` to include:
- New script sources in `script-src`
- New API endpoints in `connect-src`
- New style/font sources as needed

## Notes

- The CSP policy allows `'unsafe-inline'` and `'unsafe-eval'` for scripts due to the admin dashboard's requirements
- Health checks are publicly accessible for monitoring purposes
- Error details are only shown in development mode for security

## Security Compliance

These implementations address:
- ✅ OWASP Top 10 security recommendations
- ✅ Mozilla Web Security Guidelines
- ✅ Common vulnerability scanners (Security Headers, SSL Labs)
- ✅ Industry best practices for Express.js applications 