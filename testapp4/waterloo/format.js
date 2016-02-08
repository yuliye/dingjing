var _ = require("underscore");

module.exports.fundFormat3= function(data){
	
        var fundFormat3 = {};

	//for the bar graph
	var barData = data.last12c();
	var firstYear = _.first(barData)[0]-1;
        for(var i=barData.length; i<24; i++){
                barData.unshift([firstYear--, 1]);
        }

       fundFormat3.fetchBarInfo = function(){
                var barLabel= [];
		var barDataOne=[];
		var barDataTwo=[];
                for(var i=0; i<12; i=i+1){
                        barLabel.push ("'"+(barData[i][0]%12+1) +  "月'");
			barDataOne.push((barData[i][1]*1000).toFixed(0));
			barDataTwo.push((barData[i+12][1]*1000).toFixed(0));
                }
                return [barLabel, barDataOne, barDataTwo];
        }

	fundFormat3.fetchGraphInfo = function(){
                var graphLabel=[   Math.floor(barData[11][0]/12) + "." + (barData[11][0]%12+1) ];
                var graphData=[1000];
                for(var i=12; i<24; i=i+1){
			graphLabel.push(Math.floor(barData[i][0]/12) + "." + ((barData[i][0]%12)+1) ) ;
                        graphData.push((barData[i][1]*1000).toFixed(0));
                }
		//graphLabel +="]";
                return [graphLabel, graphData];
        }

    return fundFormat3;

}




module.exports.fundListFormat= function(fundata){
	var fundListD={};
	 var data = [];
         for(k in fundata){
           var fundList = fundata[k].getbasic();
           var fundInfo = [];
           for( var key=0; key<fundList.length; key++ ){
                 if(key==0) {fundInfo.push( fundList[key][1] );
                             fundInfo.push( fundList[key][0] );
                           }
                else fundInfo.push(fundList[key].toFixed(2)+"%");
                }
           data.push(fundInfo);
        }

	fundListD.getData = function(){
		return data;
	}	
	return fundListD;


}



module.exports.fundFormat= function(data, computData){
  var fundFormat = {};
 
  var fiveY = _.chain(data).last(60).value(); 
  var firstMY = [_.first(fiveY).Month, _.first(fiveY).Year];
  var lastMY = [_.last(fiveY).Month, _.last(fiveY).Month];
  
  var fiveYear = _.chain(data)
         	 .last(60)
		 .map( function(row){return [(row.Month_Return).toFixed(2)] ;})
		 .value();

   var annstat = computData.getannstat();
	
   var ann1=[];
   for(var key in annstat[0]){ ann1.unshift( annstat[0][key].toFixed(2)) ; }
   var ann2 = [];
   for(var key in annstat[1]){ ann2.unshift( annstat[1][key].toFixed(2)) ; }

   fundFormat.fiveYear = function(){
	var fiveYearData=[];
	var fiveDa = fiveYear;
	for(var i=0; i<firstMY[0]-1; i++) fiveDa.unshift("-");
	for(var j=lastMY[0]+1; j<=12; j++) fiveDa.push("-"); 
	var curYear = firstMY[1];
	var ind = 0;
	for(var k=0; k<fiveDa.length; ){
		var oneYear = [];
                oneYear.push(curYear);
		for(var t=0; t<12; t++){
			oneYear.push(fiveDa[k++]);
		}	
		oneYear.push( ann1[ind]);
	        oneYear.push( ann2[ind]);		
		fiveYearData.unshift(oneYear);
		curYear+=1;
		ind += 1;
	}
	return fiveYearData;
	};

    

   return fundFormat;

}

