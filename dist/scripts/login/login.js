define(["app"],function (app) {
    app.controller("loginCtrl",function ($scope, $http, $window) {
        $scope.user = {
            name:"",
            password:""
        }
        $scope.doLogin = function () {
            var url = xpath.service("login");
            $http.post(url,$scope.user).then(function (resp) {
                var data = resp.data;
                if (data.status == 0) {
                    $window.location.href = indexPage;
                } else {
                    var msg = "登录失败: " + data.errorMsg;
                    //console.log(msg);
                    toastr.error(msg);
                }
            }).catch(function(resp) {
                var data = resp.data;
                var msg = "登录失败: " + (data.errorMsg ? data.errorMsg : data);
                //console.log(msg);
                toastr.error(msg);
            });
        }
    })
});