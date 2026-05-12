CREATE DATABASE IF NOT EXISTS arenax;
USE arenax;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  team_color VARCHAR(7) DEFAULT '#6C5CE7',
  logo_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  jersey_number INT NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

CREATE TABLE matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team1_id INT NOT NULL,
  team2_id INT NOT NULL,
  sport ENUM('cricket','football') NOT NULL,
  status ENUM('upcoming','live','completed') DEFAULT 'upcoming',
  venue VARCHAR(255),
  match_date DATETIME,
  format VARCHAR(20) DEFAULT 'T20',
  result_summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team1_id) REFERENCES teams(id),
  FOREIGN KEY (team2_id) REFERENCES teams(id)
);

CREATE TABLE cricketInnings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  match_id INT NOT NULL,
  innings_number INT NOT NULL,
  batting_team_id INT NOT NULL,
  total_runs INT DEFAULT 0,
  total_wickets INT DEFAULT 0,
  total_overs DECIMAL(5,1) DEFAULT 0.0,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (batting_team_id) REFERENCES teams(id)
);

CREATE TABLE cricketBatting (
  id INT AUTO_INCREMENT PRIMARY KEY,
  innings_id INT NOT NULL,
  player_id INT NOT NULL,
  runs INT DEFAULT 0,
  balls INT DEFAULT 0,
  fours INT DEFAULT 0,
  sixes INT DEFAULT 0,
  FOREIGN KEY (innings_id) REFERENCES cricketInnings(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE TABLE cricketBowling (
  id INT AUTO_INCREMENT PRIMARY KEY,
  innings_id INT NOT NULL,
  player_id INT NOT NULL,
  balls INT DEFAULT 0,
  runs INT DEFAULT 0,
  wickets INT DEFAULT 0,
  FOREIGN KEY (innings_id) REFERENCES cricketInnings(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE TABLE footballEvents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  match_id INT NOT NULL,
  event_type ENUM('goal','yellow_card','red_card','substitution') NOT NULL,
  player_id INT NOT NULL,
  assister_id INT DEFAULT NULL,
  minute INT NOT NULL,
  team_id INT NOT NULL,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (assister_id) REFERENCES players(id),
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE matchPlayers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  match_id INT NOT NULL,
  player_id INT NOT NULL,
  team_id INT NOT NULL,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE playerStats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player_id INT NOT NULL UNIQUE,
  matches_played INT DEFAULT 0,
  runs_or_goals INT DEFAULT 0,
  wickets_or_assists INT DEFAULT 0,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TABLE auditLog (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);