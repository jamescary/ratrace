Games = new Meteor.Collection('games');
// { maze: ['M', 'F', 'W', ..., 'C'], clock: 180,
//   players: [player_id], votes: [{direction, [player_id]}] }

Players = new Meteor.Collection('players');
// {name: 'cory', game_id: 123, vote: 'east'}

Votes = new Meteor.Collection('votes');
// { timer: 5, votes: [{direction, [player_id]}]}

var SIZE = 10;

new_maze = function () {
    var board = [
        '.', '.', '*', '.', '.', '*', '*', '.', '*', '.', '*', '.', '*', '.', '.', '.', '.', '.', '*', '.', '*', '.', '*', '*', '*', '.', '.', '*', '*', '.', '.', '.', '*', '.', '*', '.', '*', '.', '.', '.', '*', '.', '.', '.', '.', '.', '*', '.', '*', '*', '*', '*', '*', '.', '*', '.', '.', '.', '*', '.', '.', '.', '.', '.', '*', '*', '*', '.', '.', '.', '.', '*', '.', '*', '.', '.', '.', '.', '*', '*', '.', '*', '.', '*', '.', '*', '.', '*', '.', '.', '.', '.', '*', '.', '.', '*', '.', '.', '.', '.'
    ];
    board[0] = 'M';
    board[88] = 'C';

    return board;
};

if (Meteor.isServer) {

    // publish all the non-idle players.
    Meteor.publish('players', function() {
        return Players.find({idle: false});
    });

    // publish single games
    Meteor.publish('games', function (id) {
        check(id, String);
        return Games.find({_id: id});
    });

    // publish all the votes in a game for a certain direction
    Meteor.publish('votes', function(game_id, direction) {
        check(game_id, String);
        check(direction, String);
        return Votes.find({$or: [{game_id: game_id},
                                 {direction: direction}]});
    });
}
