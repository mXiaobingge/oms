$(function(){
    $('#treeview').on('nodeSelected', function (event, data) {    
        $.cookie('tags',data.tags,{path:'/'})
        chosied_tree(data)
        globalData = data
        if (data.class =="bay"){ 
            equipment(data)
        }
        else if (data.class == "sub" || data.class == "con"){            
            if (typeof update_equipment_data != "undefined") {                        
                equipment(data)
            }   

        }
    })


    // 通过cookie加载初始数据
    if ($('#treeview').treeview('getSelected')){
        var data = $('#treeview').treeview('getSelected')[0]
        chosied_tree(data)
        // 把data做成全局变量
        globalData = data
        equipment(data)
    }            
})

// 表格导出按钮
$('#tableToExcel').click(function(){
    var columns=[
        {field: 'substation_name',title: '变电站名称'},
        {field: 'bay_name',title: '间隔名称'},
        {field: 'phase_name',title: '相别'},
        {field: 'sensor_code_id',title: '传感器序列号ID'},// phase_id+SensorVersionNo
        {field: 'communication_interface',title:'通信接口'}, //波特率, 数据位, 校验位, 停止位title: '通信接口'},
        {field: 'sensor_scale', title: '量程'},
        {field: 'sensor_connect_state', title: '连接状态'},
        {field: 'last_connect_time', title: '最后更新时间'},
        {field: 'sensor_realtime_data', title: '实时数据'}
    ]
    var row = global_table_data.rows
    tableToExcel(row,columns)
})

// 删除所有数据按钮
$('#deleteAllData').click(function(){
    var tags = globalData.tags
    var cls =  globalData.class
    var psw = prompt('确认删除   '+globalData.text+"   的所有动态数据,请输入管理员密码:")
    if (psw){
        $.ajax({
            url:'delete',
            data:{class:cls,tags:tags,csrfmiddlewaretoken:$.cookie('csrftoken'),psw:psw},
            type:'post',
            success:function(data2){
                
                if (data2 =='timeout'){
                    alert('不能连接到站端')
                    return
                }
                console.log(data2)
                if (!data2){
                    alert('没有执行删除')
                }
            }
                
        })
    }else{
        alert('没有执行删除')
    }
})

// 主函数
function equipment(data){           
    if (typeof update_equipment_data != "undefined") {                        
        clearInterval(update_equipment_data);
        delete update_equipment_data
    }   
    $.ajax({
        url:"update",
        headers:{"Content-Encoding":"gzip"},
        type:'get',
        datatype:'json',
        data:{bayid:data.tags,class:data.class},
        success:function(data){
            
            if (data =='timeout'){
                alert('不能连接到站端')
                return
            }
            var column =[
                {field: 'substation_name',title: '变电站名称'},
                {field: 'bay_name',title: '间隔名称'},
                {field: 'phase_name',title: '相别'},
                {field: 'sensor_code_id',title: '传感器序列号ID'},// phase_id+SensorVersionNo
                {field: 'communication_interface',title:'通信接口'}, //波特率, 数据位, 校验位, 停止位title: '通信接口'},
                {field: 'sensor_scale', title: '量程'},
                {field: 'sensor_connect_state', title: '连接状态'},
                {field: 'last_connect_time', title: '最后更新时间'},
                {field: 'sensor_realtime_data', title: '实时数据'}
            ]
            global_table_data = data
            div_table(data.rows,column,undefined,"#equipmenttable",'divtable',50)
        }
    })
    update_equipment_data = setInterval(function(){
        $.ajax({
            url:"update",
            headers:{"Content-Encoding":"gzip"},
            type:'get',
            datatype:'json',
            data:{bayid:data.tags,class:data.class},
            success:function(data){
                
                if (data =='timeout'){
                    alert('不能连接到站端')
                    return
                }
                var column =[
                    {field: 'substation_name',title: '变电站名称'},
                    {field: 'bay_name',title: '间隔名称'},
                    {field: 'phase_name',title: '相别'},
                    {field: 'sensor_code_id',title: '传感器序列号ID'},// phase_id+SensorVersionNo
                    {field: 'sensor_protocol',title: '传感器型号'},
                    {field: 'communication_interface',title:'通信接口'}, //波特率, 数据位, 校验位, 停止位title: '通信接口'},
                    {field: 'sensor_scale', title: '量程'},
                    {field: 'sensor_connect_state', title: '连接状态'},
                    {field: 'last_connect_time', title: '最后更新时间'},
                    {field: 'sensor_realtime_data', title: '实时数据'}
                ]
                div_table(data.rows,column,undefined,"#equipmenttable",'divtable',50)
            }
        })
    },60000*30)  // 30分钟更新一次实时数据    
}