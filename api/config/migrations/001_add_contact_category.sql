-- Safe to rerun against the existing ContactsAppDB before deploying the API.
USE ContactsAppDB;

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
