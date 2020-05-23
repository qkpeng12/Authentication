//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();
const encrypt = require("mongoose-encryption");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema ({
	email: String,
	password: String
});

// const secret = "Thisisourlittlesecret."
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password']  }); // before the "mongoose.model" line below

const User = mongoose.model("User", userSchema);

app.get("/", function(req, res){
  res.render("home");
})

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

// User Register

app.post("/register", function(req, res){
  const newUser = new User({
    email:     req.body.username,
    password:  req.body.password
  })

  newUser.save(function(err){ // encrypt password
    if (err) {
      res.send(err);
      console.log(err);
    } else {
      res.render("secrets");
    }
  })
})

// User Login Web page
app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;
  // decrypt password when read
  User.findOne({email: username}, function(err, foundUser){
    if (err) {
      console.log(err)
    } else {
      if (foundUser) {
        if ( password === foundUser.password ) {
          res.render("secrets")
        } else {
          res.send("Incorrect password, please try again")
        }
      } else {
        res.send("The user is not registered, please register before login.")
      }
    }
  })
})



app.listen(3000, function() {
  console.log("Server started on port 3000");
});//jshint esversion:6
