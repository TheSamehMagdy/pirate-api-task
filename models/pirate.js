var mongoose = require("mongoose");

var PirateSchema = new mongoose.Schema({
    name: String,
    age: Number,
    isCaptured: Boolean
});

module.exports = mongoose.model("Pirate", PirateSchema);