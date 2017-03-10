define(["app"], function(app) {
    var graphService = function($rootScope, $location, $q) {

        var getBaseOption = function(name, legend) {
            return {
                title: { text: name, left: '5%', top: '2%' },
                tooltip: { trigger: 'axis' },
                legend: {
                    right: '2%',
                    top: '3%',
                    data: legend
                },
                grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                backgroundColor: "rgb(253,253,255)",
                color: ['#fc9c6f', '#35a9e5', '#2ecc71', '#f8d56b'],
                xAxis: [],
                yAxis: [],
                series: []
            }
        };

        var getPieOption = function(name, subtext, legend, data) {
            var option = {
                title: { text: name, right: '25%', top: '10%', subtext: subtext },
                tooltip: { trigger: 'item', formatter: "{a} <br/>{b} ({d}%)" },
                legend: { orient: 'vertical', top: '31%', right: '23%', data: legend },
                backgroundColor: "rgb(253,253,255)",
                color: ['#fc9c6f', '#35a9e5', '#2ecc71', '#f8d56b'],
                series: [{
                    name: "",
                    type: 'pie',
                    radius: '70%',
                    center: ['30%', '60%'],
                    label: {
                        normal: {
                            show: false
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data: data,
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            };
            return option;
        };

        var getSendStatOption = function(title, legend, data, xAxis) {
            var option = getBaseOption(title, legend);
            option.title.left = "2%";
            option.tooltip.axisPointer = {
                type: 'line' // 默认为直线，可选为：'line' | 'shadow'
            };
            option.xAxis = [{
                type: 'category',
                boundaryGap: false,
                name: "时间",
                data: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
            }];
            if (xAxis) {
                option.xAxis[0].data = xAxis;
            }
            option.yAxis = [{ type: 'value', name: '单位：条' }];
            for (var i in data) {
                var tmpData = data[i];
                var serie = getSendSeries(legend[i], tmpData);
                option.series.push(serie);
            }
            return option;
        };

        var getSendSeries = function(legend, data) {
            return {
                name: legend,
                type: 'line',
                smooth: true,
                data: data
            };
        };

        var showEchart = function(id, option, width, height) {
            if (!option) {
                return;
            }
            var echartDiv = document.getElementById(id);
            if (!echartDiv) {
                return;
            }
            if (width) {
                echartDiv.style.width = width + "px";
            }
            if (height) {
                echartDiv.style.height = height + "px";
            }
            var chart = echarts.init(echartDiv);
            chart.setOption(option);
        };

        return {
            showEchart: showEchart,
            getSendSeries: getSendSeries,
            getBaseOption: getBaseOption,
            getSendStatOption: getSendStatOption,
            getPieOption: getPieOption
        };
    };
    app.factory("graphService", ["$rootScope", '$location', '$q', graphService]);
});
