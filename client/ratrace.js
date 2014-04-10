// Main client application logic //

var ADJACENCIES = [
[10, 1], [11, 0, 2], [12, 1, 3], [13, 2, 4], [14, 3, 5], [15, 4, 6], [16, 5, 7], [17, 6, 8], [18, 7, 9], [19, 8], [0, 20, 2], [1, 21, 1, 3], [2, 22, 2, 4], [3, 23, 3, 5], [4, 24, 4, 6], [5, 25, 5, 7], [6, 26, 6, 8], [7, 27, 7, 9], [8, 28, 8, 10], [9, 29, 9], [10, 30, 3], [11, 31, 2, 4], [12, 32, 3, 5], [13, 33, 4, 6], [14, 34, 5, 7], [15, 35, 6, 8], [16, 36, 7, 9], [17, 37, 8, 10], [18, 38, 9, 11], [19, 39, 10], [20, 40, 4], [21, 41, 3, 5], [22, 42, 4, 6], [23, 43, 5, 7], [24, 44, 6, 8], [25, 45, 7, 9], [26, 46, 8, 10], [27, 47, 9, 11], [28, 48, 10, 12], [29, 49, 11], [30, 50, 5], [31, 51, 4, 6], [32, 52, 5, 7], [33, 53, 6, 8], [34, 54, 7, 9], [35, 55, 8, 10], [36, 56, 9, 11], [37, 57, 10, 12], [38, 58, 11, 13], [39, 59, 12], [40, 60, 6], [41, 61, 5, 7], [42, 62, 6, 8], [43, 63, 7, 9], [44, 64, 8, 10], [45, 65, 9, 11], [46, 66, 10, 12], [47, 67, 11, 13], [48, 68, 12, 14], [49, 69, 13], [50, 70, 7], [51, 71, 6, 8], [52, 72, 7, 9], [53, 73, 8, 10], [54, 74, 9, 11], [55, 75, 10, 12], [56, 76, 11, 13], [57, 77, 12, 14], [58, 78, 13, 15], [59, 79, 14], [60, 80, 8], [61, 81, 7, 9], [62, 82, 8, 10], [63, 83, 9, 11], [64, 84, 10, 12], [65, 85, 11, 13], [66, 86, 12, 14], [67, 87, 13, 15], [68, 88, 14, 16], [69, 89, 15], [70, 90, 9], [71, 91, 8, 10], [72, 92, 9, 11], [73, 93, 10, 12], [74, 94, 11, 13], [75, 95, 12, 14], [76, 96, 13, 15], [77, 97, 14, 16], [78, 98, 15, 17], [79, 99, 16], [80, 10], [81, 9, 11], [82, 10, 12], [83, 11, 13], [84, 12, 14], [85, 13, 15], [86, 14, 16], [87, 15, 17], [88, 16, 18], [89, 17]
];

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
    var vote = Votes.findOne({direction: direction});
    console.log("dir: "+direction);

    if (vote) {
        var count = vote.count + 1;
        console.log("setting dir: "+direction+" to count "+count);
        var result = Votes.update({_id: vote._id}, {$set: {count: count}});
    } else {
        Votes.insert({direction: direction,
                      count: 1});
    }

    var vote = Votes.findOne({direction: direction});
    console.log(vote);

    return;
};

// var move = function (direction) {
//     if (!game()) {
//         console.log("error finding game.");
//         return;
//     }
//     var board = game().board;
//     var mouseLoc = board.indexOf('M');
//     var cheeseLoc = board.indexOf('C');
//
//     if (direction == 'left') {
//         if (ADJACENCIES[mouseLoc].indexOf(mouseLoc - 1) != -1) {
//             board[mouseLoc - 1] = 'M';
//             board[mouseLoc] = '.';
//         }
//     } else if (direction == 'right') {
//         if (ADJACENCIES[mouseLoc].indexOf(mouseLoc + 1) != -1) {
//             board[mouseLoc + 1] = 'M';
//             board[mouseLoc] = '.';
//         }
//     } else if (direction == 'down') {
//         if (ADJACENCIES[mouseLoc].indexOf(mouseLoc + 10) != -1) {
//             board[mouseLoc + 10] = 'M';
//             board[mouseLoc] = '.';
//         }
//     } else if (direction == 'up') {
//         if (ADJACENCIES[mouseLoc].indexOf(mouseLoc - 10) != -1) {
//             board[mouseLoc - 10] = 'M';
//             board[mouseLoc] = '.';
//         }
//     }
//
//     Games.update(game().game_id, {$set: {board: board}});
// };

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

Template.voteboard.show = function () {
    return game() && game().gameclock > 0;
};

Template.voteboard.events({
    // var me = player();

    'click button#voteleft.votebutton': function (evt) {
        console.log(evt);
        vote('left');
    },

    'click button#votedown.votebutton': function (evt) {
        console.log(evt);
        vote('down');
        Meteor.call('move', 'down');
    },

    'click button#voteup.votebutton': function (evt) {
        console.log(evt);
        vote('up');
    },

    'click button#voteright.votebutton': function (evt) {
        console.log(evt);
        vote('right');
        Meteor.call('move', 'right');
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

Template.voteboard.votes = function() {
    return Votes.find({game_id: game() && game()._id});
};

Template.voteboard.voteclock = function() {
    if (!game()) {
        return '0:00';
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

Meteor.methods({
    move: function (direction) {
        if (!game()) {
            console.log("error finding game.");
            return;
        }
        var board = game().board;
        var mouseLoc = board.indexOf('M');
        var cheeseLoc = board.indexOf('C');

        console.log("ADJACENCIES[0]: "+ADJACENCIES[0]);

        if (direction == 'left') {
            if (ADJACENCIES[mouseLoc].indexOf(mouseLoc - 1) != -1) {
                board[mouseLoc - 1] = 'M';
                board[mouseLoc] = '.';
            }
        } else if (direction == 'right') {
            if (ADJACENCIES[mouseLoc].indexOf(mouseLoc + 1) != -1) {
                console.log("trying to move M to right");
                board[mouseLoc + 1] = 'M';
                board[mouseLoc] = '.';
            }
        } else if (direction == 'down') {
            if (ADJACENCIES[mouseLoc].indexOf(mouseLoc + 10) != -1) {
                board[mouseLoc + 10] = 'M';
                board[mouseLoc] = '.';
            }
        } else if (direction == 'up') {
            if (ADJACENCIES[mouseLoc].indexOf(mouseLoc - 10) != -1) {
                board[mouseLoc - 10] = 'M';
                board[mouseLoc] = '.';
            }
        }

        console.log("board: "+board);

        Games.update(game()._id, {$set: {board: board}});

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
