
const mongoose = require("mongoose");

const cardschema = new mongoose.Schema({
    name:String,
    imgUrl : {
        type:Buffer
    },
    owner:{
       type: mongoose.Schema.Types.ObjectId,
       required:true
    },
    Hearts:{
        type:Array
    },
    Stars:{
        type:Array
    }
})

const dbcards = mongoose.model('cards' , cardschema);

module.exports = dbcards
