function pageScript(func) {
    var $context = $("div:jqmData(role='page'):last");
    func($context);
}

//function newGame(type) {
//    jQuery.post("/games/new", {
//        "type": type
//    }, function (data, textStatus, jqXHR) {
//        console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
//    });
//}