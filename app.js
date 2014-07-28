var express = require('express.io');
var app = express();
var path = require('path');
app.http().io();
var Twit = require('twit');

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function User(screenName,name,followers,friends,numbersOfTweets,profileImage)
{
    this.screenName = screenName;
    this.name = name;
    this.followers = followers;
    this.friends = friends;
    this.numbersOfTweets = numbersOfTweets;
    this.profileImage = profileImage;
}

function manageError(err,req){
    if(err !== null){
        console.log("err : " + err)
        var error = {statusCode : err.statusCode , message : err.message};
        req.io.emit('error', { message: error});
        return true;
    }
    return false;
}

function sendSpecificUserInfo(req){
    T.get('users/show', { screen_name: req.data.user}, function(err, reply) {
        if(manageError(err,req)) return;
        var user = new User(reply.screen_name,reply.name,reply.followers_count,reply.friends_count,reply.statuses_count,reply.profile_image_url)
        req.io.emit('check-user-response', { message: user});
    })
}

function sendFriendsProfile(i, cursorValue,req){
    T.get('friends/list', { screen_name: req.data.user, cursor : cursorValue }, function(err, reply) {
        for(key in err){console.log('err[' + key + '] = ' + err[key]);}

        if(manageError(err,req)) return;
        
        for (var i = reply.users.length - 1; i >= 0; i--) {
            var user = new User(reply.users[i].screen_name,reply.users[i].name,reply.users[i].followers_count,reply.users[i].friends_count,
                reply.users[i].statuses_count,reply.users[i].profile_image_url)
            req.io.emit('show-and-follow', { message: user});
            T.post('friendships/create', { id: reply.users[i].id },function(err,reply){
                console.log("le user " + reply.screen_name + " est maintenant followé")
            });
            //sleep(500);
        };
        cursorValue = reply.next_cursor;
        if(cursorValue != 0 && i < 0){sendFriendsProfile(i++,cursorValue,req)}
    }); 
};

function unfollowEveryBody(i, cursorValue,req){
    T.get('friends/list', { screen_name: req.data.stalkingUser, cursor : cursorValue }, function(err, reply) {
        for(key in err){console.log('err[' + key + '] = ' + err[key]);}

        if(manageError(err,req)) return;
        
        for (var i = reply.users.length - 1; i >= 0; i--) {
            T.post('friendships/destroy', {screen_name: reply.users[i].screen_name}, function(err, reply) {});
        };
        cursorValue = reply.next_cursor;
        if(cursorValue != 0 && i < 50) unfollowEveryBody(i++,cursorValue,req)
    }); 
};

var config = {consumer_key:"fakeToken",consumer_secret:"fakeToken",access_token:"fakeToken",access_token_secret:"fakeToken"};
var T = new Twit(config);

app.io.route('credentials', function(req) {
    var config = {
        consumer_key:         req.data.consumer_key,
        consumer_secret:      req.data.consumer_secret,
        access_token:         req.data.access_token,
        access_token_secret:  req.data.access_token_secret};

    T.setAuth(config);
});

app.io.route('stalker-info', function(req) {
    // show stalking user profile
    sendSpecificUserInfo(req);
})

app.io.route('ready', function(req) {
    // show stalker user profile
    sendSpecificUserInfo(req);

    // unfollow each friends of the stalker user
    unfollowEveryBody(0,-1,req);

    // show and follow each friends of the stalking user
    sendFriendsProfile(0,-1,req);
})

// Send the client html.
app.get('/', function(req, res) { 
    res.sendfile(__dirname  + '/views/client.html')
})

app.listen(3000)
