-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Nov 15, 2026 at 06:59 PM
-- Server version: 10.11.16-MariaDB
-- PHP Version: 8.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `showroomdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `optional_number` varchar(15) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `user_type` enum('customer','owner') NOT NULL DEFAULT 'customer'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `first_name`, `last_name`, `email`, `phone`, `optional_number`, `password_hash`, `user_type`) VALUES
(1, 'Elon', 'Musk', 'owner@showroom.com', 'owner@showroom.', NULL, '$2y$12$OkSAYn8oe4GzDL/mMQ1ige6bx9iMRD.JZM0XjG2.WlDNJfR7dA/wa', 'owner'),
(2, 'donald', 'trump', 'customer1@showroom.com', '+94 123 123 112', NULL, '$2y$12$W4vudhaZkPzwCIzl2qFMMe/1J0jR0tJgorMME1NQjhiF7XAg2Dreq', 'customer');

-- --------------------------------------------------------

--
-- Table structure for table `reservations`
--

CREATE TABLE `reservations` (
  `reservation_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `veh_id` int(11) NOT NULL,
  `Preffered_date` date NOT NULL,
  `preffered_time` time NOT NULL,
  `add_Message` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reservations`
--

INSERT INTO `reservations` (`reservation_id`, `customer_id`, `veh_id`, `Preffered_date`, `preffered_time`, `add_Message`) VALUES
(1, 2, 5, '2025-12-23', '12:23:00', 'qwwqeqwe');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `veh_id` int(11) NOT NULL,
  `make` varchar(50) NOT NULL,
  `brand` varchar(50) NOT NULL,
  `model` varchar(50) NOT NULL,
  `year` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `color` varchar(30) NOT NULL,
  `veh_type` varchar(30) NOT NULL,
  `engine` varchar(50) NOT NULL,
  `image` varchar(255) NOT NULL DEFAULT 'statics/image/backgroundimage-car.jpg',
  `status` enum('In Stock','Sold') NOT NULL DEFAULT 'In Stock'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`veh_id`, `make`, `brand`, `model`, `year`, `price`, `color`, `veh_type`, `engine`, `image`, `status`) VALUES
(2, 'lighning', 'lighning', 'macqueen camero', 2015, 1000.00, 'Unspecified', 'Luxury', 'v12', 'api/uploads/fc0b4f68b11a25fc04f33425436ce2f1.jpg', 'Sold'),
(4, 'mater', 'mater', 'benz', 2000, 15000.00, 'Unspecified', 'Luxury', 'v12', 'api/uploads/b3e4838409fe91b5f35419c4d4699beb.jpg', 'In Stock'),
(5, 'frencesco', 'frencesco', 'bernouli BMW', 2020, 2000.00, 'Unspecified', 'Luxury', 'v8', 'api/uploads/f13a287b9df6e56a2ce3a097724cc4ea.webp', 'In Stock'),
(6, 'storm', 'storm', 'benz', 2025, 10000.00, 'Unspecified', 'Luxury', 'v12', 'api/uploads/aec640b33cdd16999ed8de8c5b57f7d2.jpg', 'Sold'),
(7, 'FIN', 'FIN', 'macmissile bentley', 2015, 10000.00, 'Unspecified', 'Luxury', 'v12', 'api/uploads/fa025f5dfd57896e1f05f4ce1095af58.jpg', 'In Stock');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`reservation_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `veh_id` (`veh_id`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`veh_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `reservation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `veh_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`veh_id`) REFERENCES `vehicles` (`veh_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
