const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsyc.js");
const passport = require("passport");
const { saveRedirect } = require("../middleware.js");
const userContoller = require("../controllers/users.js");
router.
    route("/signup")
    .get(userContoller.singuppage)
    .post(wrapAsync(userContoller.singup));

router.
    route("/login")
    .get(userContoller.loginget)
    .post(
        saveRedirect,
        passport.authenticate("local",
            {
                failureRedirect: '/login',
                failureFlash: true
            }),
        userContoller.login);

router.get("/logout", userContoller.logout);

module.exports = router;