
$(function () {
    pageInitModule.setWidth();
    pageInitModule.setSidebar();
    pageInitModule.setCarousel();
})
$(window).resize(function () {
    pageInitModule.setWidth();
})
$(window).scroll(function () {
    pageInitModule.setScrollToTop();
});

/*
* init page when page load
*/
var pageInitModule = (function (mod) {
    mod.setCarousel = function () {
        try {
            $('.carousel').hammer().on('swipeleft', function () {
                $(this).carousel('next');
            });
            $('.carousel').hammer().on('swiperight', function () {
                $(this).carousel('prev');
            });
        } catch (e) {
            // console.log("you mush import hammer.js and jquery.hammer.js to let the carousel can be touched on mobile");
        }
    };
    mod.setWidth = function () {
        if ($(window).width() < 768) {
            $(".sidebar").css({ left: -220 });
            $(".all").css({ marginLeft: 0 });
        } else {
            $(".sidebar").css({ left: 0 });
            $(".all").css({ marginLeft: 220 });
        }
    };
    mod.setScrollToTop = function () {
        var top = $(window).scrollTop();
        if (top < 60) {
            $('#goTop').hide();
        } else {
            $('#goTop').show();
        }
    };
    mod.setSidebar = function () {
        $('[data-target="sidebar"]').click(function () {
            var asideleft = $(".sidebar").offset().left;
            if (asideleft == 0) {
                $(".sidebar").animate({ left: -220 });
                $(".all").animate({ marginLeft: 0 });
            }
            else {
                $(".sidebar").animate({ left: 0 });
                $(".all").animate({ marginLeft: 220 });
            }
        });
        $(".has-sub>a").click(function () {
            $(this).parent().siblings().find(".sub-menu").slideUp();
            $(this).parent().find(".sub-menu").slideToggle();
        })
        var _strcurrenturl = window.location.href.toLowerCase();
        $(".navbar-nav a[href],.sidebar a[href]").each(function () {
            var href = $(this).attr("href").toLowerCase();
            var isActive = false;
            $(".breadcrumb>li a[href]").each(function (index) {
                if (href == $(this).attr("href").toLowerCase()) {
                    isActive = true;
                    return false;
                }
            })
            if (_strcurrenturl.indexOf(href) > -1 || isActive) {
                $(this).parent().addClass("active");
                if ($(this).parents("ul").attr("class") == "sub-menu") {
                    $(this).parents("ul").slideDown();
                    $(this).parents(".has-sub").addClass("active");
                }
            }
        })
    }
    return mod;
})(window.pageInitModule || {});


// x是时间列表, y是一个列表,每个元素代表一条线,每条线也是列表,长度与x相同,
// 用这一个函数解决这次画折线图的问题
function line_chart(x,y,echarts_id = "echarts"){
    
    var myChart = echarts.init(document.getElementById(echarts_id));
    //说明宽度不对, 要重新载入
    window.onresize=function(){ 
        if (window.location.href.indexOf('realtime') != -1){
            $('.right-body').css('height',window.innerHeight-100)   
        }
        myChart.resize()
    }
    var l_legend = []
    var l_series = []
    for (var i=0;i<y.length;i++){
        // 把每个线条名加进l_lengend列表
        var line_name = y[i][0]  //每个对象的key名
        l_legend.push(line_name) 
        var yIndex = 0
        if (y[i][2] != undefined){
            yIndex = y[i][2]
        }
        // var z = []
        // for (aa in x){
        //     z.push([x[aa],y[i][1][aa]])
        // }
        // 重写series ,series 每个元素是个对象:
        var serie = {
            name:line_name,
            type:'line',
            // type:'scatter',
            // data: z,  //是每个条线的值
            data:y[i][1],
            markPoint: {
                data: [
                    // {type: 'max', name: '最大值'},
                    // {type: 'min', name: '最小值'}
                ]
            },
            yAxisIndex:yIndex,
            markLine: {
                data: [
                    // {type: 'average', name: '平均值'}
                ]
            }
        }
        l_series.push(serie)

    }

    //

    option = {
        title: {
            // text: '未来一周气温变化',
            // subtext: '纯属虚构'
        },
        grid:{
            // x:15,
            // y:7,
            left:80,
            bottom:30,
            top:45,
            right:60,
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data:l_legend
        },
        toolbox: {
            show: true,
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                dataView: {readOnly: false},
                magicType: {type: ['line', 'bar']},
                restore: {},
                saveAsImage: {}
            }
        },
        xAxis:  {
            // type: 'time',
            type:'category',
            boundaryGap: false,
            data:x,
        },
        yAxis: [{
            scale:true,
            type: 'value',
            axisLabel: {
                formatter: '{value} kPa',
            },
            // show:false,
            // min:30,
            splitNumber:7, //把坐标轴分成多少段
            
        },{
            scale:true,
            type: 'value',
            axisLabel: {
                formatter: '{value} ℃',
            },
            // show:false,
            // min:30,
            splitNumber:7, //把坐标轴分成多少段
            
        },],
        series:l_series,
    };
    
    myChart.setOption(option,true);
    return myChart
} 

// 这个函数用来生成table表

function div_table(data,columns,success,table_id="#testtable",div_id="divtable",pageSize=10){
    $(table_id).bootstrapTable('destroy');
    var table = $(table_id).bootstrapTable({
        // url: 'https://examples.wenzhixin.net.cn/examples/bootstrap_table/data',         //请求后台的URL（*）
        data:data,                  
        cache: false,                       //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        pagination: true,                   //是否显示分页（*）
        sortable: true,                     //是否启用排序
        sortOrder: "asc",                   //排序方式
        sidePagination: "client",           //分页方式：client客户端分页，server服务端分页（*）                
        pageNumber: 1,                      //初始化加载第一页，默认第一页
        pageSize: pageSize,                       //每页的记录行数（*）
        pageList: [10, 20, 50, 100],        //可供选择的每页的行数（*）            
        contentType: "application/json",
        clickToSelect: true,                //是否启用点击选中行
        classes: "table table-bordered table-striped",
        height: document.getElementById(div_id).offsetHeight,
        // height:
        columns:columns,
        formatLoadingMessage: function () {
            return "请稍等，正在加载中...";
        },
        formatNoMatches: function () {  //没有匹配的结果
            return '无符合条件的记录';
        },
        formatShowingRows: function (pageFrom, pageTo, totalRows) {
            return "共" + totalRows + "条数据";
        },
        formatRecordsPerPage: function (pageNumber) {
            return "每页" + pageNumber + "条";
        },
        onLoadSuccess:success,
        onLoadError: function (data) {
            console.log('tableerror')
            $(table_id).bootstrapTable('removeAll');
        },
        onClickRow: function (row) {                   
        },
    });
}
// 用这个函数导出表格
function tableToExcel(row,columns){    
    var a = document.createElement('a')
    var txt = ""
    // 表头
    for (i in columns){
        txt = txt +columns[i].title+','
    }
    txt = txt +'\n'
    // 表内容
    for(r in row){
        // [{"substation_name": "220kV\u4ee3\u5e02\u53d8\u7535
        for (i in columns){
            txt = txt + row[r][columns[i].field] +","
        }
        txt = txt +'\n'
    }
    var t = new Blob([txt], {type : 'application/csv'});
    a.href=URL.createObjectURL(t)
    var name = prompt('请输入导出的表格名字')
    if (name == null){
        return 
    }
    if (!name){
        name = "佳信表格"
    }
    a.download=name+'.csv';

    a.click();
}


// 用这个函数生成map ,全国map的代码放过来,方便解决省
function map(city="china"){
    // city = "四川"
    if (typeof map_ajax != "undefined"){
        map_ajax.abort()
    }
    map_ajax = $.ajax({
        type:"get",
        url:"/main/map",
        headers:{"Content-Encoding":"gzip"},
        data:{"city":city},
        datatype:"json",
        success:function(data){
            // console.log(data)
            create_map(city,data,'echart_map')

        }
    })
    
}


// 这个函数用来生成全国各省份变电站统计图
function create_map(city,data,echarts_id="echart_map"){
    var legend_data = []
    var series = []

    for (var i=0;i<data.value.length;i++){
        legend_data.push(data.name[i])
        series.push(
            {
                name: data.name[i],
                type: 'map',
                mapType: city,
                roam: false,
                label: {
                    normal: {
                        show: false
                    },
                    emphasis: {
                        show: true
                    }
                },
                data:data.value[i],
            }
        )
    }
    var option = {
        // title : {  // 图名
        //     text: '已装监测设备变电站统计',
        //     subtext: '数据纯属虚构,测试用',
        //     left: 'center'
        // },
        tooltip : {  
            trigger: 'item',
            formatter: function(params) {
                        var res = params.name+'<br/>';
                        var myseries = option.series;
                        document.getElementById('choise_pro').value = params.name
                        for (var i = 0; i < myseries.length; i++) {
                            for(var j=0;j<myseries[i].data.length;j++){
                                if(myseries[i].data[j].name==params.name){
                                    res+=myseries[i].name +' : '+myseries[i].data[j].value+'</br>';
                                    //因为我绑的是span ,我点不到这个span, 所以没触发                                
                                }
                            }
                        }
                        // alert(1)
                        
                        return res;
                    }
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data:legend_data
        },
        visualMap: {
            min: 0,
            max: 20,
            left: 'left',
            top: 'bottom',
            text:['高','低'],           // 文本，默认为数值文本
            calculable : true,
            color: ['#2C4755', '#ffffff']  
        },
        toolbox: {
            show: true,
            orient : 'vertical',
            left: 'right',
            top: 'center',
            feature : {
                mark : {show: true},
                // dataView : {show: true, readOnly: false},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        geo:{
            layoutCenter: ['50%', '50%'],
            layoutSize: 300
        },
        series :series,
    };


    //初始化echarts实例
    var myChart = echarts.init(document.getElementById(echarts_id));
    
    //使用制定的配置项和数据显示图表
    myChart.setOption(option,true);

    myChart.on('click',function(params){
        var pro = document.getElementById('choise_pro').value
        var pro_list = {
            四川:'sichuan',
            广东:'guangdong',
            云南:'yunnan',
            黑龙江:'heilongjiang',
            上海:'shanghai',
            内蒙古:'neimenggu',
            吉林:'jilin',
            新疆:'xinjiang',
            辽宁:'liaoning',
            河北:'hebei',
            山西:'shanxi1',
            陕西:'shanxi',
            宁夏:'ningxia',
            甘肃:'gansu',
            青海:'qinghai',
            北京:'beijing',
            天津:'tianjin',
            山东:'shandong',
            河南:'henan',
            西藏:'xizang',
            重庆:'chongqing',
            湖北:'hubei',
            安徽:'anhui',
            江苏:'jiangsu',
            浙江:'zhejiang',
            福建:'fujian',
            江西:'jiangxi',
            湖南:'hunan',
            贵州:'guizhou',
            云南:'yunnan',
            广西:'guangxi',
            广东:'guangdong',
            台湾:'taiwan',
            海南:'hainan',
            澳门:'aomen',
            香港:'xianggang',

        }
        if (pro_list[pro]){
            
            var pro_script = "/static/echarts/map/city/" +pro_list[pro] + ".js"
            jQuery.getScript(pro_script).done(function(){
                map(pro)
            })
        }
    })
}


// 获取cookie
function getCookie(name){
    var arrcookie = document.cookie.split("; ")
    for ( var i = 0; i < arrcookie.length; i++) {
        var arr = arrcookie[i].split("=");
        if (arr[0] == name){
            return arr[1];
        }
    }
    return "";
}

// 修改choised_tree 的字符串
function chosied_tree(data){
    $('#choised_tree').text(data.text)
    $('#hidden_tag').val(data.tags)
}