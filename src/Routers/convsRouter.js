
const express = require('express')
const ConvsRouter = new express.Router()
const Convs  = require('../modules/convs')
const auth = require('../middlewares/auth')
const User = require('../modules/user')
const sharp = require('sharp')
const cors = require("cors")

const corsOptions ={
    origin:"https://chatwys-5b149.web.app/",
    //"http://localhost:3000",
    //'https://tinder-clone-68079.web.app', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}

ConvsRouter.use(cors(corsOptions))

ConvsRouter.post('/convs' , async (req , res)=>{
    const ConversationMembers = new Convs({members:[req.body.senderId , req.body.receiverId]})
    const getConvs = await Convs.find({members:{$in:[req.body.senderId , req.body.receiverId]}})
    
    for (let i = 0; i < getConvs.length; i++) {
        const element = getConvs[i];
        console.log(element);
        console.log(element.members.includes(req.body.receiverId));
        if (element.members.includes(req.body.receiverId) === true && element.members.includes(req.body.senderId) === true) {
            res.status(401).json({error:"already sent !"})
            return
        }
    }
    try {

        res.status(200).json(ConversationMembers)
        await ConversationMembers.save()
    } catch (error) {
         res.status(500).json(error)
    }
    return
})

ConvsRouter.get('/convs/:userId' , async (req , res)=>{
    const getUser = await Convs.find({members:{$in:[req.params.userId]}})
    try {
        res.status(200).json(getUser)
    } catch (error) {
        res.status(400).json(error)
    }
})

ConvsRouter.delete('/convs/:id' ,  (req , res)=>{
    const _id = req.params.id
     Convs.findByIdAndDelete( {_id} , (err , response)=>{
         if (err) {
                res.status(400).send(err)
         }else{
                res.status(200).send(response)
         }
     })
} )



module.exports = ConvsRouter