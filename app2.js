//jshint esversion:6
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require("body-parser")
const  lodash = require('lodash')
const path = require('path')
const date = require(__dirname +'/date.js')
// const encrypt = require("mongoose-encryption")
const session = require('express-session')
const passport = require("passport")
const passportLocalMongoose = require('passport-local-mongoose');
// const sha256 = require('sha-256-js');
const bcrypt = require('bcrypt');
//now we use industry standard bcrypt hashinf instead of sha256

const app = express()

app.set('view engine', 'ejs');
app.use( express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: 'this is or secret.',
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: true }
}))


app.use(passport.initialize());
app.use(passport.session())



mongoose.connect("mongodb://localhost:27017/userData", {useNewUrlParser: true, useUnifiedTopology: true},()=>{console.log("connected to database")});



// we created a mongoose schema and model of users
const userSchema = new mongoose.Schema(
  {
    username: {type: "string",required:"please enter a username"},
    // password: {type: "string",required:"please enter a password"}
    password: "string"
  })
  
  // const secret = "thisisouronetruesecretok";
// this is our main encrypting key and also used to decrypt so we stored above in an .env file
const secret = process.env.SECRET



  // userSchema.plugin(encrypt,{secret: secret , encryptedFields: ['password']})
  userSchema.plugin(passportLocalMongoose);

  const User = new mongoose.model('userdata',userSchema);


  passport.use(User.createStrategy());
 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());







app.get("/",(req,res)=>
{
  res.render("home",{})
})


app.route("/login")
.get((req,res)=>
{
  res.render("login",{})
})
.post(passport.authenticate('local'),(req,res)=>
{
res.redirect("/secrets")
})







app.route("/register")
.get((req,res)=>
{
  res.render("register",{})
})
.post((req,res)=>
{  
  console.log("reistered user and password is: >"+req.body.username+"  "+req.body.password)
  User.find({username: req.body.username},(err,foundusers)=>
  {
    if (foundusers.length == 0)
    {
     User.register({username:req.body.username},req.body.password,(err,user)=>
     {
       if(err)
       {
         console.log(err)
         res.redirect("/register")
         console.log("something went wrong")
       }
       else
       {
         passport.authenticate("local")(req,res,()=>
         {
           res.redirect("/secrets")
         })
        // passport.authenticate("local",(req,res)=>
        // {
        //   res.redirect("/secrets")
        // })

       }
     })
    }
    else
    {
      console.log("this user already exist... try registering with other name")
      res.redirect("/register")
    }
  })
    
})





app.get("/secrets",(req,res)=>
{
  // res.render("secrets",{})
  if (req.isAuthenticated())
  {
    res.render("secrets",{})
  }
  else
  {
    res.redirect("/login")
  }
})


app.get("/logout",(req,res)=>
{
  req.logout();
  res.redirect('/');
})





app.listen(3000, function()
 {
   
   console.log("server started at port 3000");
   console.log("<********************************************************>");
   console.log("full date is:    "+date.getDate());
   console.log("current time is: "+ date.getTime());
  //  console.log(process.env.API_KEY)
  //  console.log(typeof(process.env.API_KEY))
  //  console.log("rahul's sha256 hash: "+sha256(sha256("rahul53")))
  bcrypt.hash("Rahul", 5, function(err, hash) {
    // Store hash in your password DB.
    console.log("Rahul's bcrypt hash with 5 salting round is: "+hash)
});
  
  
  });
   

