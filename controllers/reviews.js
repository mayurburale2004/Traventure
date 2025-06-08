const Review = require("../models/review.js");
const Listing = require("../models/listing.js");



module.exports.delete = async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", " Review Deleted !");
    res.redirect(`/listings/${id}`);
};


module.exports.createReview = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
       
        return res.status(404).send("Listing not found");
    }

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    await newReview.save();


    if (!listing.reviews) {
        listing.reviews = [];
    }

 
    listing.reviews.push(newReview._id);

    await listing.save();
    req.flash("success", "New Review Created !");

    res.redirect(`/listings/${listing._id}`);
};



