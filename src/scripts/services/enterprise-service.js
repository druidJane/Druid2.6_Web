define(["app"], function(app) {
    var enterpriseService = function() {

        //var units = [{ "index": 1, "label": "元/条" }, { "index": 2, "label": "元/分钟" }];
        var carriers = [{
            "index": 1,
            "name": "MOBILE",
            "label": "移动" //,
                //"unit": units[0],
                //"units": angular.copy(units)
        }, {
            "index": 2,
            "name": "UNICOM",
            "label": "联通" //,
                //"unit": units[0],
                //"units": angular.copy(units)
        }, {
            "index": 3,
            "name": "TELECOM",
            "label": "电信小灵通" //,
                //"unit": units[0],
                //"units": angular.copy(units)
        }, {
            "index": 4,
            "name": "TELECOM_CDMA",
            "label": "电信CDMA" //,
                //"unit": units[0],
                //"units": angular.copy(units)
        }];

        //初始化表单表格
        var initProductPrices = function(enterprise) {
            var products = new Array();
            if (enterprise.products == null || enterprise.products.length == 0) {
                return products;
            }

            var productsSource = angular.copy(enterprise.products);
            angular.forEach(productsSource, function(o) { //精简返回数据和重构数据结构
                //console.log(o);
                var product = { "productId": o.productId, "productName": o.productName };
                if (!o.productAccountBind.addition) { //是否已经开通此企业
                    product.$checked = true;
                    product.addition = false;
                } else {
                    product.$checked = false;
                    product.addition = true; //如果不是已开通的，则新添加
                }
                //修改时的默认值
                product.productAccountBind = o.productAccountBind;
                product.payType = product.productAccountBind.payType.index;
                product.billingType = product.productAccountBind.billingType.index;
                product.pricingType = product.productAccountBind.pricingType.index;
                product.balanceRemind = product.productAccountBind.balanceRemind;

                product.pricingTypes = new Array(); //产品报价类型
                angular.forEach(o.pricingTypeEntitys, function(e) {
                    if (e.checked || e.pricingType.index == product.pricingType) { //只限已经开通的报价类型或者正在使用的
                        var pricingType = {
                            "index": e.pricingType.index,
                            "name": e.pricingType.name,
                            "label": e.pricingType.label,
                        };
                        product.pricingTypes.push(pricingType);
                    }
                });

                var productPricesMap = {};
                angular.forEach(o.productEnablers, function(enabler) { //产品单价数组转换为对象，避免重复循环
                    productPricesMap[enabler.type.name] = {};
                    angular.forEach(enabler.productPriceStandards, function(price) {
                        productPricesMap[enabler.type.name][price.carrierType.name] = price;
                    });
                });
                //console.log(productPricesMap);

                var accountPricesMap = {};
                angular.forEach(o.accountCarrierPrices, function(price) { //企业已经配置的单价数组转换为对象，避免重复循环
                    if (!accountPricesMap[price.bizEnabler.name]) {
                        accountPricesMap[price.bizEnabler.name] = {};
                    }
                    accountPricesMap[price.bizEnabler.name][price.carrierType.name] = price;
                });
                //console.log(accountPricesMap);

                product.enablers = new Array(); //可选业务能力
                angular.forEach(o.productEnablers, function(e) {
                    var binded = accountPricesMap[e.type.name] != null; //是否已经绑定
                    var display = e.checked ? true : binded; //业务能力如果在产品中已经取消，则判断是否已经绑定
                    if (display) {
                        var enabler = {
                            "index": e.type.index,
                            "name": e.type.name,
                            "label": e.type.label,
                            "msgType": e.msgType,
                            "carriers": angular.copy(carriers),
                            //"units": angular.copy(units),
                            "defaulted": e.defaulted,
                            "binded": binded,
                            "addition": (binded ? false : true) //是否新增的业务能力
                        };
                        product.enablers.push(enabler);
                    }
                });

                //加载单价
                angular.forEach(product.enablers, function(enabler) {
                    if (accountPricesMap[enabler.name] != null) { //修改时的默认值
                        enabler.$checked = true;
                        if (product.pricingType == 1) { //默认【区分运营商】单价
                            angular.forEach(enabler.carriers, function(carrier) {
                                var priceObj = accountPricesMap[enabler.name][carrier.name];
                                //carrier.priceId = priceObj.id; //原价格表的id
                                carrier.contractPrice = priceObj.contractPrice; //合同单价
                                carrier.price = priceObj.price; //单价
                                carrier.unit = priceObj.unit; //单位
                            });

                            //备选的产品【三网合一】单价
                            var priceObj = productPricesMap[enabler.name][carriers[0].name];
                            enabler.contractPrice = priceObj.price; //合同单价
                            enabler.price = priceObj.price; //单价
                            enabler.unit = priceObj.unit; //单位
                        } else { //默认【三网合一】单价
                            var priceObj = accountPricesMap[enabler.name][carriers[0].name];
                            //enabler.priceId = priceObj.id; //原价格表的id
                            enabler.contractPrice = priceObj.contractPrice; //合同单价
                            enabler.price = priceObj.price; //单价
                            enabler.unit = priceObj.unit; //单位

                            //备选的产品【区分运营商】单价
                            angular.forEach(enabler.carriers, function(carrier) {
                                var priceObj = productPricesMap[enabler.name][carrier.name];
                                carrier.contractPrice = priceObj.price; //合同单价
                                carrier.price = priceObj.price; //单价
                                carrier.unit = priceObj.unit; //单位
                            });

                        }
                    } else { //新产品或者新业务能力，继承产品的单价
                        if (product.addition) {
                            enabler.$checked = enabler.defaulted;
                        }
                        angular.forEach(enabler.carriers, function(carrier) {
                            var priceObj = productPricesMap[enabler.name][carrier.name];
                            carrier.contractPrice = priceObj.price; //合同单价
                            carrier.price = priceObj.price; //单价
                            carrier.unit = priceObj.unit; //单位
                        });
                        var priceObj = productPricesMap[enabler.name][carriers[0].name];
                        enabler.contractPrice = priceObj.price; //合同单价
                        enabler.price = priceObj.price; //单价
                        enabler.unit = priceObj.unit; //单位
                    }
                });

                products.push(product);
            });
            //console.log(products[0]);
            return products;
        };

        //构建表单提交数据
        var getSubmitData = function(enterpriseId, data) {
            var products = new Array();
            if (data == null || data.length == 0) {
                return products;
            }

            angular.forEach(data, function(o) { //精简返回数据和重构数据结构
                var productId = o.productId;
                var productAccountBind = {
                    "id": o.productAccountBind.id, // id主键
                    "productId": productId, // 产品id
                    "capitalAccountId": o.productAccountBind.capitalAccountId, // 资金账户id
                    "pricingMode": o.productAccountBind.pricingMode.index, // 报价模式
                    "pricingType": parseInt(o.pricingType), // 报价类型
                    "billingType": parseInt(o.billingType), // 计费方式
                    "payType": parseInt(o.payType), // 付费方式
                    "chargeType": o.productAccountBind.chargeType.index, // 充值类型
                    "chargeRatio": o.productAccountBind.chargeRatio, // 充值比例(代理商类型企业才有效)
                    "autoChargeAmount": o.productAccountBind.autoChargeAmount, // 自动充值金额(chare_type=2 时此字段有效)
                    "balanceRemind": o.balanceRemind // 余额提醒阈值
                };
                var product = { "productId": productId, "productName": o.productName, "productAccountBind": productAccountBind, "accountCarrierPrices": new Array(), "addition": o.addition, "remove": !o.$checked };
                angular.forEach(o.enablers, function(enabler) { //精简返回数据和重构数据结构
                    if (productAccountBind.pricingType == 1) { //区分运营商
                        angular.forEach(enabler.carriers, function(carrier) {
                            var price = {
                                "id": 0, // id主键
                                "carrierType": carrier.index, // 运营商
                                "price": carrier.price, // 单价
                                "contractPrice": carrier.contractPrice, // 合同单价
                                "enterpriseId": enterpriseId, // 企业id
                                "productId": productId, // 产品ID
                                "bizEnabler": enabler.index, // 业务能力
                                "unit": carrier.unit, // 单价(元)/单位
                                "capitalAccountId": 0, // 企业计费子账号ID
                                "addition": enabler.addition && enabler.$checked, //是否新增的业务能力
                                "remove": enabler.binded && !enabler.$checked
                            };
                            if (price.addition || price.remove || enabler.binded) {
                                product.accountCarrierPrices.push(price);
                            }
                        });
                    } else { //三网合一
                        angular.forEach(carriers, function(carrier) {
                            var price = {
                                "id": 0, // id主键
                                "carrierType": carrier.index, // 运营商
                                "price": enabler.price, // 单价
                                "contractPrice": enabler.contractPrice, // 合同单价
                                "enterpriseId": enterpriseId, // 企业id
                                "productId": productId, // 产品ID
                                "bizEnabler": enabler.index, // 业务能力
                                "unit": enabler.unit, // 单价(元)/单位
                                "capitalAccountId": 0, // 企业计费子账号ID
                                "addition": enabler.addition && enabler.$checked, //是否新增的业务能力
                                "remove": enabler.binded && !enabler.$checked
                            };
                            if (price.addition || price.remove || enabler.binded) {
                                product.accountCarrierPrices.push(price);
                            }
                        });
                    }
                });
                //console.log(product.accountCarrierPrices.length);
                products.push(product);
            });
            //console.log(products);
            return products;
        };

        //显示企业绑定的产品单价
        var showProductPrices = function(enterprise) {
            var products = new Array();
            if (enterprise.products == null || enterprise.products.length == 0) {
                return products;
            }

            var productsSource = angular.copy(enterprise.products);
            angular.forEach(productsSource, function(o) { //精简返回数据和重构数据结构
                var product = { "productId": o.productId, "productName": o.productName, "addition": o.addition, "remove": o.remove };
                product.$checked = o.productAccountBind != null; //是否已经开通此企业
                product.productAccountBind = o.productAccountBind;

                var accountPricesMap = {};
                product.enablers = new Array(); //可选业务能力
                angular.forEach(o.accountCarrierPrices, function(price) { //企业已经配置的单价数组转换为对象，避免重复循环
                    if (!accountPricesMap[price.bizEnabler.name]) {
                        accountPricesMap[price.bizEnabler.name] = {};
                        var enabler = {
                            "index": price.bizEnabler.index,
                            "name": price.bizEnabler.name,
                            "label": price.bizEnabler.label,
                            "carriers": angular.copy(carriers)
                        };
                        product.enablers.push(enabler);
                    }
                    accountPricesMap[price.bizEnabler.name][price.carrierType.name] = price;
                });

                //加载单价
                angular.forEach(product.enablers, function(enabler) {
                    if (accountPricesMap[enabler.name] != null) { //判断是否已有的业务能力
                        angular.forEach(enabler.carriers, function(carrier) {
                            var priceObj = accountPricesMap[enabler.name][carrier.name];
                            carrier.contractPrice = priceObj.contractPrice; //合同单价
                            carrier.price = priceObj.price; //单价
                            carrier.unit = priceObj.unit; //单位
                            carrier.addition = priceObj.addition; //是否新增审核
                            carrier.modify = priceObj.modify; //是否修改审核
                            carrier.remove = priceObj.remove; //是否删除审核
                        });
                        var priceObj = accountPricesMap[enabler.name][carriers[0].name];
                        enabler.contractPrice = priceObj.contractPrice; //合同单价
                        enabler.price = priceObj.price; //单价
                        enabler.unit = priceObj.unit; //单位
                        enabler.addition = priceObj.addition; //是否新增审核
                        enabler.modify = priceObj.modify; //是否修改审核
                        enabler.remove = priceObj.remove; //是否删除审核
                    }
                });

                if (product.$checked) {
                    products.push(product);
                }
            });
            return products;
        };

        //显示企业端口绑定信息
        var showEnterpriseSpecNum = function(data) {
            var enterpriseSpecNum = data.data;
            enterpriseSpecNum.smsSpecNums = new Array(); //绑定的端口
            enterpriseSpecNum.redirectSpecNums = new Array(); //备用端口和切换端口
            angular.forEach(enterpriseSpecNum.specsvsNums, function(o, index) {
                var supportBizTypes = "";
                angular.forEach(o.enablers, function(enabler, i) {
                    supportBizTypes += (i == 0 ? "" : ",") + enabler.name;
                });

                var canSendCarriersStr = "";
                angular.forEach(o.canSendCarriers, function(carrier, i) {
                    var label = carriers[carrier - 1].label;
                    canSendCarriersStr += (i == 0 ? "" : ",") + label;
                });
                o.canSendCarriersStr = canSendCarriersStr;
                o.supportBizTypes = supportBizTypes;
                enterpriseSpecNum.smsSpecNums.push(o);

                if (o.whiteRedirectChannelId != null && o.changeChannelId != null) { //端口切换和备用
                    o.redirectType = 1;
                    enterpriseSpecNum.redirectSpecNums.push(o);

                    var copy = angular.copy(o);
                    copy.redirectType = 2;
                    enterpriseSpecNum.redirectSpecNums.push(copy);
                } else if (o.whiteRedirectChannelId != null || o.changeChannelId != null) { //端口切换和备用
                    o.redirectType = o.whiteRedirectChannelId != null ? 1 : 2;
                    enterpriseSpecNum.redirectSpecNums.push(o);
                }
            });

            return enterpriseSpecNum;
        };

        //校验签名
        var checkSignature = function(enterprise) {
            if (enterprise.signature.indexOf("【") != 0) {
                enterprise.signature = "【" + enterprise.signature.replace("【", "");

            }
            if (enterprise.signature.indexOf("】") != enterprise.signature.length - 1) {
                enterprise.signature = enterprise.signature.replace("】", "") + "】";
            }
        };

        return {
            checkSignature: checkSignature,
            initProductPrices: initProductPrices,
            showProductPrices: showProductPrices,
            showEnterpriseSpecNum: showEnterpriseSpecNum,
            getSubmitData: getSubmitData
        };
    };
    app.factory("enterpriseService", [enterpriseService]);
});
