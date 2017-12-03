const LocalStrategy = require('passport-local').Strategy;
const User = require('../app/models/user');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, email, password, done) {
            User.findOne({'email': email}, function(err, user) {
                if(err) return done(err);

                if(!user) {
                    return done(null, false, req.flash('error_msg', 'User not found'));
                } else {
                    User.comparePassword(password, user.password, function(err, isMatched) {
                        if(err) return done(err);
                        if(isMatched) {
                            return done(null, user);
                        } else {
                            return done(null, false, req.flash('error_msg', 'Password is incorrect'));
                        }
                    });
                }
            });
        }
    ));
}