// Server only logic //
var ADJACENCIES = [
[10, 1], [0, 11, 2], [1, 12, 3], [2, 13, 4], [3, 14, 5], [4, 15, 6], [5, 16, 7], [6, 17, 8], [7, 18, 9], [8, 19], [9, 0, 20, 11], [10, 1, 21, 12], [11, 2, 22, 13], [12, 3, 23, 14], [13, 4, 24, 15], [14, 5, 25, 16], [15, 6, 26, 17], [16, 7, 27, 18], [17, 8, 28, 19], [18, 9, 29], [19, 10, 30, 21], [20, 11, 31, 22], [21, 12, 32, 23], [22, 13, 33, 24], [23, 14, 34, 25], [24, 15, 35, 26], [25, 16, 36, 27], [26, 17, 37, 28], [27, 18, 38, 29], [28, 19, 39], [29, 20, 40, 31], [30, 21, 41, 32], [31, 22, 42, 33], [32, 23, 43, 34], [33, 24, 44, 35], [34, 25, 45, 36], [35, 26, 46, 37], [36, 27, 47, 38], [37, 28, 48, 39], [38, 29, 49], [39, 30, 50, 41], [40, 31, 51, 42], [41, 32, 52, 43], [42, 33, 53, 44], [43, 34, 54, 45], [44, 35, 55, 46], [45, 36, 56, 47], [46, 37, 57, 48], [47, 38, 58, 49], [48, 39, 59], [49, 40, 60, 51], [50, 41, 61, 52], [51, 42, 62, 53], [52, 43, 63, 54], [53, 44, 64, 55], [54, 45, 65, 56], [55, 46, 66, 57], [56, 47, 67, 58], [57, 48, 68, 59], [58, 49, 69], [59, 50, 70, 61], [60, 51, 71, 62], [61, 52, 72, 63], [62, 53, 73, 64], [63, 54, 74, 65], [64, 55, 75, 66], [65, 56, 76, 67], [66, 57, 77, 68], [67, 58, 78, 69], [68, 59, 79], [69, 60, 80, 71], [70, 61, 81, 72], [71, 62, 82, 73], [72, 63, 83, 74], [73, 64, 84, 75], [74, 65, 85, 76], [75, 66, 86, 77], [76, 67, 87, 78], [77, 68, 88, 79], [78, 69, 89], [79, 70, 90, 81], [80, 71, 91, 82], [81, 72, 92, 83], [82, 73, 93, 84], [83, 74, 94, 85], [84, 75, 95, 86], [85, 76, 96, 87], [86, 77, 97, 88], [87, 78, 98, 89], [88, 79, 99], [89, 80, 91], [90, 81, 92], [91, 82, 93], [92, 83, 94], [93, 84, 95], [94, 85, 96], [95, 86, 97], [96, 87, 98], [97, 88, 99], [98, 89]
];

var resetVotes = function () {
        Votes.update({direction: 'left'}, {$set: {count: 0}});
        Votes.update({direction: 'down'}, {$set: {count: 0}});
        Votes.update({direction: 'up'}, {$set: {count: 0}});
        Votes.update({direction: 'right'}, {$set: {count: 0}});
};

var maxDir = function () {
    var voteDirs = ['left', 'down', 'up', 'right'];
    var max = 0;
    var maxDir = '';

    for (var i = 0; i < 4; i ++) {
        var currVote = Votes.findOne({direction: voteDirs[i]});
        if (currVote.count > max) {
            max = currVote.count;
            maxDir = voteDirs[i];
        }
    }

    return maxDir;
};

var move = function (game_id, direction) {
    var game = Games.findOne(game_id);

    if (!game) {
        return;
    };

    var board = game.board;
    var mouseLoc = board.indexOf('M');
    var cheeseLoc = board.indexOf('C');

    if (direction == 'left') {
        if (ADJACENCIES[mouseLoc].indexOf(mouseLoc - 1) != -1) {
            if (board[mouseLoc - 1] == '.') {
                board[mouseLoc - 1] = 'M';
                board[mouseLoc] = '.';
            };
        }
    } else if (direction == 'right') {
        console.log('ADJ'+ADJACENCIES[mouseLoc]);
        if (ADJACENCIES[mouseLoc].indexOf(mouseLoc + 1) != -1) {
            if (board[mouseLoc + 1] == '.') {
                board[mouseLoc + 1] = 'M';
                board[mouseLoc] = '.';
            }
        }
    } else if (direction == 'down') {
        if (ADJACENCIES[mouseLoc].indexOf(mouseLoc + 10) != -1) {
            if (board[mouseLoc + 10] == '.') {
                board[mouseLoc + 10] = 'M';
                board[mouseLoc] = '.';
            }
        }
    } else if (direction == 'up') {
        if (ADJACENCIES[mouseLoc].indexOf(mouseLoc - 10) != -1) {
            if (board[mouseLoc - 10] == '.') {
                board[mouseLoc - 10] = 'M';
                board[mouseLoc] = '.';
            }
        }
    }

    Games.update(game_id, {$set: {board: board}});
};

Meteor.methods({
    start_new_game: function () {
        var game_id = Games.insert({board: new_maze(),
                                    voteclock: 5,
                                    win: false});

        // move everyone who is ready in the lobby to the game
        Players.update({game_id: null, idle: false, name: {$ne: ''}},
                       {$set: {game_id: game_id}},
                       {multi: true});
        // save a record of who is in the game, so when they leave we can
        // still show them.
        var p = Players.find({game_id: game_id},
                             {fields: {_id: true, name: true}}).fetch();
        Games.update({_id: game_id}, {$set: {players: p}});

        resetVotes();

        // wind down the vote clock
        var voteclock = 5;
        var interval = Meteor.setInterval(function () {
            voteclock -= 1;
            Games.update(game_id, {$set: {voteclock: voteclock}});

            // end of voting period
            if (voteclock == 0) {
                // console.log("calling meteor method move('right')");
                // Meteor.call('move', 'right');

                var direction = maxDir();
                console.log("Attempting to move: "+direction);
                move(game_id, direction);

                resetVotes();

                voteclock = 5;

            }
        }, 1000);

        return game_id;
    },

    keepalive: function (player_id) {
        check(player_id, String);
        Players.update({_id: player_id},
                       {$set: {last_keepalive: (new Date()).getTime(),
                        idle: false}});
    }

});

Meteor.setInterval(function () {
    var now = (new Date()).getTime();
    var idle_threshold = now - 70*1000; // 70 sec
    var remove_threshold = now - 60*60*1000; // 1hr

    Players.update({last_keepalive: {$lt: idle_threshold}},
                   {$set: {idle: true}});
}, 30*1000);
