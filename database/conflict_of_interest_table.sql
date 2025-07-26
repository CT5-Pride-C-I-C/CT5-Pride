-- CT5 Pride Conflict of Interest Register Table
-- This script creates the conflict_of_interest table in Supabase

-- Create the conflict_of_interest table
CREATE TABLE IF NOT EXISTS public.conflict_of_interest (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coi_id TEXT NOT NULL UNIQUE,
    individual_name TEXT NOT NULL,
    position_role TEXT,
    nature_of_interest TEXT NOT NULL,
    conflict_type TEXT NOT NULL,
    description TEXT,
    monetary_value DECIMAL(10,2),
    currency TEXT DEFAULT 'GBP',
    date_declared DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Active', 'Resolved', 'Under Review', 'Withdrawn')),
    mitigation_actions TEXT,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('Very Low', 'Low', 'Medium', 'High', 'Very High')),
    review_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at field
DROP TRIGGER IF EXISTS update_conflict_of_interest_updated_at ON public.conflict_of_interest;
CREATE TRIGGER update_conflict_of_interest_updated_at
    BEFORE UPDATE ON public.conflict_of_interest
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conflict_of_interest_conflict_type ON public.conflict_of_interest(conflict_type);
CREATE INDEX IF NOT EXISTS idx_conflict_of_interest_status ON public.conflict_of_interest(status);
CREATE INDEX IF NOT EXISTS idx_conflict_of_interest_risk_level ON public.conflict_of_interest(risk_level);
CREATE INDEX IF NOT EXISTS idx_conflict_of_interest_date_declared ON public.conflict_of_interest(date_declared);
CREATE INDEX IF NOT EXISTS idx_conflict_of_interest_individual ON public.conflict_of_interest(individual_name);

-- Add Row Level Security (RLS)
ALTER TABLE public.conflict_of_interest ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Allow authenticated users to read all conflicts of interest
CREATE POLICY "Enable read access for authenticated users" ON public.conflict_of_interest
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert conflicts of interest
CREATE POLICY "Enable insert for authenticated users" ON public.conflict_of_interest
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update conflicts of interest
CREATE POLICY "Enable update for authenticated users" ON public.conflict_of_interest
FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete conflicts of interest
CREATE POLICY "Enable delete for authenticated users" ON public.conflict_of_interest
FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample data (optional - remove if not needed)
INSERT INTO public.conflict_of_interest (
    coi_id,
    individual_name,
    position_role,
    nature_of_interest,
    conflict_type,
    description,
    monetary_value,
    date_declared,
    status,
    mitigation_actions,
    risk_level,
    review_date
) VALUES 
(
    'COI-001',
    'John Smith',
    'Board Member',
    'Financial Interest in Supplier',
    'Financial',
    'Owns 25% shares in XYZ Events Ltd, which provides sound equipment for Pride events.',
    2500.00,
    '2024-01-15',
    'Active',
    'Recused from all supplier selection decisions involving XYZ Events Ltd. Alternative board member leads procurement discussions.',
    'Medium',
    '2024-07-15'
),
(
    'COI-002',
    'Sarah Johnson',
    'Volunteer Coordinator',
    'Personal Relationship',
    'Personal',
    'Partner works for local council events department that processes our event permits.',
    NULL,
    '2024-02-10',
    'Active',
    'Transparent disclosure made to board. Alternative contact established for permit applications.',
    'Low',
    '2024-08-10'
),
(
    'COI-003',
    'Michael Brown',
    'Treasurer',
    'Family Business Connection',
    'Financial',
    'Sister owns catering company that has been considered for Pride event contracts.',
    800.00,
    '2024-01-05',
    'Resolved',
    'Formal procurement process established. Sister''s company not selected in competitive tender.',
    'Low',
    NULL
)
ON CONFLICT (coi_id) DO NOTHING;

-- Grant necessary permissions to service role
GRANT ALL ON public.conflict_of_interest TO service_role;
GRANT ALL ON public.conflict_of_interest TO anon;

-- Comment on table and columns for documentation
COMMENT ON TABLE public.conflict_of_interest IS 'Conflict of interest register for tracking potential conflicts and their management';
COMMENT ON COLUMN public.conflict_of_interest.coi_id IS 'Unique identifier for the conflict of interest (e.g., COI-001)';
COMMENT ON COLUMN public.conflict_of_interest.individual_name IS 'Name of the person with the potential conflict';
COMMENT ON COLUMN public.conflict_of_interest.position_role IS 'Role or position held by the individual within the organization';
COMMENT ON COLUMN public.conflict_of_interest.nature_of_interest IS 'Brief description of the nature of the interest';
COMMENT ON COLUMN public.conflict_of_interest.conflict_type IS 'Category of conflict (Financial, Personal, Professional, etc.)';
COMMENT ON COLUMN public.conflict_of_interest.description IS 'Detailed description of the conflict of interest';
COMMENT ON COLUMN public.conflict_of_interest.monetary_value IS 'Monetary value associated with the interest (if applicable)';
COMMENT ON COLUMN public.conflict_of_interest.currency IS 'Currency for the monetary value (defaults to GBP)';
COMMENT ON COLUMN public.conflict_of_interest.date_declared IS 'Date when the conflict was declared';
COMMENT ON COLUMN public.conflict_of_interest.status IS 'Current status of the conflict';
COMMENT ON COLUMN public.conflict_of_interest.mitigation_actions IS 'Actions taken to mitigate the conflict';
COMMENT ON COLUMN public.conflict_of_interest.risk_level IS 'Assessed risk level of the conflict';
COMMENT ON COLUMN public.conflict_of_interest.review_date IS 'Date for next review of the conflict';
COMMENT ON COLUMN public.conflict_of_interest.notes IS 'Additional notes or comments';

-- Verification query to check table creation
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'conflict_of_interest' 
ORDER BY ordinal_position; 