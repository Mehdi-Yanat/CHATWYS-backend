const mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
require('../db/mongooseDB')

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        validate(value){
            if (!validator.isEmail(value)) {
                throw new Error ('its not an email please check !')
            }else{
                console.log(value);
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        validate(password){
            if (!validator.isLength(password , 8 , undefined)) {
                throw new Error ('the password must have 8 characters')
            }else{
                console.log(password);
            }
        }
    },
    age:{
        type:String,
        validate(age){
            if (!validator.isLength(age ,0 , 2) ) {
                throw new Error ('please check your age number')
            }else{
                console.log(age);
            }
        }
    },
    phone:{
        type:String,
        validate(phone){
            if (!validator.isLength(phone , 8 ,undefined)) {
                throw new Error ('please check your phone number')
            }
            else{
                console.log(phone);
            }
        },
        trim:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
    ,
    friends:[
       {
           type:String
       }
    ],
    friendsRequest:[{
        type:String
    }],
    status:{
        type:String,
        default:"Online"
    },
    socketId:{
        type:String
    }

})

userSchema.virtual('cards' , {
    ref:'cards' ,
    localField:'_id',
    foreignField:'owner'
})

userSchema.methods.generateToken = async function(){
    const user = this
    console.log(user);
    const token = jwt.sign({_id:user._id.toString()} ,"weezok")
    user.tokens = user.tokens.concat({token})
    await user.save()
    console.log(token);
    return token
}

userSchema.methods.toJSON = function () {
    const user = this
    const object = user.toObject()

    delete object.password
    delete object.tokens
    delete object.avatar
    
    return object
}
userSchema.statics.findByCredentials = async (email , password)=>{
    const user = await User.findOne({email}) 
    if (!user) {
        throw new Error('unable to login')
    }
    console.log(user);
    const isMATCH = await bcrypt.compare(password , user.password)
    if (!isMATCH) {
        throw new Error('unable to log in')
    }
    console.log(isMATCH);
    return user
}

// hash password 

userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
      user.password =  await bcrypt.hash(user.password , 8)
    }
    next()
})

const User = mongoose.model('user' , userSchema)

module.exports = User
