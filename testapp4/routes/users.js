var express = require('express');
module.exports = function(passport,pool,dbconfig) { 
var router = express.Router();
var fetchData = require('../waterloo/fund.js');


code = '1122334'

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

router.get('/detail',  isLoggedIn, function(req, res) {
  var id = req.query['fundid'];
  var queryString = "SELECT fd.Fund_ID, Fund_Name, Year, Month, Month_Return FROM ";
      queryString += " Fund_Data_Table fd, Fund_Table f  ";
      queryString += " WHERE fd.Fund_ID=f.Fund_ID AND fd.Fund_ID=? ";
      queryString += " ORDER BY Year, Month";
   var values = [id]; 
   fetchData.detailresult(pool,dbconfig , queryString, values, header, pageIndex,req, res);
   //res.render('pages/bs_detail_view');
});


router.get('/combo',  isLoggedIn, function(req, res) {
  var queryString = "SELECT ct.Combo_ID Fund_ID, Combo_Name Fund_Name, ";
   queryString +=" round(Last_Month_Return,2) Last_Month_Return, round(Annual_Return,2) Annual_Return, ";
   queryString += " 50000 Assets FROM Combo_Table ct, ";
   queryString += "(  SELECT Combo_ID, sum(Annual_Return*Percentage) Annual_Return , ";
   queryString += " sum(Last_Month_Return*Percentage) Last_Month_Return ";
   queryString += " FROM Fund_Table f, Combo_Fund_Info cf WHERE  f.Fund_ID=cf.Fund_ID group by Combo_ID ) cfi ";
   queryString += " WHERE ct.Combo_ID = cfi.Combo_ID AND ct.User_ID= ?"; 
  var type = "combodetail?comboid";
  var values = [req.user.User_ID];
  fetchData.result(pool,dbconfig , queryString, values, header, pageIndex, res, type);
});



router.get('/list',   isLoggedIn, function(req, res) {
  var queryString = "SELECT Fund_ID, Fund_Name, Last_Month_Return, Annual_Return,Assets FROM Fund_Table";
  var type = "detail?fundid";
  var values = [];
  fetchData.result(pool,dbconfig , queryString,values, header, pageIndex, res, type);
});


router.get('/combodetail',  isLoggedIn, function(req, res) {
  var id = req.query['comboid'];
  var queryString = "SELECT Combo_ID Fund_ID, Combo_Name Fund_Name, Year, Month, round(sum(ret),2) Month_Return ";
      queryString += "FROM ( SELECT  ct.Combo_ID, Combo_Name, cf.Fund_ID, Year, Month, ";
      queryString += " Month_Return*percentage ret " ;
      queryString += " FROM Fund_Data_Table ft, Combo_Fund_Info cf, Combo_Table ct WHERE cf.Fund_ID=ft.Fund_ID ";
      queryString += " AND cf.Combo_ID=ct.Combo_ID and ct.Combo_ID=? ) temp ";
      queryString += " GROUP BY Year, Month ORDER BY  Year, Month";
   var values = [id];
   fetchData.detailresult(pool,dbconfig , queryString, values, header, pageIndex, req,res);
   //res.render('pages/bs_detail_view');
});


router.get('/collection',  isLoggedIn, function(req, res) {
  var queryString = "SELECT f.Fund_ID, Fund_Name, Last_Month_Return, Annual_Return,Assets FROM Fund_Table f, ";
  queryString += " Saved_Fund_Table sf WHERE f.Fund_ID=sf.Fund_ID AND sf.User_ID=?";
  var type = "detail?fundid";
  var values = [req.user.User_ID];
  fetchData.result(pool,dbconfig , queryString,values, header, pageIndex, res, type);
});

router.get('/searchlist',  isLoggedIn, function(req, res) {
    var type = "detail?fundid";
    var queryString = "SELECT sf.Fund_ID, Fund_Name, Last_Month_Return, Annual_Return, Assets FROM Fund_Table ft, ";
    queryString += "(SELECT Fund_ID, exp(sum(log(1+Month_Return/100))) cumRet FROM Fund_Data_Table ";
    queryString += " WHERE STR_TO_DATE(concat('01/',Month, '/', Year), '%d/%m/%Y') BETWEEN ";
    queryString += "STR_TO_DATE( ? , '%m/%d/%Y') AND STR_TO_DATE( ? , '%m/%d/%Y') GROUP BY Fund_ID ) sf ";
    queryString += "  WHERE ft.Fund_ID=sf.Fund_ID AND sf.cumRet > ? ";
    var values = [req.query.startTime, req.query.endTime, req.query.compoundRate/100+1];
    fetchData.result(pool,dbconfig , queryString, values, header, pageIndex, res, type);
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
