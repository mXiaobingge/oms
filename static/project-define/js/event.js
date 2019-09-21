$(function(){
    
    // 通过时间选择器触发事件
    // 1 自由选择时间
    //改变时间显示
    $('#time_confirm').click(function(){
        event_main()
    })
    $('#date-choise1').flatpickr({
        enableTime:true,
        dateFormat: "Y-m-d H:i",
        defaultDate: (new Date((new Date())-24*7*3600*1000)).toLocaleString('chinese', { hour12: false }).replace(/\//g,"-"),
        enableSeconds:true,
        time_24hr:true
    })
    $('#date-choise2').flatpickr({
        enableTime:true,
        dateFormat: "Y-m-d H:i",
        defaultDate: (new Date()).toLocaleString('chinese', { hour12: false }).replace(/\//g,"-") ,
        enableSeconds:true,
        time_24hr:true
    })

    $('#treeview').on('nodeSelected', function (event, data) {
        $.cookie('tags',data.tags,{path:'/'})
        chosied_tree(data)
        if (data.class =="bay" || data.class =="con"){
            c = data.class
            tags = data.tags
            // 设置起始时间是一周前, 到现在的所有数据  
            event_main(data)            
        }
    })

    // 通过cookie加载初始数据
    if ($('#treeview').treeview('getSelected')){
        var data = $('#treeview').treeview('getSelected')[0]
        chosied_tree(data)
        c = data.class
        tags = data.tags
        event_main(data)
    }


    // 选择最近一周
    $('#date-choise3').change(datechoise)


    // 上传数据
    var fileInput = document.getElementById('upload')
    fileInput.addEventListener('change', function () {
        var filename = fileInput.value.replace('C:\\fakepath\\',''); // 'C:\fakepath\test.png'
        if (!filename || !filename.endsWith('.xml')) {
            alert('只能上传 .xml 文件.');
            return false;
        }
        var file = fileInput.files[0]
        var reader = new FileReader()
        var psw = prompt('上传xml文件请输入管理员密码:')
        if (!psw){
            alert('没有上传文件')
            return 
        }
        reader.onload = function(e){
            var data = e.target.result
            $.ajax({
                url:'/file/upload',
                type:'post',
                async:false,
                data:{csrfmiddlewaretoken:getCookie('csrftoken'),file:data,filename:filename,psw:psw},
                success:function(data2){
                    
                    if (data2 =='timeout'){
                        alert('不能连接到站端')
                        return
                    }
                    if (!data2){
                        alert('没有上传文件')
                        return
                    }
                    if (data2.split(' ')[1]){ // 文件名全名
                        var filename2 = data2.split(' ')[1]
                        $.ajax({
                            url:'/file/excute',
                            type:'post',
                            async:false,
                            data:{csrfmiddlewaretoken:getCookie('csrftoken'),filename:filename2},
                            success:function(data){
                                
                                if (data =='timeout'){
                                    alert('不能连接到站端')
                                    return
                                }
                                alert(data)
                            }
                        })
                    }
                }
            })
        }        
        reader.readAsDataURL(file);

    })

})


function datechoise(){
    // //  常用变量  创建start_time和end_time
    var choise = $("#date-choise3 option:selected").attr('value')
    $('#date-choise2').val(((new Date())).toLocaleString('chinese', { hour12: false }).replace(/\//g,"-"))
    if (choise == "day"){
        $('#date-choise1').val((new Date((new Date())-24*3600*1000)).toLocaleString('chinese', { hour12: false }).replace(/\//g,"-"))
    } else if (choise == "week"){
        $('#date-choise1').val((new Date((new Date())-7*24*3600*1000)).toLocaleString('chinese', { hour12: false }).replace(/\//g,"-"))
    } else if (choise == "month"){
        var monthdate=(new Date())
        monthdate.setMonth(monthdate.getMonth()-1)
        $('#date-choise1').val(monthdate.toLocaleString('chinese', { hour12: false }).replace(/\//g,"-"))
    } 

    //改变时间显示
    $('#time_confirm').click(function(){
        event_main()
    })
    event_main()
}
// 表格导出按钮
$('#tableToExcel').click(function(){
    var columns=[
        {title:'id',field:'id'},
        {title:'报警时间',field:'time'},
        {title:'告警类型',field:'WarningType'},
        {title:'告警内容',field:'WarningName'},
        {title:'行为',field:'Action'},
        {title:'间隔',field:'BayName'},
        {title:'汇集单元',field:'ConcentratorName'},
        {title:'相别',field:'PhaseName'},
    ]
    var row =global_data.logs
    tableToExcel(row,columns)
})



function event_main(){    
    // 停止定时器
    if (typeof update_event_data != "undefined") {                        
        clearInterval(update_event_data);
        delete update_event_data
    } 
    $('#body1').html('正在加载中...')
    if (typeof event_main_ajax != "undefined"){
        event_main_ajax.abort()
    }
    event_main_ajax = $.ajax({
        url:'update',
        headers:{"Content-Encoding":"gzip"},
        data:{class:c,tags:tags,start_time:$('#date-choise1').val(),end_time:$('#date-choise2').val()},
        datatype:'json',
        async:true,
        success:function(data2){
            
            if (data2 =='timeout'){
                alert('不能连接到站端')
                return
            }
            $('#body1').html('<table id="eventtable"></table>')
            var column=[
                {title:'id',field:'id'},
                {title:'报警时间',field:'time'},
                {title:'告警类型',field:'WarningType'},
                {title:'告警内容',field:'WarningName'},
                {title:'行为',field:'Action'},
                {title:'间隔',field:'BayName'},
                {title:'汇集单元',field:'ConcentratorName'},
                {title:'相别',field:'PhaseName'},
            ]
            global_data = data2
            div_table(data2.logs,column,undefined,'#eventtable','body1',50)

            update_event_data = setInterval(function(){setinterval_event(c,tags)},30000)
        }
    })
}

function setinterval_event(c,tags){
    var setinterval_start_time = (new Date((new Date())-30000)).toLocaleString('chinese', { hour12: false }).replace(/\//g,"-")
    var setinterval_end_time = (new Date()).toLocaleString('chinese', { hour12: false }).replace(/\//g,"-")
    if (typeof event_setinterval_ajax != "undefined"){
        event_setinterval_ajax.abort()
    }
    event_setinterval_ajax =$.ajax({
        url:'update',
        headers:{"Content-Encoding":"gzip"},
        data:{class:c,tags:tags,start_time:setinterval_start_time,end_time:setinterval_end_time},
        datatype:'json',
        async:true,
        success:function(data){
            
            if (data =='timeout'){
                alert('不能连接到站端')
                return
            }
            // 如果查出来不是0, 说明有新的logs
            var x = data.logs.length
            var y = global_data.logs.length
            if (x){
                for( i in data.logs){
                    data.logs[i].id += y
                }
                global_data.logs = data.logs.concat(global_data.logs)
                var column=[
                    {title:'id',field:'id'},
                    {title:'报警时间',field:'time'},
                    {title:'告警类型',field:'WarningType'},
                    {title:'告警内容',field:'WarningName'},
                    {title:'行为',field:'Action'},
                    {title:'间隔',field:'BayName'},
                    {title:'汇集单元',field:'ConcentratorName'},
                    {title:'相别',field:'PhaseName'},
                ]
                div_table(global_data.logs,column,undefined,'#eventtable','body1',50)
            }
        }
    })
}