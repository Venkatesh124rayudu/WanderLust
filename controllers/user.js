const wrapAsync = require("../utils/wrapAsync.js");
const User = require('../models/user.js');
module.exports.signUpForm=(req, res) => {
    res.render('users/signup.ejs');
}

module.exports.signUpPage=wrapAsync(async (req, res) => {
    try{
        let {username,email,password}=req.body;
        let newUser=new User({username,email});
        const registeredUser=await User.register(newUser,password);
        req.login(registeredUser, (err) => {
            if(err) {
                return next(err);
            }
            req.flash('success','Welcome to WanderLust!');
            res.redirect("/listings");
        });
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
});

module.exports.loginForm=(req, res) => {
    res.render('users/login.ejs');
};
module.exports.loginPage=async (req, res) => {
    let redirectUrl = res.locals.redirectUrl || "/listings";
  
  if (redirectUrl.includes("/reviews")) {
    // Remove the "/reviews" part from the URL
    redirectUrl = redirectUrl.split("/reviews")[0];
  }

  req.flash("success", "Login Success! Welcome back to Wanderlust!");
  res.redirect(redirectUrl);
    console.log(res.locals.redirectUrl);
}
module.exports.logoutForm=(req, res,next) => {
    req.logout((err)=>{
        if(err) {
            next(err);
        }
        req.flash("success","Logged Out Successfully!");
        res.redirect("/listings");
    });
};
