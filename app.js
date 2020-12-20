//jshint esversion:6
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require("body-parser")
const  lodash = require('lodash')
const path = require('path')
const date = require(__dirname +'/date.js')
const encrypt = require("mongoose-encryption")
const sha256 = require('sha-256-js');


const app = express()

app.set('view engine', 'ejs');
app.use( express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect("mongodb://localhost:27017/userData", {useNewUrlParser: true, useUnifiedTopology: true},()=>{console.log("connected to database")});



// we created a mongoose schema and model of users
const userSchema = new mongoose.Schema(
  {
    username: {type: "string",required:"please enter a username"},
    password: {type: "string",required:"please enter a password"}
  })
  
  // const secret = "thisisouronetruesecretok";
// this is our main encrypting key and also used to decrypt so we stored above in an .env file
const secret = process.env.SECRET



  userSchema.plugin(encrypt,{secret: secret , encryptedFields: ['password']})

  const User = new mongoose.model('userdata',userSchema);







app.get("/",(req,res)=>
{
  res.render("home",{})
})


app.route("/login")
.get((req,res)=>
{
  res.render("login",{})
})
.post((req,res)=>
{
  console.log(req.body)
  console.log("----------------------")
  console.log("the passsword is:---> "+sha256(req.body.password))
  User.findOne({username:req.body.username},(err,foundUser)=>{
    if(foundUser)
    {
      if(sha256(req.body.password)==foundUser.password)
      {
       res.render("secrets",{})
       console.log("access granted")
       
      }
      else
      {
        res.redirect("/login")
        console.log("passwrod didnt match")
        // console.log(req.body.password)
        // console.log(typeof(req.body.password))
        // console.log(foundUser)
      }
    }
    else 
    {
      res.redirect("/login")
      console.log("no such user exists")
    }
  })
})








app.route("/register")
.get((req,res)=>
{
  res.render("register",{})
})
.post((req,res)=>
{  
  console.log(req.body)
  User.find({username:req.body.username},(err,foundUsers)=>
  { 
    
    if (foundUsers.length==0)
    {   
      const newUser = new User(
      {
       username:req.body.username,
       password:sha256(req.body.password)
      })
      newUser.save()
      res.redirect("/")

    }
    else
    {
      res.redirect("/register")
      console.log("user already exists")
    }
  })
  

    
})






app.listen(3000, function()
 {
   
   console.log("server started at port 3000");
   console.log("<********************************************************>");
   console.log("full date is:    "+date.getDate());
   console.log("current time is: "+ date.getTime());
  //  console.log(process.env.API_KEY)
  //  console.log(typeof(process.env.API_KEY))
  //  console.log("rahul"+sha256("rahul"))
  
  
  });
   

