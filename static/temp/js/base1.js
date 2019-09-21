function get_treeview(){
    var defaultData = [
        {
            "text": '国网四川省电力公司',
            "tags": '1',
            nodes: [
                {
                    text: '成都市电力公司',
                    tags: ['2'],
                    nodes: [
                        {
                            text: '220kV兴隆湖变电站',
                            tags: ['6'],
                            nodes: [
                                {
                                    text: '261茶佛1线',
                                    tags:['12']
                                },
                                {
                                    text: '262茶佛2线',
                                    tags:['12']
                                }, 
                                {
                                    text: '263茶佛3线',
                                    tags:['12']
                                },                                    
                            ]
                        },
                        {
                            text: '500kV科学城变电站',
                            tags: ['3']
                        }
                    ]
                },
                {
                    text: 'Child 2',
                    tags: ['3']
                }
            ]
        },
        {
            text: 'Parent 2',
            tags: ['7']
        },
        {
            text: 'Parent 3',
            icon: 'glyphicon glyphicon-earphone',
            href: '#demo',
            tags: ['11']
        },
        {
            text: 'Parent 4',
            icon: 'glyphicon glyphicon-cloud-download',
            href: '/demo.html',
            tags: ['19'],
            selected: true
        },
        {
            text: 'Parent 5',
            icon: 'glyphicon glyphicon-certificate',
            color: 'pink',
            backColor: 'red',
            href: 'http://www.tesco.com',
            tags: ['available', '0']
        }
    ];

    var result;
    
    $.ajax({
        url:'/tree/data',
        type:'get',
        dataType: 'json',
        async:false,
        success:function (data){
            result = data;
        }
    });
        
    return result
}

$(function () {
    $('#treeview').treeview({        
        data: get_treeview() , //data属性是必须的，是一个对象数组 Array of Objects.
        color: "#4F4F4F", //所有节点使用的默认前景色，这个颜色会被节点数据上的backColor属性覆盖.        String
        backColor: "#FFFFFF", //所有节点使用的默认背景色，这个颜色会被节点数据上的backColor属性覆盖.     String
        borderColor: "#FFFFFF", //边框颜色。如果不想要可见的边框，则可以设置showBorder为false。        String
        nodeIcon: "glyphicon", //所有节点的默认图标
        checkedIcon: "glyphicon glyphicon-check", //节点被选中时显示的图标         String
        collapseIcon: "glyphicon glyphicon-chevron-down", //节点被折叠时显示的图标        String
        expandIcon: "glyphicon glyphicon-chevron-right", //节点展开时显示的图标        String
        emptyIcon: "glyphicon glyphicon-globe", //当节点没有子节点的时候显示的图标 String
        enableLinks: true, //是否将节点文本呈现为超链接。前提是在每个节点基础上，必须在数据结构中提供href值。        Boolean
        highlightSearchResults: true, //是否高亮显示被选中的节点        Boolean
        levels: 3, //设置整棵树的层级数  Integer
        multiSelect: false, //是否可以同时选择多个节点      Boolean
        onhoverColor: "#F5F5F5", //光标停在节点上激活的默认背景色      String
        selectedIcon: "glyphicon", //节点被选中时显示的图标     String

        searchResultBackColor: "#FFFFFF", //当节点被选中时的背景色
        searchResultColor: "#F5F5F5", //当节点被选中时的前景色

        selectedBackColor: "#FFFFFF", //当节点被选中时的背景色
        selectedColor: "#FF0000", //当节点被选中时的前景色

        showBorder: false, //是否在节点周围显示边框
        showCheckbox: false, //是否在节点上显示复选框
        showIcon: true, //是否显示节点图标
        showTags: false, //是否显示每个节点右侧的标记。前提是这个标记必须在每个节点基础上提供数据结构中的值。
        uncheckedIcon: "glyphicon glyphicon-unchecked", //未选中的复选框时显示的图标，可以与showCheckbox一起使用            
    });

    $('#treeview').on('nodeSelected', function (event, data) {
        console.log(data);
    })
});
