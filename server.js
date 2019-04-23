require('babel-register')({
  presets: [ 'env' ]
})

var path = require('path')
var express = require('express')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var cookieSession = require('cookie-session')

// routers
var accountRoutes = require('./src/routes/account.js')
var apiRoutes = require('./src/routes/api.js');

// instantiate express app...
var app = express();
var http = require('http').Server(app)
var io = require('socket.io')(http)

// instantiate a mongoose connect call
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/js197-artsy-io')

// set the express view engine to take care of ejs within html files
app.engine('html', require('ejs').__express);
app.set('view engine', 'html');

app.use('/static', express.static(path.join(__dirname, 'src')))

// set up body parser..
app.use(bodyParser.urlencoded({ extended: false }))

// // set up cookie session ...
app.use(cookieSession({
  name: 'local-session',
  keys: ['wowee'],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}))

app.get('/', function (req, res, next) {
  //console.log("User logged in: "  + req.session.user);
  if (req.session.user) {
    console.log("Main Page");
    res.render('index', {});
  } else {
    res.redirect('/account/login')
  }
});

io.on('connection', function(socket) {
  console.log('Socket.io: user connected!')

  socket.on('iAmDisconnected', function(data) {
    socket.broadcast.emit("someoneDisconnected", data)
  })
  socket.on('tellThemToDrawMe', function(data) {
    socket.broadcast.emit("drawSomeone", data)
  })
})

app.use('/static', express.static(path.join(__dirname, 'src')))

app.use('/api', apiRoutes)

app.use('/account', accountRoutes)

// don't put any routes below here!
app.use(function (err, req, res, next) {
  return res.send('ERROR :  ' + err.message)
})

http.listen(process.env.PORT || 3000, function () {
  console.log('App listening on port ' + (process.env.PORT || 3000))
})
