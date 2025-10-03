-- Add default_values column to quick_log_actions table
ALTER TABLE quick_log_actions
ADD COLUMN default_values jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN quick_log_actions.default_values IS 'Default values for the log entry (e.g., food, amount, temperature, etc.)';