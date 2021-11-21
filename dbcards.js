
const mongoose = require("mongoose");

const cardschema = new mongoose.Schema({
    name:String,
    imgUrl : String,
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user'
    }

})

const dbcards = mongoose.model('cards' , cardschema);

module.exports = dbcards
