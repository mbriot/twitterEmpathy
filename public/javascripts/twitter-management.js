io = io.connect()

$(document).ready(function () {
    $("#connectedUser").attr('style', 'visibility:hidden');
    $("#toggleNavigation").attr('style', 'visibility:hidden');
    $("#userForm").hide();
    $("#content").hide();
});

$("#setCredentials").on('click', function () {
//	var user = $("#user").val();
//	var consumer_key = $("#consumer_key").val();
//	var consumer_secret = $("#consumer_secret").val();
//	var access_token = $("#access_token").val();
//	var access_token_secret = $("#access_token_secret").val();

    io.emit('credentials', {
        consumer_key: consumer_key,
        consumer_secret: consumer_secret,
        access_token: access_token,
        access_token_secret: access_token_secret});

//	$("#stalkingUserInfo").empty();
    io.emit('stalker-info', {user: user});
});

$("#startProcess").on('click', function () {
    var userToStalk = $("#userToStalk").val();
    var stalkingUser = $("#user").val();
    if (userToStalk != 0) {
        $("#content").show();
        io.emit('ready', {user: userToStalk, stalkingUser: stalkingUser})
    }
    else {
        $("#alertError div").text("Vous n'avez spécifié aucun utilisateur à stalker :(");
        $("#alertError").show();
    }
});

io.on('show-and-follow', function (data) {
    generateThumbnail("#contact-list", data);
})

io.on('check-user-response', function (data) {
    if (data.message.screenName == $("#user").val()) {
        showUser(data, "#connectedUser");
        $("#connectedUser").attr('style', '');
        $("#toggleNavigation").attr('style', '');
        $("#credentialsForm").hide();
        $("#userForm").show();
        $("#userToStalk").tooltip();
        $("#startProcess").tooltip();
    }
    else
        showUser(data, "#stalkingUserInfo");
})

io.on('error', function (data) {
    if (data.message.statusCode == 401) { //Wrong credentials
        $("#userForm").hide();
        $("#credentialsForm").show();
    }
    $("#alertError div").text(data.message.message);
    $("#alertError").show();
})

var showUser = function (data, idOfElement) {
    $(idOfElement + " img").attr('src', data.message.profileImage.replace('_normal', ''));
    $(idOfElement + " img").attr('alt', data.message.screenName);
    $(idOfElement + " img").attr('title', data.message.screenName);
    $(idOfElement + " .username").append(data.message.screenName);
    $(idOfElement + " .link").append('<a href="https://twitter.com/' + data.message.screenName + '">@' + data.message.screenName + '</a>');
    $(idOfElement + " .tweets").append(data.message.numbersOfTweets);
    $(idOfElement + " .friends").append(data.message.friends);
    $(idOfElement + " .followers").append(data.message.followers);
};

var generateThumbnail = function (divIdWhereToAppend, data) {
    $(divIdWhereToAppend).append('<div class="item col-xs-12 col-sm-6 col-md-4 col-lg-3">'
        + '<div class="thumbnail" id="' + data.message.screenName + '">'
        + '<a href="https://twitter.com/' + data.message.screenName + '"><img src="' + data.message.profileImage.replace('_normal', '') + '"/></a>'
        + '<div class="caption row no-paddingtext-center">'
        + '<h4 class="link text-center"><a href="https://twitter.com/' + data.message.screenName + '">@' + data.message.screenName + '</a></h4>'
        + '    <div class="infos-head text-center">'
        + '        <div class="col-xs-4">'
        + '        Tweets'
        + '        </div>'
        + '        <div class="col-xs-4">'
        + '        Amis'
        + '        </div>'
        + '        <div class="col-xs-4">'
        + '        Fans'
        + '        </div>'
        + '    </div>'
        + '    <div class="text-center">'
        + '        <div class="col-xs-4 tweets">'
        + '            <span class="glyphicon glyphicon-envelope"></span>' + data.message.numbersOfTweets
        + '        </div>'
        + '        <div class="col-xs-4 friends">'
        + '            <span class="glyphicon glyphicon-user"></span>' + data.message.friends
        + '        </div>'
        + '        <div class="col-xs-4 followers">'
        + '            <span class="glyphicon glyphicon-user"></span>' + data.message.followers
        + '        </div>'
        + '    </div>'
        + '</div>'
        + '</div>'
        + '</div>');
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}