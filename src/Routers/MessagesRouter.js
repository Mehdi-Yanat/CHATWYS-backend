

const express = require('express')
const MessageRouter = new express.Router()
const Convs  = require('../modules/convs')
const auth = require('../middlewares/auth')
const User = require('../modules/user')
const sharp = require('sharp')
const messages = require('../modules/MessageSchema')
const cors = require("cors")


const corsOptions ={
    origin: "https://chatwys-5b149.web.app", 
    //"http://localhost:3000",
    //'https://tinder-clone-68079.web.app', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}

MessageRouter.use(cors(corsOptions))



MessageRouter.post('/message' , async (req , res)=>{
    const newMessage = new messages(req.body)
    try {
        const saveMessages = await newMessage.save()
        res.status(200).send(saveMessages)
    } catch (error) {
        res.status(401).send(error)
    }
})

MessageRouter.get('/message/:conversationId' , async (req , res)=>{
    const getMessage = await messages.find({conversationId:req.params.conversationId})
    console.log(getMessage);
    try {
        res.status(200).send(getMessage)
    } catch (error) {
        res.status(400).send(error)
    }
})



module.exports = MessageRouter