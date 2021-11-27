
const mailgun = require('mailgun-js')

const api_key = "key-d05ff0f75bbb4f4968e683f042b97bc2"
const DOMAIN = "sandboxb242a3cb3af54be9aab899b1281cd2f4.mailgun.org"


const emailMSG = mailgun({apiKey:api_key , domain:DOMAIN})





function sendEmail(email , name) {
    const data = {
        from:"penani8204@kyrescu.com",
        to : email,
        subject:"Welcome "+name,
        text:"Thank you for joining us "+name+" give us your opinion about the app"
    }
    emailMSG.messages().send(data , (err,body)=>{
        if (err) {
            console.log(err);
        }else{
            console.log(body);
        }
    })
}

module.exports = {
    sendEmail
}