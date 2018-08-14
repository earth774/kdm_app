/**
 *
 * @author Chanwoot See-ngam <chanwoot@unbugsolution.com>
 * @link http://www.unbugsolution.com/
 * @copyright 2015 UNBUG Solution
 * @since 1.0
 *
 */

 var base_url = "http://localhost/kdm_backend";
 //var base_url = "http://203.170.129.40/kdm_backend";

var url = base_url + "/public/api/v1";
var app = angular.module("KDM", ['ngCookies', 'ui.utils', 'ui.bootstrap','ngMap','ngFileUpload','colorpicker.module','highcharts-ng']);

// For getting select value
app.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit(attr.onFinishRender);
                });
            }
        }
    }
});
app.controller("DataReportChartCtrl", function ($scope, $http, $cookies, $compile) {


    $scope.CheckCookies = function () {
        if ($cookies.get('api_token') == "" || $cookies.get('api_token') == null) {
            window.location.href = "../index.html";
        }
    }
    var user_id = $cookies.get('user_id');
    $scope.chartObj = [];
    function initVarchart(){
        $scope.checkDiff = null;
        $scope.obj_dataInfoType = {};
        $scope.hasSubmit = false; //check require
        $scope.setting_tab = 1;
        $scope.modal_type = null; //เช็คประเภทการเข้า modal (createnew/editchart)
        $scope.showeidit = null; //เช็คการแสดงครั้งแรก ถ้าเป็น editchart
        $scope.select_user_type = null;//tab 1
        $scope.product_info_position = null; //เก็บตำแหน่งของ select option ของ product
        $scope.setting_tab = 1;
        $scope.product_info = []; //เก็บรายการ product ที่ได้จาก api ของแต่ละรายการใน tab3
        $scope.chart_info = {
            "name" : null,
            "chart_type_id" : null,
            "user_type_chart_data_id" : null,
            "user_id" : user_id,
            "is_custom_sql" : null,
            "custom_mysql_statement_select": null,
            "custom_mysql_statement_where": null,
            "custom_mysql_statement_groupby": null
        };
        //chart_info_id return form api {{post}} chart_info
        $scope.chart_data = {
                      "chart_info_id" : null,
                      "chart_data_item_list" : []
                    };

    }
    initVarchart();

    // ---------------------------------------------------
    $scope.switchTab = function(tab){
        $scope.setting_tab = tab;
        if(tab==2){
            $scope.getChart_type();
        }
    }
    $scope.clearData = function () {

        clearMaterialSelect('.mdb-select');
        $('#select_user_type').val("");
        $('#select_chart_type').val("");
        $('#select_chart_value').val("");
        $('#select_year').val("");

        }
    $scope.$on('repeatYearFinish',function(ngRepeatFinishedEvent){
        var lengthData = $scope.chartObj.length;
        for(let d=0;d<lengthData;d++){
             initMaterialSelect('#select_year'+d);
        }

    });
    $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {

        setTimeout(function () {
            initMaterialSelect('#select_user_type');
            initMaterialSelect('#select_chart_type');

        }, 500);

    });
    $scope.$on('ngRepeatChartValue', function (ngRepeatFinishedEvent){
        initMaterialSelect('#select_chart_value');
    });

    $scope.$on('ngRepeatResourceFin', function (ngRepeatFinishedEvent) {

        let position = $scope.chart_data.chart_data_item_list.length - 1;

        if($scope.showeidit == true){
            for (let i = 0; i <= position; i++) {
                setTimeout(function () {
                    initMaterialSelect('#resource_info_id'+i);
                    checkValueResource(i);

                }, 200);
                 }
        }else{
            setTimeout(function () {
                initMaterialSelect('#resource_info_id'+position);
                checkValueResource(position);
            }, 200);


        }
        $scope.showeidit = null;

    });
    function checkValueResource(index) {
        // tab 3 form
        
        if ($scope.chart_data.chart_data_item_list[index].data_info_id) {
            initMaterialSelect('#resource_info_id'+index, $scope.chart_data.chart_data_item_list[index].data_info_id);
        }
    }

    // ----------------------------------------------------------
    $scope.getAllReport = function(){ //เรียก กราฟทั้งหมด มาครั้งแรก
        $scope.chartObj = [];
        $http({
            method: 'GET',
            url: url + '/report/user/'+ user_id,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            let res = response.data.data[0];

            angular.forEach(res.chart,function(list){

                var indexChart = res.chart.indexOf(list);
                if(list.chart_type=='column'||list.chart_type=='line'){
                    $scope.chartObj.push({
                        chart_info_id : list.chart_info_id,
                        year_list:list.year_list,
                        year:list.year,
                        xAxis: {
                            title: {
                                 text: list.title_x
                                 },
                                categories: list.category,
                                id: 'x-axis'
                            },
                         yAxis: {
                            title: {
                                text: list.title_y
                            },
                        },
                          chart: {
                            type: list.chart_type
                          },
                          series: [],
                          title: {
                            text: list.chart_name
                          }
                    });
                angular.forEach(list.items,function(serie){
                    $scope.chartObj[indexChart].series.push({
                        data: serie.item_data,
                       name: serie.item_name,
                       color: serie.item_color
                   });
                });

            }else if(list.chart_type=='pie'){
                $scope.chartObj.push({
                    chart_info_id : list.chart_info_id,
                    year_list:list.year_list,
                    year:list.year,
                    chart: {

                         plotBackgroundColor: null,
                         plotBorderWidth: null,
                         plotShadow: false,
                         type:'pie'
                     },
                     plotOptions: {
                          pie: {
                              allowPointSelect: true,
                              cursor: 'pointer',
                              dataLabels: {
                                  enabled: false
                              },
                              showInLegend: true
                          }
                      },
                    series: [{data:[]}],
                    title: {
                      text: list.chart_name

                    },
                    subtitle:{
                        text: list.title
                    }
                });
                angular.forEach(list.items,function(serie){
                    $scope.chartObj[indexChart].series[0].data.push({
                        name: serie.item_name,
                        y: serie.item_data,
                        color:serie.item_color
                    });
                });

            }else if(list.chart_type=='map'){

                $scope.chartObj.push({
                    chart_info_id : list.chart_info_id,
                    year_list:list.year_list,
                    year:list.year,
                    chartType: 'map',
                    chart: {
                           map: 'countries/th/th-all'
                       },
                       title: {
                         text: list.chart_name
                     },
                    subtitle:{
                        text: list.title
                    },
                     legend: {
                       layout: 'vertical',
                       align: 'left',
                       verticalAlign: 'bottom'
                   },
                   mapNavigation: {
                        enabled: true,
                        enableDoubleClickZoomTo: true
                    },
                     colorAxis: {

                           minColor: list.item_color,
                           maxColor: Highcharts.getOptions().colors[0]
                       },
                       series: [{
                      data: list.items,
                      name: list.title,
                      states: {
                          hover: {
                              color: Highcharts.getOptions().colors[2]
                          }
                      },
                      dataLabels: {
                          enabled: true,
                          format: '{point.name}'
                      }
                  }]
                });
            }


            });


        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    $scope.getAllReport();
    // -----------------------------------
    $scope.getReportByYear = function(index,obj){

        $http({
            method: 'GET',
            url: url + '/report/data?chart_info_id='+obj.chart_info_id+'&year='+obj.year,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            let res = response.data.data[0].chart[0];

            if(res.chart_type=='column'||res.chart_type=='line'){
                $scope.chartObj[index] = {
                    chart_info_id : res.chart_info_id,
                    year_list:res.year_list,
                    year:res.year,
                    xAxis: {
                        title: {
                             text: res.title_x
                             },
                            categories: res.category,
                            id: 'x-axis'
                        },
                     yAxis: {
                        title: {
                            text: res.title_y
                        },
                    },
                      chart: {
                        type: res.chart_type
                      },
                      series: [],
                      title: {
                        text: res.chart_name
                      }
                };
            angular.forEach(res.items,function(serie){
                $scope.chartObj[index].series.push({
                    data: serie.item_data,
                   name: serie.item_name,
                   color: serie.item_color
               });
            });

        }else if(res.chart_type=='pie'){
            $scope.chartObj[index] = {
                chart_info_id : res.chart_info_id,
                year_list:res.year_list,
                year:res.year,
                chart: {

                     plotBackgroundColor: null,
                     plotBorderWidth: null,
                     plotShadow: false,
                     type:'pie'
                 },
                 plotOptions: {
                      pie: {
                          allowPointSelect: true,
                          cursor: 'pointer',
                          dataLabels: {
                              enabled: false
                          },
                          showInLegend: true
                      }
                  },
                series: [{data:[]}],
                title: {
                  text: res.chart_name

                },
                subtitle:{
                    text: res.title
                }
            };
            angular.forEach(res.items,function(serie){
                $scope.chartObj[index].series[0].data.push({
                    name: serie.item_name,
                    y: serie.item_data,
                    color:serie.item_color
                });
            });

        }else if(res.chart_type=='map'){

            $scope.chartObj[index] = {
                chart_info_id : res.chart_info_id,
                year_list:res.year_list,
                year:res.year,
                chartType: 'map',
                chart: {
                       map: 'countries/th/th-all'
                   },
                   title: {
                     text: res.chart_name
                 },
                subtitle:{
                    text: res.title
                },
                 legend: {
                   layout: 'vertical',
                   align: 'left',
                   verticalAlign: 'bottom'
               },
               mapNavigation: {
                    enabled: true,
                    enableDoubleClickZoomTo: true
                },
                 colorAxis: {

                       minColor: res.item_color,
                       maxColor: Highcharts.getOptions().colors[0]
                   },
                   series: [{
                  data: res.items,
                  name: res.title,
                  states: {
                      hover: {
                          color: Highcharts.getOptions().colors[2]
                      }
                  },
                  dataLabels: {
                      enabled: true,
                      format: '{point.name}'
                  }
              }]
            };
        }


        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    // ----------------------------------------------
    $scope.getReportData = function(obj){

        $http({
            method: 'GET',
            url: url + '/chart_info/'+obj.chart_info_id,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            let res = response.data;

            if(res.data.length==0){
                $scope.chart_info = {
                    "name" : null,
                    "chart_type_id" : null,
                    "user_type_chart_data_id" : null,
                    "user_id" : user_id
                };
            }else{
                    $scope.chart_info = res.data;
                    if($scope.chart_info.is_custom_sql == 1){
                        $scope.chart_info.is_custom_sql = true;
                    }
            }
            $scope.modal_type = 'editchart';



            // get chart_data_item_info
                $http({
                    method: 'GET',
                    url: url + '/chart_data_item_info/chart_info/'+obj.chart_info_id,
                    dataType: "json",
                    headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
                }).then(function onSuccess(response) {
                    let res = response.data;
                    $scope.clearData();
                    $scope.chart_data.chart_info_id = obj.chart_info_id;
                    // $scope.chart_data.chart_data_item_list = res;

                    $scope.setting_tab = 3;



                    angular.forEach(res,function(list){
                        $scope.chart_data.chart_data_item_list.push(
                            {
                              "order" : null,
                              "color" : list.color,
                              "chart_info_id" : list.chart_info_id,
                              "data_info_id" : list.data_info_id,
                            }
                        );
                    });
                    $scope.showeidit = true;
                    $scope.checkGetResource($scope.chart_info.user_type_chart_data_id);


                    $('#modalSettingChart').modal('show');
                }, function onError(response) {
                    toastr["warning"]("system error");
                });

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    // call user_type
    $scope.getUser_type = function () {
        $http({
            method: 'GET',
            url: url + '/user_type',
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            let res = response.data;
            $scope.user_type = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    // call chart_type
    $scope.getChart_type = function () {
        $http({
            method: 'GET',
            url: url + '/chart_type',
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            let res = response.data;
            $scope.chart_type = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    $scope.funcCheckTypeChart = function(type){

        if(type==4){
            $scope.chart_data.chart_data_item_list=[];
            $scope.chart_data.chart_data_item_list[0] = {
                  "order" : null,
                  "color" : '#'+(Math.random()*0xFFFFFF<<0).toString(16),
                  "chart_info_id" : null,
                  "data_info_id" : null,
              };
        }


    }
    // get chart value
    $scope.getChart_value = function(user_type_id){


        if(user_type_id){
            setTimeout(function () {
                clearMaterialSelect('.mdb-select');
                $('#select_chart_value').val("");
            }, 500);

            $http({
                method: 'GET',
                url: url + '/user_type_chart_data/user_type/'+user_type_id,
                dataType: "json",
                headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
            }).then(function onSuccess(response) {
                $scope.chart_value = response.data;

            }, function onError(response) {
                toastr["warning"]("system error");
            });
        }

    }

    // get resource_info 10/1/2018
    $scope.checkGetResource = function (user_type_chart_data_id) {

        $scope.obj_dataInfoType = {};
        var get_url = null;

        if($scope.modal_type != 'editchart'){
            angular.forEach($scope.chart_value,function(list){
            if(list.id==user_type_chart_data_id){
                $scope.obj_dataInfoType = list;
            }
            });
        }else{
            $scope.obj_dataInfoType.chart_data_info_id_type_id =$scope.chart_info.chart_data_info_id_type_id;
            $scope.obj_dataInfoType.data_info_name = $scope.chart_info.data_info_name;
        }


        if($scope.obj_dataInfoType.chart_data_info_id_type_id==1){
            get_url = url + '/resource_info';
        }else if($scope.obj_dataInfoType.chart_data_info_id_type_id==2){
            get_url = url + '/product_info';
        }
        // ------
        $http({
            method: 'GET',
            url: get_url,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.resource_info = res.data;


        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

        $scope.getUser_type();
        $scope.getChart_type();
        // $scope.funcGetResourceInfo();

    //get resource list

// ---------------------------------------------
$scope.funcAddrow = function(){
    $scope.chart_data.chart_data_item_list.push(
        {
          "order" : null,
          "color" : '#'+(Math.random()*0xFFFFFF<<0).toString(16),
          "chart_info_id" : null,
          "data_info_id" : null,
        }
    );

}
$scope.funcDelrow = function(index){
    $scope.chart_data.chart_data_item_list.splice(index,1);
}


    $scope.funcModalSettingChart = function(){
        //ค่าเริ่มต้นแถวมา 3 แถว
        for(let j=0;j<3;j++){
                $scope.funcAddrow();
        }
        $scope.modal_type = 'createnew';
        $('#modalSettingChart').modal('show');
    }
    $scope.closemodal = function(){
        $scope.clearData();
        initVarchart();
        $scope.getAllReport();
        $('#modalSettingChart').modal('hide');
    }
    $scope.insertChart = function(require){
        $scope.hasSubmit = true;
        $scope.checkDiff = $scope.checkDiffval();

        // insert chart_info
        if($scope.checkDiff==true && !require){
            $http({
                method: 'POST',
                url: url + '/chart_info',
                dataType: "json",
                data: $scope.chart_info,
                headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
            }).then(function (res) {
                if (res.data.status == "error") {
                    alert(res.error);
                } else {

                    $scope.chart_data.chart_info_id = res.data.data.id;
                    angular.forEach($scope.chart_data.chart_data_item_list,function(item){
                        item.chart_info_id = $scope.chart_data.chart_info_id;
                    });
                    // insert chart_data
                    updateChartItem($scope.chart_data);
                    // -----
                }
            }, function (err) {
                alert("system error" + " : กรุณาใส่ข้อมูลให้ครบ");
            });

            angular.forEach($scope.chart_data.chart_data_item_list,function(item){
                item.chart_info_id = $scope.chart_data.chart_info_id;
            });
        }


    }
    // ----------update =-------------------------
    $scope.updateChart = function(require){

            $scope.hasSubmit = true;
            $scope.checkDiff = $scope.checkDiffval();
            if($scope.checkDiff==true && !require){
                // insert chart_info
                $http({
                    method: 'PUT',
                    url: url + '/chart_info/'+$scope.chart_info.id,
                    dataType: "json",
                    data: $scope.chart_info,
                    headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
                }).then(function (res) {
                    if (res.data.status == "error") {
                        alert(res.error);
                    } else {
                        angular.forEach($scope.chart_data.chart_data_item_list,function(item){
                            item.chart_info_id = $scope.chart_info.id;
                        });
                        // insert chart_data
                        updateChartItem($scope.chart_data);

                        // -----
                    }
                }, function (err) {
                    alert("system error" + " : กรุณาใส่ข้อมูลให้ครบ");
                });

                angular.forEach($scope.chart_data.chart_data_item_list,function(item){
                    item.chart_info_id = $scope.chart_data.chart_info_id;
                });
            }


    }
    function updateChartItem(data){
        $http({
            method: 'POST',
            url: url + '/chart_data_item_info',
            dataType: "json",
            data: data,
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function (res) {
            if (res.data.status == "error") {
                alert(res.error);
            } else {
                console.log('เพิ่มกราฟสำเร็จ');
                $scope.hasSubmit = false;
                $scope.closemodal();
            }
        }, function (err) {
            alert("system error" + " : กรุณาใส่ข้อมูลให้ครบ");
        });
        // -----
    }
    // check different value in array
     $scope.checkDiffval = function(){
        let arr_resource = [];

        angular.forEach($scope.chart_data.chart_data_item_list,function(list){
        angular.forEach($scope.resource_info,function(resource){
            if(resource.id==list.data_info_id){
                    arr_resource.push(resource.unit);
                }
            });
        });

        for(let i=0;i<arr_resource.length-1;i++){

            if(arr_resource[i]!=arr_resource[i+1]){

                return false;
            }
        }
        return true;
    }
    // -----------delete alert------------------------
    $scope.getDelData = function (chart) {
        $scope.data_alert = chart;
        $('#modalConfirmDelete').modal('show');
    }
    $scope.delData = function (obj) {

        $http({
            method: 'DELETE',
            url: url + '/chart_info/'+obj.chart_info_id,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            if (res.status == "error") {
                alert(res.error);
            }
                $scope.clearData();
                initVarchart();
                $scope.getAllReport();
                $('#modalConfirmDelete').modal('hide');



        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

});
