const express = require('express');
const app = express();
const router = express.Router();
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');
const userController = require('../controllers/user');
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");

router.route('/signup').get(userController.signUpForm).post(userController.signUpPage);
router.route('/login').get(userController.loginForm).post(saveRedirectUrl ,passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}),userController.loginPage);
router.get('/logout',userController.logoutForm);

module.exports = router;