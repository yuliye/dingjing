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

module.exports.fetchOneFund = function (pool, dbconfig, req, res, queryString, values){
  pool.getConnection(function(err, connection) {
    connection.query('USE ' + dbconfig.database);
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
	var temprows = rows;
        var robFund = helper.fundObj(_.map(rows, function(row){ return [[row.Fund_ID, row.Fund_Name], (row.Month-1)+12*row.Year, row.Month_Return]}));
        //now you have a object that knows everything
	var hasSaved=0;
	connection.query("SELECT * FROM Saved_Fund_Table Where User_ID = ? AND Fund_ID = ?", 
			[req.user.User_ID,rows[0].Fund_ID], function(err,rows){
          hasSaved = rows.length;
          if(err)
                return done(err);
	  else{
		return hasSaved;
		}
	 });

	 var comboname = [];		
	 connection.query("SELECT Combo_Name FROM Combo_Table Where User_ID = ?", [req.user.User_ID], function(err,rows){
              if(err){
                //error handling
              }
              else {
                for(i=0;i<rows.length;i++)
                        comboname.push(rows[i].Combo_Name);
		rendEngine.onefund( robFund, temprows, res ,hasSaved, comboname);

		}
	  });
      }
    });
    connection.release();
  });  
}


module.exports.fetchFundList = function (pool, dbconfig, req, res, queryString, values){
  pool.getConnection(function(err, connection) {
    connection.query('USE ' + dbconfig.database);
    connection.query(queryString, values, function(err, rows){
    //connection.query(queryString, [3], function(err, rows){
      if(err){
        //console.log(err);
        //err handling
      } else if (!rows.length){
        console.log("no fund!");
        //err handling
      }
      else{
        var robFundList = _.chain(rows)
                .map(function(row){ return [[row.Fund_ID,row.Fund_Name],(row.Month-1)+12*row.Year,row.Month_Return]})
                .groupBy(function(data){return data[0]})
                .map(function(row){return helper.fundObj(row)})
                .value();

        //now you have a object that knows everything
	rendEngine.fundlist( robFundList, res ); 
	} 
    });
    connection.release();
  });  
}

module.exports.fetchOneCombo = function (pool, dbconfig, req, res, queryString, values){
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
        var temprows = rows;
        var robCombo = helper.fundObj(_.map(rows, function(row){ return [[row.Fund_ID,row.Fund_Name],(row.Month-1)+12*row.Year,row.Month_Return]}));
        //now you have a object that knows everything
        //console.log(robCombo.getbasic());
	var comFunUrl = "SELECT cdt.Fund_ID fid, Fund_Name, Annual_Return, Last_Month_Return, Amount FROM ";
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
		 rendEngine.onecombo( robCombo, temprows, res , comFunData);
            }
            else{
                var comLen = rows.length;
                var comFunData = new Array(comLen);
                for( var j=0; j<comLen; j++){ comFunData[j] = new Array(5);}
                for( var i=0; i<comLen; i++){
                        comFunData[i][0] = rows[i].fid;
                        comFunData[i][1] = rows[i].Fund_Name;
                        comFunData[i][2] = rows[i].Last_Month_Return.toFixed(2);
                        comFunData[i][3] = rows[i].Annual_Return.toFixed(2);
                        comFunData[i][4] = rows[i].Amount.toFixed(2);
                }
		rendEngine.onecombo( robCombo, temprows, res , comFunData);
		}
      });
	}
     });
    connection.release();
  });  
}


module.exports.fetchComboList = function (pool, dbconfig, req, res, queryString, values){
  //always compute on the fly
  pool.getConnection(function(err, connection) {
    connection.query('USE ' + dbconfig.database);
    //connection.query(queryString, [req.user.User_ID], function(err, rows){
    connection.query(queryString, values, function(err, rows){
      if(err){
        //console.log(err);
        //err handling
      } else if (!rows.length){
        console.log("no combo!");
        //err handling
      }
      else{
        var robComboList = _.chain(rows)
                .map(function(row){ return [[row.Fund_ID,row.Fund_Name],(row.Month-1)+12*row.Year,row.Month_Return]})
                .groupBy(function(data){return data[0]})
                .map(function(row){return helper.fundObj(row)})
                .value();

        //now you have a object that knows everything
	rendEngine.combolist( robComboList, res );
	}
    });
    connection.release();
  });  
}
