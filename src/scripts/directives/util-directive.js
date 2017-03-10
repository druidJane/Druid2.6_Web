define(['app'], function(app) {

    /**
     * 文本框回车事件directive, eg:<input type="text" ng-enter="tenantProductsTable.reload()" />
     */
    app.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if (event.which === 13) {
                    scope.$apply(function() {
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    });

    /**
     * 时间控件
     * <input class="form-control" id="starttime" ng-model="param.startTime" ng-date max-date="param.endTime"  date-format="yyyy-MM-dd HH:mm:ss" class="Wdate" type="text" >
     */
    app.directive('ngDate', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                minDate: '=',
                maxDate: '=',
                isShowClear: '=',
                dateFormat: '@'
            },
            link: function(scope, element, attr, ngModel) {

                function onpicking(dp) {
                    alert("|xx");
                    var date = dp.cal.getNewDateStr();
                    scope.$apply(function() {
                        ngModel.$setViewValue(date);
                    });
                }

                function oncleared() {
                    scope.$apply(function() {
                        ngModel.$setViewValue("");
                    });
                }

                element.bind('click', function() {
                    var minDate, maxDate;
                    if (scope.minDate) {
                        minDate = new Date(scope.minDate.replace(/-/g, "/"));
                    }
                    if (scope.maxDate) {
                        maxDate = new Date(scope.maxDate.replace(/-/g, "/"));
                    }
                    WdatePicker({
                        onpicking: onpicking,
                        oncleared: oncleared,
                        dateFmt: (scope.dateFormat || 'yyyy-MM-dd'),
                        minDate: scope.minDate,
                        maxDate: scope.maxDate,
                        isShowClear: scope.isShowClear,
                        autoPickDate: true
                    });
                });
            }
        };
    });

    /**
     * 时间控件
     * <input class="form-control" id="starttime" ng-model="param.startTime" ng-date-time max-date="param.endTime" start-date="params.startTime" date-format="yyyy-MM-dd HH:mm:ss" class="Wdate" type="text" >
     */
    app.directive('ngDateTime', function() {
        return {
            autoUpdateInput: false,
            restrict: 'A',
            require: 'ngModel',
            scope: {
                minDate: '=',
                maxDate: '=',
                startDate: '=',
                endDate: '=',
                isShowClear: '=',
                dateFormat: '@',
            },
            link: function(scope, element, attr, ngModel) {
                element.daterangepicker({
                    timePicker: true,
                    timePicker24Hour: true,
                    singleDatePicker: true,
                    timePickerSeconds: true,

                    locale: {
                        format: scope.dateFormat || 'YYYY-MM-DD HH:mm:ss',
                        minDate: scope.minDate,
                        maxDate: scope.maxDate,
                        startDate: scope.startDate,
                        endDate: scope.endDate,
                        applyLabel: '确定',
                        cancelLabel: '取消',
                        fromLabel: '起始时间',
                        toLabel: '结束时间',
                        customRangeLabel: '自定义',
                        daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
                        monthNames: ['一月', '二月', '三月', '四月', '五月', '六月',
                            '七月', '八月', '九月', '十月', '十一月', '十二月'
                        ],
                        firstDay: 1
                    }
                });
            }
        };
    });

    /**
     * input[type="number"] 文本类型数据转换成number类型
     * 如:<input ng-model="stringValue" type="number" string-to-number />
     */
    app.directive('stringToNumber', function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function(value) {
                    return '' + value;
                });
                ngModel.$formatters.push(function(value) {
                    return parseInt(value);
                });
            }
        };
    })

    /**
     * 可外部调用添加文本的输入框
     * Controller中需要依赖$rootScope，调用方式如:$rootScope.$broadcast('insert_[name]', "xxx");
     * <textarea insert-able="[name]"> </textarea>
     */
    app.directive('insertAble', ['$rootScope', function($rootScope) {
        return {
            require: 'ngModel',
            scope: {
                insertAble: '@'
            },
            link: function(scope, element, attrs, ngModel) {
                $rootScope.$on('insert_' + scope.insertAble, function(e, val) {
                    if (!val) {
                        return;
                    }
                    var domElement = element[0];
                    if (document.selection) {
                        domElement.focus();
                        var sel = document.selection.createRange();
                        sel.text = val;
                        domElement.focus();
                    } else if (domElement.selectionStart || domElement.selectionStart === 0) {
                        var startPos = domElement.selectionStart;
                        var endPos = domElement.selectionEnd;
                        var scrollTop = domElement.scrollTop;
                        domElement.value = domElement.value.substring(0, startPos) + val +
                            domElement.value.substring(endPos, domElement.value.length);
                        domElement.focus();
                        domElement.selectionStart = startPos + val.length;
                        domElement.selectionEnd = startPos + val.length;
                        domElement.scrollTop = scrollTop;
                    } else {
                        domElement.value += val;
                        domElement.focus();
                    }
                    ngModel.$setViewValue(domElement.value);
                });
            }
        }
    }])


    /**
     * Delegate点击事件
     * 如:<ul ng-click-delegate="fn($delegateValue)">
     *     <li delegateValue="值1">1</li>
     *     <li delegateValue="值...">...</li>
     *    </ul>
     */
    app.directive('ngClickDelegate', function($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var selector = attrs.selector;
                var fn = $parse(attrs.ngClickDelegate);
                element.on('click', selector, function(e) {
                    var delegateValue = e.target.getAttribute('delegateValue');
                    var callback = function() {
                        fn(scope, { $event: event, $delegateValue: delegateValue });
                    };
                    scope.$apply(callback);
                });
            }
        };
    });


    /**
     * 用来显示附件UI(当附件为不同类型时以不同UI显示)  需加上ng-if
     * 如:<ng-multi-media-box ng-if="phrase.appVerifyPage" path="phrase.appVerifyPage" width="200" alt="验证页截图"/>
     */
    app.directive('ngMultiMediaBox', function(repoService) {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                enterpriseId: "=enterpriseid",
                path: "=path",
                alt: "@alt",
                width: "@width",
                height: "@height"
            },
            template: "<div class='thumbnail col-lg-2' style='width:auto; height:auto;'> " +
                "<img ng-if='ext == 1' ng-src='{{imageRoot+path}}' onerror='this.src=\"styles/default/images/default_show.jpg\"' style='height:{{height || 180}}px;'>" +
                "<img ng-if='ext == 2' src='styles/default/images/pdf.png' style='width:80px; height:80px;'>" +
                "<img ng-if='ext == 3' src='styles/default/images/word.png' style='width:80px; height:80px;'>" +
                "<img ng-if='ext == 4' src='styles/default/images/zip.png' style='width:80px; height:80px;'>" +
                "<div class='caption text-center'>" +
                "<a ng-if='ext == 1' ng-href='{{imageRoot+path}}' target='_blank' class='btn btn-type2 btn-xs' role='button'>查看</a>    " +
                "<a href='javascript:void(0);' class='btn btn-type2 btn-xs' role='button' ng-click='downloadFile();'>下载</a>" +
                "</div></div>",

            controller: function($scope) {
                if ($scope.path) {
                    var ext = $scope.path.substring($scope.path.lastIndexOf('.'));
                    if (/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(ext)) {
                        $scope.ext = 1;
                    } else if (/\.(pdf|PDF)$/.test(ext)) {
                        $scope.ext = 2;
                    } else if (/\.(doc|docx|DOC|DOCX)$/.test(ext)) {
                        $scope.ext = 3;
                    } else {
                        $scope.ext = 4;
                    }
                }
                var conf = {
                    downUrl: 'common/download/' + $scope.enterpriseId + '?path=',
                    viewUrl: 'common/view/' + $scope.enterpriseId + '?path='
                }
                $scope.imageRoot = xpath.service(conf.viewUrl);

                $scope.downloadFile = function() {
                    repoService.downloadFile(conf.downUrl + $scope.path);
                }

            }, // end controller

            link: function($scope, elem, attrs, ctrl) {}
        };
    });

    /**
     * 签名输入框
     * @param content 签名内容
     * @param islegal 签名是否合法，可使用该变量结合w5c控制提交按钮是否可用
     * @param width 输入框宽度
     * eg:<ng-sign-input content="phrase.signContent" islegal="form.$signLegal" width="400"></ng-sign-input>
     *    <button type="button" class="btn btn-sm btn-type1" ng-disabled="form.$invalid || form.$pristine || !form.$signLegal"
     */
    app.directive('ngSignInput', function() {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                content: "=content",
                isLegal: "=islegal",
                disabled: "=disabled",
                width: "@width"
            },
            template: "<div style='width: {{width}}px;'><input type='text' ng-disabled='disabled' ng-model='content' class='form-control' ng-blur='autocompleteSign();' ng-focus='restoreSign();' maxlength='17'/>" +
                "<span class='w5c-error' ng-if='showSignError'>{{errorMsg}}</span></div>",

            controller: function($scope) {
                //自动给签名加【】
                $scope.showSignError = false;
                $scope.errorMsg = "";
                //自动补全【】
                $scope.autocompleteSign = function() {
                    if ($scope.content) {
                        if (/^([\u4e00-\u9fa5a-z0-9A-Z]{2,15})$/g.test($scope.content)) {
                            $scope.content = "【" + $scope.content + "】";
                            $scope.showSignError = false;
                        } else {
                            $scope.errorMsg = "签名必须是长度2~15的中文、英文、数字组合";
                            $scope.showSignError = true;
                        }
                    } else {
                        $scope.errorMsg = "签名内容不能为空";
                        $scope.showSignError = true;
                    }
                };
                //自动给签名去【】
                $scope.restoreSign = function() {
                    if (/[【|】]/g.test($scope.content)) {
                        $scope.content = $scope.content.replace(new RegExp(/[【|】]/g), '');
                    }
                };
                //校验提示信息是否可见，提交按钮是否可用
                $scope.$watch("content", function(newData, oldData) {
                    $scope.showSignError = false;
                    if (/^([\u4e00-\u9fa5a-z0-9A-Z]{2,15})$/g.test(newData) ||
                        /^(【[\u4e00-\u9fa5a-z0-9A-Z]{2,15}】)$/g.test(newData)) {
                        $scope.isLegal = true;
                    } else {
                        $scope.isLegal = false;
                    }
                });


            }, // end controller

            link: function($scope, elem, attrs, ctrl) {}
        };
    });

    //regionId to regionName 地区ID转换成地区名称
    //使用示例：<ng-region-name region-id="{{account.regionId}}" /> 或者 <span ng-region-name region-id="{{account.regionId}}"></span>
    app.directive("ngRegionName", function() {
        return {
            restrict: 'EA',
            link: function($scope, element, attrs) {
                var regionName;
                var regionId = attrs.regionId;
                angular.forEach($scope.provinces, function(o) {
                    if (o.id == regionId && !regionName) {
                        regionName = o.name;
                    }
                });
                element.text(regionName);
            }
        };
    });

    app.directive("treeViewer", function treeViewer($compile) {
        return {
            restrict: "E",
            scope: {
                selected: "=",
                parent: "=",
                parentIndex: "=",
                map: "=",
                items: "="
            },

            template: "<ul class='tree_view clearfix'>\
                    <li ng-repeat='data in items' ng-class=\"{'tree-horizontal':(!data.subs || data.subs.length == 0)}\">\
                        <a class='expandable fa permission-label' ng-class=\"{'fa-caret-down': data.expanded, 'fa-caret-right': !data.expanded, 'disabled': !data.subs || data.subs.length == 0}\" \
                            ng-click='toggle(data, true)' style='width: 10px;'></a>\
                        <label for='{{data.id}}'>\
                            <a href='javascript:void(0);' ng-click='select(data)' class='fa' ng-class=\"{'yes': 'fa-check-square-o', 'no': 'fa-square-o', 'partial': 'partial-check fa-minus-square-o'}[data.checked]\" style='width:20px;'>\
                            </a><a href='javascript:void(0);' ng-click='select(data)' class='permission-label' ng-class=\"{'permission-label-default':data.base}\">{{data.name}}</a> \
                            <select ng-if='data.dataScopes.length>1' ng-model='data.dataScope.name' ng-options='s.name as s.label for s in data.dataScopes' ng-change='changeScope(data)' style='width:60px;height: 20px;'>\
                            </select>\
                        </label>\
                        <tree-viewer items='data.subs' parent='data'  map='map' selected='selected' parent-index='$index' ng-show='data.expanded'> </tree-viewer>\
                    </li>\
                </ul>",

            controller: function treeViewerCtrl($scope) {
                $scope.getItem = function(id) {
                    if (!$scope.map || null == $scope.map) {
                        return;
                    }
                    return $scope.map[id];
                }

                //将当前权限添加到已选数组中
                $scope.doSelect = function(data) {
                        if (!$scope.selected) {
                            $scope.selected = {};
                        }
                        if (data.checked == "yes" || data.checked == "partial") {
                            $scope.selected[data.id] = data;
                            if (data.dependIds) { //依赖联动
                                for (var i = 0; i < data.dependIds.length; i++) {
                                    if ($scope.getItem(data.dependIds[i])) {
                                        $scope.getItem(data.dependIds[i]).checked = 'yes';
                                        $scope.selected[data.dependIds[i]] = $scope.getItem(data.dependIds[i]);
                                    }
                                }
                            }
                        } else {
                            delete $scope.selected[data.id];
                        }
                    }
                    //选择作用域
                $scope.changeScope = function(data) {
                    var scope = data.dataScope;
                    if (!data || !data.subs || data.subs.length == 0) {
                        return;
                    }
                    var len = data.subs.length;
                    for (var i = 0; i < len; i++) {
                        data.subs[i].dataScope = scope;
                        if ($scope.selected[data.subs[i].id]) {
                            $scope.selected[data.subs[i].id].dataScope = scope;
                        }
                    }
                };
                //设置父权限状态
                $scope.setParentState = function(data) {
                    if (!data || !data.parentId || !$scope.getItem(data.parentId)) {
                        return;
                    }
                    var parent = $scope.getItem(data.parentId),
                        siblings = parent.subs,
                        i = 0,
                        len = siblings.length,
                        curState = siblings[0].checked,
                        isDiff = false;
                    for (i = 1; i < len; i++) {
                        isDiff = siblings[i].checked != curState;
                        if (isDiff) {
                            break;
                        }
                        curState = siblings[i].checked;
                    }
                    parent.checked = isDiff ? 'partial' : curState;
                    $scope.doSelect(parent);
                    $scope.setParentState(parent);
                };
                // 设置子权限状态
                $scope.setChildrenState = function(data) {
                    if (!data || !data.subs || data.subs.length == 0) {
                        return;
                    }
                    var subs = data.subs;
                    var len = subs.length;
                    for (var i = 0; i < len; i++) {
                        if (data.base && data.checked == 'partial') {
                            if (!subs[i].base) { //非基础子权限取消选择
                                subs[i].checked = 'no';
                            } else if (subs[i].base && subs[i].subs.length > 0) { //基础子权限且拥有下级子权限
                                for (var j = 0; j < subs[i].subs.length; j++) {
                                    if (!subs[i].subs[j].base) { //只要拥有一个非基础子权限，状态置为 'partial'
                                        subs[i].checked = 'partial';
                                    }
                                }
                            } //叶子基础子权限不作处理
                        } else { // 其余情况状态随父级变动
                            subs[i].checked = data.checked;
                        }
                        $scope.doSelect(subs[i]);
                        $scope.setChildrenState(subs[i]);
                    }
                };

                //选择事件
                $scope.select = function(data) {
                    if ($scope.getItem(data.parentId) && $scope.getItem(data.parentId).subs.length > 0) { //判断依赖关系
                        var subs = $scope.getItem(data.parentId).subs;
                        for (var i = 0; i < subs.length; i++) {
                            if (subs[i].checked == 'yes' && subs[i].dependIds) {
                                for (var j = 0; j < subs[i].dependIds.length; j++) {
                                    if (subs[i].dependIds[j] == data.id) {
                                        return; //若当前权限被已选中同级权限依赖，不作处理
                                    }
                                }
                            }
                        }
                    }
                    if (data.base && data.subs.length == 0) { //无子基本权限，不作处理
                        return;
                    } else if (data.base && data.checked == 'yes' && data.subs.length > 0) { //已选有子基本权限
                        for (var j = 0; j < data.subs.length; j++) {
                            if (!data.subs[j].base) { //只要拥有一个非基础子权限，状态置为 'partial'
                                data.checked = 'partial';
                            }
                        }
                    } else { //其余情况非yes 即 no
                        data.checked = data.checked == 'yes' ? 'no' : 'yes';
                    }
                    $scope.doSelect(data);
                    $scope.setChildrenState(data);
                    $scope.setParentState(data);

                };

                $scope.toggle = function(data, recursion) {
                    if (!data.subs || data.subs.length == 0) {
                        return;
                    }
                    data.expanded = !data.expanded;
                    if (recursion) {
                        angular.forEach(data.subs, function(item, key) {
                            $scope.toggle(item, recursion);
                        });
                    }
                };
                //根据selected初始化叶子权限状态
                $scope.initChildrenState = function(map, selected) {
                        if (!map || map.length == 0 || !selected || selected.length == 0) {
                            return;
                        }
                        angular.forEach(map, function(item) {
                            if (item.subs.length == 0) {
                                if (item.base) {
                                    item.checked = 'yes';
                                    selected[item.id] = item;
                                } else {
                                    for (var index in selected) {
                                        if (item.id == selected[index].id) {
                                            item.checked = 'yes';
                                            break;
                                        }
                                    }
                                }
                            }
                        });
                        return;
                    }
                    //根据已初始化叶子权限初始化父权限状态
                $scope.initParentState = function(map) {
                        if (!map || map.length == 0) {
                            return;
                        }
                        angular.forEach(map, function(item) {
                            if (item.subs.length == 0 && item.checked == 'yes') {
                                $scope.setParentState(item);
                            }
                        });
                        return;
                    }
                    //根据已选权限selected初始化数据域下拉框
                $scope.initDataScope = function(map, selected) {
                        angular.forEach(map, function(item, i) {
                            if (item.subs.length > 0) {
                                if (item.dataScopes.length > 1) {
                                    if (selected[item.id] && selected[item.id].dataScope) {
                                        item.dataScope = selected[item.id].dataScope;
                                    } else {
                                        item.dataScope = item.dataScopes[0];
                                    }
                                } else {
                                    item.dataScope = item.dataScopes[0];
                                }
                                var len = item.subs.length;
                                for (var i = 0; i < len; i++) {
                                    item.subs[i].dataScope = item.dataScope;
                                }
                            }
                        });
                    }
                    //限制在递归调用中只初始化一次，优化树的渲染速度
                if (Object.getOwnPropertyNames($scope.map).length > 1 && $scope.map['init'] == undefined) {
                    // console.log("~~~~~init tree~~~~~");
                    $scope.initDataScope($scope.map, $scope.selected);
                    $scope.initChildrenState($scope.map, $scope.selected);
                    $scope.initParentState($scope.map);
                    $scope.map['init'] = false;
                }
            },
            link: function(scope, iElement, iAttrs, ctrl) {},
            compile: function(element) {
                // http://stackoverflow.com/questions/14430655/recursion-in-angular-directives
                var contents = element.contents().remove();
                var compiledContents;

                return {
                    post: function(scope, element) {
                        if (!compiledContents)
                            compiledContents = $compile(contents);

                        compiledContents(scope, function(clone) {
                            element.append(clone);
                        });
                    }
                };
            }
        };
    });

    app.directive("ytxTooltip", function() {
        return {
            scope: {
                ytxTooltipTitle: "@"
            },
            link: function(scope, element, attr) {
                // scope.$parent.$eval(attr)
                element.tooltip({ title: scope.ytxTooltipTitle, placement: attr["placement"] | "right" });
            }
        }
    });

});
