
$(function(){ 
    // 设置全局变量, 一共有5个,开始时间, 结束时间, bayid, 数据, 选择的显示界面
    global_bayid = '000000'
    global_data = new Object()
    global_choise = 2  // 选择第几个按钮,默认为1

    global_interval_choise = "1h"
    
    // 修改interval-choise改变interval choise
    $("#interval-choise").change(function(){
        global_interval_choise = $("#interval-choise option:selected").attr('value')
        console.log(global_interval_choise)
    })
    // 通过点击事件来改变global_choise
    var but_list = $('.but_list div')    
    for (let i=0;i<but_list.length;i++){
        $(but_list[i]).click(function(){
            if (global_choise !=i+1){
                global_choise =i+1
                $('.little-title').css('background','#F8F8F8')
                $('.little-title:eq('+i+')') .css('background','#e7e7e7')      
                console.log('.little-title:eq('+i+')')          
                draw_views()
            }            
        })
    }
    
    
    // 3个触发方式都是改全局变量, 并不改变显示,通过global_choise来控制显示
    // 触发方式1
    // 导入日期选择器
    $('#treeview').on('nodeSelected', function (event, data) {
        
        $.cookie('tags',data.tags,{path:'/'})
        if(data.class == "bay"){
            global_bayid=data.tags

            update_his_global_data()
            
        }
    })

    //触发方式2
    // 这里是加载一个时间显示
    $('#date-choise1').flatpickr({
        enableTime:true,
        dateFormat: "Y-m-d H:i",
        defaultDate: (new Date((new Date())-24*3600*1000)).toLocaleString('chinese', { hour12: false }).replace(/\//g,"-"),
        enableSeconds:true,
        time_24hr:true
    })
    $('#date-choise2').flatpickr({
        enableTime:true,
        dateFormat: "Y-m-d H:i",
        defaultDate: (new Date()).toLocaleString('chinese', { hour12: false }).replace(/\//g,"-"),
        enableSeconds:true,
        time_24hr:true
    })
    $('.date-div button').click(function(){
        update_his_global_data()        
    })

    // 触发方式3
    $('#date-choise3').change(datechoise)


    // 通过cookie加载初始数据    
    if ($('#treeview').treeview('getSelected')){
        global_bayid = $('#treeview').treeview('getSelected')[0].tags
        update_his_global_data()
        
    }            
})




function datechoise(){
    // //  常用变量  创建start_time和end_time
    var choise = $("#date-choise3 option:selected").attr('value')
    console.log(choise)
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
    update_his_global_data()
    
}


function update_his_global_data(){
    //  写个元素漂在上面, 控制透明度
    $('#echarts').html('正在加载中...')
    $('#divtable').html('正在加载中...')
    if (typeof update_his_ajax != "undefined"){
        update_his_ajax.abort()
    }
    var a = new Date()
    var MS = a.getMilliseconds()
    console.log(a,MS)
    update_his_ajax = $.ajax({
        url:'update',
        type:'get',        
        headers:{"Content-Encoding":"gzip"},
        async:true,
        datatype:'json',
        data:{start_time:$('#date-choise1').val(),end_time:$('#date-choise2').val(),bayid:global_bayid,interval_choise:global_interval_choise},
        success:function(data){      
            if (data =='timeout'){
                alert('不能连接到站端')
                return
            }
            // console.log(data)
            var a = new Date()
            var MS = a.getMilliseconds()
            global_data = data
            draw_views()
            var a = new Date()
            var MS = a.getMilliseconds()
        }
    })
}

$('#tableToExcel').click(function(){
    var columns=[
        {title: 'ID',field: 'id'},
        {title: 'Pa',field: 'pa'},
        {title: 'Pb',field: 'pb'},
        {title: 'Pc',field: 'pc'},
        {title: 'Pn',field: 'pn'},
        {title: 'Pab',field: 'pab'},
        {title: 'Pbc',field: 'pbc'},
        {title: 'Pac',field: 'pac'},
        {title: 'Pa有效性',field: 'pa_valid'},
        {title: 'Pb有效性',field: 'pb_valid'},
        {title: 'Pc有效性',field: 'pc_valid'},
        {title: 'Pn有效性',field: 'pn_valid'},
        {title: 'Pt有效性',field: 'pt_valid'},
        {title: '温度(℃)',field: 'temperature'},
        {title: '大气压(kPa)',field: 'airpress'},
        {title: 'time',field: 'time'}
    ]
    var row =global_data.rows
    row.reverse()
    tableToExcel(row,columns)
})


function draw_views(){
    if (global_choise == 1){
        $('#body-content').html('<div id="divtable"><table id="histable"> </table></div>')
        var columns=[
            {title: 'ID',field: 'id'},
            {title: 'Pa',field: 'pa'},
            {title: 'Pb',field: 'pb'},
            {title: 'Pc',field: 'pc'},
            {title: 'Pn',field: 'pn'},
            {title: 'Pab',field: 'pab'},
            {title: 'Pbc',field: 'pbc'},
            {title: 'Pac',field: 'pac'},
            {title: 'Pa有效性',field: 'pa_valid'},
            {title: 'Pb有效性',field: 'pb_valid'},
            {title: 'Pc有效性',field: 'pc_valid'},
            {title: 'Pn有效性',field: 'pn_valid'},
            {title: 'Pt有效性',field: 'pt_valid'},
            {title: '温度(℃)',field: 'temperature'},
            {title: '大气压(kPa)',field: 'airpress'},
            {title: 'time',field: 'time'}
        ]
        var row = global_data.rows.concat()
        row.reverse()  // 表格需要反序
        div_table(row,columns,undefined,"#histable",'divtable',50)
        
    }
    else{
        $('#body-content').html('<div class="body-echart"><div id="echarts"></div></div>')

    }
    if (global_choise == 2){
        if (global_data.rows == false){
            $('.body-echart').html("<br>无符合条件的记录")
        }else{
            var x = []
            var y = [
                ["pa",[]],
                ["pb",[]],
                ["pc",[]],
                ["pn",[]],
                ["pab",[]],
                ["pbc",[]],
                ["pac",[]],
                ["温度",[],1],
            ]
            for (i in global_data.rows){
                x.push(global_data.rows[i].time)
                y[0][1].push(global_data.rows[i].pa)
                y[1][1].push(global_data.rows[i].pb)
                y[2][1].push(global_data.rows[i].pc)
                y[3][1].push(global_data.rows[i].pn)
                y[4][1].push(global_data.rows[i].pab)
                y[5][1].push(global_data.rows[i].pbc)
                y[6][1].push(global_data.rows[i].pac)      
                y[7][1].push(global_data.rows[i].temperature)              
            }
            line_chart(x,y)
        }
        
    }
    if (global_choise == 3){
        var x = []
        var y = [
            ["pab",[]],
            ["pbc",[]],
            ["pac",[]],
        ]
        for (i in global_data.rows){
            x.push(global_data.rows[i].time)
            y[0][1].push(global_data.rows[i].pab)
            y[1][1].push(global_data.rows[i].pbc)
            y[2][1].push(global_data.rows[i].pac)                    
        }        
        line_chart(x,y)
    }
    if (global_choise == 4){
        1
    }
}