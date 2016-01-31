var _ = require("underscore");
var helper = require('../waterloo/fundobj.js');
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
          console.log(tmp);
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
        console.log(rows);
        var robFund = helper.fundObj(_.map(rows, function(row){ return [[row.Fund_ID, row.Fund_Name], (row.Month-1)+12*row.Year, row.Month_Return]}));
        //now you have a object that knows everything
        console.log(robFund.getbasic());
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
        console.log(rows);
        var robFundList = _.chain(rows)
                .map(function(row){ return [[row.Fund_ID,row.Fund_Name],(row.Month-1)+12*row.Year,row.Month_Return]})
                .groupBy(function(data){return data[0]})
                .map(function(row){return helper.fundObj(row)})
                .value();

        //now you have a object that knows everything
        for(k in robFundList)
          console.log(robFundList[k].getbasic());
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
        //console.log(rows);
        var robCombo = helper.fundObj(_.map(rows, function(row){ return [[row.Fund_ID,row.Fund_Name],(row.Month-1)+12*row.Year,row.Month_Return]}));
        //now you have a object that knows everything
        console.log(robCombo.getbasic());
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
        console.log(rows);
        var robComboList = _.chain(rows)
                .map(function(row){ return [[row.Fund_ID,row.Fund_Name],(row.Month-1)+12*row.Year,row.Month_Return]})
                .groupBy(function(data){return data[0]})
                .map(function(row){return helper.fundObj(row)})
                .value();

        //now you have a object that knows everything
        for(k in robComboList)
          console.log(robComboList[k].getbasic());
      }
    });
    connection.release();
  });  
}
