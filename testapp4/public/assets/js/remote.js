var fund = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.whitespace,
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  prefetch: {
	url: '/users/autosearch'
	}
  //remote: {
   //     url : '/users/autosearch?fname=%QUERY',
    //    wildcard: '%QUERY'
   // }
});
fund.clearPrefetchCache();
fund.initialize();
$('#prefetch .typeahead').typeahead(null, {
  name: 'fund',
  source: fund,
  limit: 10
});
