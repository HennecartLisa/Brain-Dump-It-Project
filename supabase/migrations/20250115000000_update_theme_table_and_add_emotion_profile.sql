DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'emotion') THEN
        ALTER TABLE profiles ADD COLUMN emotion VARCHAR(50) NULL;
    END IF;
END $$;

DELETE FROM theme;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'theme' AND column_name = 'palet_colour_name') THEN
        ALTER TABLE theme ADD COLUMN palet_colour_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'theme' AND column_name = 'palet_colour_description') THEN
        ALTER TABLE theme ADD COLUMN palet_colour_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'theme' AND column_name = 'typography_name') THEN
        ALTER TABLE theme ADD COLUMN typography_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'theme' AND column_name = 'typography_description') THEN
        ALTER TABLE theme ADD COLUMN typography_description TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'theme' AND column_name = 'typography_1') THEN
        ALTER TABLE theme RENAME COLUMN typography_1 TO family_font_1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'theme' AND column_name = 'typography_2') THEN
        ALTER TABLE theme RENAME COLUMN typography_2 TO family_font_2;
    END IF;
END $$;

INSERT INTO theme (
    palet_colour_name, 
    palet_colour_description, 
    typography_name, 
    typography_description,
    family_font_1, 
    family_font_2, 
    colour_1, 
    colour_2, 
    colour_3, 
    colour_4, 
    colour_5, 
    colour_6, 
    colour_7
) VALUES 
(
    'Default Colors',
    'Full color palette with vibrant and accessible colors',
    'Default',
    'Standard system font with good readability',
    'system-ui, -apple-system, sans-serif',
    'system-ui, -apple-system, sans-serif',
    '#F0F0FA',
    '#646cff',
    '#61dafb',
    '#4ade80',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6'
),
(
    'High Contrast',
    'Black, white, and shades of gray for maximum contrast',
    'Clear Sans',
    'Clean, highly legible sans-serif font',
    'Arial, Helvetica, sans-serif',
    'Arial, Helvetica, sans-serif',
    '#000000',
    '#ffffff',
    '#666666',
    '#333333',
    '#999999',
    '#cccccc',
    '#444444'
),
(
    'Black and White',
    'Classic black and white theme for minimal distraction',
    'Open Sans',
    'Open Sans font family for clean typography',
    'Open Sans',
    'Open Sans',
    '#20102C',
    '#20102C',
    '#FEFDFB',
    '#FEFDFB',
    '#FEFDFB',
    '#FEFDFB',
    '#FEFDFB'
),
(
    'Contrast',
    'High contrast theme with blue accents for better visibility',
    'Open Sans',
    'Open Sans font family for clean typography',
    'Open Sans',
    'Open Sans',
    '#0432DD',
    '#20102C',
    '#ECFBFF',
    '#F7FFC0',
    '#E0E7FF',
    '#FFEDF2',
    '#FEFDFB'
),
(
    'Dyslexic Friendly',
    'Color scheme designed for users with dyslexia',
    'OpenDyslexic',
    'Designed for dyslexic readers with improved character recognition',
    'OpenDyslexic, monospace',
    'OpenDyslexic, monospace',
    '#2E3440',
    '#3B4252',
    '#D8DEE9',
    '#E5E9F0',
    '#ECEFF4',
    '#8FBCBB',
    '#88C0D0'
);

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comfort_mode' AND column_name = 'typography_1') THEN
        ALTER TABLE comfort_mode RENAME COLUMN typography_1 TO family_font_1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comfort_mode' AND column_name = 'typography_2') THEN
        ALTER TABLE comfort_mode RENAME COLUMN typography_2 TO family_font_2;
    END IF;
END $$;
