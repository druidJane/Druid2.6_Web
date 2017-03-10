define(["app"], function(app) {
    var modalService = function(util, repo) {
        var importModal = function(parentScope, title, conf) {

            //头数据信息对象
            function HeadInfo(index, name) {
                var obj = new Object();
                obj.index = index;
                obj.name = name;
                return obj;
            };
            util.commonModal(parentScope, title, "_modal/import.html", function(modal) {
                var mScope = modal.$scope;
                mScope.diagCls = "modal-md";
                //导入参数实体
                //文件类型
                mScope.importParams = {
                    delimiter: ",", //分隔符默认值
                    otherDelimiter: "",
                    fileType: "excel", //文件类型默认值
                    headDMapToFList: parentScope.headDMapToFList
                };
                //文件头
                mScope.fileHeads = [];
                mScope.progress = {
                    file: 0,
                };
                mScope.uploadData = {
                    file: null,
                    params: {}
                };

                //上传按钮
                mScope.uploadFile = function() {
                    if (!mScope.uploadData.file) {
                        return;
                    }
                    mScope.uploadData.params.delimiter = mScope.importParams.delimiter != "otherDelimiter" ? mScope.importParams.delimiter : mScope.importParams.otherDelimiter;
                    if(mScope.uploadData.params.delimiter == "") {
                        mScope.uploadData.params.delimiter = " ";
                    }
                    mScope.uploadData.params.fileType = mScope.importParams.fileType;
                    repo.uploadFile(
                        conf.uploadUrl,
                        mScope.uploadData.file, mScope.uploadData.params,
                        function(evt) {
                            mScope.progress.file = parseInt(100.0 * evt.loaded / evt.total);
                        },
                        function(data) {
                            //读取返回数据中的文件头
                            if (data.status == 0) {
                                toastr.success('文件上传成功，请选择文件列 ！');
                                mScope.fileHeads = [];
                                for (var index in data.data.fileHead.headMap) {
                                    mScope.fileHeads.push(new HeadInfo(index, data.data.fileHead.headMap[index]));
                                }
                                //初始化系统列中的文件头
                                for (var hIndex in mScope.headDMapToFList) {
                                    for (var fIndex in mScope.fileHeads) {
                                        if (mScope.headDMapToFList[hIndex].dataHeadInfo.name == mScope.fileHeads[fIndex].name) {
                                            mScope.headDMapToFList[hIndex].fileHeadInfo = mScope.fileHeads[fIndex];
                                        }
                                    }
                                }
                                mScope.importParams.fileName = data.data.fileName;
                                mScope.importParams.fileSize = data.data.fileSize;
                            } else {
                                toastr.warning(data.errorMsg);
                            }
                        }
                    );
                };


                mScope.okBtn = {
                    text: "导入",
                    click: function() {
                        if (mScope.progress.file != 100) {
                            toastr.warning("请先上传文件！");
                            return;
                        }
                        var importRequest = {};
                        importRequest.fileName = mScope.importParams.fileName;
                        importRequest.fileSize = mScope.importParams.fileSize;
                        importRequest.headDMapToFList = mScope.importParams.headDMapToFList;
                        importRequest.delimiter = mScope.uploadData.params.delimiter;
                        repo.doImport(conf, importRequest).then(function(data) {
                            util.hideModal(modal);
                        });
                    }
                };
            });

        };

        var exportModal = function(parentScope, title, conf, queryParams) {

            util.commonModal(parentScope, title, "_modal/export.html", function(modal) {
                var mScope = modal.$scope;
                mScope.diagCls = "modal-md";
                //导入参数实体
                //文件类型
                mScope.exportParams = {
                    delimiter: ",", //分隔符默认值
                    otherDelimiter: "",
                    fileType: "excel", //文件类型默认值
                };
                mScope.okBtn = {
                    text: "导出",
                    click: function() {
                        if (mScope.exportParams.delimiter == "otherDelimiter") {
                            mScope.exportParams.delimiter = mScope.exportParams.otherDelimiter;
                        }
                        if(mScope.exportParams.delimiter == "") {
                            mScope.exportParams.delimiter = " ";
                        }
                        mScope.exportParams.fileName = util.getExportFileName(mScope.exportParams.fileType);
                        angular.extend(mScope.exportParams, queryParams);
                        repo.doExport(conf, util.buildCommonReq(mScope.exportParams)).then(function(data) {
                            util.hideModal(modal);
                        });
                    }
                };
            });

        };
        return {
            importModal: importModal,
            exportModal: exportModal

        };
    };
    app.factory("modalService", ["utilService", "repoService", modalService]);
});
