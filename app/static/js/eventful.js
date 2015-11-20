var EVENTFUL_URL = "/eventful_api";
var filterEvents = function (location) {
    var obj = new Object()
    obj.location = location.location.name;
    var string = JSON.stringify(obj);
    log(string);
    return $.ajax({
        url: EVENTFUL_URL + "/filter_events/" + FB.getUserID() + "/" + string,
        type: "GET",
        success: function(data) {
            log(data);
            log("ok");
        },
        error: function(error) {
            log(error.responseText);
        }
    });
};
