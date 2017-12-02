const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    name: String,
    username: String,
    email: String,
    password: String
    // Unique
});

module.exports = mongoose.model('User', UserSchema);

module.exports.hashPassword = function(user, callback) {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, function(err, hash) {
            user.password = hash;
            user.save(callback);
        });
    });
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function(err, isMatched) {
        if (err) throw err;
        callback(null, isMatched);
    });
}