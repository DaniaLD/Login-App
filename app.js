const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');

const configDB = require('./config/database.js');
// Connect to db
mongoose.connect(configDB.url, { useMongoClient: true }, function(err) {
    if(err) {
        console.log('Could not connect to databse !!! -> ' + err);
    } else {
        console.log('Connected to database successfully ...');
    }
});

require('./config/passport')(passport);

app.use(expressValidator());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Setup template engine
app.set('view engine', 'ejs');

// Passport requirements
app.use(session({
    secret: 'This is my login application.This is my login application.',
    resave: true,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// Set static folder to public
app.use(express.static(__dirname + '/public'));

// Connect falsh
app.use(flash());

// Global variables for massages
app.use(function(req, res, next) {
   res.locals.success_msg = req.flash('success_msg');
   res.locals.error_msg = req.flash('error_msg');
   res.locals.error = req.flash('error');
   res.locals.user = req.user || null;
   next();
});

// Routes
require('./app/routes')(app, passport);

// Port
app.listen(port, function() {
    console.log("App is listening on port : " + port);
});