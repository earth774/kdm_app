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


app.controller("DataFeederSoilCtrl", function ($scope, $http, $cookies, $compile) {

    $scope.CheckCookies = function(){
        if($cookies.get('api_token') == "" || $cookies.get('api_token')==null){
            window.location.href = "../index.html";
        }
    }

    function initFeederDataSet(){
          $scope.dataFeederItem = {
            'data_datetime' : null,
            'gps_lat' : null,
            'gps_long' : null,
            'city' : null,
            'country' : null,
            'soil_area_type_id' : null,
            'soil_type_id' : null,
            'mineral_score' : null,
            'crumbly_score' : null,
            'ph_value' : null,
            'rain_qty_mmpm' : null,
            'temp_celsius_max' : null,
            'temp_celsius_avg' : null,
            'temp_celsius_min' : null,
            'sunlight_percent' : null,
            'wind_speed' : null,
            'wind_direction_degree' : null
          };
    }

    initFeederDataSet();
    $scope.page_tab2 = 'table';
    $scope.switchPage = function(page,tab){ /*change form or table in tab*/
        $scope.hasSubmit=false;
      	if(tab=='tab2'){
            $scope.page_tab2 = page;
            if($scope.page_tab2=='table'){
                $scope.weatherDataItem = {};
            }else{
                setTimeout( function () {
                    $('#date-format').bootstrapMaterialDatePicker({ format : 'YYYY-MM-DD HH:mm' });
                }, 10 );
            }
    	}
    }

    $scope.$on('ngRepeatAreaFinished', function(ngRepeatFinishedEvent) {
        initMaterialSelect('#select_area_type');
    });

    $scope.$on('ngRepeatSoilFinished', function(ngRepeatFinishedEvent) {
        initMaterialSelect('#select_soil_type');
    });

    $scope.funcGetAreaType = function(){
         $http({
            method: 'GET',
            url: url + '/soil_area_type',
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.soil_area_type_info = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.funcGetSoilType = function(){
         $http({
            method: 'GET',
            url: url + '/soil_type',
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.soil_type_info = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.funcInsertDataFeederItem = function(data){
        $scope.hasSubmit=true;
    	$http({
            method: 'POST',
            url: url + '/soil_data_feeder_info',
            dataType: "json",
            data:data,
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function(res){
        	if(res.status == "error"){

                toastr["warning"](res.error);
            }else{
                toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                initFeederDataSet();
                $scope.switchPage('table','tab2');
            }
        },function(err){

        	 toastr["warning"]("system error");
        });
    }

    $scope.funcGetDataFeeder = function(){
        $scope.dataFeederItem = {};

        // AJAX method for dataTables.
        $scope.ajaxDataFeederOptions = {
            "ajax": {
                "url": url + '/soil_data_feeder_info',
                "beforeSend" : function (request) {
                        request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                { "data": "data_datetime" }, // CHANGE
                { "data": "country" },
                { "data": "soil_type_id" },
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

     $scope.detailDataFeeder = function(id){
      $scope.objDataFeederItem = {};
        $http({
            method: 'GET',
            url: url + '/soil_data_feeder_info/'+id,
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
