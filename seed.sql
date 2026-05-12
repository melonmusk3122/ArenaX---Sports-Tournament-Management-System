USE arenax;

-- Demo user (password: Demo@123)
INSERT INTO users (email, password_hash, username) VALUES
('demo@arenax.com', '$2a$10$8KzQ5x5G5x5G5x5G5x5GuXYZ1234567890abcdefghijklmnopqr', 'DemoUser');

-- Teams
INSERT INTO teams (name, description, team_color) VALUES
('Mumbai Strikers', 'Elite cricket squad from Mumbai', '#6C5CE7'),
('Delhi Dragons', 'Fierce cricket team from Delhi', '#00D2D3'),
('Chennai FC', 'Professional football club from Chennai', '#FD7272');

-- Cricket players for Mumbai Strikers (team 1)
INSERT INTO players (team_id, name, jersey_number, role) VALUES
(1, 'Rohit Sharma', 45, 'Batter'),
(1, 'Virat Kohli', 18, 'Batter'),
(1, 'KL Rahul', 1, 'Batter'),
(1, 'Shreyas Iyer', 41, 'Batter'),
(1, 'Hardik Pandya', 33, 'All-rounder'),
(1, 'Ravindra Jadeja', 8, 'All-rounder'),
(1, 'MS Dhoni', 7, 'Batter'),
(1, 'Jasprit Bumrah', 93, 'Bowler'),
(1, 'Mohammed Shami', 11, 'Bowler'),
(1, 'Yuzvendra Chahal', 3, 'Bowler'),
(1, 'Kuldeep Yadav', 23, 'Bowler');

-- Cricket players for Delhi Dragons (team 2)
INSERT INTO players (team_id, name, jersey_number, role) VALUES
(2, 'Shikhar Dhawan', 25, 'Batter'),
(2, 'Prithvi Shaw', 9, 'Batter'),
(2, 'Rishabh Pant', 17, 'Batter'),
(2, 'Axar Patel', 20, 'All-rounder'),
(2, 'Marcus Stoinis', 14, 'All-rounder'),
(2, 'Shimron Hetmyer', 26, 'Batter'),
(2, 'Lalit Yadav', 38, 'All-rounder'),
(2, 'Anrich Nortje', 32, 'Bowler'),
(2, 'Kagiso Rabada', 36, 'Bowler'),
(2, 'Amit Mishra', 10, 'Bowler'),
(2, 'Avesh Khan', 97, 'Bowler');

-- Football players for Chennai FC (team 3)
INSERT INTO players (team_id, name, jersey_number, role) VALUES
(3, 'Gurpreet Singh', 1, 'Goalkeeper'),
(3, 'Sandesh Jhingan', 5, 'Defender'),
(3, 'Pritam Kotal', 2, 'Defender'),
(3, 'Akash Mishra', 3, 'Defender'),
(3, 'Rahul Bheke', 4, 'Defender'),
(3, 'Brandon Fernandes', 14, 'Midfielder'),
(3, 'Anirudh Thapa', 6, 'Midfielder'),
(3, 'Sahal Abdul Samad', 8, 'Midfielder'),
(3, 'Lallianzuala Chhangte', 11, 'Forward'),
(3, 'Sunil Chhetri', 10, 'Forward'),
(3, 'Manvir Singh', 9, 'Forward');

-- Player stats
INSERT INTO playerStats (player_id, matches_played, runs_or_goals, wickets_or_assists) VALUES
(1, 25, 890, 0), (2, 30, 1200, 0), (3, 20, 650, 0),
(8, 22, 30, 45), (9, 18, 20, 38), (10, 15, 10, 28);

-- Audit log entries
INSERT INTO auditLog (user_id, action) VALUES
(1, 'Created team: Mumbai Strikers'),
(1, 'Created team: Delhi Dragons'),
(1, 'Added player: Rohit Sharma'),
(1, 'Created team: Chennai FC'),
(1, 'Added player: Sunil Chhetri');