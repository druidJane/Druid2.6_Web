var context = "/operator"; //上下文目录
var serviceRoot = context + "/service/"; //API根路径
var resRoot = ""; //静态资源根路径

var loginPage = context + "/login.html";
var indexPage = context + "/#/";

var xpath = {
    service: function(path) {
        return serviceRoot + path;
    },
    res: function(path) {
        return resRoot + path;
}
};
