var fund = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.whitespace,
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  prefetch: '../../data/fund.json'
  //remote: {
    //url: '../../data/fund.json'
    //url: '../../data/%QUERY.json',
    //wildcard: '%QUERY'
  //}
    //remote: {
    //    url : '../../data/connection.php?query=%QUERY',
    //    wildcard: '%QUERY'
    //}
});

$('#prefetch .typeahead').typeahead(null, {
  name: 'fund',
  source: fund
});