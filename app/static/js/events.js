var eventful_events_locations = [];
var eventful_events_interests_city = [];
var eventful_events_interests_country = [];
var interests = [];
var city, country;
var x;

function fetch_interests(json) {
    if (json._source.interests.music) {
        interests = $.merge(interests, json._source.interests.music);
    }
    if (json._source.interests.movies) {
        interests = $.merge(interests, json._source.interests.movies);
    }
    if (json._source.interests.television) {
        interests = $.merge(interests, json._source.interests.television);
    }
    if (json._source.interests.games) {
        interests = $.merge(interests, json._source.interests.games);
    }
}

function filter_location(json, callback) {
    var obj = new Object();
    fetch_interests(json);
    if (json._source.location) {
        var tmp = json._source.location.split(",");
        city = tmp[0];
        country = tmp[1];
        obj.location = json._source.location;
        filterEvents(obj, function (d) {
            if (d[1].search.events.event) {
                var events = d[1].search.events.event;
                for (var e in events) {
                    for (var i in interests) {
                        if (events[e].description && events[e].description["#text"] && events[e].description["#text"].data.indexOf(interests[i]) > -1 || 
                            events[e].title && events[e].title["#text"] && events[e].title["#text"].data.indexOf(interests[i]) > -1) {
                            eventful_events_locations.push(events[e]);
                            break;
                        }
                    }
                }
                if (callback)
                    callback(json);
            }
        });
    }
}

function filter_musicalEvents(json) {
    var musicians = json._source.interests.music;
    if (musicians) {
        for (var perf in musicians) {
            filterPerformers("", musicians[perf], function (d) {
                if (d[1].search.performers.performer && d[1].search.performers.performer.id) {
                    var id = d[1].search.performers.performer.id["#text"].data;
                    performerEvents(id, function (dd) {
                        if (dd[1].events.event) {
                            var events = dd[1].events.event;
                            for (var e in events) {
                                if (events[e].city && events[e].city["#text"].data === city) {
                                    eventful_events_interests_city.push(events[e]);
                                }
                                if (events[e].country && events[e].country["#text"].data === country) {
                                    eventful_events_interests_country.push(events[e]);
                                }
                            }
                        }
                    });
                }
            });
        }
    }
}

function events_main() {

    es_get_id("preferences", FB.getUserID(), function(json_data) {
        json = JSON.parse(json_data);
        filter_location(json, filter_musicalEvents );
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

function empty(r) {}

function putUserEvents() {
    FB.api(
      '/me/events',
      'GET',
      {"fields":"description,place,start_time"},
      function(response) {
        var events = [];
        pageAll(response, events, function(events) {
            for (var i=0; i<events.length; i++) {
                events[i]['user'] = user_id;
                es_put_id('events', user_id + '_' + events[i].id, events[i], empty);
            }
        });
      }
    );
}


function putUserFriendsEvents() {
    FB.api(
        '/me/friends',
        'GET',
        {"fields":"id,events"},
        function(response) {
            data = response.data;
            for (var i=0; i<data.length; i++) {
                var events = data[i].events.data;
                var friend = data[i].id;
                for (var j=0; j<events.length; j++) {
                    var ev = events[j];
                    ev['friend_of_user'] = user_id;
                    ev['friend_id'] = friend;
                    es_put_id('events', user_id + '_' + friend + '_' + ev.id, ev, empty);
                }
            }
        }
    );
}

function pageAll(resp, data, callback) {
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

