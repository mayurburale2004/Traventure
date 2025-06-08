const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsyc.js");
const ExpressError = require("../utils/ExpressError.js")
const { listingSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js")

const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(validateListing, isLoggedIn,
    upload.single("listing[image]"),
    wrapAsync(listingController.createListings));

router.get("/new", isLoggedIn, listingController.renderNewForm);
router.get("/search", listingController.search);
router
  .route("/:id")
  .get(wrapAsync(listingController.showListings))
  .delete(isLoggedIn,
    isOwner, wrapAsync(listingController.deleteListings))

  .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListings));

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


module.exports = router;