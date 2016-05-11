var express = require('express');
//var formidable = require('formidable');

module.exports = function(passport,pool,dbconfig) { 
var router = express.Router();

router.get('/manage', function(req, res) {
   res.render('pages/cell1_view', {page: 'unified' ,auth:req.isAuthenticated()});
});

router.get('/declaration', function(req, res) {
   res.render('pages/cell2_view', {page: 'unified' ,auth:req.isAuthenticated()});
});

router.get('/agreement', function(req, res) {
   res.render('pages/cell3_view', {page: 'unified' ,auth:req.isAuthenticated()});
});

return router;
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/login');
}
