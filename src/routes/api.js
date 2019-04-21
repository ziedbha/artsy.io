var express = require('express')
var User = require('../schema/user.js')
var isAuthenticated = require('../middlewares/isAuthenticated.js')

// create router
var router = express.Router();

router.get('/getDrawings', function (req, res, next) {
  console.log("Getting drawings")
  var username = req.session.user;
  User.find({username: username}, function (err, result) {
    if (err) {
      return next(err)
    }
    res.json({ 
      username: username,
      drawings: result[0].drawings
    })
  })
})

router.post('/saveDrawings', function (req, res, next) {
  console.log("Saving drawings")
  var username = req.session.user;
  var drawings = null;
  if (req.body.length == 0) {
    drawings = []
  } else if (req.body.length == 1) {
    drawings = [req.body["drawings[]"]];
  } else {
    drawings = req.body["drawings[]"];
  }

  User.findOneAndUpdate({username: username}, 
    {$set: {drawings: drawings}},
    function (err, result) {
      
    if (err) next(err)
    res.json({})
  }) 
})

router.post('/logout', isAuthenticated, function (req, res, next) {
  console.log("Logging out")
  var username = req.session.user;
  var drawings = null;
  if (req.body.length == 0) {
    drawings = []
  } else if (req.body.length == 1) {
    drawings = [req.body["drawings[]"]];
  } else {
    drawings = req.body["drawings[]"];
  }

  req.session.user = ''
  User.findOneAndUpdate({username: username}, 
    {$set: {drawings: drawings}},
    function (err, result) {
      
    if (err) next(err)
    res.redirect('../account/login')
  }) 
})

module.exports = router;
