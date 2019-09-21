$(function(){
    var location = window.location.href
    if ( location.indexOf("119.23.76.5") == -1){
        // 站端
        $('.count-data:first').css('display','none')
    }
})
$(document).ready(function(){
    get_initialize();
    map('china')
});
$('#map_return').click(function(){
    // console.log(1)
    map('china')
})
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
    // var t1 = window.setInterval(get_recent_data, 2000)
    get_recent_data()
}

function get_recent_data(){
    
    $.ajax({
        url:'/main/data',
        headers:{"Content-Encoding":"gzip"},
        type:'get',        
        dataType: 'json',
        async:true,
        success:function(data){
            
            if (data =='timeout'){
                alert('不能连接到站端')
                return
            }
            var l_data=[]
            l_data.push(data["substations"])
            l_data.push(data["bays"])
            l_data.push(data["sensors"])
            l_data.push(data["dataitems"])
            l_data.push(data["hours"])
            l_data.push(data["warnings"])
            // console.log(l_data)
            for (var i=0;i<l_data.length;i++){
                $($('.count-data span')[i]).text(l_data[i])
            }
        }
    });
}