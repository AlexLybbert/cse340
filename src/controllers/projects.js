import { body, validationResult } from 'express-validator';
import {
  getUpcomingProjects,
  createProject,
  getProjectDetails,
  updateProject
} from '../models/projects.js';
import { getCategoriesByProjectId } from '../models/categories.js';
import { getAllOrganizations } from '../models/organizations.js';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

const projectValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters.'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required.')
    .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters.'),
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required.')
    .isLength({ max: 200 }).withMessage('Location must be less than 200 characters.'),
  body('date')
    .notEmpty().withMessage('Date is required.')
    .isISO8601().withMessage('Date must be a valid date.'),
  body('organizationId')
    .notEmpty().withMessage('Organization is required.')
    .isInt().withMessage('Organization must be a valid integer.')
];

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

const showNewProjectForm = async (req, res) => {
  const organizations = await getAllOrganizations();

  res.render('new-project', {
    title: 'Add New Service Project',
    project: {},
    organizations,
    errors: []
  });
};

const processNewProjectForm = async (req, res) => {
  const errors = validationResult(req).array();
  const organizations = await getAllOrganizations();

  if (errors.length > 0) {
    return res.status(400).render('new-project', {
      title: 'Add New Service Project',
      project: req.body,
      organizations,
      errors
    });
  }

  const { organizationId, title, description, location, date } = req.body;
  const projectId = await createProject({
    organizationId,
    title,
    description,
    location,
    date
  });

  res.redirect(`/project/${projectId}`);
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
  res.render('edit-project', {
    title: `Edit ${project.title}`,
    project,
    organizations,
    errors: []
  });
};

const processEditProjectForm = async (req, res) => {
  const errors = validationResult(req).array();
  const projectId = req.params.id;
  const { organizationId, title, description, location, date } = req.body;

  if (errors.length > 0) {
    const organizations = await getAllOrganizations();

    return res.status(400).render('edit-project', {
      title: 'Edit Service Project',
      project: {
        project_id: projectId,
        organization_id: organizationId,
        title,
        description,
        location,
        date
      },
      organizations,
      errors
    });
  }

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
  showNewProjectForm,
  processNewProjectForm,
  showEditProjectForm,
  processEditProjectForm,
  projectValidation
};
