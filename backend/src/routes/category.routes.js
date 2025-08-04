const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

// Routes
router.post('/', categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/status/:status', categoryController.getCategoriesByStatus);
router.get('/status/:status/count', categoryController.getCategoriesWithCourseCount);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router