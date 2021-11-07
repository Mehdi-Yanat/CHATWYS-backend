
import express from 'express'
import mongoose from 'mongoose'
import cards from "./dbcards.js"
import cors from "cors"
//App Config
const app = express()
const port = process.env.PORT || 8001
const connection_url = "mongodb+srv://admin:Fn5cY79Atx41cdf1@cluster0.alpim.mongodb.net/appDB?retryWrites=true&w=majority"


//Middlewares
app.use(express.json())
app.use(cors())
//DB config
mongoose.connect(connection_url , {
    useNewUrlParser : true,
    //useCreateIndex: true,
    useUnifiedTopology:true
})
//API Endpoint
app.get('/' , (req ,res) => {
    res.status(200).send('hello world')
})
app.post('/tinder/card' , (req , res) =>{
    const dbCard = req.body
    cards.create(dbCard , (err , data) =>{
        if (err) {
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
    })
})
app.get('/tinder/card' , (req , res) =>{
    cards.find((err , data)=>{
        if (err) {
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})
//Listener

app.listen(port , ()=>{
    console.log("Server Started on " , port);
})