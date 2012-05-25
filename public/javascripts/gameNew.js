pageScript(function($context){
    $context.live("pageinit", function(event, ui) {

        var userSelectedDatas = _.map($context.find('select'), function(userSelect) {
            var $userSelect = $(userSelect);
            return {
                $userSelect: $userSelect,
                id: $userSelect.get()[0].id,
                selectedValue: $userSelect.find("option:selected").val()
            }
        });
        var ios5 = navigator.userAgent.match(/OS 5_[0-9_]+ like Mac OS X/i) != null;

        var userDatas = $.data($('#newGameContent')[0], 'users');

        var disableOtherUserSelects = function(event, ui) {
            _.each(userSelectedDatas, function(userSelectedData) {
                if (event.target.id !== userSelectedData.id) {
                    userSelectedData.$userSelect.prop("disabled", true);
                }
            });
        };

        var enableOtherUserSelects = function(event, ui) {
            _.each(userSelectedDatas, function(userSelectedData) {
                if (event.target.id !== userSelectedData.id) {
                    userSelectedData.$userSelect.prop("disabled", false);
                }
            });
        };

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

            // TODO disable Start button until all users are selected

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
