var _ = require("underscore");
var formatTool = require("./format.js");

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

module.exports.fundlist = function(fundata,  res){
	var data = formatTool.fundListFormat(fundata).getData();
	 res.render('pages/bs_list_view',{
                header: header,
                data: data,
                pagetype : "fdetail?fundid",
                pageIndex: pageIndex,
                index: 7});
}	

module.exports.combolist = function(fundata,  res){
        var data = formatTool.fundListFormat(fundata).getData();
         res.render('pages/bs_list_view',{
                header: header,
                data: data,
                pagetype : "cdetail?comboid",
                pageIndex: pageIndex,
                index: 7});
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

