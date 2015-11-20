function callback() {
    redirect("/events/" + FB.getUserID());
}

function getLocation(callback) {
    FB.api("/me?fields=location", callback);
}

function learning_main() {
    $("body").addClass("loading");
    log("learning script on");
    getLocation(filterEvents);
    putUserFriendsEvents(callback);
}
