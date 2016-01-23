module.exports.result =
	function(pool, dbconfig, url, values, header, pageIndex, res, type){
		pool.getConnection(function(err, connection) {
              	        connection.query('USE ' + dbconfig.database);
                        connection.query(url,values, function(err, rows){
            if (err)
                return done(err);
            if (!rows.length) {
		var data = [];
		res.render('pages/bs_list_view',{
                header: header,
                data: data,
                pagetype : type,
                pageIndex: pageIndex});
            }
            else {
		console.log(rows);
		var len = rows.length;
		var data = new Array(len);
		for(i=0; i<len; i++){
			data[i] = new Array(14);
			for(j=0; j<14; j++){
				data[i][j] = 0;
			}
			data[i][0] = rows[i].Fund_Name;
			data[i][1] = ((rows[i].Last_Month_Return)*100).toFixed(2) + "%";
			data[i][2] = ((rows[i].Annual_Return)*100).toFixed(2)+"%";
			data[i][3] = "32.8%";
			data[i][4] = "16.8%";
			data[i][5] = "100k";
			data[i][6] = rows[i].Assets;
			data[i][7] = "500";
			data[i][8] = "2%";
			data[i][13] = rows[i].Fund_ID;
		}
		res.render('pages/bs_list_view',{
                header: header,
                data: data,
		pagetype : type,
                pageIndex: pageIndex});

            }
	
        });

        // connected! (unless `err` is set)
        connection.release();
      });

};

module.exports.detailresult =
        function(pool, dbconfig, url, values, header, pageIndex,req, res){
                pool.getConnection(function(err, connection) {
                        connection.query('USE ' + dbconfig.database);
                        connection.query(url, values, function(err, rows){
            if (err)
                return done(err);
            if (!rows.length) {
		res.render('pages/bs_detail_view',{
                        data: fiveYearData,
                        dataLabel: dataLabel,
                        graphData: graphData,
                        barOneData : barOne,
                        barTwoData : barTwo,
                        barLabel : barLab,
                        fundName : fundName
		});	
            }
            else {
		var rateData = [ req.query['annret'],  req.query['lastret']];
                var len = rows.length;
		var firstYear = rows[0].Year;
		var lastYear = rows[len-1].Year;
	
		var numYear=lastYear-firstYear+1;
		var fundName = rows[0].Fund_Name;
		//
		var barOneData = new Array(12);
		var barTwoData = new Array(12);
		var barLabel = new Array(12);
	
		var barlen=len-1;	
		var month = rows[barlen].Month;
		for( var i=11; i>=0; i--){
		    if(barlen>=0){
			barOneData[i]=rows[barlen].Month_Return;
			}
		     else{
			barOneData[i]=0;
			}
		    if(barlen-12>=0){
			barTwoData[i]=rows[barlen-12].Month_Return;
			}
		    else{
			barTwoData[i]=0;
			}
		    barlen=barlen-1;
		    barLabel[i]=month;
		    month=month-1;
		}		

		var barOne="[";
	        var barTwo="[";
		var barLab="[";
		var curTotal=1000;
		var cur2Total=1000;
		for(var i=0; i<12; i++){
		  if(i!=0) { barOne += "," ;
                                   barTwo += "," ;
				barLab += ",";
                                }

                        barLab += "'"+barLabel[i] + "月" + "'" ;
                        curTotal *=(1+barOneData[i]/100);
			cur2Total *=(1+barTwoData[i]/100);
                        barOne += curTotal.toFixed(0) ;
			barTwo += cur2Total.toFixed(0);

		}		
		
		barOne +="]";
                barTwo +="]";
                barLab +="]";

                var data = new Array(numYear);
		//alert(firtYear);
                var next = 0;
	        for( i=0; i<numYear; i++){
		    data[i]=new Array(16);
                     for(j=0; j<16;j++){
                        data[i][j]="-";
                        }
		    var curYear = firstYear + i;
		    data[i][0] = curYear;
		    while(rows[next].Year == curYear){
			data[i][rows[next].Month] = rows[next].Month_Return;		
			next = next + 1;
			if(next>=len) break;
			}	
		    
	         }
		var years = numYear;
                if(numYear>5) years = 5;
		var fiveYearData = new Array(years);
		for(var i=0; i<years; i++){
			fiveYearData[i] = new Array(16);
			for(var j=0; j<16; j++){
				fiveYearData[i][j] = data[numYear-1][j];
			}
			numYear--;
		}
		var dataLabel = "[";
		var graphData = "["; 
		next = len-12;
		var amount=1000;
		for(var k=0; k<12; k++){
			 if(k!=0) { dataLabel += "," ;
                                   graphData += "," ;
                                }

			dataLabel += "'"+rows[next].Year + "." + rows[next].Month+"'" ;
			amount *=(1+rows[next].Month_Return/100);
			graphData += amount.toFixed(0);

			next = next+1;
		}
		dataLabel += "]" ;
		graphData += "]" ;
	        console.log(barOne);
		console.log(barTwo);	
		res.render('pages/bs_detail_view',{
                        rateData : rateData,
                	data: fiveYearData,
			dataLabel: dataLabel,
			graphData: graphData,
			barOneData : barOne,
			barTwoData : barTwo,
			barLabel : barLab,
			fundName : fundName

                });

	}
        });

        // connected! (unless `err` is set)
        connection.release();
      });

};

