const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require('mongoose-findorcreate');
const cookieSession = require('cookie-session');
const { Router } = require('express');

mongoose.connect("mongodb+srv://user:user123@cluster0.jgfoq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {useUnifiedTopology: true, useNewUrlParser: true});


const userSchema = new mongoose.Schema({
    googleId: String,
    userName: String
});
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User",userSchema);

const app = express();

app.use(cookieSession({
    maxAge: 24*60*60*1000,
    keys:["bwjgw"]
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID:"735771243284-o7lti9uvue239o4grs6bt5etg5plfj9h.apps.googleusercontent.com",
    clientSecret:"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",
    callbackURL:"http://localhost:3000/auth/google/redirect"
},
function(accessToken, refreshToken, profile, cb) {
User.findOrCreate({googleId: profile.id, userName: profile.displayName}, function (err,user) {
    return cb(err, user);
});
}
));

passport.serializeUser(function(user, done) {
    done(null, user.id); 
});


passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

app.get("/",(req,res) => {
    res.send("Hello");
});

app.get("/auth/google", passport.authenticate("google",{
    scope: ["profile", "email"],
    prompt: "select_account"
}));

app.get("/auth/google/redirect",passport.authenticate('google'),(req, res) => {
    res.send(req.user.userName)
});

app.get("/auth/logout", (req, res) => {
    req.logout();
    req.session = null;
    res.send(req.user);
});
 
app.listen(3000);