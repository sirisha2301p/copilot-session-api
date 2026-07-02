-- Manual migration: spatial column + index + check constraints.
-- Run AFTER Sequelize has created the tables (dev: synchronize; prod: migrations).
-- Sequelize cannot model SQL Server's `geography` type, so this is applied
-- separately via sqlcmd or your migration pipeline.

-- 1. Add the geography column used for radius search.
IF COL_LENGTH('dbo.Properties', 'location') IS NULL
    ALTER TABLE dbo.Properties ADD location geography NULL;
GO

-- 2. Backfill from existing lat/lng (safe to re-run).
UPDATE dbo.Properties
SET location = geography::Point(latitude, longitude, 4326)
WHERE location IS NULL;
GO

-- 3. Spatial index (geography requires the AUTO grid).
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_property_location')
    CREATE SPATIAL INDEX idx_property_location
        ON dbo.Properties(location) USING GEOGRAPHY_AUTO_GRID;
GO

-- 4. Enforce review rating range 1..5.
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_Review_rating')
    ALTER TABLE dbo.Reviews ADD CONSTRAINT CK_Review_rating CHECK (rating BETWEEN 1 AND 5);
GO
