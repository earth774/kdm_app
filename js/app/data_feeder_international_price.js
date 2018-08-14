
app.controller("DataFeederInternationalPriceCtrl", function ($scope, $http, $cookies, $compile,$filter) {

    $scope.CheckCookies = function(){
        if($cookies.get('api_token') == "" || $cookies.get('api_token')==null){
            window.location.href = "../index.html";
        }
    }

    function initFeederDataSet(){
          $scope.dataFeederItem = {
            'resource' : null,
            'country' : null,
            'unit_price' : null,
            'price_datetime' : null
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
            url: url + '/international_resource_price_data_feeder_info',
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
                "url": url + '/international_resource_price_data_feeder_info',
                "beforeSend" : function (request) {
                        request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                { "data": "resource" }, // CHANGE
                { "data": "country" },
                { "data": "unit_price" },
                { "data": "price_datetime" },
            ],
            "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {// CHANGE
                    $('td', nRow).eq('3').html($filter('limitTo')(aData.price_datetime,10,0));
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

});
