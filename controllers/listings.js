


const Listing = require("../models/listing");





module.exports.index = async (req, res) => {
    const allListing = await Listing.find({});
    res.render("./listings/index.ejs", { allListing });
};

module.exports.renderNewForm = (req, res) => {

    res.render("listings/new.ejs");
};


require('dotenv').config();



module.exports.showListings = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author",
        }
    }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing, mapToken: process.env.MAP_TOKEN, });

};

module.exports.createListings = async (req, res, next) => {

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();

    req.flash("success", "New Listing Created!");

    res.redirect("/listings");


};




module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    let orignalTmageUrl = listing.image.url;
    orignalTmageUrl = orignalTmageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, orignalTmageUrl });

};
module.exports.search = async (req, res) => {
    let input = req.query.q.trim().replace(/\s+/g, " ");
    if (input === "") {
        req.flash("error", "Please enter search query!");
        return res.redirect("/listings");
    }

    let element = input
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    const searchFields = ["title", "category", "country", "location"];

    for (let field of searchFields) {
        let allListing = await Listing.find({
            [field]: { $regex: element, $options: "i" },
        }).sort({ _id: -1 });

        if (allListing.length > 0) {
            res.locals.success = `Listings searched by ${field.charAt(0).toUpperCase() + field.slice(1)}!`;
            return res.render("listings/index.ejs", { allListing });
        }
    }

    const intValue = parseInt(element, 10);
    const intDec = Number.isInteger(intValue);

    if (intDec) {
        let allListing = await Listing.find({ price: { $lte: intValue } }).sort({ price: 1 });
        if (allListing.length > 0) {
            res.locals.success = `Listings under Rs ${intValue}!`;
            return res.render("listings/index.ejs", { allListing });
        }
    }

    req.flash("error", "No listings found based on your search!");
    return res.redirect("/listings");
};



module.exports.updateListings = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // Fix: Properly check if req.file exists
    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated !");
    res.redirect(`/listings/${id}`);
};




module.exports.deleteListings = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted !");


    res.redirect("/listings");
};