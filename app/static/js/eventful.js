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

var filterEvents = function (json_data, callback) {
    var string = JSON.stringify(json_data);
    return $.ajax({
        url: EVENTFUL_URL + "/filter_events/" + string,
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

var performerEvents = function (performerId, callback) {
    return $.ajax({
        url: EVENTFUL_URL + "/performer_events/" + performerId,
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

var filterPerformers = function (category, keywords, callback) {
    var url = EVENTFUL_URL + "/filter_performers/";
    if (keywords !== "" && category !== "") {
        url += keywords + "/" + category;
    } else if (keywords !== "") {
        url += "keywords/" + keywords;
    } else {
        url += "category/" + category;
    }
    return $.ajax({
        url: url,
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

