//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const app = express();
// const encrypt = require("mongoose-encryption"); // level 2
// const md5 = require('md5');   // level 3
// const bcrypt = require('bcrypt');  // level 4
// const saltRounds = 10;             // level 4
const session = require('express-session')  // level 5
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

// use exporess-session
app.use(session({
  secret: "Our Little secret.",
  resave: false,
  saveUninitialized: false
}))

// use passport js
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
	email: String,
	password: String
});

// make sure userSchema is a mongoose.Schema, not just a JS object.
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
  res.render("home");
})

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
})

// User Register web page
app.post("/register", function(req, res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err){
      console.log(err)
      res.redirect("/register")
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      })
    }
  })
})

app.get("/secrets", function(req, res){
  if (req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
})

// User Login Web page
app.post("/login", function(req, res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  })

// use passport
  req.login(user, function(err){
    if (err){
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      })
    }
  })
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});//jshint esversion:6
