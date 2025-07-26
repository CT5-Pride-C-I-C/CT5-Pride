-- CT5 Pride Risk Register Table
-- This script creates the risk_register table in Supabase

-- Create the risk_register table
CREATE TABLE IF NOT EXISTS public.risk_register (
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

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at field
DROP TRIGGER IF EXISTS update_risk_register_updated_at ON public.risk_register;
CREATE TRIGGER update_risk_register_updated_at
    BEFORE UPDATE ON public.risk_register
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_risk_register_risk_type ON public.risk_register(risk_type);
CREATE INDEX IF NOT EXISTS idx_risk_register_residual_risk_level ON public.risk_register(residual_risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_register_created_at ON public.risk_register(created_at);
CREATE INDEX IF NOT EXISTS idx_risk_register_score ON public.risk_register(score);

-- Add Row Level Security (RLS)
ALTER TABLE public.risk_register ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Allow authenticated users to read all risks
CREATE POLICY "Enable read access for authenticated users" ON public.risk_register
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert risks
CREATE POLICY "Enable insert for authenticated users" ON public.risk_register
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update risks
CREATE POLICY "Enable update for authenticated users" ON public.risk_register
FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete risks
CREATE POLICY "Enable delete for authenticated users" ON public.risk_register
FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample data (optional - remove if not needed)
INSERT INTO public.risk_register (
    risk_id, 
    title, 
    description, 
    risk_type, 
    likelihood, 
    impact, 
    mitigation, 
    residual_risk_level
) VALUES 
(
    'RISK-001', 
    'Event Cancellation Due to Weather', 
    'Risk that outdoor events may need to be cancelled or postponed due to severe weather conditions, resulting in financial loss and reputational damage.',
    'Operational',
    3,
    4,
    'Monitor weather forecasts closely, have contingency indoor venues identified, purchase event insurance, communicate early with attendees about potential changes.',
    'Medium'
),
(
    'RISK-002',
    'Volunteer No-Show at Critical Events',
    'Risk that key volunteers fail to show up for important events, leaving critical roles unfilled and impacting event quality.',
    'Operational',
    2,
    3,
    'Maintain backup volunteer list, confirm attendance 24-48 hours before events, cross-train volunteers in multiple roles, establish clear communication channels.',
    'Low'
),
(
    'RISK-003',
    'Data Privacy Breach',
    'Risk of unauthorized access to member personal data, leading to privacy violations and potential legal consequences.',
    'Legal',
    2,
    5,
    'Implement strong access controls, regular security audits, staff training on data protection, encrypt sensitive data, maintain incident response plan.',
    'Medium'
)
ON CONFLICT (risk_id) DO NOTHING;

-- Grant necessary permissions to service role
GRANT ALL ON public.risk_register TO service_role;
GRANT ALL ON public.risk_register TO anon;

-- Comment on table and columns for documentation
COMMENT ON TABLE public.risk_register IS 'Risk register for tracking organizational risks, assessments, and mitigation strategies';
COMMENT ON COLUMN public.risk_register.risk_id IS 'Unique identifier for the risk (e.g., RISK-001, OP-2024-01)';
COMMENT ON COLUMN public.risk_register.title IS 'Brief title describing the risk';
COMMENT ON COLUMN public.risk_register.description IS 'Detailed description of the risk';
COMMENT ON COLUMN public.risk_register.risk_type IS 'Category of risk (Financial, Operational, Strategic, etc.)';
COMMENT ON COLUMN public.risk_register.likelihood IS 'Probability of risk occurring (1-5 scale)';
COMMENT ON COLUMN public.risk_register.impact IS 'Severity of impact if risk occurs (1-5 scale)';
COMMENT ON COLUMN public.risk_register.score IS 'Auto-calculated risk score (likelihood × impact)';
COMMENT ON COLUMN public.risk_register.mitigation IS 'Description of mitigation strategies and controls';
COMMENT ON COLUMN public.risk_register.residual_risk_level IS 'Risk level after mitigation controls are applied';

-- Verification query to check table creation
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'risk_register' 
ORDER BY ordinal_position; 