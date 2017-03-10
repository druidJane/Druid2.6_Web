define(["app"],function (app) {
    app.controller("indexCtrl",function ($scope, $http, $location, $window, repoService, $interval) {// 主模块
        //默认选项,运营商
        $scope.dfOption = {
            id: -1,
            name: '- 请选择 -'
        };
        $scope.menuList = [];
        $scope.btnList = [];
        //触发登录验证
        $scope.user = {
            name:"",
            password:""
        }
        var url = xpath.service("login");
        $http.post(url,$scope.user).then(function (resp) {
            alert(resp);
            $("#main_page").show();
        });
        /*repoService.getByUrl("common/login").then(function(data) {
            /!*if (data.status == 0) {
                $("#main_page").show();
                // 加载好了权限才做请求
                $scope.onLoginSuccess();
            }*!/
            $("#main_page").show();
            // 加载好了权限才做请求
            $scope.onLoginSuccess();
        });*/
        $scope.onLoginSuccess = function() {

        }
        // 判断是否有权限
        $scope.hasPermission = function(operation) {
            var permCodes = operation.split(",");
            /*for (var i = 0; i < permCodes.length; i++) {
                 if ($.inArray(permCodes[i], $scope.btnList) != -1) {
                     return true;
                 }
             }
            return false;*/
            return true;
        };
    })
});