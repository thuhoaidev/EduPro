// category.routes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

router.post('/', categoryController.createCategory);        // POST /api/admin/categories/
router.get('/', categoryController.getCategories);         // GET /api/admin/categories/
router.get('/:id', categoryController.getCategoryById);    // GET /api/admin/categories/:id
router.put('/:id', categoryController.updateCategory);     // PUT /api/admin/categories/:id
router.delete('/:id', categoryController.deleteCategory);  // DELETE /api/admin/categories/:id

module.exports = router;
