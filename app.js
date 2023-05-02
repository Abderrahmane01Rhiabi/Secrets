//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


mongoose.connect("mongodb://127.0.0.1:27017/userDB ", { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected to MongoDB successfully");
});

const userSchema = new mongoose.Schema({ 
    email: String,
    password: String
});

const User = new mongoose.model("User", userSchema); // User is the collection name


app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    
    const newUser = new User({
        email : req.body.email,
        password : req.body.password
    });


    newUser.save().then((reply) => { // cre ate a new user
        res.render("secrets");
        console.log(reply);
    }).catch((err) => {
        console.log(err);
    });

    // newUser.save(((err) => {
    //     if(err) console.log(err);
    //     else res.render("secrets");
    // }))

});

app.post("/login", (req, res) => {

    User.findOne({email : req.body.email}).then((reply) => {
        // console.log(reply);
        if(reply !== null){ // if email exists
            if(reply.password === req.body.password) { // if password is correct
                res.render("secrets");
                console.log(reply);
            }
            else res.send("Wrong Password");
        } else {
            res.send("Wrong Email");
        }

    }).catch((err) => {
        console.log(err);
    });

});


let port = process.env.PORT;

if (port == null || port == "") port = 3000;

app.listen(port, () => {
    console.log("Server has started Succusfully");
})