// Main client application logic //

//
// Utility functions
//

var player = function () {
    return Players.findOne(Session.get('player_id'));
};

var game = function () {
    var me = player();
    return me && me.game_id && Games.findOne(me.game_id);
};

var vote = function (direction) {
    var me = player();
    var vote = Votes.findOne({game_id: me.game_id,
                              direction: direction});
    console.log("dir: "+direction);

    if (vote) {
        var count = vote.count + 1;
        console.log("setting dir: "+direction+" to count "+count);
        var result = Votes.update({_id: vote._id}, {$set: {count: count}});
    } else {
        Votes.insert({game_id: me.game_id,
                      direction: direction,
                      count: 1});
    }

    var vote = Votes.findOne({game_id: me.game_id,
                              direction: direction});
    console.log(vote);

    return;
};

//
// lobby template: shows all users not currently playing, and
// offers a button to start a new game.
//

Template.lobby.show = function () {
    return !game();
};

Template.lobby.waiting = function () {
    var players = Players.find({_id: {$ne: Session.get('player_id')},
                                name: {$ne: ''},
                                game_id: {$exists: false}});
    return players;
};

Template.lobby.count = function () {
    var players = Players.find({_id: {$ne: Session.get('player_id')},
                                name: {$ne: ''},
                                game_id: {$exists: false}});
    return players.count();
};

Template.lobby.disabled = function () {
    var me = player();
    if (me && me.name)
        return '';
    return 'disabled';
};

Template.lobby.events({
    'keyup input#myname': function (evt) {
        var name = $('#lobby input#myname').val().trim();
        Players.update(Session.get('player_id'), {$set: {name: name}});
    },
    'click button.startgame': function () {
        Meteor.call('start_new_game');
    }
});

//
// board template: renders the board, clock and votes list given the
// current game. if there is no game, show a splash screen.
//
var SPLASH = ['M','','','','','','','','','',
              '','','','','','','','','','',
              '','','','','','','','','','',
              '','','','R', 'A', 'T','','','','',
              '','','','M','M','M','M','','','',
              '','','','R','A','C','E','','','',
              '','','','','','','','','','',
              '','','','','','','','','','',
              '','','','','','','','','','',
              '','','','','','','','','','C'];

Template.board.square = function (i) {
    var g = game();
    return g && g.board && g.board[i] || SPLASH[i];
};

// Template.board.clock = function () {
//     if (!game()) {
//         console.log("Couldn't find game.");
//         return '0:00';
//     }
//     var clock = game() && game().gameclock;
//
//     if (!clock || clock === 0)
//         return;
//
//     // format into M:SS
//     var min = Math.floor(clock / 60);
//     var sec = clock % 60;
//     return min + ':' + (sec < 10 ? ('0' + sec) : sec);
// };

Template.board.events({
//    var me = player();
//
//    'keydown .vote': function (evt) {
//        if (evt.keyCode == 37)
//            vote('left', me);
//        if (evt.keyCode == 38)
//            vote('up', me);
//        if (evt.keyCode == 39)
//            vote('right', me);
//        if (evt.keyCode == 40)
//            vote('down', me);
// }
});

//
// voting board
//

Template.voteboard.events({
    // var me = player();

    'click button#voteleft.votebutton': function (evt) {
        console.log(evt);
        vote('left');
    },

    'click button#votedown.votebutton': function (evt) {
        console.log(evt);
        vote('down');
    },

    'click button#voteup.votebutton': function (evt) {
        console.log(evt);
        vote('up');
    },

    'click button#voteright.votebutton': function (evt) {
        console.log(evt);
        vote('right');
    },

    'keydown .vote': function (evt) {
        if (evt.keyCode == 37)
            vote('left');
        if (evt.keyCode == 38)
            vote('up');
        if (evt.keyCode == 39)
            vote('right');
        if (evt.keyCode == 40)
            vote('down');
    }
});

Template.voteboard.show = function() {
    return game() && game().voteclock >= 0;
};

Template.voteboard.votes = function() {
    return Votes.find({game_id: game() && game()._id});
};

Template.voteboard.voteclock = function() {
    if (!game()) {
        return '';
    }

    return game().voteclock;
}

Template.postgame.show = function () {
    if (!game()) {
        return false;
    }
    return game() & game().voteclock === 0;
};

Template.postgame.events({
    'click button': function (evt) {
        Players.update(Session.get('player_id'), {$set: {game_id: null}});
    }
});

//
// Initialization
//

Meteor.startup(function () {
    // Allocate a new player id
    //
    // XXX this does not handle hot reload. in the reload case,
    // Session.get('player_id') will return a real id. we should check for
    // a pre-existing player, and if it exists, make sure the server still
    // knows about us.
    var player_id = Players.insert({name: '', idle: false});
    Session.set('player_id', player_id);

    // subscribe to all the players, the game i'm in, and all
    // the votes in that game.
    Deps.autorun(function () {
        Meteor.subscribe('players');

        if (Session.get('player_id')) {
            var me = player();
            if (me && me.game_id) {
                Meteor.subscribe('games', me.game_id);
                Meteor.subscribe('votes', me.game_id, Session.get('player_id'));
            }
        }
    });

    // send keepalives so the server can tell when we go away.
    //
    // XXX this is not a great idiom. meteor server does not yet have a
    // way to expose connection status to user code. Once it does, this
    // code can go away.
    Meteor.setInterval(function() {
        if (Meteor.status().connected)
            Meteor.call('keepalive', Session.get('player_id'));
    }, 20*1000);
});
