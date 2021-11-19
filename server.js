
const express = require('express')
const dbcards = require("./dbcards")
const User = require('./src/modules/user')
const cors = require("cors")
const auth = require('./src/middlewares/auth')

//App Config
const app = express()
const port = process.env.PORT || 8001


//Middlewares
app.use(express.json())
app.use(cors())
//DB config
require('./src/db/mongooseDB')
//API Endpoint
app.get('/' , (req ,res) => {
    res.status(200).send('hello world')

})
// Tinder card images
app.post('/tinder/card' , (req , res) =>{
    const dbCard = req.body
    dbcards.create(dbCard , (err , data) =>{
        if (err) {
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
    })
})
app.get('/tinder/card' , (req , res) =>{
    dbcards.find((err , data)=>{
        if (err) {
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

// Read Users
app.get('/users/me', auth  , (req , res)=>{
    try {
        const data = req.user
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

// Creat Users
app.post('/users/signup' , async (req ,res) => {
    const users = new User(req.body)
    const token = await users.generateToken()
    try {
    res.status(201).send({users , token})
    } catch (error) {
    res.status(400).send(error)
    }
})      
// Delete Users
app.delete('/users/:id' , (req , res)=>{
        const _id = req.params.id
    User.findByIdAndDelete({_id} , (err ,data)=>{
        if (err) {
            res.status(400).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})
// Modify Users
app.patch('/users/:id' , async (req,res)=>{
  const UserNa9ch = Object.keys(req.body)
  const updateAllowed = ["email" ,"password","phone"]
  const isValid = UserNa9ch.every((update)=>  updateAllowed.includes(update))
  if (!isValid) {
      throw new Error ('You can not update just email and password and phone')
      
  }
  try {
    const user = await User.findById(req.params.id)
    UserNa9ch.forEach((update)=>{
        user[update] = req.body[update]
    })
    await user.save()
    res.status(200).send(user)
  } catch (error) {
      res.status(401).send(error)
  }

})
// login user 

app.post('/users/login', async (req , res)=>{
    try {
        const user = await User.findByCredentials(req.body.email , req.body.password)
        const token = await user.generateToken()
        res.send({user,token} )
    } catch (error) {
        res.status(400).send({error:"information mistake"} )
    }
})

//logout user 

app.post('/users/logout' , auth , async(req , res) =>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send("log out successfully")
    }catch (error) {
        res.status(500).send(error)
    }
})
//logout all devices
app.post('/users/logoutAll' , auth , async(req , res)=> {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send("Log out on all devices")
    } catch (error) {
        res.status(400).send(error)
    }
})

//Listener

app.listen(port , ()=>{
    console.log("Server Started on " , port);
})

