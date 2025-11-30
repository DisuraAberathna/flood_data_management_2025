-- Database initialization script for Flood Data Management
-- Run this script to create the database and table manually if needed

CREATE DATABASE IF NOT EXISTS sql12809996;

USE sql12809996;

CREATE TABLE IF NOT EXISTS isolated_people(
    id INT AUTO_INCREMENT PRIMARY KEY,
    NAME VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    nic VARCHAR(50) DEFAULT NULL,
    number_of_members INT NOT NULL,
    address TEXT NOT NULL,
    house_state VARCHAR(100) NOT NULL,
    location VARCHAR(255) DEFAULT NULL,
    lost_items LONGTEXT DEFAULT NULL,
    family_members LONGTEXT DEFAULT NULL,
    created_at DATETIME DEFAULT NULL,
    updated_at DATETIME DEFAULT NULL
);

