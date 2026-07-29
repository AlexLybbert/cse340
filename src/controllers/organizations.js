import { body, validationResult } from 'express-validator';
import {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization
} from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';

const DEFAULT_LOGO_FILENAME = 'placeholder-logo.png';

const organizationValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Organization name is required.')
    .isLength({ min: 3, max: 150 }).withMessage('Organization name must be between 3 and 150 characters.'),
  body('description')
    .trim()
    .notEmpty().withMessage('Organization description is required.')
    .isLength({ max: 500 }).withMessage('Organization description cannot exceed 500 characters.'),
  body('contactEmail')
    .trim()
    .notEmpty().withMessage('Contact email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('logoFilename')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 255 }).withMessage('Logo filename cannot exceed 255 characters.')
];

const showOrganizationsPage = async (req, res) => {
  const organizations = await getAllOrganizations();
  const title = 'Our Partner Organizations';
  res.render('organizations', { title, organizations });
};

const showOrganizationDetailsPage = async (req, res, next) => {
  const id = req.params.id;
  const organization = await getOrganizationById(id);

  if (!organization) {
    const err = new Error('Organization Not Found');
    err.status = 404;
    return next(err);
  }

  const projects = await getProjectsByOrganizationId(id);
  const title = `${organization.name} Details`;
  res.render('organization', { title, organization, projects });
};

const showNewOrganizationForm = async (req, res) => {
  res.render('new-organization', {
    title: 'Add New Organization',
    organization: {},
    errors: []
  });
};

const processNewOrganizationForm = async (req, res) => {
  const errors = validationResult(req).array();

  if (errors.length > 0) {
    return res.status(400).render('new-organization', {
      title: 'Add New Organization',
      organization: req.body,
      errors
    });
  }

  const { name, description, contactEmail } = req.body;
  const organizationId = await createOrganization({
    name,
    description,
    contactEmail,
    logoFilename: DEFAULT_LOGO_FILENAME
  });

  res.redirect(`/organization/${organizationId}`);
};

const showEditOrganizationForm = async (req, res, next) => {
  const organization = await getOrganizationById(req.params.id);

  if (!organization) {
    const err = new Error('Organization Not Found');
    err.status = 404;
    return next(err);
  }

  res.render('edit-organization', {
    title: `Edit ${organization.name}`,
    organization,
    errors: []
  });
};

const processEditOrganizationForm = async (req, res) => {
  const errors = validationResult(req).array();
  const organizationId = req.params.id;

  if (errors.length > 0) {
    return res.status(400).render('edit-organization', {
      title: 'Edit Organization',
      organization: {
        organization_id: organizationId,
        name: req.body.name,
        description: req.body.description,
        contact_email: req.body.contactEmail,
        logo_filename: req.body.logoFilename
      },
      errors
    });
  }

  const { name, description, contactEmail, logoFilename } = req.body;
  await updateOrganization({
    organizationId,
    name,
    description,
    contactEmail,
    logoFilename: logoFilename || DEFAULT_LOGO_FILENAME
  });

  res.redirect(`/organization/${organizationId}`);
};

export {
  showOrganizationsPage,
  showOrganizationDetailsPage,
  showNewOrganizationForm,
  processNewOrganizationForm,
  showEditOrganizationForm,
  processEditOrganizationForm,
  organizationValidation
};
