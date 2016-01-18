var express = require('express');
module.exports = function(passport,pool,dbconfig) { 
var router = express.Router();


code = '1122334'
var data = [
        ['Bloody Mary', 3, 7, 11, 23, 11, 3, 7, 11, 23, 11, 43, 33],
        ['Martini', 5, 7, 11, 23, 11, 3, 7, 11, 23, 11, 3, 7],
        ['Scotch', 11, 7, 11, 23, 11, 7, 11, 23, 11, 3, 7, 11],
        ['Bloody Mary', 3, 7, 11, 23, 11, 3, 7, 11, 23, 11, 43, 33],
        ['Martini', 5, 7, 11, 23, 11, 3, 7, 11, 23, 11, 3, 7],
        ['Scotch', 11, 7, 11, 23, 11, 7, 11, 23, 11, 3, 7, 11],
        ['Bloody Mary', 3, 7, 11, 23, 11, 3, 7, 11, 23, 11, 43, 33],
        ['Martini', 5, 7, 11, 23, 11, 3, 7, 11, 23, 11, 3, 7],
        ['Scotch', 11, 7, 11, 23, 11, 7, 11, 23, 11, 3, 7, 11],
        ['Bloody Mary', 3, 7, 11, 23, 11, 3, 7, 11, 23, 11, 43, 33],
        ['Martini', 5, 7, 11, 23, 11, 3, 7, 11, 23, 11, 3, 7],
        ['Scotch', 11, 7, 11, 23, 11, 7, 11, 23, 11, 3, 7, 11],
        ['Bloody Mary', 3, 7, 11, 23, 11, 3, 7, 11, 23, 11, 43, 33],
        ['Martini', 5, 7, 11, 23, 11, 3, 7, 11, 23, 11, 3, 7],
        ['Scotch', 11, 7, 11, 23, 11, 7, 11, 23, 11, 3, 7, 11],
        ['Bloody Mary', 3, 7, 11, 23, 11, 3, 7, 11, 23, 11, 43, 33],
        ['Martini', 5, 7, 11, 23, 11, 3, 7, 11, 23, 11, 3, 7],
        ['Scotch', 11, 7, 11, 23, 11, 7, 11, 23, 11, 3, 7, 11]
    ];

var header = ['基金名', 
              '上月回报', 
              '上年回报', 
              '最大回撤', 
              '年复回报', 
              '最低投资',  
              '资产规模', 
              '管理费用', 
              '业绩提成', 
              '行业侧重', 
              '投资策略',
              '决策类型',
              '基金组成']

var pageIndex = [1, 5, 9]


/* GET users listing. */
router.get('/', isLoggedIn, function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/detail', isLoggedIn, function(req, res) {
  res.render('pages/bs_detail_view');
});

router.get('/list', isLoggedIn, function(req, res) {
  res.render('pages/bs_list_view',{
    header: header, 
    data: data, 
    pageIndex: pageIndex});
});

router.get('/search', isLoggedIn, function(req, res) {
  res.render('pages/bs_search_view');
});

router.get('/home', isLoggedIn, function(req, res) {
  console.log(req.user);
  res.render('pages/bs_home_view');
});

return router;
};
// route middleware to make sure
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}
