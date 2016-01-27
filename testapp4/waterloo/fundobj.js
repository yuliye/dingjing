
//given fund data, compute all fund stats
var _ = require("underscore");
module.exports.fundObj= function(data){
  //console.log(data);
  var fundData = {};
  var lastm = _.last(data);
  var mret = _.chain(data)
        .last(12)
        .map(function(row){return [row[1],row[2]];})
        .value();
  var cumulative = 1;
  var mretc = _.chain(data)
        .last(12)
        .map(function(row){cumulative*=(1+row[2]/100); return [row[1],cumulative];})
        .value();

  var anndata = _.chain(data)
        .map(function(row){ return [row[1],row[2]];})
        .groupBy(function(row){ return Math.floor(row[0]/12);})
        .value();

  var len = _.size(anndata);
  var annret = {};
  var annydd = {};
  var annndd = {};
  for (var key in anndata){
  	var tmpcu = 1;
    var tmp = _.chain(anndata[key])
        .map(function(row){tmpcu*=(1+row[1]/100); return [row[0],tmpcu];})
        .value();
    annret[key]=100*(_.last(tmp)[1]-1);
    annydd[key]=100*(_.min(tmp, function(row){ return row[1];})[1]-1);
  } 

  for (var key in anndata){
  	var tmpcu = 1;
    var tmp = _.chain(anndata[key])
        .map(function(row){if(row[1]>0)tmpcu=1;else tmpcu*=(1+row[1]/100); return [row[0],tmpcu];})
        .value();
    annndd[key]=100*(_.min(tmp, function(row){ return row[1];})[1]-1);
  } 

  fundData.test = function(){
    return annndd;
  };

  fundData.getbasic = function(){
    return [lastm[0],lastm[2],100*(_.last(mretc)[1]-1)];
  };
  
  fundData.getid = function(){
    return lastm[0];
  };

  fundData.getlret = function(){
    return lastm[2];
  };

  fundData.last12 = function(){
    return mret;
  };

  fundData.last12c = function(){
    return mretc;
  };

  fundData.getaret = function(){
    return 100*(_.last(mretc)[1]-1);
  };

  fundData.worstydd = function(){
  	return 100*(_.min(mretc, function(row){ return row[1];})[1]-1);
  };

  return fundData;
}