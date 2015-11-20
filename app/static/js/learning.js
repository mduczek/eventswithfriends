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
    putUserFriendsEvents(callback);
    log("find best friends");
    
}
