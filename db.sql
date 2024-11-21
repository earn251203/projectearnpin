-- สร้าง Database
CREATE DATABASE IF NOT EXISTS soical_media;
USE soical_media;

-- สร้าง Table users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  profile_image VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
