const express = require('express');
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const {validateReview, isLogedIn, isReviewAuthor} = require("../middleware.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const reviewController = require("../controllers/review.js");


router.post("/",isLogedIn,validateReview,reviewController.addReview);
router.delete("/:reviewId",isLogedIn,isReviewAuthor,reviewController.destroyReview);

module.exports = router;