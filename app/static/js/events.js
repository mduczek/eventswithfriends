var eventful_events_locations = [];
var eventful_events_interests_city = [];
var interests = [];
var city;

var NOTHING = "Unfortunately, there is no suggested event in this category...";
var promises = [];
var promises2 = [];

function hasClass( target, className ) {
        return new RegExp('(\\s|^)' + className + '(\\s|$)').test(target.className);
}

$(function() {
    $(".description").click(function() {
        $(this).toggleClass("open");
    });

    $(".reject").click(function() {
        var text = $(this).parent().find(".description").text();
        var title = $(this).parent().find(".title").text();
        var obj = new Object;
        obj.title = title;
        obj.description = text;
        $(this).parent().remove();
        return $.ajax({
            url: "/reject_event/"+FB.getUserID(),
            type: 'POST',
            data: JSON.stringify(obj),
            dataType: "json",
            success: function(data) {
                console.log(data);
            },
            error: function(error) {
                console.log(error.responseText);
            }
        });
    });

    $(".friend_picture").each(function() {
        log("dskjhfkjdhsfhjds");
        getPicture($(this).attr("data-friend_id"), function (url) {
            $(this).css("background-image", "url("+url+")");
            $(this).click(function() {
                $(this).toggleClass("checked");
            });
        });
    });
});

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

function putUserFriendsEvents(callback) {
    var user_id = FB.getUserID();
    FB.api(
        '/me/friends',
        'GET',
        {"fields":"id,events{cover,start_time,description,place,name}"},
        function(response) {
            data = response.data;
            var eventsMap = {};
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
                    eve['friend_id'] = [friend];

                    if (eventsMap[user_id +'_'+ eve.ident]) {
                        eventsMap[user_id +'_'+ eve.ident]['friend_id'].push(friend);
                    } else {
                        eventsMap[user_id +'_'+ eve.ident] = eve;
                    }
                }
            }
            var keys_num = 0;
            for (var ida in eventsMap) {
                keys_num += 1;
            }

            var is_done = function() {
                keys_num -= 1;
                console.log(">>>", keys_num);
                if (keys_num ==0) {
                    callback();
                }
            };
            for (var ida in eventsMap) {
                //console.log(ida, eventsMap[ida]);
                es_put_id('events', ida, eventsMap[ida], is_done);
            }
        }
    );
}

function getPicture(user, callback) {
dict = {
    '100001711710125':"https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash2/v/t1.0-1/p50x50/10547465_767005763366474_5606662814702399442_n.jpg?oh=a2cd0e40eb1a09c90f5ebf7432e29bb9&oe=56E86360&__gda__=1454426521_edc204f85ac9fd1f985200b2025be62d",
    '1068248266548994':"https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xtf1/v/t1.0-1/p50x50/11403395_989786231061865_2000113524457003408_n.jpg?oh=2f7d359528afb00ca81ec1955846eb28&oe=56F03B59&__gda__=1458088223_7283f6a607db2dadade417e70223b50b",
    '1028130340601200': "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash2/v/t1.0-1/c4.0.50.50/p50x50/10622858_728083623939208_8659444378509310568_n.jpg?oh=492d425c0abbf74651090df072d70ef8&oe=56AEAB5F&__gda__=1459008521_6fa8b024411c704b781c7fca35b47a76",
    '948792808528908':"https://scontent.xx.fbcdn.net/hprofile-xpa1/v/t1.0-1/c31.31.385.385/s50x50/250282_134280409980156_6339287_n.jpg?oh=7745f09524107d2c1d2f61eee02412c4&oe=56F09492"
}
callback(dict[user]);
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

