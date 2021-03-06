module.exports.result =
	function(pool, dbconfig, url, values, header, pageIndex, res, type, index){
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
                pageIndex: pageIndex,
                index: index});
            }
            else {
		var len = rows.length;
		var data = new Array(len);
		for(i=0; i<len; i++){
			data[i] = new Array(14);
			for(j=0; j<14; j++){
				data[i][j] = 0;
			}
			//console.log(rows[i]);
			data[i][0] = rows[i].Fund_Name;
			//data[i][1] = ((rows[i].Last_Month_Return)*100).toFixed(2) + "%";
			//data[i][2] = ((rows[i].Annual_Return)*100).toFixed(2)+"%";
			//if(rows[i].Last_Month_Return!=='null')
			  data[i][1] = (rows[i].Last_Month_Return).toFixed(2) + "%";
			//if(rows[i].Annual_Return!=='null')
			  data[i][2] = (rows[i].Annual_Return).toFixed(2)+"%";
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
                pageIndex: pageIndex,
                index: index});

            }
	
        });

        // connected! (unless `err` is set)
        connection.release();
      });

};

module.exports.detailresult =
        function(pool, dbconfig, url, values, header, pageIndex,req, res, index){
                pool.getConnection(function(err, connection) {
                        connection.query('USE ' + dbconfig.database);
                        connection.query(url, values, function(err, rows){
            if (err)
                return done(err);
            if (!rows.length) {
                 var rateData = [ req.query['annret'],  req.query['lastret']]; 
		res.render('pages/bs_detail_view',{
                        data: fiveYearData,
                        rateData : rateData,
                        dataLabel: dataLabel,
                        graphData: graphData,
                        barOneData : barOne,
                        barTwoData : barTwo,
                        barLabel : barLab,
                        fundName : fundName,
                        fundid : fundid,
                        index: index,
                        showSave: 0,
                        combo: [[1,'uuu',500],[2,'bbb',600],[3,'aaa',700]]
		});	
            }
            else {
	//	var rateData = [ req.query['annret'],  req.query['lastret']];

		//var rateData = [ '21.89%',  '6.13%'];
                var len = rows.length;
		var firstYear = rows[0].Year;
		var lastYear = rows[len-1].Year;
	
		var numYear=lastYear-firstYear+1;
		var fundName = rows[0].Fund_Name;
		var fundid = rows[0].Fund_ID;
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
		next = len-13;
		var k=0;
		if( next<0){
			var tempYear=rows[0].Year;
			var tempMonth=rows[0].Month;
			if(tempMonth+next<=0){
				tempYear = tempYear-1;
				tempMonth = tempMonth+next+12;
			}
			while(next<0){
				if(k!=0) { dataLabel += "," ;
                                   graphData += "," ;
                                }
				dataLabel += "'"+tempYear + "." + tempMonth+"'" ;
                                graphData += 1000;

                       		 next = next+1;
				 k=k+1;
				 tempMonth=tempMonth+1;
				if( tempMonth>12){
					tempMonth=1;
					tempYear=tempYear+1;
				}


			}
		}
		var amount=1000;
		for( ; k<13; k++){
			 if(k!=0) { dataLabel += "," ;
                                   graphData += "," ;
                                }

			dataLabel += "'"+rows[next].Year + "." + rows[next].Month+"'" ;
			amount *=(1+rows[next].Month_Return/100);
			if(k==0) amount=1000;
			graphData += amount.toFixed(0);

			next = next+1;
		}
		dataLabel += "]" ;
		graphData += "]" ;
		console.log(graphData);
		console.log(dataLabel);

        connection.query("SELECT * FROM Saved_Fund_Table Where User_ID = ? AND Fund_ID = ?", [req.user.User_ID,rows[0].Fund_ID], function(err,rows){
          var hasSaved = rows.length;
          if(err)
          	return done(err);
          else {
            connection.query("SELECT Combo_Name FROM Combo_Table Where User_ID = ?", [req.user.User_ID], function(err,rows){
              if(err){
              	//error handling
              }
              else {
              	var comboname = new Array(rows.length);
              	for(i=0;i<rows.length;i++)
              		comboname[i]=rows[i].Combo_Name;

                connection.query("SELECT Annual_Return, Last_Month_Return from Fund_Table WHERE Fund_ID=?",req.query['fundid'], function(err, rows){
            if (err)
            	//error handling
                return done(err);
            if (!rows.length) {
            	//error handling
            }
            else {
            	//console.log(rows);
            	rateData=[0,0];
            	rateData[0] = (rows[0].Annual_Return).toFixed(2)+'%';
            	rateData[1] = (rows[0].Last_Month_Return).toFixed(2)+'%';
                //rateData[0]=Math.round10(rows[0].Annual_Return,-2);
                //rateData[1]=Math.round10(rows[0].Last_Month_Return,-2);
                res.render('pages/bs_detail_view',{
                        rateData : rateData,
                	data: fiveYearData,
			dataLabel: dataLabel,
			graphData: graphData,
			barOneData : barOne,
			barTwoData : barTwo,
			barLabel : barLab,
			fundName : fundName,
			fundid: fundid,
            index : index,
            showSave: hasSaved,
            combo: comboname
                });
                }
                });
              }
            });
          }
        });
	}
        });

        // connected! (unless `err` is set)
        connection.release();
      });

};


module.exports.combodetail =
        function(pool, dbconfig, url, values, header, pageIndex,req, res, index){
                pool.getConnection(function(err, connection) {
                        connection.query('USE ' + dbconfig.database);
                        connection.query(url, values, function(err, rows){
            if (err)
                return done(err);
            if (!rows.length) {
		var rateData = [ req.query['annret'],  req.query['lastret']];
                var fundid = req.query['comboid'];
		res.render('pages/bs_combo_detail_view',{
                        rateData: rateData,
                        data: [],
                        dataLabel: ['2015.1','2015.2','2015.3','2015.4','2015.5','2015.6','2015.7','2015.8','2015.9','2015.10','2015.11','2015.12'],
                        graphData: [1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000],
                        barOneData : [],
                        barTwoData : [],
                        barLabel : [],
                        fundName : "", 
                        fundid : fundid,
                        index: index,
                        showSave: 0,
                        combo: [[1,'uuu',500],[2,'bbb',600],[3,'aaa',700]]
		});	
            }
            else {


        
		//var rateData = [ req.query['annret'],  req.query['lastret']];
		var rateData = [ '21.89%',  '6.13%'];
                var len = rows.length;
		var firstYear = rows[0].Year;
		var lastYear = rows[len-1].Year;
	
		var numYear=lastYear-firstYear+1;
		var fundName = rows[0].Fund_Name;
		var fundid = rows[0].Fund_ID;
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
		next = len-13;
		 var k=0;
                if( next<0){
                        var tempYear=rows[0].Year;
                        var tempMonth=rows[0].Month;
                        if(tempMonth+next<=0){
                                tempYear = tempYear-1;
                                tempMonth = tempMonth+next+12;
                        }
                        while(next<0){
                                if(k!=0) { dataLabel += "," ;
                                   graphData += "," ;
                                }
                                dataLabel += "'"+tempYear + "." + tempMonth+"'" ;
                                graphData += 1000;

                                 next = next+1;
                                 k=k+1;
                                 tempMonth=tempMonth+1;
                                if( tempMonth>12){
                                        tempMonth=1;
                                        tempYear=tempYear+1;
                                }


                        }
                }

		var amount=1000;
	         for( ; k<13; k++){
                         if(k!=0) { dataLabel += "," ;
                                   graphData += "," ;
                                }

                        dataLabel += "'"+rows[next].Year + "." + rows[next].Month+"'" ;
                        amount *=(1+rows[next].Month_Return/100);
                        if(k==0) amount=1000;
                        graphData += amount.toFixed(0);

                        next = next+1;
                }
		dataLabel += "]" ;
		graphData += "]" ;	
	
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
            }
	    else{
		console.log(rows);
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
		res.render('pages/bs_combo_detail_view',{
                        rateData : rateData,
                	data: fiveYearData,
			dataLabel: dataLabel,
			graphData: graphData,
			barOneData : barOne,
			barTwoData : barTwo,
			barLabel : barLab,
			fundName : fundName,
			fundid: fundid,
                        index : index,
                        showSave: 0,
			comFunData: comFunData,
                        combo: [['fund1',500],['fund2',600],['fund3',700]]
                });

	}
        });
	}
	});
	

        // connected! (unless `err` is set)
        connection.release();
      });

};

