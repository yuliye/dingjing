var express = require('express');

module.exports = function(passport,pool,dbconfig) { 
var router = express.Router();
var fetchData = require('../waterloo/fund.js');
var robot = require('../waterloo/robot.js');

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


router.get('/text',  isLoggedIn, function(req, res) {
  pool.getConnection(function(err, connection) { 
    connection.query('USE ' + dbconfig.database);
    connection.query("SELECT Fund_ID FROM Fund_Table WHERE Fund_Name = ?",[req.query.fundname], function(err, rows){
      if(err){
        //err handling
      }
      else if(rows.length==0){
        res.redirect('home');
      }
      else {
      id = rows[0].Fund_ID;
      res.redirect('detail?fundid='+id);
      }
    });
    connection.release();
  }); 
  //res.render('pages/bs_detail_view',{
  //  index: 1
  //});
});

router.get('/detail',  isLoggedIn, function(req, res) {
  var id=req.query['fundid'];
  var queryString = "SELECT fd.Fund_ID, Fund_Name, Year, Month, Month_Return FROM ";
      queryString += " Fund_Data_Table fd, Fund_Table f  ";
      queryString += " WHERE fd.Fund_ID=f.Fund_ID AND fd.Fund_ID=? ";
      queryString += " ORDER BY Year, Month";
   var values = [id]; 
   var index = 7;
   fetchData.detailresult(pool,dbconfig , queryString, values, header, pageIndex,req, res, index);
   //res.render('pages/bs_detail_view');
});


router.get('/combo',  isLoggedIn, function(req, res) {
  var queryString = "SELECT ct.Combo_ID Fund_ID, Combo_Name Fund_Name, ";
   queryString +=" round(COALESCE(Last_Month_Return,0),2) Last_Month_Return, round(COALESCE(Annual_Return,0),2) Annual_Return, ";
   queryString += " 50000 Assets FROM Combo_Table ct LEFT OUTER JOIN ";
   queryString += "(  SELECT Combo_ID, sum(Annual_Return*Percentage) Annual_Return , ";
   queryString += " sum(Last_Month_Return*Percentage) Last_Month_Return ";
   queryString += " FROM Fund_Table f, Combo_Fund_Info cf WHERE  f.Fund_ID=cf.Fund_ID group by Combo_ID ) cfi ";
   queryString += " ON ct.Combo_ID = cfi.Combo_ID WHERE ct.User_ID= ?"; 
  var type = "combodetail?comboid";
  var values = [req.user.User_ID];
  var index = 3;
  fetchData.result(pool,dbconfig , queryString, values, header, pageIndex, res, type, index);
});

router.get('/list',   isLoggedIn, function(req, res) {
  var queryString = "SELECT Fund_ID, Fund_Name, Last_Month_Return, Annual_Return,Assets FROM Fund_Table";
  var type = "detail?fundid";
  var values = [];
  var index = 7;
  fetchData.result(pool,dbconfig , queryString,values, header, pageIndex, res, type, index);
});

router.get('/deletecombo',  isLoggedIn, function(req, res) {
    pool.getConnection(function(err, connection) { 
        if(err){
          //err handling
        }
        else {
          connection.query('USE ' + dbconfig.database);
          connection.query('DELETE FROM Combo_Table WHERE Combo_ID = ? AND User_ID = ?',[req.query.fundid,req.user.User_ID]);
          //connection.query('DELETE FROM Combo_Data_Table WHERE Combo_ID = ?',[req.query.fundid]);
          res.redirect('combo'); 
        }
        connection.release();
    }); 
});


router.get('/add2combo', isLoggedIn, function(req, res){
  pool.getConnection(function(err, connection) { 
    connection.query('USE ' + dbconfig.database);
    connection.query("SELECT Combo_ID FROM Combo_Table WHERE Combo_Name = ? AND User_ID = ?",[req.query.comboname, req.user.User_ID], function(err, rows){
      if(err){
        //err handling
      }
      else if(rows.length==0){
        //new combo name
        connection.query('INSERT INTO Combo_Table ( Combo_Name, User_ID ) values (?,?)', [req.query.comboname,req.user.User_ID], function(err, rows){
          if(err){
            //err handling
          }
          else {
            connection.query('INSERT INTO Combo_Data_Table ( Combo_ID, Fund_ID, Amount ) values (?,?,?)', [rows.insertId,req.query.fundid,req.query.amount]);
            res.redirect('combo');
          }
        });
      }
      else {
        //old combo name
        var id = rows[0].Combo_ID;
        connection.query('Insert INTO Combo_Data_Table (Combo_ID, Fund_ID, Amount) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE Amount = ?', [id,req.query.fundid,req.query.amount,req.query.amount]);
        res.redirect('combo');
      }
    });
    connection.release();
  });
});

router.get('/combodetail',  isLoggedIn, function(req, res) {
  var id = req.query['comboid'];
  var queryString = "SELECT Combo_ID Fund_ID, Combo_Name Fund_Name, Year, Month, round(sum(ret),2) Month_Return ";
      queryString += "FROM ( SELECT  ct.Combo_ID, Combo_Name, cf.Fund_ID, Year, Month, ";
      queryString += " Month_Return*percentage ret " ;
      queryString += " FROM Fund_Data_Table ft, Combo_Fund_Info cf, Combo_Table ct WHERE cf.Fund_ID=ft.Fund_ID ";
      queryString += " AND cf.Combo_ID=ct.Combo_ID and ct.Combo_ID=? and ct.User_ID=? ) temp ";
      queryString += " GROUP BY Year, Month ORDER BY  Year, Month";
   var values = [id, req.user.User_ID];
   var index = 7;
   fetchData.combodetail(pool,dbconfig , queryString, values, header, pageIndex, req,res, index);
   //res.render('pages/bs_detail_view');
});

router.get('/combodetail2', function(req, res) {
  //robot.fetchOneCombo(pool, dbconfig, req, res);
  robot.fetchOneCombo(pool,dbconfig,req,res);
});

router.get('/save',  isLoggedIn, function(req, res) {
    pool.getConnection(function(err, connection) { 
        if(err){
          //err handling
        }
        else {
          connection.query('USE ' + dbconfig.database);
          connection.query('SELECT * FROM Saved_Fund_Table WHERE User_ID = ? AND Fund_ID = ?',[req.user.User_ID,req.query.fundid], function(err,rows){
            if(err){
              //err handling
            }
            else if(rows.length ==0 && req.query.hasSaved==0){
              connection.query('INSERT INTO Saved_Fund_Table ( User_ID, Fund_ID ) values (?,?)', [req.user.User_ID,req.query.fundid]);
              res.redirect('collection');
            }
            else if(rows.length > 0 && req.query.hasSaved==1) {
              connection.query('DELETE FROM Saved_Fund_Table WHERE User_ID = ? AND Fund_ID = ?',[req.user.User_ID,req.query.fundid]);
              res.redirect('collection');
            }
            else {
              //err handling
              res.redirect('collection');
            }
          });
        }
        connection.release();
    });  
});

router.get('/collection',  isLoggedIn, function(req, res) {
  var queryString = "SELECT f.Fund_ID, Fund_Name, Last_Month_Return, Annual_Return,Assets FROM Fund_Table f, ";
  queryString += " Saved_Fund_Table sf WHERE f.Fund_ID=sf.Fund_ID AND sf.User_ID=?";
  var type = "detail?fundid";
  var values = [req.user.User_ID];
  var index = 2;
  fetchData.result(pool,dbconfig , queryString,values, header, pageIndex, res, type, index);
});

router.get('/searchlist',  isLoggedIn, function(req, res) {
    var type = "detail?fundid";
    var queryString = "SELECT sf.Fund_ID, Fund_Name, Last_Month_Return, Annual_Return, Assets FROM Fund_Table ft, ";
    queryString += "(SELECT Fund_ID, exp(sum(log(1+Month_Return/100))) cumRet FROM Fund_Data_Table ";
    queryString += " WHERE STR_TO_DATE(concat('01/',Month, '/', Year), '%d/%m/%Y') BETWEEN ";
    queryString += "STR_TO_DATE( ? , '%m/%d/%Y') AND STR_TO_DATE( ? , '%m/%d/%Y') GROUP BY Fund_ID ) sf ";
    queryString += "  WHERE ft.Fund_ID=sf.Fund_ID AND sf.cumRet > ? ";
    var values = [req.query.startTime, req.query.endTime, req.query.compoundRate/100+1];
    var index = 7;
    fetchData.result(pool,dbconfig , queryString, values, header, pageIndex, res, type, index);
});

/*
router.get('/detail', isLoggedIn, function(req, res) {
  res.render('pages/bs_detail_view',{
    index: 1
  });
});

router.get('/list', isLoggedIn, function(req, res) {
  res.render('pages/bs_list_view',{
    header: header, 
    data: data, 
    pageIndex: pageIndex,
    index: 1});
});
*/
router.get('/search', isLoggedIn, function(req, res) {
  res.render('pages/bs_search_view',{
    index: 1
  });
});

router.get('/home', isLoggedIn, function(req, res) {
  //console.log(req.user);
  //res.render('pages/bs_home_view',{
  //  index: 7
  //});
  var queryString = "SELECT Fund_ID, Fund_Name, Last_Month_Return, Annual_Return,Assets FROM Fund_Table";
  var type = "detail?fundid";
  var values = [];
  var index = 7;
  fetchData.result(pool,dbconfig , queryString,values, header, pageIndex, res, type, index);
});

//router.get('/compute', isLoggedIn, function(req, res) {
  //only super user can run this
  //if(req.user.User_ID==8||req.user.User_ID==9){
router.get('/compute', function(req, res) {
  var queryString = "SELECT * FROM Fund_Data_Table ";
  var values = [];
  robot.updateAllFund(pool, dbconfig, req, res, queryString, values);
});

router.get('/test', isLoggedIn, function(req, res) {
  //console.log(req.user);
  res.render('pages/bs_home_view',{
    index: 7
  });
});

//fund detail page
router.get('/fdetail', function(req, res) {
  var queryString = "SELECT f.Fund_ID Fund_ID, Fund_Name, COALESCE(Year,0) Year, ";
      queryString += " COALESCE(Month,0) Month, COALESCE(Month_Return,0) Month_Return FROM ";
      queryString += " Fund_Table f LEFT OUTER JOIN Fund_Data_Table fd ";
      queryString += " ON f.Fund_ID=fd.Fund_ID WHERE f.Fund_ID=? ";
  var values = [req.query.fundid]; 
  robot.fetchOneFund(pool, dbconfig, req, res, queryString, values);
});

//combo detail page
router.get('/cdetail', function(req, res) {
  var queryString = "SELECT Combo_ID Fund_ID, Combo_Name Fund_Name, yr Year, mn Month, sum(ret)/sum(pct) Month_Return ";
      queryString += "FROM ( SELECT  ct.Combo_ID, Combo_Name, COALESCE(cf.Fund_ID,-1), COALESCE(Year,0) yr, COALESCE(Month,0) mn, ";
      queryString += " COALESCE(Month_Return,0)*COALESCE(Amount,0) ret, COALESCE(Amount,1) pct " ;
      queryString += " FROM Combo_Table ct LEFT OUTER JOIN Combo_Data_Table cf ";
      queryString += " ON ct.Combo_ID=cf.Combo_ID LEFT OUTER JOIN Fund_Data_Table ft ";
      queryString += " ON cf.Fund_ID=ft.Fund_ID WHERE ct.Combo_ID=? AND ct.User_ID=?) temp ";
      queryString += " GROUP BY Combo_ID, Combo_Name, Year, Month";
  //var values = [req.query.comboid, req.user.User_ID]; 
  var values = [req.query.comboid, 8]; 
  robot.fetchOneCombo(pool, dbconfig, req, res, queryString, values);
});

//combo list page
router.get('/clist', function(req, res) {
  var queryString = "SELECT Combo_ID Fund_ID, Combo_Name Fund_Name, yr Year, mn Month, sum(ret)/sum(pct) Month_Return ";
      queryString += "FROM ( SELECT  ct.Combo_ID, Combo_Name, COALESCE(cf.Fund_ID,-1), COALESCE(Year,0) yr, COALESCE(Month,0) mn, ";
      queryString += " COALESCE(Month_Return,0)*COALESCE(Amount,0) ret, COALESCE(Amount,1) pct " ;
      queryString += " FROM Combo_Table ct LEFT OUTER JOIN Combo_Data_Table cf ";
      queryString += " ON ct.Combo_ID=cf.Combo_ID LEFT OUTER JOIN Fund_Data_Table ft ";
      queryString += " ON cf.Fund_ID=ft.Fund_ID WHERE ct.User_ID=? ) temp ";
      queryString += " GROUP BY Combo_ID, Combo_Name, Year, Month";
  //var values = [req.user.User_ID]; 
  var values = [8]; 
  robot.fetchComboList(pool, dbconfig, req, res, queryString, values);
});

//full fund list
router.get('/flist', function(req, res) {
  var queryString = " SELECT f.Fund_ID Fund_ID, Fund_Name, COALESCE(Year,0) Year, ";
      queryString += " COALESCE(Month,0) Month, COALESCE(Month_Return,0) Month_Return FROM ";
      queryString += " Fund_Table f LEFT OUTER JOIN Fund_Data_Table fd ";
      queryString += " ON f.Fund_ID=fd.Fund_ID ";
  var values = []; 
  robot.fetchFundList(pool, dbconfig, req, res, queryString, values);
});

//saved fund list
router.get('/slist', function(req, res) {
  var queryString = " SELECT s.Fund_ID Fund_ID, Fund_Name, COALESCE(Year,0) Year, ";
      queryString += " COALESCE(Month,0) Month, COALESCE(Month_Return,0) Month_Return FROM ";
      queryString += " Saved_Fund_Table s JOIN Fund_Table f ON s.Fund_ID=f.Fund_ID ";
      queryString += " LEFT OUTER JOIN Fund_Data_Table fd ON s.Fund_ID=fd.Fund_ID ";
      queryString += " WHERE s.User_ID =? ";
  //var values = [req.user.User_ID]; 
  var values = [8]; 
  robot.fetchFundList(pool, dbconfig, req, res, queryString, values);
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
