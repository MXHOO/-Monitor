var datas = {
    x_date: [],
    y_value1: [],
    y_value2: [],
    y_value3: [],
    table_item: [],
    left_table_itme: [],
    right_table_itme: []
}

//数据转化
function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}
function formatTime(value) {
    var time = new Date(value);
    var m = time.getMinutes();
    var s = time.getSeconds();
    m = formatNumber(m);
    s = formatNumber(s);
    var texts = [time.getHours(), m, s];
    return texts.join(":");
}

//折线图

var lineChart_init=function () {
    var time = new Date();
    var lineChart = echarts.init(document.getElementById('line'), 'dark');
    option = {
        title: {
            text: '学生点击趋势图',
            textStyle: {
                color: '#FFFFFF'
            }
        },
        smooth: true,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                animation: false
            }
        },
        xAxis: {
            data: time,
            name: "时间",
            boundaryGap: false,
            splitLine: {
                show: false   //分割线
            },
            minInterval: 1 //自动计算的坐标轴最小间隔大小。 设置为1保证为整数
        },
        yAxis: {
            type: 'value',
            splitLine: {
                show: false
            }
        },
        legend: {
            top: "15rem",
            right: "20rem",
            data: ['较快', '较慢']
        },
        series: [{
            name: "较快",
            type: 'line',
            symbol: 'circle',
            showSymbol: false,
            hoverAnimation: true,
        }
            ,
        {
            name: "较慢",
            type: 'line',
            showSymbol: false,
            hoverAnimation: true,
        }]
    };
    return lineChart;
}

var lineChart=lineChart_init();
function line_click(fast_number, slow_number) {
    var newDate = new Date();
    newDate = formatTime(newDate);
    if (datas.x_date.length < 8) {
        lineChart.showLoading();
        for (var i = 0; i < 8; i++) {
            datas.x_date.push(newDate);
            datas.y_value1.push(fast_number);  //从后端获取数据  fast_number
            datas.y_value2.push(slow_number);  //slow_number
        }
    } else {
        lineChart.hideLoading();
        datas.x_date.shift();
        datas.y_value1.shift();
        datas.y_value2.shift();
        datas.x_date.push(newDate);
        datas.y_value1.push(fast_number);  //从后端获取数据  fast_number
        datas.y_value2.push(slow_number);  //slow_number
    }
    lineChart.setOption(option)
    lineChart.setOption({
        xAxis: {
            data: datas.x_date
        },
        series: [
            { data: datas.y_value1 },
            { data: datas.y_value2 }]
    });
};

function pie(fast, slow, suitable) {
    var pieChart = echarts.init(document.getElementById('pie'), 'dark');
    option1 = {
        // color: ['#8C88AA','#3D708F','#9FBCC2'],
        title: {
            text: '点击次数比例图',
            x: 'center',
            textStyle: {
                color: '#FFFFFF'
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            bottom: 'bottom',
            data: ['较快', '较慢', '适中']
        },
        series: [
            {
                name: '点击次数',
                type: 'pie',
                radius: '55%',
                center: ['50%', '50%'],
                data: [
                    { value: fast, name: '较快' },
                    { value: slow, name: '较慢' },
                    { value: suitable, name: '适中' }
                ],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
    pieChart.setOption(option1);
}



function table(table_data) {
    datas.table_item.push(table_data);
    if (datas.table_item.length <= 5) {
        for(var i=0;i<datas.table_item.length;i++){
            datas.left_table_itme[i]=datas.table_item[i];
            }
    } else if (datas.table_item.length >5 && datas.table_item.length <=10) {
        datas.left_table_itme = datas.table_item.slice(0, 5);
        datas.right_table_itme = datas.table_item.slice(5, datas.table_item.length);
    } else if (datas.table_item.length>10) {
        datas.table_item.shift();
        datas.left_table_itme = datas.table_item.slice(0, 5);
        datas.right_table_itme = datas.table_item.slice(5, 10);
    }

}

//动态生成表格
function render() {
        var html1;
        for (var i = 0; i < datas.left_table_itme.length; i++) {
                var ls =datas.left_table_itme[i];            
                html1 +='<tr>' +
                '<td>' + ls.userid + '</td>' +
                '<td>' + ls.name + '</td>' +  //学生姓名
                '<td>' + ls.date + '</td>' +
                '<td>' + ls.info + '</td>' +
                '</tr>'
                }
                // console.log("ls "+JSON.stringify(ls));
                // console.log(html1);
    $("#left_content").html(html1);
    for (var i = 0; i < datas.right_table_itme.length; i++) {   
        var html2;
        // date时间 id列表id(用不到) info原因 userid用户id
        var ls =  datas.right_table_itme[i];
        html2 +=  '<tr>' +
        '<td>' + ls['userid'] + '</td>' +
        '<td>' + ls['name'] + '</td>' +  //学生姓名
        '<td>' + ls['date'] + '</td>' +
        '<td>' + ls['info'] + '</td>' +
        '</tr>'
    }
    $("#right_content").html(html2);
}

 // websocket连接
 var INTERVAL_TIME = 2000;
window.CHAT = {
    socket:null,
    init: function () {
        if (window.WebSocket) {
            CHAT.socket = new WebSocket("ws://119.3.250.28:9003/platform/main");
            CHAT.socket.onopen = function () {
                console.log("连接建立成功！")
                var w = {};
                w.type = 'platform';
                w.url = 'mainquery';
                var info = {};
                info.o = '1';
                w.info = info;
                var send_content = JSON.stringify(w);
                CHAT.socket.send(send_content);
                setInterval(function(){
                    console.log("send.....")
                    CHAT.chat();
                },1000);
            }
            CHAT.socket.onclose = function () {
                console.log("连接关闭...");
            },
                CHAT.socket.onerror = function () {
                    console.log("发生错误...");
                },
                CHAT.socket.onmessage = function (e) {
                   
                    console.log("接收到数据");
                    var data_r=e.data;
                    console.log(e)
                    data_u=JSON.parse(data_r);
                  
                    switch(data_u.type){
                        case "init":
                        pie(data_u.pieChart.fast,data_u.pieChart.short,data_u.pieChart.normal);
                        for(var i=0;i<data_u.listjson.length;i++){
                            var arr_1=JSON.parse(data_u.listjson[i]);
                            table(arr_1);
                            render();
                        }
                        break;
                        case "click":
                        var info_1=JSON.parse(data_u.info);
                            table(info_1);
                            render();
                            pie(data_u.pieChart.fast,data_u.pieChart.short,data_u.pieChart.normal);     
                        break;
                        case "real":
                        line_click(data_u.fast,data_u.short)
                        switch (data_u.color){
                            case "0":
                            $("#fast").hide();
                            $("#normal").show();
                            $("#slow").hide();
                            break;
                            case  "1":
                            $("#fast").hide();
                            $("#normal").hide();
                            $("#slow").show();
                            break;
                            case "2":
                             $("#fast").show();
                            $("#normal").hide();
                            $("#slow").hide();
                            break;
                        }
                        break;

                    }
                }
        }
    },
    chat: function () {//发送方法
         var w = {};
        var send_content = JSON.stringify(w);
        CHAT.socket.send(send_content);//发送
    }
}

window.onload = function () {
    $("#fast").hide();
    $("#normal").hide();
    $("#slow").hide();
    // $("#normal").attr("style","display:none;");//隐藏div
    // $("#fast").attr("style","display:none;");//显示div
    // $("#slow").attr("style","display:none;");//隐藏div
    CHAT.init();

}


