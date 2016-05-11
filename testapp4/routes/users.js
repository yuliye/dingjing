var express = require('express');

//var formidable = require('formidable');



module.exports = function(passport,pool,dbconfig) { 
var router = express.Router();
var fetchData = require('../waterloo/fund.js');
var robot = require('../waterloo/robot.js');
//router.use(bodyParser.json())
var resttest = require('./rest_test.js');


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

router.get('/unified', isLoggedIn, function(req, res) {
  pool.getConnection(function(err, connection) {
      connection.query('USE ' + dbconfig.database);
      var comboname = [];    
      connection.query("SELECT Combo_Name FROM Combo_Table Where User_ID = ?", [req.user.User_ID], function(err,rows){
        if(err){
          //error handling
        }
        else {
            for(i=0;i<rows.length;i++)
            comboname.push(rows[i].Combo_Name);
            res.render('pages/bs2_unified_view',{
                page: 'unified' ,auth:req.isAuthenticated(),
                combo: comboname
            });
        }
      });
      connection.release();
  }); 
});

router.get('/searchfun',  isLoggedIn, function(req, res) {
  pool.getConnection(function(err, connection) {
    connection.query('USE ' + dbconfig.database);
    connection.query("SELECT Fund_ID, Fund_Name, Annual_Return,Last_Month_Return FROM Fund_Table WHERE Fund_Name = ?",[req.query.fundname], function(err, rows){
      if(err){
        //err handling
      }
      else if(rows.length==0){
		
      }
      else {
	var addrowdata = new Array(5);
	addrowdata[0]=rows[0].Fund_ID;
	addrowdata[1]=rows[0].Fund_Name;
	addrowdata[2]=(rows[0].Annual_Return).toFixed(2);
        addrowdata[3]=(rows[0].Last_Month_Return).toFixed(2);
	addrowdata[4]=0;
      res.render('partials/combo-addfund-list', {
		addrowdata : addrowdata 
	});
      }
    });
    connection.release();
  });
  //res.render('pages/bs_detail_view',{
  //  index: 1
  //});
});

router.post('/addfundtocombo', function(req, res) {
	
        var comID = req.body["comboid"];
        pool.getConnection(function(err, connection) {
    		connection.query('USE ' + dbconfig.database);
	      connection.query( "DELETE FROM Combo_Data_Table WHERE Combo_ID = ? " ,comID, function(err, rows){
     		 if(err){
     			   //err handling
      		}
      		else if(rows.length==0){
			res.redirect('cdetail?comboid='+comID);
      			}
      			else {
			 for(var attrikey in req.body){
          		     if( attrikey=="comboid") continue;
				//console.log(attrikey);
                		var items = JSON.parse("["+req.body[attrikey] + "]");
                		var totalAm = 0;
                		for( var tLen=0; tLen<items.length; tLen++){
                         		totalAm += items[tLen];
                		}

		
				connection.query( "INSERT INTO Combo_Data_Table (Combo_ID, Fund_ID, Amount ) VALUES (?,?,?)" ,
					[comID,attrikey,totalAm], function(err, rows){
	     	      			if(err){
        					//err handling
      					}
      					else if(rows.length==0){
      					}
      					else {
      					}

    		    		}); 
	        	}
            res.redirect('cdetail?comboid='+comID);
    		}});
    		connection.release();
		});
		
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
      res.redirect('fdetail?fundid='+id);
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
          res.redirect('unified'); 
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
            res.redirect('unified');
          }
        });
      }
      else {
        //old combo name
        var id = rows[0].Combo_ID;
        connection.query('Insert INTO Combo_Data_Table (Combo_ID, Fund_ID, Amount) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE Amount = ?', [id,req.query.fundid,req.query.amount,req.query.amount]);
        res.redirect('unified');
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
              res.redirect('unified');
            }
            else if(rows.length > 0 && req.query.hasSaved==1) {
              connection.query('DELETE FROM Saved_Fund_Table WHERE User_ID = ? AND Fund_ID = ?',[req.user.User_ID,req.query.fundid]);
              res.redirect('unified');
            }
            else {
              //err handling
              res.redirect('unified');
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
    var type = "fdetail?fundid";

    var queryString = " SELECT f.Fund_ID Fund_ID, Fund_Name, Min_Invest, Mgmt_Fee, Perf_Fee, Clicks, COALESCE(Year,0) Year, ";
    queryString += " COALESCE(Month,0) Month, COALESCE(Month_Return,0) Month_Return, COALESCE(fd.Assets,0) Month_Assets FROM ";
    queryString += " Fund_Table f LEFT OUTER JOIN Fund_Data_Table fd ";
    queryString += " ON f.Fund_ID=fd.Fund_ID LEFT OUTER JOIN ";
    queryString += "(SELECT Fund_ID, exp(sum(log(1+Month_Return/100))) cumRet FROM Fund_Data_Table ";
    queryString += " WHERE STR_TO_DATE(concat('01/',Month, '/', Year), '%d/%m/%Y') BETWEEN ";
    queryString += "STR_TO_DATE( ? , '%m/%d/%Y') AND STR_TO_DATE( ? , '%m/%d/%Y') GROUP BY Fund_ID ) sf ";
    queryString += "  on f.Fund_ID=sf.Fund_ID WHERE sf.cumRet > ? ";
    var values = [req.query.startTime, req.query.endTime, req.query.compoundRate/100+1];
    var index = 7;
    robot.fetchFundList(pool, dbconfig, req, res, queryString, values, 7,7);

    //fetchData.result(pool,dbconfig , queryString, values, header, pageIndex, res, type, index);
});


router.get('/usearch',  isLoggedIn, function(req, res) {
    var type = "fdetail?fundid";

    var queryString = " SELECT f.Fund_ID Fund_ID, Fund_Name, Min_Invest, Mgmt_Fee, Perf_Fee, Clicks, COALESCE(Year,0) Year, ";
    queryString += " COALESCE(Month,0) Month, COALESCE(Month_Return,0) Month_Return, COALESCE(fd.Assets,0) Month_Assets FROM ";
    queryString += " Fund_Table f LEFT OUTER JOIN Fund_Data_Table fd ";
    queryString += " ON f.Fund_ID=fd.Fund_ID WHERE STR_TO_DATE(concat('01/',Month, '/', Year), '%d/%m/%Y') BETWEEN ";
    queryString += " STR_TO_DATE( ? , '%m/%d/%Y') AND STR_TO_DATE( ? , '%m/%d/%Y') ";
    var values = [req.query.startTime, req.query.endTime];
    var cond = [req.query.compoundRate, req.query.drawDown, req.query.aum, req.query.minInv]
    robot.fetchSearchList(pool, dbconfig, req, res, queryString, values, cond, 7);

    //fetchData.result(pool,dbconfig , queryString, values, header, pageIndex, res, type, index);
});

/////Typeahead codes

router.get('/autosearch', isLoggedIn, function (req, res){
        var queryString = "SELECT DISTINCT Fund_Name from Fund_Table ORDER BY Fund_Name ";
        robot.fetchFundName( pool, dbconfig, req, res, queryString );
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
  /*var queryString = "SELECT Fund_ID, Fund_Name, Last_Month_Return, Annual_Return,Assets FROM Fund_Table";
  var type = "detail?fundid";
  var values = [];
  var index = 7;
  fetchData.result(pool,dbconfig , queryString,values, header, pageIndex, res, type, index); */
  res.redirect('/users/unified');
});

router.get('/cta_home', isLoggedIn, function(req, res) {
  //console.log(req.user.First_Name);
  if(req.user.Fund_Manager==1) {

    // get a list of managed fund
    // get fund manager detail table
    // pass it to render

    res.render('pages/bs_cta_home_view',{
      auth:req.isAuthenticated(),
      page:'home',
      user: req.user
    });
  }
  else res.redirect('/users/cta_welcome');
  /*var queryString = "SELECT Fund_ID, Fund_Name, Last_Month_Return, Annual_Return,Assets FROM Fund_Table";
  var type = "detail?fundid";
  var values = [];
  var index = 7;
  fetchData.result(pool,dbconfig , queryString,values, header, pageIndex, res, type, index); */
  //res.redirect('/users/unified');
});

router.post('/updateprofile',  isLoggedIn, function(req, res) {
        var userID = req.user.User_ID;

        pool.getConnection(function(err, connection) {
        if(err){
          //err handling
        }
        else {
          connection.query('USE ' + dbconfig.database);
          connection.query('UPDATE User_Table SET First_Name=?, Last_Name=?,Email=?,Phone=?,Company=?, Website=?,Fund_CName=? WHERE User_ID=?', 
 				[req.body.pffirstname,req.body.pflastname,req.body.pfemail,req.body.pfworkphone,
				 req.body.pfcompany,req.body.pfwebsite,req.body.pffundname,userID] , function(err,rows){

            if(err){
              //err handling
            }
            else if(rows.length == 0 ){
		res.redirect('/users/cta_home');
            }
            else {
              //err handling
		res.redirect('/users/cta_home');
            }
          });
        }
        connection.release();
    }); 

});

router.post('/fetchprogramdata',  isLoggedIn, function(req, res) {
        var userID = req.user.User_ID;
	console.log(userID);
        pool.getConnection(function(err, connection) {
        if(err){
          //err handling
        }
        else {
          connection.query('USE ' + dbconfig.database);
	  connection.query( "SELECT Month_Return, Assets, Year, Month FROM Fund_Data_Table WHERE Fund_ID = ? ORDER BY Year, Month" ,
                                        [req.body.getoption], function(err, newrows){
                                        var fundinfo = [];
                                        if(err){ }  else{ if(newrows.length==0){
                                                fundinfo.push(0);
                                                fundinfo.push(0);
                                                fundinfo.push(2010);
                                                fundinfo.push(1);
                                         }
                                        else {
                                                        fundinfo.push( newrows[0].Month_Return);
                                                        fundinfo.push( newrows[0].Assets);
                                                        fundinfo.push( newrows[0].Year);
                                                        fundinfo.push( newrows[0].Month);
                                                }

                                        }
                                        res.render('partials/cta_program_data_table',{
                                                  auth:req.isAuthenticated(),
                                                  page:'data',
                                                  user: req.user,
                                                  tabledata : newrows,
                                                  fundinfo : fundinfo
                                                });

                                });
                }
 
        connection.release();
    });

});


router.get('/open', isLoggedIn, function(req, res) {
   res.render('pages/bs_open_view', {page: 'unified' ,auth:req.isAuthenticated()});
});

router.get('/manage', isLoggedIn, function(req, res) {
   res.render('pages/bs_manage_view', {page: 'unified' ,auth:req.isAuthenticated()});
});

router.get('/cta_fund', isLoggedIn, function(req, res) {
  if(req.user.Fund_Manager==1) {
     pool.getConnection(function(err, connection) {
        if(err){ }
        else {
          connection.query('USE ' + dbconfig.database);
          connection.query('SELECT Program_Name,Fund_ID from Fund_Table WHERE Fund_Manager_ID = ? ORDER BY Program_Name', 
                              [req.user.User_ID], function(err,rows){ 
            if(err){ } else if (rows.length == 0 ){ res.redirect('/users/cta_welcome'); }
            else {
		 var programname = [];
		 var fundID = [];
                for(i=0;i<rows.length;i++){ programname.push(rows[i].Program_Name);
                                            fundID.push(rows[i].Fund_ID);
                                          }

                connection.query( "SELECT Min_Invest, Mgmt_Fee, DATE_FORMAT(Inception_Date,\'%m/%d/%Y\') Inception_Date, Perf_Fee, Manager_Name, Fund_Description FROM Fund_Table WHERE Fund_Manager_ID = ? AND Program_Name = ? " ,
                                        [req.user.User_ID, programname[0]], function(err, rows){
                                        if(err){ }  else if(rows.length==0){ }
                                        else {
						var programinfo = [];
						programinfo.push(rows[0].Min_Invest);
						programinfo.push(rows[0].Mgmt_Fee);
						programinfo.push(rows[0].Inception_Date);
						programinfo.push(rows[0].Perf_Fee);
						programinfo.push(rows[0].Manager_Name);		
            programinfo.push(rows[0].Fund_Description); 			
       					        res.render('pages/bs_cta_fund_view',{
                     				  auth:req.isAuthenticated(),
                    				  page:'fund',
                     				  user: req.user,
                     				  programname : programname,
						  fundID : fundID,
                     				  programinfo : programinfo
						
                                        	});
					}
                                });
		}	
    		  });
            }
		connection.release();
          }); }
  else res.redirect('/users/cta_welcome');
});

router.get('/cta_data', isLoggedIn, function(req, res) {
  if(req.user.Fund_Manager==1) {
     pool.getConnection(function(err, connection) {
        if(err){ }
        else {
          connection.query('USE ' + dbconfig.database);
          connection.query('SELECT Program_Name, Fund_ID from Fund_Table WHERE Fund_Manager_ID = ? ORDER BY Program_Name',
                              [req.user.User_ID], function(err,rows){
            if(err){ } else if (rows.length == 0 ){ res.redirect('/users/cta_welcome'); }
            else {
                 var programname = [];
		 var fundID = [];
                for(i=0;i<rows.length;i++){ programname.push(rows[i].Program_Name);
					    fundID.push(rows[i].Fund_ID);
                                          }
                connection.query( "SELECT Month_Return, Assets, Year, Month FROM Fund_Data_Table WHERE Fund_ID = ? ORDER BY Year, Month" ,
                                        [ rows[0].Fund_ID], function(err, newrows){
					var fundinfo = [];
                                        if(err){ }  else{ if(newrows.length==0){
					 	fundinfo.push(0);
                                                fundinfo.push(0);
                                                fundinfo.push(2010);
                                                fundinfo.push(1);
					 }
                                        else {
							fundinfo.push( newrows[0].Month_Return);
							fundinfo.push( newrows[0].Assets);
							fundinfo.push( newrows[0].Year);
							fundinfo.push( newrows[0].Month); 
						}

                                        }
					res.render('pages/bs_cta_data_view',{
                                                  auth:req.isAuthenticated(),
                                                  page:'data',
                                                  user: req.user,
                                                  programname : programname,
						  fundID : fundID,
                                                  tabledata : newrows,
					          fundinfo : fundinfo 
                                                });
					
                                });
                }
                  });
            }
                connection.release();
          }); }
  else res.redirect('/users/cta_welcome');
});

router.get('/cta_add', isLoggedIn, function(req, res) {
  //console.log(req.user.First_Name);
  if(req.user.Fund_Manager==1) {

    // get a list of managed fund
    // get fund manager detail table
    // pass it to render

    res.render('pages/bs_cta_add_view',{
      auth:req.isAuthenticated(),
      page:'add',
      user: req.user
    });
  }
  else res.redirect('/users/cta_welcome');
});

router.post('/addprogram',  isLoggedIn, function(req, res) {
        var userID = req.user.User_ID;
        pool.getConnection(function(err, connection) {
        if(err){
          //err handling
        }
        else {
          var fname = req.body.fundnameforprogram+'-'+req.body.programname;
          if (req.body.fundnameforprogram == req.body.programname)
            fname = req.body.fundnameforprogram;

          connection.query('USE ' + dbconfig.database);
          connection.query('INSERT INTO Fund_Table( Fund_Manager_ID,Program_Name,Mgmt_Fee,Perf_Fee,Min_Invest,Inception_Date,Manager_Name,Fund_CName,Fund_Description, Fund_Name)  VALUES (?,?,?,?,?,STR_TO_DATE(?, \'%m/%d/%Y\'),?,?,?,? )',
                                 [userID,req.body.programname,req.body.managementfee,req.body.performancefee,
				  req.body.mininvestment,req.body.inception, req.body.managername, req.body.fundnameforprogram,
				   req.body.progcomment, fname] , function(err,rows){

            if(err){
              //err handling
            }
            else if(rows.length == 0 ){
                res.redirect('/users/cta_add');
            }
            else {
              //err handling
                res.redirect('/users/cta_add');
            }
          });
        }
        connection.release();
    });

});

router.post('/fetchprogram',  isLoggedIn, function(req, res) {
        var userID = req.user.User_ID;
        pool.getConnection(function(err, connection) {
        if(err){
          //err handling
        }
        else {
          connection.query('USE ' + dbconfig.database);
          connection.query('SELECT Manager_Name, Perf_Fee,Mgmt_Fee, Min_Invest, DATE_FORMAT(Inception_Date,\'%m/%d/%Y\') Inception_Date, Fund_Description FROM Fund_Table WHERE Fund_Manager_ID=? AND Fund_ID = ? ',
                  [userID,req.body.getoption] , function(err,rows){

            if(err){
              //err handling
            }
            else if(rows.length == 0 ){
                res.redirect('/users/cta_add');
            }
            else {
		//console.log(rows);
		res.json(rows);
		res.end();
            }
          });
        }
        connection.release();
    });

});

router.post('/fetchdatafund',  isLoggedIn, function(req, res) {
        var userID = req.user.User_ID;
        pool.getConnection(function(err, connection) {
        if(err){
          //err handling
        }
        else {
          connection.query('USE ' + dbconfig.database);
          connection.query('SELECT Fund_ID FROM Fund_Table WHERE Fund_Manager_ID=? AND Program_Name = ? ',
                  [userID,req.body.getoption] , function(err,rows){

            if(err){
              //err handling
            }
            else if(rows.length == 0 ){
                res.redirect('/users/cta_add');
            }
            else {
                //console.log(rows);
                res.json(rows);
                res.end();
            }
          });
        }
        connection.release();
    });

});

router.post('/deleteprogram',  isLoggedIn, function(req, res) {
        var userID = req.user.User_ID;
        pool.getConnection(function(err, connection) {
        if(err){
          //err handling
        }
        else {
          connection.query('USE ' + dbconfig.database);
          connection.query('DELETE FROM Fund_Table WHERE Manager_Name=? AND Fund_ID = ? ',
                  [req.body.ctamanname,req.body.ctaprogname] ,
         function(err,rows){
            if(err){ } else if (rows.length == 0 ){ res.end(); }
            else {
		 connection.query('DELETE FROM Fund_Data_Table WHERE Fund_ID = ? ',
                  [req.body.ctaprogname] ,
		         function(err,rows){
           		 if(err){ } else {
					res.redirect('/users/cta_fund');			
					res.end();
				 }
         		 });

            }
          });
        }
        connection.release();
    });

});

router.post('/updateprogram',  isLoggedIn, function(req, res) {
        var userID = req.user.User_ID;
        pool.getConnection(function(err, connection) {
        if(err){
          //err handling
        }
        else {
          connection.query('USE ' + dbconfig.database);
          connection.query('UPDATE Fund_Table SET Manager_Name=?,Perf_Fee=?,Mgmt_Fee=?,Min_Invest=?,Inception_Date=STR_TO_DATE(?, \'%m/%d/%Y\'), Fund_Description=? WHERE Fund_Manager_ID=? AND Fund_ID = ? ',
                  [req.body.ctamanname, req.body.ctaperfee,req.body.ctamanfee,req.body.ctamininvest,req.body.inception,req.body.ctafunddes,userID,req.body.ctaprogname] , 
         function(err,rows){
            if(err){ } else if (rows.length == 0 ){ res.end(); }
            else {
                res.end();
            }
          });
        }
        connection.release();
    });

});

router.post('/deleteprogramdata',  isLoggedIn, function(req, res) {
        var userID = req.user.User_ID;
	
        pool.getConnection(function(err, connection) {
        if(err){
          //err handling
        }
        else {
          connection.query('USE ' + dbconfig.database);
          connection.query('DELETE FROM Fund_Data_Table WHERE Fund_ID=? AND Year=? AND Month=?',
                  [req.body.ctadataprogname,req.body.ctadatayear,req.body.ctadatamonth], 
         function(err,rows){
            if(err){ } else if (rows.length == 0 ){ res.end(); }
            else {
                         connection.query( "SELECT Month_Return, Assets, Year, Month FROM Fund_Data_Table WHERE Fund_ID = ? ORDER BY Year, Month" ,
                                        [req.body.ctadataprogname], function(err, newrows){
                                        var fundinfo = [];
                                        if(err){ }  else{ if(newrows.length==0){
                                                fundinfo.push(0);
                                                fundinfo.push(0);
                                                fundinfo.push(2010);
                                                fundinfo.push(1);
                                         }
                                        else {
                                                        fundinfo.push( newrows[0].Month_Return);
                                                        fundinfo.push( newrows[0].Assets);
                                                        fundinfo.push( newrows[0].Year);
                                                        fundinfo.push( newrows[0].Month);
                                                }

                                        }
                                        res.render('partials/cta_program_data_table',{
                                                  auth:req.isAuthenticated(),
                                                  page:'data',
                                                  user: req.user,
                                                  tabledata : newrows,
                                                  fundinfo : fundinfo
                                                });

                                });

            }

          });
        }
        connection.release();
    });
});

router.post('/updateprogramdata',  isLoggedIn, function(req, res) {
        var userID = req.user.User_ID;
	console.log( req.body.ctadatamonret  +" "+ req.body.ctadataassets +" "+req.body.ctadataprogname +" "+req.body.ctadatayear +" "+req.body.ctadatamonth,req.body.ctadataprogname +" "+req.body.ctadatayear +" "+req.body.ctadatamonth );
        pool.getConnection(function(err, connection) {
        if(err){
          //err handling
        }
        else {
          connection.query('USE ' + dbconfig.database);
          connection.query('INSERT INTO Fund_Data_Table (Month_Return,Assets,Fund_ID,Year,Month) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE Month_Return=?,Assets=? ', 
                  [req.body.ctadatamonret, req.body.ctadataassets,req.body.ctadataprogname,req.body.ctadatayear,
                    req.body.ctadatamonth,req.body.ctadatamonret,req.body.ctadataassets] ,
         function(err,rows){
            if(err){ } else if (rows.length == 0 ){ res.end(); }
            else {
		         connection.query( "SELECT Month_Return, Assets, Year, Month FROM Fund_Data_Table WHERE Fund_ID = ? ORDER BY Year, Month" ,
                                        [req.body.ctadataprogname], function(err, newrows){
                                        var fundinfo = [];
                                        if(err){ }  else{ if(newrows.length==0){
                                                fundinfo.push(0);
                                                fundinfo.push(0);
                                                fundinfo.push(2010);
                                                fundinfo.push(1);
                                         }
                                        else {
                                                        fundinfo.push( newrows[0].Month_Return);
                                                        fundinfo.push( newrows[0].Assets);
                                                        fundinfo.push( newrows[0].Year);
                                                        fundinfo.push( newrows[0].Month);
                                                }

                                        }
                                        res.render('partials/cta_program_data_table',{
                                                  auth:req.isAuthenticated(),
                                                  page:'data',
                                                  user: req.user,
                                                  tabledata : newrows,
                                                  fundinfo : fundinfo
                                                });

                                });

            }

          });
        }
        connection.release();
    });

});

/*
router.get('/cta_data', isLoggedIn, function(req, res) {
  //console.log(req.user.First_Name);
  if(req.user.Fund_Manager==1) {

    // get a list of managed fund
    // get fund manager detail table
    // pass it to render

    res.render('pages/bs_cta_data_view',{
      auth:req.isAuthenticated(),
      page:'data',
      user: req.user
    });
  }
  else res.redirect('/users/cta_welcome');
});
*/
router.get('/cta_welcome', isLoggedIn, function(req, res) {
    res.render('pages/bs_cta_welcome_view',{
      auth:req.isAuthenticated(),
      page: 'login',
      user: req.user
    });
});

router.get('/compute', isLoggedIn, function(req, res) {
  //only super user can run this
  if(req.user.User_ID==8){
//router.get('/compute', function(req, res) {
  var queryString = "SELECT * FROM Fund_Data_Table ";
  var values = [];
  robot.updateAllFund(pool, dbconfig, req, res, queryString, values);
  } else {
    //go to err page
  }
});

router.get('/test', isLoggedIn, function(req, res) {
 // console.log(req.user);
  res.render('pages/bs_home_view',{
    index: 7
  });
});

//fund detail page

router.get('/fdetail', isLoggedIn, function(req, res) {
  var queryString = "SELECT f.Fund_ID Fund_ID, Fund_Name, Min_Invest, Mgmt_Fee, Perf_Fee, COALESCE(Year,0) Year, ";
      queryString += " COALESCE(Month,0) Month, COALESCE(Month_Return,0) Month_Return, COALESCE(fd.Assets,0) Month_Assets FROM ";
      queryString += " Fund_Table f LEFT OUTER JOIN Fund_Data_Table fd ";
      queryString += " ON f.Fund_ID=fd.Fund_ID WHERE f.Fund_ID=? ";
  var values = [req.query.fundid]; 
  robot.fetchOneFund(pool, dbconfig, req, res, queryString, values, 7);
});

//combo detail page
router.get('/cdetail2', isLoggedIn, function(req, res) {
  var queryString = "SELECT Combo_ID Fund_ID, Combo_Name Fund_Name, sum(minv) Min_Invest, sum(mfee)/sum(pct) Mgmt_Fee, sum(pfee)/sum(pct) Perf_Fee, yr Year, mn Month, sum(ret)/sum(pct) Month_Return, sum(ast)/sum(pct) Month_Assets ";
      queryString += "FROM ( SELECT  ct.Combo_ID, Combo_Name, COALESCE(cf.Fund_ID,-1), COALESCE(Year,0) yr, COALESCE(Month,0) mn, ";
      queryString += " COALESCE(Month_Return,0)*COALESCE(Amount,0) ret, COALESCE(ft.Assets,0)*COALESCE(Amount,0) ast, ",
      queryString += " COALESCE(f.Mgmt_Fee,0)*COALESCE(Amount,0) mfee, COALESCE(f.Perf_Fee,0)*COALESCE(Amount,0) pfee, ";
      queryString += " COALESCE(f.Min_Invest,0) minv, COALESCE(Amount,0.000000001) pct " ;
      queryString += " FROM Combo_Table ct LEFT OUTER JOIN Combo_Data_Table cf ";
      queryString += " ON ct.Combo_ID=cf.Combo_ID LEFT OUTER JOIN Fund_Data_Table ft ";
      queryString += " ON cf.Fund_ID=ft.Fund_ID LEFT OUTER JOIN Fund_Table f ON cf.Fund_ID=f.Fund_ID WHERE ct.Combo_ID=? AND ct.User_ID=?) temp ";
      queryString += " GROUP BY Combo_ID, Combo_Name, Year, Month";
  var values = [req.query.comboid, req.user.User_ID]; 
  //var values = [req.query.comboid, 8]; 
  robot.fetchOneCombo(pool, dbconfig, req, res, queryString, values);
});

//combo detail page
router.get('/cdetail', isLoggedIn, function(req, res) {
  var queryString = "SELECT Combo_ID Fund_ID, Combo_Name Fund_Name, yr Year, mn Month, sum(ret)/sum(pct) Month_Return, sum(ast)/sum(pct) Month_Assets ";
      queryString += "FROM ( SELECT  ct.Combo_ID, Combo_Name, COALESCE(cf.Fund_ID,-1), COALESCE(Year,0) yr, COALESCE(Month,0) mn, ";
      queryString += " COALESCE(Month_Return,0)*COALESCE(Amount,0) ret, COALESCE(ft.Assets,0)*COALESCE(Amount,0) ast, COALESCE(Amount,0.000000001) pct " ;
      queryString += " FROM Combo_Table ct LEFT OUTER JOIN Combo_Data_Table cf ";
      queryString += " ON ct.Combo_ID=cf.Combo_ID LEFT OUTER JOIN Fund_Data_Table ft ";
      queryString += " ON cf.Fund_ID=ft.Fund_ID WHERE ct.Combo_ID=? AND ct.User_ID=?) temp ";
      queryString += " GROUP BY Combo_ID, Combo_Name, Year, Month";
  var values = [req.query.comboid, req.user.User_ID]; 
  //var values = [req.query.comboid, 8]; 
  robot.fetchOneCombo(pool, dbconfig, req, res, queryString, values, 7);
});

//combo list page
router.get('/clist2', isLoggedIn, function(req, res) {
  var queryString = "SELECT Combo_ID Fund_ID, Combo_Name Fund_Name, sum(minv) Min_Invest, sum(mfee)/sum(pct) Mgmt_Fee, sum(pfee)/sum(pct) Perf_Fee, yr Year, mn Month, sum(ret)/sum(pct) Month_Return, sum(ast)/sum(pct) Month_Assets ";
      queryString += "FROM ( SELECT  ct.Combo_ID, Combo_Name, COALESCE(cf.Fund_ID,-1), COALESCE(Year,0) yr, COALESCE(Month,0) mn, ";
      queryString += " COALESCE(Month_Return,0)*COALESCE(Amount,0) ret, COALESCE(ft.Assets,0)*COALESCE(Amount,0) ast, "; 
      queryString += " COALESCE(f.Mgmt_Fee,0)*COALESCE(Amount,0) mfee, COALESCE(f.Perf_Fee,0)*COALESCE(Amount,0) pfee, ";
      queryString += " COALESCE(f.Min_Invest,0) minv, COALESCE(Amount,0.000000001) pct " ;
      queryString += " FROM Combo_Table ct LEFT OUTER JOIN Combo_Data_Table cf ";
      queryString += " ON ct.Combo_ID=cf.Combo_ID LEFT OUTER JOIN Fund_Data_Table ft ";
      queryString += " ON cf.Fund_ID=ft.Fund_ID LEFT OUTER JOIN Fund_Table f ON cf.Fund_ID=f.Fund_ID WHERE ct.User_ID=? ) temp ";
      queryString += " GROUP BY Combo_ID, Combo_Name, Year, Month";
  var values = [req.user.User_ID]; 
  //var values = [8]; 
  robot.fetchComboList(pool, dbconfig, req, res, queryString, values);
});

//combo list page
router.get('/clist', isLoggedIn, function(req, res) {
  var queryString = "SELECT Combo_ID Fund_ID, Combo_Name Fund_Name, yr Year, mn Month, sum(ret)/sum(pct) Month_Return, sum(ast)/sum(pct) Month_Assets ";
      queryString += "FROM ( SELECT  ct.Combo_ID, Combo_Name, COALESCE(cf.Fund_ID,-1), COALESCE(Year,0) yr, COALESCE(Month,0) mn, ";
      queryString += " COALESCE(Month_Return,0)*COALESCE(Amount,0) ret, COALESCE(ft.Assets,0)*COALESCE(Amount,0) ast, COALESCE(Amount,0.000000001) pct " ;
      queryString += " FROM Combo_Table ct LEFT OUTER JOIN Combo_Data_Table cf ";
      queryString += " ON ct.Combo_ID=cf.Combo_ID LEFT OUTER JOIN Fund_Data_Table ft ";
      queryString += " ON cf.Fund_ID=ft.Fund_ID WHERE ct.User_ID=? ) temp ";
      queryString += " GROUP BY Combo_ID, Combo_Name, Year, Month";
  var values = [req.user.User_ID]; 
  //var values = [8]; 
  robot.fetchComboList(pool, dbconfig, req, res, queryString, values, 3);
});


//full fund list
router.get('/flist', isLoggedIn, function(req, res) {
  var queryString = " SELECT f.Fund_ID Fund_ID, Fund_Name, Min_Invest, Mgmt_Fee, Perf_Fee, Clicks, COALESCE(Year,0) Year, ";
      queryString += " COALESCE(Month,0) Month, COALESCE(Month_Return,0) Month_Return, COALESCE(fd.Assets,0) Month_Assets FROM ";
      queryString += " Fund_Table f LEFT OUTER JOIN Fund_Data_Table fd ";
      queryString += " ON f.Fund_ID=fd.Fund_ID ";
  var values = []; 
  robot.fetchFundList(pool, dbconfig, req, res, queryString, values, 7);
});

//saved fund list
router.get('/slist', isLoggedIn, function(req, res) {
  var queryString = " SELECT s.Fund_ID Fund_ID, Fund_Name, Min_Invest, Mgmt_Fee, Perf_Fee, Clicks, COALESCE(Year,0) Year, ";
      queryString += " COALESCE(Month,0) Month, COALESCE(Month_Return,0) Month_Return, COALESCE(fd.Assets,0) Month_Assets FROM ";
      queryString += " Saved_Fund_Table s JOIN Fund_Table f ON s.Fund_ID=f.Fund_ID ";
      queryString += " LEFT OUTER JOIN Fund_Data_Table fd ON s.Fund_ID=fd.Fund_ID ";
      queryString += " WHERE s.User_ID =? ";
  var values = [req.user.User_ID]; 
  //var values = [8]; 
  robot.fetchFundList(pool, dbconfig, req, res, queryString, values, 2);
});

router.post('/bulksave',  isLoggedIn, function(req, res) {
	var userID = req.user.User_ID;
	var saveItem = req.body.fundID;
	var itemValue = [];
	saveItem.forEach( function( item ){  var eachItem = [userID, item]; itemValue.push(eachItem);     });
	
	 pool.getConnection(function(err, connection) {
        if(err){
          //err handling
        }
        else {
          connection.query('USE ' + dbconfig.database);
          connection.query('INSERT IGNORE INTO Saved_Fund_Table ( User_ID, Fund_ID ) VALUES ?', [itemValue] , function(err,rows){
            if(err){
              //err handling
            }
            else if(rows.length == 0 ){
		res.end();
            }
            else {
              //err handling
              res.end();
            }
          });
        }
        connection.release();
    });

});

router.post('/bulkdel',  isLoggedIn, function(req, res) {
        var userID = req.user.User_ID;
        var saveItem = req.body.fundID;
        var itemValue = [];
        saveItem.forEach( function( item ){  var eachItem = [userID, item]; itemValue.push(eachItem);     });

        pool.getConnection(function(err, connection) {
        if(err){
          //err handling
        }
        else {
          connection.query('USE ' + dbconfig.database);
          connection.query('DELETE FROM Saved_Fund_Table WHERE (User_ID, Fund_ID) IN (?)', [itemValue] , function(err,rows){
            if(err){
              //err handling
            }
            else if(rows.length == 0 ){
                res.end();
            }
            else {
              //err handling
              res.end();
            }
          });
        }
        connection.release();
    });

});


router.post('/addfund2combo', isLoggedIn, function(req, res){
        var comboname = req.body.comboName;	
        var saveItem = req.body.fundID;
        var itemValue = [];
	var amount = 1000;
        //saveItem.forEach( function( item ){  var eachItem = [userID, item]; itemValue.push(eachItem);     });

  pool.getConnection(function(err, connection) {
    connection.query('USE ' + dbconfig.database);
    connection.query("SELECT Combo_ID FROM Combo_Table WHERE Combo_Name = ? AND User_ID = ?",[comboname, req.user.User_ID], function(err, rows){
      if(err){
        //err handling
      }
      else if(rows.length==0){
        //new combo name
        connection.query('INSERT INTO Combo_Table ( Combo_Name, User_ID ) values (?,?)', [comboname,req.user.User_ID], function(err, rows){
          if(err){
            //err handling
          }
          else {
	    saveItem.forEach( function( item ){  var eachItem = [rows.insertId, item, amount]; itemValue.push(eachItem);     });
            connection.query('INSERT INTO Combo_Data_Table ( Combo_ID, Fund_ID, Amount ) values ?', [itemValue] , function(err,rows){
            	if(err){  } 
            	else if(rows.length == 0 ){  res.end(); }
            	     else { res.end(); }
	       });
          }
        });
      }
      else {
        //old combo name
        var id = rows[0].Combo_ID;
	saveItem.forEach( function( item ){  var eachItem = [id, item, amount]; itemValue.push(eachItem);     });
        connection.query('Insert IGNORE INTO Combo_Data_Table (Combo_ID, Fund_ID, Amount) VALUES ?', [itemValue], function(err,rows){
                if(err){  }
                else if(rows.length == 0 ){  res.end(); }
                     else { res.end(); }
               });
          }
    });
    connection.release();
  });
});

router.post('/combobulkdelete',  isLoggedIn, function(req, res) {
        var userID = req.user.User_ID;
        var saveItem = req.body.comboID;
        var itemValue = [];
        saveItem.forEach( function( item ){  var eachItem = [userID, item]; itemValue.push(eachItem);     });

        pool.getConnection(function(err, connection) {
        if(err){
          //err handling
        }
        else {
          connection.query('USE ' + dbconfig.database);
          connection.query('DELETE FROM Combo_Table WHERE (User_ID, Combo_ID) IN (?)', [itemValue] , function(err,rows){
            if(err){
              //err handling
            }
            else if(rows.length == 0 ){
                res.end();
            }
            else {
              //err handling
              res.end();
            }
          });
        }
        connection.release();
    });

});


router.get('/resttest', isLoggedIn, function(req, res) {
	console.log("star");
	 var selectResFunc = function( result, response){
	     	//var resu = JSON.parse(result);
		var resu = JSON.stringify(result);
		console.log(resu);
                console.log(result);
		res.end();
	 } 
	var url = "http://52.72.227.135/rest/v1/api/categoriesDetailedList?updateTime=2016-03-28-14h20m10s";

	 //var url = "https://c1cre709.caspio.com/rest/v1/views/Fund_Data_View/rows?q={\"select\":\"Fund_Table_Fund_ID, Fund_Table_Fund_Name, Fund_Data_Table_Year, Fund_Data_Table_Month, Fund_Data_Table_Monthly_Return\", \"orderby\":\"Fund_Table_Fund_ID, Fund_Data_Table_Year,Fund_Data_Table_Month\"}";
	console.log("start in ");
	 resttest.result(selectResFunc, url);	
/*	 res.render('pages/bs_cta_welcome_view',{
      auth:req.isAuthenticated(),
      page: 'login',
      user: req.user
    }); */
//	res.redirect('/users/login');

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
