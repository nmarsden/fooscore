function pageScript(func) {
    var $context = $("div:jqmData(role='page'):last");
    func($context);
}
