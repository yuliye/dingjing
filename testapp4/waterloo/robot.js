var _ = require("underscore");
var helper = require('../waterloo/fundobj.js');
var rendEngine = require('../waterloo/rendpage.js');

module.exports.updateAllFund = function (pool, dbconfig, req, res, queryString, values){
//get data from mysql
//build an array of fundobj
//update mysql using the fundobj
  pool.getConnection(function(err, connection) {
    connection.query('USE ' + dbconfig.database);
    connection.query(queryString, values, function(err, rows){
      if(err){
      	//err handling
      } else if (!rows.length){
        console.log("no fund!");
        //err handling
      }
      else{
      	var robFunds = _.chain(rows)
      	        .map(function(row){ return [row.Fund_ID,(row.Month-1)+12*row.Year,row.Month_Return]})
      	        .groupBy(function(data){return data[0]})
                .map(function(row){return helper.fundObj(row)})
                .value();
        //now you have a list of smart funds        
        for(k in robFunds){
          var tmp=robFunds[k].getbasic();
          var updateQuery = "UPDATE Fund_Table SET Annual_Return = ?, ";
              updateQuery+= "Last_Month_Return = ?, CAROR = ?, Worst_DD = ?, ";
              updateQuery+= "Year2Date = ? WHERE Fund_ID = ?";
          var updateValue = [tmp[2],tmp[1],tmp[5],tmp[6],tmp[7],tmp[0]];
          connection.query(updateQuery, updateValue);
        }
      }
    });
    connection.release();
  });
}

module.exports.fetchOneFund = function (pool, dbconfig, req, res, queryString, values, index){
  pool.getConnection(function(err, connection) {
    connection.query('USE ' + dbconfig.database);
    connection.query("UPDATE Fund_Table SET Clicks = Clicks + 1 WHERE Fund_ID = ?",values);
    connection.query(queryString, values, function(err, rows){
    //connection.query(queryString, [3], function(err, rows){
      if(err){
        //console.log(err);
        //err handling
      } else if (!rows.length){
        console.log("no such fund!");
        //err handling
      }
      else{
	//var temprows = rows;
        var robFund = helper.fundObj(_.map(rows, function(row){ return [[row.Fund_ID, row.Fund_Name, row.Min_Invest, row.Mgmt_Fee, row.Perf_Fee], (row.Month-1)+12*row.Year, row.Month_Return, row.Month_Assets]}));
        //now you have a object that knows everything

        //console.log(robFund.getbasic());

	connection.query("SELECT * FROM Saved_Fund_Table Where User_ID = ? AND Fund_ID = ?", 
			[req.user.User_ID,rows[0].Fund_ID], function(err,rows){
          var hasSaved = rows.length;
          if(err)
                return done(err);
	        else{
              var comboname = [];    
              connection.query("SELECT Combo_Name FROM Combo_Table Where User_ID = ?", [req.user.User_ID], function(err,rows){
              if(err){
                //error handling
              }
              else {
                for(i=0;i<rows.length;i++)
                        comboname.push(rows[i].Combo_Name);
                        //rendEngine.onefund(robFund, temprows, res ,hasSaved, comboname);
                        rendEngine.fundd(robFund, res ,hasSaved, comboname, index);
              }
              });
		      }
	      });
      }
    });
    connection.release();
  });  
}


module.exports.fetchFundList = function (pool, dbconfig, req, res, queryString, values, index){
  pool.getConnection(function(err, connection) {
    connection.query('USE ' + dbconfig.database);
    connection.query(queryString, values, function(err, rows){
    //connection.query(queryString, [3], function(err, rows){
      if(err){
        console.log(err);
        //err handling
      } else if (!rows.length){
        console.log("no fund!");
        rendEngine.fundlist([], res, index); 
        //err handling
      }
      else{
        var robFundList = _.chain(rows)
                .map(function(row){ return [[row.Fund_ID,row.Fund_Name, row.Min_Invest, row.Mgmt_Fee, row.Perf_Fee, row.Clicks],(row.Month-1)+12*row.Year,row.Month_Return,row.Month_Assets]})
                .groupBy(function(data){return data[0]})
                .map(function(row){return helper.fundObj(row)})
                .value();

        //now you have a object that knows everything
  /*for(k in robFundList){
    console.log(robFundList[k].getbasic());
  }*/
	rendEngine.fundlist(robFundList, res, index); 
	} 
    });
    connection.release();
  });  
}

module.exports.fetchSearchList = function (pool, dbconfig, req, res, queryString, values, cond, index){
  pool.getConnection(function(err, connection) {
    connection.query('USE ' + dbconfig.database);
    connection.query(queryString, values, function(err, rows){
    //connection.query(queryString, [3], function(err, rows){
      if(err){
        console.log(err);
        //err handling
      } else if (!rows.length){
        console.log("no fund!");
        rendEngine.fundlist([], res, index); 
        //err handling
      }
      else{
        var robFundList = _.chain(rows)
                .map(function(row){ return [[row.Fund_ID,row.Fund_Name, row.Min_Invest, row.Mgmt_Fee, row.Perf_Fee, row.Clicks],(row.Month-1)+12*row.Year,row.Month_Return,row.Month_Assets]})
                .groupBy(function(data){return data[0]})
                .map(function(row){return helper.fundObj(row)})
                .filter(function(row){var fobj=row.getbasic(); return fobj[6]>cond[0]&&-1*fobj[4]<cond[1]&&fobj[2]/1000000>cond[2]&&fobj[0][2]<=cond[3];})
                .value();

        //now you have a object that knows everything, need to go throw the lis 
  //for(k in robFundList){
  //  console.log(robFundList[k].getbasic());
  //}
  rendEngine.fundlist(robFundList, res, index);
  } 
    });
    connection.release();
  });  
}

module.exports.fetchOneCombo = function (pool, dbconfig, req, res, queryString, values, index){
  //always compute on the fly
  pool.getConnection(function(err, connection) {
    connection.query('USE ' + dbconfig.database);
    //connection.query(queryString, [req.query['comboid'], req.user.User_ID], function(err, rows){
    connection.query(queryString, values, function(err, rows){
      if(err){
        //console.log(err);
        //err handling
      } else if (!rows.length){
        console.log("no such combo!");
        //err handling
      }
      else{
        //console.log(rows);
        //var temprows = rows;
        var robCombo = helper.fundObj(_.map(rows, function(row){ return [[row.Fund_ID,row.Fund_Name],(row.Month-1)+12*row.Year,row.Month_Return,row.Month_Assets]}));
        //now you have a object that knows everything
        //console.log(robCombo.getbasic());
	var comFunUrl = "SELECT cdt.Fund_ID fid, Fund_Name, Annual_Return, Last_Month_Return, Amount, Min_Invest, Mgmt_Fee, Perf_Fee FROM ";
                comFunUrl += " Fund_Table ft, Combo_Data_Table cdt ";
                comFunUrl += " WHERE ft.Fund_ID=cdt.Fund_ID AND cdt.Combo_ID=?";
            connection.query( comFunUrl, req.query['comboid'],
                              function(err, rows){
            if (err)
                //error handling
                return done(err);
            if (!rows.length) {
                //error handling
		 var comFunData=[];
     var bstat = [0,0,0,0];
		 //rendEngine.onecombo( robCombo, temprows, res , comFunData);
     rendEngine.combod( robCombo, res , comFunData, bstat, index);
            }
            else{
                var comLen = rows.length;
                var comFunData = new Array(comLen);
                //tot, mfee, pfee, minv
                var bstat = [0,0,0,0];
                for( var j=0; j<comLen; j++){ comFunData[j] = new Array(6);}
                for( var i=0; i<comLen; i++){
                        comFunData[i][0] = rows[i].fid;
                        comFunData[i][1] = rows[i].Fund_Name;
                        comFunData[i][2] = rows[i].Last_Month_Return.toFixed(2);
                        comFunData[i][3] = rows[i].Annual_Return.toFixed(2);
                        comFunData[i][4] = rows[i].Amount.toFixed(2);
                        bstat[0] += rows[i].Amount;
                        bstat[1] += rows[i].Mgmt_Fee*rows[i].Amount;
                        bstat[2] += rows[i].Perf_Fee*rows[i].Amount;
                        bstat[3] += rows[i].Min_Invest;
                }
                for( var i=0; i<comLen; i++){
                        comFunData[i][5] = (rows[i].Amount/bstat[0]*100).toFixed(2);
                }
                bstat[1]=bstat[1]/bstat[0];
                bstat[2]=bstat[2]/bstat[0];

		//rendEngine.onecombo( robCombo, temprows, res , comFunData);
    rendEngine.combod( robCombo, res , comFunData, bstat, index);
		}
      });
	}
     });
    connection.release();
  });  
}


module.exports.fetchFundName = function (pool, dbconfig, req, res, queryString){
  //always compute on the fly
  pool.getConnection(function(err, connection) {
    connection.query('USE ' + dbconfig.database);
    //connection.query(queryString, [req.user.User_ID], function(err, rows){
    connection.query(queryString, function(err, rows){
      if(err){
        console.log("error");
        //console.log(err);
        //err handling
      } else if (!rows.length){
        console.log("no combo!");
        //err handling
      }
      else{
                var names = [];
                for( var nam=0; nam<rows.length; nam++) {
                        names.push( rows[nam].Fund_Name);
                }
                res.end(JSON.stringify(names) );
      }
    });
    connection.release();
  });
}



module.exports.fetchComboList = function (pool, dbconfig, req, res, queryString, values, index){
  //always compute on the fly
  pool.getConnection(function(err, connection) {
    connection.query('USE ' + dbconfig.database);
    //connection.query(queryString, [req.user.User_ID], function(err, rows){
    connection.query(queryString, values, function(err, rows){
      if(err){
        console.log(err);
        //err handling
      } else if (!rows.length){
        console.log("no combo!");
        rendEngine.combolist([], res, index); 
        //err handling
      }
      else{

        var robComboList = _.chain(rows)
                .map(function(row){ return [[row.Fund_ID,row.Fund_Name],(row.Month-1)+12*row.Year,row.Month_Return,row.Month_Assets]})
                .groupBy(function(data){return data[0]})
                .map(function(row){return helper.fundObj(row)})
                .value();

        //now you have a object that knows everything
        /*
        for(k in robComboList){
          console.log(robComboList[k].getbasic());
        }*/
  
	rendEngine.combolist(robComboList, res, index);
	}
    });
    connection.release();
  });  
}
