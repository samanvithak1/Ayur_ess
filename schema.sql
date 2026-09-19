CREATE DATABASE IF NOT EXISTS ayuressence CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ayuressence;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('doctor', 'student') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  age TINYINT UNSIGNED NOT NULL,
  gender VARCHAR(40) NOT NULL,
  phone VARCHAR(40) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_patients_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_patients_user (user_id)
);

CREATE TABLE IF NOT EXISTS assessments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  observations TEXT NULL,
  vata_pct TINYINT UNSIGNED NOT NULL,
  pitta_pct TINYINT UNSIGNED NOT NULL,
  kapha_pct TINYINT UNSIGNED NOT NULL,
  dominant_dosha ENUM('Vata', 'Pitta', 'Kapha') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_assessments_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  CONSTRAINT fk_assessments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_assessments_user_date (user_id, created_at)
);

CREATE TABLE IF NOT EXISTS assessment_answers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  assessment_id INT UNSIGNED NOT NULL,
  question_id VARCHAR(80) NOT NULL,
  response_value TINYINT UNSIGNED NOT NULL,
  CONSTRAINT fk_answers_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
  UNIQUE KEY uq_assessment_question (assessment_id, question_id),
  CHECK (response_value BETWEEN 1 AND 5)
);
