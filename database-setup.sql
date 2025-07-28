-- CT5 Pride Database Setup Script
-- This script creates the conflict_of_interest table and sets up proper permissions

-- Create the conflict_of_interest table
CREATE TABLE IF NOT EXISTS conflict_of_interest (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    individual_name TEXT NOT NULL,
    nature_of_interest TEXT NOT NULL,
    conflict_type TEXT NOT NULL,
    date_declared DATE NOT NULL,
    status TEXT NOT NULL,
    before_mitigation_risk_level TEXT NOT NULL,
    residual_risk_level TEXT NOT NULL,
    monetary_value DECIMAL(15,2),
    mitigation_measures TEXT,
    review_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conflict_individual_name ON conflict_of_interest(individual_name);
CREATE INDEX IF NOT EXISTS idx_conflict_status ON conflict_of_interest(status);
CREATE INDEX IF NOT EXISTS idx_conflict_date_declared ON conflict_of_interest(date_declared);
CREATE INDEX IF NOT EXISTS idx_conflict_created_at ON conflict_of_interest(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE conflict_of_interest ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all conflicts
CREATE POLICY "Allow authenticated users to read conflicts" ON conflict_of_interest
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to insert conflicts
CREATE POLICY "Allow authenticated users to insert conflicts" ON conflict_of_interest
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update conflicts
CREATE POLICY "Allow authenticated users to update conflicts" ON conflict_of_interest
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete conflicts
CREATE POLICY "Allow authenticated users to delete conflicts" ON conflict_of_interest
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_conflict_updated_at 
    BEFORE UPDATE ON conflict_of_interest 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
INSERT INTO conflict_of_interest (
    individual_name,
    nature_of_interest,
    conflict_type,
    date_declared,
    status,
    before_mitigation_risk_level,
    residual_risk_level,
    notes
) VALUES 
(
    'John Doe',
    'Board member of external organization',
    'Financial',
    '2024-01-15',
    'Active',
    'Medium',
    'Low',
    'Sample conflict of interest for testing purposes'
),
(
    'Jane Smith',
    'Family member works for supplier',
    'Personal',
    '2024-01-20',
    'Resolved',
    'High',
    'Low',
    'Mitigation measures implemented and conflict resolved'
)
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON conflict_of_interest TO authenticated;
GRANT USAGE ON SEQUENCE conflict_of_interest_id_seq TO authenticated;

-- Verify the table was created successfully
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'conflict_of_interest'
ORDER BY ordinal_position; 