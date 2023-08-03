const User = require('../models/user');


module.exports.signIn = function(req, res) {
    return res.render('sign_in', {
        title: 'Sign In'
    });
}

module.exports.signUp = function(req, res) {
    return res.render('sign_up', {
        title: 'Sign Up'
    })
}