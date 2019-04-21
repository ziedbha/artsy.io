var express = require('express')
var User = require('../schema/user.js')
var isAuthenticated = require('../middlewares/isAuthenticated.js')

// create router
var router = express.Router();

router.get('/getDrawings', function (req, res, next) {
  var username = req.session.user;
  console.log(username);
  User.find({username: username}, function (err, result) {
    if (err) {
      return next(err)
    }
    res.json({ 
      drawings: result[0].drawings
    })
  })
})

router.post('/saveDrawings', function (req, res, next) {
  // var questionText = req.body.questionText        // ES6 shorthand
  // var author = req.session.user
  // console.log(req.body.questionText)
  // var q = new Question({questionText: questionText, author: author }) // ES6 shorthand
  // console.log(q)
  // q.save(function (err, result) {
  //   if (err) return res.send('ERROR :  ' + err.message) //next(err)
  //   res.json({ 
  //     status: 'OK'
  //   })
  // })
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

  console.log(req.body)
  User.findOneAndUpdate({username: username}, 
    {$set: {drawings: drawings}},
    function (err, result) {
      
    if (err) next(err)
    res.json({ 
      drawings: drawings
    })
  }) 
  req.session.user = ''
})

module.exports = router;
