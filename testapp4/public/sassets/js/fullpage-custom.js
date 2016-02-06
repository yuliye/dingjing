$(document).ready(function() {        
	
	/* ======= Fullpage.js ======= */ 
	/* Ref: https://github.com/alvarotrigo/fullPage.js */
        
    $('#fullpage').fullpage({
		anchors: ['home', 'benefit1', 'benefit2', 'benefit3'],
		navigation: true,
		navigationPosition: 'right',
		navigationTooltips: ['鼎鲸首页', '美股交易', '智能组合投资', '基金和个人专户'],
		resize : false,
		scrollBar: true,
		autoScrolling: false,
		paddingTop: '120px'
		
	});


});