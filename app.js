var express          = require("express"),
    app              = express(),
    mongoose         = require("mongoose"),
    bodyParser       = require("body-parser"),
    Pirate           = require("./models/pirate");

require('dotenv').config();

// Set up database env variable
var url = process.env.DATABASEURL || "mongodb://localhost/pirate-api";

// Connect to db
mongoose.connect(url, {useNewUrlParser: true});

// Use bodyParser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

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