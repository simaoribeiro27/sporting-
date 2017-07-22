var express = require('express');
var router = express.Router();
//
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
 res.render('./home');
});

//routes
module.exports = function (app, passport) {
    router.get('/', function (req, res, next) {
        res.render('./home'); // load the index.ejs file
    });
    // route for showing the profile page
    router.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });
    // route for logging out
    router.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    // GOOGLE ROUTES =======================
    router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    // the callback after google has authenticated the user
    router.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));
};
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        {
            return next();
            res.redirect('./cliente/index.html');  
        }
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = router;
