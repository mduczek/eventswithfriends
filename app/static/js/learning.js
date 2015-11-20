function callback() {
    redirect("/events/" + FB.getUserID());
}

function getLocation(callback) {
    FB.api("/me?fields=location", callback);
}

function learning_main() {
    $("body").addClass("loading");
    getBestFriends();
    log("learning script on");
    getLocation(filterEvents);
    getPreferences(function() {
        $.ajax({
            url: '/apiMilosza/' + FB.getUserID(),
            method: "GET",
            success: function(data) {
                log(data);
                callback(data);
            },
            error: function(error) {
                log(error.responseText);
            }
        })
    });
    putUserFriendsEvents(callback);
    log("find best friends");
}
