import { getAllOrganizations, getOrganizationById } from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';

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

export { showOrganizationsPage, showOrganizationDetailsPage };
