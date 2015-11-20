function callback() {
    redirect("/events");
}

function getLocation(callback) {
    FB.api("/me?fields=location", callback);
}

function learning_main() {
    log("learning script on");
    getLocation(filterEvents);
    putUserFriendsEvents();
    log("learning script done");
}
