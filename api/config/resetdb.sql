-- ============================================================
-- SQL Full Reset Script: resetdb.sql
-- Project: COP4331 LAMP Stack Demo (Colors Manager)
-- Description: Drops existing tables if present, recreates schema,
--              seeds users and colors, and sets up user permissions.
-- ============================================================

-- Create and select database
CREATE DATABASE IF NOT EXISTS `ColorsAppDB`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `ColorsAppDB`;

-- Drop existing tables to ensure a clean state
DROP TABLE IF EXISTS `Colors`;
DROP TABLE IF EXISTS `Users`;

-- Create Users Table
CREATE TABLE `Users` (
    `ID` INT NOT NULL AUTO_INCREMENT,
    `FirstName` VARCHAR(50) NOT NULL DEFAULT '',
    `LastName` VARCHAR(50) NOT NULL DEFAULT '',
    `Login` VARCHAR(50) NOT NULL DEFAULT '',
    `Password` VARCHAR(50) NOT NULL DEFAULT '',
    PRIMARY KEY (`ID`),
    INDEX `idx_users_login` (`Login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Colors Table
CREATE TABLE `Colors` (
    `ID` INT NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(50) NOT NULL DEFAULT '',
    `UserID` INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`ID`),
    INDEX `idx_colors_userid` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Sample Users
INSERT INTO `Users` (`FirstName`, `LastName`, `Login`, `Password`) VALUES
('Rick', 'Leinecker', 'RickL', 'COP4331'),
('Sam', 'Hill', 'SamH', 'Test'),
('Rick', 'Leinecker', 'RickL_MD5', '5832a71366768098cceb7095efb774f2'),
('Sam', 'Hill', 'SamH_MD5', '0cbc6611f5540bd0809a388dc95a615b');

-- Seed Sample Colors for User 1 (RickL)
INSERT INTO `Colors` (`Name`, `UserID`) VALUES
('Blue', 1),
('White', 1),
('Black', 1),
('Magenta', 1),
('Yellow', 1),
('Cyan', 1),
('Salmon', 1),
('Chartreuse', 1),
('Lime', 1),
('Light Blue', 1),
('Light Gray', 1),
('Light Red', 1),
('Light Green', 1),
('Chiffon', 1),
('Fuscia', 1),
('Brown', 1),
('Beige', 1);

-- Seed Sample Colors for User 3 (RickL_MD5)
INSERT INTO `Colors` (`Name`, `UserID`) VALUES
('Blue', 3),
('White', 3),
('Black', 3),
('Gray', 3),
('Magenta', 3),
('Yellow', 3),
('Cyan', 3),
('Salmon', 3),
('Chartreuse', 3),
('Lime', 3),
('Light Blue', 3),
('Light Gray', 3),
('Light Red', 3),
('Light Green', 3),
('Chiffon', 3),
('Fuscia', 3),
('Brown', 3),
('Beige', 3);

-- Create Application Database User & Privileges
CREATE USER IF NOT EXISTS 'ColorsAppUser'@'localhost' IDENTIFIED BY 'WeLoveCOP4331!';
GRANT ALL PRIVILEGES ON `ColorsAppDB`.* TO 'ColorsAppUser'@'localhost';

CREATE USER IF NOT EXISTS 'ColorsAppUser'@'%' IDENTIFIED BY 'WeLoveCOP4331!';
GRANT ALL PRIVILEGES ON `ColorsAppDB`.* TO 'ColorsAppUser'@'%';

FLUSH PRIVILEGES;
