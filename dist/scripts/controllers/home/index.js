define(["app"], function(app) {
    var injectParams = ['$scope', '$timeout', 'repoService', '$location', '$interval'];
    var homeIndexCtrl = function($scope, $timeout, repo, $location, $interval) {
        var homeConf = {
            url: 'home', //基本URL，必填
            showName: '首页', //提示的名称，一般为模块名，必填
            detail: "/detail",
            stat: "/stat"
        };

        $scope.stats = { bizTrend: {}, appStat: {}, bizPhraseStat: {} };
        $scope.graphTitle = { "stat": { "title": "", "subText": "" }, "app": { "title": "", "subText": "" }, "template": { "title": "", "subText": "" } };

        /*if($scope.hasPermission('home.home.chart')){
            $scope.getStats();
        }*/
    };

    homeIndexCtrl.$inject = injectParams;
    app.register.controller('homeIndexCtrl', homeIndexCtrl);
});
