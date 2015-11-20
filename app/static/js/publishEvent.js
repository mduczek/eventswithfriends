function publishEvent() {
	// me/feed?tags=1028130340601200&privacy(value=SELF)&place =Warsaw&message="Hesdfsdfsfdfsdllo Hi Hi! Takeasdasdasd a look at this event, it mighasdasadasdt be awesome, we should go!!!"&access_token=CAACEdEose0cBAJXuWleUx0EtToPkLm5g8ZBwHbf7UCEuIxZCGbVAGB8yZCjUa485k8xqfXIMVLPGauxMoZBaN3ZANlXDd3ibR7yzsAGVGr1xUs1iSU91vDM7FgkKfyl6A9RGzpdCIvBa0KMiNycBjUEsYYS2F1mDj2ZCnau3v5rLZA2wUySOO1RGNKK9n08zJm6cZBOkVuLxOXMx8vojCYeY

	// tags: osoby
	// miejsceid

	FB.api(
	  '/me/feed',
	  'POST',
	  {"tags":"1028130340601200","dupa":"dupa","privacy(value":"SELF)","place":"Warsaw","message":"Hey, there is an event that might be interesting for us! Here you have some details:..."},
	  function(response) {
	      log('Post dodany xoxo');
	  }
	);


}