var PAGES = [
    {
        addresses: ["/index", "/"]
        , login_required: true
    }
    , {
        addresses: ["/contact"]
        , login_required: false
    }
    , {
        addresses: ["/settings"]
        , login_required: true
        , main_function: settings_main
    }
];

var CURRENT_PAGE = {};

var DEBUG = true;

var fb_APP_ID = '1634260110184354';
var fb_APP_SECRET = '5f68dfa75dd179857cfa48c001fbd9c2'; // naaasty thingieees
var fb_APP_NAMESPACE = 'events-with-friends';
var fb_PERMISSIONS = {};
var fb_DEFAULT_PERMISSIONS = "user_friends";

var USERS = {
    ids: []
    , users: []
};

$(document).ready(function () {

    var body = $("body");
    $(document).on("load-start", function () {
        body.addClass("loading").delay(100); 
    });
    $(document).on("load-stop", function () {
        body.delay(100).removeClass("loading"); 
    });

    // inicjacja SDK
    FBinit(fb_APP_ID);

    var path = window.location.pathname;
    for (i = 0; i < PAGES.length; i++) {
        if ($.inArray(path, PAGES[i].addresses) !== -1) { // znalazlo odpowiednia strone!
            CURRENT_PAGE = PAGES[i];
            i = PAGES.length; // wyjscie
        }
    };

    if (CURRENT_PAGE.login_required === true) {
        FBloginRequired();
    }
});

function exit() {
    log("exit called");
    //top.location.href = 'https://www.facebook.com/appcenter/' + APP_NAMESPACE;
}

function reRequest(scope, callback) {
    FB.login(function (response) {
        // generalnie na nowo ustawiamy permsy
        FB.api("/me/permissions", "GET", function(r) {
            fb_PERMISSIONS = r.data;
            callback(response);
        });

        }, { scope: scope, auth_type: 'rerequest' });
}

function main() {
    log("main");
    if (CURRENT_PAGE.main_function !== undefined) {
        CURRENT_PAGE.main_function();
    }

}

function send_notification(uid, message) {
    var access_token = fb_APP_ID + "|" + fb_APP_SECRET;
    FB.api('/' + uid + '/notifications?access_token=' + access_token
        + '&href=/calendar&template=' + message, 'POST',
        function(response) { console.log(response); })
}
