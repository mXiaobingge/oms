// global_interval_choise = '10m'
warningtype = {
    "S100":"瞬时电热故障",
    "S200":"瞬时严重电热故障",
    "H100":"缓慢电热故障" ,
    "H200":"缓慢泄漏故障",
    "J100":"绝压严重告警",
    "J200":"绝压一般告警",
}
$(function(){   
    clear_setinterval() 
    $('#treeview').on('nodeSelected', function (event, data) {
        $.cookie('tags',data.tags,{path:'/'})
        chosied_tree(data)           
        clear_setinterval()
        realtime(data)
    }) 
    

    // 通过cookie加载初始数据
    if ($('#treeview').treeview('getSelected')){
        
        var data = $('#treeview').treeview('getSelected')[0]
        chosied_tree(data)
        realtime(data)
    }            
})

function realtime(data){
    if (data.class != "bay"){
        $('.right-body').html('<div class="body-main"></div>')
    }
    if (data.class == "sub"){ // || data.class == "con"){
        load_sub(data.tags)
    } else if (data.class == "con"){
        $.ajax({
            url:'conhtml',
            async:false,
            datatype:'text',
            success:function(data){
                if (data =='timeout'){
                    alert('不能连接到站端')
                    return
                }
                $('.right-body').html(data)
            }
        })

        
        if (typeof load_con_ajax !="undefined"){        
            load_con_ajax.abort()
        }
        $('#echarts').html("<br>正在加载中...")
        load_con_ajax = $.ajax({
            url:"con",
            headers:{"Content-Encoding":"gzip"},
            async:true,
            data:{"tags":data.tags},
            datatype:'json',
            success:function(data2){
                
                if (data2 =='timeout'){
                    alert('不能连接到站端')
                    return
                }
                if (data2.time){
                    var x = data2.time
                    var y = [['温度',data2.temperature,1],['大气压',data2.airpress]]
                    line_chart(x,y,'con_echarts')
                
                    // 把实时数据做出来
                    var span_list = $('.con_first span')                    
                    span_list[0].innerText=data2.temperature[data2.temperature.length-1]
                    // console.log(span_list[0].innerText)
                    // console.log(data2.temperature[data2.temperature.length-1])
                    span_list[1].innerText=data2.airpress[data2.airpress.length-1]


                    // 开始更新数据,10秒一次 
                    if (typeof update_con_data != "undefined") {                        
                        clearInterval(update_con_data);
                        delete update_con_data
                    }
                    update_con_data = setInterval(function(){setinterval_con(data.tags,x,y)} ,10000)
                }else{
                    $("#con_echarts").html('<br>没有采集到最近一天的温度变化')
                }
            }
        
        })

    } else if (data.class == "bay"){                  
        load_bay(data.tags)
    } else if (data.class == "city"){
        $('.right-body').html('<div class="body-main"><img></div>')
        // 当选择为市公司时:
        var background_image = "/static/project-define/img/substation2.jpg"
        $('.body-main img').attr('src',background_image) 
        var city_div = "<div class='city_div' style = 'position:absolute'></div>"
        $(".body-main").append(city_div)
        if (typeof update_city_ajax != "undefined"){
            update_city_ajax.abort()
        }
        update_city_ajax = $.ajax({
            url:"city",
            data:{"tags":data.tags},
            async:false,
            success:function(data2){       
                
                if (data2 =='timeout'){
                    alert('不能连接到站端')
                    return
                }
                for (var i=0;i<data2.length;i++){
                    //每个sub是一个div块
                    var sub = data2[i]                    
                    var sub_div ="<div class='sub_div' id='"+sub.id+"'"+" onclick=load_sub('"+sub.id+"')"+
                    "><div class='sub-row'><div class='sub-font'>"+sub.name+"</div></div>"+
                    // 可能还有其他字段
                    "</div>"
                    console.log(sub_div)
                    $('.city_div').append(sub_div);      
                }
                if (typeof update_city_data != "undefined") {                        
                    clearInterval(update_city_data);
                    delete update_city_data
                }                    
                setinterval_city(data.tags)
                update_city_data = setInterval(function(){setinterval_city(data.tags)},10000)
                   
            }
        })

    }
}

function load_bay(bayid){    
    if (typeof update_bay_data != "undefined") {                        
        clearInterval(update_bay_data);
        delete update_bay_data
    }   
    $.ajax({
        url:"bayhtml",
        data:{bayid:bayid},
        async:false,
        datatype:'text',
        success:function(data, textStatus, request){
            
            if (data =='timeout'){
                alert('不能连接到站端')
                return
            }
            $('.right-body').html(data)
            var mode = request.getResponseHeader('SetupMode')
            if (mode == 1){
                $('.board .board-row .board-column:nth-child(4)').css({display:'none'})
                $('.board .board-row .board-column').css({width:"29.33%",margin:"0 2%"})

            }
        }
    })

    // 没有n项的情况下, 隐藏第四行, 调整前3行

    
//     $("#interval-choise").change(function(){
//         global_interval_choise = $("#interval-choise option:selected").attr('value')
//         console.log($("#hidden_tag").val())
//         load_bay_2($("#hidden_tag").val())

//     })
//     load_bay_2(bayid)
// }

// function load_bay_2(bayid){
    
    // 确认键的功能
    $('#board-confirm').click(function(){
        if (confirm('已确定警告信息?')){          
            $.ajax({
                type:'post',
                url:"confirm",
                headers:{"Content-Encoding":"gzip"},
                async:false,
                data:{"tags":bayid,csrfmiddlewaretoken:$.cookie('csrftoken')},
                success:function(data){
                    
                    if (data =='timeout'){
                        alert('不能连接到站端')
                        return
                    }
                    $('.warnings1').css('background-color','#00B050')
                    alert(data)
                }
            })

        }
    })       
    if (typeof load_bay_ajax !="undefined"){        
        load_bay_ajax.abort()
    }
    $('#echarts').html("<br>正在加载中...")
    load_bay_ajax = $.ajax({
        url:"bay",
        headers:{"Content-Encoding":"gzip"},
        async:true,
        data:{"tags":bayid},
        datatype:'json',
        success:function(data){
            
            if (data =='timeout'){
                alert('不能连接到站端')
                return
            }
            // 改右下角数据
            var span_list = $('.right-footer p span')
            var numbers=data.RealtimeData
            if (numbers != undefined){
                var real_data_number=[
                    numbers.pa,
                    numbers.pb,
                    numbers.pc,
                    numbers.pn,
                    numbers.pab,
                    numbers.pbc,
                    numbers.pac,
                    numbers.temperature,
                    numbers.airpress,
                ]
                
                var valid=[
                    numbers.pa_valid,
                    numbers.pb_valid,
                    numbers.pc_valid,
                    numbers.pn_valid,
                ]
                for(var i=0;i<span_list.length;i++){  
                    span_list[i].innerText=real_data_number[i]
                    if (valid[i] != undefined){
                        if (valid[i]){
                            $(span_list[i]).css('color','#000')
                        }else{$(span_list[i]).css('color','#f00')}
                    }
                    if (real_data_number[i] =="-"){
                        $(span_list[i].nextSibling).css('display','none')
                    } else{
                        $(span_list[i].nextSibling).css('display','inline')
                    }
    
                }  
            }else{
                for(var i=0;i<span_list.length;i++){                
                    span_list[i].innerText="-"
                    $(span_list[i]).css('color','#f00')
                    if (span_list[i].innerText =="-"){
                        $(span_list[i].nextSibling).css('display','none')
                    } else{
                        $(span_list[i].nextSibling).css('display','inline')
                    }
                }
            }
            if (data.HistoryData.length == 0){        
                $('#echarts').html("<br>无符合条件的记录")
            }else{
                // 画折线图
                var x = []
                var y = [
                    ["pa",[],0],
                    ["pb",[],0],
                    ["pc",[],0],
                    ["pn",[],0],
                    ["pab",[]],
                    ["pbc",[]],
                    ["pac",[]],
                    ["温度",[],1],
                    // ['pa_valid',[],1],
                    // ['pb_valid',[],1],
                    // ['pc_valid',[],1],
                    // ['pn_valid',[],1],
                ]
                for (var i=0;i <data.HistoryData.length;i++){
                    // var time = new Date(data.HistoryData[i].time)
                    // x.push(time.getTime())
                    x.push(data.HistoryData[i].time)
                    y[0][1].push(data.HistoryData[i].pa)
                    y[1][1].push(data.HistoryData[i].pb)
                    y[2][1].push(data.HistoryData[i].pc)
                    y[3][1].push(data.HistoryData[i].pn)
                    y[4][1].push(data.HistoryData[i].pab)
                    y[5][1].push(data.HistoryData[i].pbc)
                    y[6][1].push(data.HistoryData[i].pac)
                    y[7][1].push(data.HistoryData[i].temperature)
                    // y[7][1].push(data.HistoryData[i].pa_valid)
                    // y[8][1].push(data.HistoryData[i].pb_valid)
                    // y[9][1].push(data.HistoryData[i].pc_valid)
                    // y[10][1].push(data.HistoryData[i].pn_valid)
                }
                var myChart = line_chart(x,y)
                
                myChart.on('datazoom',function(params){
                    console.log(params)
                })
                
                // 开始更新数据,10秒一次 
                if (typeof update_bay_data != "undefined") {                        
                    clearInterval(update_bay_data);
                    delete update_bay_data
                }
                update_bay_data = setInterval(function(){setinterval_bay(bayid,x,y)} ,10000)
            }
                

            // 修改光字牌及更新光字牌
            $('.board-column').css('background-color','#00B050')
            for (i in data.warnings1){
                var PhaseName = data.warnings1[i]['PhaseName']
                var WarningType = data.warnings1[i]['WarningType']
                if (WarningType =="S102"){
                    WarningType ="S100"
                }
                var element = "#"+PhaseName+"_"+WarningType
                if (data.warnings1[i]['ConfirmFlag']){
                    $(element).css('background-color','#00f')
                }else{
                    $(element).css('background-color','#f00')
                }
            }
            for (i in data.warnings2){
                var PhaseName = data.warnings2[i]['PhaseName']
                var element = "#"+PhaseName+"_connect"
                $(element).css('background-color','#f00')
            }

        }
    })
}

function load_sub(subid){
    $('.right-body').html('<div class="body-main"><img></div>')
    var background_image = "/static/concentratorimage/"+subid+".png"
    // 判断背景文件是否存在
    var xmlhttp = new XMLHttpRequest();//非ie浏览器    
    xmlhttp.open("GET",background_image,false);  
    xmlhttp.send();  
    if(xmlhttp.readyState==4){   
        console.log(xmlhttp.status)  
        if(xmlhttp.status==200){
            //url存在     
            $('.body-main img').attr('src',background_image)
        }
        else {
            //url不存在     
            $('.body-main img').attr('src','/static/concentratorimage/default.jpg')
        }
    }
        
    if (typeof update_sub_ajax != "undefined"){
        update_sub_ajax.abort()
    }
    update_sub_ajax = $.ajax({
        url:"sub",
        headers:{"Content-Encoding":"gzip"},
        data:{"tags":subid},
        async:false,
        success:function(data){
            if (data =='timeout'){
                alert('不能连接到站端')
                return
            }
            for (var i=0;i<data.length;i++){
                var bay = data[i]                        
                var bay_div ="<div class='bay' id='"+bay.id+"' onclick=load_bay('"+bay.id+"')"+
                " style='left:"+bay.x+"%;top:"+(bay.y+2)+"%;'"+
                "><div class='bay-row'><div class='bay-font'>"+bay.name+"</div></div>"+
                "<div class='bay-row'><div class='bay-font'>pa:<span>"+bay.pa+"</span></div></div>"+
                "<div class='bay-row'><div class='bay-font'>pb:<span>"+bay.pb+"</span></div></div>"+
                "<div class='bay-row'><div class='bay-font'>pc:<span>"+bay.pc+"</span></div></div>"+
                "<div class='bay-row'><div class='bay-font'>pn:<span>"+bay.pn+"</span></div></div></div>"
                $('.body-main').append(bay_div); 
            }
            $('.body-main .bay').css('width',data[0].ImageBayWidth+"%")
            $('.body-main .bay').css('height',data[0].ImageBayHeight+"%")
            var fontSize = parseFloat($('.bay-row').css('height'))/16
            $('.body-main .bay').css('line-height',fontSize)
            $('.body-main .bay-font').css('transform','scale('+fontSize+')')
            $('.body-main .bay-row').css('height','auto')
        }
    })
    console.log($('.body-main img').attr('src'))
    if ($('.body-main img').attr('src').indexOf('default')  != -1){
        $('.body-main .bay').attr('style','')
        $('.body-main .bay').css('position','relative')
        $('.body-main .bay').css('float','left')
    }else{
        $('.body-main .bay').css('position','absolute')
    }
    setinterval_sub(subid)
    update_sub_data = setInterval(function(){setinterval_sub(subid)},10000)

}

function show_bay(bayid){
    var status = $('#'+bayid).css('visibility')
    // console.log(status)
    if (status == "visible"){
        $('#'+bayid).css('visibility','hidden')
    }else{        
        $('#'+bayid).css('visibility','visible')
    }
}

function setinterval_bay(tags,x,y){
    // 到这里已经判断过tags.length>10:
    // 通过一个基础函数获取tags现在的时间和属性值
    if (typeof setinterval_bay_ajax !="undefined"){
        setinterval_bay_ajax.abort()
    }       
    setinterval_bay_ajax = $.ajax({
        url:"update/bay",
        headers:{"Content-Encoding":"gzip"},
        type:'get',
        datatype:'json',
        async:true,
        data:{"tags":tags},
        success: function (data_obj){   
            
            if (data_obj =='timeout'){
                alert('不能连接到站端')
                return
            }
            // 如果这10秒没有数据就跳过
            if (!data_obj.hasOwnProperty("pa")){
                return 
            }  
            var real_data_number=[
                data_obj.pa,
                data_obj.pb,
                data_obj.pc,
                data_obj.pn,
                data_obj.pab,
                data_obj.pbc,
                data_obj.pac,        
                data_obj.temperature,
                data_obj.airpress,
                // data_obj.pa_valid,
                // data_obj.pb_valid,
                // data_obj.pc_valid,
                // data_obj.pn_valid
            ]
            var valid=[
                data_obj.pa_valid,
                data_obj.pb_valid,
                data_obj.pc_valid,
                data_obj.pn_valid,
            ]
            //处理x轴 
            if (x.length>999){
                x.shift()
            }
            x.push(data_obj.time)
            var span_list = $('.right-footer p span')
            var b_list = $('.right-footer p b')

            // console.log(span_list)
            
            //处理y轴
            for (var i=0;i<real_data_number.length-1;i++){        
                if (y[i][1].length>999){
                    y[i][1].shift()
                }
                y[i][1].push(real_data_number[i])
            }

            // 修改左下角数据
            for(var i=0;i<span_list.length;i++){ 
                // console.log(span_list[i])
                if (Number(span_list[i].innerText)>Number(real_data_number[i])){
                    b_list[i].innerText="↘"
                }else if (Number(span_list[i].innerText)<Number(real_data_number[i])){
                    b_list[i].innerText="↗"
                }else{
                    b_list[i].innerText="→"
                }
                

                span_list[i].innerText=real_data_number[i]
                
                if (valid[i] != undefined){
                    if (valid[i]){
                        $(span_list[i]).css('color','#000')
                    }else{$(span_list[i]).css('color','#f00')}
                }else{$(span_list[i]).css('color','#000')}
                if (real_data_number[i] =="-"){
                    $(span_list[i].nextSibling).css('display','none')
                } else{
                    $(span_list[i].nextSibling).css('display','inline')
                }


            }
            line_chart(x,y)

            // 更新光字牌    
            $('.board-column').css('background-color','#00B050')
            for (i in data_obj.warnings1){
                var PhaseName = data_obj.warnings1[i]['PhaseName']
                var WarningType = data_obj.warnings1[i]['WarningType']        
                if (WarningType =="S102"){
                    WarningType ="S100"
                }
                var element = "#"+PhaseName+"_"+WarningType
                if (data_obj.warnings1[i]['ConfirmFlag']){
                    $(element).css('background-color','#00f')
                }else{
                    $(element).css('background-color','#f00')
                }
            }
            for (i in data_obj.warnings2){
                var PhaseName = data_obj.warnings2[i]['PhaseName']
                var element = "#"+PhaseName+"_connect"
                $(element).css('background-color','#f00')
            }
            
        }
    })
    
    // console.log(data_obj)
    // 获取到了最新的数据
    
}

function setinterval_sub(subid){
    if (typeof setinterval_sub_ajax !="undefined"){
        setinterval_sub_ajax.abort()
    }
    setinterval_sub_ajax = $.ajax({
        url:"update/sub",
        headers:{"Content-Encoding":"gzip"},
        data:{tags:subid},
        async:true,
        success:function(data){
            
            if (data =='timeout'){
                alert('不能连接到站端')
                return
            }
            for (var i=0;i<data.length;i++){                  
                var bay = data[i]
                var span_list = $('#'+bay.id+' span')
                var data_list = [bay.pa,bay.pb,bay.pc,bay.pn]
                for(var j=0;j<span_list.length;j++){
                    span_list[j].innerText=data_list[j]  
                }
                
                // 本身每10秒钟会调这个方法, 在这里可以控制实时颜色变化
                if (bay.warning == true){
                    $('#'+bay.id+" .bay-row").css("background-color","f00")
                    $('#'+bay.id).css("color","fff")
                    $('#'+bay.id+' span').css("color","fff")

                }else{
                    // 如果怎么样, 要把颜色改回来
                    $('#'+bay.id+" .bay-row").css("background-color",'adff2f')
                    $('#'+bay.id).css("color","f00")
                    $('#'+bay.id+' span').css("color","f00")
                }
            }
        }
    })
}

function setinterval_con(tags,x,y){
    // 到这里已经判断过tags.length>10:
    // 通过一个基础函数获取tags现在的时间和属性值
    if (typeof setinterval_con_ajax !="undefined"){
        setinterval_con_ajax.abort()
    }       
    setinterval_con_ajax = $.ajax({
        url:"update/con",
        type:'get',
        datatype:'json',
        async:true,
        data:{"tags":tags},
        success: function (data2){   
            
            if (data2 =='timeout'){
                alert('不能连接到站端')
                return
            }
            // 如果这10秒没有数据就跳过
            if (!data2.hasOwnProperty("temperature")){
                return 
            }  
            var real_data_number=[  
                data2.temperature,
                data2.airpress,
            ]
            //处理x轴 
            if (x.length>999){
                x.shift()
            }
            x.push(data2.time)

            //处理y轴
            for (var i=0;i<real_data_number.length-1;i++){        
                if (y[i][1].length>999){
                    y[i][1].shift()
                }
                y[i][1].push(real_data_number[i])
            }

            // 修改实时角数据
            var span_list = $('.con_first span')
            span_list[0].innerText=data2.temperature
            span_list[1].innerText=data2.airpress
            line_chart(x,y)

            // 更新光字牌    
            
        }
    })    
}

function setinterval_city(tags){
    if (typeof setinterval_city_ajax !="undefined"){
        setinterval_city_ajax.abort()
    }
    
    setinterval_city_ajax = $.ajax({
        url:"update/city",
        data:{tags:tags},
        async:true,
        success:function(data){
            
            if (data =='timeout'){
                alert('不能连接到站端')
                return
            }
            for (var i=0;i<data.length;i++){                  
                var sub = data[i]
                
                // 本身每10秒钟会调这个方法, 在这里可以控制实时颜色变化
                if (sub.warning == true){
                    $('#'+sub.id).css("background-color","f00")
                    $('#'+sub.id).css("color","fff")
                    $('#'+sub.id+' span').css("color","fff")

                }else{
                    // 如果怎么样, 要把颜色改回来
                    $('#'+sub.id).css("background-color",'adff2f')
                    $('#'+sub.id).css("color","f00")
                    $('#'+sub.id+' span').css("color","f00")
                }
            }
        }
    })
}

function clear_setinterval(){
    if (typeof update_con_data != "undefined") {                        
        clearInterval(update_con_data);
        delete update_con_data
    }
    if (typeof update_bay_data != "undefined") {                        
        clearInterval(update_bay_data);
        delete update_bay_data
    }
    if (typeof update_sub_data != "undefined") {                        
        clearInterval(update_sub_data);
        delete update_sub_data
    }

    if (typeof update_city_data != "undefined") {                        
        clearInterval(update_city_data);
        delete update_city_data
    }

}