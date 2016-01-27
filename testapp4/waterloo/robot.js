var _ = require("underscore");
var helper = require('../waterloo/fundobj.js');
module.exports.updateAllFund = function (pool, dbconfig){
//get data from mysql
//build an array of fundobj
//update mysql using the fundobj
  pool.getConnection(function(err, connection) {
    connection.query('USE ' + dbconfig.database);
    connection.query('SELECT * FROM Fund_Data_Table', function(err, rows){
      if(err){
      	//err handling
      }
      else{
      	var transform = _.chain(rows)
      	        .map(function(row){ return [row.Fund_ID,(row.Month-1)+12*row.Year,row.Month_Return]})
      	        .groupBy(function(data){return data[0]})
                .map(function(row){return helper.fundObj(row)})
                .value();
        //console.log(transform3);
        for(i=0;i<10;i++){
          console.log(transform[i].getbasic());
        }
      }
    });
  });
}

module.exports.fetchOneFund = function (pool, dbconfig, fundid){
	//fetch the data from fund table
	//if dirty bit is set, fetch additional data from fund data table
	//build fundobj as above
	//update mysql using the fundobj
	//set the dirty bit to clean
	//use fundobj data to render views
}
