// 全局变量, 默认显示主变间隔
global_equipment_type = "T"
$(function(){
    $('#treeview').on('nodeSelected', function (event, data) {    
        $('.right-body').html("")
        $('#tags').attr('value',data.tags)
        $('#classes').attr('value',data.class)
        if (data.class == "sub" || data.class == "con"){    
            // 还是用这个方法: 点击每个button请求一次服务器, 如果button不请求服务器,数据可能是错的,views也不能复用
            global_equipment_type = "T"
            
            // 加载页面
            $.ajax({url:'/algorithm/',type:'get',data:"page=algs",success:function(data){
                
                if (data =='timeout'){
                    alert('不能连接到站端')
                    return
                }
                $('.right-body').append(data)
            }})                
            algorithm(data)
        }        
        $.cookie('tags',data.tags,{path:'/'})      
        if (data.class =="bay"){ 
            global_equipment_type = data.tags[9]
            algorithm(data)
        }
    })

    
    // 通过cookie加载初始数据
    if ($('#treeview').treeview('getSelected')){
        var data = $('#treeview').treeview('getSelected')[0]
        $('#tags').attr('value',data.tags)
        $('#classes').attr('value',data.class)
        // 默认间隔显示内容
        if (data.class == "bay"){
            global_equipment_type = data.tags[9]
        }else{
            global_equipment_type = "T"
            // 加载页面
            $.ajax({url:'/algorithm/',type:'get',data:"page=algs",success:function(data){
                
                if (data =='timeout'){
                    alert('不能连接到站端')
                    return
                }
                $('.right-body').append(data)
            }})     
        }
        
        algorithm(data)
    } 
    

})


function algorithm(data2){        
    $.ajax({
        url:"update",
        headers:{"Content-Encoding":"gzip"},
        type:'get',
        datatype:'json',
        data:{tags:data2.tags,class:data2.class,type:global_equipment_type},
        success:function(data){
            
            if (data =='timeout'){
                alert('不能连接到站端')
                return
            }
            if (data =="nopermission"){
                alert("该账号无此功能权限")
                return
            }
            if (data.class == "bay"){
                var state_data = data.columns[0]
                // 把input元素生成出来
                if(state_data){
                    for (key in state_data){
                        if (key.indexOf('Time')=='-1'){
                            var unit = "(kPa)"
                        }else{var unit = "(min)"}
                        var elem = "<div class='column'><b><span>"+key+"</span>"+unit+"</b><input type='number' onchange='changeValue(this)' value="+state_data[key]+">"+"</div>"
                        $('.right-body').append(elem)
                    }
                    
                }
                var state_data2 = data.columns2[0]

                // 新加的9个state的字段, 都是不能修改的
                // 把input元素生成出来
                if(state_data2){
                    for (key in state_data2){
                        
                        var elem = '<div class="column"><b><span>'+key+'</span>'+'</b><input type="text" readonly="readonly" value="'+state_data2[key]+'"></div>'
                        $('.right-body').append(elem)
                    }
                    
                }

                if (data.algenable[$("#tags").attr('value')]){
                    var checked = "checked"
                }
                var checkbox = '<div class="column">保护状态&nbsp;&nbsp;<input type="checkbox" onclick="return false"'+checked+'></div>'          
                $('.right-body').append(checkbox)
                $('.right-body').append('<div class="body-foot"></div>')
                $('.body-foot').append('<button onclick="alg_save()">设置</button>')
                $('.body-foot').append('<button onclick="alg_enable(1)">启动</button>')
                $('.body-foot').append('<button onclick="alg_enable(0)">停止</button>')  
                $('.body-foot').append('<button onclick="delete_all_data()">清空数据</button>') 
            }
            else{ // 就是变电站或汇集单元
                var state_data = data.columns[0]
                var state_data2 = data.columns2[0]
                // 把表格标题和input元素生成出来, 得到需要列的数组
                if (state_data){
                    var columns =[]
                    var columns2 = []
                    for (key in state_data){
                        columns.push(key)                        
                    }
                    for (key in state_data2){
                        columns2.push(key)                        
                    }
                    // 把 bayid bayname 放到前面去
                    columns.unshift(columns.pop())
                    columns.unshift(columns.pop())
                    $('#algs_table').html('<tr></tr>')
                    var td = "<td>全选<input type ='checkbox' id='checkall'></td>"
                    $('#algs_table tr').append(td)
                    for (i in columns){
                        var td = "<td>"+columns[i]+"</td>"
                        $('#algs_table tr').append(td)
                        // 生成input
                        if (i>1){
                            if (columns[i].indexOf('Time')=='-1'){
                                var unit = "(kPa)"
                            }else{var unit = "(min)"}
                            var input = "<div class='column'><b><span>"+columns[i]+"</span>"+unit+"</b><input type='number'  onchange='changeValue(this)'></div>"
                            $('#algs_input').append(input)
                        }
                    }
                    for (i in columns2){
                        var td = "<td>"+columns2[i]+"</td>"
                        $('#algs_table tr').append(td)
                    }
                    var td = "<td>保护状态</td>"
                    $('#algs_table tr').append(td)
                    // 框架搭好了,把表格生成出来
                    for(i in data.columns){
                        var bayid = data.columns[i].BayID
                        var tr = "<tr id ='"+bayid+"'><td><input type='checkbox'></td><tr>"
                        $('#algs_table').append(tr)
                        for (j in columns){
                            var td ="<td>"+data.columns[i][columns[j]]+"</td>"
                            $("#"+bayid).append(td)                            
                        }
                        for (k in columns2){
                            var td ="<td>"+data.columns2[i][columns2[k]]+"</td>"
                            $("#"+bayid).append(td)   
                        }
                        var checked=""
                        if (data.algenable[data.columns[i].BayID]){checked="checked"}
                        var td ="<td><input type='checkbox' onclick='return false' "+checked+"></td>"
                        $("#"+bayid).append(td)                            

                    }

                    $('#checkall').change(function(){
                        var b = $(this).prop('checked')
                        $('#algs_table :checkbox:odd').prop('checked',b)                        
                    })
                    
                }

            }
        }
    })
}

// 设置 启动 停止增加功能
function alg_save(){
    if (confirm('是否保存现有设置')){
        var tags = $('#tags').attr('value')
        alert(tags)
        var div_list = $('.right-body .column')
        var columns ={}
        for (var i=0;i<div_list.length-10;i++){
            var key = $(div_list[i]).find('span').text()
            if (key){
                var value = Number($(div_list[i]).find('input').attr('value'))
                columns[key]=value
            }
        }
        columns = JSON.stringify(columns)
    
        $.ajax({
            type:'post',
            url:'save',
            data:{csrfmiddlewaretoken:$.cookie('csrftoken'),columns:columns,class:"bay",tags:tags},
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
function alg_enable(enable){
    var confirm_str = "停止"
    if(enable){
        confirm_str = "启动"
    }
    // 判断该间隔启动状态,如果和修改的一样, 就不必修改,弹出提示框
    var checked = Boolean($('.column :checkbox').attr('checked'))
    if (checked && enable){
        alert('操作失败, 请先停止再启动')
    }else if (!checked && !enable){
        alert('操作失败, 未启动, 不需要停止')
    }else{
        // 说明操作正确, 确认后修改是否启动
        if (confirm("确认"+confirm_str)){
            var tags = $('#tags').attr('value')
            $.ajax({
                type:'get',
                url:'enable',
                data:{enable:enable,class:"bay",tags:tags},
                success:function(data){
                    if (data =='timeout'){
                        alert('不能连接到站端')
                        return
                    }
                    alert(data)
                    console.log($('.column [type="checkbox"]'))
                    $('.column [type="checkbox"]').attr('checked',Boolean(enable))
                }
            })
        }
    }

}

function algs_save(){
    //获取选择了哪些间隔
    var tagses = []
    var checkboxes = $('#algs_table :checkbox:odd')
    for(var i=0;i<checkboxes.length;i++){
        if ($(checkboxes[i]).prop('checked')){
            tagses.push($(checkboxes[i]).parent().parent().attr('id'))
        }
    }
    // 获取所有input, 前端来控制提交数据,尽量少提交数据到后端
    // 获取到了所有选中的间隔, 
    var columns={}
    var input_list = $('#algs_input div')
    for (var i=0;i<input_list.length;i++){
        // 值不为空
        var value = $(input_list[i]).find('input').attr('value')
        console.log(value)
        if (value){
            var key = $(input_list[i]).find('span').text()
            columns[key]=value
        }
    }
    // 发到后端
    tagses = JSON.stringify(tagses)
    columns = JSON.stringify(columns)
    $.ajax({
        type:'post',
        url:'save',
        headers:{"Content-Encoding":"gzip"},
        data:{csrfmiddlewaretoken:$.cookie('csrftoken'),columns:columns,class:"con",con_id:$("#tags").attr('value'),tags:tagses},
        success:function(data){
            if (data =='timeout'){
                alert('不能连接到站端')
                return
            }
            var data2 = {tags:$('#tags').attr('value'),class:$('#classes').attr('value')}
            $('#algs_table').html('')
            $('#algs_input').html('')
            algorithm(data2)
        }
    })

}
function algs_enable(enable){
    //获取选择了哪些间隔
    var tagses = []
    var checkboxes = $('#algs_table :checkbox:odd')
    for(var i=0;i<checkboxes.length;i++){
        if ($(checkboxes[i]).prop('checked')){
            tagses.push($(checkboxes[i]).parent().parent().attr('id'))
        }
    }
    tagses = JSON.stringify(tagses)
    $.ajax({
        type:'get',
        url:'enable',
        headers:{"Content-Encoding":"gzip"},
        // async:false,
        data:{enable:enable,class:'notbay',tags:tagses},
        success:function(data){
            if (data =='timeout'){
                alert('不能连接到站端')
                return
            }
            alert(data)
            var data2 = {tags:$('#tags').attr('value'),class:$('#classes').attr('value')}
            $('#algs_table').html('')
            $('#algs_input').html('')
            algorithm(data2)
        }
    })
}

function changeValue(obj){
    $(obj).attr("value",$(obj).val());
}

function change_visable(){
    if (typeof change_number == "undefined") { 
        change_number = 0
    } 
    if (change_number % 2){
        $('.algs_input').css('visibility','hidden')
    }else{  
        $('.algs_input').css('visibility','visible')
    }
    change_number += 1
}

// 给sub 的两个按钮增加点击事件
function but(algenable_type){  
    global_equipment_type = algenable_type    
    var data = {tags:$('#tags').attr('value'),class:$('#classes').attr('value')}
    $('#algs_table').html('')
    $('#algs_input').html('')
    algorithm(data)
}


function delete_all_data(bayid){
    if (confirm("警告: 是否清空该间隔下所有历史数据?")){
        $.ajax({
            type:'post',
            url:'/main/delete',
            headers:{"Content-Encoding":"gzip"},
            data:{csrfmiddlewaretoken:$.cookie('csrftoken'),bayid:$('#tags').attr('value')},
            success:function(data){
                if (data =='timeout'){
                    alert('不能连接到站端')
                    return
                }
                alert(data)
                $('.column [type="checkbox"]').attr('checked',false)
            }
        })
    }
}