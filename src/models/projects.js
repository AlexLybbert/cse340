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
  getProjectDetails,
  getProjectsByCategoryId
};
