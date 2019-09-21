from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

app_name = "app"

urlpatterns = [   
    #path('login/', views.user_login, name="user_login"),
    #path('main', auth_views.LoginView.as_view(template_name='main.html'), name="main"),
    path('main/', views.main_views, name = "main"),
    path('loginout', views.loginout_views, name = "loginout"),
    path('main/map',views.map_views,name = "map"),
    path('main/data', views.main_data_views, name = "main_data"),
    path('main/delete', views.main_delete_views, name = "main_delete"),
    path('base/', views.base_views, name = "base"),
    path('tree/data', views.tree_data_views, name = "tree_data"),
    path('realtime/', views.realtime_views, name = "realtime"),
    path('realtime/sub', views.realtime_sub_views, name = "realtime_sub"), # 这个是变电站 或汇集单元显示多个bay基本情况    
    path('realtime/city', views.realtime_city_views, name = "realtime_city"), # 市公司
    path('realtime/bayhtml', views.realtime_bayhtml_views, name = "realtime_bayhtml"),
    path('realtime/conhtml', views.realtime_conhtml_views, name = "realtime_conhtml"),
    path('realtime/bay', views.realtime_bay_views, name="realtime_bay"), # 这个是一个bay的详细情况
    path('realtime/con', views.realtime_con_views, name="realtime_con"), # 这个是一个bay的详细情况
    path('realtime/confirm', views.realtime_confirm_views, name = "realtime_confirm"),# 确认
    # path('realtime/baydata/',views.realtime_baydata_views,name = "realtime_baydata"),
    path('realtime/update/sub',views.realtime_sub_views,name="realtime_sub"),
    path('realtime/update/city',views.realtime_city_views,name="realtime_city"),
    path('realtime/update/bay',views.realtime_update_bay_views,name="realtime_update_bay"),
    path('realtime/update/con',views.realtime_update_con_views,name="realtime_update_con"),
    path('history/', views.history_views, name = "history"),
    path('history/update',views.history_update_views,name="history_update"),
    path('equipment/', views.equipment_views, name = "equipment"),
    path('equipment/update',views.equipment_update_views,name="equipment_update"),
    path('equipment/delete', views.equipment_delete_views, name = "equipment_delete"),
    path('judgement/',views.judgement_views,name="judgement"),
    path('statement/',views.statement_views, name="statement"),
    path('event/', views.event_views, name = "event"),
    path('event/update', views.event_update_views, name = "event_update"),
    path('file/upload', views.file_upload_views, name = "file_upload"),
    path('file/excute', views.file_excute_views, name = "file_excute"),
    path('algorithm/', views.algorithm_views, name = "algorithm"),
    path('algorithm/update',views.algorithm_update_views,name="algorithm_update"),
    path('algorithm/save',views.algorithm_save_views,name="algorithm_save"),
    path('algorithm/enable',views.algorithm_enable_views,name="algorithm_enable"),
    path('heart',views.heart_views,name="heart"), # 心跳监测
    path('', auth_views.LoginView.as_view(template_name='login0.html'), name="login"),
    #path('2/', views.main, name="main2"),
]
