CREATE DATABASE IF NOT EXISTS ContactsAppDB
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE ContactsAppDB;

CREATE TABLE IF NOT EXISTS Users (
    ID INT NOT NULL AUTO_INCREMENT,
    FirstName VARCHAR(50) NOT NULL DEFAULT '',
    LastName VARCHAR(50) NOT NULL DEFAULT '',
    Login VARCHAR(50) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    IsActive TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (ID),
    UNIQUE KEY uq_users_login (Login)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Contacts (
    ID INT NOT NULL AUTO_INCREMENT,
    FirstName VARCHAR(100) NOT NULL DEFAULT '',
    LastName VARCHAR(100) NOT NULL DEFAULT '',
    Email VARCHAR(254) NOT NULL DEFAULT '',
    PhoneNumber VARCHAR(40) NOT NULL DEFAULT '',
    Category VARCHAR(100) NOT NULL DEFAULT '',
    UserID INT NOT NULL,
    PRIMARY KEY (ID),
    KEY idx_contacts_user_first_name (UserID, FirstName),
    CONSTRAINT fk_contacts_user FOREIGN KEY (UserID) REFERENCES Users (ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Also upgrade an existing Contacts table when this setup script is rerun.
SET @category_column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Contacts'
      AND COLUMN_NAME = 'Category'
);
SET @category_upgrade = IF(
    @category_column_exists = 0,
    CONCAT('ALTER TABLE Contacts ADD COLUMN Category VARCHAR(100) NOT NULL DEFAULT ', QUOTE(''), ' AFTER PhoneNumber'),
    'SELECT 1'
);
PREPARE category_upgrade_statement FROM @category_upgrade;
EXECUTE category_upgrade_statement;
DEALLOCATE PREPARE category_upgrade_statement;
