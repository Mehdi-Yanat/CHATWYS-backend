
const mongoose = require("mongoose");

const cardschema = new mongoose.Schema({
    name:String,
    imgUrl : String
})

const dbcards = mongoose.model('cards' , cardschema);

module.exports = dbcards
