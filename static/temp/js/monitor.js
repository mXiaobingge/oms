// 1.打开monitor界面，显示目前通道的状态，以及其正在执行的测试方案以及测试数据，若其处于停止状态，则没有数据
// 2.monitor页面仅显示目前正在执行测试的通道的数据，历史测试数据应从其他页面检索
// 3.无论选择的通道是不是在工作，当前页面都会不断请求数据


var myChart = echarts.init(document.getElementById('U_I_t_chart'));
var myChart1 = echarts.init(document.getElementById('Q_t_chart'));
var myChart2 = echarts.init(document.getElementById('Tc_t_chart'));
var myChart3 = echarts.init(document.getElementById('Tm_t_chart'));
var myChart4 = echarts.init(document.getElementById('Vm_t_chart'));

var intID1;
var intID2;
var intID3;

var I = [];
var U = [];
var Q = {
    Q_H2: [], Q_CH4: [], Q_N2: [], Q_CO2: [], Q_Air: [], Q_H2O: []
};
// var Vm = {
//     V0: [], V1: [], V2: [], V3: [], V4: [], V5: [], V6: [], V7: [], V8: [], V9: [],
//     V10: [], V11: [], V12: [], V13: [], V14: [], V15: [], V16: [], V17: [], V18: [], V19: [],
// };
var Vm = {
    V0: [], V1: [], V2: [], V3: [], V4: [], V5: [], V6: [], V7: [], V8: [],
};
// var Tc = {
//     Tc0: [], Tc1: [], Tc2: [], Tc3: [],
// };
var Tc = {
    Tc0: [], Tc1: [],
};
// var Tm = {
//     T0: [], T1: [], T2: [], T3: [], T4: [], T5: [], T6: [], T7: [], T8: [], T9: [],
//     T10: [], T11: [], T12: [], T13: [], T14: [], T15: [], T16: [], T17: [], T18: [], T19: [],
// };
var Tm = {
    T0: [], T1: [], T2: [], T3: [], T4: [], T5: [],
};
var refresh = 3000;

function set_interval() {
    refresh = (isNaN(Number.parseInt($("#refresh-int").val())) || (Number.parseInt($("#refresh-int").val()) <= 3000) ? 3000 : Number.parseInt($("#refresh-int").val()));
    console.log(refresh);
    clearInterval(intID1);
    clearInterval(intID2);
    clearInterval(intID3);
    var box_num = $('#box_num_selected option:selected').val();//选中的值
    var channel_num = $('#channel_num_selected option:selected').val();//选中的值
    if (box_num != undefined && channel_num != undefined) {
        intID1 = setInterval(get_realtime_data, refresh);
        intID2 = setInterval(show_brief_info, refresh);
        intID3 = setInterval(show_testline_status, refresh);
        alert("设置成功，开始刷新");
    }
    else {
        alert("设置失败");
    }
}

function stop_refresh() {
    clearInterval(intID1);
    clearInterval(intID2);
    clearInterval(intID3);
    alert("停止成功");
}

$(document).ready(function () {

        get_boxes();
        get_oven_status();
        get_cells_info();
        get_tests_info();
        var box_num = $('#box_num_selected option:selected').val();//选中的值
        var channel_num = $('#channel_num_selected option:selected').val();//选中的值
        if (box_num != undefined && channel_num != undefined) {
            show_chart();
            // intID1 = setInterval(get_realtime_data, refresh);
            // intID2 = setInterval(show_brief_info, refresh);
            // intID3 = setInterval(show_testline_status, refresh);
            show_test_scheme();
        }
        window.onresize = function () {
            myChart.resize();
            myChart1.resize();
            myChart2.resize();
            myChart3.resize();
            myChart4.resize();
        };
    }
)


var box;

function get_boxes() {
    $("#box_num_selected").empty();
    $.ajax({
            url: "/get_b_c_num/",
            type: "get",
            dataType: 'json',
            async: false, //同步执行
            success: function (data) {
                box = data.box;
            }
        }
    )
    var b_num = document.getElementById("box_num_selected");
    if (box.length != 0)
        for (var i = 0; i < box.length; i++) {
            var option = document.createElement("option");
            option.setAttribute("value", box[i].id);
            option.innerText = box[i].id;
            b_num.appendChild(option);
        }
    $("#channel_num_selected").empty();
    if (box.length != 0)
        get_channels(box[0].id);
}

function show_channel() {
    var bid = $('#box_num_selected option:selected').val();
    get_channels(bid);
}

function get_channels(bid) {
    $("#channel_num_selected").empty();
    var c_num = document.getElementById("channel_num_selected");
    var bs;
    for (var i = 0; i < box.length; i++) {
        if (box[i].id == bid) {
            bs = box[i];
            break;
        }
    }
    if (bs != undefined) {
        for (var i = 0; i < bs.channel.length; i++) {
            var option = document.createElement("option");
            option.setAttribute("value", bs.channel[i]);
            option.innerText = bs.channel[i];
            c_num.appendChild(option);
        }
    }
}

function show_test_scheme() {
    var box_num = $('#box_num_selected option:selected').val();//选中的值
    var channel_num = $('#channel_num_selected option:selected').val();//选中的值
    var th = document.getElementById("table_head");
    var tb = document.getElementById("table_body");
    tb.innerHTML = "";
    if (box_num != undefined && channel_num != undefined)
        $.ajax({
            url: "get_test_scheme/" + box_num + "/" + channel_num + "/",
            type: "get",
            dataType: 'json',
            async: false, //同步执行
            success: parse_scheme_data
        });
}

function parse_scheme_data(data) {
    console.log(Object.keys(data));
    var sID = data.schemeID;
    var steps = data.steps;
    var tb = document.getElementById("table_body");
    var th = document.getElementById("table_head");

    create_table_body(tb, steps.length, $("#table_head").children().children().length);
    if (steps.length == 0)
        return false;
    insert_into_table(tb, 1, 1, sID);
    var col_name = Object.keys(steps[0]);
    console.log(col_name);
    for (var i = 1; i <= steps.length; i++) {
        for (var j = 1; j <= col_name.length; j++) {
            switch (col_name[j - 1]) {
                case "step":
                    insert_into_table(tb, i, 2, steps[i - 1][col_name[j - 1]]);
                    break;
                case "LoadMode":
                    insert_into_table(tb, i, 3, steps[i - 1][col_name[j - 1]]);
                    break;
                case "U":
                    insert_into_table(tb, i, 4, steps[i - 1][col_name[j - 1]]);
                    break;
                case "I":
                    insert_into_table(tb, i, 5, steps[i - 1][col_name[j - 1]]);
                    break;
                case "t_LM":
                    insert_into_table(tb, i, 6, steps[i - 1][col_name[j - 1]]);
                    break;
                case "U_LM":
                    insert_into_table(tb, i, 7, steps[i - 1][col_name[j - 1]]);
                    break;
                case "I_LM":
                    insert_into_table(tb, i, 8, steps[i - 1][col_name[j - 1]]);
                    break;
            }
        }
    }

}

function create_table_body(tb, rows, cols) {
    for (var i = 0; i < rows; i++) {
        var tr = document.createElement("tr");
        for (var j = 0; j < cols; j++) {
            var td = document.createElement("td");
            tr.appendChild(td);
        }
        tb.appendChild(tr);
    }
}

function insert_into_table(tb, row, col, content) {
    var rows = tb.children.length;
    var cols = tb.children[0].length;
    if (row > rows || col > cols) {
        console.log("越界");
        return;
    }
    var tr = tb.children[row - 1];
    var td = tr.children[col - 1];
    td.innerHTML = content;
}


function refresh_page() {
    clearInterval(intID1);
    clearInterval(intID2);
    clearInterval(intID3);
    var box_num = $('#box_num_selected option:selected').val();//选中的值
    var channel_num = $('#channel_num_selected option:selected').val();//选中的值
    if (box_num != undefined && channel_num != undefined) {
        show_chart();
        intID1 = setInterval(get_realtime_data, refresh);
        intID2 = setInterval(show_brief_info, refresh);
        intID3 = setInterval(show_testline_status, refresh);
        show_test_scheme();
        alert("成功");
    }
    else {
        alert("失败");
    }
}

function continue_testline() {
    var bid = parseInt($('#box_num_selected option:selected').val());
    var cid = parseInt($('#channel_num_selected option:selected').val());
    var data = {box: bid, channel: cid, plan: 0};
    if (bid != undefined && cid != undefined)
        $.ajax({
                url: "/control/continue_channel/",
                type: "post",
                data: JSON.stringify(data),
                dataType: 'json',
                async: false, //同步执行
                success: function (data) {
                    alert(data.Message);
                }
            }
        )
}

function pause_testline() {
    var bid = parseInt($('#box_num_selected option:selected').val());
    var cid = parseInt($('#channel_num_selected option:selected').val());
    var data = {box: bid, channel: cid, plan: 0};
    if (bid != undefined && cid != undefined)
        $.ajax({
                url: "/control/pause_channel/",
                type: "post",
                data: JSON.stringify(data),
                dataType: 'json',
                async: false, //同步执行
                success: function (data) {
                    alert(data.Message);
                }
            }
        )
}

function stop_testline() {
    var bid = parseInt($('#box_num_selected option:selected').val());
    var cid = parseInt($('#channel_num_selected option:selected').val());
    var data = {box: bid, channel: cid, plan: 0};
    if (bid != undefined && cid != undefined)
        $.ajax({
                url: "/control/stop_channel/",
                type: "post",
                data: JSON.stringify(data),
                dataType: 'json',
                async: false, //同步执行
                success: function (data) {
                    alert(data.Message);
                }
            }
        )
}


function show_chart() {
    var box_num = $('#box_num_selected option:selected').val();//选中的值
    var channel_num = $('#channel_num_selected option:selected').val();//选中的值
    if (box_num != undefined && channel_num != undefined)
        $.ajax({
            url: "get_testdata_from_start/" + box_num + "/" + channel_num + "/",
            type: "get",
            dataType: 'json',
            async: false, //同步执行
            success: function (data) {
                //console.log(data);
                I = data.I;
                U = data.U;

                Q.Q_CO2 = data.Q_CO2;
                Q.Q_CH4 = data.Q_CH4;
                Q.Q_Air = data.Q_Air;
                Q.Q_N2 = data.Q_N2;
                Q.Q_H2 = data.Q_H2;
                Q.Q_H2O = data.Q_H2O;

                Tm.T0 = data.Tm0;
                Tm.T1 = data.Tm1;
                Tm.T2 = data.Tm2;
                Tm.T3 = data.Tm3;
                Tm.T4 = data.Tm4;
                Tm.T5 = data.Tm5;
                // Tm.T6 = data.Tm6;Tm.T7 = data.Tm7;Tm.T8 = data.Tm8;Tm.T9 = data.Tm9;
                // Tm.T10 = data.Tm10;Tm.T11 = data.Tm11;Tm.T12 = data.Tm12;Tm.T13 = data.Tm13;Tm.T14 = data.Tm14;
                // Tm.T15 = data.Tm15;Tm.T16 = data.Tm16;Tm.T17 = data.Tm17;Tm.T18 = data.Tm18;Tm.T19 = data.Tm19;

                Tc.Tc0 = data.Tc0;
                Tc.Tc1 = data.Tc1;
                // Tc.Tc2 = data.Tc2;
                // Tc.Tc3 = data.Tc3;

                Vm.V0 = data.Vm0;
                Vm.V1 = data.Vm1;
                Vm.V2 = data.Vm2;
                Vm.V3 = data.Vm3;
                Vm.V4 = data.Vm4;
                Vm.V5 = data.Vm5;
                Vm.V6 = data.Vm6;
                Vm.V7 = data.Vm7;
                Vm.V8 = data.Vm8;
                // Vm.V9 = data.Vm9;
                // Vm.V10 = data.Vm10;
                // Vm.V11 = data.Vm11;
                // Vm.V12 = data.Vm12;
                // Vm.V13 = data.Vm13;
                // Vm.V14 = data.Vm14;
                // Vm.V15 = data.Vm15;
                // Vm.V16 = data.Vm16;
                // Vm.V17 = data.Vm17;
                // Vm.V18 = data.Vm18;
                // Vm.V19 = data.Vm19;

                var option_U_I = {
                    legend: {
                        data: ["电压", "电流"]
                    },
                    axisPointer: {
                        animation: false
                    },
                    dataZoom: [{
                        type: 'slider',
                        show: true,
                        start: 0,
                        end: 100
                    },

                    ],
                    xAxis: {
                        type: "time",
                        splitLine: {
                            lineStyle: {
                                type: 'dashed'
                            }
                        },
                    },
                    yAxis: [{
                        name: '电压/V',
                        type: 'value',
                        nameTextStyle: {
                            fontSize: 14
                        },
                        splitLine: {
                            lineStyle: {
                                type: 'dashed'
                            }
                        },
                        position: 'left',
                        boundaryGap: [0, '10%'],
                    }, {
                        name: '电流/A',
                        type: 'value',
                        nameTextStyle: {
                            fontSize: 14
                        },
                        splitLine: {
                            lineStyle: {
                                type: 'dashed'
                            }
                        },
                        position: 'right',
                        boundaryGap: [0, '15%'],
                    }],
                    series: [{
                        name: '电压',
                        type: 'line',
                        showSymbol: false,
                        hoverAnimation: false,
                        data: U,
                        yAxisIndex: 0
                    }, {
                        name: '电流',
                        type: 'line',
                        showSymbol: false,
                        hoverAnimation: false,
                        data: I,
                        yAxisIndex: 1
                    }]
                };
                var option_Q = {
                    legend: {
                        data: ["氢气", "氮气", "甲烷", "二氧化碳", "空气", "水蒸汽"]
                    },
                    dataZoom: [{
                        type: 'slider',
                        show: true,
                        start: 0,
                        end: 100
                    },

                    ],
                    xAxis: {
                        type: "time",
                        splitLine: {
                            lineStyle: {
                                type: 'dashed'
                            }
                        },
                    },
                    yAxis: {
                        name: '流量/ccm',
                        type: 'value',
                        nameTextStyle: {
                            fontSize: 14
                        },
                        splitLine: {
                            lineStyle: {
                                type: 'dashed'
                            }
                        },
                        position: 'left',
                        boundaryGap: [0, '10%'],
                    },
                    series: [{
                        name: '氢气',
                        type: 'line',
                        showSymbol: false,
                        hoverAnimation: false,
                        data: Q.Q_H2,
                    }, {
                        name: '氮气',
                        type: 'line',
                        showSymbol: false,
                        hoverAnimation: false,
                        data: Q.Q_N2,
                    }, {
                        name: '空气',
                        type: 'line',
                        showSymbol: false,
                        hoverAnimation: false,
                        data: Q.Q_Air,
                    }, {
                        name: '甲烷',
                        type: 'line',
                        showSymbol: false,
                        hoverAnimation: false,
                        data: Q.Q_CH4,
                    }, {
                        name: '二氧化碳',
                        type: 'line',
                        showSymbol: false,
                        hoverAnimation: false,
                        data: Q.Q_CO2,
                    }, {
                        name: '水蒸汽',
                        type: 'line',
                        showSymbol: false,
                        hoverAnimation: false,
                        data: Q.Q_H2O,
                    }]
                };
                var option_Tc = {
                    legend: {
                        // data: ["控温点0", "控温点1", "控温点2", "控温点3"]
                        data: ["控温点0", "控温点1"]
                    },
                    dataZoom: [{
                        type: 'slider',
                        show: true,
                        start: 0,
                        end: 100
                    },
                    ],
                    xAxis: {
                        type: "time",
                        splitLine: {
                            lineStyle: {
                                type: 'dashed'
                            }
                        },
                    },
                    yAxis: {
                        name: '温度/°C',
                        type: 'value',
                        nameTextStyle: {
                            fontSize: 14
                        },
                        splitLine: {
                            lineStyle: {
                                type: 'dashed'
                            }
                        },
                        position: 'left',
                        boundaryGap: [0, '10%'],
                    },
                    series: [{
                        name: '控温点0',
                        type: 'line',
                        showSymbol: false,
                        hoverAnimation: false,
                        data: Tc.Tc0,
                    }, {
                        name: '控温点1',
                        type: 'line',
                        showSymbol: false,
                        hoverAnimation: false,
                        data: Tc.Tc1,
                    }
                        // , {
                        //     name: '控温点2',
                        //     type: 'line',
                        //     showSymbol: false,
                        //     hoverAnimation: false,
                        //     data: Tc.Tc2,
                        // }, {
                        //     name: '控温点3',
                        //     type: 'line',
                        //     showSymbol: false,
                        //     hoverAnimation: false,
                        //     data: Tc.Tc3,
                        // }
                    ]
                };
                var option_Tm = {
                    legend: {
                        type: 'scroll', orient: 'vertical', right: 10, top: 20, bottom: 20,
                        // data: ["测温点0", "测温点1", "测温点2", "测温点3", "测温点4", "测温点5", "测温点6", "测温点7", "测温点8", "测温点9",
                        //     "测温点10", "测温点11", "测温点12", "测温点13", "测温点14", "测温点15", "测温点16", "测温点17", "测温点18", "测温点19",]
                        data: ["测温点0", "测温点1", "测温点2", "测温点3", "测温点4", "测温点5"]
                    },
                    dataZoom: [{
                        type: 'slider',
                        show: true,
                        start: 0,
                        end: 100
                    },
                    ],
                    xAxis: {
                        type: "time",
                        splitLine: {
                            lineStyle: {
                                type: 'dashed'
                            }
                        },
                    },
                    yAxis: {
                        name: '温度/°C',
                        type: 'value',
                        nameTextStyle: {
                            fontSize: 14
                        },
                        splitLine: {
                            lineStyle: {
                                type: 'dashed'
                            }
                        },
                        position: 'left',
                        boundaryGap: [0, '10%'],
                    },
                    series: [{
                        name: '测温点0', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm.T0,
                    }, {
                        name: '测温点1', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm.T1,
                    }, {
                        name: '测温点2', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm.T2,
                    }, {
                        name: '测温点3', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm.T3,
                    }, {
                        name: '测温点4', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm.T4,
                    }, {
                        name: '测温点5', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm.T5,
                    },
                        //     {
                        //     name: '测温点6', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm.T6,
                        // }, {
                        //     name: '测温点7', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm.T7,
                        // }, {
                        //     name: '测温点8', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm.T8,
                        // }, {
                        //     name: '测温点9', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm.T9,
                        // }, {
                        //     name: '测温点10', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm.T10,
                        // }, {
                        //     name: '测温点11', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm.T11,
                        // }, {
                        //     name: '测温点12', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm.T12,
                        // }, {
                        //     name: '测温点13', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm.T13,
                        // }, {
                        //     name: '测温点14', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm.T14,
                        // }, {
                        //     name: '测温点15', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm.T15,
                        // }, {
                        //     name: '测温点16', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm.T16,
                        // }, {
                        //     name: '测温点17', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm.T17,
                        // }, {
                        //     name: '测温点18', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm.T18,
                        // }, {
                        //     name: '测温点19', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm.T19,
                        // },
                    ]
                };
                var option_Vm = {
                    legend: {
                        type: 'scroll', orient: 'vertical', right: 10, top: 20, bottom: 20,
                        // data: ["测压点0", "测压点1", "测压点2", "测压点3", "测压点4", "测压点5", "测压点6", "测压点7", "测压点8", "测压点9",
                        //     "测压点10", "测压点11", "测压点12", "测压点13", "测压点14", "测压点15", "测压点16", "测压点17", "测压点18", "测压点19",]
                        data: ["测压点0", "测压点1", "测压点2", "测压点3", "测压点4", "测压点5", "测压点6", "测压点7", "测压点8"]
                    },
                    dataZoom: [{
                        type: 'slider',
                        show: true,
                        start: 0,
                        end: 100
                    },
                    ],
                    xAxis: {
                        type: "time",
                        splitLine: {
                            lineStyle: {
                                type: 'dashed'
                            }
                        },
                    },
                    yAxis: {
                        name: '电压/mV',
                        type: 'value',
                        nameTextStyle: {
                            fontSize: 14
                        },
                        splitLine: {
                            lineStyle: {
                                type: 'dashed'
                            }
                        },
                        position: 'left',
                        boundaryGap: [0, '10%'],
                    },
                    series: [{
                        name: '测压点0', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm.V0,
                    }, {
                        name: '测压点1', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm.V1,
                    }, {
                        name: '测压点2', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm.V2,
                    }, {
                        name: '测压点3', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm.V3,
                    }, {
                        name: '测压点4', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm.V4,
                    }, {
                        name: '测压点5', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm.V5,
                    }, {
                        name: '测压点6', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm.V6,
                    }, {
                        name: '测压点7', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm.V7,
                    }, {
                        name: '测压点8', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm.V8,
                    }
                        // , {
                        //     name: '测压点9', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm.V9,
                        // }, {
                        //     name: '测压点10', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm.V10,
                        // }, {
                        //     name: '测压点11', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm.V11,
                        // }, {
                        //     name: '测压点12', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm.V12,
                        // }, {
                        //     name: '测压点13', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm.V13,
                        // }, {
                        //     name: '测压点14', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm.V14,
                        // }, {
                        //     name: '测压点15', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm.V15,
                        // }, {
                        //     name: '测压点16', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm.V16,
                        // }, {
                        //     name: '测压点17', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm.V17,
                        // }, {
                        //     name: '测压点18', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm.V18,
                        // }, {
                        //     name: '测压点19', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm.V19,
                        // },
                    ]
                };
                myChart.setOption(option_U_I);
                myChart1.setOption(option_Q);
                myChart2.setOption(option_Tc);
                myChart3.setOption(option_Tm);
                myChart4.setOption(option_Vm);
            }
        });
}

function get_realtime_data() {

    var box_num = $('#box_num_selected option:selected').val();//选中的值
    var channel_num = $('#channel_num_selected option:selected').val();//选中的值
    if (box_num != undefined && channel_num != undefined)
        $.ajax({
            url: "get_testdata_real_time/" + box_num + "/" + channel_num + "/",
            type: "get",
            dataType: 'json',
            async: false, //同步执行
            success: function (data) {
                //console.log(data);
                if (data.I != I[I.length - 1]) I.push(data.I);
                if (data.U != U[U.length - 1]) U.push(data.U);
                if (data.Q_CO2 != Q.Q_CO2[Q.Q_CO2.length - 1]) Q.Q_CO2.push(data.Q_CO2);
                if (data.Q_CH4 != Q.Q_CH4[Q.Q_CH4.length - 1]) Q.Q_CH4.push(data.Q_CH4);
                if (data.Q_Air != Q.Q_Air[Q.Q_Air.length - 1]) Q.Q_Air.push(data.Q_Air);
                if (data.Q_N2 != Q.Q_N2[Q.Q_N2.length - 1]) Q.Q_N2.push(data.Q_N2);
                if (data.Q_H2 != Q.Q_H2[Q.Q_H2.length - 1]) Q.Q_H2.push(data.Q_H2);
                if (data.Q_H2O != Q.Q_H2O[Q.Q_H2O.length - 1]) Q.Q_H2O.push(data.Q_H2O);
                if (data.Tc0 != Tc.Tc0[Tc.Tc0.length - 1]) Tc.Tc0.push(data.Tc0);
                if (data.Tc1 != Tc.Tc1[Tc.Tc1.length - 1]) Tc.Tc1.push(data.Tc1);
                // if (data.Tc2 != Tc.Tc2[Tc.Tc2.length - 1]) Tc.Tc2.push(data.Tc2);
                // if (data.Tc3 != Tc.Tc3[Tc.Tc3.length - 1]) Tc.Tc3.push(data.Tc3);
                if (data.Tm0 != Tm.T0[Tm.T0.length - 1]) Tm.T0.push(data.Tm0);
                if (data.Tm1 != Tm.T1[Tm.T1.length - 1]) Tm.T1.push(data.Tm1);
                if (data.Tm2 != Tm.T2[Tm.T2.length - 1]) Tm.T2.push(data.Tm2);
                if (data.Tm3 != Tm.T3[Tm.T3.length - 1]) Tm.T3.push(data.Tm3);
                if (data.Tm4 != Tm.T4[Tm.T4.length - 1]) Tm.T4.push(data.Tm4);
                if (data.Tm5 != Tm.T5[Tm.T5.length - 1]) Tm.T5.push(data.Tm5);
                // if (data.Tm6 != Tm.T6[Tm.T6.length - 1]) Tm.T6.push(data.Tm6);
                // if (data.Tm7 != Tm.T7[Tm.T7.length - 1]) Tm.T7.push(data.Tm7);
                // if (data.Tm8 != Tm.T8[Tm.T8.length - 1]) Tm.T8.push(data.Tm8);
                // if (data.Tm9 != Tm.T9[Tm.T9.length - 1]) Tm.T9.push(data.Tm9);
                // if (data.Tm10 != Tm.T10[Tm.T10.length - 1]) Tm.T10.push(data.Tm10);
                // if (data.Tm11 != Tm.T11[Tm.T11.length - 1]) Tm.T11.push(data.Tm11);
                // if (data.Tm12 != Tm.T12[Tm.T12.length - 1]) Tm.T12.push(data.Tm12);
                // if (data.Tm13 != Tm.T13[Tm.T13.length - 1]) Tm.T13.push(data.Tm13);
                // if (data.Tm14 != Tm.T14[Tm.T14.length - 1]) Tm.T14.push(data.Tm14);
                // if (data.Tm15 != Tm.T15[Tm.T15.length - 1]) Tm.T15.push(data.Tm15);
                // if (data.Tm16 != Tm.T16[Tm.T16.length - 1]) Tm.T16.push(data.Tm16);
                // if (data.Tm17 != Tm.T17[Tm.T17.length - 1]) Tm.T17.push(data.Tm17);
                // if (data.Tm18 != Tm.T18[Tm.T18.length - 1]) Tm.T18.push(data.Tm18);
                // if (data.Tm19 != Tm.T19[Tm.T19.length - 1]) Tm.T19.push(data.Tm19);
                if (data.Vm0 != Vm.V0[Vm.V0.length - 1]) Vm.V0.push(data.Vm0);
                if (data.Vm1 != Vm.V1[Vm.V1.length - 1]) Vm.V1.push(data.Vm1);
                if (data.Vm2 != Vm.V2[Vm.V2.length - 1]) Vm.V2.push(data.Vm2);
                if (data.Vm3 != Vm.V3[Vm.V3.length - 1]) Vm.V3.push(data.Vm3);
                if (data.Vm4 != Vm.V4[Vm.V4.length - 1]) Vm.V4.push(data.Vm4);
                if (data.Vm5 != Vm.V5[Vm.V5.length - 1]) Vm.V5.push(data.Vm5);
                if (data.Vm6 != Vm.V6[Vm.V6.length - 1]) Vm.V6.push(data.Vm6);
                if (data.Vm7 != Vm.V7[Vm.V7.length - 1]) Vm.V7.push(data.Vm7);
                if (data.Vm8 != Vm.V8[Vm.V8.length - 1]) Vm.V8.push(data.Vm8);
                // if (data.Vm9 != Vm.V9[Vm.V9.length - 1]) Vm.V9.push(data.Vm9);
                // if (data.Vm10 != Vm.V10[Vm.V10.length - 1]) Vm.V10.push(data.Vm10);
                // if (data.Vm11 != Vm.V11[Vm.V11.length - 1]) Vm.V11.push(data.Vm11);
                // if (data.Vm12 != Vm.V12[Vm.V12.length - 1]) Vm.V12.push(data.Vm12);
                // if (data.Vm13 != Vm.V13[Vm.V13.length - 1]) Vm.V13.push(data.Vm13);
                // if (data.Vm14 != Vm.V14[Vm.V14.length - 1]) Vm.V14.push(data.Vm14);
                // if (data.Vm15 != Vm.V15[Vm.V15.length - 1]) Vm.V15.push(data.Vm15);
                // if (data.Vm16 != Vm.V16[Vm.V16.length - 1]) Vm.V16.push(data.Vm16);
                // if (data.Vm17 != Vm.V17[Vm.V17.length - 1]) Vm.V17.push(data.Vm17);
                // if (data.Vm18 != Vm.V18[Vm.V18.length - 1]) Vm.V18.push(data.Vm18);
                // if (data.Vm19 != Vm.V19[Vm.V19.length - 1]) Vm.V19.push(data.Vm19);
                myChart.setOption({
                    series: [{
                        data: U
                    }, {
                        data: I
                    }]
                });
                myChart1.setOption({
                    series: [{
                        data: Q.Q_H2, type: 'line'
                    }, {
                        data: Q.Q_N2, type: 'line'
                    }, {
                        data: Q.Q_Air, type: 'line',
                    }, {
                        data: Q.Q_CH4, type: 'line'
                    }, {
                        data: Q.Q_CO2, type: 'line'
                    }, {
                        data: Q.Q_H2O, type: 'line'
                    }]
                });
                myChart2.setOption({
                    series: [{
                        data: Tc.Tc0,
                    }, {
                        data: Tc.Tc1,
                    }
                        // , {
                        //     data: Tc.Tc2,
                        // }, {
                        //     data: Tc.Tc3,
                        // }
                    ]
                });
                myChart3.setOption({
                    series: [{data: Tm.T0,}, {data: Tm.T1,}, {data: Tm.T2,}, {data: Tm.T3,}, {data: Tm.T4,}, {data: Tm.T5,},]
                    // series: [{data: Tm.T0,}, {data: Tm.T1,}, {data: Tm.T2,}, {data: Tm.T3,}, {data: Tm.T4,},
                    //     {data: Tm.T5,}, {data: Tm.T6,}, {data: Tm.T7,}, {data: Tm.T8,}, {data: Tm.T9,},
                    //     {data: Tm.T10,}, {data: Tm.T11,}, {data: Tm.T12,}, {data: Tm.T13,}, {data: Tm.T14,},
                    //     {data: Tm.T15,}, {data: Tm.T16,}, {data: Tm.T17,}, {data: Tm.T18,}, {data: Tm.T19,},]
                });
                myChart4.setOption({
                    series: [{data: Vm.V0,}, {data: Vm.V1,}, {data: Vm.V2,}, {data: Vm.V3,}, {data: Vm.V4,},
                        {data: Vm.V5,}, {data: Vm.V6,}, {data: Vm.V7,}, {data: Vm.V8},]
                    // series: [{data: Vm.V0,}, {data: Vm.V1,}, {data: Vm.V2,}, {data: Vm.V3,}, {data: Vm.V4,},
                    //     {data: Vm.V5,}, {data: Vm.V6,}, {data: Vm.V7,}, {data: Vm.V8,}, {data: Vm.V9,},
                    //     {data: Vm.V10,}, {data: Vm.V11,}, {data: Vm.V12,}, {data: Vm.V13,}, {data: Vm.V14,},
                    //     {data: Vm.V15,}, {data: Vm.V16,}, {data: Vm.V17,}, {data: Vm.V18,}, {data: Vm.V19,},]
                });
            }
        })
        ;
}

function show_brief_info() {
    var box_num = $('#box_num_selected option:selected').val();//选中的值
    var channel_num = $('#channel_num_selected option:selected').val();//选中的值

    if (box_num != undefined && channel_num != undefined)
        $.ajax({
            url: "testline_info/" + box_num + "/" + channel_num + "/",
            type: "get",
            dataType: 'json',
            async: false, //同步执行
            success: get_info_success
        })
}

function get_info_success(data) {
    for (var i in data) {
        var variables = document.getElementById(i + "_val");
        if (variables != null)
            variables.innerText = data[i];
    }
}

function show_testline_status() {
    var box_num = $('#box_num_selected option:selected').val();//选中的值
    var channel_num = $('#channel_num_selected option:selected').val();//选中的值
    if (box_num != undefined && channel_num != undefined)
        $.ajax({
            url: "testline_status/" + box_num + "/" + channel_num + "/",
            type: "get",
            dataType: 'json',
            async: false, //同步执行
            success: get_status_success
        })
}

function get_status_success(data) {
    //console.log(data);
    var status = document.getElementById("testline_status");
    if (data.testline_status == "start") {
        status.setAttribute("class", "label label-success");
        status.innerText = "正在运行";
    }
    else if (data.testline_status == "pause") {
        status.setAttribute("class", "label label-warning");
        status.innerText = "暂停中";
    }
    else if (data.testline_status == "stop") {
        status.setAttribute("class", "label label-danger");
        status.innerText = "已停止";
    }
    else {
        status.setAttribute("class", "label label-default");
        status.innerText = "未知";
    }
}


function get_oven_status() {
    $.ajax({
        url: "oven_status/",
        type: "get",
        dataType: 'json',
        async: false, //同步执行
        success: function (data) {
            data = data.oven;
            var oven_num = data.length;
            if (oven_num != 0) {
                var tb = document.getElementById("oven_status_tablebody");
                create_table_body(tb, oven_num, 5);
                for (var i = 1; i <= oven_num; i++) {
                    insert_into_table(tb, i, 1, data[i - 1].ID);
                    insert_into_table(tb, i, 2, data[i - 1].curr);
                    insert_into_table(tb, i, 3, data[i - 1].next);
                    insert_into_table(tb, i, 4, data[i - 1].T);
                    insert_into_table(tb, i, 5, data[i - 1].PlanID);
                }

            }
        }
    })
}

function get_cells_info() {
    $.ajax({
        url: "cells_info/",
        type: "get",
        dataType: 'json',
        async: false, //同步执行
        success: function (data) {
            data = data.cells;
            var cell_num = data.length;
            if (cell_num != 0) {
                var tb = document.getElementById("device_relation_tablebody");
                create_table_body(tb, cell_num, 13);
                for (var i = 1; i <= cell_num; i++) {
                    insert_into_table(tb, i, 1, data[i - 1].cellID);
                    insert_into_table(tb, i, 2, data[i - 1].boxID);
                    insert_into_table(tb, i, 3, data[i - 1].chnNum);
                    insert_into_table(tb, i, 4, data[i - 1].voltID);
                    insert_into_table(tb, i, 5, data[i - 1].H2ID);
                    insert_into_table(tb, i, 6, data[i - 1].N2ID);
                    insert_into_table(tb, i, 7, data[i - 1].H2OID);
                    insert_into_table(tb, i, 8, data[i - 1].CO2ID);
                    insert_into_table(tb, i, 9, data[i - 1].CH4ID);
                    insert_into_table(tb, i, 10, data[i - 1].AIRID);
                    insert_into_table(tb, i, 11, data[i - 1].wdjID);
                    insert_into_table(tb, i, 12, data[i - 1].oven0ID);
                    insert_into_table(tb, i, 13, data[i - 1].oven1ID);
                    // insert_into_table(tb, i, 14, data[i - 1].oven2ID);
                    // insert_into_table(tb, i, 15, data[i - 1].oven3ID);

                }

            }
        }
    })
}

function get_tests_info() {
    $.ajax({
        url: "tests_info/",
        type: "get",
        dataType: 'json',
        async: false, //同步执行
        success: function (data) {
            data = data.tests;
            var test_num = data.length;
            if (test_num != 0) {
                var tb = document.getElementById("tests_info_tablebody");
                create_table_body(tb, test_num, 17);
                for (var i = 1; i <= test_num; i++) {
                    insert_into_table(tb, i, 1, data[i - 1].BigTestID);
                    insert_into_table(tb, i, 2, data[i - 1].TestID);
                    insert_into_table(tb, i, 3, data[i - 1].CellID);
                    insert_into_table(tb, i, 4, data[i - 1].BoxID);
                    insert_into_table(tb, i, 5, data[i - 1].ChnID);
                    insert_into_table(tb, i, 6, data[i - 1].wdjID);
                    insert_into_table(tb, i, 7, data[i - 1].voltID);
                    insert_into_table(tb, i, 8, data[i - 1].Oven0ID);
                    insert_into_table(tb, i, 9, data[i - 1].Oven1ID);
                    insert_into_table(tb, i, 10, data[i - 1].H2ID);
                    insert_into_table(tb, i, 11, data[i - 1].N2ID);
                    insert_into_table(tb, i, 12, data[i - 1].H2OID);
                    insert_into_table(tb, i, 13, data[i - 1].CO2ID);
                    insert_into_table(tb, i, 14, data[i - 1].CH4ID);
                    insert_into_table(tb, i, 15, data[i - 1].AIRID);
                    insert_into_table(tb, i, 16, data[i - 1].StartTime);
                    insert_into_table(tb, i, 17, data[i - 1].EndTime);
                    // insert_into_table(tb, i, 10, data[i - 1].Oven2ID);
                    // insert_into_table(tb, i, 11, data[i - 1].Oven3ID);
                    // insert_into_table(tb, i, 12, data[i - 1].H2ID);
                    // insert_into_table(tb, i, 13, data[i - 1].N2ID);
                    // insert_into_table(tb, i, 14, data[i - 1].H2OID);
                    // insert_into_table(tb, i, 15, data[i - 1].CO2ID);
                    // insert_into_table(tb, i, 16, data[i - 1].CH4ID);
                    // insert_into_table(tb, i, 17, data[i - 1].AIRID);
                    // insert_into_table(tb, i, 18, data[i - 1].StartTime);
                    // insert_into_table(tb, i, 19, data[i - 1].EndTime);
                }

            }
        }
    })
}