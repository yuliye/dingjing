var Client = require('node-rest-client').Client;


client = new Client();

module.exports.result =
	function(re, url){
		args ={
		//headers:{"Content-Type":"application/json","Authorization":"bearer LvCU9a-Wh-KWmtuBC9nKF1L8pEzc4Kl46ffdGIa7079mBuausE_1K97Te2XwcWOVRlypgfZ4t3kRCq2p1NgwVcBOkb1w05iehNrHt-BfkM-mn32pzCB7Hq8rBXYWB7c6IlNG-wkmUe-iajcJZ8PAJSmtrerFq4UDhfPfLg2DMz5GxbFVSMs9tIoL1rDaFb_7KnLME2SzYPg0lIvrFyJ5sZEUQFYKKZ7Iu6Dh9BwP8hj0U8Lnm432jOCnG2SWuZ0xYnu-GyibhDGi6RJo8Zt7U-SHOEa9Tao1lM9tkHoBNtjJ6UhoBdi1qYs6uktE7FfuT4t4_eCqKaHyCnjJ9zWMjC-uULRiH99ALI6vFytBcLSbvO8q"}
	headers:{"Content-Type":"application/json"}
	  };


/*var resultFunction = function( result, response){

	var resu = result.toString();
	console.log(resu);
}*/

//module.exports.result = 
//	function(re){
		console.log(url );
 		client.registerMethod("jsonMethod",  url , "GET");
		client.methods.jsonMethod(args, re);
		/*client.methods.jsonMethod(args, function(data,response){
	
		ref = data.toString();
		});*/
};

