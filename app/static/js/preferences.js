function getPreferences(callback) {
    log("getPreferences");

    var uid = FB.getUserID();
    log(uid);

    // collect interests
    FB.api("/" + uid + "?fields=music,movies,television,books,games,sports,favorite_teams", "GET", function(response) {
        log(response);

        // add likes to interests
        var interests = {};
        $.each(response, function(category, content) {
            if (content.data) {
                if (interests[category] === undefined) {
                    interests[category] = []
                }

                $.each(content.data, function(idx, item) {
                    interests[category].push(item.name);
                });
            }
        });

        // get location
        FB.api("/" + uid + "?fields=location", "GET", function(response) {
            log(response);

            var location = response.location.name;

            // get friends
            FB.api("/" + uid + "/friends", "GET", function(response) {
                log(response);

                var friends = [];
                $.each(response.data, function(idx, friend) {
                    friends.push({"id": friend.id, "name": friend.name});
                });

                log(location);
                log(friends);
                log(interests);

                es_put_id("preferences", uid, $.extend(interests, {location: location}, {friends: friends}), callback);

            });
        });
    });
}
