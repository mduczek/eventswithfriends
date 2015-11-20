var eventful_events_locations = [];
var eventful_events_interests_city = [];
var interests = [];
var city;

var NOTHING = "Unfortunately, there is no suggested event in this category...";
var promises = [];
var promises2 = [];

function draw_empty(div) {
    var d = $("<p/>").addClass("bg-danger").text(NOTHING);
    $(div).find(".events").append(d);
}

function draw_event(e, div) {
    var d = $("<div/>").addClass("col-sm-12").addClass("event");
    d.append($("<h4/>").text(e.title["#text"].data).addClass("col-sm-offset-2").addClass("col-sm-8"));
    var img = $("<div/>").addClass("col-sm-4").addClass("col-sm-offset-2").addClass("text-center");
    d.append(img);
    var url = "";
    if (e.image && e.image.medium && e.image.medium.url && e.image.medium.url["#text"]) {
        url = e.image.medium.url["#text"].data.replace("/medium/", "/large/");
    } else {
        url = "/static/img/placeholder-03.png";
    }
    img.append($("<img/>").attr("src", url).width("100%"));

    var det = $("<div/>").addClass("col-sm-6");
    if (e.start_time && e.start_time["#text"]) {
        det.append($("<p/>").addClass("time").text("Starts at: " + e.start_time["#text"].data));
    }
    if (e.venue_name && e.venue_name["#text"]) {
        det.append($("<p/>").addClass("name").text(e.venue_name["#text"].data));
    }
    if (e.venue_address && e.venue_address["#text"]) {
        det.append($("<p/>").addClass("address").text(e.venue_address["#text"].data));
    }
    if (e.url && e.url["#text"]) {
        det.append($("<a/>").attr("href", e.url["#text"].data).text("Learn more..."));
    }

    det.append('<div><button onclick="testPublishingEvents()" class"btn btn-large btn-primary">Invite</button></div>');

    d.append(det);


    $(div).find(".events").append(d);

}

function draw_locations() {
    if (eventful_events_locations.length > 0) {
        for (var i in eventful_events_locations) {
            draw_event(eventful_events_locations[i], '.events_in_location');
        }
    } else {
        draw_empty('.events_in_location');
    }
}

function draw_music_city() {
    if (eventful_events_interests_city.length > 0) {
        for (var i in eventful_events_interests_city) {
            draw_event(eventful_events_interests_city[i], '.favorite_musician_city');
        }

    } else {
        draw_empty('.favorite_musician_city');
    }
}

function draw() {
    draw_locations();
    draw_music_city();
}

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

function get_shared_interests() {
    es_get_all("preferences", function(data) {
        var uid = FB.getUserID();
        log(uid);

        var data = JSON.parse(data);
        log(data);

        var preferences = {};
        if (data["hits"]["hits"] !== undefined) {
            $.each(data["hits"]["hits"], function (idx, val) {
                preferences[val._id] = val._source;
            });
        }

        var sharedInterests = {};
        $.each(preferences[uid].friends, function(idx, friend) {
            if (!preferences[friend.id]) {
                return; // continue inside $.each to skip friends who are not yet in the db
            }

            $.each(preferences[friend.id].interests, function(category, content) {
                var sharedTitles = $(preferences[uid].interests[category]).filter(content).toArray();
                $.each(sharedTitles, function(idx, sharedTitle) {
                    if (!sharedInterests[sharedTitle]) {
                        sharedInterests[sharedTitle] = [];
                    }
                    sharedInterests[sharedTitle].push(friend);
                });

                log("this");
                log(preferences[uid].interests[category]);

                log("against");
                log(content);

                log("shared interests");
                log($(preferences[uid].interests[category]).filter(content).toArray());
            });
        });

        log(sharedInterests);
        
        return sharedInterests;
    });
}

function filter_location(json, callback) {
    var obj = new Object();
    fetch_interests(json);
    if (json._source.location) {
        var tmp = json._source.location.split(",");
        city = tmp[0];
        obj.location = json._source.location;
        obj.category = "music,movies_film,art,attractions,books";
        obj.page_size = "50";
        promises.push(
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
                    }
                })
                );
    }
}

function filter_musicalEvents(json) {
    var musicians = json._source.interests.music;
    if (musicians) {
        for (var perf in musicians) {
            promises.push(
                    filterPerformers("", musicians[perf], function (d) {
                        if (d[1].search.performers.performer && d[1].search.performers.performer.id) {
                            var id = d[1].search.performers.performer.id["#text"].data;
                            promises2.push(performerEvents(id, function (dd) {
                                if (dd[1].events.event) {
                                    var events = dd[1].events.event;
                                    for (var e in events) {
                                        if (events[e].city && events[e].city["#text"].data === city) {
                                            eventful_events_interests_city.push(events[e]);
                                        }
                                    }
                                }
                            })
                                    );
                        }
                    })
                    )
        }
    }
}

function events_main() {

    es_get_id("preferences", FB.getUserID(), function(json_data) {
        json = JSON.parse(json_data);
        filter_location(json);
        filter_musicalEvents(json);
        $.when.apply($, promises).then(function() {
            $.when.apply($, promises2).then(function() {
                draw();
            });
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

function empty(r) {}

function putUserEvents() {
    var user_id = FB.getUserID();
    FB.api(
      '/me/events',
      'GET',
      {"fields":"description,place,start_time,cover,name"},
      function(response) {
        var events = [];
        pageAll(response, events, function(events) {
            for (var i=0; i<events.length; i++) {
                events[i]['user_my'] = user_id;
                es_put_id('events', user_id + '_' + events[i].id, events[i], empty);
            }
        });
      }
    );
}


function es_search(type_name, query, callback) {
    var db_req = JSON.stringify({
        index: type_name + "/_search",
        method: 'SEARCH',
        query: JSON.stringify(query)});
    _es_db(db_req, callback);
}

function getEvents(description_q) {
    var user_id = FB.getUserID();
    MUST = []
    MUST.push({"term": {
                      "friend_of_user": {
                        "value": user_id
                      }
                    }});
    if (description_q) {
        MUST.push({"match": { "description": description_q }})
    };
    
    QUERY =
        {
          "query": {
            "filtered": { 
              "query": {
                "bool": {
                  "must": MUST
                } 
              },
              "filter": {
                "range": { "start_time": { "gte": "now-1d/d" }}
              }
            }
          }
        }
    es_search('events', QUERY, function(r) {
        friends = {};
        evs = JSON.parse(r).hits.hits;
        for (var i=0; i<evs.length; i++) {
            var id = evs[i]['_source']['id'];
            var x = friends[id];
            var ev = evs[i]['_source'];
            if (x) {
                x['user_id'].push(ev['friend_id']);
            } else {
                ev['user_id'] = [ev['friend_id']];
                friends[id] = ev;
            }
        }
        ev = Object.keys(friends).map(function(key){return friends[key]});
        create_events(ev);
    });
}

images = {
    "100001711710125":"https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash2/v/t1.0-1/p50x50/10547465_767005763366474_5606662814702399442_n.jpg?oh=a2cd0e40eb1a09c90f5ebf7432e29bb9&oe=56E86360&__gda__=1454426521_edc204f85ac9fd1f985200b2025be62d"
}

FB_EVENT_PREFIX = "https://www.facebook.com/events/";

function create_events(events) {
    html = '';
    for (var i = 0; i < events.length; i++) {
        var ev = events[i];
        html += '<div class="event">';
        html += '<a href="'+FB_EVENT_PREFIX+ev['id']+'">'+ev['name']+'</a>';
        html += '<span class="location">'+ev['place']['name']+'</span>'
        html += '<img src="'+ev['cover']['source']+'"/>';
        html += '</div>';

    };
    $('#page').html(html);
}

function putUserFriendsEvents() {
    var user_id = FB.getUserID();
    promises.push(FB.api(
        '/me/friends',
        'GET',
        {"fields":"id,events{cover,start_time,description,place,name}"},
        function(response) {
            data = response.data;
            for (var i=0; i<data.length; i++) {
                var events = data[i].events.data;
                var friend = data[i].id;
                for (var j=0; j<events.length; j++) {
                    var ev = events[j];
                    var eve = {};
                    eve['title'] = ev['name'];
                    eve['url'] = FB_EVENT_PREFIX + ev['id'];
                    eve['description'] = ev['description']
                    if (ev['cover']) {
                        eve['image'] = ev['cover']['source'];
                    } else {
                        eve['image'] = '';
                    }
                    var address = '';
                    if (ev['place']) {
                        var place = ev['place'];
                        if (place['name']) {
                            address += place['name'];
                        }
                        if (place['street']) {
                            address += '\n' + place['street'];
                        }
                        if (place['city']) {
                            address += '\n' + place['city'];
                        }
                    }
                    eve['address'] = address;
                    eve['datetime'] = ev['start_time'];
                    eve['ident'] = ev['id'];

                    eve['user_id'] = user_id;
                    eve['friend_id'] = friend;
                    promises2.push(es_put_id('events', user_id + '_' + friend + '_' + eve.ident, eve, empty));
                }
            }
        }
    ));
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

