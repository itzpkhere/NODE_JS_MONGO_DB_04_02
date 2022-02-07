const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.urlencoded({ extended: false }))
app.use(cookieParser());

mongoose.connect('mongodb+srv://itzpkhere:itz_pk_here@nodetuts.epwi7.mongodb.net/users?retryWrites=true&w=majority');
const user_records = mongoose.model('user_records',{name : String ,city : String, email : String ,password : String });


app.get('/',(req,res)=>{
    console.log("Welcome To Node JS!");
    // res.cookie('name','pankaj',{ httpOnly : true, secure : true});
    res.json({ 
        message : 'Welcome To Node JS!'
    })
})

app.get('/login',(req,res)=>{
    res.json({
        message : 'Welcome To The Login Page!'
    })
})

app.post('/signup',(req,res)=>{
    const user = new user_records({name : 'b',city : 'Bombay',email : 'b@b',password : 'b'});
    user.save().then(()=>{
        const token = jwt.sign({ user_id: user._id },"my_secret_key");
        user.token = token;
        res.status(201).json({
            user : user,
            message : 'User Added Succesfully!'
        });
    })
})

app.post('/login',async(req,res)=>{ 
    const user = await user_records.findOne({ email : 'a@a', password : 'a'});
    if(user){
        const token = jwt.sign({ user_id : user._id},"my_secret_key");
        user.token = token;
        // res.status(200).json(user); 
        res.status(200).cookie("token",token,{ maxAge : 30 * 1000, httpOnly : true }).json(
            { 
                user,
                message : 'Logged In!' 
            });
    }else{
        res.status(400).send("Invalid Credentials");
    }
})

// Verify Token Middleware
function verifyToken(req,res,next){
    const token =  req.cookies.token || req.body.token;
    if(!token){
        return res.status(403).send('Forbidden');
    }else{
        try{
            const decoded = jwt.verify(token,'my_secret_key');
            req.user = decoded;
            console.log(decoded);
        }catch(err){
            res.status(401).send("Invalid Token!");
        }
    }
    next();
}

app.get('/protected',verifyToken,(req,res,decoded)=>{
        res.status(200).json({ 
            message : 'You are lucky if you can see this page!'
        })
})

app.get('/get-account-details',verifyToken, async(req,res,decoded)=>{
    const user = await user_records.findOne({ user : decoded.user_id });
    user.password = undefined;
    res.status(200).json({ user })
    // res.json({
    //     name : user.name,
    //     email : user.email,
    //     city : user.city,
    // })
})



app.get("/logout", (req, res) => {
    res.clearCookie(token);
    res.redirect("/");
})



app.listen(3000,()=>{
    console.log('Server started successfully on port 3000')
})
