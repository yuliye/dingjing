
//given fund data, compute all fund stats
var _ = require("underscore");
module.exports.fundObj= function(data){
  //console.log(data);
  var fundData = {};
   
  var sp500 = [
[ 24000, -5.09],
[ 24001, -2.01],
[ 24002, 9.67],
[ 24003, -3.08],
[ 24004, -2.19],
[ 24005, 2.39],
[ 24006, -1.63],
[ 24007, 6.07],
[ 24008, -5.35],
[ 24009, -0.49],
[ 24010, -8.01],
[ 24011, 0.41],
[ 24012, 3.46],
[ 24013, -9.23],
[ 24014, -6.42],
[ 24015, 7.68],
[ 24016, 0.51],
[ 24017, -2.50],
[ 24018, -1.07],
[ 24019, -6.41],
[ 24020, -8.17],
[ 24021, 1.81],
[ 24022, 7.52],
[ 24023, 0.76],
[ 24024, -1.56],
[ 24025, -2.08],
[ 24026, 3.67],
[ 24027, -6.14],
[ 24028, -0.91],
[ 24029, -7.25],
[ 24030, -7.90],
[ 24031, 0.49],
[ 24032, -11.00],
[ 24033, 8.64],
[ 24034, 5.71],
[ 24035, -6.03],
[ 24036, -2.74],
[ 24037, -1.70],
[ 24038, 0.84],
[ 24039, 8.10],
[ 24040, 5.09],
[ 24041, 1.13],
[ 24042, 1.62],
[ 24043, 1.79],
[ 24044, -1.19],
[ 24045, 5.50],
[ 24046, 0.71],
[ 24047, 5.08],
[ 24048, 1.73],
[ 24049, 1.22],
[ 24050, -1.64],
[ 24051, -1.68],
[ 24052, 1.21],
[ 24053, 1.80],
[ 24054, -3.43],
[ 24055, 0.23],
[ 24056, 0.94],
[ 24057, 1.40],
[ 24058, 3.86],
[ 24059, 3.25],
[ 24060, -2.53],
[ 24061, 1.89],
[ 24062, -1.91],
[ 24063, -2.01],
[ 24064, 3.00],
[ 24065, -0.01],
[ 24066, 3.60],
[ 24067, -1.12],
[ 24068, 0.69],
[ 24069, -1.77],
[ 24070, 3.52],
[ 24071, -0.10],
[ 24072, 2.55],
[ 24073, 0.05],
[ 24074, 1.11],
[ 24075, 1.22],
[ 24076, -3.09],
[ 24077, 0.01],
[ 24078, 0.51],
[ 24079, 2.13],
[ 24080, 2.46],
[ 24081, 3.15],
[ 24082, 1.65],
[ 24083, 1.26],
[ 24084, 1.41],
[ 24085, -2.18],
[ 24086, 1.00],
[ 24087, 4.33],
[ 24088, 3.25],
[ 24089, -1.78],
[ 24090, -3.20],
[ 24091, 1.29],
[ 24092, 3.58],
[ 24093, 1.48],
[ 24094, -4.40],
[ 24095, -0.86],
[ 24096, -6.12],
[ 24097, -3.48],
[ 24098, -0.60],
[ 24099, 4.75],
[ 24100, 1.07],
[ 24101, -8.60],
[ 24102, -0.99],
[ 24103, 1.22],
[ 24104, -9.08],
[ 24105, -16.94],
[ 24106, -7.48],
[ 24107, 0.78],
[ 24108, -8.57],
[ 24109, -10.99],
[ 24110, 8.54],
[ 24111, 9.39],
[ 24112, 5.31],
[ 24113, 0.02],
[ 24114, 7.41],
[ 24115, 3.36],
[ 24116, 3.57],
[ 24117, -1.98],
[ 24118, 5.74],
[ 24119, 1.78],
[ 24120, -3.70],
[ 24121, 2.85],
[ 24122, 5.88],
[ 24123, 1.48],
[ 24124, -8.20],
[ 24125, -5.39],
[ 24126, 6.88],
[ 24127, -4.74],
[ 24128, 8.76],
[ 24129, 3.69],
[ 24130, -0.23],
[ 24131, 6.53],
[ 24132, 2.26],
[ 24133, 3.20],
[ 24134, -0.10],
[ 24135, 2.85],
[ 24136, -1.35],
[ 24137, -1.83],
[ 24138, -2.15],
[ 24139, -5.68],
[ 24140, -7.18],
[ 24141, 10.77],
[ 24142, -0.51],
[ 24143, 0.85],
[ 24144, 4.36],
[ 24145, 4.06],
[ 24146, 3.13],
[ 24147, -0.75],
[ 24148, -6.27],
[ 24149, 3.96],
[ 24150, 1.26],
[ 24151, 1.98],
[ 24152, 2.42],
[ 24153, -1.98],
[ 24154, 0.28],
[ 24155, 0.71],
[ 24156, 5.04],
[ 24157, 1.11],
[ 24158, 3.60],
[ 24159, 1.81],
[ 24160, 2.08],
[ 24161, -1.50],
[ 24162, 4.95],
[ 24163, -3.13],
[ 24164, 2.97],
[ 24165, 4.46],
[ 24166, 2.80],
[ 24167, 2.36],
[ 24168, -3.56],
[ 24169, 4.31],
[ 24170, 0.69],
[ 24171, 0.62],
[ 24172, 2.10],
[ 24173, 1.91],
[ 24174, -1.51],
[ 24175, 3.77],
[ 24176, -1.55],
[ 24177, 2.32],
[ 24178, 2.45],
[ 24179, -0.42],
[ 24180, -3.10],
[ 24181, 5.49],
[ 24182, -1.74],
[ 24183, 0.85],
[ 24184, 1.05],
[ 24185, -2.10],
[ 24186, 1.97],
[ 24187, -6.26],
[ 24188, -2.64],
[ 24189, 8.30],
[ 24190, 0.05],
[ 24191, -1.75],
[ 24192, -5.07],
[ 24193, -0.41]]

  var mdata = _.chain(data)
              .map(function(row){return row[2];})
              .value()

  var lm = _.last(data)[1];
  var fm = _.first(data)[1];

  var le = lm - fm + 1

  var spdata = _.chain(sp500)
              .filter(function(row){return row[0]<=lm&&row[0]>=fm;})
              .map(function(row){return row[1];})
              .value()
  
  var dotp=0;
  var suma=0;
  var sumb=0;
  var suma2=0;
  var sumb2=0;
  var cor=0;
if(fm>=24000){
  for(i=0;i<le;i++){
    dotp += spdata[i]*mdata[i];
    suma += spdata[i];
    sumb += mdata[i];
    suma2 += spdata[i]*spdata[i];   
    sumb2 += mdata[i]*mdata[i];  
  }
  cor= (le*dotp-suma*sumb)/Math.sqrt((le*suma2-suma*suma)*(le*sumb2-sumb*sumb));
}
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
  //info, (1)last month, (2)assets, (3)last year return, (4)dd and (5)wm, (6)caror, (7)full_drawdown, (8)year2date, (9)stdev, (10)sharp, (11)cor
  fundData.getbasic = function(){
    //console.log(lastm);
    return [lastm[0],lastm[2],lastm[3],100*(_.last(mretc)[1]-1),dd,ydd,caror,fdd, y2date,stdDev*Math.sqrt(12),sharp*Math.sqrt(12), cor];
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
