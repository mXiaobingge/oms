# -*- coding: utf-8 -*-

from django.db import models
from django.core.validators import MinLengthValidator
from django.contrib.auth.models import User
from django.contrib.auth.models import Permission
from django.db.backends.mysql.base import DatabaseWrapper
import datetime
DatabaseWrapper.data_types['DateTimeField'] = 'datetime'

# Create your models here.
class Table_ProvinceCompany(models.Model):
    ProvinceCompanyName = models.CharField(max_length = 64, verbose_name = "省公司名称", unique = True)
    ProvinceCompanyCode = models.CharField(max_length = 2, validators=[MinLengthValidator(2)], verbose_name = "省公司代码", primary_key = True)
    ProvinceCompanyContacts = models.CharField(max_length = 64, verbose_name = "联系人", blank = True, null = True) #5个联系人
    ProvinceCompanyPhones = models.CharField(max_length = 64, verbose_name = "电话", blank = True, null = True) #5个电话号码
    
    def __str__(self):
        return self.ProvinceCompanyName
        
    class Meta:
        verbose_name = "省公司"  #单数
        verbose_name_plural = "省公司"  #复数
   
# 省市表 生成地图时需要
# 给市加上这个外键
class Table_City(models.Model):
    ProvinceName = models.CharField(max_length=40,verbose_name="省名")
    CityName = models.CharField(max_length=40,verbose_name="市名",unique=True)
    
    def __str__(self):
        return self.CityName
        
    class Meta:
        verbose_name = "省市表"  #单数
        verbose_name_plural = "省市表"  #复数
class Table_CityCompany(models.Model):
    ProvinceCompanyID = models.ForeignKey(Table_ProvinceCompany, to_field = 'ProvinceCompanyCode', verbose_name="省公司名称", on_delete = models.CASCADE, null = True)    
    CityCompanyName = models.CharField(max_length = 64, verbose_name = "市公司名称", unique = True)
    CityCompanyCode = models.CharField(max_length = 2, validators = [MinLengthValidator(2)], verbose_name = "市公司代码")
    CityCompanyContacts = models.CharField(max_length = 64, verbose_name = "联系人", blank = True, null = True) #10个联系人
    CityCompanyPhones = models.CharField(max_length = 64, verbose_name = "电话", blank = True, null = True)
    CityCompanyID = models.CharField(max_length = 5, validators = [MinLengthValidator(5)], verbose_name = "市公司ID", primary_key = True, blank = True)
    CityName = models.ForeignKey(Table_City,to_field="CityName",verbose_name="所属市",on_delete=models.CASCADE, null = True)
    
    def __str__(self):
        return self.CityCompanyName
    
    class Meta:
        verbose_name = "地市公司"  #单数
        verbose_name_plural = "地市公司"   #复数 
    
class Table_Substation(models.Model):  
    CityCompanyID = models.ForeignKey(Table_CityCompany, to_field = 'CityCompanyID', verbose_name="市公司名称", on_delete = models.CASCADE)    
    SubstationName = models.CharField(
        max_length=64,
        verbose_name = "变电站名称",
        unique = True,
        help_text="如500kV科学城变电站")
        
    DistrictCompanyName = models.CharField(
        max_length=64,
        verbose_name = "县公司名称", 
        blank = True,
        null=True,
        help_text="如天府新区供电局")
    
    SubstationType = models.CharField(
        default="变电站",
        choices=(("变电站", "变电站"), ("换流站", "换流站"), ("水电站", "水电站"), ("火电站", "火电站")), 
        max_length=8,
        verbose_name="类别")
    VoltageLevel = models.CharField(
        default="220kV",
        choices=(("35kV", "35kV"), ("66kV", "66kV"), ("110kV", "110kV"), ("220kV", "220kV"), ("330kV", "330kV"), ("400kV", "400kV"), ("500kV", "500kV"),("750kV", "750kV"),("800kV", "800kV"),("1000kV", "1000kV")), 
        max_length=8,
        verbose_name="电压等级")
    
    SubstationContacts = models.CharField(
        default="#成都佳信",
        max_length = 64,
        verbose_name = "联系人", 
        blank = True,
        help_text = '以#开头，可填写两位联系人，如：#张三#李四'
    )
    SubstationPhones = models.CharField(
        default="#13550265109",
        max_length = 255, 
        verbose_name="联系电话",
        blank = True,
        help_text = '以#开头，可填写两个电话，且与联系人对应，如：#13588888888#13599999999',
    )        
    
    SubstationSN = models.CharField(
        default = '01', 
        max_length = 2, 
        validators = [MinLengthValidator(2)], 
        verbose_name = "流水号",
        help_text = "两位字符，如 01，同一地市公司下流水号唯一"
    )
    
    SubstationID = models.CharField(
        max_length=7,
        validators=[MinLengthValidator(7)], 
        verbose_name="变电站ID",
        primary_key=True,
        blank = True)
        
    ImageBayWidth=models.DecimalField(default = 0.00,max_digits=4, decimal_places=2, verbose_name ="一次接线图的间隔宽比") 
    ImageBayHeight=models.DecimalField(default = 0.00,max_digits=4, decimal_places=2, verbose_name ="一次接线图的间隔长比")
    def __str__(self):
        return self.SubstationName + ":" + self.SubstationID
    
    class Meta:
        verbose_name = "变电站"  #单数
        verbose_name_plural = "变电站"   #复数
        
class Table_Concentrator(models.Model):
    SubstationID = models.ForeignKey(Table_Substation, to_field = 'SubstationID', verbose_name="变电站名称", on_delete = models.CASCADE)       
    ConcentratorSN = models.CharField(
        default = '1',
        max_length = 1,
        validators = [MinLengthValidator(1)], 
        verbose_name = "流水号",
        help_text = "一位字符，如 1~9，同一站内流水号唯一"
    )
    
    ConcentratorID = models.CharField(max_length = 9, validators = [MinLengthValidator(9)], verbose_name = "汇集单元ID", primary_key = True, blank = True)
    ConcentratorMapID = models.CharField(default = '0', max_length = 24, verbose_name = "汇集单元映射ID", blank = True)       
    
    ConcentratorIP = models.CharField(
        max_length=30,
        verbose_name="汇集单元IP",
        default="localhost:8000",
        blank = True,
    ) 
    def __str__(self):
        return "汇集单元" + self.ConcentratorSN
    
    class Meta:
        verbose_name = "汇集单元"  #单数
        verbose_name_plural = "汇集单元"   #复数
    
class Table_Bay(models.Model):
    ConcentratorID=models.ForeignKey(
        Table_Concentrator,
        to_field='ConcentratorID',
        verbose_name="汇集单元名称",
        on_delete=models.CASCADE)
    BayName = models.CharField(
        max_length=64,
        verbose_name = "间隔名称",
        help_text="如2号主变高压侧")
    BayShortName = models.CharField(max_length=64,null=True)
    BayType = models.CharField(
        default = "L", 
        choices=(("L", "线路"), ("T", "主变"), ("M", "母线"), ("N", "母联"), ("E", "其它")), 
        max_length=1,
        validators=[MinLengthValidator(1)],
        verbose_name = "间隔类型",
        help_text="ID组成部分")
    
    BayCode = models.CharField(
        max_length = 4, 
        validators = [MinLengthValidator(4)], 
        verbose_name = "间隔代码",
        help_text="ID组成部分。4位字符，按该间隔调度号命名。不足4位，在前面补0。如261间隔，应设置为0261")
        
    EquipmentType=models.CharField(
        default="C",
        choices=(("P","PT"),("C","CT"),("G","套管"),("E","其它")),
        max_length=1,
        validators=[MinLengthValidator(1)],
        verbose_name="设备类型",
        help_text="ID组成部分")
    
    DataType=models.CharField(
        default="P",
        choices=(("P","油压"),("D","局放"),("T","温度"),("L","介损"),("E","其它")),
        max_length=1,
        validators=[MinLengthValidator(1)],
        verbose_name="物理量",
        help_text="ID组成部分")
    GroupNo = models.CharField(
        default='1',
        max_length = 1, 
        validators = [MinLengthValidator(1)], 
        verbose_name="采集组别")
    SetupMode=models.CharField(
        default='1',
        max_length=1,
        validators=[MinLengthValidator(1)],
        choices=(("1","三绝"),("2","四绝")),
        verbose_name="传感器配置")
    BayComType=models.CharField(
        default='1',
        max_length=1,
        validators=[MinLengthValidator(1)],
        choices=(("1","串口"),("2","网口")),
        verbose_name="通信类型")
    BayIPPort=models.CharField(
        default='192.168.1.2:8000',
        max_length=20,
        verbose_name="IP")
    BayID=models.CharField(
        max_length=17,
        validators=[MinLengthValidator(17)],
        verbose_name="间隔ID",
        primary_key=True,
        blank=True)
    
    BayMapID=models.CharField(
        default='0',
        max_length=24,
        verbose_name="I2接口",
        blank=True)

    BayMapx = models.DecimalField(default = 0.00,max_digits=4,verbose_name="一次性接线图坐标x", decimal_places=2)
    BayMapy = models.DecimalField(default = 0.00,max_digits=4,verbose_name="一次性接线图坐标y", decimal_places=2) 
    def __str__(self):
        return self.BayName + ":" + self.BayID
        
    class Meta:
        verbose_name = "间隔"  #单数
        verbose_name_plural = "间隔"   #复数    
        
class Table_Phase(models.Model):
    BayID=models.ForeignKey(
        Table_Bay,
        to_field='BayID',
        verbose_name="间隔名称",
        on_delete=models.CASCADE)
    
    PhaseName=models.CharField(
        choices=(("A","A相"),("B","B相"),("C","C相"),("N","N相")),
        max_length=1,
        validators=[MinLengthValidator(1)],
        verbose_name="相别")
    
    SensorID = models.IntegerField(
        default = 1,
        verbose_name = "传感器ID",
        help_text="十进制")
    
    SensorProtocol=models.CharField(
        default='MPM478X',
        max_length = 10, 
        verbose_name="通信协议")
        
    DataBit=models.IntegerField(
        default=8,
        choices=((5,5),(6,6),(7,7),(8,8)),
        verbose_name="数据位")
        
    Baud=models.IntegerField(
        default=9600,
        choices=((1200,1200),(2400,2400),(4800,4800),(9600,9600),(14400,14400),(19200,19200),(38400,38400),(56000,56000),(115200,115200),(194000,194000)),
        verbose_name="波特率")
    
    Parity=models.CharField(
        default="N",
        choices=(("N","NONE"),("O","ODD"),("E","EVEN")),
        verbose_name="校验位",
        max_length=1)
    StopBit=models.IntegerField(
        default=1,
        choices=((1,1),(2,2)),
        verbose_name="停止位")
    
    SensorScale=models.CharField(
        default="0~+50kPa",
        max_length=16,
        verbose_name="量程")
    
    SensorConnectState=models.BooleanField(default=False,verbose_name="通信状态")
    SensorDataState=models.BooleanField(default=False,verbose_name="数据状态")
    LastConnectTime = models.DateTimeField(
        default=datetime.datetime.strptime('2000-01-01','%Y-%m-%d'),
        verbose_name="最近一次成功采集时间")
    
    SensorManufactor = models.CharField(
        default = "microsensors", 
        max_length=64,
        verbose_name="生产厂家")
        
    SensorProductTime = models.CharField(
        default = datetime.datetime.strptime('2000-01-01','%Y-%m-%d'),
        max_length=16,
        verbose_name="生产年月日",
        blank=True)
    SensorVersionNo=models.CharField(
        default="SN104333",
        max_length = 20, 
        verbose_name="序列号",
        blank=True)
    
    SensorRealtimeData=models.SmallIntegerField(default=-4000)
    SensorRealtimeData1=models.SmallIntegerField(default=-4000)
    SensorRealtimeData2=models.SmallIntegerField(default=-4000)
    SensorRealtimeData3=models.SmallIntegerField(default=-4000)
    
    PhaseID=models.CharField(
        max_length=17,
        validators=[MinLengthValidator(17)],
        verbose_name="系统ID",
        primary_key=True,
        blank=True)
    PhaseMapID = models.CharField(default = '0', max_length = 24, verbose_name = "I2接口", blank = True)
    
    TotalFailedCount = models.IntegerField(default = 0)
    NowFailedCount = models.IntegerField(default = 0)
    
    def __str__(self):
        return self.BayID.BayName+self.PhaseName

    class Meta:
        verbose_name = "传感器"  #单数
        verbose_name_plural = "传感器"   #复数
        
class Table_RealtimeData(models.Model):
    bay = models.ForeignKey(Table_Bay, to_field = 'BayID', verbose_name = "间隔名称", on_delete = models.CASCADE)
    pa = models.SmallIntegerField(verbose_name = "pa ", null = True, blank = True)
    pb = models.SmallIntegerField(verbose_name = "pb ", null = True, blank = True)
    pc = models.SmallIntegerField(verbose_name = "pc ", null = True, blank = True)
    pn = models.SmallIntegerField(verbose_name = "pn ", null = True, blank = True)
    
    pab = models.SmallIntegerField(verbose_name = "pab ", null = True, blank = True)
    pbc = models.SmallIntegerField(verbose_name = "pbc ", null = True, blank = True)
    pac = models.SmallIntegerField(verbose_name = "pac ", null = True, blank = True)
    
    pan = models.SmallIntegerField(default=0, verbose_name = "pan ", null = True, blank = True)
    pbn = models.SmallIntegerField(default=0, verbose_name = "pbn ", null = True, blank = True)
    pcn = models.SmallIntegerField(default=0, verbose_name = "pcn ", null = True, blank = True)
    temperature = models.SmallIntegerField(default=-1000, verbose_name = "pcn ", null = True, blank = True)
    airpress = models.SmallIntegerField(default=-1000, verbose_name = "pcn ", null = True, blank = True)
    pa_valid = models.BooleanField(default=False)
    pb_valid = models.BooleanField(default=False)
    pc_valid = models.BooleanField(default=False)
    pn_valid = models.BooleanField(default=False)
    pt_valid = models.BooleanField(default=False,db_index=True)
    
    time = models.DateTimeField(verbose_name = "time", db_index = True)
    
    def __str__(self):
        return self.bay.BayName + self.time.strftime("%Y-%m-%d %H:%M:%S")

    class Meta:
        verbose_name = "实时数据表"  #单数
        verbose_name_plural = "实时数据表"   #复数

class Table_HistoryData(models.Model):
    bay = models.ForeignKey(Table_Bay, to_field = 'BayID', verbose_name = "间隔名称", on_delete = models.CASCADE)
    pa = models.SmallIntegerField(verbose_name = "pa ", null = True, blank = True)
    pb = models.SmallIntegerField(verbose_name = "pb ", null = True, blank = True)
    pc = models.SmallIntegerField(verbose_name = "pc ", null = True, blank = True)
    pn = models.SmallIntegerField(verbose_name = "pn ", null = True, blank = True)
    
    pab = models.SmallIntegerField(verbose_name = "pab ", null = True, blank = True)
    pbc = models.SmallIntegerField(verbose_name = "pbc ", null = True, blank = True)
    pac = models.SmallIntegerField(verbose_name = "pac ", null = True, blank = True)
    
    pan = models.SmallIntegerField(default=0, verbose_name = "pan ", null = True, blank = True)
    pbn = models.SmallIntegerField(default=0, verbose_name = "pbn ", null = True, blank = True)
    pcn = models.SmallIntegerField(default=0, verbose_name = "pcn ", null = True, blank = True)
    temperature = models.SmallIntegerField(default=0, verbose_name = "pcn ", null = True, blank = True)
    airpress = models.SmallIntegerField(default=0, verbose_name = "pcn ", null = True, blank = True)
    pa_valid = models.BooleanField(default=False)
    pb_valid = models.BooleanField(default=False)
    pc_valid = models.BooleanField(default=False)
    pn_valid = models.BooleanField(default=False)
    pt_valid = models.BooleanField(default=False,db_index=True)
    
    time = models.DateTimeField(verbose_name = "time", db_index = True)

    def __str__(self):
        return self.bay.BayName + self.time.strftime("%Y-%m-%d %H:%M:%S")

    class Meta:
        verbose_name = "历史数据表"  #单数
        verbose_name_plural = "历史数据表"   #复数

class Table_Log(models.Model):
    SubstationID=models.ForeignKey(Table_Substation,to_field='SubstationID',verbose_name="变电站名称",on_delete=models.CASCADE,null=True)
    ConcentratorID = models.ForeignKey(Table_Concentrator, to_field = 'ConcentratorID', verbose_name="汇集单元", on_delete = models.CASCADE, null = True)
    BayID = models.ForeignKey(Table_Bay, to_field = 'BayID', verbose_name = "间隔", on_delete = models.CASCADE, null = True)
    PhaseName=models.CharField(choices=(("A","A相"),("B","B相"),("C","C相"),("N","N相")),max_length=1,verbose_name="相别",null=True)
    
    time = models.DateTimeField(db_index=True)
    
    Level = models.CharField(
        default = "info", 
        choices = (("debug", "debug"), ("info", "info"), ("warning", "warning"),("critical", "critical")), 
        max_length=15)
    WarningType=models.CharField(
        max_length=4,
        default="D100")
    WarningName=models.CharField(
        max_length = 128,
        verbose_name="告警内容",
        default='')
    Action=models.CharField(
        max_length=16,
        default='',
        null=True)

    def __str__(self):
        return self.time.strftime("%Y-%m-%d %H:%M:%S")
    
    class Meta:
        verbose_name = "日志"  #单数
        verbose_name_plural = "日志"   #复数
    
class Table_I1Interface(models.Model):
    BayID = models.OneToOneField(Table_Bay, to_field = 'BayID', verbose_name = "间隔名称", on_delete = models.CASCADE)    
    LDName = models.CharField(default = 'MONT', max_length = 8, verbose_name = "逻辑设备名",  null = True)
    LNName = models.CharField(default = 'TPRS', max_length = 8, verbose_name = "逻辑节点名",  null = True)
    LNInst = models.IntegerField(default = 1, verbose_name = "逻辑节点实例号", null = True)
    DevID = models.IntegerField(default = 1, verbose_name = "云端ID", null = True)
    
    DistinctNo = models.IntegerField(default = 813, null = True)
    ProductYear = models.IntegerField(default = 19, null = True)
    ProductMonth = models.IntegerField(default = 5, null = True)
    
    def __str__(self):
        return self.BayID.BayName

    class Meta:
        verbose_name = "I1接口表"  #单数
        verbose_name_plural = "I1接口表"   #复数
    
class Table_Warning(models.Model):
    BayID = models.ForeignKey(Table_Bay, to_field = 'BayID', verbose_name = "间隔名称", on_delete = models.CASCADE, null = True)
    EventID = models.CharField(max_length = 64, primary_key = True)
    Eventtime = models.DateTimeField(auto_now=True)
    WarningType = models.CharField(
        choices = (
            ("S100", "瞬时电热故障"),
            ("S102", "瞬时电热故障"),
            ("S200", "瞬时严重电热故障"),
            ("S300", "缓慢电热故障"),
            ("S400", "缓慢泄漏故障"),
            ("S500", "绝压一般告警"),
            ("S600", "绝压严重告警")),
        max_length = 8
    )
    WarningName = models.CharField(max_length = 64)
    SubstationName = models.CharField(max_length = 64)
    BayName = models.CharField(max_length = 64)
    PhaseName = models.CharField(choices = (("A", "A相"), ("B", "B相"), ("C", "C相"), ("N", "N相")), max_length = 1, null = True)
    
    ContactPhone = models.CharField(max_length = 64)
    Sendtimes = models.IntegerField(default = 0)
    ConfirmFlag = models.BooleanField(default = False)
    LastConfirmtime = models.DateTimeField(default = datetime.datetime.strptime('2000-01-01','%Y-%m-%d'))
    LastSendtime = models.DateTimeField(default = datetime.datetime.strptime('2000-01-01','%Y-%m-%d'))
    
    ConfirmTimes = models.IntegerField(default = 0)
    
    def __str__(self):
        return self.BayID.BayName+self.WarningName

    class Meta:
        verbose_name = "实时告警信息表"          # 单数
        verbose_name_plural = "实时告警信息表"   # 复数


class Table_WarningHistory(models.Model):
    BayID = models.ForeignKey(Table_Bay, to_field = 'BayID', verbose_name = "间隔名称", on_delete = models.CASCADE, null = True)
    EventID = models.CharField(max_length = 64, db_index = True)
    Eventtime = models.DateTimeField(auto_now = True)
    WarningType = models.CharField(
        choices = (
            ("S100", "瞬时电热故障"),
            ("S102", "瞬时电热故障"),
            ("S200", "瞬时严重电热故障"),
            ("S300", "缓慢电热故障"), 
            ("S400", "缓慢泄漏故障"),
            ("S500", "绝压一般告警"),
            ("S600", "绝压严重告警")),
        max_length = 8
    )
    WarningName = models.CharField(max_length=64,null=True)
    PhaseName = models.CharField(choices = (("A", "A相"), ("B", "B相"), ("C", "C相"), ("N", "N相")), max_length = 1, null=True)
    class Meta:
        verbose_name = "历史告警信息表"  #单数
        verbose_name_plural = "历史告警信息表"   #复数
        
class Table_MessageRecv(models.Model):
    ReceiptHandle = models.CharField(max_length = 64, null=True)
    MessageID = models.CharField(max_length = 64, null=True)
    DestCode = models.CharField(max_length = 64, null=True)
    Sendtime = models.DateTimeField(auto_now = True, null=True)    
    SignName = models.CharField(max_length = 64, null=True)
    SequenceID = models.CharField(max_length = 64, null=True)
    PhoneNumber = models.CharField(max_length = 64, null=True)
    MessageContent = models.CharField(max_length = 64, null=True)

    class Meta:
        verbose_name = "短信接收表"  #单数
        verbose_name_plural = "短信接收表"   #复数

class Table_MessageSend(models.Model):
    EventID = models.CharField(max_length = 64, null = True)
    RequestID = models.CharField(max_length = 64, null = True)
    BizID = models.CharField(max_length = 64, null = True)
    MessageContent = models.CharField(max_length = 64, null = True)
    MessageCode = models.CharField(max_length = 64, null = True)
    Sendtime = models.DateTimeField(auto_now = True)
    
    class Meta:
        verbose_name = "短信发送表"  #单数
        verbose_name_plural = "短信发送表"   #复数      

class Table_ConcentratorState(models.Model):      
    DC5VState = models.IntegerField(default = 0)
    MBusState = models.IntegerField(default = 0)
    ACMState = models.IntegerField(default = 0)
    SBusState = models.IntegerField(default = 0)
    ACSState = models.IntegerField(default = 0)
    IPCACMState = models.IntegerField(default = 0)
    IPCDC1State = models.IntegerField(default = 0)
    IPCACSState = models.IntegerField(default = 0)
    IPCDC2State = models.IntegerField(default = 0)
    IPCDC3State = models.IntegerField(default = 0)   
    time =  models.DateTimeField(auto_now = True)  
    Temperature = models.CharField(max_length = 5, null = True)
    AirPress = models.CharField(max_length = 5, null = True)
    
    COM1State = models.CharField(max_length = 128, null = True)   
    COM2State = models.CharField(max_length = 128, null = True)   
    COM3State = models.CharField(max_length = 128, null = True)   
    COM4State = models.CharField(max_length = 128, null = True)   
    COM5State = models.CharField(max_length = 128, null = True)   
    COM6State = models.CharField(max_length = 128, null = True)   
    
    Createtime =  models.DateTimeField(null = True)
    ConfirmFlag = models.BooleanField(default = False)
    Confirmtime = models.DateTimeField(null = True)
    
    def __str__(self):
        return self.time.strftime("%Y-%m-%d %H:%M:%S")

    class Meta:
        verbose_name = "汇集单元设备状态表"  #单数
        verbose_name_plural = "汇集单元设备状态表"   #复数

# 用户信息及权限验证信息,树状结构
class Table_TreePermission(models.Model):
    User = models.ForeignKey(User,to_field="username" , on_delete = models.CASCADE)
    # 权限验证相关字段
    Level = models.IntegerField(default=1,choices=((1,"省级"),(2,'市级'),(3,'站级')))    
    ProvinceCompanyName = models.ForeignKey(Table_ProvinceCompany, to_field = 'ProvinceCompanyName', verbose_name="省公司名称", on_delete = models.CASCADE,blank = True, null = True)
    CityCompanyName = models.ForeignKey(Table_CityCompany, to_field = 'CityCompanyName', verbose_name="市公司名称", on_delete = models.CASCADE,blank = True, null = True)
    SubstationID = models.ForeignKey(Table_Substation, to_field = 'SubstationID', verbose_name="变电站名称", on_delete = models.CASCADE,blank = True, null = True)            
    IsActive = models.BooleanField(default=True)
    
    def __str__(self):
        if self.Level == 1:            
            return self.User.username+" "+self.ProvinceCompanyName.ProvinceCompanyName
        elif self.Level == 2:            
            return self.User.username+" "+self.CityCompanyName.CityCompanyName
        else:
            return self.User.username+self.SubstationID.SubstationName

    class Meta:
        verbose_name = "用户树状结构权限表" 
        verbose_name_plural = "用户树状结构权限表"   

# 用户各种单个权限表, 一对一权限信息
class Table_FunctionPermission(models.Model):
    User = models.OneToOneField(User,to_field="username",verbose_name="用户名称", on_delete = models.CASCADE)

    # 各种权限
    
    IsOperation = models.BooleanField(default=False,verbose_name="是否是运维人员")
    # DeleteData = models.BooleanField(default=False,verbose_name="是否能删除所有动态数据(设备档案按钮)")
    def __str__(self):
        return self.User.username

    class Meta:
        verbose_name = "用户单个权限表" 
        verbose_name_plural = "用户单个权限表"   

    
class Table_AlgorithmLog(models.Model):
    BayID = models.ForeignKey(Table_Bay, to_field = 'BayID', verbose_name = "间隔名称", on_delete = models.CASCADE)
    LogTime = models.DateTimeField(null = True, verbose_name="记录时间")
    Content = models.CharField(max_length = 128,null = True,verbose_name = "记录内容")    
    
    class Meta:
        verbose_name = "算法日志表"  #单数
        verbose_name_plural = "算法日志表"   #复数    

class Table_AlgorithmState(models.Model):
    BayID = models.OneToOneField(Table_Bay, to_field = 'BayID', verbose_name = "间隔名称", on_delete = models.CASCADE)
    # CT、PT、套管
    Pa0 = models.SmallIntegerField(default=0)
    Pb0 = models.SmallIntegerField(default=0)
    Pc0 = models.SmallIntegerField(default=0)
    Pab0 = models.SmallIntegerField(default=0)
    Pbc0 = models.SmallIntegerField(default=0)
    Pac0 = models.SmallIntegerField(default=0)
    
    # 套管 零相及A、B、C与N的差值
    Pn0 = models.SmallIntegerField(default=0)
    Pan0 = models.SmallIntegerField(default=0)
    Pbn0 = models.SmallIntegerField(default=0)
    Pcn0 = models.SmallIntegerField(default=0)
    
    # 套管 日内差
    Pda = models.SmallIntegerField(default=0)
    Pdb = models.SmallIntegerField(default=0)
    Pdc = models.SmallIntegerField(default=0)
    Pdn = models.SmallIntegerField(default=0)
    
    Pmina = models.SmallIntegerField(default=0)
    Pminb = models.SmallIntegerField(default=0)
    Pminc = models.SmallIntegerField(default=0)
    Pminn = models.SmallIntegerField(default=0)
    Pmaxa = models.SmallIntegerField(default=0)
    Pmaxb = models.SmallIntegerField(default=0)
    Pmaxc = models.SmallIntegerField(default=0)
    Pmaxn = models.SmallIntegerField(default=0)
    AlgEnable = models.BooleanField(verbose_name="算法启动",default = False)
    AlgEnableTime = models.DateTimeField(verbose_name="算法启动时间",default=datetime.datetime.strptime('2000-01-01','%Y-%m-%d'))
        
    AlgCalcInitialValueStart = models.BooleanField(verbose_name="初值启动",default = False)    
    AlgCalcInitialValueStartTime = models.DateTimeField(verbose_name="初值启动时间",default=datetime.datetime.strptime('2000-01-01','%Y-%m-%d'))
    AlgCalcInitialValueLastTime = models.DateTimeField(verbose_name="最新一次获取初值的时间",default=datetime.datetime.strptime('2000-01-01','%Y-%m-%d'))
    
    AlgCalcInitialValueDone = models.BooleanField(verbose_name="初值获取完成",default = False)
    AlgCalcInitialValueDoneTime = models.DateTimeField(verbose_name="初值获取完成时间",default=datetime.datetime.strptime('2000-01-01','%Y-%m-%d'))

    AlgCalcWarningValueStart = models.BooleanField(verbose_name="告警启动",default = False)    
    AlgCalcWarningValueStartTime = models.DateTimeField(verbose_name="告警启动时间",default=datetime.datetime.strptime('2000-01-01','%Y-%m-%d'))
    AlgCalcWarningValueLastTime = models.DateTimeField(verbose_name="最近一次告警计算时间",default=datetime.datetime.strptime('2000-01-01','%Y-%m-%d'))
    
    class Meta:
        verbose_name = "算法状态表"  #单数
        verbose_name_plural = "算法状态表"   #复数
        
class Table_AlgorithmSetting(models.Model):
    BayID = models.OneToOneField(Table_Bay, to_field = 'BayID', verbose_name = "间隔名称", on_delete = models.CASCADE)
    
    #1)	CT和PT的绝压告警
    Pet_CTPT = models.SmallIntegerField(default=25)  # 瞬时电热故障 定值 
    Pt_CTPT = models.SmallIntegerField(default=50)   # 瞬时严重电热故障 定值
    
    #2)	CT和PT间隔差压告警
    Ptd_CTPT = models.SmallIntegerField(default=20)  # 瞬时严重电热故障 定值
    Ptdu_CTPT = models.SmallIntegerField(default=10) # 差压正常 定值
    
    #3)	CT和PT间隔差压趋势告警（缓慢故障）
    Ptdc_CTPT = models.SmallIntegerField(default=10) # 缓慢趋势电热故障/缓慢泄漏故障 定值
    Ptdcu_CTPT = models.SmallIntegerField(default=5)# 差压正常 定值
    
    #4) 单只套管绝压告警
    Pt_TG = models.SmallIntegerField(default=400)    # 单支套管 瞬时严重电热故障 定值 
    Ptu_TG = models.SmallIntegerField(default=300)   # 单支套管 绝压正常 定值
    
    #5)	一组套管差压告警
    Ptd_TG = models.SmallIntegerField(default=200)   # 一组套管 瞬时严重电热故障 定值
    Ptdu_TG = models.SmallIntegerField(default=100)  # 一组套管 差压正常 定值
    Ptc_TG = models.SmallIntegerField(default=100)   # 单只套管 绝压正常 定值
    
    #6)	差压趋势告警
    Ptdc_TG = models.SmallIntegerField(default=100)  # 缓慢趋势电热故障 告警值
    Ptdcu_TG = models.SmallIntegerField(default=50)  # 一组套管 差压正常 定值

    #7)	冲顶压力绝压防爆告警
    Ptcd = models.SmallIntegerField(default=2300)    # 冲顶压力230kPa（套管）
    Ptcd_R1 = models.FloatField(default=0.6)  # 冲顶压力一般告警比例 定值
    Ptcd_R2 = models.FloatField(default=0.8)  # 冲顶压力严重告警比例 定值
    
    #8) 相邻两个数据异常的定位
    Pd_YC = models.SmallIntegerField(default=25)
    
    #9) 时间定值
    DeltaTime1 = models.IntegerField(default=20)  # 算法启动到开始获取初值的时间 unit min
    DeltaTime2 = models.IntegerField(default=60)  # 开始获取初值到开始计算告警的时间 unit min
    DeltaTime3 = models.IntegerField(default=24*60)  # 开始获取初值到结束计算初值的时间 unit min        
    DeltaTime4 = models.IntegerField(default=60)  # 数据异常时退后时间 unit min
    DeltaTime5 = models.IntegerField(default=10)  # 算法启动到开始计算冲顶压力告警的计算时间 unit min
    DeltaTime6 = models.IntegerField(default=7*24*60) # 缓慢故障查询的时间范围 unit min 
    class Meta:
        verbose_name = "告警定值表"            #单数
        verbose_name_plural = "告警定值表"     #复数
