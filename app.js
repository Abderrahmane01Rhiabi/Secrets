require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
// const encrypt = require('mongoose-encryption');
const md5 = require('md5');
const bycrypt = require('bcrypt');
const saltRounds = 10;

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

// const secret = process.env.SOME_LONG_UNGUESSABLE_STRING;
// console.log(process.env.SOME_LONG_UNGUESSABLE_STRING)
// userSchema.plugin(encrypt, { secret : secret, encryptedFields: ['password'] });

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
    
    bycrypt.hash(req.body.password, saltRounds).then((hash) =>{
        // Store hash in your password DB.
        const newUser = new User({
            email : req.body.email,
            password : hash
        });
    
        newUser.save().then((reply) => { // create a new user
            res.render("secrets");
            console.log(reply);
        }).catch((err) => {
            console.log(err);
        });
    }).catch((err) => {
        console.log(err);
    });

    // newUser.save(((err) => {
    //     if(err) console.log(err);
    //     else res.render("secrets");
    // }))

});

app.post("/login", (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email : email}).then((reply) => {
        // console.log(reply);
        if(reply !== null){ // if email exists
            
            bycrypt.compare(password, reply.password).then((result) => {
                    if(result) { // if password is correct
                        res.render("secrets");
                        console.log(reply);
                    }
                    else{ 
                        res.send("Wrong Password");
                    }
                }).catch((err) => {
                    console.log(err);
                });
        } else {
            res.send("Wrong Email");
        }

    }).catch((err) => {
        console.log(err);
    });

});


let port = process.env.PORT;
console.log("env : " + port);
if (port == null || port == "") port = 3000;

app.listen(port, () => {
    console.log(`Starting server on port ${port}`);
})