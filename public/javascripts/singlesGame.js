pageScript(function($context){
    $context.live("pageinit", function(event, ui) {
        $context.find('#playerGoal1Btn').bind('click', function() {
            var $playerScore1 = $context.find('#playerScore1');
            $playerScore1.val(parseInt($playerScore1.val(),10) + 1);
        });
        $context.find('#playerGoal2Btn').bind('click', function() {
            var $playerScore2 = $context.find('#playerScore2');
            $playerScore2.val(parseInt($playerScore2.val(),10) + 1);
        });
    });
});
