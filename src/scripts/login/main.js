require.config({
   baseUrl:"scripts/login"
});
require([
    "app",
    "login"
],function () {
    angular.bootstrap(document,["loginApp"]);
});
$(function($) {
    // console.log(" ~~ Document is ready!!!");
});