from django.contrib import admin
from app.models import *
from django import forms
from django.forms import fields as Ffields
from django.forms import widgets as Fwidgets
from django.contrib.admin import SimpleListFilter
from datetime import datetime,timedelta

admin.site.site_header = ''#
admin.site.site_title = ''#

admin.site.index_title = "欢迎登陆"
# admin.site.site_url = '/'

# admin.site._empty_value_display = '-'

# admin.site.login_form = None
# admin.site.index_template = None
# admin.site.app_index_template = None
# admin.site.login_template = None
# admin.site.logout_template = None
# admin.site.password_change_template = None
# admin.site.password_change_done_template = None

# def create_model(name, fields = None, app_label = '', module = '', options = None, admin_opts = None):
    # """
    # Create specified model
    # """
    # class Meta:
        # # Using type('Meta', ...) gives a dictproxy error during model creation
        # pass

    # if app_label:
        # # app_label must be set using the Meta inner class
        # setattr(Meta, 'app_label', app_label)

    # # Update Meta with any options that were provided
    # if options is not None:
        # for key, value in options.items():
            # setattr(Meta, key, value)

    # # Set up a dictionary to simulate declarations within a class
    # attrs = {'__module__': module, 'Meta': Meta}

    # # Add in any fields that were provided
    # if fields:
        # attrs.update(fields)

    # # Create the class, which automatically triggers ModelBase processing
    # model = type(name, (models.Model,), attrs)

    # # Create an Admin class if admin options were provided
    # if admin_opts is not None:
        # class Admin(admin.ModelAdmin):
            # pass
        # for key, value in admin_opts.items():            
            # setattr(Admin, key, value)
        # admin.site.register(model, Admin)

    # return model   

# fields = {
    # 'first_name': models.CharField(max_length=255),
    # 'last_name': models.CharField(max_length=255),
    # #'__str__': lambda self: '%s %s' (self.first_name, self.last_name),
# }    

# options = {
    # 'ordering': ['last_name', 'first_name'],
    # 'verbose_name': 'person',
# }

# admin_opts = {
    # 'list_display': ('first_name', 'last_name')
# }
    
# # Person = create_model(
    # # 'Person', 
    # # fields,
    # # options = options,
    # # admin_opts = admin_opts,
    # # app_label = 'app',
    # # module = 'app.models',
# # )

# # Register your models here.

# class provincemodelform(forms.ModelForm):
    # class Meta:
        # model = Table_ProvinceCompany
        # #exclude = ['ProvinceCompanyPhones','ProvinceCompanyContacts']
        # fields = "__all__"
        # labels = {
            # 'ProvinceCompanyContacts':'联系人',
            # 'ProvinceCompanyPhones':'联系电话',
        # }
        # help_texts = {
            # 'ProvinceCompanyName': '如：国网四川省电力公司',
            # 'ProvinceCompanyCode': '2位字符，如：19',
            # 'ProvinceCompanyContacts': '以#开头，可填写两位联系人，如：#张三#李四',
            # 'ProvinceCompanyPhones': '以#开头，可填写两个电话，且与联系人对应，如：#13588888888#13599999999',
        # }
        # error_messages = {
            # "__all__":{
                # 'required': '不能为空',
                # 'invalid': '格式错误'
            # },
            # 'ProvinceCompanyCode': {
                # 'required': '代码不能为空',
                # 'invalid': '代码格式错误',
            # },
            # 'ProvinceCompanyName': {
                # 'required': '名称不能为空',
                # 'invalid': '名称格式错误',
            # }            
        # }
        # widgets = {
            # #'ProvinceCompanyName': Fwidgets.Textarea(attrs={'class': 'c1'})
        # }


class ProvinceCompanyContent(admin.ModelAdmin):
    list_display = ('ProvinceCompanyCode', 'ProvinceCompanyName', 'ProvinceCompanyContacts','ProvinceCompanyPhones')
    search_fields = ('ProvinceCompanyName',)
    list_per_page = 20
    ordering = ('ProvinceCompanyCode',)
    list_display_links = ('ProvinceCompanyCode',) 

# class citymodelform(forms.ModelForm):
    # class Meta:
        # model = Table_CityCompany
        # # exclude = ['CityCompanyPhones','CityCompanyContacts']
        # fields = "__all__"
        # labels = {
            # 'CityCompanyContacts':'联系人',
            # 'CityCompanyPhones':'联系电话',
        # }
        # help_texts = {
            # 'CityCompanyName': '如：成都市电力公司',
            # 'CityCompanyCode': '2位字符，如：01',
            # 'CityCompanyContacts': '以#开头，可填写两位联系人，如：#张三#李四',
            # 'CityCompanyPhones': '以#开头，可填写两个电话，且与联系人对应，如：#13588888888#13599999999',
        # }
        # error_messages = {
            # "__all__":{
                # 'required': '不能为空',
                # 'invalid': '格式错误'
            # },
            # 'CityCompanyCode': {
                # 'required': '代码不能为空',
                # 'invalid': '代码格式错误',
            # },
            # 'CityCompanyName': {
                # 'required': '名称不能为空',
                # 'invalid': '名称格式错误',
            # }            
        # }
        # widgets = {
            # #'CityCompanyName': Fwidgets.Textarea(attrs={'class': 'c1'})
        # }
        
class CityCompanyContent(admin.ModelAdmin):
    list_display = ('CityCompanyName', '省公司名称', 'CityCompanyCode', 'CityCompanyContacts', 'CityCompanyPhones',"CityName",'CityCompanyID')
    exclude = ('CityCompanyID',)
    search_fields = ('CityCompanyName', )
    list_per_page = 20
    ordering = ('CityCompanyCode', )
    list_display_links = ('CityCompanyName',)
    # autocomplete_fields=('CityName',)

    def 省公司名称(self,obj):
        return obj.ProvinceCompanyID.ProvinceCompanyName
        
    def save_model(self, request, obj, form, change): 

        obj.CityCompanyID = obj.ProvinceCompanyID.ProvinceCompanyCode+"M"+obj.CityCompanyCode
        
        super().save_model(request, obj, form, change)
        

class SubstationContent(admin.ModelAdmin):
    #fields = ('ProvinceCompanyName', 'CityCompanyName', 'DistrictCompanyName', 'SubstationName', 'SubstationType', 'VoltageLevel', 'SubstationContacts', 'SubstationPhones', )


    list_display = ("地市公司名称", 'SubstationName', 'DistrictCompanyName', 'SubstationType', 'VoltageLevel', 'SubstationContacts', 'SubstationPhones',"SubstationSN",'SubstationID',)
    exclude = ('SubstationID',)
    search_fields = ('SubstationName', )
    list_per_page = 20
    list_display_links = ('SubstationID', 'SubstationName')        
    
    def 地市公司名称(self,obj):
        return obj.CityCompanyID.CityCompanyName

    def save_model(self, request, obj, form, change):
        obj.SubstationID = obj.CityCompanyID.CityCompanyID+obj.SubstationSN
        super().save_model(request, obj, form, change)

# class PhaseInline(admin.TabularInline):
    # extra = 0
    # model = Table_Phase
    # list_display = ('PhaseName', 'SensorID', 'SensorProtocol', 'SensorScale', 'SensorManufactor', 'SensorProductTime', 'SensorVersionNo', 'PhaseMapID')
    # exclude = ('PhaseID', 'SensorRealtimeData', 'LastConnectTime', 'SensorConnectState')
    
    # list_per_page = 20
    # ordering = ('PhaseID', )
    # list_display_links = ('PhaseName',)
    # empty_value_display = '-'    
   
    # def save_model(self, request, obj, form, change):
        # obj.PhaseID = str(obj.BayID)[0:16] + obj.PhaseName
        # print(obj.PhaseID)
                       
        # super().save_model(request, obj, form, change)
    
class ConcentratorContent(admin.ModelAdmin):
    pass

# class BayContent(admin.ModelAdmin):
    # list_display = ('BayID', 'ProvinceCompanyName', 'CityCompanyName', 'SubstationName', 'BayName', 'EquipmentType', 'DataType', 'I1Interface', 'PollingMode', 'Interface', 'Protocol', 'CreateTime', 'BayMapID')
    # search_fields = ('BayName', )
    # list_per_page = 20
    # ordering = ('BayID', )
    # list_display_links = ('BayID', 'BayName')
    # exclude = ('BayID', 'CreateTime')
    # raw_id_fields = ('ProvinceCompanyName', 'CityCompanyName', 'SubstationID')

    # # def InterfaceInfo(self, obj):
        # # return obj.Interface + ':' + str(obj.Baud) + ':' + str(obj.DataBit) + obj.Parity + str(obj.StopBit)

    # # InterfaceInfo.short_description = "通信接口"

    # def I1Interface(self, obj):
        # return obj.LDName + '/' + obj.LNName + str(obj.LNInst)
    
    # I1Interface.short_description = "I1接口"
    
    # def SubstationName(self, obj):
        # if not str(obj.SubstationID).split(":") is None:
            # return str(obj.SubstationID).split(":")[0]
        # else:
            # return '-'
    
    # SubstationName.short_description = "变电站名称"
    
    # def save_model(self, request, obj, form, change):
        # # obj.BayID = Table_ProvinceCompany.objects.get(ProvinceCompanyName = obj.ProvinceCompanyName).ProvinceCompanyCode \
                            # # + 'M' \
                            # # + Table_CityCompany.objects.get(CityCompanyName = obj.CityCompanyName).CityCompanyCode \
                            # # + Table_Substation.objects.get(SubstationName = obj.SubstationName).SubstationSN \
                            # # + 'J' \
                            # # + obj.BayCode \
                            # # + obj.BayType \
                            # # + obj.EquipmentType \
                            # # + obj.DataType \
                            # # + '00'
        # obj.BayID = str(obj.SubstationID).split(":")[1] \
                            # + 'J' \
                            # + obj.BayCode \
                            # + obj.BayType \
                            # + obj.EquipmentType \
                            # + obj.DataType \
                            # + '00'                                    
        # super().save_model(request, obj, form, change)

# class PhaseContent(admin.ModelAdmin):
    # list_display = ('PhaseID', 'ProvinceCompanyName', 'CityCompanyName', 'SubstationName', 'BayName', 'PhaseName', 'SensorID', 'SensorProtocol', 'InterfaceInfo', 'SensorScale', 'SensorManufactor', 'SensorProductTime', 'SensorVersionNo', 'PhaseMapID')
    # exclude = ('PhaseID', 'SensorRealtimeData', 'LastConnectTime', 'SensorConnectState')
    
    # list_per_page = 20
    # ordering = ('PhaseID', )
    # list_display_links = ('PhaseID', 'PhaseName')
    # empty_value_display = '-'
    
    # #list_filter = ('SubstationName', )     
    
    # raw_id_fields = ('ProvinceCompanyName', 'CityCompanyName', 'SubstationID','BayID')

    # def InterfaceInfo(self, obj):
        # return str(obj.Baud) + ':' + str(obj.DataBit) + obj.Parity + str(obj.StopBit)

    # InterfaceInfo.short_description = "通信接口"
   
    
     
      
      
    # def SubstationName(self, obj):
        # if not str(obj.SubstationID).split(":") is None:
            # return str(obj.SubstationID).split(":")[0]
        # else:
            # return '-'
    
    # SubstationName.short_description = "变电站名称"
    
    # def BayName(self, obj):
        # if not str(obj.BayID).split(":") is None:
            # return str(obj.BayID).split(":")[0]
        # else:
            # return '-'
    
    # BayName.short_description = "间隔名称"

    # def save_model(self, request, obj, form, change):
        # # obj.PhaseID = Table_ProvinceCompany.objects.get(ProvinceCompanyName = obj.ProvinceCompanyName).ProvinceCompanyCode \
                            # # + 'M' \
                            # # + Table_CityCompany.objects.get(CityCompanyName = obj.CityCompanyName).CityCompanyCode \
                            # # + Table_Substation.objects.get(SubstationName = obj.SubstationName).SubstationSN \
                            # # + 'J' \
                            # # + obj.BayCode \
                            # # + obj.BayType \
                            # # + obj.EquipmentType \
                            # # + obj.DataType \
                            # # + '00'              
        # strBayID = str(obj.BayID).split(":")[1]
        # obj.BayID = Table_Bay.objects.get(BayID = strBayID)       
        # obj.PhaseID = strBayID[0:16] + str(obj.PhaseName)        
        # super().save_model(request, obj, form, change)


# class DataContent(admin.ModelAdmin):
    # list_display = ('SubstationName', 'BayName', 'pa', 'pb', 'pc', 'pn', 'pab', 'pbc', 'pca', 'pn', 'time')
        
    # list_per_page = 1000
    # ordering = ('bay', )          
    # list_display_links = ('BayName', )
    
    # def BayName(self, obj):
        # if not str(obj.bay).split(":") is None:
            # return str(obj.bay).split(":")[0]
        # else:
            # return '-'
    
    # BayName.short_description = "间隔名称"

    # def SubstationName(self, obj):
        # if not str(obj.bay).split(":") is None:
            # bayid = str(obj.bay).split(":")[1]            
            # return Table_Substation.objects.get(SubstationID = bayid[0:7]).SubstationName
        # else:
            # return '-'
    
    # SubstationName.short_description = "变电站名称"    
        
class AlgorithmLogContent(admin.ModelAdmin):
    list_display = ("BayName","LogTime","Content")
    def BayName(self,obj):
        return obj.BayID.BayName

class AlgorithmStateContent(admin.ModelAdmin):
    list_display = ('BayName','Pa0','Pb0','Pc0','Pab0','Pbc0','Pac0','Pn0','Pan0','Pbn0','Pcn0','Pda','Pdb','Pdc','Pdn',
        'AlgEnable','AlgEnableTime','AlgCalcInitialValueStart','AlgCalcInitialValueStartTime','AlgCalcInitialValueLastTime',
        'AlgCalcInitialValueDone','AlgCalcInitialValueDoneTime','AlgCalcWarningValueStart','AlgCalcWarningValueStartTime','AlgCalcWarningValueLastTime')
    exclude = ('AlgEnableTime','AlgCalcInitialValueStart','AlgCalcInitialValueStartTime','AlgCalcInitialValueLastTime','AlgCalcInitialValueDone',
        'AlgCalcInitialValueDoneTime','AlgCalcWarningValueStart','AlgCalcWarningValueStartTime','AlgCalcWarningValueLastTime')

    def save_model(self, request, obj, form, change): 
        if obj.AlgEnable:
            try:
                obj.AlgEnableTime = datetime.now()
                m = obj.BayID.table_algorithmsetting.DeltaTime1
                obj.AlgCalcInitialValueStartTime = datetime.now()+timedelta(minutes=+m)    
                n = obj.BayID.table_algorithmsetting.DeltaTime1
                obj.AlgCalcWarningValueStartTime = datetime.now()+timedelta(minutes=+m)    
            except:
                obj.AlgEnable = False
                obj.AlgEnableTime = datetime.strptime('2000-01-01','%Y-%m-%d')
                obj.AlgCalcInitialValueStartTime = datetime.strptime('2000-01-01','%Y-%m-%d')
                obj.AlgCalcWarningValueStartTime = datetime.strptime('2000-01-01','%Y-%m-%d')
        else:
            obj.AlgEnableTime = datetime.strptime('2000-01-01','%Y-%m-%d')
            obj.AlgCalcInitialValueStartTime = datetime.strptime('2000-01-01','%Y-%m-%d')
            obj.AlgCalcWarningValueStartTime = datetime.strptime('2000-01-01','%Y-%m-%d')

        obj.AlgCalcInitialValueLastTime=datetime.strptime('2000-01-01','%Y-%m-%d')
        obj.AlgCalcInitialValueDoneTime=datetime.strptime('2000-01-01','%Y-%m-%d')
        
        obj.AlgCalcWarningValueLastTime=datetime.strptime('2000-01-01','%Y-%m-%d')        
        obj.Pa0 = 0.0
        obj.Pb0 = 0.0
        obj.Pc0 = 0.0
        obj.Pab0 = 0.0
        obj.Pbc0 = 0.0
        obj.Pac0 = 0.0
        obj.Pn0 = 0.0
        obj.Pan0 = 0.0
        obj.Pbn0 = 0.0
        obj.Pcn0 = 0.0
        obj.Pa1 = 0.0
        obj.Pb1 = 0.0
        obj.Pc1 = 0.0
        obj.Pn1 = 0.0
        obj.AlgCalcInitialValueStart = False
        obj.AlgCalcInitialValueDone = False
        obj.AlgCalcWarningValueStart = False
        super().save_model(request, obj, form, change)
        

    def BayName(self,obj):
        return obj.BayID.BayName

class CityContent(admin.ModelAdmin):
    list_display = ('ProvinceName','CityName')
    search_fields = ('CityName',)

class AlgorithmSettingContent(admin.ModelAdmin):
    list_display = ('BayName','Pet_CTPT','Pt_CTPT','Ptd_CTPT','Ptdu_CTPT','Ptdc_CTPT','Ptdcu_CTPT','Pt_TG','Ptu_TG',
    'Ptd_TG','Ptdu_TG','Ptc_TG','Ptdc_TG','Ptdcu_TG','Ptcd','Ptcd_R1','Ptcd_R2','Pd_YC','DeltaTime1','DeltaTime2','DeltaTime3','DeltaTime4')
    
    def BayName(self,obj):
        return obj.BayID.BayName

admin.site.register(Table_ProvinceCompany, ProvinceCompanyContent)
admin.site.register(Table_CityCompany, CityCompanyContent)
admin.site.register(Table_Substation, SubstationContent)
admin.site.register(Table_Concentrator,ConcentratorContent)
# admin.site.register(Table_Bay, BayContent)
# admin.site.register(Table_Phase, PhaseContent)
# admin.site.register(Table_RealtimeData, DataContent)
# admin.site.register(Table_HistoryData, DataContent)


# admin.site.register(Table_ProvinceCompany)
# admin.site.register(Table_CityCompany)
admin.site.register(Table_City,CityContent)
# admin.site.register(Table_Substation)
admin.site.register(Table_Bay)
admin.site.register(Table_Phase)
admin.site.register(Table_RealtimeData)
admin.site.register(Table_HistoryData)
admin.site.register(Table_I1Interface)
admin.site.register(Table_Log)
admin.site.register(Table_MessageRecv)
admin.site.register(Table_MessageSend)
admin.site.register(Table_Warning)

admin.site.register(Table_ConcentratorState)
# admin.site.register(Table_BayState)
admin.site.register(Table_TreePermission) 
admin.site.register(Table_FunctionPermission)
admin.site.register(Table_AlgorithmLog,AlgorithmLogContent)
admin.site.register(Table_AlgorithmState,AlgorithmStateContent)
admin.site.register(Table_AlgorithmSetting,AlgorithmSettingContent)