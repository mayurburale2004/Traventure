const Listing = require("./models/listing");

const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js")
const { listingSchema, reviewSchema } = require("./schema.js");


module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged to create listing!");
    return res.redirect("/login");
  }
  next();
}


module.exports.saveRedirect = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;

  let listing = await Listing.findById(id);
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing!");
    return res.redirect(`/listings/${id}`);

  }
  next();
};
module.exports.validateListing = (req, res, next) => {


  const { error, value } = listingSchema.validate(req.body, {
    convert: true,
    abortEarly: false
  });


  if (error) {
    const errmsg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, errmsg);
  } else {
    req.body = value;
    next();
  }
};
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errmsg);
  }
  else {
    next();
  }
};
module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;

  let review = await Review.findById(reviewId);
  if (!review.author._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this listing!");
    return res.redirect(`/listings/${id}`);

  }
  next();
};
