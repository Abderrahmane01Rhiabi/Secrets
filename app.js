require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const md5 = require('md5');

//add session and passport
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//first 
app.use(session({
    secret : "the secret.", //used to encrypt the cookie
    resave : false, //update session even when no change
    saveUninitialized : false //only create session when user login
}));

//second
app.use(passport.initialize()); //initialize passport package 
app.use(passport.session()); //use passport to manage our session 


mongoose.connect("mongodb://127.0.0.1:27017/userDB ", { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected to MongoDB successfully");
});

const userSchema = new mongoose.Schema({ 
    username: String,
    password: String
});

//third
//add passportLocalMongoose as a plugin to our userSchema
userSchema.plugin(passportLocalMongoose); //hash and salt our password and save it to mongodb


const User = new mongoose.model("User", userSchema); // User is the collection name

//fourth 
passport.use(User.createStrategy()); //create local login strategy
passport.serializeUser(User.serializeUser()); //store user in session
passport.deserializeUser(User.deserializeUser()); //unstore user in session


app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/secrets", (req, res) => {
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect("/");
    });
});

app.post("/register", (req, res) => {
    
    User.register({username : req.body.username}, req.body.password).then((user) => {
        passport.authenticate("local")(req, res, () => {
            res.redirect("/secrets");
        });
    }).catch((err) => {
        console.log(err);
        res.redirect("/register");
    });

});

app.post("/login", (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err) => {
        if (err) {
            console.log(err);
            res.redirect("/login");
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        }
    });
});


let port = process.env.PORT;
console.log("env : " + port);
if (port == null || port == "") port = 3000;

app.listen(port, () => {
    console.log(`Starting server on port ${port}`);
})