const jwt = require('jsonwebtoken');
const User = require('../modules/user');

const auth = async (req , res , next)=>{
    try {
        const token =  req.header('Authorization').replace('Bearer ','')
        const decoded =  jwt.verify(token , 'weezok')
        const user = await User.findOne({_id:decoded._id , 'tokens.token':token})
        if (!user) {
            throw new Error()
        }else{
         req.token = token
         req.user = user
         next()   
        }
    }catch(error) {
        res.status(401).send({
        error:"please authenticate"
        })
    }
}

module.exports =  auth
