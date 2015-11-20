function events_main() {
    log("events_main");

    eventful_events = [];

    es_get_id("preferences", FB.getUserID(), function(json_data) {
        json = JSON.parse(json_data);
        log(json._source);
        var obj = new Object();
        obj.location = json._source.location;
        filterEvents(obj, function (d) {
            log(d[1].search.events.event);
            eventful_events = $.merge(eventful_events, d[1].search.events.event);
            log(eventful_events);
        });
    });
}

var user_id = undefined;
var user_name = undefined;

function _es_db(db_req, callback) {
    return $.ajax({
        url: CONF.DB,
        type: 'POST',
        data: db_req,
        success: function(data) {
            console.log(data);
            callback(data);
        },
        error: function(error) {
            console.log(error.responseText);
        }
    });
}

es_put = function(type_name, data, callback) {
    var db_req = JSON.stringify({
        index: type_name + "/",
        method: 'POST',
        query: JSON.stringify(data)});
    _es_db(db_req, callback);
};

es_put_id = function(type_name, id, data, callback) {
    var db_req = JSON.stringify({
        index: type_name + "/" + id,
        method: 'PUT',
        query: JSON.stringify(data)});
    _es_db(db_req, callback);
};

function setCurrentUser() {
    FB.api(
      '/me',
      'GET',
      {},
      function(response) {
        user_id = response.id;
        user_name = response.name;
      }
    );
}

function getUserEvents() {
    FB.api(
      '/me/events',
      'GET',
      {"fields":"description,place,start_time"},
      function(response) {
        var events = [];
        pageAll(response, events, function(events) {
            events_all = {my: events, of_friends: []}
            $.ajax({
                url: 'put_events',
                type: 'POST',
                data: events_all,
                success: function(data) {
                    console.log(data);
                },
                error: function(error) {
                    console.log(error.responseText);
                }
            });
        });
      }
    );
}

function pageAll(resp, data, callback) {
    console.log('GOT:', resp);
    data.push.apply(data, resp.data);
    next = resp.paging.next;
    if (next) {
        FB.api(next, function(r) {
            pageAll(r, data, callback);
        });
    } else {
        callback(data);
    }
}

