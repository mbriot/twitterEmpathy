io = io.connect()

$( document ).ready(function() {
    $("#userForm").hide();
});

$("#setCredentials").on('click',function(){
	var user = $("#user").attr('value');
	var consumer_key = $("#consumer_key").attr('value');
	var consumer_secret = $("#consumer_secret").attr('value');
	var access_token = $("#access_token").attr('value');
	var access_token_secret = $("#access_token_secret").attr('value');

	io.emit('credentials',{
		consumer_key : consumer_key, 
		consumer_secret : consumer_secret, 
		access_token : access_token, 
		access_token_secret : access_token_secret}); 
	
	$("#stalkingUserInfo").empty();
	io.emit('stalker-info',{user: user});

	$("#credentialsForm").hide();
	$("#userForm").show();
});

$("#startProcess").on('click',function(){
	var userToStalk = $("#userToStalk").attr('value');
	var stalkingUser = $("#user").attr('value');
	if(userToStalk != 0) {
		$("#friendsList").empty();
		io.emit('ready',{user : userToStalk, stalkingUser : stalkingUser}) 
	}
	else {
		$("#alertError div").text("Vous n'avez spécifié aucun utilisateur à stalker :(");
		$("#alertError").attr("style","display:block");
	}
});

io.on('show-and-follow', function(data) {
	showUser(data,"#friendsList")
})

io.on('check-user-response', function(data) {
	showUser(data,"#stalkingUserInfo")
})

io.on('error', function(data) {
	if(data.message.statusCode == 401){ //Wrong credentials
		$("#userForm").hide();
		$("#credentialsForm").show();
	}
	$("#alertError div").text(data.message.message);
	$("#alertError").attr("style","display:block");
})

var showUser = function(data,idOfElement){
	$(idOfElement).append('<div class="col-xs-4">' 
	 + '<div class="tweetProfile">' 
	 +		'<img src="' + data.message.profileImage + '">' 
	 +		'<a href="https://twitter.com/' + data.message.screenName + '" class="name">' + data.message.name  + '</a> <br>' 
	 +		'<a href="https://twitter.com/' + data.message.screenName + '" class="screeName">@' + data.message.screenName  + '</a> <br>' 
	 +		'<hr>' 
	 +		'<TABLE>' 
	 +			'<TR>' 
	 +				 '<TH> TWEETS </TH><TH> FOLLOWING </TH> <TH> FOLLOWERS </TH>' 
	 +			'</TR>' 
	 +			'<TR>' 
	 +				'<TD>' + data.message.numbersOfTweets + '</TD>' 
	 +				'<TD>'  + data.message.friends + '</TD>' 
	 +				'<TD>'  + data.message.followers +    '</TD>'  
	 +			'</TR>' 
	 +		'</TABLE>' 
	 + '</div></div>');
};
