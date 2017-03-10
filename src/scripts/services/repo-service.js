define(["app"], function(app) {
    var repoService = function($http, $q, util, Upload) {

        var httpGet = function(url) {
            var defer = $q.defer();
            url = xpath.service(url);
            url += url.indexOf("?") == -1 ? "?" : "&" + "_ran=" + Math.random();
            defer.url=url;
            $http({
                method: 'GET',
                url: url
            }).then(function successCallback(response) {
                defer.resolve(response.data);
            });
            return defer.promise;
        }


        var httpPost = function(url, paramObj, onSuccess, formPosting) {
            if (formPosting) {
                global_variable.formPosting = true;
            }
            url = xpath.service(url);
            var defer = $q.defer();
            if (angular.isUndefined(paramObj)) {
                $http.post(url).then(function(result) {
                    if (angular.isDefined(onSuccess)) {
                        onSuccess(result.data, result.status, result.headers, result.config);
                    }
                    defer.resolve(result.data);
                });
                return defer.promise;
            }
            $http.post(url, angular.toJson(paramObj)).then(
                function(result) {
                    if (angular.isDefined(onSuccess)) {
                        onSuccess(result.data, result.status, result.headers, result.config);
                    }
                    defer.resolve(result.data);
                });
            return defer.promise;
        }

        var httpPut = function(url, paramObj, onSuccess, formPosting) {
            if (formPosting) {
                global_variable.formPosting = true;
            }
            url = xpath.service(url);
            var defer = $q.defer();
            (angular.isUndefined(paramObj) ? $http.put(url) : $http.put(url, angular.toJson(paramObj)))
            .then(function(result) {
                if (angular.isDefined(onSuccess)) {
                    onSuccess(result.data, result.status, result.headers, result.config);
                }
                defer.resolve(result.data);
            });
            return defer.promise;
        }

        var httpDel = function(url) {
            var defer = $q.defer();
            url = xpath.service(url);
            $http.delete(url).then(function(result) {
                defer.resolve(result.data);
            });
            return defer.promise;
        }

        var postByXform = function(url, paramObj, formPosting) {
            if (formPosting) {
                global_variable.formPosting = true;
            }
            url = xpath.service(url);
            var defer = $q.defer();
            $http.post(url, $.param(paramObj), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then(function(result) {
                defer.resolve(result.data);
            });
            return defer.promise;
        }

        var uploadFile = function(url, file, params, onProgress, onSuccess) {
            url = xpath.service(url);
            Upload.upload({
                url: url,
                file: file,
                data: params
            }).progress(function(evt) {
                if (angular.isDefined(onProgress)) {
                    onProgress(evt);
                }
            }).then(function(result) {
                if (angular.isDefined(onSuccess)) {
                    onSuccess(result.data);
                }
            }).catch(function() {
                toastr.error('文件上传失败!');
            });
        }

        var downloadFile = function(url) {
            url = xpath.service(url)
            window.location.href = url;
        }

        return {
            get: function(opts, id) {
                var url = opts.url + "/get";
                if (angular.isDefined(id) && id != null) {
                    url += "?id=" + id;
                }
                return httpGet(url);
            },
            rest: function(opts, id) {
                var url = opts.url;
                if (angular.isDefined(id) && id != null) {
                    url += "/" + id;
                }
                return httpGet(url);
            },
            getExt: function(opts, action, id) {
                var url = opts.url + "/getExt?action=" + action;
                if (angular.isDefined(id) && id != null) {
                    url += "&id=" + id;
                }
                return httpGet(url);
            },
            getByPath: function(opts, path) {
                var url = opts.url;
                if (angular.isDefined(path) && path != null) {
                    url += path;
                }
                return httpGet(url);
            },
            getByUrl: function(url) {
                return httpGet(url);
            },
            post: httpPost,
            put: httpPut,
            del: httpDel,
            postByXform: postByXform,
            uploadFile: uploadFile,
            downloadFile: downloadFile,
            add: function(opts, obj) {
                var url = opts.url + "/save";
                var defer = $q.defer();
                httpPost(url, obj, function(data, status, headers, config) {
                    if (util.isRespOK(data)) {
                        defer.resolve(data);
                        toastr.success("新增" + opts.showName + "成功。");
                    } else {
                        defer.reject(data);
                        toastr.error("新增" + opts.showName + "失败: " + data.errorMsg);
                    }
                }, true);
                return defer.promise;
            },
            query: function(opts, params) {
                var url = opts.url + "/list";
                var defer = $q.defer();
                httpPost(url, params, function(data, status, headers, config) {
                    if (util.isRespOK(data)) {
                        defer.resolve(data);
                    } else {
                        defer.reject(data);
                        toastr.error("查询" + opts.showName + "失败: " + data.errorMsg);
                    }
                });
                return defer.promise;
            },
            queryByPath: function(opts, path, params) {
                var defer = $q.defer();
                httpPost(opts.url + path, params, function(data, status, headers, config) {
                    if (util.isRespOK(data)) {
                        defer.resolve(data);
                    } else {
                        defer.reject(data);
                        toastr.error("查询" + opts.showName + "失败: " + data.errorMsg);
                    }
                });
                return defer.promise;
            },
            queryByUrl: function(url, opts, params) {
                var defer = $q.defer();
                httpPost(url, params, function(data, status, headers, config) {
                    if (util.isRespOK(data)) {
                        defer.resolve(data);
                    } else {
                        defer.reject(data);
                        toastr.error("查询" + opts.showName + "失败: " + data.errorMsg);
                    }
                });
                return defer.promise;
            },
            update: function(opts, obj) {
                var url = opts.url + "/save";
                var defer = $q.defer();
                httpPost(url, obj, function(data, status, headers, config) {
                    if (util.isRespOK(data)) {
                        defer.resolve(data);
                        toastr.success("更新" + opts.showName + "成功。");
                    } else {
                        defer.reject(data);
                        toastr.error("更新" + opts.showName + "失败: " + data.errorMsg);
                    }
                }, true);
                return defer.promise;
            },
            updateByPath: function(opts, suffixUrl, obj, tips) {
                var url = opts.url + suffixUrl;
                var defer = $q.defer();
                httpPost(url, obj, function(data, status, headers, config) {
                    if (util.isRespOK(data)) {
                        defer.resolve(data);
                        toastr.success((tips == null ? "更新" : tips) + opts.showName + "成功。");
                    } else {
                        defer.reject(data);
                        toastr.error((tips == null ? "更新" : tips) + opts.showName + "失败: " + data.errorMsg);
                    }
                }, true);
                return defer.promise;
            },
            remove: function(opts, items, idKey) {
                var defer = $q.defer();
                var ids = util.selectedItems(items, idKey);
                if (ids.length == 0) {
                    toastr.warning("请先选择要删除的" + opts.showName + "！");
                    defer.reject();
                    return defer.promise;
                }
                util.confirm("确定删除所选" + opts.showName + "(" + ids.length + "条)？", function() {
                    var url = opts.url + "/del";
                    httpPost(url, ids, function(data, status, headers, config) {
                        if (util.isRespOK(data)) {
                            defer.resolve(data);
                            toastr.success("删除" + opts.showName + "成功。");
                        } else {
                            defer.reject(data);
                            toastr.error("删除" + opts.showName + "失败: " + data.errorMsg);
                        }
                    });
                });
                return defer.promise;
            },
            removeOne: function(opts, id, name) {
                var newOpts = angular.extend([], opts);
                var items = [{
                    id: id,
                    $checked: true
                }];
                if (angular.isDefined(name)) {
                    newOpts.showName += "[" + name + "]";
                }
                return this.remove(newOpts, items, "id");
            },

            //添加导入任务
            doImport: function(opts, params) {
                var url = opts.url + "/doImport";
                var defer = $q.defer();
                httpPost(url, params, function(data, status, headers, config) {
                    if (util.isRespOK(data)) {
                        defer.resolve(data);
                        var link = '<a href="#/sysmgmt/filetask/all?type=1">任务管理模块</a>';
                        toastr.success(opts.showName + "导入任务添加成功。请到" + link + "查看任务！");

                    } else {
                        defer.reject(data);
                        toastr.error(opts.showName + "导入任务添加失败: " + data.errorMsg);
                    }
                }, true);
                return defer.promise;
            },
            //添加导出任务
            doExport: function(opts, params) {
                var url = opts.url + "/doExport";
                var defer = $q.defer();
                httpPost(url, params, function(data, status, headers, config) {
                    if (util.isRespOK(data)) {
                        defer.resolve(data);
                        var link = '<a href="#/sysmgmt/filetask/all?type=2">任务管理模块</a>';
                        toastr.success(opts.showName + "导出任务添加成功。请到" + link + "查看任务！");

                    } else {
                        defer.reject(data);
                        toastr.error(opts.showName + "导出任务添加失败: " + data.errorMsg);
                    }
                }, true);
                return defer.promise;
            },

            // excel导出
            exportExcel: function(scope, url, condition, str) {
                util.htmlModal(scope, "导出Excel数据", "modal/loading.tpl.html", function(modal) {
                    var mScope = modal.$scope;
                    mScope.loadState = 0;
                    mScope.loadingContent = "正在导出 <b>" + str + "</b> 数据，请稍后...";
                    mScope.okBtn = {
                        hide: true
                    };
                    httpPost(url, condition, function(data, status, headers, config) {
                        mScope.loadState = 1;
                        if (status == 200 && data.status == 0) {
                            var fileUrl = data.data;
                            mScope.loadedContent = '<a href="' + fileUrl + '" target="_blank">导出 <b>' + str + '</b> 数据完成，点击下载或右键“另存为”。</a>';
                        } else {
                            mScope.loadedContent = "导出Excel错误: " + data.errorMsg;
                        }
                    }, true);
                });
            }
        };
    };
    app.factory("repoService", ["$http", "$q", "utilService", 'Upload', repoService]);
});
