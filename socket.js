const io = require('socket.io')(8900 , {

    cors:{
        
        origin: "https://chatwys-5b149.web.app"  
        //"http://localhost:3000"
        //'https://tinder-clone-68079.web.app'
    }

})

let users = []

const AddUser = (userId , socketId)=>{
    !users.some(user => user.userId === userId) && users.push({userId , socketId})
}
const removeUser = (socketId)=>{
    users = users.filter((user)=>user.socketId !== socketId)
}

const getUser = (userId)=>{
    return users.find((user)=> user.userId ===  userId)
}
io.on('connection' , (socket) =>{
    console.log("user connected");


    socket.on('addUser', userId => {
        AddUser(userId , socket.id)
        io.emit('getUser' , users)
    })

    socket.on('sendMessages' , ({senderId , receiverId , text})=>{
        const user = getUser(receiverId)
        io.to(user).emit("getMessages",{
            senderId,
            text
        })
    })

    io.emit('welcome' , "hello from server testiny")

    socket.on('disconnect' , ()=>{
        console.log("user disconnect");
        removeUser(socket.id)
        io.emit('getUser' , users)
    })
})