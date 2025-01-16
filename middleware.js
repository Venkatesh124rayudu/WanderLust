const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");

module.exports.isLogedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;  // Store the URL of the page the user was trying to access
        req.flash("error", "You must be logged in to create a listing!");
        return res.redirect("/login");
    }
    next();
};
module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner= async(req,res,next)=>{
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currentUser._id)){
      req.flash("error", "You are not authorized to this list!");
      return res.redirect(`/listings/${id}`);
    }
    next();
}
// Joi as a Middleware for validating the listing for server side
module.exports.validateListing =(req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
      if(error) {
        throw new ExpressError(400,error);
      }else{
        next();
      }
}
module.exports.validateReview =(req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
      if(error) {
        throw new ExpressError(400,error);
      }else{
        next();
      } 
  }

module.exports.isReviewAuthor= async(req,res,next)=>{
    let { id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    console.log(review);
    if(!review.author.equals(res.locals.currentUser._id)){
      req.flash("error", "You are not authorized to this list!");
      return res.redirect(`/listings/${id}`);
    }
    next();
}