var express = require('express')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var cookieSession = require('cookie-session')
var User = require('../schema/user')
var isAuthenticated = require('../middlewares/isAuthenticated.js')

var router = express.Router();

router.get('/login', function (req, res, next) {
    console.log("Login Page");
    res.render('login')
});

router.post('/login', function (req, res, next) {
    if (req.body.username_signup) {
        console.log("Posting Signup");
        var username = req.body.username_signup
        var pwd = req.body.password_signup
        var dbUser = new User({ username: username, password: pwd })
        dbUser.save(function (err, result) {
            if (!err) {
                res.redirect('/account/login')
            } else {
                next(err)
            }
        })
    } else {
        console.log("Posting Login");
        var dbUser = User.find({ username: req.body.username_login, password: req.body.password_login }, 
            function (err, results) {
                if (!err) {
                    if (results.length) {
                        req.session.user = results[0].username
                        res.redirect('/')
                    } else {
                        res.send('incorrect credentials')
                    }
                } else {
                    next(err)
                }
        })
    }
})

router.get('/logout', isAuthenticated, function (req, res, next) {
    req.session.user = ''
    res.redirect('/')
})

module.exports = router;
