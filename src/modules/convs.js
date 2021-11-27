const mongoose = require('mongoose')

const convsSchema = new mongoose.Schema(
  {
  members:
    {
        type:Array,
    }
  ,      
},
{
    timestamps:true
}
)

const Convs = mongoose.model('convs' , convsSchema)

module.exports = Convs