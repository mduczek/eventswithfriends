// A map holding our friends and info colected about them
var myFriends = new Map();		

oh = [];

function getBestFriends() {
    FB.api(
      '/me/friends',
      'GET',
      {"fields":"photos{tags{name,id}},name,id"},
      function(response) {
        getBestFriendsPageAll(response, oh, function(d) {console.log(d);});
      }
    );
}

function getBestFriendsPageAll(resp, data, callback) {
    console.log('GOT:', resp);
    data.push.apply(data, resp.data);
    next = resp.paging.next;
    if (next) {
        FB.api(next, function(r) {
            getBestFriendsPageAll(r, data, callback);
        });
    } else {
		printData(data);
        getNumberOfCommonPhotos(data);
    }
}

function printData(data) {
	log('printing data!!!');
	for (var i = 0; i < data.length; i++) {
		log(data[i]);
	}
}

function getNumberOfCommonPhotos (data) {
	log('getNumberOfCommonPhotos data:' + data)
	var userId = FB.getUserID();
	// var userId = 962520777092326;
	log('Getting number of common photos with friends');
	var friends = data;
	if (friends != undefined) {
		for (var f = 0; f < friends.length; f++) {
			var friend_id = friends[f].id;
			var common_photos = 0;
			if (friends[f].photos != undefined) {
				var friend_photos = friends[f].photos.data;
				for (var fp = 0; fp < friend_photos.length; fp++) {
					if (friend_photos[fb].tags.data != undefined) {
						var tagged_users = friend_photos[fb].tags.data;
						for (tu = 0; tu < tagged_users.length; tu++) {
							if (tagged_users[tu].id != undefined) {
								if (tagged_users[tu].id == userId) {
									common_photos++;
								}
							} else {
								log('tagged_users[' + tu + '].id is undefined');
							}
						}
					} else {
						log('friend_photos[' + fp + '].tags.data is undefined');
					}
				}
			} else {
				log('friends[' + f + '].photos != undefined');
			}
			log('common_photos with user ' + friend_id + ' = ' + common_photos);
			if (common_photos > 0) {
				myFriends.set(friend_id, common_photos);
			}
		}
	} else {
		log('friends is undefined');
	}
}

function get_number_of_common_posts() {
	var userId = FB.getUserId();
	console.log('Getting number of common posts with friends');



}