var express          = require("express"),
    app              = express(),
    mongoose         = require("mongoose"),
    bodyParser       = require("body-parser"),
    passport         = require("passport"),
    LocalStrategy    = require("passport-local"),
    jwt              = require('jsonwebtoken'),
    passportJWT      = require("passport-jwt"),
    JWTStrategy      = passportJWT.Strategy,
    ExtractJWT       = passportJWT.ExtractJwt,
    User             = require("./models/user.js"),
    Pirate           = require("./models/pirate");

require('dotenv').config();

// Set up database env variable
var url = process.env.DATABASEURL || "mongodb://localhost/pirate-api";

// Connect to db
mongoose.connect(url, {useNewUrlParser: true});

// Use bodyParser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Express Session
app.use(require("express-session")({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Passport Configuration 
app.use(passport.initialize());
app.use(passport.session());

// Passport Local
passport.use(new LocalStrategy(
  User.authenticate()
));

// Passport JWT
passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey   : process.env.JWT_SECRET
    },
    function (jwtPayload, cb) {
        return User.findById(jwtPayload.id)
            .then(user => {
                return cb(null, user);
            })
            .catch(err => {
                return cb(err);
            });
    }
));

// Passport sessions
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Get All Pirates
app.get("/pirates", function(req, res, next) {
    Pirate.find({}, {"_id": 0, "__v": 0}, function(err, pirates){
        if(err){
            res.status(400).json(err);
        } else {
            res.status(200).json(pirates);
        }
    });    
});

// Start server
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server has started");
});