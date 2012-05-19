pageScript(function($context){
    $context.live("pageinit", function(event, ui) {

        var increasePlayerScore = function(playerScoreId) {
            var $playerScore = $context.find('#' + playerScoreId);
            var newScore = parseInt($playerScore.text(),10) + 1;
            $playerScore.text(newScore);
            return newScore;
        };
        var postNewGoal = function(playerId) {
            var gameId = $context.find('#gameId').val();
            var playerId = $context.find('#' + playerId).val();
            $.post("/games/" + gameId + "/goal/new", {
                "playerId": playerId
            }, function (data, textStatus, jqXHR) {
                //console.log("Post response:");
                console.dir(data);
                //console.log(textStatus);
                //console.dir(jqXHR);
            });
        };
        var showGameAsComplete = function() {
            console.log("showGameAsComplete called");
            $('#playerGoal1Btn').closest('.ui-btn').hide();
            $('#playerGoal2Btn').closest('.ui-btn').hide();
            // TODO indicate winner
        };
        var goalBtnEventHandler = function(playerNumber) {
            return function() {
                // TODO ignore subsequent button clicks while processing this event
                var newScore = increasePlayerScore('playerScore' + playerNumber);
                postNewGoal('playerId' + playerNumber);
                if (newScore === 10) {
                    showGameAsComplete()
                }
            };
        };
        var showGameAsInProgress = function() {
            console.log("showGameAsInProgress called");
            $('#playerGoal1Btn').closest('.ui-btn').show();
            $('#playerGoal2Btn').closest('.ui-btn').show();
            $context.find('#playerGoal1Btn').bind('click', goalBtnEventHandler(1));
            $context.find('#playerGoal2Btn').bind('click', goalBtnEventHandler(2));
        };

        var gameState = $context.find('#gameState').val();
        if (gameState === "in-progress") {
            showGameAsInProgress();
        } else {
            showGameAsComplete();
        }
    });
});
