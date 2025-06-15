
-- Move all general category tags to behavior category
UPDATE log_tag_suggestions 
SET category = 'behavior' 
WHERE category = 'general';

-- Delete the general category from log_tag_categories
DELETE FROM log_tag_categories 
WHERE name = 'general';

-- Delete all non-default categories (custom categories)
DELETE FROM log_tag_categories 
WHERE is_default = false;
