pageScript(function($context){
    $context.live("pageinit", function(event, ui) {

        var $startButton = $("#startButton");

        // disable Start button until all users are selected
        $startButton.prop("disabled", true);

        // populate select meta-data
        var userSelectedDatas = _.map($context.find('select'), function(userSelect) {
            var $userSelect = $(userSelect);
            return {
                $userSelect: $userSelect,
                id: $userSelect.get()[0].id,
                selectedValue: $userSelect.find("option:selected").val()
            }
        });

        // ios5 flag
        var ios5 = navigator.userAgent.match(/OS 5_[0-9_]+ like Mac OS X/i) != null;

        // retrieve users array from data attached to the dom
        var userDatas = $.data($('#newGameContent')[0], 'users');

        // function: disableOtherUserSelects
        // Event handler to disable user selects, except for target select
        var disableOtherUserSelects = function(event, ui) {
            _.each(userSelectedDatas, function(userSelectedData) {
                if (event.target.id !== userSelectedData.id) {
                    userSelectedData.$userSelect.prop("disabled", true);
                }
            });
        };

        // function: enableOtherUserSelects
        // Event handler to enable user selects, except for target select
        var enableOtherUserSelects = function(event, ui) {
            _.each(userSelectedDatas, function(userSelectedData) {
                if (event.target.id !== userSelectedData.id) {
                    userSelectedData.$userSelect.prop("disabled", false);
                }
            });
        };

        // function: userChangeEventHandler
        // Event handler to update user selects options to ensure duplicate users cannot be selected
        // Also, enables the startButton when all user selects have a selected user
        var userChangeEventHandler = function(event, ui) {
            // Update userSelectedDatas
            var targetSelectedValue = $(event.target).find("option:selected").val();
            _.each(userSelectedDatas, function(userSelectedData) {
                if (event.target.id === userSelectedData.id) {
                    userSelectedData.selectedValue = targetSelectedValue;
                }
            });

            // Rebuild select options excluding already selected users to prevent duplicate user selections
            _.each(userSelectedDatas, function(userSelectedData) {
                if (event.target.id !== userSelectedData.id) {
                    var selectedValue = userSelectedData.$userSelect.find("option:selected").val();

                    // Find values to exclude
                    var excludeValues = [];
                    _.each(userSelectedDatas, function(userSelectedData2) {
                        if (userSelectedData.id !== userSelectedData2.id) {
                            excludeValues.push(userSelectedData2.selectedValue);
                        }
                    });

                    // Rebuild select options
                    userSelectedData.$userSelect.empty();
                    userSelectedData.$userSelect.append($('<option>').text("Choose...").val(""));
                    _.each(userDatas, function(userData) {
                        if (excludeValues.indexOf(userData._id) === -1) {
                            userSelectedData.$userSelect.append ( $('<option>').text(userData.name).val(userData._id));
                        }
                    });
                    userSelectedData.$userSelect.selectmenu('refresh');

                    // Re-select value
                    userSelectedData.$userSelect.val(selectedValue);
                    userSelectedData.$userSelect.selectmenu('refresh');
                }
            })

            // Enable start button when all selects have a selected user
            var haveUnselectedUsers = _.any(userSelectedDatas, function(userSelectedData) {
                console.log("userSelectedData.selectedValue", userSelectedData.selectedValue);
                return (userSelectedData.selectedValue === '');
            });
            $startButton.prop("disabled", haveUnselectedUsers);
        };

        _.each(userSelectedDatas, function(userSelectedData) {
            userSelectedData.$userSelect.bind("change", userChangeEventHandler);
            if (ios5) {
                // ios5 bug fix: clicking previous/next buttons does not fire change events
                // so the following disables other selects to prevent the use of previous/next
                userSelectedData.$userSelect.bind("focus", disableOtherUserSelects);
                userSelectedData.$userSelect.bind("blur", enableOtherUserSelects);
            }
        });

    });
});
