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

var vote = function () {
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
    var playesr = Players.find({_id: {$ne: Session.get('player_id')},
                                name: {$ne: ''},
                                game__id: {$exists: false}});
    return players;
};

Template.lobby.count = function () {
    var playesr = Players.find({_id: {$ne: Session.get('player_id')},
                                name: {$ne: ''},
                                game__id: {$exists: false}});
    return players.count();
};

Template.lobby.disabled = function () {
    var me = player();
    if (me && me.name)
        return '';
    return 'disabled="disabled"';
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

Template.board.clock = function () {
    var clock = game() && game().clock;

    if (!clock || clock === 0)
        return;

    // format into M:SS
    var min = Math.floor(clock / 60);
    var sec = clock % 60;
    return min + ':' + (sec < 10 ? ('0' + sec) : sec);
};

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

Template.voteboard.show = function () {
    return game() && game().clock > 0;
};

Template.voteboard.events({
    var me = player();

    'keydown .vote': function (evt) {
        if (evt.keyCode == 37)
            vote('left', me);
        if (evt.keyCode == 38)
            vote('up', me);
        if (evt.keyCode == 39)
            vote('right', me);
        if (evt.keyCode == 40)
            vote('down', me);
 }
});

Template.postgame.show = function () {
    return game() & game().clock === 0;
};

Template.postgame.events({
    'click button': function (evt) {
        Players.update(Session.get('player_id'), $set: {game_id: null});
    }
});

//
// Initialization
//

Meteor.startup(function () {
    var player_id = Players.insert({name: '', idle: false});
    Session.set('player_id', player_id);

    Deps.autorun(function () {
        Meteor.subscribe('players');

        if (Session.get('player_id')) {
            var me = player();
            if (me && me.game_id) {
                Meteor.subscribe('games', me.game_id);
                Meteor.subscribe('words', me.game_id, Session.get('player_id'));
            }
        }
    });

    Meteor.setInterval(function() {
        if (Meteor.status().connected)
            Meteor.call('keepalive', Session.get('player_id'));
    }, 20*1000);
});
