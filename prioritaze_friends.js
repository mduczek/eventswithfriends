// A map holding our friends and info colected about them
var myFriends = new Map();		


function get_number_of_common_photos () {

var id = FB.getUserId();

	console.log('Getting number of common photos with friends');
	FB.api('/me', 'GET', {"fields":"friends{photos{tags{tagging_user}}}"}, function(response) {
			console.log(response);
			var data = response['friends']['data']['photos'];
			// for (var i = 0; i < data[i].comments.data; i++) {
				// var friends_photos = [];
				// for (var j = 0; j <)	
			// }
	        // var files = [];
	        // var posts = [];
	        // for(var i=0; i<data.length; i++){
	            // if(data[i].comments){
	                // var comments = data[i].comments.data;
	                // for(var j=0; j<comments.length; j++){
	                    // console.log(comments[j])
	        // posts.push(comments[j]);			
	  	// }
	);
}

