var myChart = [];
var myChart1 = [];
var myChart2 = [];
var myChart3 = [];
var myChart4 = [];


var intID1;
var intID2;
var intID3;

var I = [[], [], [], []];
var U = [[], [], [], []];
var Q = [{
    Q_H2: [], Q_CH4: [], Q_N2: [], Q_CO2: [], Q_Air: [], Q_H2O: []
}, {
    Q_H2: [], Q_CH4: [], Q_N2: [], Q_CO2: [], Q_Air: [], Q_H2O: []
}, {
    Q_H2: [], Q_CH4: [], Q_N2: [], Q_CO2: [], Q_Air: [], Q_H2O: []
}, {
    Q_H2: [], Q_CH4: [], Q_N2: [], Q_CO2: [], Q_Air: [], Q_H2O: []
}];

var Vm = [{
    V0: [], V1: [], V2: [], V3: [], V4: [], V5: [], V6: [], V7: [], V8: [],
}, {
    V0: [], V1: [], V2: [], V3: [], V4: [], V5: [], V6: [], V7: [], V8: [],
}, {
    V0: [], V1: [], V2: [], V3: [], V4: [], V5: [], V6: [], V7: [], V8: [],
}, {
    V0: [], V1: [], V2: [], V3: [], V4: [], V5: [], V6: [], V7: [], V8: [],
},];

var Tc = [{
    Tc0: [], Tc1: [],
}, {
    Tc0: [], Tc1: [],
}, {
    Tc0: [], Tc1: [],
}, {
    Tc0: [], Tc1: [],
},];

var Tm = [{
    T0: [], T1: [], T2: [], T3: [], T4: [], T5: [],
}, {
    T0: [], T1: [], T2: [], T3: [], T4: [], T5: [],
}, {
    T0: [], T1: [], T2: [], T3: [], T4: [], T5: [],
}, {
    T0: [], T1: [], T2: [], T3: [], T4: [], T5: [],
},];
var refresh = 3000;

function set_interval() {
    // clearInterval(intID1);
    clearInterval(intID2);
    clearInterval(intID3);
    // intID1 = setInterval(get_realtime_data, refresh);
    intID2 = setInterval(show_brief_info, refresh);
    intID3 = setInterval(show_testline_status, refresh);
    alert("设置成功，开始刷新");
}

function stop_refresh() {
    // clearInterval(intID1);
    clearInterval(intID2);
    clearInterval(intID3);
    alert("停止成功");
}

$(document).ready(function () {
        for (var i = 0; i < 4; i++) {
            // myChart[i] = echarts.init(document.getElementById('U_I_t_chart' + i));
            // myChart1[i] = echarts.init(document.getElementById('Q_t_chart' + i));
            // myChart2[i] = echarts.init(document.getElementById('Tc_t_chart' + i));
            // myChart3[i] = echarts.init(document.getElementById('Tm_t_chart' + i));
            // myChart4[i] = echarts.init(document.getElementById('Vm_t_chart' + i));
            get_boxes(i);
            // show_chart(i);
        }
        // window.onresize = function () {
        //     for (var i = 0; i < 4; i++) {
        //         myChart[i].resize();
        //         myChart1[i].resize();
        //         myChart2[i].resize();
        //         myChart3[i].resize();
        //         myChart4[i].resize();
        //     }
        // };
    }
)


var box;

function get_boxes(num) {
    $("#box_num_selected" + num).empty();
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
    var b_num = document.getElementById("box_num_selected" + num);
    if (box.length != 0)
        for (var i = 0; i < box.length; i++) {
            var option = document.createElement("option");
            option.setAttribute("value", box[i].id);
            option.innerText = box[i].id;
            b_num.appendChild(option);
        }
    $("#channel_num_selected" + num).empty();
    if (box.length != 0)
        get_channels(box[0].id, num);
}

function show_channel(num) {
    var bid = $('#box_num_selected' + num + ' option:selected').val();
    get_channels(bid, num);
}

function get_channels(bid, num) {
    $("#channel_num_selected" + num).empty();
    var c_num = document.getElementById("channel_num_selected" + num);
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

function refresh_page() {
    // clearInterval(intID1);
    clearInterval(intID2);
    clearInterval(intID3);
    // show_chart();
    // intID1 = setInterval(get_realtime_data, refresh);
    intID2 = setInterval(show_brief_info, refresh);
    intID3 = setInterval(show_testline_status, refresh);
    alert("成功");
}


function show_chart(num) {
    var box_num = $('#box_num_selected' + num + ' option:selected').val();//选中的值
    var channel_num = $('#channel_num_selected' + num + ' option:selected').val();//选中的值
    if (box_num != undefined && channel_num != undefined)
        $.ajax({
            url: "/monitor/get_testdata_from_start/" + box_num + "/" + channel_num + "/",
            type: "get",
            dataType: 'json',
            async: false, //同步执行
            success: function (data) {
                I[num] = data.I;
                U[num] = data.U;

                Q[num].Q_CO2 = data.Q_CO2;
                Q[num].Q_CH4 = data.Q_CH4;
                Q[num].Q_Air = data.Q_Air;
                Q[num].Q_N2 = data.Q_N2;
                Q[num].Q_H2 = data.Q_H2;
                Q[num].Q_H2O = data.Q_H2O;

                Tm[num].T0 = data.Tm0;
                Tm[num].T1 = data.Tm1;
                Tm[num].T2 = data.Tm2;
                Tm[num].T3 = data.Tm3;
                Tm[num].T4 = data.Tm4;
                Tm[num].T5 = data.Tm5;

                Tc[num].Tc0 = data.Tc0;
                Tc[num].Tc1 = data.Tc1;

                Vm[num].V0 = data.Vm0;
                Vm[num].V1 = data.Vm1;
                Vm[num].V2 = data.Vm2;
                Vm[num].V3 = data.Vm3;
                Vm[num].V4 = data.Vm4;
                Vm[num].V5 = data.Vm5;
                Vm[num].V6 = data.Vm6;
                Vm[num].V7 = data.Vm7;
                Vm[num].V8 = data.Vm8;

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
                        data: U[num],
                        yAxisIndex: 0
                    }, {
                        name: '电流',
                        type: 'line',
                        showSymbol: false,
                        hoverAnimation: false,
                        data: I[num],
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
                        data: Q[num].Q_H2,
                    }, {
                        name: '氮气',
                        type: 'line',
                        showSymbol: false,
                        hoverAnimation: false,
                        data: Q[num].Q_N2,
                    }, {
                        name: '空气',
                        type: 'line',
                        showSymbol: false,
                        hoverAnimation: false,
                        data: Q[num].Q_Air,
                    }, {
                        name: '甲烷',
                        type: 'line',
                        showSymbol: false,
                        hoverAnimation: false,
                        data: Q[num].Q_CH4,
                    }, {
                        name: '二氧化碳',
                        type: 'line',
                        showSymbol: false,
                        hoverAnimation: false,
                        data: Q[num].Q_CO2,
                    }, {
                        name: '水蒸汽',
                        type: 'line',
                        showSymbol: false,
                        hoverAnimation: false,
                        data: Q[num].Q_H2O,
                    }]
                };
                var option_Tc = {
                    legend: {
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
                        data: Tc[num].Tc0,
                    }, {
                        name: '控温点1',
                        type: 'line',
                        showSymbol: false,
                        hoverAnimation: false,
                        data: Tc[num].Tc1,
                    }
                    ]
                };
                var option_Tm = {
                    legend: {
                        type: 'scroll', orient: 'vertical', right: 10, top: 20, bottom: 20,
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
                        name: '测温点0', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm[num].T0,
                    }, {
                        name: '测温点1', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm[num].T1,
                    }, {
                        name: '测温点2', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm[num].T2,
                    }, {
                        name: '测温点3', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm[num].T3,
                    }, {
                        name: '测温点4', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm[num].T4,
                    }, {
                        name: '测温点5', type: 'line', showSymbol: false, hoverAnimation: false, data: Tm[num].T5,
                    },
                    ]
                };
                var option_Vm = {
                    legend: {
                        type: 'scroll', orient: 'vertical', right: 10, top: 20, bottom: 20,
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
                        name: '测压点0', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm[num].V0,
                    }, {
                        name: '测压点1', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm[num].V1,
                    }, {
                        name: '测压点2', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm[num].V2,
                    }, {
                        name: '测压点3', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm[num].V3,
                    }, {
                        name: '测压点4', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm[num].V4,
                    }, {
                        name: '测压点5', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm[num].V5,
                    }, {
                        name: '测压点6', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm[num].V6,
                    }, {
                        name: '测压点7', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm[num].V7,
                    }, {
                        name: '测压点8', type: 'line', showSymbol: false, hoverAnimation: false, data: Vm[num].V8,
                    }
                    ]
                };
                myChart[num].setOption(option_U_I);
                myChart1[num].setOption(option_Q);
                myChart2[num].setOption(option_Tc);
                myChart3[num].setOption(option_Tm);
                myChart4[num].setOption(option_Vm);
            }
        });
}

function get_realtime_data() {
    for (var i = 0; i < 4; i++) {
        var box_num = $('#box_num_selected' + i + ' option:selected').val();//选中的值
        var channel_num = $('#channel_num_selected' + i + ' option:selected').val();//选中的值
        if (box_num != undefined && channel_num != undefined)
            $.ajax({
                url: "/monitor/get_testdata_real_time/" + box_num + "/" + channel_num + "/",
                type: "get",
                dataType: 'json',
                async: false, //同步执行
                success: function (data) {
                    if (data.I != I[i][I[i].length - 1]) I[i].push(data.I);
                    if (data.U != U[i][U[i].length - 1]) U[i].push(data.U);
                    if (data.Q_CO2 != Q[i].Q_CO2[Q[i].Q_CO2.length - 1]) Q[i].Q_CO2.push(data.Q_CO2);
                    if (data.Q_CH4 != Q[i].Q_CH4[Q[i].Q_CH4.length - 1]) Q[i].Q_CH4.push(data.Q_CH4);
                    if (data.Q_Air != Q[i].Q_Air[Q[i].Q_Air.length - 1]) Q[i].Q_Air.push(data.Q_Air);
                    if (data.Q_N2 != Q[i].Q_N2[Q[i].Q_N2.length - 1]) Q[i].Q_N2.push(data.Q_N2);
                    if (data.Q_H2 != Q[i].Q_H2[Q[i].Q_H2.length - 1]) Q[i].Q_H2.push(data.Q_H2);
                    if (data.Q_H2O != Q[i].Q_H2O[Q[i].Q_H2O.length - 1]) Q[i].Q_H2O.push(data.Q_H2O);
                    if (data.Tc0 != Tc[i].Tc0[Tc[i].Tc0.length - 1]) Tc[i].Tc0.push(data.Tc0);
                    if (data.Tc1 != Tc[i].Tc1[Tc[i].Tc1.length - 1]) Tc[i].Tc1.push(data.Tc1);
                    if (data.Tm0 != Tm[i].T0[Tm[i].T0.length - 1]) Tm[i].T0.push(data.Tm0);
                    if (data.Tm1 != Tm[i].T1[Tm[i].T1.length - 1]) Tm[i].T1.push(data.Tm1);
                    if (data.Tm2 != Tm[i].T2[Tm[i].T2.length - 1]) Tm[i].T2.push(data.Tm2);
                    if (data.Tm3 != Tm[i].T3[Tm[i].T3.length - 1]) Tm[i].T3.push(data.Tm3);
                    if (data.Tm4 != Tm[i].T4[Tm[i].T4.length - 1]) Tm[i].T4.push(data.Tm4);
                    if (data.Tm5 != Tm[i].T5[Tm[i].T5.length - 1]) Tm[i].T5.push(data.Tm5);
                    if (data.Vm0 != Vm[i].V0[Vm[i].V0.length - 1]) Vm[i].V0.push(data.Vm0);
                    if (data.Vm1 != Vm[i].V1[Vm[i].V1.length - 1]) Vm[i].V1.push(data.Vm1);
                    if (data.Vm2 != Vm[i].V2[Vm[i].V2.length - 1]) Vm[i].V2.push(data.Vm2);
                    if (data.Vm3 != Vm[i].V3[Vm[i].V3.length - 1]) Vm[i].V3.push(data.Vm3);
                    if (data.Vm4 != Vm[i].V4[Vm[i].V4.length - 1]) Vm[i].V4.push(data.Vm4);
                    if (data.Vm5 != Vm[i].V5[Vm[i].V5.length - 1]) Vm[i].V5.push(data.Vm5);
                    if (data.Vm6 != Vm[i].V6[Vm[i].V6.length - 1]) Vm[i].V6.push(data.Vm6);
                    if (data.Vm7 != Vm[i].V7[Vm[i].V7.length - 1]) Vm[i].V7.push(data.Vm7);
                    if (data.Vm8 != Vm[i].V8[Vm[i].V8.length - 1]) Vm[i].V8.push(data.Vm8);
                    myChart[i].setOption({
                        series: [{
                            data: U[i]
                        }, {
                            data: I[i]
                        }]
                    });
                    myChart1[i].setOption({
                        series: [{
                            data: Q[i].Q_H2, type: 'line'
                        }, {
                            data: Q[i].Q_N2, type: 'line'
                        }, {
                            data: Q[i].Q_Air, type: 'line',
                        }, {
                            data: Q[i].Q_CH4, type: 'line'
                        }, {
                            data: Q[i].Q_CO2, type: 'line'
                        }, {
                            data: Q[i].Q_H2O, type: 'line'
                        }]
                    });
                    myChart2[i].setOption({
                        series: [{
                            data: Tc[i].Tc0,
                        }, {
                            data: Tc[i].Tc1,
                        }
                        ]
                    });
                    myChart3[i].setOption({
                        series: [{data: Tm[i].T0,}, {data: Tm[i].T1,}, {data: Tm[i].T2,}, {data: Tm[i].T3,}, {data: Tm[i].T4,}, {data: Tm[i].T5,},]
                    });
                    myChart4[i].setOption({
                        series: [{data: Vm[i].V0,}, {data: Vm[i].V1,}, {data: Vm[i].V2,}, {data: Vm[i].V3,}, {data: Vm[i].V4,},
                            {data: Vm[i].V5,}, {data: Vm[i].V6,}, {data: Vm[i].V7,}, {data: Vm[i].V8},]
                    });
                }
            });
    }

}

function show_brief_info() {
    for (var j = 0; j < 4; j++) {
        var box_num = $('#box_num_selected' + j + ' option:selected').val();//选中的值
        var channel_num = $('#channel_num_selected' + j + ' option:selected').val();//选中的值
        if (box_num != undefined && channel_num != undefined)
            $.ajax({
                url: "/monitor/testline_info/" + box_num + "/" + channel_num + "/",
                type: "get",
                dataType: 'json',
                async: false, //同步执行
                success: function (data) {
                    for (var i in data) {
                        var variables = document.getElementById(j + i + "_val");
                        if (variables != null)
                            variables.innerText = data[i];
                    }
                }
            });
    }
}

function show_testline_status() {
    for (var j = 0; j < 4; j++) {
        var box_num = $('#box_num_selected' + j + ' option:selected').val();//选中的值
        var channel_num = $('#channel_num_selected' + j + ' option:selected').val();//选中的值
        if (box_num != undefined && channel_num != undefined)
            $.ajax({
                url: "/monitor/testline_status/" + box_num + "/" + channel_num + "/",
                type: "get",
                dataType: 'json',
                async: false, //同步执行
                success: function (data) {
                    var status = document.getElementById("testline_status" + j);
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
            });
    }
}

