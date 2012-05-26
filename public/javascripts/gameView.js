pageScript(function($context){
    $context.live("pageinit", function(event, ui) {

        var increaseTeamScore = function(teamScoreId) {
            var $teamScore = $context.find('#' + teamScoreId);
            var newScore = parseInt($teamScore.text(),10) + 1;
            $teamScore.text(newScore);
            return newScore;
        };
        var postNewGoal = function(teamId) {
            var gameId = $context.find('#gameId').val();
            var teamId = $context.find('#' + teamId).val();
            $.post("/games/" + gameId + "/goal/new", {
                "teamId": teamId
            }, function (data, textStatus, jqXHR) {
                //console.log("Post response:");
                console.dir(data);
                //console.log(textStatus);
                //console.dir(jqXHR);
            });
        };
        var showGameAsComplete = function() {
            console.log("showGameAsComplete called");
            $('#teamGoal1Btn').closest('.ui-btn').hide();
            $('#teamGoal2Btn').closest('.ui-btn').hide();
            // TODO indicate winner
        };
        var goalBtnEventHandler = function(teamNumber) {
            return function() {
                var newScore = increaseTeamScore('teamScore' + teamNumber);
                postNewGoal('teamId' + teamNumber);
                if (newScore === 10) {
                    showGameAsComplete()
                }
            };
        };
        var showGameAsInProgress = function() {
            console.log("showGameAsInProgress called");
            $('#teamGoal1Btn').closest('.ui-btn').show();
            $('#teamGoal2Btn').closest('.ui-btn').show();
            $context.find('#teamGoal1Btn').bind('vmousedown', _.debounce(goalBtnEventHandler(1), 100, true));
            $context.find('#teamGoal2Btn').bind('vmousedown', _.debounce(goalBtnEventHandler(2), 100, true));
        };

        var gameState = $context.find('#gameState').val();
        if (gameState === "in-progress") {
            showGameAsInProgress();
        } else {
            showGameAsComplete();
        }
    });
});
