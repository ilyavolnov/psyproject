-- Add slug column to courses table
ALTER TABLE courses ADD COLUMN slug TEXT;

-- Update existing courses with generated slugs
UPDATE courses SET slug = 'marafon-po-rpp' WHERE id = 4;
