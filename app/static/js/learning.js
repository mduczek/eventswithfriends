function callback() {
    redirect("/events/" + FB.getUserID());
}

function getLocation(callback) {
    FB.api("/me?fields=location", callback);
}

var promises = [];
var promises2 = [];
var counter = 0;
function learning_main() {
    $("body").addClass("loading");
    log("learning script on");
    getLocation(filterEvents);
    putUserFriendsEvents();
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

    log(promises);
    var tmpsize = promises.length;
    log(tmpsize);
    $.when.apply($, promises).then(function () {
        $.when.apply($, promises).then(function () {
            counter++;
        });
    });
    setInterval(function(){
        if (counter >= tmpsize) {
            //$("body").removeClass("loading");
            callback();
        }}, 3000);
    log("learning script done");
}
