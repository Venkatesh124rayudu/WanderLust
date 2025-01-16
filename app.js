const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const engine = require('ejs-mate')
const ExpressError = require("./utils/ExpressError.js");
const listingRoute=require("./routes/listing.js");
const reviewRoute=require("./routes/review.js");
const MongoStore = require('connect-mongo');
const session = require("express-session");
const flash=require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRoute=require("./routes/user.js");


require('dotenv').config();
const atlasUrl=process.env.MONGODB_ATLAS_API;


const store=MongoStore.create({
  mongoUrl:atlasUrl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter:24*3600,
});

store.on("error",()=>{
  console.log("Error on session store",err);
})
const sessionOptions = {
  store,
  secret:process.env.SECRET,
  saveUninitialized:true,
  resave: false,
  cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
  },
}


main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(atlasUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', engine);
app.use(express.static(path.join(__dirname,"/public")));



app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

app.use("/listings/:id/reviews",reviewRoute);
app.use("/listings",listingRoute);
app.use("/",userRoute);

app.all("*",(req, res,next) => {
  next(new ExpressError(404,"Page Not Found !"));
});
app.use((err,req,res,next)=>{
  const {statusCode=500,message="Something went wrong"} = err;
  res.render("error.ejs",{message,statusCode})
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
