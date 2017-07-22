var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('mongodb://alfa:alfa1963@ds159880.mlab.com:59880/bdviagens', ['utilizadores']);
// config/passport.js
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
//


var utilizador={
    Nome: String,
    Email: { type: String, required: true},
    Password: { type: String, required: true },
    Activo: { type: Boolean, default: true },
    Data: { type: Date, default: Date.now() },
    google: {
    id: String,
    token: String,
    email: String,
    name: String,
    username: String,
  },
};

/* GET ALL  /utilizadores */
router.get('/utilizadores', function (req, res, next) {
    db.utilizadores.find(function (err, utilizadores) {
        if (err) { res.send(err); }
        console.log('todos os utilizadores: ' + JSON.stringify(utilizadores));
        res.json(utilizadores);
    });
});

/* GET ONE   /utilizadores/id */
router.get('/utilizadores/:id', function (req, res, next) {
    db.utilizadores.findOne({ _id: mongojs.ObjectId(req.params.id) }, function (err, utilizador) {
        if (err) { res.send(err); }
        console.log('Utilizador id: ' + JSON.stringify(utilizador));
        res.json(utilizador);
    });
});

/* DELETE   /utilizadores/id */
router.delete('/utilizadores/:id', function (req, res, next) {
    db.utilizadores.remove({ _id: mongojs.ObjectId(req.params.id) }, function (err, utilizador) {
        if (err) { res.send(err); }
        console.log('Utilizador eliminado: ' + JSON.stringify(utilizador));
        res.json(utilizador);
    });
});

/* POST     /utilizadores */
router.post('/utilizadores', function (req, res) {
    utilizador = req.body;
    db.utilizadores.insert(utilizador, function (err, utilizador) {
        if (err) {
            res.send({ 'erro': 'Ocorreu um erro' });
        } else {
            res.send(utilizador);
        }
    });
});

//
    // used to serialize the user for the session
    /*passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });*/
    // GOOGLE ==================================================================
    passport.use(new GoogleStrategy({
        clientID: '665814800149-udtu8p8uij0ckq41q41h1pqjde57l0nr.apps.googleusercontent.com',
        clientSecret: 'qJoYMJSiDKFNW8GczmccuqHl',
        callbackURL: 'http://localhost:8080/auth/google/callback',
    },
    function(token, refreshToken, profile, done) {
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {
            // try to find the user based on their google id
            db.utilizador.findOne({ 'google.id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);
                if (user) {
                    // if a user is found, log them in
                    return done(null, user);
                } else {
                    // if the user isnt in our database, create a new user
                    var newUser  = new User();
                    // set all of the relevant information
                    newUser.google.id    = profile.id;
                    newUser.google.token = token;
                    newUser.google.name  = profile.displayName;
                    newUser.google.email = profile.emails[0].value; // pull the first email
                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });

    }));
//
 module.exports = router;
