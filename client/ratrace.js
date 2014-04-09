Template.board.square = function (i) {
    var g = game();
    return g && g.board && g.board[i];
}

// Initialization

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
