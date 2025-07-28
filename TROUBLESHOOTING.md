# Conflict of Interest Submission Error - Troubleshooting Guide

## Error Description
When submitting a new conflict of interest on admin.ct5pride.co.uk, the following error occurs:
```
Conflict save error: Error: Failed to create conflict of interest
```

## Root Cause Analysis

The error is occurring in the `handleConflictSubmit` function in `admin/js/app.js` at line 3566. This typically indicates one of the following issues:

### 1. Database Table Missing
The `conflict_of_interest` table may not exist in your Supabase database.

**Solution:**
- Run the `database-setup.sql` script in your Supabase SQL editor
- Or manually create the table using the schema provided in the SQL file

### 2. Authentication Issues
The user's authentication token may be invalid or expired.

**Solution:**
- Check if the user is properly logged in
- Verify the authentication token is valid
- Try logging out and logging back in

### 3. Database Permissions
The service role key may not have proper permissions to insert into the table.

**Solution:**
- Verify RLS (Row Level Security) policies are correctly configured
- Check that the service role has INSERT permissions on the table

### 4. Data Validation Issues
Required fields may be missing or invalid.

**Solution:**
- Check the browser console for validation errors
- Ensure all required fields are filled in the form

## Diagnostic Steps

### Step 1: Check Database Health
Visit these endpoints to check the database status:

1. **General Database Health:**
   ```
   GET /health/db
   ```

2. **Conflicts Table Health:**
   ```
   GET /health/conflicts
   ```

### Step 2: Check Browser Console
Open the browser's developer tools (F12) and check the console for detailed error messages. The enhanced error logging will now show:

- Error name and message
- Error stack trace
- Network request details
- Response status and headers

### Step 3: Check Server Logs
Look at the server console output for detailed error information, including:

- Database error codes
- Authentication status
- Request/response details

## Enhanced Error Handling

The code has been updated with enhanced error handling that will provide more specific error messages:

### Frontend Improvements:
- Better error categorization (network, authentication, server errors)
- Detailed console logging for debugging
- User-friendly error messages

### Backend Improvements:
- Specific handling for common database errors
- Enhanced error logging with error codes
- Better error messages for different failure scenarios

## Common Error Codes and Solutions

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `42P01` | Table doesn't exist | Run database setup script |
| `42501` | Permission denied | Check RLS policies |
| `23502` | Not null constraint violation | Fill in all required fields |
| `23503` | Foreign key constraint violation | Check reference data |
| `23505` | Unique constraint violation | Use unique identifier |

## Quick Fixes

### If the table doesn't exist:
1. Go to your Supabase dashboard
2. Navigate to the SQL editor
3. Run the `database-setup.sql` script
4. Verify the table was created successfully

### If authentication is failing:
1. Log out of the admin panel
2. Clear browser cache and cookies
3. Log back in with valid credentials
4. Try submitting the conflict again

### If permissions are incorrect:
1. Check that RLS is enabled on the table
2. Verify the policies allow authenticated users to insert
3. Ensure the service role key has proper permissions

## Testing the Fix

After implementing the fixes:

1. **Test the health endpoints:**
   ```
   curl https://admin.ct5pride.co.uk/health/conflicts
   ```

2. **Try submitting a test conflict:**
   - Fill in all required fields
   - Submit the form
   - Check the console for any remaining errors

3. **Verify the data was saved:**
   - Check the conflicts list in the admin panel
   - Verify the data appears in the Supabase table

## Support

If the issue persists after following these steps:

1. Check the server logs for detailed error information
2. Verify all environment variables are correctly set
3. Ensure the Supabase connection is working
4. Contact the development team with the specific error details

## Prevention

To prevent this issue in the future:

1. Always run database migrations when deploying
2. Test the admin panel functionality after deployments
3. Monitor server logs for database connection issues
4. Regularly verify authentication is working correctly 