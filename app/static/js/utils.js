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

$(function() {
    $(document).on("click", ".url a", function() {
        var link = $(this).attr("data-href");
        var dialog = $("<div/>").attr("title", "Event information");

        var iframe = $("<iframe/>").attr("src", link).addClass("iframe");
        dialog.append(iframe);

        dialog.dialog({
            width: 750,
            height: 450,
            modal: true,
            close: function () {
                dialog.remove();
            }
        });

    });
});
