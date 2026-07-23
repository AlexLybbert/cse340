import { getAllCategories, getCategoryById } from '../models/categories.js';
import { getProjectsByCategoryId } from '../models/projects.js';

const showCategoriesPage = async (req, res) => {
  const categories = await getAllCategories();
  const title = 'Service Categories';
  res.render('categories', { title, categories });
};

const showCategoryDetailsPage = async (req, res, next) => {
  const id = req.params.id;
  const category = await getCategoryById(id);

  if (!category) {
    const err = new Error('Category Not Found');
    err.status = 404;
    return next(err);
  }

  const projects = await getProjectsByCategoryId(id);
  const title = `${category.name} Projects`;
  res.render('category', { title, category, projects });
};

export { showCategoriesPage, showCategoryDetailsPage };
