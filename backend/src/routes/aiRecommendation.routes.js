const express = require('express');
const aiRecommendationController = require('../controllers/aiRecommendation.controller');
const router = express.Router();

router.get('/recommendations/:userId', aiRecommendationController.getRecommendations);
router.post('/user-behavior/:userId', aiRecommendationController.updateUserBehavior);

module.exports = router; 