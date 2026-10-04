USE ContactsAppDB;

SET @fav_column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Contacts'
      AND COLUMN_NAME = 'IsFavorite'
);

SET @fav_upgrade = IF(
    @fav_column_exists = 0,
    'ALTER TABLE Contacts ADD COLUMN IsFavorite TINYINT(1) NOT NULL DEFAULT 0 AFTER Category',
    'SELECT 1'
);

PREPARE fav_upgrade_statement FROM @fav_upgrade;
EXECUTE fav_upgrade_statement;
DEALLOCATE PREPARE fav_upgrade_statement;