function learning_main() {
    log("learning script on");
    getPreferences();

    log("learning script done");


    // TMP
    setTimeout(function () {
        redirect("/events");
    }, 1000);
}
