function callback() {
    redirect("/events");
}

function learning_main() {
    log("learning script on");
    getPreferences(callback);

    log("learning script done");
}
