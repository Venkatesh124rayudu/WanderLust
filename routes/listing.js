const express = require('express');
const router=express.Router();
const {isLogedIn,isOwner,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});



//all listings route
router.route("/").get(listingController.index).post(isLogedIn,upload.single("listing[image]"),validateListing, listingController.addList);

router.get("/new",isLogedIn,listingController.newListingForm);

router.route("/:id").get(listingController.showList).put(isLogedIn,isOwner,upload.single("listing[image]"),validateListing,listingController.updateList).delete(isLogedIn,isOwner,listingController.destroyList);

router.get("/:id/edit",isLogedIn,isOwner,listingController.editList);
router.get("/user/:id",isLogedIn,listingController.userList);

module.exports = router;