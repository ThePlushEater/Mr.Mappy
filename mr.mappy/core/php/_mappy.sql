-- phpMyAdmin SQL Dump
-- version 2.11.11.3
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Feb 01, 2015 at 11:15 PM
-- Server version: 5.0.95
-- PHP Version: 5.3.3

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- Database: `jkim848`
--

-- --------------------------------------------------------

--
-- Table structure for table `mp_give`
--

CREATE TABLE IF NOT EXISTS `mp_give` (
  `id` int(11) NOT NULL auto_increment,
  `tid` int(11) NOT NULL,
  `gid` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `desc` text NOT NULL,
  `amount` float NOT NULL,
  `date` datetime NOT NULL,
  `update` datetime NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=31 ;

--
-- Dumping data for table `mp_give`
--

INSERT INTO `mp_give` (`id`, `tid`, `gid`, `name`, `desc`, `amount`, `date`, `update`) VALUES
(12, 25, 26, 'Donation', '', 30, '2015-01-21 09:28:00', '2015-01-28 23:31:43'),
(13, 26, 27, 'Donation', '', 50, '2014-11-10 09:29:00', '2015-01-28 19:51:06'),
(14, 26, 28, 'Donation', '', 36, '2015-01-26 09:30:00', '2015-01-30 20:09:22'),
(28, 50, 57, 'Donation', '', 12, '2015-01-28 18:28:00', '2015-01-29 00:28:16'),
(17, 43, 48, 'Donation', '', 12, '2015-01-28 12:40:00', '2015-01-29 00:20:37'),
(20, 48, 49, 'Donation', '', 12, '2015-01-28 12:52:00', '2015-01-29 00:19:40'),
(21, 43, 50, 'Donation', '', 24, '2015-01-28 13:02:00', '2015-01-29 00:20:01'),
(22, 43, 51, 'Donation', '', 16, '2015-01-28 14:59:00', '2015-01-29 00:20:40'),
(27, 25, 56, 'Donation', '', 40, '2015-01-28 18:19:00', '2015-01-29 00:19:25'),
(29, 50, 60, 'Donation', '', 25, '2015-01-28 18:42:00', '2015-01-29 00:52:39');

-- --------------------------------------------------------

--
-- Table structure for table `mp_item`
--

CREATE TABLE IF NOT EXISTS `mp_item` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(50) NOT NULL,
  `desc` text NOT NULL,
  `type` int(11) NOT NULL,
  `sort` int(11) NOT NULL,
  `amount` float NOT NULL,
  `lat` double NOT NULL,
  `lng` double NOT NULL,
  `date` datetime NOT NULL,
  `update` datetime NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=62 ;

--
-- Dumping data for table `mp_item`
--

INSERT INTO `mp_item` (`id`, `name`, `desc`, `type`, `sort`, `amount`, `lat`, `lng`, `date`, `update`) VALUES
(25, 'Event 1', 'Event 1 Desc', 1, 1, 70, 33.742327289845, -84.357490539551, '2015-01-20 09:30:00', '2015-01-29 00:26:17'),
(26, 'Organization 1', 'Organization 1 Desc', 2, 3, 86, 33.767874657632, -84.388561248779, '2015-01-26 09:30:00', '2015-01-29 00:26:19'),
(27, 'Donor 1', 'Donor 1 Desc', 3, 7, 50, 33.795982233117, -84.403495788574, '2015-01-26 09:30:00', '2015-01-29 00:25:47'),
(28, 'Donor 2', 'Donor 2 Desc', 3, 8, 36, 33.756315059927, -84.430274963379, '2015-01-26 09:29:00', '2015-01-28 20:59:48'),
(50, 'Organization 3', 'Organization 3 Desc', 2, 5, 37, 33.743469234152, -84.282646179199, '2015-01-28 13:01:00', '2015-01-29 00:41:19'),
(49, 'Donor 3', 'Donor 3 Desc', 3, 10, 12, 33.790275857563, -84.322299957275, '2015-01-21 12:51:00', '2015-01-29 00:26:02'),
(51, 'Donor 4', 'Donor 4 Desc', 3, 7, 16, 33.727052323291, -84.32710647583, '2015-01-28 14:58:00', '2015-01-29 00:20:48'),
(48, 'Organization 2', 'Organization 2 Desc', 2, 4, 12, 33.771156728329, -84.341869354248, '2015-01-28 10:14:00', '2015-01-29 00:26:03'),
(43, 'Event 2', 'Event 2 Desc', 1, 2, 52, 33.755744175202, -84.322986602783, '2015-01-22 19:23:00', '2015-01-29 00:26:15'),
(56, 'Donor 5', 'Donor 5 Desc', 3, 8, 40, 33.723340238515, -84.386501312256, '2015-01-28 18:18:00', '2015-01-29 00:19:28'),
(57, 'Donor 6', 'Donor 6 Desc', 3, 10, 12, 33.726909553768, -84.287796020508, '2015-01-14 18:27:00', '2015-01-29 00:42:45'),
(60, 'Donor 7', 'Donor 7 Desc', 3, 8, 25, 33.757171379887, -84.268569946289, '2015-01-28 18:42:00', '2015-01-29 00:42:18');

-- --------------------------------------------------------

--
-- Table structure for table `mp_layer`
--

CREATE TABLE IF NOT EXISTS `mp_layer` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(150) NOT NULL,
  `desc` text NOT NULL,
  `type` int(11) NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=15 ;

--
-- Dumping data for table `mp_layer`
--

INSERT INTO `mp_layer` (`id`, `name`, `desc`, `type`) VALUES
(1, 'Event Layer 1', 'Event Layer 1 Desc', 1),
(2, 'Event Layer 2', 'Event Layer 2 Desc', 1),
(3, 'Organization Layer 1', 'Organization 1 Desc', 2),
(4, 'Organization Layer 2', 'Organization 2 Desc', 2),
(5, 'Organization Layer 3', 'Organization 3 Desc', 2),
(7, 'Donor Layer 1', 'Donor 1 Desc', 3),
(8, 'Donor Layer 2', 'Donor 2 Desc', 3),
(10, 'Donor Layer 3', 'Donor 3 Desc', 3);

-- --------------------------------------------------------

--
-- Table structure for table `mp_picture`
--

CREATE TABLE IF NOT EXISTS `mp_picture` (
  `id` int(11) NOT NULL auto_increment,
  `pid` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `url` varchar(100) NOT NULL,
  `date` datetime NOT NULL,
  `update` datetime NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=32 ;

--
-- Dumping data for table `mp_picture`
--

INSERT INTO `mp_picture` (`id`, `pid`, `name`, `url`, `date`, `update`) VALUES
(28, 25, 'Event 1 Picture 2', 'TestPicture1.JPG', '2015-01-26 19:53:00', '2015-02-01 21:47:02'),
(29, 25, 'Event 1 Picture 1', 'TestPicture2.JPG', '2015-01-20 19:55:00', '2015-02-01 21:47:05'),
(30, 43, 'Event 2 Picture 1', 'TestPicture3.JPG', '2015-01-28 12:55:00', '2015-02-01 21:47:24');
