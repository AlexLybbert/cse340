import { body, validationResult } from 'express-validator';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory
} from '../models/categories.js';
import { getProjectsByCategoryId } from '../models/projects.js';

const categoryValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required.')
    .isLength({ min: 3, max: 100 }).withMessage('Category name must be between 3 and 100 characters.')
];

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

const showNewCategoryForm = async (req, res) => {
  res.render('new-category', {
    title: 'Add New Category',
    category: {},
    errors: []
  });
};

const processNewCategoryForm = async (req, res) => {
  const errors = validationResult(req).array();

  if (errors.length > 0) {
    return res.status(400).render('new-category', {
      title: 'Add New Category',
      category: req.body,
      errors
    });
  }

  const categoryId = await createCategory({ name: req.body.name });
  res.redirect(`/category/${categoryId}`);
};

const showEditCategoryForm = async (req, res, next) => {
  const category = await getCategoryById(req.params.id);

  if (!category) {
    const err = new Error('Category Not Found');
    err.status = 404;
    return next(err);
  }

  res.render('edit-category', {
    title: `Edit ${category.name}`,
    category,
    errors: []
  });
};

const processEditCategoryForm = async (req, res) => {
  const errors = validationResult(req).array();
  const categoryId = req.params.id;

  if (errors.length > 0) {
    return res.status(400).render('edit-category', {
      title: 'Edit Category',
      category: {
        category_id: categoryId,
        name: req.body.name
      },
      errors
    });
  }

  await updateCategory({
    categoryId,
    name: req.body.name
  });

  res.redirect(`/category/${categoryId}`);
};

export {
  showCategoriesPage,
  showCategoryDetailsPage,
  showNewCategoryForm,
  processNewCategoryForm,
  showEditCategoryForm,
  processEditCategoryForm,
  categoryValidation
};
