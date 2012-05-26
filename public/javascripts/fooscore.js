function pageScript(func) {
    var $context = $("div:jqmData(role='page'):last");
    func($context);
}

/** Don't show the bubble if click dismiss button at 3 times. */
google.bookmarkbubble.Bubble.prototype.NUMBER_OF_TIMES_TO_DISMISS=3;

/** page to bookmark bubble (generally, this should be top page) */
if(typeof(page_popup_bubble)=="undefined"){
    page_popup_bubble = "#home";
}

/** bookmark bubble initialized in mobileinit event for jquery mobile. */
$(document).bind("mobileinit", function(){

    $(page_popup_bubble).live('pageinit',function() {
        window.setTimeout(function() {
            var bubble = new google.bookmarkbubble.Bubble();

            var parameter = page_popup_bubble;

            bubble.hasHashParameter = function() {
                return location.hash == "" && location.href.indexOf(parameter) == location.href.length-1;
            };

            bubble.setHashParameter = function() {
                if (!this.hasHashParameter()) {
                    location.href = parameter;
                }
            };

            bubble.getViewportHeight = function() {
                window.console.log('Example of how to override getViewportHeight.');
                return window.innerHeight;
            };

            bubble.getViewportScrollY = function() {
                window.console.log('Example of how to override getViewportScrollY.');
                return window.pageYOffset;
            };

            bubble.registerScrollHandler = function(handler) {
                window.console.log('Example of how to override registerScrollHandler.');
                window.addEventListener('scroll', handler, false);
            };

            bubble.deregisterScrollHandler = function(handler) {
                window.console.log('Example of how to override deregisterScrollHandler.');
                window.removeEventListener('scroll', handler, false);
            };

            bubble.showIfAllowed();
        }, 1000 /** delay to show the bubble */ );
    });
});