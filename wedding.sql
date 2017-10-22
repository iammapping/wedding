# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 127.0.0.1 (MySQL 5.5.38-0ubuntu0.12.04.1)
# Database: my_wedding
# Generation Time: 2017-10-22 12:39:44 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table checkin_status
# ------------------------------------------------------------

DROP TABLE IF EXISTS `checkin_status`;

CREATE TABLE `checkin_status` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `accountID` int(10) unsigned NOT NULL,
  `status` enum('coming','absent','present') NOT NULL DEFAULT 'absent',
  `createTime` datetime NOT NULL,
  `lastUpdateTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `accountID` (`accountID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



# Dump of table feeds
# ------------------------------------------------------------

DROP TABLE IF EXISTS `feeds`;

CREATE TABLE `feeds` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `accountID` int(10) unsigned NOT NULL,
  `nickName` varchar(50) DEFAULT NULL,
  `headImgUrl` varchar(300) DEFAULT NULL,
  `msgType` tinyint(4) DEFAULT NULL,
  `msg` text,
  `visible` tinyint(4) NOT NULL DEFAULT '1',
  `createTime` datetime NOT NULL,
  `lastUpdateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `accountID` (`accountID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



# Dump of table wx_accounts
# ------------------------------------------------------------

DROP TABLE IF EXISTS `wx_accounts`;

CREATE TABLE `wx_accounts` (
  `accountID` int(11) unsigned NOT NULL,
  `openID` varchar(50) NOT NULL DEFAULT '',
  `nickName` varchar(50) DEFAULT NULL,
  `sex` tinyint(4) DEFAULT '0',
  `province` varchar(20) DEFAULT NULL,
  `city` varchar(20) DEFAULT NULL,
  `country` varchar(20) DEFAULT NULL,
  `headImgUrl` varchar(300) DEFAULT NULL,
  `privilege` text,
  `accessToken` varchar(500) NOT NULL DEFAULT '',
  `refreshToken` varchar(500) NOT NULL DEFAULT '',
  `expireIn` int(11) NOT NULL DEFAULT '7200',
  `tokenTime` datetime DEFAULT NULL,
  `createTime` datetime NOT NULL,
  `lastUpdateTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  `lastCheckinStatus` enum('coming','absent','present') DEFAULT NULL,
  PRIMARY KEY (`accountID`),
  UNIQUE KEY `openID` (`openID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
