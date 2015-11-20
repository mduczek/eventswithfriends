var myFriends = {};

var collectedPhotosData = [];
var collectedMyPostsData = [];

function getBestFriends() {
	_getBestFriends();

	var friendIds = Object.keys(myFriends);
	var friendsPairs = [];
	for (var i=0; i<friendIds.length; i++) {
	 	friendsPairs.push([friendIds[i], myFriends[friendIds[i]]]);
	}

	friendsPairs.sort(function(x, y){ 
	    if (x[1] < y[1]) {
	        return 1;
	    }
	    if (x[1] > y[1]) {
	        return -1;
	    }
	    return 0;
	});

	var uid = FB.getUserID();
	es_put_id("best_friends", uid, {"friends": friendsPairs}, function(){})

}

function _getBestFriends() {
    // // Getting number of photos we are both tagged on
    // FB.api(
    //   '/me/friends',
    //   'GET',
    //   {"fields":"photos{tags{name,id}},name,id"},
    //   function(response) {
    //     collectFriendsPhotosData(response, collectedPhotosData, function(d) {console.log(d);});
    //   }
    // );

// Getting number of photos we are both tagged on from my photos
	FB.api(
	  '/me/photos',
	  'GET',
	  {"fields":"tags{name}"},
	  function(response) {
	      collectFriendsPhotosData(response, collectedPhotosData, function(d) {});
	  }
	);


    // Getting number of posts I tagged a friend on
    FB.api(
      '/me/posts',
      'GET',
      {"fields":"with_tags"},
      function(response) {
        collectMyPostsData(response, collectedMyPostsData, function(d) {});
      }
    );
}

function collectFriendsPhotosData(resp, data, callback) {
    // console.log('GOT:', resp);
    data.push.apply(data, resp.data);
    next = resp.paging.next;
    if (next) {
        FB.api(next, function(r) {
            collectFriendsPhotosData(r, data, callback);
        });
    } else {
		// printData(data);
        getTagsFromAllMyPhotos(data);
    }
}

function collectMyPostsData(resp, data, callback) {
	// log('entering collectMyPostsData');
	// console.log('GOT:', resp);
    data.push.apply(data, resp.data);
    if (resp.paging) {
	    next = resp.paging.next;
	    if (next) {
	        FB.api(next, function(r) {
	            collectMyPostsData(r, data, callback);
	        });
	    } else {
			// printData(data);
	        getNumberOfMyPostsWithFriends(data);
	    }
	}
}

function printData(data) {
	log('printing data!!!');
	for (var i = 0; i < data.length; i++) {
		log(data[i]);
	}
}

function getTagsFromAllMyPhotos (data) {
	// log('getTagsFromAllMyPhotos data:' + data)
	var userId = FB.getUserID();

	var photos = data;
	if (photos) {
		for (var i = 0; i < photos.length; i++) {
			if (photos[i].tags) {
				var photoTags = photos[i].tags.data;
				for (var j = 0; j < photoTags.length; j++) {
					if (photoTags[j].id) {
						if (photoTags[j].id != userId) {
							addOneToFriendsMap(photoTags[j].id);
						}
					}
				}
			}
		}
	}

}

function getNumberOfCommonPhotos (data) {
	// log('getNumberOfCommonPhotos data:' + data)
	var userId = FB.getUserID();

	log('Getting number of common photos with friends');
	var friends = data;
	if (friends != undefined) {
		for (var f = 0; f < friends.length; f++) {
			var friend_id = friends[f].id;
			var common_photos = 0;
			if (friends[f].photos != undefined) {
				var friend_photos = friends[f].photos.data;
				for (var fp = 0; fp < friend_photos.length; fp++) {
					if (friend_photos[fp].tags.data != undefined) {
						var tagged_users = friend_photos[fp].tags.data;
						for (tu = 0; tu < tagged_users.length; tu++) {
							if (tagged_users[tu].id != undefined) {
								if (tagged_users[tu].id == userId) {
									addOneToFriendsMap(friend_id);
								}
							}
						}
					}
				}
			}
			// log('common_photos with user ' + friend_id + ' = ' + myFriends.get(friend_id));
		}
	} else {
		// log('friends is undefined');
	}
}

function getNumberOfMyPostsWithFriends() {
	console.log('!!! Getting number of my posts with friends');	
	var userId = FB.getUserId();

	var posts = data;
	if (posts) {
		for (var i = 0; i < posts.length; i++) {
			if (posts[i].with_tags) {
				var tagged_users = posts[i].with_tags.data;
				for (var j = 0; j < tagged_users.length; j++) {
					if (tagged_users[j].id) {
						// log('Found my post with user: ' + tagged_users[j].id);
						addOneToFriendsMap(tagged_users[j].id);
						addOneToFriendsMap(tagged_users[j].id);
					}
				}
			}
		}
	}
}

function getNumberOfMyFriendsPostsWithMe() {
	// console.log('!!! Getting number of my firends posts with me');	
	var userId = FB.getUserId();

	var posts = data;
	if (posts) {
		for (var i = 0; i < posts.length; i++) {
			if (posts[i].with_tags) {
				var tagged_users = posts[i].with_tags.data;
				for (var j = 0; j < tagged_users.length; j++) {
					if (tagged_users[j].id) {
						// log('Found my post with user: ' + tagged_users[j].id);
						addOneToFriendsMap(tagged_users[j].id);
					}
				}
			}
		}
	}
}

// Kind of incremental map
function addOneToFriendsMap(friend_id) {
	if (myFriends[friend_id]) 
		myFriends[friend_id] += 1; 
	else 
		myFriends[friend_id] = 1
}
	