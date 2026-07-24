import { getUpcomingProjects, getProjectDetails, updateProject } from '../models/projects.js';
import { getCategoriesByProjectId } from '../models/categories.js';
import { getAllOrganizations } from '../models/organizations.js';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

const showProjectsPage = async (req, res) => {
  const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
  const title = 'Upcoming Service Projects';
  res.render('projects', { title, projects });
};

const showProjectDetailsPage = async (req, res, next) => {
  const id = req.params.id;
  const project = await getProjectDetails(id);

  if (!project) {
    const err = new Error('Service Project Not Found');
    err.status = 404;
    return next(err);
  }

  const categories = await getCategoriesByProjectId(id);
  const title = `${project.title} Details`;
  res.render('project', { title, project, categories });
};

const showEditProjectForm = async (req, res, next) => {
  const id = req.params.id;
  const project = await getProjectDetails(id);

  if (!project) {
    const err = new Error('Service Project Not Found');
    err.status = 404;
    return next(err);
  }

  const organizations = await getAllOrganizations();
  res.render('update-project', {
    title: `Edit ${project.title}`,
    project,
    organizations
  });
};

const processEditProjectForm = async (req, res) => {
  const projectId = req.params.id;
  const { organizationId, title, description, location, date } = req.body;

  await updateProject({
    projectId,
    organizationId,
    title,
    description,
    location,
    date
  });

  res.redirect(`/project/${projectId}`);
};

export {
  showProjectsPage,
  showProjectDetailsPage,
  showEditProjectForm,
  processEditProjectForm
};
