$(document).ready(function(){
    var myChart = echarts.init(document.getElementById('echarts'));
    myChart.clear();
    option = {
        title: {
            text: '相内自对比'
        },
        tooltip : {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985'
                }
            }
        },
        legend: {
            data:['最大值','平均值','最小值']
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        grid: {
            left: '0',
            right: '10px',
            bottom: '0',
            containLabel: true
        },
        xAxis : [
            {
                type : 'category',
                boundaryGap : false,
                data : ['周一','周二','周三','周四','周五','周六','周日']
            }
        ],
        yAxis : [
            {
                type : 'value'
            }
        ],
        series : [
            {
                name:'最大值',
                type:'line',
                stack: '1',
                areaStyle: {},
                data:[120, 132, 101, 134, 90, 230, 210]
            },
            {
                name:'最小值',
                type:'line',
                stack: '2',
                areaStyle: {},
                data:[220, 182, 191, 234, 290, 330, 310]
            },
            {
                name:'平均值',
                type:'line',
                stack: '3',
                areaStyle: {},
                data:[150, 232, 201, 154, 190, 330, 410]
            }            
        ]
    };

    myChart.setOption(option);
});
