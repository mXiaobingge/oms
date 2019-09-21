$(document).ready(function(){

get_initialize();

});

function Datetime(){
     //默认获取当前日期
    var today = new Date();
    var yesterday = new Date(new Date()-24*60*60*1000);
    this.nowdate = (today.getFullYear()) + "-" + (today.getMonth() + 1) + "-" + today.getDate();
    this.nowmonth = (today.getFullYear()) + "-" + (today.getMonth() + 1);

    function getdatetext(date){ // 定义一个方法 getdatetext()
        var mon = date.getMonth() + 1;
        var day = date.getDate();
        return date.getFullYear() + "-" + (mon < 10 ? "0" + mon : mon) + "-" + (day < 10 ? "0" + day : day);
    }

    //对日期格式进行处理
    this.todaydatetext = getdatetext(today);
    this.todaymonthtext = today.getFullYear() + "-" + ((today.getMonth() + 1) < 10 ? "0" + (today.getMonth() + 1) : (today.getMonth() + 1));
    this.yesterdaydatetext = getdatetext(yesterday);    
}

function get_initialize() {
    date_time = new Datetime();
    var t1 = window.setInterval(get_recent_data, 2000)
}

function get_recent_data(){
    var seriesdata = [];
    var chartsdata = [];
    var obj = new Object()
    obj.sid =$('#sid').text();
    dataurl = $.param(obj);
    var result;
    $.ajax({
        url:'/main/data',
        type:'get',
        dataType: 'json',
        async:false,
        success:function (data) {
            result = data;
        }
    });
    
    console.log("567898765678")
    console.log(result)
    
    document.getElementById("main_substations").innerHTML = result["substations"];
    document.getElementById("main_bays").innerHTML = result["bays"];
    document.getElementById("main_sensors").innerHTML = result["sensors"];
    document.getElementById("main_dataitems").innerHTML = result["dataitems"];
    document.getElementById("main_hours").innerHTML = result["hours"];
    document.getElementById("main_warnings").innerHTML = result["warnings"];
           
    return result   
}