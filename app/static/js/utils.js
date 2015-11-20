if (typeof String.prototype.startsWith != 'function') {
    // see below for better implementation!
    String.prototype.startsWith = function (str){
        return this.indexOf(str) === 0;
    };
}

function log(txt) {
    if (DEBUG)
        console.log(txt);
}

function redirect(url) {
    $(window).attr('location', url);
}


