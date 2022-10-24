GRANT ALL PRIVILEGES ON *.* TO 'user'@'%' IDENTIFIED BY 'secret';
GRANT ALL PRIVILEGES ON *.* TO 'user'@'localhost' IDENTIFIED BY 'secret';
FLUSH PRIVILEGES;

create database if not exists `notes`;

USE `notes`;

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `account_id` int(11) DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `version` int(11) NOT NULL DEFAULT '1',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0 = Incomplete, 1 = Active, 2 = Inactive',
  `deleted` int(11) NOT NULL DEFAULT '0' COMMENT '0 = False, >=1 = True',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `notes_uk` (`name`,`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
USE notes$$
DROP TRIGGER IF EXISTS notes_on_delete_trigger $$
CREATE
    TRIGGER notes_on_delete_trigger BEFORE UPDATE ON notes
    FOR EACH ROW BEGIN
	IF (NEW.deleted_at IS NULL) THEN SET NEW.deleted = 0; ELSE SET NEW.deleted = OLD.id; END IF;
    END;
$$
DELIMITER ;
