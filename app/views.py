from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth import authenticate, login
from django.core import serializers
from django.db.models import Count,Avg,Max,Min,Sum  # 导入聚合函数
from .forms import LoginForm
from .models import *
from django.contrib.auth.models import User  # User表
import requests
# from django.db import connection,transaction # 优化测试用包
import re # 分解时间用
import gzip # json压缩用
import base64 # 文件上传下载用
from lxml import etree # xml 文件用
import json
from datetime import datetime,timezone,timedelta
import time
# 数据如果是某些固定数值, 代表是某个错误, 通过把一个字典进下面参数, 
# 把字典中的pa, pb等值的这些固定数值变成某个错误字符串,默认为"-"
def str_err_code(d):
    err_code = {
        '-100.0':'-',# 'err_unconfig',
        '-200.0':'-',# 'err_unconnect',
        '-300.0':'-',# 'err_invalid',
        '-300.1':'-',# 'err_lengtherr',
        '-300.2':'-',# 'err_addrerr',
        '-300.3':'-',# 'err_crcerr',
        '-400.0':'-',# 'err_initial',
        '':'-',
    }
    data = ('pa','pb','pc','pn','pab','pbc','pac','pan','pbn','pcn','temperature','airpress')
    for elem in d:
        if elem in data:
            if d[elem] !='':
                d[elem]="%.1f"%(d[elem]/10)
            if d[elem] in err_code:
                d[elem]=err_code[d[elem]]

def divide_10(number):
    return round(number/10,1)
def multi_10(number):
    return int(float(number)*10)

def parse_time(s):
    # "2019-8-31 16:29:20"
    l = re.split(r'[- :]',s)
    l = [int(i) for i in l]
    return datetime(*l)

def list_one(l):
    l2 = []
    for i in l:
        l2.append(i[0])
    return l2



# 把time对象传进这个函数, 返回"2019-05-25 15:43:37" 这种格式的字符串
def time_str(A):
    return A.strftime("%Y-%m-%d %H:%M:%S")

# def main2(request):
#     return render(request, "login.html",{"form": login_form})

def main_views(request):       
    main={}   
    # main["substations"] = Table_Substation.objects.count()
    # main["bays"] = Table_Bay.objects.count()
    # main["sensors"] = Table_Phase.objects.count()
    # main["hours"] = 10000
    # main["dataitems"] = Table_HistoryData.objects.count()
    # main["warnings"] = 20
    # main["money"] = 10000
    return render(request, "main.html",{"main": main})
          
def map_views(request):    
    data = {'city':'china',"value":[],"name":[]}
    # data = {}
    # 需要查询变电站， 间隔， 传感器的汇总数据
    data['name'].append("变电站")
    data['name'].append("间隔")
    data['name'].append("传感器")
    for i in range(3):
        data['value'].append([])
    # 全国地图
    
    if request.GET.get('city','') == "china":  
        l = Table_CityCompany.objects.values('CityName__ProvinceName').distinct()
        # print(123)
        # 把有市公司的省提出来, 现在不需要提取市公司数据
    # 某省地图
    else:  
        l = Table_CityCompany.objects.filter(CityName__ProvinceName=request.GET['city']).values('CityName').distinct()
        # 把这个省的所有市公司提出来 

    for city in l:
        if request.GET.get('city','') == "china":  
            name = city["CityName__ProvinceName"] # 四川, 广州, 贵州
            citycompanys = Table_CityCompany.objects.filter(CityName__ProvinceName=name).all()  # 满足在该市的所有市公司的查询对象
        else:
            name = city["CityName"] # 成都市, 德阳市, 雅安市
            citycompanys = Table_CityCompany.objects.filter(CityName=name).all()  # 满足在该市的所有市公司的查询对象
        
        i=0  #'变电站'
        j=0  #'间隔'
        k=0  #'传感器'
        for citycompany in citycompanys:
            # 查询每个市公司下的变电站
            i += citycompany.table_substation_set.count()
            # 查询每个市公司下的每个变电站下的每个汇集单元下的间隔总数
            for sub in citycompany.table_substation_set.all():
                for con in sub.table_concentrator_set.all():
                    j += con.table_bay_set.count()
                    for bay in con.table_bay_set.all():
                        k += bay.table_phase_set.count()
            # k +=citycompany.table_substation_set.table_concentrator_set.table_bay_set.table_phase_set.count()
        data['value'][0].append({
            "name":name,
            "value":i, # 多少个变电站
        })
        data['value'][1].append({
            "name":name,
            "value":j, # 多少个间隔
        })
        data['value'][2].append({
            "name":name,
            "value":k, # 多少个传感器
        })
    
    json_data=json.dumps(data)
    json_data = gzip.compress(json_data.encode('utf-8'))
    response = HttpResponse(json_data, content_type='application/json')
    response._headers =dict(response._headers, **{"content-encoding":("Content-Encoding",'gzip')})
    return response

  
def loginout_views(request):
    request.session.flush()
    resp = render(request,"login0.html")
    resp.flush()
    return resp

def main_data_views(request):          
    main = {}
    main["substations"] = Table_Substation.objects.count()
    main["bays"] = Table_Bay.objects.count()
    main["sensors"] = Table_Phase.objects.count()
    main["hours"] = 24*main['bays']
    main["dataitems"] = 8000*main['bays']
    main["warnings"] = 20*main['bays']
    main["money"] = 10000
    
    json_data = json.dumps(main)
    # print(main)
    return HttpResponse(json_data, content_type='application/json')
    
def main_delete_views(request):
    # 云端
    if request.method=='POST':
        con_id = Table_Bay.objects.get(BayID=request.POST['bayid']).ConcentratorID.ConcentratorID
        res = yun_request(request,con_id)
        return HttpResponse(res)
    # 站端
    else:
        bayid = request.GET['bayid']
        Table_RealtimeData.objects.filter(bay_id=bayid).delete()
        Table_HistoryData.objects.filter(bay_id=bayid).delete()
        reset_algenable(bayid,0)  
        return HttpResponse("数据已删除")
    # except Exception as e:
    #     return HttpResponse('数据删除失败,%s'%e)

def base_views(request):
    main={}            

    return render(request, "base.html",{"main": main})

def tree_data_views(request):
    tree=[]      
    permission = Permissions(request.user)
    # [{'tags': '19', 'nodes': [{'tags': '19M01', 'nodes': [{'tags': '19M0101'}]}]}, 
    # {'tags': '18', 'nodes': [{'tags': '19M02', 'nodes': [{'tags': '19M0201'}]}]}]
    
    for pro in permission.tree:
        # p级
        pro['text']=Table_ProvinceCompany.objects.get(ProvinceCompanyCode=pro['tags']).ProvinceCompanyName
        pro['class'] = 'pro'
        for city in pro['nodes']:
            city['text'] = Table_CityCompany.objects.get(CityCompanyID=city['tags']).CityCompanyName
            city['class']='city'
            for sub in city['nodes']:
                sub['text'] = Table_Substation.objects.get(SubstationID=sub['tags']).SubstationName
                sub['class'] = 'sub'
                # 用列表装汇集单元子代树形结构
                if 'tags' in request.COOKIES:
                    if sub['tags'] ==request.COOKIES['tags']:
                        sub['state']= {'selected':True}
                sub['nodes'] = []
                # 查询sub下所有汇集单元, 每个汇集单元下所有间隔
                concentrators = Table_Concentrator.objects.filter(SubstationID__SubstationID=sub['tags']).all()
                for concentrator in concentrators:
                    con = {}
                    con['text'] = "汇集单元 "+concentrator.ConcentratorSN
                    con_ip = concentrator.ConcentratorIP
                    con['conip'] = con_ip
                    con['class'] = "con"
                    con['tags'] = concentrator.ConcentratorID
                    # 如果有cookie, 找出这个bay,设置为选中
                    if 'tags' in request.COOKIES:
                        if concentrator.ConcentratorID ==request.COOKIES['tags']:
                            con['state']= {'selected':True}
                            # 他的上面1级要为展开状态
                            sub['state']={'expanded':True}

                    # 用列表装间隔子代树形结构
                    con['nodes'] = []
                    bays = Table_Bay.objects.filter(ConcentratorID__ConcentratorID=con['tags']).all()
                    for bay in bays:
                        b={}
                        b['text']=bay.BayName+str(int(bay.BayCode))+"_"+bay.get_EquipmentType_display()   #get_FOO_display()
                        b['class']='bay'
                        b['tags']=bay.BayID
                        b['conip'] = con_ip
                        # 如果有cookie, 找出这个bay,设置为选中
                        if 'tags' in request.COOKIES:
                            if bay.BayID ==request.COOKIES['tags']:
                                b['state']= {'selected':True}
                                # 他的上面2级要为展开状态
                                con['state']={'expanded':True}
                                sub['state']={'expanded':True}

                        con['nodes'].append(b)
                    sub['nodes'].append(con)
        tree.append(pro)
    # 如果没有con 的 cookies, 把第一个tags存成cookie, 把他设置成选中
    # if tree and not 'con_tags' in request.COOKIES:
    #     first_con = tree[0]['nodes'][0]['nodes'][0]['nodes'][0]
    #     tags = first_con['tags']
    #     first_con['state']={'selected':True}
    #     #他的上面1级要为展开状态
    #     tree[0]['nodes'][0]['nodes'][0]['state']={'expanded':True}
    #     tree[0]['nodes'][0]['nodes'][0]['nodes'][0]['state']['expanded']=True

    # 如果没有bay 的 cookies, 把第一个tags存成cookie, 把他设置成选中
    if tree and not 'tags' in request.COOKIES:
        first_bay = tree[0]['nodes'][0]['nodes'][0]['nodes'][0]['nodes'][0]
        tags = first_bay['tags']
        first_bay['state']={'selected':True}
        #他的上面2级要为展开状态
        tree[0]['nodes'][0]['nodes'][0]['nodes'][0]['state']={'expanded':True}
        tree[0]['nodes'][0]['nodes'][0]['state']={'expanded':True}       

    json_data = json.dumps(tree)
    json_data = gzip.compress(json_data.encode('utf-8'))
    response = HttpResponse(json_data, content_type='application/json')
    response._headers =dict(response._headers, **{"content-encoding":("Content-Encoding",'gzip')})
    if tree and not 'tags' in request.COOKIES:
        response.set_cookie('tags',tags,path='/')

    # 把tree发给前台
    return response
   
def realtime_views(request):
    main={}   
    return render(request, "realtime.html",{"main": main})

def realtime_bayhtml_views(request):
    SetupMode = 0
    try:
        bayid = request.GET.get('bayid')
        SetupMode = Table_Bay.objects.get(BayID=bayid).SetupMode
    except:
        pass
    response = render(request,'realtime_bay.html')
    response._headers =dict(response._headers, **{"SetupMode":("SetupMode",str(SetupMode))})
    return response

def realtime_conhtml_views(request):
    return render(request,'realtime_con.html')

def realtime_sub_views(request):  
    main=[]
    tags = request.GET['tags']
    # 云端做的事
    if "119.23.76.5" in request.get_host():
        if len(tags) == 9:
            con_id = tags
        else :
            con_id = Table_Substation.objects.get(SubstationID=tags).table_concentrator_set.values_list('ConcentratorID')
        json_data = yun_request(request,con_id)
        if json_data == "timeout":
            return HttpResponse(json_data,content_type='text')
        return HttpResponse(json_data, content_type='application/json')
    # 站端做的事
    if len(tags) == 7: # 是sub
        concentrators = Table_Substation.objects.get(SubstationID=tags).table_concentrator_set.all()
        for con in concentrators:
            bays = con.table_bay_set.all()
            for bay in bays:
                b={}
                b['id'] = bay.BayID
                b['name'] = bay.BayName
                if bay.BayShortName:
                    b['name'] = bay.BayShortName
                b['pa']=""
                b['pb']=""
                b['pc']=""
                b['pn']="" 
                b['x']="%.2f"%bay.BayMapx
                b['y']="%.2f"%bay.BayMapy
                r_data = bay.table_realtimedata_set.order_by("time").last() # 查realtime最近的一条数据
                if r_data:
                    b['pa'] = r_data.pa
                    b['pb'] = r_data.pb
                    b['pc'] = r_data.pc
                    b['pn'] = r_data.pn
                # 暂时不用读取传感器数据
                str_err_code(b)
                # 第一种报警, phase是否运转
                warnings1 = bay.table_phase_set.filter(SensorConnectState=0).all()
                # 第二种报警, warning表的报警
                warnings2 = bay.table_warning_set.all()
                b['warning']=False
                if warnings1 or warnings2 : #or warning2
                    b['warning'] = True                
                main.append(b)
    elif len(tags) == 9:
        bays = Table_Concentrator.objects.get(ConcentratorID=tags).table_bay_set.all()
        for bay in bays:
            b={}
            b['id'] = bay.BayID
            b['name'] = bay.BayName
            b['pa']=""
            b['pb']=""
            b['pc']=""
            b['pn']="" 
            b['x']=bay.BayMapx
            b['y']=bay.BayMapy
            r_data = bay.table_realtimedata_set.order_by("time").last() # 查realtime最近的一条数据
            if r_data:
                b['pa'] = r_data.pa
                b['pb'] = r_data.pb
                b['pc'] = r_data.pc
                b['pn'] = r_data.pn
            # 暂时不用读取传感器数据
            str_err_code(b)
            # 第一种报警, phase是否运转
            warnings1 = bay.table_phase_set.filter(SensorConnectState=0).all()
            # 第二种报警, warning表的报警
            warnings2 = bay.table_warning_set.all()
            b['warning']=False
            if warnings1 or warnings2 : #or warning2
                b['warning'] = True            
            main.append(b)
    if len(main):
        main[0]['ImageBayWidth']="%.2f"%(bay.ConcentratorID.SubstationID.ImageBayWidth)
        main[0]['ImageBayHeight']="%.2f"%(bay.ConcentratorID.SubstationID.ImageBayHeight)
    json_data = json.dumps(main)
    return HttpResponse(json_data, content_type='application/json')

def realtime_city_views(request):
    main=[]
    tags = request.GET['tags']
    # 云端做的事
    if "119.76.23.5" in request.get_host():
        con_id =[]
        subs = Table_CityCompany.objects.get(CityCompanyID=tags).table_substation_set.values('SubstationID')
        for sub in subs:
            cons = Table_Substation.objects.get(SubstationID=sub['SubstationID']).table_concentrator_set.values('ConcentratorID')
            for con in cons:
                con_id.append(con['ConcentratorID'])
        json_data = yun_request(request,con_id)
        if json_data == "timeout":
            return HttpResponse(json_data,content_type='text')
        return HttpResponse(json_data, content_type='application/json')

    # 站端做的事
    subs = Table_CityCompany.objects.get(CityCompanyID=tags).table_substation_set.all()
    for sub in subs:
        sub_data = {"warning":False,"name":sub.SubstationName,"id":sub.SubstationID}
        cons = Table_Substation.objects.get(SubstationID=sub.SubstationID).table_concentrator_set.all()
        for con in cons:
            bays = Table_Concentrator.objects.get(ConcentratorID=con.ConcentratorID).table_bay_set.all()
            for bay in bays:
                # 第一种报警, phase是否运转
                warnings1 = bay.table_phase_set.filter(SensorConnectState=0).all()
                # 第二种报警, warning表的报警
                warnings2 = bay.table_warning_set.all()
                if warnings1 or warnings2:
                    sub_data['warning']=True
        main.append(sub_data)
    json_data = json.dumps(main)
    return HttpResponse(json_data, content_type='application/json')

def realtime_con_views(request):
    con_id = request.GET.get('tags','')
    # 云端做的事
    if "119.23.76.5" in request.get_host():
        json_data = yun_request(request,con_id)
        
        if json_data == "timeout":
            return HttpResponse(json_data,content_type='text')
        json_data = gzip.compress(json_data.encode('utf-8'))
        response = HttpResponse(json_data, content_type='application/json')
        response._headers =dict(response._headers, **{"content-encoding":("Content-Encoding",'gzip')})
        return response
    # 站端做的事
    # 温度和大气压怎么取??? 历史数据在间隔里, 怎么保证取一个数据正确的间隔.  
    # 不能保证, 先取一个bayid将就用
    bay_id = Table_Bay.objects.filter(ConcentratorID=con_id).values('BayID')[0]['BayID']

    main = {'temperature':[],'time':[],'airpress':[]}
    # 过往数据1
    start_time =(datetime.now()+timedelta(hours=-24)).strftime("%Y-%m-%d %H:%M:%S")
    end_time =  (datetime.now()+timedelta(minutes=-10)).strftime("%Y-%m-%d %H:%M:%S")
    sql = """ 
    SELECT a.* FROM 
    app_table_realtimedata a,
    (select min(id) as id, FLOOR(UNIX_TIMESTAMP(time)/600) as time_id 
    from app_table_realtimedata c
    where 
    c.time > '%s'
    and c.time < '%s'
    and c.bay_id='%s'
    GROUP BY time_id 
    )b 
    where a.id=b.id 
    and a.time > '%s'
    and a.time < '%s'
    and FLOOR(UNIX_TIMESTAMP(a.time)/600)=b.time_id
    and a.bay_id='%s'ORDER BY time;
    """%(start_time,end_time,bay_id,start_time,end_time,bay_id)  

    datas = Table_RealtimeData.objects.raw(sql)
    for data in datas:
        main['temperature'].append(divide_10(data.temperature)) if data.temperature != -2000   else  main['temperature'].append("-")        
        main['airpress'].append(divide_10(data.airpress)) if data.airpress != -2000  else  main['airpress'].append("-")
        main['time'].append(data.time.strftime("%Y-%m-%d %H:%M:%S"))

    # 过往数据2
    days_ago =  (datetime.now()+timedelta(minutes=-10))
    datas = Table_RealtimeData.objects.filter(bay_id = bay_id,time__gt=days_ago,time__lt=datetime.now()).values('temperature','airpress','time')
    for data in datas:
        main['temperature'].append(divide_10(data['temperature'])) if data['temperature'] != -2000   else  main['temperature'].append("-")        
        main['airpress'].append(divide_10(data['airpress'])) if data['airpress'] != -2000  else  main['airpress'].append("-")
        main['time'].append(data['time'].strftime("%Y-%m-%d %H:%M:%S"))
    json_data = json.dumps(main)
    json_data = gzip.compress(json_data.encode('utf-8'))
    response = HttpResponse(json_data, content_type='application/json')
    response._headers =dict(response._headers, **{"content-encoding":("Content-Encoding",'gzip')})
    return response


def realtime_update_con_views(request):  
    con_id = request.GET.get('tags','')
    # 云端做的事
    if "119.23.76.5" in request.get_host():
        json_data = yun_request(request,con_id)        
        
        if json_data == "timeout":
            return HttpResponse(json_data,content_type='text')
        return HttpResponse(json_data, content_type='application/json')
    # 站端做的事, 还是取第一个bayid将就用
    bay_id = Table_Bay.objects.filter(ConcentratorID=con_id).values('BayID')[0]['BayID']
    # print(bay_id)
    now = datetime.now()+timedelta(seconds=-25) # 15秒内
    realdata = Table_RealtimeData.objects.filter(bay__BayID = bay_id,time__gt=now).order_by('time').first()
    
    main = {}
    if realdata:
        main['temperature'] = realdata.temperature
        main['airpress'] = realdata.airpress
        main['time']=realdata.time.strftime("%Y-%m-%d %H:%M:%S")
        str_err_code(main)
        # 加上报警数据

    json_data = json.dumps(main)
    return HttpResponse(json_data,content_type='application/json')



def realtime_update_sub_views(request):  
    pass
            
def realtime_bay_views(request):
    # 云端做的事
    if "119.23.76.5" in request.get_host():
        con_id = Table_Bay.objects.get(BayID = request.GET.get('tags','')).ConcentratorID.ConcentratorID
        json_data = yun_request(request,con_id)
        
        if json_data == "timeout":
            return HttpResponse(json_data,content_type='text')
        json_data = gzip.compress(json_data.encode('utf-8'))
        response = HttpResponse(json_data, content_type='application/json')
        response._headers =dict(response._headers, **{"content-encoding":("Content-Encoding",'gzip')})
        return response
    # 站端做的事
    main = {}
    bayid = request.GET.get('tags','') 
    bay = Table_Bay.objects.get(BayID=bayid)
    main["SubstationName"]=bay.ConcentratorID.SubstationID.SubstationName
    main['BayName']=bay.BayName

    # 提供该间隔的实时数据
    now = datetime.now()+timedelta(seconds=-25)
    r_data = Table_RealtimeData.objects.filter(bay__BayID=bayid,time__gt=now).order_by("time").last()
    if r_data:
        r={}
        r['bayid'] = r_data.bay_id
        r['pa'] = r_data.pa
        r['pb'] = r_data.pb
        r['pc'] = r_data.pc
        r['pn'] = r_data.pn
        r['pab']=r_data.pab
        r['pbc']=r_data.pbc
        r['pac']=r_data.pac
        r['time']=r_data.time.strftime("%Y-%m-%d %H:%M:%S")
        r['temperature'] = r_data.temperature
        r['airpress'] = r_data.airpress
        r['pa_valid']=r_data.pa_valid
        r['pb_valid']=r_data.pb_valid
        r['pc_valid']=r_data.pc_valid
        r['pn_valid']=r_data.pn_valid
        str_err_code(r)
        main["RealtimeData"] = r
    main["HistoryData"] = []
     
    # 提供该间隔的过往数据2
    start_time = (datetime.now()+timedelta(hours=-24)).strftime("%Y-%m-%d %H:%M:%S")
    end_time = (datetime.now()+timedelta(minutes=-10)).strftime("%Y-%m-%d %H:%M:%S")
    
    limit_id = Table_RealtimeData.objects.filter(time__gt=start_time,time__lt=end_time).aggregate(Max('id'),Min('id'))
    max_id=limit_id['id__max']
    min_id=limit_id['id__min']
    if not max_id:
        history_datas = []
    else:
        sql = """
        SELECT a.* FROM 
        app_table_realtimedata a,
        (select min(id) as id, FLOOR(UNIX_TIMESTAMP(time)/600) as time_id 
        from app_table_realtimedata c
        where 
        c.id > %s
        and c.id < %s
        and c.bay_id='%s'
        GROUP BY time_id 
        )b 
        where a.id=b.id 
        and a.id > %s
        and a.id < %s
        and FLOOR(UNIX_TIMESTAMP(a.time)/600)=b.time_id
        and a.bay_id='%s'ORDER BY time;
        """%(min_id,max_id,bayid,min_id,max_id,bayid)    
        history_datas = Table_RealtimeData.objects.raw(sql)
    if history_datas:
        for his in history_datas:
            h = {}
            h['bayid'] = his.bay_id
            h['pa'] = his.pa
            h['pb'] = his.pb
            h['pc'] = his.pc
            h['pn'] = his.pn
            h['pab'] = his.pab
            h['pbc'] = his.pbc
            h['pac'] = his.pac
            h['temperature'] = his.temperature
            h['time']=his.time.strftime("%Y-%m-%d %H:%M:%S")
            h['pa_valid']=his.pa_valid
            h['pb_valid']=his.pb_valid
            h['pc_valid']=his.pc_valid
            h['pn_valid']=his.pn_valid
            str_err_code(h)
            main['HistoryData'].append(h)
            
    # 提供该间隔的过往数据1
    days_ago =  (datetime.now()+timedelta(minutes=-10)) #.astimezone(tzutc_8)
    history_datas =Table_RealtimeData.objects.filter(bay__BayID=bayid,time__gt=days_ago,time__lt=datetime.now()).order_by('time')
    if history_datas:
        for his in history_datas:
            h = {}
            h['bayid'] = his.bay_id
            h['pa'] = his.pa
            h['pb'] = his.pb
            h['pc'] = his.pc
            h['pn'] = his.pn
            h['pab'] = his.pab
            h['pbc'] = his.pbc
            h['pac'] = his.pac
            h['temperature'] = his.temperature
            h['time']=his.time.strftime("%Y-%m-%d %H:%M:%S")
            h['pa_valid']=his.pa_valid
            h['pb_valid']=his.pb_valid
            h['pc_valid']=his.pc_valid
            h['pn_valid']=his.pn_valid
            str_err_code(h)
            main['HistoryData'].append(h)
    # 给main加上warning表的数据
    warnings1 = Table_Warning.objects.filter(BayID=bayid).values('PhaseName','WarningType','ConfirmFlag').all()
    
    main['warnings1'] = list(warnings1)
    # 再加一个传感器连接报警
    warnings2 = Table_Phase.objects.filter(BayID=bayid,SensorConnectState=0).values('PhaseName').all()
    main['warnings2'] = list(warnings2)
    json_data = json.dumps(main)   
    print(json_data)
    json_data = gzip.compress(json_data.encode('utf-8'))
    response = HttpResponse(json_data, content_type='application/json')
    response._headers =dict(response._headers, **{"content-encoding":("Content-Encoding",'gzip')})
    return response

def realtime_update_bay_views(request):    
    # 云端做的事
    if "119.23.76.5" in request.get_host():
        con_id = Table_Bay.objects.get(BayID = request.GET['tags']).ConcentratorID.ConcentratorID
        json_data = yun_request(request,con_id)
        if json_data == "timeout":
            return HttpResponse(json_data,content_type='text')
        return HttpResponse(json_data, content_type='application/json')
    # 站端做的事
    # 这个views用来通过bayid获取realdata表的数据
    main = {}
    bayid = request.GET.get('tags','')
    now = datetime.now()+timedelta(seconds=-25) # 25秒内
    realdata = Table_RealtimeData.objects.filter(bay__BayID = bayid,time__gt=now).order_by('time').first()
    if realdata:
        main['bayid']=bayid
        main['pa'] = realdata.pa
        main['pb'] = realdata.pb
        main['pc'] = realdata.pc
        main['pn'] = realdata.pn
        main['pab'] = realdata.pab
        main['pbc'] = realdata.pbc
        main['pac'] = realdata.pac
        main['temperature'] = realdata.temperature
        main['airpress'] = realdata.airpress
        main['time']=realdata.time.strftime("%Y-%m-%d %H:%M:%S")
        main['pa_valid']=realdata.pa_valid
        main['pb_valid']=realdata.pb_valid
        main['pc_valid']=realdata.pc_valid
        main['pn_valid']=realdata.pn_valid
        str_err_code(main)
        # 给main加上warning表的数据
        warnings1 = Table_Warning.objects.filter(BayID=bayid).values('PhaseName','WarningType',"ConfirmFlag").all()
        
        main['warnings1'] = list(warnings1)
        # 再加一个传感器连接报警
        warnings2 = Table_Phase.objects.filter(BayID=bayid,SensorConnectState=0).values('PhaseName').all()
        main['warnings2'] = list(warnings2)
    else:
        main['bayid']=''
    json_data = json.dumps(main)
    return HttpResponse(json_data,content_type='application/json')

def realtime_confirm_views(request):    
    # 云端做的事
    if request.method=="POST":
        con_id = Table_Bay.objects.get(BayID = request.POST['tags']).ConcentratorID.ConcentratorID
        res = yun_request(request,con_id)
        return HttpResponse(res)
    # 站端做的事
    else:
        bayid = request.GET.get('tags','')
        a = Table_Warning.objects.filter(BayID=bayid).delete()
        if a:
            return HttpResponse('确认成功%s条警告'%a[0])
        else:
            return HttpResponse('没有数据需要确认')


def history_views(request):
    main={}
    return render(request, "history.html",{"main": main})

def history_update_views(request):
    # input()
    main={}
    bayid = request.GET.get('bayid','')
    if len(bayid) == 17:
        if "119.23.76.5" in request.get_host():
            con_id = Table_Bay.objects.get(BayID=bayid).ConcentratorID.ConcentratorID
            json_data = yun_request(request,con_id)
            
            if json_data == "timeout":
                return HttpResponse(json_data,content_type='text')
            # return HttpResponse(json_data, content_type='application/json')
            json_data = gzip.compress(json_data.encode('utf-8'))
            response = HttpResponse(json_data, content_type='application/json')
            response._headers =dict(response._headers, **{"content-encoding":("Content-Encoding",'gzip')})
            return response

        # 第一部分
        start_time = request.GET.get('start_time','')
        end_time = (parse_time(request.GET.get('end_time',''))+timedelta(minutes=-10)).strftime("%Y-%m-%d %H:%M:%S")

        limit_id = Table_HistoryData.objects.filter(time__gt=start_time,time__lt=end_time).aggregate(Max('id'),Min('id'))
        max_id=limit_id['id__max']
        min_id=limit_id['id__min']

        choise = request.GET.get('interval_choise','')
        interval = 3600
        if choise == "1h":
            interval = 3600
        elif choise == "10s":
            interval = 10
        elif choise == "1m":
            interval = 60
        elif choise == "5m":
            interval = 300
        elif choise == "10m":
            interval = 600
        elif choise == "30m":
            interval = 1800
        if not max_id:
            historydatas = []
        else:
            sql = """        
            SELECT a.* FROM 
            app_table_historydata a,
            (select min(id) as id, FLOOR(UNIX_TIMESTAMP(time)/%s) as time_id 
            from app_table_historydata c
            where 
            c.id > %s
            and c.id < %s
            and c.bay_id='%s'
            GROUP BY time_id 
            )b 
            where a.id=b.id 
            and a.id > %s
            and a.id < %s
            and FLOOR(UNIX_TIMESTAMP(a.time)/%s)=b.time_id
            and a.bay_id='%s'ORDER BY time;

            """%(interval,min_id,max_id,bayid,min_id,max_id,interval,bayid)  
            
            historydatas = list(Table_HistoryData.objects.raw(sql))
        # 第二部分
        start_time = (parse_time(request.GET.get('end_time',''))+timedelta(minutes=-10)).strftime("%Y-%m-%d %H:%M:%S")
        end_time = request.GET.get('end_time','')
        
        sql = """
        SELECT a.* FROM 
        app_table_historydata a
        where a.time > "%s"
        and a.time < "%s"
        and a.bay_id="%s" ORDER BY time;
        """%(start_time,end_time,bayid)  
        historydatas =historydatas + list(Table_HistoryData.objects.raw(sql))


        # 根据colums 的格式来定传输过去的数据的样式
        
        total = len(historydatas)        
        rows = []
        i = total

        for data in historydatas:
            d_data = {}
            d_data['id']=i
            i-=1
            d_data['pa'] = data.pa
            d_data['pb'] = data.pb
            d_data['pc'] = data.pc
            d_data['pn'] = data.pn
            d_data['pab'] = data.pab
            d_data['pbc'] = data.pbc
            d_data['pac'] = data.pac
            d_data['pa_valid'] = data.pa_valid
            d_data['pb_valid'] = data.pb_valid
            d_data['pc_valid'] = data.pc_valid
            d_data['pn_valid'] = data.pn_valid
            d_data['pt_valid'] = data.pt_valid
            d_data['temperature'] = data.temperature
            d_data['airpress'] = data.airpress
            d_data['time']=data.time.strftime("%Y-%m-%d %H:%M:%S") #data.time.astimezone(tzutc_8).strftime("%Y-%m-%d %H:%M:%S")
            str_err_code(d_data)
            rows.append(d_data)
        main["total"]=total
        main["totalNotFiltered"]=total
        main["rows"]=rows
        main['SubstationName']=Table_Bay.objects.get(BayID=bayid).ConcentratorID.SubstationID.SubstationName
        main['BayName']=Table_Bay.objects.get(BayID=bayid).BayName
    else:

        main["total"]=0
        main["totalNotFiltered"]=0
        main["rows"]=[]
        main['SubstationName']=''
        main['BayName']=''
    json_data=json.dumps(main)
    # print(datetime.now(),0)
    # 12秒钟, 后台一共用了7.5秒, 其中
    json_data = gzip.compress(json_data.encode('utf-8'))
    response = HttpResponse(json_data, content_type='application/json')
    response._headers =dict(response._headers, **{"content-encoding":("Content-Encoding",'gzip')})
    return response


def equipment_views(request):
    main={}
    return render(request,'equipment.html')

def equipment_update_views(request):
    req_class = request.GET.get('class','')
    if "119.23.76.5" in request.get_host():
        if req_class == "bay":
            con_id = Table_Bay.objects.get(BayID=request.GET["bayid"]).ConcentratorID.ConcentratorID
        elif req_class == "con":
            con_id = request.GET['bayid']
        elif req_class == "sub":
            con_id = Table_Substation.objects.get(SubstationID=request.GET['bayid']).table_concentrator_set.values_list('ConcentratorID')
        json_data = yun_request(request,con_id)
        
        if json_data == "timeout":
            return HttpResponse(json_data,content_type='text')
        json_data = gzip.compress(json_data.encode('utf-8'))
        response = HttpResponse(json_data, content_type='application/json')
        response._headers =dict(response._headers, **{"content-encoding":("Content-Encoding",'gzip')})
        return response
    main={}
    bayids = []
    # 填充bayid列表
    if req_class == "bay":
        bayids.append(request.GET['bayid'])
    elif req_class == "con":
        bays = Table_Bay.objects.filter(ConcentratorID = request.GET['bayid']).values("BayID").all()
        for i in bays:
            bayids.append(i['BayID'])
    elif req_class == "sub":
        cons = Table_Concentrator.objects.filter(SubstationID = request.GET["bayid"]).values('ConcentratorID').all()
        for con in cons:
            bays = Table_Bay.objects.filter(ConcentratorID = con['ConcentratorID']).values("BayID").all()
            for i in bays:
                bayids.append(i['BayID'])

    
    main={
        "total": 0,
        "totalNotFiltered": 0,
        "rows": [],
    }

    for bayid in bayids:
        phasedatas = Table_Phase.objects.filter(BayID=bayid).all()
        main['total'] += len(phasedatas)
        main['totalNotFiltered'] += len(phasedatas)
        for data in phasedatas:
            d_data = {}
            d_data['substation_name']=data.BayID.ConcentratorID.SubstationID.SubstationName
            d_data['bay_name'] = data.BayID.BayName
            d_data['phase_name'] = data.PhaseName
            d_data['sensor_code_id'] = data.SensorVersionNo+':'+str(data.SensorID)
            # 波特率, 数据位, 校验位, 停止位
            d_data['communication_interface']=\
                str(data.Baud)+str(data.DataBit)+data.Parity+str(data.StopBit)
            d_data['sensor_scale']=data.SensorScale
            d_data['sensor_connect_state']=data.SensorConnectState
            d_data['last_connect_time']=data.LastConnectTime.strftime("%Y-%m-%d %H:%M:%S")
            d_data['sensor_realtime_data']=divide_10(data.SensorRealtimeData)
            main['rows'].append(d_data)     

    json_data=json.dumps(main)
    json_data = gzip.compress(json_data.encode('utf-8'))
    response = HttpResponse(json_data, content_type='application/json')
    response._headers =dict(response._headers, **{"content-encoding":("Content-Encoding",'gzip')})
    return response
     
def equipment_delete_views(request):
    if request.POST['psw']!="jxoms" or not request.user.username:
        return HttpResponse('')
    i = Table_FunctionPermission.objects.get(User=request.user.username).IsOperation
    if not i:
        return HttpResponse('')
    c = request.POST['class']
    tags = request.POST['tags']
    # c = ['pro','city','sub','con','bay']
    bayids = []
    cityids= []
    subids = []
    conids = []  
    if c == "pro":
        cityids = list_one(Table_CityCompany.objects.filter(ProvinceCompanyID__in=tags).values_list('CityCompanyID'))
    if c == "city":
        cityids = [tags]
    if cityids:
        subids = list_one(Table_CityCompany.objects.filter(CityCompanyID__in=cityids).all().table_substations_set.values_list['SubstationID'])
    if c == "sub":
        subids = [tags]
    if subids:
        conids = list_one(Table_Concentrator.objects.filter(SubstationID__in=subids).values_list('ConcentratorID'))
    if c == "con":
        conids = [tags]
    if conids:
        bayids = list_one(Table_Bay.objects.filter(ConcentratorID__in=conids).values_list("BayID"))
    if c == "bay":
        bayids = [tags]
    print(bayids)
    baynames = ""
    for bayid in bayids:
        Table_Log.objects.filter(BayID = bayid).delete()
        Table_Warning.objects.filter(BayID=bayid).delete()
        Table_WarningHistory.objects.filter(BayID=bayid).delete()
        Table_RealtimeData.objects.filter(bay_id=bayid).delete()
        Table_HistoryData.objects.filter(bay_id=bayid).delete()
        reset_algenable(bayid,0)
        baynames += "%s, "%(Table_Bay.objects.get(BayID=bayid).BayName)
    return HttpResponse(baynames+'的动态数据已全部删除')

def judgement_views(request):
    pass

def statement_views(request):
    pass

def event_views(request):
    main={}
    return render(request,'event.html',{"main":main})
    
def event_update_views(request):
    main={}
    main['logs']=[]
    if "119.23.76.5" in request.get_host():
        if request.GET['class']=="con":
            con_id = request.GET['tags']
        elif request.GET['class']=='bay':
            con_id = Table_Bay.objects.get(BayID=request.GET['tags']).ConcentratorID.ConcentratorID
        json_data = yun_request(request,con_id)
        
        if json_data == "timeout":
            return HttpResponse(json_data,content_type='text')
        json_data = gzip.compress(json_data.encode('utf-8'))
        response = HttpResponse(json_data, content_type='application/json')
        response._headers =dict(response._headers, **{"content-encoding":("Content-Encoding",'gzip')})
        return response
    if request.GET['class']=="con":
        conid = request.GET['tags']
        logs = Table_Log.objects.filter(ConcentratorID=conid,time__gt=request.GET.get('start_time',''),
        time__lt=request.GET.get('end_time','')).order_by('-time').all()
    elif request.GET['class']=='bay':
        bayid = request.GET['tags']
        logs = Table_Log.objects.filter(BayID=bayid,time__gt=request.GET.get('start_time',''),
        time__lt=request.GET.get('end_time','')).order_by('-time').all()
    x = len(logs)
    y = 1
    for log in logs:
        data={}
        data['id']=y
        y+=1
        data['time']=log.time.strftime("%Y-%m-%d %H:%M:%S")
        data['WarningType']=log.WarningType
        data['WarningName']=log.WarningName
        data['Action']=log.Action
        data['BayName']='-'
        data['ConcentratorName']='-'
        data['PhaseName']='-'

        if log.BayID:
            data['BayName']=log.BayID.BayName
        if log.ConcentratorID:
            data['ConcentratorName']=log.ConcentratorID.__str__()
        if log.PhaseName:
            data['PhaseName'] = log.PhaseName
        main['logs'].append(data)

    json_data = json.dumps(main)
    json_data = gzip.compress(json_data.encode('utf-8'))
    response = HttpResponse(json_data, content_type='application/json')
    response._headers =dict(response._headers, **{"content-encoding":("Content-Encoding",'gzip')})
    return response
    
def file_upload_views(request):
    if request.POST['psw']!="jxoms" or not request.user.username:
        return HttpResponse('')
    i = Table_FunctionPermission.objects.get(User=request.user.username).IsOperation
    if not i:
        return HttpResponse('')
    try:
        data = request.POST['file']
        data = base64.b64decode(data.replace('data:text/xml;base64,','')).decode() # xml文件时gbk格式的, 要用gbk编码查看
        now = "%d"%(time.time())
        filename = request.POST['filename'].replace('.xml','')+now+'.xml'
        with open(".\\..\\xml\\bak\\"+filename,'w',encoding='utf-8') as f:
            f.write(data)
    except Exception as e:
        import os 
        print(os.getcwd())
        filename += os.path.abspath(os.getcwd())

    return HttpResponse('保存成功,保存名字为 %s'%filename)

def file_excute_views(request):
    i = Table_FunctionPermission.objects.get(User=request.user.username).IsOperation
    if not i:
        return HttpResponse('')
    res_str = xml_import(request.POST['filename'])
    return HttpResponse(res_str)


def algorithm_views(request):
    if request.GET.get('page','') == "algs":
        return render(request,'algorithm_s.html')
    return render(request,'algorithm.html')

def algorithm_update_views(request):    
    i = True
    # 如果是登录的, 就有username,有username就要判断权限, 
    # 如果是云端访问站端, 就没有username, i=1
    if request.user.username:          
        i = False
        try:
            i = Table_FunctionPermission.objects.get(User=request.user.username).IsOperation
        except Table_FunctionPermission.DoesNotExist:
            pass
    # 云端
    if "119.23.76.5" in request.get_host(): 
        if i:
            if request.GET['class']=="con":
                con_id = request.GET['tags']
            elif request.GET['class']=='bay':
                con_id = Table_Bay.objects.get(BayID=request.GET['tags']).ConcentratorID.ConcentratorID
            elif request.GET['class'] == 'sub':
                con_id = Table_Substation.objects.get(SubstationID=request.GET['tags']).table_concentrator_set.values_list('ConcentratorID')
            json_data = yun_request(request,con_id)
            
            if json_data == "timeout":
                return HttpResponse(json_data,content_type='text')
            json_data = gzip.compress(json_data.encode('utf-8'))
            response = HttpResponse(json_data, content_type='application/json')
            response._headers =dict(response._headers, **{"content-encoding":("Content-Encoding",'gzip')})
            return response
        else:
            return HttpResponse('nopermission',content_type = "text")
    # 站端
    if i:
        #　columns2 代表后续添加的字段, 是state表的几个字段, 这9个字段不能改,所以和column分开
        main={'columns':[],'columns2':[],'algenable':{}}
        if request.GET['class'] == 'bay':
            main['class'] = "bay"
            bays = Table_Bay.objects.filter(BayID=request.GET['tags']).values('BayID').all()
        elif request.GET['class'] == "sub" :
            main['class'] = "sub"
            cons = Table_Concentrator.objects.filter(SubstationID=request.GET['tags'])
            bays = Table_Bay.objects.filter(ConcentratorID__in = cons).values('BayID').all()             

        elif request.GET['class'] == "con":
            main['class'] = "con"
            bays = Table_Concentrator.objects.get(ConcentratorID=request.GET['tags']).table_bay_set.values('BayID').all()

        # 判断主变还是线路
        if request.GET['type'] == "T":
            for bay in bays:
                column = Table_AlgorithmSetting.objects.filter(BayID=bay['BayID'])\
                    .values('Pt_TG','Ptu_TG','Ptd_TG','Ptdu_TG','Ptc_TG','Ptdc_TG',
                    'Ptdcu_TG','Ptcd','Ptcd_R1','Ptcd_R2','Pd_YC','DeltaTime1',
                    'DeltaTime2','DeltaTime3','DeltaTime4','DeltaTime5','DeltaTime6')
                if column:
                # if False:
                    #  column 是字典
                    column = list(column)[0]

                    for key in column:
                        if "Time" not in key and "_R" not in key:
                            column[key]=divide_10(column[key])


                    #  后面要求加入algenable等9个字段,:
                    column2 = Table_AlgorithmState.objects.filter(BayID=bay['BayID'])\
                        .values('AlgEnableTime','AlgCalcInitialValueStart','AlgCalcInitialValueStartTime',
                        'AlgCalcInitialValueLastTime','AlgCalcInitialValueDone','AlgCalcInitialValueDoneTime',
                        'AlgCalcWarningValueStart','AlgCalcWarningValueStartTime','AlgCalcWarningValueLastTime')
                    column2 = list(column2)[0]
                    for key in column2:
                        if "Time" in key:
                            column2[key] = column2[key].strftime("%Y-%m-%d %H:%M:%S")
                        else:
                            column2[key] = column2[key]

                    # 后续操作
                    if request.GET['class'] != "bay":
                        column['BayName'] = Table_Bay.objects.get(BayID=bay['BayID']).BayName
                        column['BayID'] = bay["BayID"]
                        if request.GET['class'] != "bay" and request.GET['type'] == column['BayID'][9]:
                            main['columns'].append(column)
                            main['columns2'].append(column2)
                    else:
                        main['columns'].append(column)
                        main['columns2'].append(column2)
                algenable = Table_AlgorithmState.objects.filter(BayID=bay['BayID']).values("AlgEnable")
                if algenable:
                    main['algenable'][bay["BayID"]]=algenable[0]['AlgEnable']
        elif request.GET['type'] == "L":
            for bay in bays:
                column = Table_AlgorithmSetting.objects.filter(BayID=bay['BayID'])\
                    .values('Pet_CTPT','Pt_CTPT','Ptd_CTPT','Ptdu_CTPT','Ptdc_CTPT','Ptdcu_CTPT',
                    'Ptcd','Ptcd_R1','Ptcd_R2','Pd_YC','DeltaTime1',
                    'DeltaTime2','DeltaTime3','DeltaTime4','DeltaTime5','DeltaTime6')
                if column:
                # if False:
                    column = list(column)[0]
                    for key in column:
                        if "Time" not in key and "_R" not in key:
                            column[key]=divide_10(column[key])

                    #  后面要求加入algenable等9个字段:
                    column2 = Table_AlgorithmState.objects.filter(BayID=bay['BayID'])\
                        .values('AlgEnableTime','AlgCalcInitialValueStart','AlgCalcInitialValueStartTime',
                        'AlgCalcInitialValueLastTime','AlgCalcInitialValueDone','AlgCalcInitialValueDoneTime',
                        'AlgCalcWarningValueStart','AlgCalcWarningValueStartTime','AlgCalcWarningValueLastTime')
                    column2 = list(column2)[0]
                    for key in column2:
                        if "Time" in key:
                            column2[key] = column2[key].strftime("%Y-%m-%d %H:%M:%S")
                        else:
                            column2[key] = column2[key]

                    if request.GET['class'] != "bay":
                        column['BayName'] = Table_Bay.objects.get(BayID=bay['BayID']).BayName
                        column['BayID'] = bay["BayID"]
                        if request.GET['type'] == column['BayID'][9]:
                            main['columns'].append(column)
                            main['columns2'].append(column2)
                    else:
                        main['columns'].append(column)
                        main['columns2'].append(column2)
                algenable = Table_AlgorithmState.objects.filter(BayID=bay['BayID']).values("AlgEnable")
                if algenable:
                    main['algenable'][bay["BayID"]]=algenable[0]['AlgEnable']
        else: # 其他间隔
            for bay in bays:
                column = Table_AlgorithmSetting.objects.filter(BayID=bay['BayID'])\
                    .values('Pet_CTPT','Pt_CTPT','Ptd_CTPT','Ptdu_CTPT','Ptdc_CTPT','Ptdcu_CTPT',
                    'Ptcd','Ptcd_R1','Ptcd_R2','Pd_YC','DeltaTime1',
                    'DeltaTime2','DeltaTime3','DeltaTime4','DeltaTime5','DeltaTime6')
                if column:
                # if False:
                    column = list(column)[0]
                    for key in column:
                        if "Time" not in key and "_R" not in key:
                            column[key]=divide_10(column[key])

                    #  后面要求加入algenable等9个字段:
                    column2 = Table_AlgorithmState.objects.filter(BayID=bay['BayID'])\
                        .values('AlgEnableTime','AlgCalcInitialValueStart','AlgCalcInitialValueStartTime',
                        'AlgCalcInitialValueLastTime','AlgCalcInitialValueDone','AlgCalcInitialValueDoneTime',
                        'AlgCalcWarningValueStart','AlgCalcWarningValueStartTime','AlgCalcWarningValueLastTime')
                    column2 = list(column2)[0]
                    for key in column2:
                        if "Time" in key:
                            column2[key] = column2[key].strftime("%Y-%m-%d %H:%M:%S")
                        else:
                            column2[key] = column2[key]

                    if request.GET['class'] != "bay":
                        column['BayName'] = Table_Bay.objects.get(BayID=bay['BayID']).BayName
                        column['BayID'] = bay["BayID"]
                        if request.GET['type'] == column['BayID'][9]:
                            main['columns'].append(column)
                            main['columns2'].append(column2)
                    else:
                        main['columns'].append(column)
                        main['columns2'].append(column2)
                algenable = Table_AlgorithmState.objects.filter(BayID=bay['BayID']).values("AlgEnable")
                if algenable:
                    main['algenable'][bay["BayID"]]=algenable[0]['AlgEnable']
        json_data = json.dumps(main)
        json_data = gzip.compress(json_data.encode('utf-8'))
        response = HttpResponse(json_data, content_type='application/json')
        response._headers =dict(response._headers, **{"content-encoding":("Content-Encoding",'gzip')})
        return response
    else:
        return HttpResponse('nopermission',content_type = "text")


def algorithm_enable_views(request):
    if "119.23.76.5" in request.get_host():
        if request.GET['class']=="con":
            con_id = request.GET['tags']
        elif request.GET['class']=='bay':
            con_id = Table_Bay.objects.get(BayID=request.GET['tags']).ConcentratorID.ConcentratorID
        elif request.GET['class'] == 'sub':
            con_id = Table_Substation.objects.get(SubstationID=request.GET['tags']).table_concentrator_set.values_list('ConcentratorID')
        json_data = yun_request(request,con_id)
        if json_data == "timeout":
            return HttpResponse(json_data,content_type='text')
        return HttpResponse(json_data)
    
    if request.GET['class']== 'bay':
        try:
            reset_algenable(request.GET['tags'],request.GET['enable'])            
            return HttpResponse("修改成功")
        except Exception as f:
            return HttpResponse("%s"%f)
    else:
        success = 0
        failed = 0
        fail_bay=""
        for bayid in json.loads(request.GET['tags']):
            try:                
                reset_algenable(bayid,request.GET['enable'])    
                success+=1
            except Table_AlgorithmState.DoesNotExist:
                failed +=1
                # fail_bay += Table_Bay.objects.get(BayID=bayid).BayName+" "
                fail_bay += bayid+" "
        fail_bay += "没有设置state表" if failed>0 else ''
        return HttpResponse('修改成功%s条,修改失败%s条 %s'%(success,failed,fail_bay))

def algorithm_save_views(request):   
    if request.method == "POST":
        if request.POST['class']=="con":
            con_id = request.POST['con_id']
        elif request.POST['class']=='bay':
            con_id = Table_Bay.objects.get(BayID=request.POST['tags']).ConcentratorID.ConcentratorID
        elif request.POST['class'] == 'sub':
            con_id = Table_Substation.objects.get(SubstationID=request.POST['tags']).table_concentrator_set.values_list('ConcentratorID')
        
        print(con_id)
        res = yun_request(request,con_id)
        return HttpResponse(res)
     
    columns = json.loads(request.GET['columns'])    

    for key in columns:
        if "Time" not in key and key and "_R" not in key:
            columns[key]=multi_10(columns[key])
    if request.GET['class'] == 'bay':
        alg = Table_AlgorithmSetting.objects.filter(BayID=request.GET['tags'])
        alg.update(**columns)
        return HttpResponse("保存成功")
    else:
        tags = json.loads(request.GET['tags'])
        for bayid in tags:
            alg = Table_AlgorithmSetting.objects.filter(BayID=bayid)

            alg.update(**columns)
        print(columns)
        return HttpResponse("保存成功")

def heart_views(request):
    return HttpResponse('yes')
# 写一个类来控制权限, 控制所登录的用户的权限, 具体权限是指所属省市变电站的赠删改查权限, 表通过permission控制, 
# 分成3种权限(1省2市3站), 一个人可以有多种权限, 一种权限可以有多个平级具体权限
    # 权限控制思想:
    # 先看省权限,再看市权限,再看站权限, 
    # 把权限做成树状结构, tree, 
    # 先看该权限的最顶级单位(省)是否在需要做的tree存在,不存在则该权限为新, 直接加上, 
    # 存在则看该权限的下一级(市), 依然看该tree是否存在该市, 不存在则加上,存在则看站 
    # [{'tags': '19', 'nodes': [{'tags': '19M01', 'nodes': [{'tags': '19M0101'}]}]}, 
    # {'tags': '18', 'nodes': [{'tags': '19M02', 'nodes': [{'tags': '19M0201'}]}]}]    
class Permissions(object):
    def __init__(self,user):
        # 查出该人在权限表的所有权限, 按等级分类
        permissions = user.table_treepermission_set.all().order_by("Level",'ProvinceCompanyName','CityCompanyName')
        tree = []
        for per in permissions:
            if per.Level == 1:                 
                # 用flag看tree里有没有 province
                p_flag = 1
                for p in tree:
                    if p['tags'] == per.ProvinceCompanyName.ProvinceCompanyCode:
                        p_flag = 0
                # 如果没有, 就把该省公司下属全加进树
                if p_flag:                    
                    p = {}
                    citys = per.ProvinceCompanyName.table_citycompany_set.all()
                    p['tags'] = per.ProvinceCompanyName.ProvinceCompanyCode
                    p['nodes'] = []
                    for city in citys:
                        c = {}
                        c['tags'] = city.CityCompanyID
                        c['nodes'] = []
                        substations = city.table_substation_set.all()
                        for sub in substations:
                            s = {}
                            s["tags"] = sub.SubstationID
                            c['nodes'].append(s)
                        p['nodes'].append(c)
                    tree.append(p)
            elif per.Level == 2:
                # 1. 先找p级, 找到了在下面找这个c级, 找不到再加上,找到了不操作
                # 2. 找不到p级,加上p级和这个c级下属
                pro = per.CityCompanyName.ProvinceCompanyID
                # 
                p_flag = 1
                for p in tree:
                    if p['tags'] == pro.ProvinceCompanyCode:
                        p_flag = 0 
                        # 说明有这个p级, 那需要看有没有这个c级
                        c_flag = 1
                        # 遍历这个p级下属, 与该条权限记录对比
                        for c in p['nodes']:
                            if c['tags'] == per.CityCompanyName.CityCompanyID:
                                c_flag = 0
                                # 该c存在
                        if c_flag:
                            # 该c不存在
                            # 则需要加上   
                            # 但这个p级已经有nodes了
                            c = {}
                            c['tags'] = per.CityCompanyName.CityCompanyID
                            # 所有'成都市电力公司'下, 且在间隔表有所有变电站名和id
                            c['nodes'] = []
                            substations = per.CityCompanyName.table_substation_set.all()
                            for sub in substations:
                                s = {}                                
                                s["tags"] = sub.SubstationID.SubstationID
                                c['nodes'].append(s)
                            p['nodes'].append(c)
                # 如果没有p
                if p_flag:
                    p = {}
                    p['tags']=pro.ProvinceCompanyCode
                    p['nodes']=[]
                    c = {}
                    c["tags"]=per.CityCompanyName.CityCompanyID
                    c['nodes']=[]
                    substations = per.CityCompanyName.table_substation_set.all()
                    for sub in substations:
                        s = {}
                        s["tags"] = sub.SubstationID
                        c['nodes'].append(s)
                    p['nodes'].append(c)
                    tree.append(p)
            elif per.Level == 3:
                # 1. 先找p级, 找到了在下面找这个c级,找到了再找s级
                # 2. 找到了s级不操作, 找不到加上
                # 3. 找不到c级,加上这个c级和s级
                # 4. 找不到p级,加上p级和c级和s级
                pro = per.SubstationID.CityCompanyID.ProvinceCompanyID
                p_flag = 1
                for p in tree:
                    if p['tags']==pro.ProvinceCompanyCode:
                        # 有这个p, 判断c
                        p_flag=0
                        c_flag=1
                        for c in p['nodes']:
                            if c['tags'] == per.SubstationID.CityCompanyID.CityCompanyID:
                                c_flag = 0
                                # 有这个c,判断s
                                s_flag = 1
                                for s in c['nodes']:
                                    if s['tags'] == per.SubstationID.SubstationID:
                                        # 说明这个s级是存在的
                                        s_flag=0
                                if s_flag:
                                    # 说明这个s不存在
                                    s = {}
                                    s['tags']=per.SubstationID.SubstationID
                                    c['nodes'].append(s)
                        if c_flag:
                            c = {}
                            s = {}
                            c['tags']=per.SubstationID.CityCompanyID.CityCompanyID
                            c['nodes']=[]
                            s['tags']=per.SubstationID.SubstationID
                            c['nodes'].append(s)
                            p['nodes'].append(c)
                if p_flag:
                    p={}
                    c={}
                    s={}
                    p['tags']=per.SubstationID.CityCompanyID.ProvinceCompanyID.ProvinceCompanyCode
                    c['tags']=per.SubstationID.CityCompanyID.CityCompanyID                    
                    c['nodes']=[]
                    p['nodes']=[]
                    s['tags']=per.SubstationID.SubstationID
                    c['nodes'].append(s)
                    p['nodes'].append(c)
                    tree.append(p)
        self.tree = tree
        self.per = user

    def look(self):
        print(self.tree)

# 重置定值
def reset_algenable(bayid,enable):
    algstate = Table_AlgorithmState.objects.get(BayID__BayID=bayid)
    algstate.AlgEnable = enable
    if enable:
        try:
            algstate.AlgEnableTime = datetime.now()
            m = algstate.BayID.table_algorithmsetting.DeltaTime1
            algstate.AlgCalcInitialValueStartTime = datetime.now()+timedelta(minutes=+m)    
            n = algstate.BayID.table_algorithmsetting.DeltaTime1
            algstate.AlgCalcWarningValueStartTime = datetime.now()+timedelta(minutes=+m)    
        except:
            algstate.AlgEnable = False
            algstate.AlgEnableTime = parse_time('2000-01-01')
            algstate.AlgCalcInitialValueStartTime = parse_time('2000-01-01')
            algstate.AlgCalcWarningValueStartTime = parse_time('2000-01-01')
    else:
        algstate.AlgEnableTime = parse_time('2000-01-01')
        algstate.AlgCalcInitialValueStartTime = parse_time('2000-01-01')
        algstate.AlgCalcWarningValueStartTime = parse_time('2000-01-01')

    algstate.AlgCalcInitialValueLastTime=parse_time('2000-01-01')
    algstate.AlgCalcInitialValueDoneTime=parse_time('2000-01-01')
    
    algstate.AlgCalcWarningValueLastTime=parse_time('2000-01-01')        
    algstate.Pa0 = 0.0
    algstate.Pb0 = 0.0
    algstate.Pc0 = 0.0
    algstate.Pab0 = 0.0
    algstate.Pbc0 = 0.0
    algstate.Pac0 = 0.0
    algstate.Pn0 = 0.0
    algstate.Pan0 = 0.0
    algstate.Pbn0 = 0.0
    algstate.Pcn0 = 0.0
    algstate.Pa1 = 0.0
    algstate.Pb1 = 0.0
    algstate.Pc1 = 0.0
    algstate.Pn1 = 0.0
    algstate.AlgCalcInitialValueStart = False
    algstate.AlgCalcInitialValueDone = False
    algstate.AlgCalcWarningValueStart = False


    algstate.save()



def yun_request(request,con_id):
    if type(con_id)!=list:
        con_id = [con_id]
    if request.method == "GET":
        hosts= Table_Concentrator.objects.filter(ConcentratorID__in=con_id).values('ConcentratorIP')
        text = ""
        print(hosts)
        for host in hosts:
            host = 'http://' + host['ConcentratorIP']
            full_path = request.get_full_path()
            full_host = host+full_path
            
            try:
                requests.get(host+'/heart',timeout=3)# 心跳检测
                res = requests.get(full_host)
            except  requests.exceptions.ConnectTimeout:
                return 'timeout'                 
    else:
        D = dict(request.POST)
        del D['csrfmiddlewaretoken']
        hosts= Table_Concentrator.objects.filter(ConcentratorID__in=con_id).values('ConcentratorIP')
        text=""
        for host in hosts:
            host = 'http://' + host['ConcentratorIP']
            full_path = request.get_full_path()
            full_host = host+full_path
            try:
                requests.get(host+'/heart',timeout=3)# 心跳检测
                res = requests.get(full_host,params=D)
            except  requests.exceptions.ConnectTimeout:
                return 'timeout'
    return res.text




# 导入xml的方法, 将configure.py封装进这个函数
def xml_import(filename):    
    res_str = ""
    try:    

        parser = etree.XMLParser(ns_clean = True, remove_comments = True, remove_blank_text = True)
        xmlschema_doc = etree.parse('.\\..\\xml\\template.xsd', parser)
        xmlschema = etree.XMLSchema(xmlschema_doc)
        tree = etree.parse('.\\..\\xml\\bak\\'+filename, parser)
        res_str = res_str + str(tree) + "\n"
        if xmlschema.validate(tree) == True:
            res_str = res_str + "load xml configure successful" + "\n"
            substation = tree.getroot()
            
            try:
                provincecontacts = ""
                provincephones = ""
                
                for contact in substation.xpath("//ns:substation//ns:province//ns:contacts//ns:contact", namespaces={'ns': substation.nsmap[None]}):
                    provincecontacts = provincecontacts + "#" + contact.get('name')
                    provincephones = provincephones + '#' + contact.get('phone')
                try:
                    ProvinceCompanyName = substation.xpath("./ns:province/@name", namespaces={'ns': substation.nsmap[None]})[0]
                    ProvinceCompanyCode = substation.xpath("./ns:province/@code", namespaces={'ns': substation.nsmap[None]})[0]
                    
                    obj = Table_ProvinceCompany.objects.get(ProvinceCompanyName = ProvinceCompanyName)
                    res_str = res_str + "insert provincecompany "+ProvinceCompanyName+ProvinceCompanyCode+" exists." + "\n"
                except Table_ProvinceCompany.DoesNotExist:
                    try:
                        Table_ProvinceCompany.objects.create(
                            ProvinceCompanyName = ProvinceCompanyName,
                            ProvinceCompanyCode = ProvinceCompanyCode,
                            ProvinceCompanyContacts = provincecontacts,
                            ProvinceCompanyPhones = provincephones
                        )
                        res_str = res_str + "insert provincecompany "+ProvinceCompanyName+ProvinceCompanyCode+" successful." + "\n"
                    except Exception as err:
                        res_str = res_str + "Table_ProvinceCompany.objects.create: "+err.args[0] + "\n"
                except Exception as err:
                    res_str = res_str + "Table_ProvinceCompany.objects.get: " +err.args[0] + "\n"
            except Exception as err:
                res_str = res_str + "Table_ProvinceCompany.contact: " +err.args[0] + "\n"
                
            try:
                citycontacts = ""
                cityphones = ""

                for contact in substation.xpath("//ns:substation//ns:city//ns:contacts//ns:contact", namespaces={'ns': substation.nsmap[None]}):
                    citycontacts = citycontacts + "#" + contact.get('name')
                    cityphones = cityphones + '#' + contact.get('phone')
                
                try:
                    ProvinceCompanyName = substation.xpath("./ns:province//@name", namespaces={'ns': substation.nsmap[None]})[0]
                    CityCompanyName = substation.xpath("./ns:city/@name", namespaces={'ns': substation.nsmap[None]})[0]
                    CityCompanyCode = substation.xpath("./ns:city/@code", namespaces={'ns': substation.nsmap[None]})[0]
                    CityName = substation.xpath("./ns:city/@geoname", namespaces={'ns': substation.nsmap[None]})[0]
                    CityCompanyID = ProvinceCompanyCode + 'M' + CityCompanyCode 
                    obj = Table_CityCompany.objects.get(CityCompanyName = CityCompanyName)
                    res_str = res_str + "insert citycompany "+CityCompanyName+CityCompanyCode+" exists." + "\n"
                    
                except Table_CityCompany.DoesNotExist:
                    try:
                        Table_CityCompany.objects.create(
                            ProvinceCompanyID_id = ProvinceCompanyCode,
                            CityCompanyName = CityCompanyName,
                            CityCompanyCode = CityCompanyCode,
                            CityName_id = CityName,
                            CityCompanyContacts = citycontacts,
                            CityCompanyPhones = cityphones,
                            CityCompanyID = CityCompanyID
                        )   
                        res_str = res_str + "insert citycompany "+CityCompanyName+CityCompanyCode+" successful." + "\n"
                    except Exception as err:
                        res_str = res_str + "Table_CityCompany.objects.create: "+err.args[0] + "\n"
                except Exception as err:
                    res_str = res_str + "Table_CityCompany.objects.get: " +err.args[0]+ "\n"
            except Exception as err:
                res_str = res_str + "Table_CityCompany.contact: " +err.args[0] + "\n"
                

            try:
                substationcontacts = ""
                substationphones = ""

                for contact in substation.xpath("./ns:contacts/ns:contact", namespaces={'ns': substation.nsmap[None]}):
                    substationcontacts = substationcontacts + "#" + contact.get('name')
                    substationphones = substationphones + '#' + contact.get('phone')
                        
                try:
                    ProvinceCompanyName = substation.xpath("./ns:province/@name", namespaces={'ns': substation.nsmap[None]})[0]
                    CityCompanyName = substation.xpath("./ns:city/@name", namespaces={'ns': substation.nsmap[None]})[0]
                    SubstationName = substation.xpath("./ns:name/text()", namespaces={'ns': substation.nsmap[None]})[0]
                    DistrictCompanyName = substation.xpath("./ns:district/@name", namespaces={'ns': substation.nsmap[None]})[0]
                    SubstationType = substation.xpath("./ns:type/text()", namespaces={'ns': substation.nsmap[None]})[0]
                    VoltageLevel = substation.xpath("./ns:voltagelevel/text()", namespaces={'ns': substation.nsmap[None]})[0]

                    SubstationSN = substation.xpath("./ns:sn/text()", namespaces={'ns': substation.nsmap[None]})[0]
                    SubstationID = substation.xpath("./ns:province/@code", namespaces={'ns': substation.nsmap[None]})[0] \
                                + "M" \
                                + substation.xpath("./ns:city/@code", namespaces={'ns': substation.nsmap[None]})[0] \
                                + substation.xpath("./ns:sn/text()", namespaces={'ns': substation.nsmap[None]})[0]
                    ImageBayWidth = substation.xpath("./ns:imagebaywidth/text()", namespaces={'ns': substation.nsmap[None]})[0]                        
                    ImageBayHeight = substation.xpath("./ns:imagebayheight/text()", namespaces={'ns': substation.nsmap[None]})[0]            

                    obj = Table_Substation.objects.get(SubstationName = SubstationName)
                    res_str = res_str + "insert substation "+SubstationName+SubstationSN+SubstationID+" exists."+ "\n"
                except Table_Substation.DoesNotExist:
                    try:
                        Table_Substation.objects.create(
                            CityCompanyID_id = CityCompanyID,
                            SubstationName = substation.xpath("./ns:name/text()", namespaces={'ns': substation.nsmap[None]})[0],
                            DistrictCompanyName = substation.xpath("./ns:district/@name", namespaces={'ns': substation.nsmap[None]})[0],
                            SubstationType = substation.xpath("./ns:type/text()", namespaces={'ns': substation.nsmap[None]})[0],
                            VoltageLevel = substation.xpath("./ns:voltagelevel/text()", namespaces={'ns': substation.nsmap[None]})[0],
                            SubstationContacts = substationcontacts,
                            SubstationPhones = substationphones,
                            ImageBayWidth = ImageBayWidth,
                            ImageBayHeight = ImageBayHeight,
                            SubstationSN = substation.xpath("./ns:sn/text()", namespaces={'ns': substation.nsmap[None]})[0],
                            SubstationID = substation.xpath("./ns:province/@code", namespaces={'ns': substation.nsmap[None]})[0] \
                                        + "M" \
                                        + substation.xpath("./ns:city/@code", namespaces={'ns': substation.nsmap[None]})[0] \
                                        + substation.xpath("./ns:sn/text()", namespaces={'ns': substation.nsmap[None]})[0]
                        )
                        res_str = res_str + "insert substation "+SubstationName+SubstationSN+SubstationID+" successful." + "\n"
                    except Exception as err:
                        res_str = res_str + "Table_Substation.objects.create: "+err.args[0] + "\n"
                except Exception as err:
                    res_str = res_str + "Table_Substation.objects.get: " +err.args[0]+ "\n"
            except Exception as err:
                res_str = res_str + "Table_Substation.contact: " +err.args[0] + "\n"

            try:
                ConcentratorSN = substation.xpath("./ns:concentrator//ns:sn/text()", namespaces={'ns': substation.nsmap[None]})[0]
                ConcentratorID = SubstationID + 'C' + ConcentratorSN
                ConcentratorMapID = substation.xpath("./ns:concentrator//ns:mapid/text()", namespaces={'ns': substation.nsmap[None]})[0]
                ConcentratorIP = substation.xpath("./ns:concentrator//ns:ipport/text()", namespaces={'ns': substation.nsmap[None]})[0]            
                
                try:
                    obj = Table_Concentrator.objects.get(ConcentratorID = ConcentratorID)
                    res_str = res_str + "insert concentrator "+ConcentratorSN+ConcentratorID+" exists." + "\n"
                except Table_Concentrator.DoesNotExist:
                    try:
                        Table_Concentrator.objects.create(
                            SubstationID_id = SubstationID,
                            ConcentratorSN = ConcentratorSN,
                            ConcentratorID = ConcentratorID,
                            ConcentratorMapID = ConcentratorMapID,
                            ConcentratorIP = ConcentratorIP
                        )
                        res_str = res_str + "insert concentrator "+ConcentratorSN+ConcentratorID+" successful." + "\n"
                    except Exception as err:
                        res_str = res_str + "Table_Concentrator.objects.create: "+err.args[0] + "\n"
                    
            except Exception as err:
                res_str = res_str + "Table_Concentrator.contact: " +err.args[0] + "\n"
                
            for bay in substation.xpath("//ns:baymonitor", namespaces={'ns': substation.nsmap[None]}):    
                try:
                    BayName = bay.xpath("./ns:name/text()", namespaces={'ns': substation.nsmap[None]})[0]
                    BayShortName = bay.xpath("./ns:bayshortname/text()", namespaces={'ns': substation.nsmap[None]})[0]
                    BayCode = bay.xpath("./ns:code/text()", namespaces={'ns': substation.nsmap[None]})[0]
                    BayType = bay.xpath("./ns:baytype/text()", namespaces={'ns': substation.nsmap[None]})[0]
                    BayMapID = bay.xpath("./ns:mapid/text()", namespaces={'ns': substation.nsmap[None]})[0]
                    EquipmentType = bay.xpath("./ns:equipmenttype/text()", namespaces={'ns': substation.nsmap[None]})[0]
                    DataType = bay.xpath("./ns:datatype/text()", namespaces={'ns': substation.nsmap[None]})[0]
                    SetupMode = bay.xpath("./ns:setupmode/text()", namespaces={'ns': substation.nsmap[None]})[0]
                    BayComType = bay.xpath("./ns:baycomtype/text()", namespaces={'ns': substation.nsmap[None]})[0]
                    BayIPPort = bay.xpath("./ns:bayipport/text()", namespaces={'ns': substation.nsmap[None]})[0]
                    BayID = ConcentratorID \
                                    + BayType \
                                    + BayCode \
                                    + EquipmentType \
                                    + DataType \
                                    + '0'
                    LDName = bay.xpath("./ns:ldname/text()", namespaces={'ns': substation.nsmap[None]})[0]
                    LNName = bay.xpath("./ns:lnname/text()", namespaces={'ns': substation.nsmap[None]})[0]
                    LNInst = int(bay.xpath("./ns:lninst/text()", namespaces={'ns': substation.nsmap[None]})[0])
                    DevID = int(bay.xpath("./ns:devid/text()", namespaces={'ns': substation.nsmap[None]})[0])

                    DistinctNo = int(bay.xpath("./ns:distinctno/text()", namespaces={'ns': substation.nsmap[None]})[0])
                    ProductYear = int(bay.xpath("./ns:productyear/text()", namespaces={'ns': substation.nsmap[None]})[0])
                    ProductMonth = int(bay.xpath("./ns:productmonth/text()", namespaces={'ns': substation.nsmap[None]})[0])
                    
                    BayMapx = bay.xpath("./ns:baymapx/text()", namespaces={'ns': substation.nsmap[None]})[0]
                    BayMapy = bay.xpath("./ns:baymapy/text()", namespaces={'ns': substation.nsmap[None]})[0]
                    if not Table_Bay.objects.filter(BayID = BayID):
                        try:
                            tablebay = Table_Bay.objects.create(
                                ConcentratorID_id = ConcentratorID,
                                BayName = BayName,
                                BayShortName = BayShortName,
                                BayCode = BayCode,
                                BayType = BayType,
                                EquipmentType = EquipmentType,
                                DataType = DataType,
                                BayID = BayID,
                                BayMapID = BayMapID,
                                SetupMode = SetupMode,
                                BayIPPort = BayIPPort,
                                BayComType = BayComType,
                                BayMapx = BayMapx,
                                BayMapy = BayMapy
                            )
                            Table_I1Interface.objects.create(
                                BayID=tablebay,
                                LDName=LDName,
                                LNName=LNName,
                                LNInst=LNInst,
                                DevID=DevID,
                                DistinctNo=DistinctNo,
                                ProductMonth=ProductMonth,
                                ProductYear=ProductYear
                            )
                            Table_AlgorithmSetting.objects.create(
                                BayID=tablebay
                            )
                            Table_AlgorithmState.objects.create(
                                BayID=tablebay
                            )
                            res_str = res_str + "insert bay "+BayName+BayCode+BayID+" successful." + "\n"
                        except Exception as err:
                            res_str = res_str + "Table_Bay.objects.create: "+err.args[0] + "\n"
                    else:
                        res_str = res_str + "insert bay "+BayName+BayCode+BayID+" exists." + "\n"
                    
                    for phasemonitor in bay.xpath("./ns:phasemonitors/ns:phasemonitor", namespaces={'ns': substation.nsmap[None]}):
                        try:
                            PhaseName = phasemonitor.xpath("./ns:phase/text()", namespaces={'ns': substation.nsmap[None]})[0]
                            SensorID = phasemonitor.xpath("./ns:sensorid/text()", namespaces={'ns': substation.nsmap[None]})[0]
                            SensorProtocol = phasemonitor.xpath("./ns:protocol/text()", namespaces={'ns': substation.nsmap[None]})[0]
                            SensorScale = phasemonitor.xpath("./ns:scale/text()", namespaces={'ns': substation.nsmap[None]})[0]
                            SensorManufactor = phasemonitor.xpath("./ns:manufacter/text()", namespaces={'ns': substation.nsmap[None]})[0]
                            SensorVersionNo = phasemonitor.xpath("./ns:serialno/text()", namespaces={'ns': substation.nsmap[None]})[0]
                            SensorProductTime = phasemonitor.xpath("./ns:producetime/text()", namespaces={'ns': substation.nsmap[None]})[0]
                            
                            Baud =  phasemonitor.xpath("./ns:baud/text()", namespaces={'ns': substation.nsmap[None]})[0]
                            Parity = phasemonitor.xpath("./ns:parity/text()", namespaces={'ns': substation.nsmap[None]})[0]
                            
                            PhaseID = BayID[0:16] + PhaseName
                            
                            PhaseMapID = phasemonitor.xpath("./ns:mapid/text()", namespaces={'ns': substation.nsmap[None]})[0]
                            
                            Table_Phase.objects.get(PhaseID = PhaseID)
                            res_str = res_str + "insert phase "+PhaseName+PhaseID+" exists." + "\n"
                        except Table_Phase.DoesNotExist:
                            try:
                                Table_Phase.objects.create(
                                    BayID_id = BayID,
                                    PhaseName = PhaseName,
                                    Baud = Baud,
                                    Parity = Parity,
                                    SensorID = SensorID,
                                    SensorProtocol = SensorProtocol,
                                    SensorScale = SensorScale,
                                    SensorManufactor = SensorManufactor,
                                    SensorVersionNo = SensorVersionNo,
                                    SensorProductTime = SensorProductTime,
                                    PhaseID = PhaseID,
                                    PhaseMapID = PhaseMapID
                                )
                                res_str = res_str + "insert phase "+PhaseName+PhaseID+" info successful." + "\n"
                            except Exception as err:
                                res_str = res_str + "Table_Phase.objects.create: "+err.args[0] + "\n"
                        
                        except Exception as err:
                            res_str = res_str + "Table_Phase.objects.get: "+err.args[0] + "\n"
                            
                except Exception as err:
                    res_str = res_str + "Table_Bay.objects.get: "+err.args[0] + "\n"
        else:
            res_str = res_str + 'xml invalid!' + "\n"
            xmlschema.assert_(tree)
            
    except Exception as err:
        res_str = res_str + "xml:"+err.args[0] + "\n"+'123'
    
    return res_str

