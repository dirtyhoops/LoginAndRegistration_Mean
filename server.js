var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

var path = require('path');
app.use(express.static(path.join(__dirname, './static')));

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/loginregistration');

var session = require('express-session');
app.use(session({
    secret: 'denvernuggets',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000}
}))

var bcrypt = require('bcrypt');


app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// const flash = require('express-flash');
// app.use(flash());

var UserSchema = new mongoose.Schema({
    email: { type: String},
    first_name: { type: String},
    last_name: { type: String},
    password: { type: String}
}, {timestamps: true });

mongoose.model('User', UserSchema);
var User = mongoose.model('User');

//root route and displays all the mongooses
app.get('/', function(req, res) {
    res.render('index');
})

app.get('/success', function(req, res) {
    if(req.session.isloggedin == true) {
        res.render('dashboard', {session: req.session});
    } else {
        console.log("cant access this page, you're not logged in.")
        res.redirect('/')
    }
    
})


app.post('/register', function(req, res) {
    var password = req.body.password;
    var isValid = true;
    bcrypt.hash(password, 10, function(err, hash) {
        if(err) {
            console.log(err);
            res.redirect('/');
        } else {
            //query to see if the email exists
            User.findOne({email: req.body.email}, function(err, emaildup) {
                if(err) {
                    console.log(err);
                } else {
                    if(emaildup) {
                        console.log("email is already taken");
                        isValid = false;
                    } 
                    if(req.body.email.length < 6) {
                        console.log("email should be longer than 6");
                        isValid = false;
                    } 
                    if(req.body.first_name < 1) {
                        console.log("first name can't be empty");
                        isValid = false;
                    } 
                    if(req.body.last_name < 1) {
                        console.log("last name can't be empty");
                        isValid = false;
                    } 
                    if(req.body.password < 6) {
                        console.log("password should be longer than 6 characters");
                        isValid = false;
                    } 
                    
                    if(isValid == true) {
                        var register = new User({email: req.body.email, first_name: req.body.first_name, last_name: req.body.last_name, password: hash});
                        register.save();
                        console.log("successfully registered");
                        req.session.first_name = register.first_name;
                        req.session.userid = register._id;
                        //check if the user is logged in
                        console.log("user id is " + req.session.userid);
        
                        req.session.isloggedin = true;
                        res.redirect('/success');
                    } else {
                        res.redirect('/')  
                    }
                }
            });
        }
    })
});

app.post('/login', function(req, res) {
    User.findOne({email: req.body.email}, function(err, user){
        if(err) {
            console.log("can't login");
            res.redirect('/')
        } else {
            if(user){
                const typedpass = req.body.password;
                const hashedpass = user.password;
                bcrypt.compare(typedpass, hashedpass, function(err, correctpass) {
                    if(correctpass) {
                        console.log("you did it! logged in!");
                        req.session.first_name = user.first_name;
                        req.session.userid = user._id;
                        //check if the user is logged in
                        req.session.isloggedin = true;
                        res.redirect('/success');
                    } else {
                        console.log("incorrect password");
                        res.redirect('/');
                    } 
                });
            } else {
                console.log("user doesnt exist");
                res.redirect('/')
            } 
        } 
    })
})


app.post('/login', function(req, res) {
    User.findOne({email: req.body.email}, function(err, user){
        if(err) {
            console.log("can't login");
            res.redirect('/')
        } else {
            if(user){
                const typedpass = req.body.password;
                const hashedpass = user.password;
                bcrypt.compare(typedpass, hashedpass, function(err, correctpass) {
                    if(correctpass) {
                        console.log("you did it! logged in!");
                        req.session.first_name = user.first_name;
                        req.session.userid = user._id;
                        //check if the user is logged in
                        req.session.isloggedin = true;
                        res.redirect('/success');
                    } else {
                        console.log("incorrect password");
                        res.redirect('/');
                    } 
                });
                
            } else {
                console.log("user doesnt exist");
                res.redirect('/')
            } 
        } 
    })
})

app.post('/logout', function(req, res){
    req.session.destroy();
    console.log("you successfully logged out")
    res.redirect('/')
})


// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
})