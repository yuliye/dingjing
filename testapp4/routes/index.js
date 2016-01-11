var express = require('express');
var router = express.Router();

/* GET home page. */
/*
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
*/

router.get('/', function(req, res) {
  res.render('pages/landing');
});

router.get('/public/:name?', function(req, res) {
  res.render('pages/short_header',{title:req.params.name});
});

module.exports = router;
