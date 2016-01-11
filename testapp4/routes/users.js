var express = require('express');
var client = require('twilio')('ACca3d316eecc3ee8aa422c1670f0b9cd4','c53e6369e7979242648b0903f5973df2'); 
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
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/detail', function(req, res) {
  res.render('pages/bs_detail_view');
});

router.get('/list', function(req, res) {
  res.render('pages/bs_list_view',{
    header: header, 
    data: data, 
    pageIndex: pageIndex});
});

router.get('/search', function(req, res) {
  res.render('pages/bs_search_view');
});

router.get('/home', function(req, res) {
  res.render('pages/bs_home_view');
});

router.get('/login', function(req, res) {
  res.render('pages/tw_login');
});

router.get('/reg', function(req, res) {
  res.render('pages/tw_reg',{
    code: ''
  });
});

router.get('/tw',function(req, res) {
  client.sendMessage({
    to: '+14155132523',
    from: '+14506007320',
    body: code
  }, function(err,data){
    if(err) 
      console.log(err);
    console.log(data);
  });
  res.render('pages/tw_reg',{
    code: code
  });
});



module.exports = router;
