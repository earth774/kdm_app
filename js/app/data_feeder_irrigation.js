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
app.controller("DataFeederIrrigationCtrl", function ($scope, $http, $cookies, $compile) {

    $scope.CheckCookies = function(){
        if($cookies.get('api_token') == "" || $cookies.get('api_token')==null){
            window.location.href = "index.html";
        }
    }
    // -----------------set initial-----------------
    function initFeederDataSet(){
          $scope.dataFeederItem = {
                	"data_datetime": null,
                	"gps_lat" : null,
                	"gps_long" : null,
                	"city" : null,
                	"country" : null,
                	"irrigation_type_id" : null,
                	"water_quality_id" : null,
                	"o2_percent" : null,
                	"co2_percent" : null,
                	"poision_ppm" : null,
                	"organism_alive" : null,
                	"water_capacity_metres" : null,
                	"max_water_capacity_metres" : null,
                	"min_water_capacity_metres" : null,
                	"cubic_water_capacity_metres" : null,
                	"ph_value" : null,
                	"water_speed" : null,
                	"rain_qty_mm" : null,
                	"max_temp_celsius" : null,
                	"min_temp_celsius" : null,
                	"avg_temp_celsius" : null,
                	"sunlight_percent" : null,
                	"water_volatile_cubic_metres" : null,
                	"wind_speed" : null,
                	"wind_direction" : null
                };
    }

    initFeederDataSet();
    $scope.sel_page = 'table';
    $scope.switchPage = function(page){ /*change form or table */
        $scope.hasSubmit=false;
            $scope.sel_page = page;
            if($scope.sel_page=='table'){
                initFeederDataSet();
                clearMaterialSelect('.mdb-select');
            }else{
                setTimeout( function () {
                    $('#date-format').bootstrapMaterialDatePicker({ format : 'YYYY-MM-DD HH:mm' });
                }, 10 );
            }

    }
    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {

          initMaterialSelect('#select_irrgation_type');

          initMaterialSelect('#select_water_quality');
      });
    // -----------function-------------
    // -------get for select
    $scope.funcGetIrrigation_type = function(){
        $http({
            method: 'GET',
            url: url + '/irrigation_type',
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.irrgation_type = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    $scope.funcGetWaterQuality = function(){
        $http({
            method: 'GET',
            url: url + '/water_quality',
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.water_quality = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    // เพิ่มข้อมูลชลประทาน
    $scope.funcInsertDataFeederItem = function(data){
        $scope.hasSubmit=true;
    	$http({
            method: 'POST',
            url: url + '/water_quality_data_feeder_info',
            dataType: "json",
            data:data,
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function(res){
        	if(res.status == "error"){
                toastr["warning"](res.error);
            }else{
                toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                initFeederDataSet();
                $scope.switchPage('table');
            }
        },function(err){
        	 toastr["warning"]("system error");
        });
    }
    // get ข้อมูลมาใส่ dataTables
    $scope.funcGetDataFeeder = function(){
        $scope.dataFeederItem = {};

        // AJAX method for dataTables.
        $scope.ajaxDataFeederOptions = {
            "ajax": {
                "url": url + '/water_quality_data_feeder_info',
                "beforeSend" : function (request) {
                        request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                { "data": "data_datetime" }, // CHANGE
                { "data": "country" },
                { "data": "water_quality_name" },
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {// CHANGE
                    var html = '<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="detailDataFeeder('+aData.id+');"><i class="fa fa-eye"></i></a>'
                    var last_row = $("td:last", nRow);
                    if(  ! last_row.html() ){
                        angular.element(last_row).append( $compile(html)($scope) )
                    }
                    $(nRow).attr("id",'row_' + aData.id);
                    return nRow;
            },
            "fnDrawCallback": function (oSettings, json){
                initMaterialSelectDataTable();
            },
        };

        setTimeout( function () {
            $('#table_data_feeder').DataTable().ajax.reload();
        }, 300 );
    }
// เรียก modal แสดงข้อมูล
$scope.detailDataFeeder = function(id){
 $scope.objDataFeederItem = {};
   $http({
       method: 'GET',
       url: url + '/water_quality_data_feeder_info/'+id,
       dataType: "json",
       headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
   }).then(function onSuccess(response) {
                var res = response.data;
       $scope.objDataFeederItem = res.data[0];
       $('#DataFeederDetail').modal('show');
   }, function onError(response) {
       toastr["warning"]("system error");
   });
};



});
