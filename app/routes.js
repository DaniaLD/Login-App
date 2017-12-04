const mongoose = require('mongoose');
const User = require('./models/user');
mongoose.Promise = global.Promise;

// Drop database before each run
mongoose.connection.collections.users.drop();

module.exports = function(app, passport) {

    // Home page
    app.get('/', function(req, res) {
        res.render('index');
    });

    // Login page
    app.get('/login', function(req, res) {
        res.render('login');
    });

    app.post('/login', passport.authenticate('local-login', {
        failureRedirect: '/login',
        successRedirect: '/profile',
        failureFlash: true
    }));

    // Signup page
    app.get('/signup', function(req, res) {
        res.render('signup', {errors: null});
    });

    app.post('/signup', function(req, res) {
        let name = req.body.name;
        let username = req.body.username;
        let email = req.body.email;
        let password = req.body.password;

        req.checkBody('name', 'Name is required!').notEmpty();
        req.checkBody('username', 'Username is required!').notEmpty();
        req.checkBody('email', 'Email is required!').notEmpty();
        req.checkBody('email', 'Email is invalid!').isEmail();
        req.checkBody('password', 'Password is required!').notEmpty();
        req.checkBody('confirmPassword', 'Passwords do not match!').equals(password);

        let errors = req.validationErrors();

        // Check if there are any users with this email
        User.findOne({'email': email}).then(function(found) {
            if(found) {
                req.flash('error_msg', 'Email is token!');
                res.redirect('/signup');
            } else {
                if(errors) {
                    res.render('signup', { errors: errors });
                } else {
                    let user = new User({
                        name: name,
                        username: username,
                        email: email,
                        password: password
                    });

                    User.hashPassword(user, function(err) {
                        if(err) {
                            console.log('Did not create user !!! -> ' + err);
                        } else {
                            console.log('User created successfully ...');
                        }
                        req.flash('success_msg', 'You signed up successfully, now can login');
                        res.redirect('/login');
                    })
                }

            }
        });
    });

    // Profile page
    app.get('/profile', isLoggedin, function(req, res) {
        res.render('profile', {user: req.user});
    });

    // Edit profile
    app.get('/profile/edit', isLoggedin, function(req, res) {
       res.render('edit-profile', {user: req.user});
    });

    app.post('/profile/edit', function(req, res) {
        let query = {'email': req.user.email};
        User.updateOne(query, {$set: {'name': req.body.name, 'username': req.body.username}} ,function(err) {
            if(err) throw err;
            console.log('User information changed successfully ...');
        });

        req.flash('success_msg', 'Changes saved successfully.');
        res.redirect('/profile');
    });

    // Logout
    app.get('/logout', function(req, res) {
        req.logout();
        req.flash('success_msg', 'You are logged out.');
        res.redirect('/login');
    });
};

function isLoggedin(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'You need to login first!');
        res.redirect('/login');
    }
}
