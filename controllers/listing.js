const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const axios = require('axios');

module.exports.index=wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
});

module.exports.newListingForm=(req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showList=wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author",},}).populate("owner");
    if(!listing){
      req.flash("error","List doesnot exist!");
      res.redirect("/listings");
    }
    // res.render("listings/show.ejs", { listing });
    // Geocoding API integration
  const geoAPI = 'http://api.positionstack.com/v1/forward';
  const apiKey = process.env.POSTIONSTACK_API; // Replace with your API key

  try {
    const response = await axios.get(geoAPI, {
      params: {
        access_key: apiKey,
        query:`${listing.location}, ${listing.country}`, // The location from your listing
      },
    });

    const geoData = response.data.data[0]; // Assuming the first result is the most relevant
    const latitude = geoData?.latitude || null;
    const longitude = geoData?.longitude || null;

    // Render the page with the listing and coordinates
    res.render("listings/show.ejs", { listing, latitude, longitude });
  } catch (error) {
    console.error("Geocoding API error:", error.message);

    // Render the page without coordinates if API call fails
    res.render("listings/show.ejs", { listing, latitude: null, longitude: null });
  }
});

module.exports.addList=wrapAsync(async (req, res,next) => {
    let url=req.file.path;
    let filename=req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();
    let redirectUrl = res.locals.redirectUrl || "/listings";
    if (req.user) {
        // Assuming req.user.id contains the user ID
        redirectUrl = `/listings/user/${req.user.id}`;
      }
//   if (redirectUrl.includes("/reviews")) {
//     // Remove the "/reviews" part from the URL
//     redirectUrl = redirectUrl.split("/reviews")[0];
//   }
//   req.flash("success", "Login Success! Welcome back to Wanderlust!");
    req.flash("success", "New Listing Added Successfully!");
    // res.redirect("/listings");
    res.redirect(redirectUrl);
})

module.exports.editList=wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
      req.flash("error", "List does not exist!");
      res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
});

module.exports.updateList=wrapAsync(async (req, res) => {
    let { id } = req.params;
    let newListing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !== "undefined" ){
        let url=req.file.path;
        let filename=req.file.filename;
        newListing.image = { url, filename };
        await newListing.save();
    };
    req.flash("success", "List Edited Successfully!");
    res.redirect(`/listings/${id}`);
})

module.exports.destroyList=wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "List Deleted Successfully!");
    res.redirect("/listings");
})
module.exports.userList=wrapAsync(async (req, res) => {
    let {id}=req.params;
    const allListings = await Listing.find({owner:id}).populate({path:"reviews",populate:{path:"author",},}).populate("owner");
    res.render("listings/userList.ejs", { allListings });
    // res.render("listings/userList.ejs", listing);
});