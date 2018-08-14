app.controller("DataFeederPlantDiseaseCtrl", function ($scope, $http, $cookies, $compile,$filter) {

    $scope.CheckCookies = function(){
        if($cookies.get('api_token') == "" || $cookies.get('api_token')==null){
            window.location.href = "../index.html";
        }
    }

    function initFeederDataSet(){
          $scope.dataFeederItem = {
            'name' : null,
            'description' : null,
            'carriers_diseases' : null,
            'datetime_diseases' : null,
            'effect_area' : null,
            'effect_resource' : null,
            'still_scourge' : 0,
            'protection_instruction' : null
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
                    $('.datepicker').pickadate({
                          format: 'yyyy-mm-dd',
                          formatSubmit: 'yyyy-mm-dd',
                          hiddenPrefix: 'prefix__',
                          hiddenSuffix: '__suffix'
                        });
                }, 10 );
            }
    	}
    }

    $scope.funcInsertDataFeederItem = function(data){
        $scope.hasSubmit=true;
    	$http({
            method: 'POST',
            url: url + '/plant_diseases_data_feeder_info',
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
                "url": url + '/plant_diseases_data_feeder_info',
                "beforeSend" : function (request) {
                        request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                { "data": "name" }, // CHANGE
                { "data": "carriers_diseases" },
                { "data": "datetime_diseases" },
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
                    $('td', nRow).eq('2').html($filter('limitTo')(aData.datetime_diseases,10,0));
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
            url: url + '/plant_diseases_data_feeder_info/'+id,
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
