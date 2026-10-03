ALTER TABLE `Users`
    ADD COLUMN `Role`     ENUM('user','admin') NOT NULL DEFAULT 'user',
    ADD COLUMN `IsActive` TINYINT(1)           NOT NULL DEFAULT 1;

-- Seed the default admin exactly once.
INSERT INTO `Users` (`FirstName`, `LastName`, `Login`, `Password`, `Role`, `IsActive`)
SELECT 'Application', 'Administrator', 'root', '$2y$12$MZ77PC2ZzGn7GOXPXcovxuU3zqsSItUMPR9qBbIXHE972IgTk5L9e', 'admin', 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `Users` WHERE `Login` = 'root');
