var isAuthenticated = function (req, res, next) {
  if (req.session.user) {
    next()
  } else {
    next(new Error('auth'))
  }
}

module.exports = isAuthenticated;
