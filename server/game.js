// Server only logic //

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

        Votes.update({direction: 'left'}, {$set: {count: 0}});
        Votes.update({direction: 'down'}, {$set: {count: 0}});
        Votes.update({direction: 'up'}, {$set: {count: 0}});
        Votes.update({direction: 'right'}, {$set: {count: 0}});

        // wind down the vote clock
        var voteclock = 5;
        var interval = Meteor.setInterval(function () {
            voteclock -= 1;
            Games.update(game_id, {$set: {voteclock: voteclock}});

            // end of game
            if (voteclock == 0) {
                voteclock = 5;

                var voteDirs = ['left', 'down', 'up', 'right'];

                // var max = 0;
                // var maxDir = '';
                // for (var i = 0; i < 4; i ++) {
                //     var currVote = Votes.findOne({direction: voteDirs[i]});
                //     console.log('currVote: '+currVote);
                //     if (currVote.count > max) {
                //         max = currVote.count;
                //         maxDir = voteDirs[i];
                //     }
                // }

                // console.log("maxDir: "+maxDir);

                // Meteor.call('move', maxDir);

                Votes.update({direction: 'left'}, {$set: {count: 0}});
                Votes.update({direction: 'down'}, {$set: {count: 0}});
                Votes.update({direction: 'up'}, {$set: {count: 0}});
                Votes.update({direction: 'right'}, {$set: {count: 0}});

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
