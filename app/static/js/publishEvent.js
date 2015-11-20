function testPublishingEvents() {

	// Cieplik 1028130340601200
	// Milosz 948792808528908
	// Duczi 100001711710125

	var URL = "www.onet.pl";
	var listOfFriends = "1028130340601200,948792808528908,100001711710125";

	publishEvent(URL, listOfFriends);

}

// listOfFriends: lista idkow rozdzielonych przecinkami
function publishEvent(url, listOfFriends) {
	JSONObject privacy = new JSONObject();
	privacy.put("value", "SELF");

	FB.api(
	  '/me/feed',
	  'POST',
	  {"tags":listOfFriends,"privacy":privacy,"message":"Hey, there is an event that might be interesting for us! Here you have some details:\n"+url},
	  function(response) {
	      log('Post dodany xoxo');
	  }
	);

}