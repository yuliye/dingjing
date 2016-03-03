var _ = require("underscore");
var formatTool = require("./format.js");

var header = ['基金名',
              '上月回报',
              '近12月回报',
              '近12月回撤',
              '最低投资',
              '资产规模',
              '管理费用',
              '业绩提成',
              '年复回报',
              '行业侧重',
              '投资策略',
              '决策类型',
              '基金组成']

var pageIndex = [1, 5, 9]

module.exports.fundlist = function(fundata,  res, index){
	var data = fundata;
  if (fundata.length>0) 
      data = formatTool.fundNewListFormat(fundata); //.getData();
   //console.log(data);
 	//res.render('pages/bs_list_view',{
	  res.render('partials/dyn-table-full.ejs',{
                header: header,
                data: data,
                pagetype : "fdetail?fundid",
                pageIndex: pageIndex,
                index: index,
                leng: 7});
}	

module.exports.combolist = function(fundata,  res, index){
    var data = fundata;
    if (fundata.length>0) 
      data = formatTool.ComboNewListFormat(fundata);//.getData();
         //res.render('pages/bs_list_view',{
	  res.render('partials/dyn-table-full.ejs',{
                header: header,
                data: data,
                pagetype : "cdetail?comboid",
                pageIndex: pageIndex,
                index: index,
                leng: 3});
}


module.exports.onefund = function(fundata, rawdata, res, hasSaved, comboname){
	var fundInfo = fundata.getbasic();
	var fiveYearData = formatTool.fundFormat(rawdata, fundata).fiveYear();
	var fetchData = formatTool.fundFormat3(fundata)
  var dataBar = fetchData.fetchBarInfo();
	var dataGraph = fetchData.fetchGraphInfo(); 
	//var fiveYearData = fetchData.fiveYear();
  
	res.render('pages/bs_detail_view',{
                        rateData : [fundInfo[1].toFixed(2),fundInfo[2].toFixed(2)],
                        data: fiveYearData,
                        dataLabel: "[" + dataGraph[0].toString() +"]",
                        graphData: "[" + dataGraph[1].toString() + "]",
                        barOneData : "[" + dataBar[1].toString() + "]",
                        barTwoData : "["+ dataBar[2].toString() + "]",
                        barLabel : "["+dataBar[0].toString()+"]",
                        fundName : fundInfo[0][1],
                        fundid: fundInfo[0][0],
	                index : 7,
            		showSave: hasSaved,
            		combo: comboname
                });
}

module.exports.fundd = function(fundata, res, hasSaved, comboname, index){
  var fundInfo = fundata.getbasic();
  var fundHist = fundata.getanndata();
  var fundHistStat = fundata.getannstat();
  var fundGraph = fundata.last12c();
  /*
  console.log(fundInfo);
  console.log(fundHist);
  console.log(fundHistStat);
  console.log(fundGraph);
  */
  var gdata = _.map(fundGraph,function(row){return (row[1]*1000).toFixed(2);});
  var ldata = _.map(fundGraph,function(row){return Math.floor(row[0]/12).toFixed(0)+"."+(row[0]%12+1).toFixed(0);});
  /*
  console.log(fundHist);
  console.log(fundHistStat);
  */
  var histData=[];
  var j=0;
  for(k in fundHist){
    var tmp = [];
    tmp[0]=k;
    for(i=0;i<12;i++) tmp[i+1]="-"; 
    for(h=0;h<fundHist[k].length;h++){
      var idx=fundHist[k][h][0]%12;
      tmp[idx+1]=fundHist[k][h][1];
    }
    tmp[13]=fundHistStat[0][k].toFixed(2);
    tmp[14]=fundHistStat[1][k].toFixed(2);
    histData[j++]=tmp;
  }
  var revHistData=histData.reverse();
  //console.log(revHistData);
  
  //res.render('pages/bsyy_detail_view',{
  res.render('pages/bs2_fund_detail_view',{
                        topData : fundInfo,
                        graphData: "[" + gdata.toString() +"]",
                        dataLabel: "[" + ldata.toString() +"]",
                        data: revHistData,
                        index : index,
                        showSave: hasSaved,
                        combo: comboname,
                        page: 'unified'
                });

}



module.exports.onecombo = function(fundata, rawdata, res, comFunData){
        var fundInfo = fundata.getbasic();
        var fiveYearData = formatTool.fundFormat(rawdata,fundata).fiveYear();
        var fetchData = formatTool.fundFormat3(fundata)
        var dataBar = fetchData.fetchBarInfo();
        var dataGraph = fetchData.fetchGraphInfo();
	//var fiveYearData = fetchData.fiveYear();

	res.render('pages/bs_combo_detail_view',{
                        rateData : [fundInfo[1].toFixed(2),fundInfo[2].toFixed(2)],
                        data: fiveYearData,
                        dataLabel: "[" + dataGraph[0].toString() +"]",
                        graphData: "[" + dataGraph[1].toString() + "]",
                        barOneData : "[" + dataBar[1].toString() + "]",
                        barTwoData : "["+ dataBar[2].toString() + "]",
                        barLabel : "["+dataBar[0].toString()+"]",
                        fundName : fundInfo[0][1],
                        fundid: fundInfo[0][0],
                        index : 7,
                        showSave: 0,
                        comFunData: comFunData,
			combo: [['fund1',500],['fund2',600],['fund3',700]]
                });

}

module.exports.combod = function(fundata, res, comFunData, bstat, index){
  var fundInfo = fundata.getbasic();
  var fundHist = fundata.getanndata();
  var fundHistStat = fundata.getannstat();
  var fundGraph = fundata.last12c();

  c1 = ['#0000CD','#B22222','#FFD700','#008000','#800080','#FF4500','#00CED1','#F5FFFA','#C0C0C0','#FF1493','#D2691E'];
  c = ['#00BFFF','#00FA9A','#FFA500','#4169E1','#FFFF00','#FF0000','#FF00FF']
  var pie = "[";
  for(k in comFunData){
    pie += "{value:"+comFunData[k][5]+",color:'"+c[k%7]+"',label:'"+comFunData[k][1]+"'},";
  }
  pie +="]";

  var dateObj = new Date();
  var month = dateObj.getUTCMonth();
  var year = dateObj.getUTCFullYear();
  /*
  console.log(fundInfo);
  console.log(fundHist);
  console.log(fundHistStat);
  console.log(fundGraph);
  */
  if(fundGraph[0][0]==-1){
    fundGraph=[]
    sdate = year*12+month-12;
    for(i=0;i<13;i++) fundGraph[i]=[sdate+i,1];
    fundHist

  }
  var gdata = _.map(fundGraph,function(row){return (row[1]*1000).toFixed(2);});
  var ldata = _.map(fundGraph,function(row){return Math.floor(row[0]/12).toFixed(0)+"."+(row[0]%12+1).toFixed(0);});
  
  /*
  console.log(fundHist);
  console.log(fundHistStat);
  */

  var histData=[];
  var j=0;
  for(k in fundHist){
    var tmp = [];
    tmp[0]=k;

    for(i=0;i<12;i++) tmp[i+1]="-"; 
    for(h=0;h<fundHist[k].length;h++){
      var idx=fundHist[k][h][0]%12;
      tmp[idx+1]=fundHist[k][h][1].toFixed(2);
    }
    tmp[13]=fundHistStat[0][k].toFixed(2);
    tmp[14]=fundHistStat[1][k].toFixed(2);
    if(k=='-1') tmp[0]= year.toString();
    histData[j++]=tmp;
  }
  var revHistData=histData.reverse();
  //console.log(revHistData);
  
  //res.render('pages/bsyy_combo_detail_view',{
  res.render('pages/bs2_combo_detail_view',{
                        topData : fundInfo,
                        graphData: "[" + gdata.toString() +"]",
                        dataLabel: "[" + ldata.toString() +"]",
                        data: revHistData,
                        index : index,
                        showSave: 0,
                        comFunData: comFunData,
                        bstat: bstat,
                        pie: pie,
                        page: 'unified'
                });

}

