
const express = require('express')
const dbcards = require("./dbcards")
const User = require('./src/modules/user')
const cors = require("cors")
const auth = require('./src/middlewares/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendEmail } = require('./src/emails/account')
const http = require('http')
const SocketIo = require("socket.io")
const ConvsRouter = require('./src/Routers/convsRouter')
const MessageRouter = require('./src/Routers/MessagesRouter')


//App Config
const app = express()


const corsOptions ={
    origin: "https://chatwys-5b149.web.app",
    //"http://localhost:3000",
 
    credentials:true,                    //access-control-allow-credentials:true
    optionSuccessStatus:200
}

// server variable
const server = http.createServer(app)
const port = process.env.PORT || 8001



//Middlewares
app.use(express.json())
app.use(ConvsRouter)
app.use(MessageRouter)
app.use(cors(corsOptions))
const upload = multer({
    limits: {
        fileSize:1000000,
    }, 
    fileFilter(req , file , cb){
        if (!file.originalname.match(/\.(jpg|jpeg|png|JPG)$/)) {
         cb(new Error ('Please must be images'))
            
        } 
        cb(undefined , true)
    }
})

// Socket IO 
const io = SocketIo(server ,{
    cors:{
        origin:"*"   
    }
})

// socket io

let users = []

const addUser = (userId , socketId)=>{
    !users.some((user)=> user.userId === userId) && users.push({userId , socketId})
}

const removeUser = (socketId) => {
    users = users.filter( user => user.socketId !== socketId)
}

const getUser =  (userId) =>  {
   return users.find((user) => user.userId === userId)
}

io.on('connection' , (socket)=>{
    console.log("New Client Connected");

    
    socket.on('addUser' , (userId) => {
        console.log(userId);
        addUser(userId , socket.id)
        io.emit('getUsers' , users)
    })

    
    socket.on('sendMessage' , ({senderId , receiverId , text}) =>{
        console.log(senderId);
        console.log(receiverId);
        console.log(text);
        const user = getUser(receiverId)
        console.log(user);
        io.to(user.socketId).emit('getMessage' , {
            senderId,
            text
        })
    })

   socket.on('disconnect' , ()=>{
       console.log("a user disconnected");
       removeUser(socket.id)
       io.emit('getUsers' , users)
   })

} )

//test 





// 
app.post('/users/me/avatar', auth , upload.single('avatar') , async (req ,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250 , height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
} , (error , req ,res, next)=>{
    res.status(400).send({error:error.message})
})

app.delete('/users/me/avatar' , auth , upload.single('avatar') , async  (req , res )=>{
    req.user.avatar = undefined
    res.send('Deleted Successfully')
    await req.user.save()
} , (error , req ,res ,next)=>{
    res.status().send({error:error})
})

app.get('/users/:id/avatar'  , async (req , res)=>{
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/jpg')
        res.status(200).send(user.avatar)
    } catch (error) {
        res.status(401).send("didn't find photo")
    }
})

//DB config
require('./src/db/mongooseDB')
//API Endpoint
app.get('/' , (req ,res) => {
    res.status(200).send('hello world')

})
// Tinder card images
app.post('/tinder/card' , auth  , async (req , res) =>{
    const dbCard =  new dbcards({
        ...req.body ,
        owner:req.user._id
    })
    try {
        await dbCard.save()
        res.status(201).send(dbCard)
    } catch (error) {
        res.status(400).send(error)
    }
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
app.delete('/tinder/card/delete' , auth  , (req , res)=>{
    const query = {"owner" : {"$eq": req.user._id}}
    dbcards.findOneAndDelete( query , (err , data)=>{
        if (err) {
            res.status(400).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

app.put('/tinder/card/hearts' , auth ,async (req , res )=>{
    try {
   const response = await dbcards.findByIdAndUpdate(req.body.CardId , {$push:{Hearts:req.user.id}} , {new:true} )
        res.status(200).send(response)
    } catch (error) {
        res.status(400).send(error)
    }

})
app.put('/tinder/card/stars' , auth ,async (req , res )=>{
    try {
   const response = await dbcards.findByIdAndUpdate(req.body.CardId , {$push:{Stars:req.user.id}} , {new:true} )
        res.status(200).send(response)
    } catch (error) {
        res.status(400).send(error)
    }

})


app.put("/tinder/card/disHeart" , auth , async (req , res)=>{
    try {
        const response = await dbcards.findByIdAndUpdate(req.body.CardId , {$pull:{Hearts:req.user.id} } , {new:true})
        res.status(200).send(response)
    } catch (error) {
        res.status(401).send(error)
    }
})

app.put("/tinder/card/disStars" , auth , async (req , res)=>{
    try {
        const response = await dbcards.findByIdAndUpdate(req.body.CardId , {$pull:{Stars:req.user.id} } , {new:true})
        res.status(200).send(response)
    } catch (error) {
        res.status(401).send(error)
    }
})


// Read Users
app.get('/users/me', auth  , async (req , res)=>{
    try {
        const data = req.user
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

app.get('/users', auth  , async (req , res)=>{
    const userId = req.query.userId
    const username = req.query.username
    try {
        const user = userId 
        ? await User.findById(userId)
        : await User.findOne({username:username})
        const {password , updateAt , ...other} = user._doc
        res.status(200).send(other)
    } catch (error) {
        res.status(400).send(error)
    }
})

// Creat Users
app.post('/users/signup' , async (req ,res) => {
    const users = new User(req.body)
    const token = await users.generateToken()
    console.log(req.body.email);
    sendEmail(req.body.email , req.body.username)
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
  const updateAllowed = ["username", "email" ,"password","phone"]
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

server.listen(port , ()=>{
    console.log("Server Started on " , port);
})

