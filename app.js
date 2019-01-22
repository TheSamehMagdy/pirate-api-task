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
    request          = require("request"),
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

// User Signup
app.post("/signup", function(req, res, next) {
    var username = req.body.username;
    var newUser = {
        username: username
    };
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            return res.status(400).json({
                success: false,
                message: 'An error occurred: ' + err
            });
        }
        passport.authenticate("local", {session: false})(req, res, function(){
            return res.status(200).json({
                success: true,
                message:'Signed up successfully',
                user: user
            });
        });
    });
});

// User Login
app.post("/login", function(req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({
            message: "Something is not right with your input."
        });
    }
    passport.authenticate("local", {session: false}, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: "Something went wrong. " + err.message,
                user   : user
            });
        }
        req.login(user, {session: false}, (err) => {
            if (err) {
                res.json(err);
            }
            // generate a signed json web token with the contents of user object and return it in the response
            var token = jwt.sign({ id: user.id, email: user.username}, process.env.JWT_SECRET);
            return res.json({user: user, token});
        });
    })(req, res);
});

// Count Pirates
app.get("/pirates/countPirates", passport.authenticate("local"), function(req, res, next) {
    request.get("https://eila-pirate-api.herokuapp.com/pirates/prison", (error, response, body) => {
    if(error) {
        return res.status(400).json(error);
    }
    var parsedBody = JSON.parse(body);
    res.status(200).json(parsedBody);
});

});
// Start server
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server has started");
});