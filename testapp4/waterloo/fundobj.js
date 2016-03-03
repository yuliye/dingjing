
//given fund data, compute all fund stats
var _ = require("underscore");
module.exports.fundObj= function(data){
  //console.log(data);
  var fundData = {};

  //last montho return
  var lastm = _.last(data);
  
  //last 12 month return
  var mret = _.chain(data)
        .last(12)
        .map(function(row){return [row[1],row[2]];})
        .value();

  //last 12 month cumulative return
  /*
  var cumulative = 0;
  var mretc = _.chain(data)
        .last(13)
        .map(function(row){if(cumulative==0)cumulative=1;else cumulative*=(1+row[2]/100); return [row[1],cumulative];})
        .value();
*/
  var cumulative = 1;
  var mretc = _.chain(data)
        .last(12)
        .map(function(row){cumulative*=(1+row[2]/100); return [row[1],cumulative];})
        .value();
  mretc.splice(0, 0, [mretc[0][0]-1,1]);

  //full cumulative return
  var fcumulative = 1;
  var fmretc = _.chain(data)
        .map(function(row){fcumulative*=(1+row[2]/100); return [row[1],fcumulative];})
        .value();

  //full drawdown
  var fnddcu = 1;
  var fndd = _.chain(data)
        .map(function(row){return [row[1],row[2]];})
        .map(function(row){fnddcu*=(1+row[1]/100);if(fnddcu>1)fnddcu=1; return [row[0],fnddcu];})
        .value();
  var fdd=100*(_.min(fndd, function(row){ return row[1];})[1]-1);

  //CAROR
  var nom = _.last(fmretc)[0]-_.first(fmretc)[0]+1
  var ret = _.last(fmretc)[1]
  var caror = 100*(Math.pow(ret, 12/nom)-1);      

  //last 12 month drawdown
  var nddcu = 1;
  var ndd = _.chain(mret)
        .map(function(row){nddcu*=(1+row[1]/100);if(nddcu>1)nddcu=1; return [row[0],nddcu];})
        .value();
  var dd=100*(_.min(ndd, function(row){ return row[1];})[1]-1);
  
  //last 12 month low mark
  var ydd=100*(_.min(mretc, function(row){ return row[1];})[1]-1);

  //monthly return data group by year
  var anndata = _.chain(data)
        .map(function(row){ return [row[1],row[2]];})
        .groupBy(function(row){ return Math.floor(row[0]/12);})
        .value();

  var len = _.size(anndata);
  var annret = {}; //annual return array
  var annydd = {}; //annual low mark array
  var annndd = {}; //annual drawdown array
  var y2date = 0;
  for (var key in anndata){
  	var tmpcu = 1;
    var tmp = _.chain(anndata[key])
        .map(function(row){tmpcu*=(1+row[1]/100); return [row[0],tmpcu];})
        .value();
    y2date=100*(_.last(tmp)[1]-1);
    annret[key]=y2date; 
    annydd[key]=100*(_.min(tmp, function(row){return row[1];})[1]-1);
  } 

  for (var key in anndata){
  	var tmpcu = 1;
    var tmp = _.chain(anndata[key])
        .map(function(row){tmpcu*=(1+row[1]/100);if(tmpcu>1)tmpcu=1; return [row[0],tmpcu];})
        .value();
    annndd[key]=100*(_.min(tmp, function(row){ return row[1];})[1]-1);
  } 

//std dev
  var stdDev = 0;
  var sharp = 0;
  var rdata = _.chain(data)
        .map(function(row){return row[2];})
        .value();

if(rdata.length>1) {
  var rsum = rdata.reduce(function(sum, value){
    return sum + value;
  }, 0);

  var ravg = rsum/rdata.length;

  var squareDiffs = rdata.map(function(value){
    var diff = value - ravg;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });

  var sumSquareDiffs = squareDiffs.reduce(function(sum, value){
    return sum + value;
  }, 0);

  stdDev = Math.sqrt(sumSquareDiffs/(rdata.length-1));
  if(stdDev>0) sharp = (ravg - 1/12)/stdDev;
}
  //public facing function to get all the data
  //basic stats including fund id and name
  //info, last month, assets, last year return, dd and wm, caror, full_drawdown, year2date
  fundData.getbasic = function(){
    //console.log(lastm);
    return [lastm[0],lastm[2],lastm[3],100*(_.last(mretc)[1]-1),dd,ydd,caror,fdd, y2date,stdDev*Math.sqrt(12),sharp*Math.sqrt(12)];
  };

  //last 12 month return data
  fundData.last12 = function(){
    return mret;
  };

  //last 12 month cumulative return for chart (13 month)
  fundData.last12c = function(){
    return mretc;
  };

  //get the full cumulative return
  fundData.fretc = function(){
    return fmretc;
  };

  //annual data for yearly table
  fundData.getanndata = function(){
    return anndata;
  };

  //annual return and dd array
  fundData.getannstat = function(){
    return [annret,annndd];
  };

  return fundData;
}
