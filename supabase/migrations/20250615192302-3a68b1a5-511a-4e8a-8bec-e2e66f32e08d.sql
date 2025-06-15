
-- Add default log tag suggestions to all existing users
INSERT INTO public.log_tag_suggestions (user_id, name, category, color)
SELECT 
  u.id as user_id,
  tags.name,
  tags.category,
  tags.color
FROM auth.users u
CROSS JOIN (
  VALUES 
    -- Health category tags
    ('breathing_difficulty', 'health', '#ef4444'),
    ('loss_of_appetite', 'health', '#ef4444'),
    ('weight_loss', 'health', '#ef4444'),
    ('lethargy', 'health', '#f97316'),
    ('diarrhea', 'health', '#ef4444'),
    ('constipation', 'health', '#f59e0b'),
    ('eye_discharge', 'health', '#f97316'),
    ('nasal_discharge', 'health', '#f97316'),
    ('skin_redness', 'health', '#ef4444'),
    ('hair_loss', 'health', '#f59e0b'),
    ('trembling', 'health', '#ef4444'),
    ('abnormal_gait', 'health', '#f97316'),
    -- Basic behaviors
    ('foraging', 'behavior', '#10b981'),
    ('drinking', 'behavior', '#06b6d4'),
    ('grooming', 'behavior', '#8b5cf6'),
    ('resting', 'behavior', '#6b7280'),
    ('sleeping', 'behavior', '#4b5563'),
    ('playing', 'behavior', '#f59e0b'),
    ('exploring', 'behavior', '#3b82f6'),
    -- Dominant behaviors
    ('rearing', 'behavior', '#dc2626'),
    ('chasing', 'behavior', '#dc2626'),
    ('pinning', 'behavior', '#dc2626'),
    ('resource_guarding', 'behavior', '#dc2626'),
    ('claiming_high_ground', 'behavior', '#dc2626'),
    -- Submissive behaviors
    ('huddling', 'behavior', '#059669'),
    ('fleeing', 'behavior', '#059669'),
    ('yielding_resources', 'behavior', '#059669'),
    ('lying_flat', 'behavior', '#059669'),
    ('submitting', 'behavior', '#059669'),
    -- Social interactions
    ('allogrooming', 'behavior', '#7c3aed'),
    ('communal_feeding', 'behavior', '#7c3aed'),
    ('huddling_together', 'behavior', '#7c3aed'),
    ('physical_contact', 'behavior', '#7c3aed'),
    -- Aggressive behaviors
    ('biting', 'behavior', '#991b1b'),
    ('threatening', 'behavior', '#991b1b'),
    ('arching_back', 'behavior', '#991b1b'),
    ('tail_up', 'behavior', '#991b1b')
) AS tags(name, category, color)
ON CONFLICT (user_id, name) DO NOTHING;
