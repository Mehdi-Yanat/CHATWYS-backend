const mongoose = require('mongoose')
const connection_url = "mongodb+srv://mahdi:31063106r@cluster0.alpim.mongodb.net/Tinder-app?retryWrites=true&w=majority"

mongoose.connect(connection_url , {
    useNewUrlParser : true,
    //useCreateIndex: true,
    useUnifiedTopology:true
})