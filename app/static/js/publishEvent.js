function inviteForEvent(url, listOfFriends) {
	//var listOfFriends = "1028130340601200,948792808528908,100001711710125";

	publishEvent(url, listOfFriends);
}

// listOfFriends: lista idkow rozdzielonych przecinkami
function publishEvent(url, listOfFriends) {
	var privacy = {"value":"SELF"};

	FB.api(
	  '/me/feed',
	  'POST',
	  {"tags":listOfFriends,"privacy":privacy,"message":"Hey, there is an event that might be interesting for us! Here you have some details:\n"+url},
	  function(response) {
	      log('Post dodany xoxo');
          var dialog = $("<div/>").attr("title", "Confirmation");

          var iframe = $("<div/>").text("Invitation sent");
          dialog.append(iframe);

          dialog.dialog({
              width: 250,
              height: 100,
              modal: true,
              close: function () {
                  dialog.remove();
              }
          })

	  }
	);

}

$(function() {
   $(".invitation").click(function () {
        var url = $(this).attr("data-href");
        var friends = [];
        log($(this).parent().parent());
        $(this).parent().parent().find(".checked").each(function(){ 
            log($(this));
            friends.push($(this).attr("data-friend_id"));
        });
        inviteForEvent(url, friends);
   });
});
