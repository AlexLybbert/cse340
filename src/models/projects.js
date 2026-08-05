import db from './db.js';

const getAllProjects = async () => {
  const query = `
    SELECT
      p.project_id,
      p.organization_id,
      p.title,
      p.description,
      p.location,
      p.date,
      o.name AS organization_name
    FROM project p
    JOIN organization o ON p.organization_id = o.organization_id
    ORDER BY p.date;
  `;
  const result = await db.query(query);
  return result.rows;
};

const getProjectsByOrganizationId = async (organizationId) => {
  const query = `
    SELECT project_id, organization_id, title, description, location, date
    FROM project
    WHERE organization_id = $1
    ORDER BY date;
  `;
  const result = await db.query(query, [organizationId]);
  return result.rows;
};

const getUpcomingProjects = async (numberOfProjects) => {
  const query = `
    SELECT
      p.project_id,
      p.title,
      p.description,
      p.location,
      p.date,
      p.organization_id,
      o.name AS organization_name
    FROM project p
    JOIN organization o ON p.organization_id = o.organization_id
    WHERE p.date >= CURRENT_DATE
    ORDER BY p.date
    LIMIT $1;
  `;
  const result = await db.query(query, [numberOfProjects]);
  return result.rows;
};

const createProject = async ({ organizationId, title, description, location, date }) => {
  const query = `
    INSERT INTO project (organization_id, title, description, location, date)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING project_id;
  `;
  const result = await db.query(query, [
    organizationId,
    title,
    description,
    location,
    date
  ]);

  if (result.rows.length === 0) {
    throw new Error('Service project could not be created.');
  }

  return result.rows[0].project_id;
};

const getProjectDetails = async (projectId) => {
  const query = `
    SELECT
      p.project_id,
      p.title,
      p.description,
      p.location,
      p.date,
      p.organization_id,
      o.name AS organization_name
    FROM project p
    JOIN organization o ON p.organization_id = o.organization_id
    WHERE p.project_id = $1;
  `;
  const result = await db.query(query, [projectId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

const updateProject = async ({ projectId, organizationId, title, description, location, date }) => {
  const query = `
    UPDATE project
    SET
      organization_id = $1,
      title = $2,
      description = $3,
      location = $4,
      date = $5
    WHERE project_id = $6
    RETURNING project_id, organization_id, title, description, location, date;
  `;
  const result = await db.query(query, [
    organizationId,
    title,
    description,
    location,
    date,
    projectId
  ]);

  if (result.rows.length === 0) {
    throw new Error('Service project could not be updated.');
  }

  return result.rows[0];
};

const addVolunteerToProject = async (userId, projectId) => {
  const query = `
    INSERT INTO project_volunteer (user_id, project_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, project_id) DO NOTHING
    RETURNING user_id, project_id;
  `;
  const result = await db.query(query, [userId, projectId]);
  return result.rows[0] || null;
};

const removeVolunteerFromProject = async (userId, projectId) => {
  const query = `
    DELETE FROM project_volunteer
    WHERE user_id = $1 AND project_id = $2;
  `;
  await db.query(query, [userId, projectId]);
};

const isUserVolunteeringForProject = async (userId, projectId) => {
  const query = `
    SELECT 1
    FROM project_volunteer
    WHERE user_id = $1 AND project_id = $2;
  `;
  const result = await db.query(query, [userId, projectId]);
  return result.rows.length > 0;
};

const getVolunteerProjectsByUserId = async (userId) => {
  const query = `
    SELECT
      p.project_id,
      p.title,
      p.description,
      p.location,
      p.date,
      p.organization_id,
      o.name AS organization_name
    FROM project_volunteer pv
    JOIN project p ON pv.project_id = p.project_id
    JOIN organization o ON p.organization_id = o.organization_id
    WHERE pv.user_id = $1
    ORDER BY p.date, p.title;
  `;
  const result = await db.query(query, [userId]);
  return result.rows;
};

const getProjectsByCategoryId = async (categoryId) => {
  const query = `
    SELECT
      p.project_id,
      p.organization_id,
      p.title,
      p.description,
      p.location,
      p.date,
      o.name AS organization_name
    FROM project p
    JOIN project_category pc ON p.project_id = pc.project_id
    JOIN organization o ON p.organization_id = o.organization_id
    WHERE pc.category_id = $1
    ORDER BY p.date;
  `;
  const result = await db.query(query, [categoryId]);
  return result.rows;
};

export {
  getAllProjects,
  getProjectsByOrganizationId,
  getUpcomingProjects,
  createProject,
  getProjectDetails,
  updateProject,
  addVolunteerToProject,
  removeVolunteerFromProject,
  isUserVolunteeringForProject,
  getVolunteerProjectsByUserId,
  getProjectsByCategoryId
};
