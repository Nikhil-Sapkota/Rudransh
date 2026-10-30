-- ============================================================
--  Rudransh Portfolio — MySQL Database Schema
-- ============================================================
-- Run this file once to set up the database.
-- CHANGE THE PASSWORD immediately after first login via admin panel.
-- ============================================================

-- DROP DATABASE IF EXISTS rudransh_portfolio;
CREATE DATABASE IF NOT EXISTS rudransh_portfolio
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE rudransh_portfolio;
-- ------------------------------------------------------------
-- Admin Users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(60)  NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,  -- bcrypt hashed
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
);

-- Default admin (password: admin123 — bcrypt hash)
INSERT INTO admin_users (username, password) VALUES
('admin', '$2a$12$jsmvnjSxCydqlPzmY2YHMedAWR2vN3aVDbTJaJ9pdndkAWq10vruC');

-- ------------------------------------------------------------
-- Site Content (key-value editable text)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_content (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  `key`      VARCHAR(100) NOT NULL UNIQUE,
  `value`    LONGTEXT     NOT NULL,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO site_content (`key`, `value`) VALUES
('hero_tagline',   'Building things for the web — and beyond.'),
('hero_intro',     'I''m Nikhil Sapkota, a software developer who loves crafting clean, performant digital experiences. I work across the full stack, with a focus on thoughtful design, scalable architecture, and meaningful code.'),
('about_detail',   'When I''m not writing code, I''m probably reading about distributed systems, contributing to open-source, or mentoring aspiring developers in my community. I believe great software is equal parts engineering and empathy.'),
('contact_email',  'nikhil@example.com'),
('contact_phone',  '+977 9800000000'),
('contact_location','Nepal'),
('twitter_url',    'https://x.com/NikhilSapkota50'),
('github_url',     'https://github.com/Nikhil-Sapkota'),
('linkedin_url',   'https://www.linkedin.com/in/nikhil-sapkota-2a71112aa/');

-- ------------------------------------------------------------
-- Work Experience
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS experiences (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  role        VARCHAR(120) NOT NULL,
  company     VARCHAR(120) NOT NULL,
  duration    VARCHAR(80)  NOT NULL,
  description TEXT         NOT NULL,
  sort_order  INT          DEFAULT 0,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO experiences (role, company, duration, description, sort_order) VALUES
('Senior Software Engineer',   'TechCorp Solutions',   '2023 — Present',   'Led development of microservices architecture serving 2M+ users. Architected real-time data pipelines and mentored a team of 5 engineers.', 1),
('Full Stack Developer',       'InnovateLabs',         '2021 — 2023',       'Built end-to-end web applications using React, Node.js, and PostgreSQL. Reduced page load times by 40% through performance optimizations.', 2),
('Software Developer Intern',  'StartupXYZ',           '2020 — 2021',       'Developed REST APIs and contributed to mobile-first UI components. Participated in Agile sprints and code reviews.', 3);

-- ------------------------------------------------------------
-- Education
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS education (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  degree      VARCHAR(150) NOT NULL,
  institution VARCHAR(150) NOT NULL,
  year        VARCHAR(30)  NOT NULL,
  description TEXT,
  sort_order  INT          DEFAULT 0,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO education (degree, institution, year, description, sort_order) VALUES
('Diploma in Information Technology',   'Mahalaxmi Polytechnic Institute, Lalitpur (CTEVT)',   '2021 — 2025',   'Secured First Division marks.', 1);

-- ------------------------------------------------------------
-- Skills / Tools
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skills (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(80)  NOT NULL,
  category   VARCHAR(60)  DEFAULT 'general',
  sort_order INT          DEFAULT 0,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO skills (name, category, sort_order) VALUES
('JavaScript',    'language', 1),
('TypeScript',    'language', 2),
('Python',        'language', 3),
('PHP',           'language', 4),
('C++',           'language', 5),
('React',         'framework', 6),
('Node.js',       'framework', 7),
('Next.js',       'framework', 8),
('MySQL',         'database', 9),
('PostgreSQL',    'database', 10),
('MongoDB',       'database', 11),
('Redis',         'database', 12),
('Docker',        'devops', 13),
('Git',           'devops', 14),
('Linux',         'devops', 15),
('AWS',           'devops', 16),
('REST APIs',     'concept', 17),
('GraphQL',       'concept', 18),
('Figma',         'design', 19),
('VS Code',       'tool', 20);

-- ------------------------------------------------------------
-- Projects
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  description TEXT         NOT NULL,
  tech_stack  VARCHAR(255) NOT NULL,
  github_url  VARCHAR(500),
  live_url    VARCHAR(500),
  featured    TINYINT(1)   DEFAULT 0,
  sort_order  INT          DEFAULT 0,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO projects (name, description, tech_stack, github_url, live_url, featured, sort_order) VALUES
('Nexus API Gateway',     'A high-performance API gateway with rate limiting, caching, and real-time monitoring built for microservices architectures.',       'Node.js, Redis, PostgreSQL, Docker',     'https://github.com/Nikhil-Sapkota/nexus',       '',                              1, 1),
('Codefolio',             'An open-source developer portfolio generator with automated GitHub stats, blog integration, and zero-config deployment.',          'React, Next.js, GitHub API, Vercel',     'https://github.com/Nikhil-Sapkota/codefolio',   'https://codefolio.dev',         1, 2),
('QueryMind',             'An AI-powered SQL query assistant that converts natural language to optimized SQL queries with schema-aware context.',              'Python, FastAPI, OpenAI API, SQLite',    'https://github.com/Nikhil-Sapkota/querymind',   '',                              1, 3),
('ThreadOS',              'A minimal Unix-like shell written in C++ supporting piping, redirection, background jobs, and custom built-in commands.',          'C++, POSIX API',                         'https://github.com/Nikhil-Sapkota/threadOS',    '',                              0, 4),
('RealBoard',             'A real-time collaborative whiteboard with infinite canvas, vector drawing, and multi-user sync via WebSockets.',                   'React, Canvas API, Socket.io, Node.js',  'https://github.com/Nikhil-Sapkota/realboard',   'https://realboard.app',         0, 5);

-- ------------------------------------------------------------
-- Leadership & Community
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leadership (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  role        VARCHAR(150) NOT NULL,
  organization VARCHAR(150) NOT NULL,
  duration    VARCHAR(80),
  description TEXT,
  sort_order  INT DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO leadership (role, organization, duration, description, sort_order) VALUES
('Technical Lead',          'Google Developer Student Club, DTU',   '2020 — 2021',   'Led 200+ member technical community. Organized hackathons, workshops, and speaker sessions on cloud and web technologies.', 1),
('Open Source Maintainer',  'OSS Community',                        '2022 — Present','Maintain 3 open-source projects with 1,200+ GitHub stars combined. Review PRs, triage issues, and guide contributors.', 2),
('Tech Speaker',            'JSConf India, DevFest Delhi',          '2022, 2023',    'Delivered talks on "Scaling Node.js APIs" and "Building Developer Tools" at regional tech conferences.', 3),
('Mentor',                  'Hack Club & Coding Ninjas',            '2021 — Present','Mentored 50+ students in DSA, web development, and career guidance for software engineering roles.', 4);

-- ------------------------------------------------------------
-- Blog Posts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blogs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(255) NOT NULL,
  slug       VARCHAR(255) NOT NULL UNIQUE,
  excerpt    TEXT,
  body       LONGTEXT     NOT NULL,
  published  TINYINT(1)   DEFAULT 0,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO blogs (title, slug, excerpt, body, published) VALUES
('Why I Switched from REST to GraphQL (and Back)',
 'rest-to-graphql-and-back',
 'A candid look at my journey with GraphQL — what worked, what didn''t, and when REST is still the right call.',
 '<p>After two years of running a production GraphQL API, I switched back to REST for our core service. Here''s what I learned.</p><p>GraphQL is genuinely powerful for client-driven data fetching, especially in product teams where frontend needs change rapidly. But for internal APIs with well-defined contracts? REST is simpler, easier to cache, and far easier to debug.</p><p>The real lesson: choose based on your team''s needs, not the hype.</p>',
 1),
('Building a Zero-Downtime Deployment Pipeline',
 'zero-downtime-deployment',
 'How I set up blue-green deployments with Docker and Nginx for a service that cannot afford downtime.',
 '<p>Downtime is expensive. Even 5 minutes of outage can cost thousands in lost revenue and user trust. Here''s how I built a zero-downtime deployment pipeline from scratch using Docker, Nginx, and a simple bash script.</p><p>The key insight: blue-green deployments aren''t about fancy infrastructure — they''re about having two identical environments and switching traffic atomically.</p>',
 1),
('The Art of Writing Code That Explains Itself',
 'self-documenting-code',
 'Documentation is important, but the best documentation is code that doesn''t need any.',
 '<p>I used to write extensive comments explaining what my code does. Now I rarely write comments at all — not because I got lazy, but because I learned to write code that speaks for itself.</p><p>Good naming, small functions, and clear data structures eliminate the need for most comments. The remaining comments should explain <em>why</em>, not <em>what</em>.</p>',
 1);

-- ------------------------------------------------------------
-- Contact Messages
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  subject    VARCHAR(255),
  message    TEXT         NOT NULL,
  is_read    TINYINT(1)   DEFAULT 0,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
);
