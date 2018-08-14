
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

app.controller("LenderCtrl", function ($scope, $http, $cookies, $compile) {
    var user_type_id = 15;
    $scope.CheckCookies = function(){
        if($cookies.get('api_token') == "" || $cookies.get('api_token')==null){
            window.location.href = "../index.html";
        }
    }

    $scope.user_id =  $cookies.get('user_id');
    $scope.lenderTypeItem={};
    $scope.activeTab = 'tab1';

    function initUserDataSet(){
        $scope.user_data = {
          'user_id' : null,
        };
    }

    initUserDataSet();

    $scope.funcSwitchTab = function(tab){
        $scope.activeTab = tab;
    }

    $scope.switchPage = function(page,tab){ /*change form or table in tab*/
      	if(tab=='tab2'){
            $scope.page_tab2 = page;
            if($scope.page_tab2=='table'){
                $scope.lenderTypeItem = {};
            }
    	}
    }

    $scope.clearData = function(){
        $scope.page_tab2 = 'table';
        clearMaterialSelect('.mdb-select');
        $('#select_province').val("");
        $('#select_district').val("");
        $('#select_sub_district').val("");
    }

    // ------------------------------------------
    // Admin view control
    // ------------------------------------------
    $scope.check_admin = true;   // เพิ่มเติม check_admin
    $scope.user_role_id = $cookies.get('user_role_id'); // เพิ่มเติม check_admin

    $scope.showAdmin = function(){
        $scope.check_admin = true;
    }

    $scope.funcCheckUserRole = function(){
        if (['1','2','3'].indexOf($scope.user_role_id) > -1) {
              $scope.ajaxAllUserDataInfoOptions = {
                  "ajax": {
                      "url": url + '/lender_info',
                      "beforeSend" : function (request) {
                              request.setRequestHeader("Authorization", $cookies.get('api_token'));
                      }
                  },
                  "columns": [
                      { "data": "user_fullname" },
                      { "data": "user_email" },
                      {
                          "mRender": function () {
                              return "";
                          }
                      },
                  ],
                  "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                          var first_row = $("td:first", nRow);
                          var html = '<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="funcSelUser('+aData.user_id+','+ '\'' +first_row.html()+'\');"><i class="fa fa-pencil"></i></a>'
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
        }else{
            $scope.check_admin = false;
        }
    }

    $scope.funcSelUser = function(user_id, user_fullname){
      $scope.user_id = user_id;
      $scope.user_fullname = user_fullname;
      $scope.check_admin = false;
    }

    // -------------------------------------------
    // จังหวัด อำเภอ ตำบล
    // -------------------------------------------

    var province_id;
    var district_id;
    var sub_district_id;
    var need_load_address_id = false;

    $scope.$on('ngRepeatFinishedProvince', function(ngRepeatFinishedEvent) {
        if(need_load_address_id){
            $("#select_province").find('option').get(0).remove();// Fix angular bug
            initMaterialSelect('#select_province', province_id);
            $scope.getDistrict(province_id);
        }else{
            clearMaterialSelect('#select_province');
            clearMaterialSelect('#select_district');
            clearMaterialSelect('#select_sub_district');
        }
    });

     $scope.$on('ngRepeatFinishedDistrict', function(ngRepeatFinishedEvent) {
        if(need_load_address_id){
            $("#select_district").find('option').get(0).remove();// Fix angular bug
            initMaterialSelect('#select_district', district_id);
            $scope.getSubDistrict(district_id);
        }else{
            clearMaterialSelect('#select_district');
        }
    });

    $scope.$on('ngRepeatFinishedSub_district', function(ngRepeatFinishedEvent) {
        if(need_load_address_id){
            $("#select_sub_district").find('option').get(0).remove();// Fix angular bug
            initMaterialSelect('#select_sub_district', sub_district_id);
        }else{
            clearMaterialSelect('#select_sub_district');
        }
        need_load_address_id = false;
    });

    $scope.getProvince = function(){
        $http({
            method: 'GET',
            url: url + '/province',
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;

            if(res.status == "error"){
                toastr["warning"](res.error);
            }else{
                $scope.provinces = res.data;
            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.getDistrict = function(province_id){
        clearMaterialSelect('#select_district');
        clearMaterialSelect('#select_sub_district');
    	$http({
            method: 'GET',
            url: url + '/district/'+province_id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;

            if(res.status == "error"){
                toastr["warning"](res.error);
            }else{
                $scope.districts = res.data;
            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    $scope.getSubDistrict = function(district_id){
        clearMaterialSelect('#select_sub_district');
    	$http({
            method: 'GET',
            url: url + '/sub_district/'+district_id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            if(res.status == "error"){
                toastr["warning"](res.error);
            }else{
                $scope.sub_districts = res.data;
            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    // -------------------------------------------
    // เรียกข้อมูลพ่อค้าคนกลาง
    // -------------------------------------------
    $scope.funcGetUserDataByID = function(){
        $http({
            method: 'GET',
            url: url + '/lender_info/user_id/'+$scope.user_id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;

            $scope.getProvince();

            if(res.data.length == 0){
                need_load_address_id = false;
            }else{
                need_load_address_id = true;
                $scope.user_data = res.data[0];
                province_id = res.data[0].province_id;
                district_id = res.data[0].district_id;
                sub_district_id = res.data[0].sub_district_id;
            }

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    // เพิ่มข้อมูลพ่อค้าคนกลาง
    $scope.funcInsertUserData = function(user_data){
        $scope.user_data = user_data;
        $scope.user_data.user_id = $scope.user_id;
        $http({
            method: 'POST',
            url: url + '/lender_info',
            dataType: "json",
            data:$scope.user_data,
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            if(res.status == "error"){
                toastr["warning"](res.error);
            }else{
                toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                $scope.user_data = res.data;
            }
        }, function onError(response) {
            toastr["warning"]("system error"  + " : กรุณาใส่ข้อมูลให้ครบ");
        });
    }
    // อัพเดทข้อมูลพ่อค้าคนกลาง
    $scope.funcUpdateUserData = function(){

        $http({
            method: 'PUT',
            url: url + '/lender_info/'+$scope.user_id,
            dataType: "json",
            data:$scope.user_data,
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            if(res.status == "error"){
                toastr["warning"](res.error);
            }else{
              toastr["success"]("แก้ไขข้อมูลเรียบร้อย");

            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    // -------------------------------------------
    // เรียกข้อมูลผลผลิตที่ต้องการซื้อ
    // -------------------------------------------
    $scope.funcGetLenderTypeItemByID = function(){

        // Always reset value in form when show table
        $scope.lenderTypeItem = {};

        // AJAX method for dataTables.
        $scope.ajaxLenderTypeOptions = {
            "ajax": {
                "url": url + '/lender_lender_program_info/user_id/'+$scope.user_id+'?user_type_id='+user_type_id, // CHANGE
                "beforeSend" : function (request) {
                        request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                { "data": "name" }, // CHANGE
                { "data": "interest" },
                { "data": "installment_mo" },
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {// CHANGE
                    var html = '<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="detailLenderType('+aData.id+');"><i class="fa fa-eye"></i></a>'
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
            $('#table_data_lender_type').DataTable().ajax.reload();
        }, 1500 );
    }

    // เพิ่มข้อมูลผลผลิตที่ต้องการซื้อ
    $scope.funcInsertLenderTypeItem = function(data){
        $http({
            method: 'POST',
            url: url + '/lender_lender_program_info',
            dataType: "json",
            data:{
                "name" : data.name,
                "user_id" : $scope.user_id,
                "user_type_id" : user_type_id,
                "condition" : data.condition,
                "minimum" : data.minimum,
                "maximum" : data.maximum,
                "interest" : data.interest,
                "installment_mo" : data.installment_mo,
                "start_date" : data.start_date,
                "end_date" : data.end_date,
            },
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function(res){
             if(res.status == "error"){
                toastr["warning"](res.error);
            }else{

                toastr["success"]("บันทึกข้อมูลเรียบร้อย");

                $scope.funcGetLenderTypeItemByID();
                $scope.switchPage('table','tab2');
            }
        },function(err){
            toastr["warning"]("system error");
        });
    }

    // ดูรายละเอียดข้อมูลผลผลิตที่ต้องการซื้อ
    $scope.detailLenderType = function(id){
      $scope.objProduct = {};
        $http({
            method: 'GET',
            url: url + '/lender_lender_program_info/'+id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.objLender = res.data[0];
            $('#LenderTypeDetail').modal('show');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    };

    $scope.funcPrepareLenderTypeInfo = function(){
        $('.datepicker').pickadate({
            format: 'yyyy-mm-dd',
            formatSubmit: 'yyyy-mm-dd',
            hiddenPrefix: 'prefix__',
            hiddenSuffix: '__suffix'
        });
    };
    // -------------------------------------------
});
