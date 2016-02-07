$(document).ready(function() {
    
    /* ======= jQuery form validator ======= */ 
    /* Ref: http://jqueryvalidation.org/documentation/ */   
    $(".form").validate({
		messages: {
		
		    firstname: {
    			required: '请输入你的名' //You can customise this message
			},
			lastname: {
    			required: '请输入你的姓' //You can customise this message
			},
			email: {
				required: '请输入你的邮箱' //You can customise this message
			},	
			number: {
				required: '请输入你的手机号码' //You can customise this message
			},		
			message: {
				required: '请输入你想发给我们的消息' //You can customise this message
			}, 			
			reason: {
				required: '请输入你联系我们的原因' //You can customise this message
			}, 	
			name: {
    			required: '请输入你的名字' //You can customise this message
			},		
			comment: {
				required: '请输入你的建议' //You can customise this message
			}
						
		}
		
	});
	
	
});



