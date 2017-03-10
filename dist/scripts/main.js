//设置初始加载js路径
require.config({baseUrl:"scripts"});
require([
        "app",
        "services/util-service",
        "services/repo-service",
        "services/modal-service",
        "services/graph-service",
        "services/enterprise-service",
        "directives/util-directive",
        "controllers/index"
    ],
    function () {
        // 手动初始化angular。
        //这个函数会自动检测创建的module有没有被加载多次，
        //如果有则会在浏览器的控制台打出警告日志，并且不会再次加载。这样可以避免在程序运行过程中许多奇怪的问题发生。
        angular.bootstrap(document, ["cmpApp"]);
    });
var global_variable = { "pageEntering": false, "formPosting": false };