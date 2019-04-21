var express = require('express')
var User = require('../schema/user')

// create router
var router = express.Router();

router.get('/login', function (req, res, next) {
    console.log("Login Page");
    return res.render('login');
});

router.post('/login', function (req, res, next) {
    if (req.body.username_signup) {
        // Sign up
        console.log("Posting Signup");
        var username = req.body.username_signup

        User.find({ username: req.body.username }, 
            function (err, results) {
                if (!err) {
                    if (results.length) {
                        console.log("Username already taken!");
                        res.redirect('/account/login')
                    } else {
                        // can register
                        var pwd = req.body.password_signup
                        var newUser = new User({ username: username, password: pwd })
                        newUser.save(function (err, result) {
                            if (!err) {
                                res.redirect('/account/login')
                            } else {
                                next(err)
                            }
                        })
                    }
                } else {
                    next(err)
                }
        })
    } else  if (req.body.username_login) {
        // Log in
        console.log("Posting Login");
        User.find({ username: req.body.username_login, password: req.body.password_login }, 
            function (err, results) {
                if (!err) {
                    if (results.length) {
                        req.session.user = results[0].username
                        res.redirect('/')
                    } else {
                        res.send('Incorrect credentials')
                    }
                } else {
                    next(err)
                }
        })
    }
})

module.exports = router;
