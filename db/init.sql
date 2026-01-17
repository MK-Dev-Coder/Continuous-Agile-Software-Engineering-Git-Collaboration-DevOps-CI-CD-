CREATE DATABASE IF NOT EXISTS student_directory;
USE student_directory;
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);
INSERT INTO students (name) VALUES ('Alice'), ('Bob'), ('Charlie');