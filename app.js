var express          = require("express"),
    app              = express(),
    mongoose         = require("mongoose"),
    bodyParser       = require("body-parser");

require('dotenv').config();

// Set up database env variable
var url = process.env.DATABASEURL || "mongodb://localhost/pirate-api";

// Connect to db
mongoose.connect(url, {useNewUrlParser: true});

// Use bodyParser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Start server
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server has started");
});