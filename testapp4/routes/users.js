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


router.get('/text',  isLoggedIn, function(req, res) {
  console.log(req.query.fundname);

  pool.getConnection(function(err, connection) { 
    connection.query('USE ' + dbconfig.database);
    connection.query("SELECT * FROM Fund_Table WHERE Fund_Name = ?",[req.query.fundname], function(err, rows){
      if(err){
        //err handling
      }
      else if(rows.length==0){
        res.redirect('home');
      }
      else {
      id = rows[0].Fund_ID;
      annret = ((rows[0].Annual_Return)*100).toFixed(2)+"%";
      lastret = ((rows[0].Last_Month_Return)*100).toFixed(2)+"%";
      res.redirect('detail?fundid='+id+'&annret='+annret+'&lastret='+lastret);
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
   queryString +=" round(Last_Month_Return,2) Last_Month_Return, round(Annual_Return,2) Annual_Return, ";
   queryString += " 50000 Assets FROM Combo_Table ct, ";
   queryString += "(  SELECT Combo_ID, sum(Annual_Return*Percentage) Annual_Return , ";
   queryString += " sum(Last_Month_Return*Percentage) Last_Month_Return ";
   queryString += " FROM Fund_Table f, Combo_Fund_Info cf WHERE  f.Fund_ID=cf.Fund_ID group by Combo_ID ) cfi ";
   queryString += " WHERE ct.Combo_ID = cfi.Combo_ID AND ct.User_ID= ?"; 
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


router.get('/modifycombo', isLoggedIn, function(req, res){
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
            console.log(rows.insertId);
          }
        });
      }
      else {
        //old combo name
        var id = rows[0].Combo_ID;
        connection.query('Insert INTO Combo_Data_Table (Combo_ID, Fund_ID, Amount) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE Amount = ?', [id,req.query.fundid,req.query.amount,req.query.amount]);
      }
    });
    connection.release();
  }); 
  res.redirect('combo');
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
   var index = 7;
   fetchData.combodetail(pool,dbconfig , queryString, values, header, pageIndex, req,res, index);
   //res.render('pages/bs_detail_view');
});


router.get('/collection',  isLoggedIn, function(req, res) {
  if(req.query.fundid){
    console.log(req.query.fundid);
    console.log(req.user.User_ID);
    pool.getConnection(function(err, connection) { 
        if(err){
          //err handling
        }
        else {
          connection.query('USE ' + dbconfig.database);
          connection.query('SELECT * FROM Saved_Fund_Table WHERE User_ID = ? AND Fund_ID = ?',[req.user.User_ID,req.query.fundid], function(err,rows){
            console.log(rows.length);
            console.log(req.query.hasSaved);
            if(err){
              //err handling
            }
            else if(rows.length ==0 && req.query.hasSaved==0){
              connection.query('INSERT INTO Saved_Fund_Table ( User_ID, Fund_ID ) values (?,?)', [req.user.User_ID,req.query.fundid]);
            }
            else if(rows.length > 0 && req.query.hasSaved==1) {
              connection.query('DELETE FROM Saved_Fund_Table WHERE User_ID = ? AND Fund_ID = ?',[req.user.User_ID,req.query.fundid]);
            }
          });
        }
    });  
  }
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
