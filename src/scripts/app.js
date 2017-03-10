'use strict';
define([],function () {
    /**
     * 路由设置函数，所以这里定义setRoute
     *
     * @param {[type]}　url [模块相对路径]
     * @param {[type]}　ctrl [Controller名称]
     * @param {[type]}　reqJs [模块对应的控制器JS文件]
     * @param {[type]}　label [标签，对应于导航条]
     */
    function setRoute(url, ctrl, reqJs, label) {
        var routeDef = {};
        routeDef.templateUrl = xpath.res("views" + url + ".html?_ran=" + Math.random());
        routeDef.controller = ctrl;
        routeDef.resolve = {
            load : ['$q','$rootScope',
                function ($q, $rootScope) {
                    global_variable.pageEntering = true;
                    var defer = $q.defer();
                    require([xpath.res("scripts/controllers")+reqJs],
                        function () {
                            defer.resolve();
                            $rootScope.$apply();
                        });
                    return defer.promise;
                }
            ]
        };
        routeDef.label = label;
        return routeDef;
    }

    var app = angular.module('cmpApp', ['ngRoute', 'ui.router', 'mgcrea.ngStrap', 'ng-breadcrumbs', 'ngTable', "w5c.validator", "angularjs-dropdown-multiselect", "ngFileUpload", "angucomplete-alt", "treeControl", 'sy.bootstrap.timepicker']);

    app.config(["w5cValidatorProvider",function (w5cValidatorProvider) {
        // 全局配置
        w5cValidatorProvider.config({
            blurTrig: true,
            showError: true,
            removeError: true
        });
        w5cValidatorProvider.setRules({
                username: {
                    required: "输入的用户名不能为空",
                    pattern: "用户名必须输入字母、数字、下划线,以字母开头",
                    w5cuniquecheck: "输入用户名已经存在，请重新输入"
                }
            }
        );
    }]);

    app.config(function($routeProvider, $controllerProvider, $provide, $httpProvider) {
        app.register = {
            controller: $controllerProvider.register,
            factory: $provide.factory,
            service: $provide.service
        };

        var checkAccessState = function (resp) {
            var headers = resp.headers();
            var accessState = headers["access-state"];
            if (angular.isDefined(accessState) && accessState == "unlogin") {
                location.href = loginPage;
            } else if (angular.isDefined(accessState) && accessState == "unauthorized") {
                toastr.error("对不起，你没有权限进行此项操作。请联系系统管理员！");
                location.href = indexPage;
            } else {
                return resp;
            }
        };
        $httpProvider.interceptors.push(function ($q) {
            return{
                "request":function (config) {
                    if (global_variable.pageEntering) {
                        $(".page-entering-loading").fadeIn("fast");
                    }
                    if (global_variable.formPosting) {
                        $(".fullscreen-posting").fadeIn("fast");
                    }
                    return config;
                },
                "response":function (resp) {
                    console.log("resp="+resp);
                    if (global_variable.pageEntering) {
                        global_variable.pageEntering = false;
                        $(".page-entering-loading").fadeOut("fast");
                    }
                    if (global_variable.formPosting) {
                        global_variable.formPosting = false;
                        $(".fullscreen-posting").fadeOut("fast");
                    }
                    return checkAccessState(resp);
                },
                "responseError": function(rejection) {
                    if (global_variable.pageEntering) {
                        global_variable.pageEntering = false;
                        $(".page-entering-loading").fadeOut("fast");
                    }
                    if (global_variable.formPosting) {
                        global_variable.formPosting = false;
                        $(".fullscreen-posting").fadeOut("fast");
                    }
                    var ret = checkAccessState(rejection);
                    if (angular.isDefined(ret)) {
                        toastr.error("请求处理失败！");
                    }
                    return $q.reject(rejection);
                }
            };
        });
        /** 设置路由 */
        $routeProvider.when('/', setRoute('/home/index', 'homeIndexCtrl', '/home/index.js', '首页'));

    });

    app.directive('compileHtml', function($compile) {
        return {
            restrict: 'A',
            replace: true,
            link: function(scope, ele, attrs) {
                scope.$watch(function() {
                        return scope.$eval(attrs.ngBindHtml);
                    },
                    function(html) {
                        $compile(ele.contents())(scope);
                    });
            }
        };
    });
    return app;
})