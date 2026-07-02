-- Full SQL Server schema for tolet-backend.
-- Creates all 13 application tables in FK-dependency order, plus the
-- spatial column/index and check constraint that Sequelize cannot model
-- (see migrations/manual-geography.sql for the incremental version).
-- Safe to re-run: each object is guarded with an existence check.

SET NOCOUNT ON;
GO

---------------------------------------------------------------------------
-- 1. Users
---------------------------------------------------------------------------
IF OBJECT_ID('dbo.Users', 'U') IS NULL
CREATE TABLE dbo.Users (
    id                  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    email               NVARCHAR(255)    NOT NULL,
    passwordHash        NVARCHAR(255)    NOT NULL,
    fullName            NVARCHAR(255)    NOT NULL,
    phone               NVARCHAR(255)    NULL,
    role                NVARCHAR(20)     NOT NULL DEFAULT 'SEEKER',
    kycStatus           NVARCHAR(20)     NOT NULL DEFAULT 'NONE',
    hashedRefreshToken  NVARCHAR(MAX)    NULL,
    isActive            BIT              NOT NULL DEFAULT 1,
    createdAt           DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updatedAt           DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Users PRIMARY KEY (id),
    CONSTRAINT UQ_Users_Email UNIQUE (email),
    CONSTRAINT CK_Users_Role CHECK (role IN ('SEEKER', 'OWNER', 'AGENT', 'ADMIN')),
    CONSTRAINT CK_Users_KycStatus CHECK (kycStatus IN ('NONE', 'PENDING', 'VERIFIED', 'REJECTED'))
);
GO

---------------------------------------------------------------------------
-- 2. OwnerProfiles
---------------------------------------------------------------------------
IF OBJECT_ID('dbo.OwnerProfiles', 'U') IS NULL
CREATE TABLE dbo.OwnerProfiles (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    userId          UNIQUEIDENTIFIER NOT NULL,
    businessName    NVARCHAR(255)    NULL,
    createdAt       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updatedAt       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_OwnerProfiles PRIMARY KEY (id),
    CONSTRAINT UQ_OwnerProfiles_UserId UNIQUE (userId),
    CONSTRAINT FK_OwnerProfiles_UserId FOREIGN KEY (userId) REFERENCES dbo.Users (id) ON DELETE CASCADE
);
GO

---------------------------------------------------------------------------
-- 3. AgentProfiles
---------------------------------------------------------------------------
IF OBJECT_ID('dbo.AgentProfiles', 'U') IS NULL
CREATE TABLE dbo.AgentProfiles (
    id                      UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    userId                  UNIQUEIDENTIFIER NOT NULL,
    isApproved              BIT              NOT NULL DEFAULT 0,
    isAvailable             BIT              NOT NULL DEFAULT 1,
    maxActiveAssignments    INT              NOT NULL DEFAULT 5,
    createdAt               DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updatedAt               DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_AgentProfiles PRIMARY KEY (id),
    CONSTRAINT UQ_AgentProfiles_UserId UNIQUE (userId),
    CONSTRAINT FK_AgentProfiles_UserId FOREIGN KEY (userId) REFERENCES dbo.Users (id) ON DELETE CASCADE
);
GO

---------------------------------------------------------------------------
-- 4. AgentCoverageCities
---------------------------------------------------------------------------
IF OBJECT_ID('dbo.AgentCoverageCities', 'U') IS NULL
CREATE TABLE dbo.AgentCoverageCities (
    id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    agentId     UNIQUEIDENTIFIER NOT NULL,
    city        NVARCHAR(255)    NOT NULL,
    createdAt   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updatedAt   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_AgentCoverageCities PRIMARY KEY (id),
    CONSTRAINT UQ_AgentCoverageCities_AgentId_City UNIQUE (agentId, city),
    CONSTRAINT FK_AgentCoverageCities_AgentId FOREIGN KEY (agentId) REFERENCES dbo.AgentProfiles (id) ON DELETE CASCADE
);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AgentCoverageCities_City')
    CREATE INDEX IX_AgentCoverageCities_City ON dbo.AgentCoverageCities (city);
GO

---------------------------------------------------------------------------
-- 5. KycVerifications
---------------------------------------------------------------------------
IF OBJECT_ID('dbo.KycVerifications', 'U') IS NULL
CREATE TABLE dbo.KycVerifications (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    userId          UNIQUEIDENTIFIER NOT NULL,
    provider        NVARCHAR(255)    NOT NULL,
    providerRef     NVARCHAR(255)    NOT NULL,
    status          NVARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    documentType    NVARCHAR(255)    NULL,
    verifiedAt      DATETIME2        NULL,
    createdAt       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updatedAt       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_KycVerifications PRIMARY KEY (id),
    CONSTRAINT FK_KycVerifications_UserId FOREIGN KEY (userId) REFERENCES dbo.Users (id) ON DELETE CASCADE,
    CONSTRAINT CK_KycVerifications_Status CHECK (status IN ('NONE', 'PENDING', 'VERIFIED', 'REJECTED'))
);
GO

---------------------------------------------------------------------------
-- 6. Properties
---------------------------------------------------------------------------
IF OBJECT_ID('dbo.Properties', 'U') IS NULL
CREATE TABLE dbo.Properties (
    id                      UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    ownerId                 UNIQUEIDENTIFIER NOT NULL,
    title                   NVARCHAR(255)    NOT NULL,
    description             NVARCHAR(MAX)    NOT NULL,
    type                    NVARCHAR(20)     NOT NULL,
    rentAmount              DECIMAL(12,2)    NOT NULL,
    currency                NVARCHAR(10)     NOT NULL DEFAULT 'INR',
    depositAmount           DECIMAL(12,2)    NULL,
    city                    NVARCHAR(255)    NOT NULL,
    addressLine             NVARCHAR(255)    NOT NULL,
    latitude                FLOAT            NOT NULL,
    longitude               FLOAT            NOT NULL,
    amenities               NVARCHAR(MAX)    NULL,
    availabilityStatus      NVARCHAR(20)     NOT NULL DEFAULT 'AVAILABLE',
    isApprovedByAdmin       BIT              NOT NULL DEFAULT 0,
    createdAt               DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updatedAt               DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Properties PRIMARY KEY (id),
    CONSTRAINT FK_Properties_OwnerId FOREIGN KEY (ownerId) REFERENCES dbo.Users (id) ON DELETE CASCADE,
    CONSTRAINT CK_Properties_Type CHECK (type IN ('ROOM', 'HOUSE', 'APARTMENT', 'PG')),
    CONSTRAINT CK_Properties_AvailabilityStatus CHECK (availabilityStatus IN ('AVAILABLE', 'RESERVED', 'UNAVAILABLE'))
);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Properties_City')
    CREATE INDEX IX_Properties_City ON dbo.Properties (city);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Properties_AvailabilityStatus')
    CREATE INDEX IX_Properties_AvailabilityStatus ON dbo.Properties (availabilityStatus);
GO

-- geography column for radius search (Sequelize cannot model this type)
IF COL_LENGTH('dbo.Properties', 'location') IS NULL
    ALTER TABLE dbo.Properties ADD location geography NULL;
GO

UPDATE dbo.Properties
SET location = geography::Point(latitude, longitude, 4326)
WHERE location IS NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_property_location')
    CREATE SPATIAL INDEX idx_property_location
        ON dbo.Properties (location) USING GEOGRAPHY_AUTO_GRID;
GO

---------------------------------------------------------------------------
-- 7. PropertyMedia
---------------------------------------------------------------------------
IF OBJECT_ID('dbo.PropertyMedia', 'U') IS NULL
CREATE TABLE dbo.PropertyMedia (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    propertyId      UNIQUEIDENTIFIER NOT NULL,
    type            NVARCHAR(20)     NOT NULL,
    blobKey         NVARCHAR(255)    NOT NULL,
    thumbnailKey    NVARCHAR(255)    NULL,
    sortOrder       INT              NOT NULL DEFAULT 0,
    createdAt       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updatedAt       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_PropertyMedia PRIMARY KEY (id),
    CONSTRAINT FK_PropertyMedia_PropertyId FOREIGN KEY (propertyId) REFERENCES dbo.Properties (id) ON DELETE CASCADE,
    CONSTRAINT CK_PropertyMedia_Type CHECK (type IN ('IMAGE', 'VIDEO'))
);
GO

---------------------------------------------------------------------------
-- 8. Inquiries
---------------------------------------------------------------------------
IF OBJECT_ID('dbo.Inquiries', 'U') IS NULL
CREATE TABLE dbo.Inquiries (
    id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    propertyId  UNIQUEIDENTIFIER NOT NULL,
    seekerId    UNIQUEIDENTIFIER NOT NULL,
    message     NVARCHAR(MAX)    NOT NULL,
    status      NVARCHAR(20)     NOT NULL DEFAULT 'OPEN',
    createdAt   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updatedAt   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Inquiries PRIMARY KEY (id),
    CONSTRAINT FK_Inquiries_PropertyId FOREIGN KEY (propertyId) REFERENCES dbo.Properties (id) ON DELETE CASCADE,
    CONSTRAINT FK_Inquiries_SeekerId FOREIGN KEY (seekerId) REFERENCES dbo.Users (id) ON DELETE NO ACTION,
    CONSTRAINT CK_Inquiries_Status CHECK (status IN ('OPEN', 'RESPONDED', 'CLOSED'))
);
GO

---------------------------------------------------------------------------
-- 9. Conversations
---------------------------------------------------------------------------
IF OBJECT_ID('dbo.Conversations', 'U') IS NULL
CREATE TABLE dbo.Conversations (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    participantA    UNIQUEIDENTIFIER NOT NULL,
    participantB    UNIQUEIDENTIFIER NOT NULL,
    lastMessageAt   DATETIME2        NULL,
    createdAt       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updatedAt       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Conversations PRIMARY KEY (id),
    CONSTRAINT UQ_Conversations_ParticipantA_ParticipantB UNIQUE (participantA, participantB),
    CONSTRAINT FK_Conversations_ParticipantA FOREIGN KEY (participantA) REFERENCES dbo.Users (id) ON DELETE NO ACTION,
    CONSTRAINT FK_Conversations_ParticipantB FOREIGN KEY (participantB) REFERENCES dbo.Users (id) ON DELETE NO ACTION
);
GO

---------------------------------------------------------------------------
-- 10. Messages
---------------------------------------------------------------------------
IF OBJECT_ID('dbo.Messages', 'U') IS NULL
CREATE TABLE dbo.Messages (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    conversationId  UNIQUEIDENTIFIER NOT NULL,
    senderId        UNIQUEIDENTIFIER NOT NULL,
    body            NVARCHAR(MAX)    NOT NULL,
    readAt          DATETIME2        NULL,
    createdAt       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updatedAt       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Messages PRIMARY KEY (id),
    CONSTRAINT FK_Messages_ConversationId FOREIGN KEY (conversationId) REFERENCES dbo.Conversations (id) ON DELETE CASCADE,
    CONSTRAINT FK_Messages_SenderId FOREIGN KEY (senderId) REFERENCES dbo.Users (id) ON DELETE NO ACTION
);
GO

---------------------------------------------------------------------------
-- 11. AgentAssignments
---------------------------------------------------------------------------
IF OBJECT_ID('dbo.AgentAssignments', 'U') IS NULL
CREATE TABLE dbo.AgentAssignments (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    customerId      UNIQUEIDENTIFIER NOT NULL,
    agentId         UNIQUEIDENTIFIER NULL,
    requestedCity   NVARCHAR(255)    NOT NULL,
    requirements    NVARCHAR(MAX)    NULL,
    status          NVARCHAR(20)     NOT NULL DEFAULT 'REQUESTED',
    assignedAt      DATETIME2        NULL,
    closedAt        DATETIME2        NULL,
    createdAt       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updatedAt       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_AgentAssignments PRIMARY KEY (id),
    CONSTRAINT FK_AgentAssignments_CustomerId FOREIGN KEY (customerId) REFERENCES dbo.Users (id) ON DELETE NO ACTION,
    CONSTRAINT FK_AgentAssignments_AgentId FOREIGN KEY (agentId) REFERENCES dbo.Users (id) ON DELETE NO ACTION,
    CONSTRAINT CK_AgentAssignments_Status CHECK (status IN ('REQUESTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AgentAssignments_AgentId')
    CREATE INDEX IX_AgentAssignments_AgentId ON dbo.AgentAssignments (agentId);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AgentAssignments_Status')
    CREATE INDEX IX_AgentAssignments_Status ON dbo.AgentAssignments (status);
GO

---------------------------------------------------------------------------
-- 12. Reviews
---------------------------------------------------------------------------
IF OBJECT_ID('dbo.Reviews', 'U') IS NULL
CREATE TABLE dbo.Reviews (
    id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    propertyId  UNIQUEIDENTIFIER NOT NULL,
    authorId    UNIQUEIDENTIFIER NOT NULL,
    rating      INT              NOT NULL,
    comment     NVARCHAR(MAX)    NULL,
    createdAt   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updatedAt   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Reviews PRIMARY KEY (id),
    CONSTRAINT FK_Reviews_PropertyId FOREIGN KEY (propertyId) REFERENCES dbo.Properties (id) ON DELETE CASCADE,
    CONSTRAINT FK_Reviews_AuthorId FOREIGN KEY (authorId) REFERENCES dbo.Users (id) ON DELETE NO ACTION,
    CONSTRAINT CK_Review_rating CHECK (rating BETWEEN 1 AND 5)
);
GO

---------------------------------------------------------------------------
-- 13. Notifications
---------------------------------------------------------------------------
IF OBJECT_ID('dbo.Notifications', 'U') IS NULL
CREATE TABLE dbo.Notifications (
    id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    userId      UNIQUEIDENTIFIER NOT NULL,
    type        NVARCHAR(255)    NOT NULL,
    payload     NVARCHAR(MAX)    NULL,
    readAt      DATETIME2        NULL,
    createdAt   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updatedAt   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Notifications PRIMARY KEY (id),
    CONSTRAINT FK_Notifications_UserId FOREIGN KEY (userId) REFERENCES dbo.Users (id) ON DELETE CASCADE
);
GO
