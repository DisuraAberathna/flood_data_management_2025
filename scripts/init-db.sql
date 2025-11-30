-- Database initialization script for Flood Data Management
-- Run this script to create the database and table manually if needed

CREATE DATABASE IF NOT EXISTS sql12809996;

USE sql12809996;

CREATE TABLE IF NOT EXISTS isolated_people (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  age INT NOT NULL,
  number_of_members INT NOT NULL,
  address TEXT NOT NULL,
  house_state VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT NULL,
  updated_at DATETIME DEFAULT NULL
);

