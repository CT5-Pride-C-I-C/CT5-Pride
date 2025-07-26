# CT5 Pride Risk Register

A comprehensive risk management system for tracking, assessing, and mitigating organizational risks within the CT5 Pride admin dashboard.

## Features

### ✨ Core Functionality
- **Risk Assessment**: Track likelihood (1-5) and impact (1-5) with automatic score calculation
- **Risk Categorization**: Organize risks by type (Financial, Operational, Strategic, etc.)
- **Mitigation Tracking**: Document mitigation strategies and residual risk levels
- **Filtering & Search**: Filter by risk type and residual risk level
- **Responsive Design**: Mobile-friendly interface matching CT5 Pride branding

### 🎯 Risk Scoring System
- **Score Calculation**: Automatic calculation as `likelihood × impact`
- **Risk Levels**: 
  - 1-4: Very Low (Green)
  - 5-8: Low (Light Green)
  - 9-12: Medium (Yellow)
  - 13-16: High (Orange)
  - 17-25: Very High (Red)

### 🔒 Security Features
- Server-side API endpoints with authentication
- Row Level Security (RLS) in Supabase
- Input validation and sanitization
- Unique risk ID constraints

## Installation & Setup

### 1. Database Setup

Execute the SQL script to create the risk register table in your Supabase database:

```sql
-- Run this in your Supabase SQL editor
-- File: database/risk_register_table.sql
```

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database/risk_register_table.sql`
4. Click "Run" to execute the script

### 2. File Structure

The Risk Register consists of these files:

```
CT5-Pride/
├── admin/
│   ├── risk_register.html          # Main Risk Register page
│   └── js/
│       └── risk-register.js        # Frontend functionality
├── server.js                       # Backend API endpoints added
├── database/
│   └── risk_register_table.sql     # Database schema
└── RISK_REGISTER_README.md         # This file
```

### 3. Navigation Integration

The Risk Register is automatically integrated into the admin navigation:

- **Icon**: ⚠️ (warning icon)
- **Label**: "Risk Register"
- **URL**: `/admin/risk_register.html`
- **Position**: Second item in navigation (after Dashboard)

## Usage Guide

### Accessing the Risk Register

1. Log into the CT5 Pride admin dashboard
2. Click "Risk Register" in the navigation menu
3. The page will load with any existing risks displayed in a table

### Adding a New Risk

1. Click the "Add New Risk" button
2. Fill in the modal form:
   - **Risk ID**: Unique identifier (e.g., "RISK-001", "OP-2024-01")
   - **Title**: Brief descriptive title
   - **Risk Type**: Select from predefined categories
   - **Description**: Detailed description (optional)
   - **Likelihood**: Probability of occurrence (1-5 scale)
   - **Impact**: Severity if it occurs (1-5 scale)
   - **Mitigation**: Description of mitigation strategies
   - **Residual Risk Level**: Risk level after mitigation

3. The risk score is automatically calculated as you select likelihood and impact
4. Click "Create Risk" to save

### Editing an Existing Risk

1. Find the risk in the table
2. Click the "Edit" button for that risk
3. Modify the form fields as needed
4. Click "Update Risk" to save changes

### Deleting a Risk

1. Find the risk in the table
2. Click the "Delete" button for that risk
3. Confirm the deletion in the popup dialog
4. The risk will be permanently removed

### Filtering Risks

Use the filter dropdowns above the table:

- **Risk Type Filter**: Show only risks of a specific type
- **Residual Risk Level Filter**: Show only risks at a specific level
- **Clear Filters**: Reset all filters to show all risks

### Exporting Risk Data

The Risk Register supports multiple export formats accessible via the "📊 Export Data" dropdown:

#### Available Export Formats

1. **📄 CSV Export**
   - Spreadsheet-compatible format
   - Includes all risk fields with proper escaping
   - Filename: `CT5_Pride_Risk_Register_YYYY-MM-DD.csv`
   - Best for: Data analysis, Excel import, reporting

2. **📝 Markdown Export**
   - Human-readable documentation format
   - Includes summary statistics and detailed risk descriptions
   - Sorted by risk score (highest first)
   - Best for: Documentation, GitHub wikis, technical reports

3. **💾 JSON Export**
   - Machine-readable structured data
   - Includes metadata and complete risk objects
   - API-compatible format with version information
   - Best for: Data integration, backup, system migration

4. **🖨️ Printable Report**
   - Professional HTML report in new browser window
   - Print-optimized styling with color-coded risk scores
   - Includes summary charts and detailed risk analysis
   - Auto-triggers print dialog
   - Best for: Executive reporting, board presentations, physical documentation

#### Export Features

- **Respects Active Filters**: Only exports currently visible/filtered risks
- **Automatic Timestamps**: All exports include generation date in filename
- **Summary Statistics**: Markdown and printable reports include risk distribution summaries
- **Consistent Formatting**: All formats use standardized date formatting (DD/MM/YYYY)
- **Client-Side Processing**: Fast export without server round-trips
- **Mobile Responsive**: Export dropdown works on all device sizes

#### Using Exports

1. **Filter Data** (optional): Use the filter dropdowns to select specific risks
2. **Click Export Button**: Click "📊 Export Data" in the page header
3. **Choose Format**: Select your preferred export format from the dropdown
4. **Download**: File will automatically download to your default downloads folder

## Technical Details

### Database Schema

```sql
CREATE TABLE public.risk_register (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    risk_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    risk_type TEXT NOT NULL,
    likelihood INTEGER NOT NULL CHECK (likelihood >= 1 AND likelihood <= 5),
    impact INTEGER NOT NULL CHECK (impact >= 1 AND impact <= 5),
    score INTEGER GENERATED ALWAYS AS (likelihood * impact) STORED,
    mitigation TEXT,
    residual_risk_level TEXT NOT NULL CHECK (residual_risk_level IN ('Very Low', 'Low', 'Medium', 'High', 'Very High')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### API Endpoints

The Risk Register uses these RESTful API endpoints:

- `GET /api/risks` - Fetch all risks
- `POST /api/risks` - Create a new risk
- `PUT /api/risks/:id` - Update an existing risk
- `DELETE /api/risks/:id` - Delete a risk
- `GET /api/risks/:id` - Fetch a single risk
- `GET /api/risks/export/:format` - Export risks in CSV or JSON format

All endpoints require authentication via Bearer token.

#### Export API Usage

```bash
# Export all risks as CSV
GET /api/risks/export/csv

# Export filtered risks as JSON
GET /api/risks/export/json?risk_type=Operational&residual_risk_level=High

# Response includes appropriate Content-Type and Content-Disposition headers
# for automatic file download
```

**Export Parameters:**
- `format`: Required path parameter (`csv` or `json`)
- `risk_type`: Optional query parameter to filter by risk type
- `residual_risk_level`: Optional query parameter to filter by risk level

### Frontend Architecture

- **Framework**: Vanilla JavaScript with modern ES6+ features
- **Styling**: Uses existing CT5 Pride admin CSS variables and components
- **Authentication**: Integrates with existing Supabase auth system
- **State Management**: Local state management with real-time updates
- **Responsive**: Mobile-first design with responsive breakpoints

### Security Implementation

1. **Authentication**: All API endpoints require valid authentication
2. **Authorization**: Only authenticated admin users can access risk data
3. **Input Validation**: Server-side validation of all form inputs
4. **SQL Injection Prevention**: Parameterized queries via Supabase
5. **XSS Prevention**: Input sanitization and safe HTML rendering

## Risk Types

The system supports these predefined risk categories:

- **Financial**: Budget overruns, funding shortfalls, financial fraud
- **Operational**: Process failures, staff shortages, equipment failures
- **Strategic**: Goal misalignment, competitive threats, market changes
- **Compliance**: Regulatory violations, policy breaches
- **Reputational**: Public relations issues, social media crises
- **Legal**: Lawsuits, contract disputes, liability issues
- **Health & Safety**: Injury risks, safety violations, health concerns
- **Technology**: System failures, cyber attacks, data breaches
- **Environmental**: Weather disruptions, environmental damage
- **Other**: Any risks not covered by the above categories

## Troubleshooting

### Common Issues

1. **"Risk ID already exists" error**: Each risk must have a unique identifier
2. **Authentication errors**: Ensure you're logged into the admin dashboard
3. **Table not loading**: Check that the database table has been created correctly
4. **API errors**: Verify server is running and environment variables are set

### Database Issues

If risks aren't loading:

1. Verify the `risk_register` table exists in Supabase
2. Check that RLS policies are properly configured
3. Ensure your user has appropriate permissions

### Performance Optimization

- Database indexes are created for commonly filtered columns
- API responses are paginated for large datasets
- Client-side filtering reduces server requests
- Efficient DOM updates minimize re-rendering

## Development Notes

### Extending the System

To add new risk types:
1. Update the `RISK_TYPES` array in `risk-register.js`
2. No database changes needed - risk types are stored as text

To add new residual risk levels:
1. Update the `RESIDUAL_RISK_LEVELS` array in `risk-register.js`
2. Update the database constraint if needed
3. Add corresponding CSS classes for styling

### Customization

The styling can be customized by modifying the CSS variables in the `<style>` section of `risk_register.html`. All colors and spacing use CSS custom properties for easy theming.

## Sample Data

The setup script includes three sample risks to demonstrate the system:

1. **RISK-001**: Event Cancellation Due to Weather (Operational, Medium)
2. **RISK-002**: Volunteer No-Show at Critical Events (Operational, Low)
3. **RISK-003**: Data Privacy Breach (Legal, Medium)

These can be modified or deleted as needed.

## Support

For technical support or feature requests related to the Risk Register:

1. Check this README for common solutions
2. Review the browser console for error messages
3. Verify database connectivity and permissions
4. Test with sample data to isolate issues

---

**Note**: This Risk Register is designed specifically for CT5 Pride's admin system and integrates seamlessly with the existing authentication, styling, and navigation patterns. 