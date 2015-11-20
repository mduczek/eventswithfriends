
var Eventful = {
    var EVENTFUL_URL = "/eventful_api";

    var getCategories = function (callback) {
        return $.ajax({
            url: EVENTFUL_URL + "/get_categories",
            type: "GET",
            success: function(data) {
                log(data);
                callback(data);
            },
            error: function(error) {
                log(error.responseText);
            }
        });
    };

    
}


