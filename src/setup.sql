-- Rebuild the database for the CSE 340 service projects app.

DROP TABLE IF EXISTS project_volunteer;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS project_category;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS project;
DROP TABLE IF EXISTS organization;
DROP TABLE IF EXISTS roles;

-- ========================================
-- Roles Table
-- ========================================
CREATE TABLE roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE NOT NULL,
  role_description TEXT
);

INSERT INTO roles (role_name, role_description)
VALUES
  ('user', 'Standard user with basic access'),
  ('admin', 'Administrator with full system access');

-- ========================================
-- Users Table
-- ========================================
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INTEGER REFERENCES roles(role_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- Organization Table
-- ========================================
CREATE TABLE organization (
  organization_id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  logo_filename VARCHAR(255) NOT NULL
);

-- ========================================
-- Project Table
-- ========================================
CREATE TABLE project (
  project_id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organization(organization_id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(200) NOT NULL,
  date DATE NOT NULL
);

-- ========================================
-- Volunteer Signup Table
-- ========================================
CREATE TABLE project_volunteer (
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES project(project_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, project_id)
);

-- ========================================
-- Category Tables
-- ========================================
CREATE TABLE category (
  category_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE project_category (
  project_id INTEGER NOT NULL REFERENCES project(project_id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES category(category_id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, category_id)
);

CREATE INDEX idx_project_organization_id ON project(organization_id);
CREATE INDEX idx_project_date ON project(date);
CREATE INDEX idx_project_volunteer_user_id ON project_volunteer(user_id);
CREATE INDEX idx_project_volunteer_project_id ON project_volunteer(project_id);
CREATE INDEX idx_project_category_project_id ON project_category(project_id);
CREATE INDEX idx_project_category_category_id ON project_category(category_id);

-- ========================================
-- Insert sample data: Organizations
-- ========================================
INSERT INTO organization (name, description, contact_email, logo_filename)
VALUES
  ('BrightFuture Builders', 'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 'info@brightfuturebuilders.org', 'brightfuture-logo.png'),
  ('GreenHarvest Growers', 'An urban farming collective promoting food sustainability and education in local neighborhoods.', 'contact@greenharvest.org', 'greenharvest-logo.png'),
  ('UnityServe Volunteers', 'A volunteer coordination group supporting local charities and service initiatives.', 'hello@unityserve.org', 'unityserve-logo.png');

-- ========================================
-- Insert sample data: Projects
-- ========================================
INSERT INTO project (organization_id, title, description, location, date)
VALUES
  (1, 'Community Garden Shed Build', 'Construct a weather-resistant storage shed for neighborhood gardening tools and supplies.', 'Riverside Community Garden', CURRENT_DATE + INTERVAL '7 days'),
  (1, 'Senior Center Ramp Repair', 'Repair and refinish accessibility ramps at a local senior activity center.', 'Maple Street Senior Center', CURRENT_DATE + INTERVAL '14 days'),
  (1, 'Habitat Cleanup Day', 'Remove debris and prepare a vacant lot for a future affordable housing project.', 'East Bench Lot 12', CURRENT_DATE + INTERVAL '21 days'),
  (1, 'Playground Bench Installation', 'Install new benches and shade supports around a public playground.', 'Lincoln Park', CURRENT_DATE + INTERVAL '35 days'),
  (1, 'Community Center Painting', 'Paint classrooms and common spaces at a neighborhood community center.', 'Hope Community Center', CURRENT_DATE + INTERVAL '49 days'),
  (2, 'Food Pantry Harvest Prep', 'Sort produce and prepare boxes for families served by the local food pantry.', 'GreenHarvest Warehouse', CURRENT_DATE + INTERVAL '5 days'),
  (2, 'Urban Farm Planting Day', 'Plant seasonal vegetables and teach volunteers sustainable planting practices.', '8th Street Urban Farm', CURRENT_DATE + INTERVAL '11 days'),
  (2, 'School Garden Workshop', 'Help elementary students build and plant raised garden beds.', 'Pioneer Elementary', CURRENT_DATE + INTERVAL '18 days'),
  (2, 'Compost Education Booth', 'Set up and staff an educational booth about household composting.', 'Saturday Farmers Market', CURRENT_DATE + INTERVAL '28 days'),
  (2, 'Greenhouse Maintenance', 'Clean greenhouse beds, repair irrigation lines, and organize seedling trays.', 'GreenHarvest Greenhouse', CURRENT_DATE + INTERVAL '42 days'),
  (3, 'Charity Run Volunteer Crew', 'Guide runners, hand out water, and assist with event cleanup.', 'River Trail Park', CURRENT_DATE + INTERVAL '3 days'),
  (3, 'Winter Clothing Drive Sort', 'Sort donated clothing and prepare distribution packages.', 'UnityServe Donation Center', CURRENT_DATE + INTERVAL '16 days'),
  (3, 'Library Reading Buddies', 'Read with children and support literacy activities at the public library.', 'Downtown Library', CURRENT_DATE + INTERVAL '24 days'),
  (3, 'Care Package Assembly', 'Assemble hygiene and snack kits for local outreach partners.', 'UnityServe Volunteer Hall', CURRENT_DATE + INTERVAL '31 days'),
  (3, 'Neighborhood Cleanup', 'Pick up litter, remove weeds, and improve walkways in a residential neighborhood.', 'Cedar Heights Neighborhood', CURRENT_DATE + INTERVAL '56 days');

-- ========================================
-- Insert sample data: Categories
-- ========================================
INSERT INTO category (name)
VALUES
  ('Construction'),
  ('Environment'),
  ('Food Security'),
  ('Education'),
  ('Community Support');

-- ========================================
-- Associate projects with categories
-- ========================================
INSERT INTO project_category (project_id, category_id)
VALUES
  (1, 1), (1, 2),
  (2, 1), (2, 5),
  (3, 1), (3, 2),
  (4, 1), (4, 5),
  (5, 1), (5, 5),
  (6, 3), (6, 5),
  (7, 2), (7, 4),
  (8, 2), (8, 4),
  (9, 2), (9, 4),
  (10, 2), (10, 3),
  (11, 5),
  (12, 5),
  (13, 4), (13, 5),
  (14, 5),
  (15, 2), (15, 5);
