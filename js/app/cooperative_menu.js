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

app.controller("CooperativeCtrl", function ($scope, $http, $cookies, $compile) {
    var user_type_id = 3;
    
    $scope.CheckCookies = function(){
        if($cookies.get('api_token') == "" || $cookies.get('api_token')==null){
            window.location.href = "../index.html";
        }
    }
    
    //set default variable initial
    $scope.user_id =  $cookies.get('user_id');
    $scope.activeTab = 'tab1';
    $scope.page_tab1 = 'table';
    $scope.CommitteeItem = {};
    $scope.CultivatedAreaItem = {};
    $scope.AgricultureItem = {};
    $scope.FarmerProductionItem = {};
    $scope.GapItem = {};
    $scope.IfoamItem = {};
    $scope.InternationalStandardItem = {};
    $scope.InspectionItem = {};
    function initUserDataSet(){
          $scope.user_data = {
            'user_id' : null,
            'name':null,
            'province_id':null,
            'district_id':null,
            'sub_district_id':null,
            'address':null,
            'phone':null,
            'email':null,
            'president_name':null,
            'number_member':null
          };
    }
    
    initUserDataSet();

    $scope.funcSwitchTab = function(tab){
        $scope.activeTab = tab;
    }
    
    $scope.switchPage = function(page,tab){ /*change form or table in tab*/
      	if(tab=='tab1'){
            $scope.page_tab1 = page;
            if($scope.page_tab1=='table'){
                $scope.CommitteeItem = {};
            }
    	}else if(tab=='tab2'){
            $scope.page_tab2 = page;
            if($scope.page_tab2=='table'){
                $scope.CultivatedAreaItem = {};
            }
    	}else if(tab=='tab3'){
            $scope.page_tab3 = page;
            if($scope.page_tab3=='table'){
                $scope.AgricultureItem = {};
            }
    	}else if(tab=='tab4'){
            $scope.page_tab4 = page;
            if($scope.page_tab4=='table'){
                $scope.FarmerProductionItem = {};
            }
    	}else if(tab=='tab5'){
            $scope.page_tab5 = page;
            if($scope.page_tab5=='table'){
                $scope.GapItem = {};
            }
    	}else if(tab=='tab6'){
            $scope.page_tab6 = page;
            if($scope.page_tab6=='table'){
                $scope.IfoamItem = {};
            }
    	}else if(tab=='tab7'){
            $scope.page_tab7 = page;
            if($scope.page_tab7=='table'){
                $scope.InternationalStandardItem = {};
            }
    	}else if(tab=='tab8'){
            $scope.page_tab8 = page;
            if($scope.page_tab8=='table'){
                $scope.InspectionItem = {};
            }
    	}
    }
    
    $scope.clearData = function(){
        $scope.page_tab1 = 'table';
        $scope.page_tab2 = 'table';
        $scope.page_tab3 = 'table';
        $scope.page_tab4 = 'table';
        $scope.page_tab5 = 'table';
        $scope.page_tab6 = 'table';
        $scope.page_tab7 = 'table';
        $scope.page_tab8 = 'table';
        clearMaterialSelect('.mdb-select');
        $('#select_province').val("");
        $('#select_district').val("");
        $('#select_sub_district').val("");
    }
    
    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
         $('.datepicker').pickadate({
            format: 'yyyy-mm-dd',
            formatSubmit: 'yyyy-mm-dd',
            hiddenPrefix: 'prefix__',
            hiddenSuffix: '__suffix'
          });
        initMaterialSelect('#select_cultivated_area');
        initMaterialSelect('#select_resource');
        initMaterialSelect('#select_product');
        initMaterialSelect('#select_cerificate_type');
        initMaterialSelect('#select_inspection_body_info');
        initMaterialSelect('#select_cultivated_area_gap');
        initMaterialSelect('#select_cultivated_area_ifoam');
        
    });
    
    
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
                      "url": url + '/farmer_cooperative_info',
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
    
    //
    //load Master Data
    //
    $scope.funcGetResourceInfo = function(){
        $http({
            method: 'GET',
            url: url + '/resource_info',
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.resource_info = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    
    $scope.funcGetProductInfo = function(){
        $http({
            method: 'GET',
            url: url + '/product_info',
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.product_info = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    
    $scope.funcGetCultivatedAreaInfo = function(){
        $http({
            method: 'GET',
            url: url + '/farmer_user_cultivated_area_info/user_id/'+$scope.user_id+"?user_type_id="+user_type_id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.cultivated_area_info = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    
    $scope.funcGetCerificateType = function(){
        $http({
            method: 'GET',
            url: url + '/cerificate_type',
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.cerificate_type = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    
    $scope.funcGetInspectionInfo = function(){
        $http({
            method: 'GET',
            url: url + '/inspection_body_info',
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.inspection_body_info = res.data;
            // TODO : Need initial selct to show select box when no data insert
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    
    //------------------------ panel 1 Profile ---------------------------//
    
    //
    //get farmer sme info
    //
    // -------------------------------------------
    // เรียกข้อมูลพ่อค้าคนกลาง
    // -------------------------------------------
    $scope.funcGetUserDataByID = function(){
        $http({
            method: 'GET',
            url: url + '/farmer_cooperative_info/user_id/'+$scope.user_id,
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
    
    // -------------------------------------------
    // เรียกข้อมูลกรรมการ
    // -------------------------------------------
    
    $scope.funcInsertUserData = function(user_data){
        $scope.user_data = user_data;
        $scope.user_data.user_id = $scope.user_id;
        $http({
            method: 'POST',
            url: url + '/farmer_cooperative_info',
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
   
    $scope.funcUpdateUserData = function(){

        $http({
            method: 'PUT',
            url: url + '/farmer_cooperative_info/'+$scope.user_id,
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
    
    //------------------------ panel 2 Cultivated Area---------------------------//
    
    $scope.funcGetCultivatedAreaByID = function(){
        // Always reset value in form when show table
        $scope.CultivatedAreaItem = {};

        // AJAX method for dataTables.
        $scope.ajaxCultivatedAreaOptions = {
            "ajax": {
                "url": url + '/farmer_user_cultivated_area_info/user_id/'+$scope.user_id+'?user_type_id='+user_type_id, // CHANGE
                "beforeSend" : function (request) {
                        request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                { "data": "deed_no" }, // CHANGE
                { "data": "gps_lat" },
                { "data": "gps_long" },
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {// CHANGE
                    var html = '<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="detailCultivatedArea('+aData.id+');"><i class="fa fa-eye"></i></a>';
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
            $('#table_data_cultivated_area').DataTable().ajax.reload();
        }, 1500 );
    }
    
    $scope.detailCultivatedArea = function(id){
        $scope.objCultivatedArea = {};
        $http({
            method: 'GET',
            url: url + '/farmer_user_cultivated_area_info/'+id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.objCultivatedArea = res.data[0];
            $('#DetailCultivatedArea').modal('show');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    
    $scope.funcInsertCultivatedArea = function(data){
        $http({
            method: 'POST',
            url: url + '/farmer_user_cultivated_area_info',
            dataType: "json",
            data:{
                "user_id" : $scope.user_id,
                "user_type_id" : user_type_id,
                "deed_no" : data.deed_no,
                "gps_lat" : data.gps_lat,
                "gps_long" : data.gps_long,
                "area" : data.area,
                "image_data" : ""
            },
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function(res){
             if(res.status == "error"){
                toastr["warning"](res.error);
            }else{

                toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                
                $scope.funcGetCultivatedAreaByID();
                $scope.funcGetCultivatedAreaInfo();
                $scope.switchPage('table','tab2');
            }
        },function(err){
            toastr["warning"]("system error");
        });
    }
    
    //------------------------ panel 3 Agriculture ---------------------------//
    $scope.funcGetAgricultureByID = function(){
        // Always reset value in form when show table
        $scope.AgricultureItem = {};

        // AJAX method for dataTables.
        $scope.ajaxAgricultureOptions = {
            "ajax": {
                "url": url + '/farmer_user_agriculture_info/user_id/'+$scope.user_id+'?user_type_id='+user_type_id, // CHANGE
                "beforeSend" : function (request) {
                        request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                { "data": "deed_no" }, // CHANGE
                { "data": "resource_name" },
                { "data": "qty" },
                { "data": "cost" },
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {// CHANGE
                    var html = '<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="detailAgriculture('+aData.id+');"><i class="fa fa-eye"></i></a>';
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
            $('#table_data_agriculture').DataTable().ajax.reload();
        }, 1500 );
    }
    
    $scope.detailAgriculture = function(id){
        $scope.objAgriculture = {};
        $http({
            method: 'GET',
            url: url + '/farmer_user_agriculture_info/'+id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.objAgriculture = res.data[0];
            $('#DetailAgriculture').modal('show');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    
    $scope.funcInsertAgriculture = function(data){
        $http({
            method: 'POST',
            url: url + '/farmer_user_agriculture_info',
            dataType: "json",
            data:{
                "user_id" : $scope.user_id,
                "user_type_id" : user_type_id,
                "resource_info_id" : data.resource_info_id,
                "farmer_user_cultivated_area_info_id" : data.farmer_user_cultivated_area_info_id,
                "qty" : data.qty,
                "start_datetime" : data.start_datetime,
                "end_datetime" : data.end_datetime,
                "cost" : data.cost
            },
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function(res){
             if(res.status == "error"){
                toastr["warning"](res.error);
            }else{

                toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                
                $scope.funcGetAgricultureByID();
                $scope.switchPage('table','tab3');
            }
        },function(err){
            toastr["warning"]("system error");
        });
    }
    
    //------------------------ panel 4 Farmer Production ---------------------------//
    $scope.funcGetFarmerProductionByID = function(){

        // Get profit
        $http({
            method: 'GET',
            "url": url + '/farmer_user_production_info/profit/user_id/'+$scope.user_id+'?user_type_id='+user_type_id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.profit = res.data;
        }, function onError(response) {
            toastr["warning"]("system error");
            $scope.profit = "";
        });

        // Always reset value in form when show table
        $scope.FarmerProductionItem = {};

        // AJAX method for dataTables.
        $scope.ajaxFarmerProductionOptions = {
            "ajax": {
                "url": url + '/farmer_user_production_info/user_id/'+$scope.user_id+'?user_type_id='+user_type_id, // CHANGE
                "beforeSend" : function (request) {
                        request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                { "data": "product_name" }, // CHANGE
                { "data": "expect_outcome" },
                { "data": "exact_outcome" },
                { "data": "expect_revenue" },
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {// CHANGE
                    var html = '<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="detailFarmerProduction('+aData.id+');"><i class="fa fa-eye"></i></a>';
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
            $('#table_data_farmer_production').DataTable().ajax.reload();
        }, 1500 );
    }
    
    $scope.detailFarmerProduction = function(id){
        $scope.objFarmerProduction = {};
        $http({
            method: 'GET',
            url: url + '/farmer_user_production_info/'+id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.objFarmerProduction = res.data[0];
            $('#detailFarmerProductions').modal('show');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    
    $scope.funcInsertFarmerProduction = function(data){
        $http({
            method: 'POST',
            url: url + '/farmer_user_production_info',
            dataType: "json",
            data:{
                "user_id" : $scope.user_id,
                "user_type_id" : user_type_id,
                "product_info_id" : data.product_info_id,
                "expect_outcome" : data.expect_outcome,
                "exact_outcome" : data.exact_outcome,
                "expect_datetime" : data.expect_datetime,
                "exact_datetime" : data.exact_datetime,
                "expect_revenue" : data.expect_revenue
            },
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function(res){
             if(res.status == "error"){
                toastr["warning"](res.error);
            }else{

                toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                
                $scope.funcGetFarmerProductionByID();
                $scope.switchPage('table','tab4');
            }
        },function(err){
            toastr["warning"]("system error");
        });
    }
    
    //------------------------ panel 5 GAP ---------------------------//
    $scope.funcGetGapByID = function(){
        // Always reset value in form when show table
        $scope.GapItem = {};

        // AJAX method for dataTables.
        $scope.ajaxGapOptions = {
            "ajax": {
                "url": url + '/farmer_user_gap_standard_info/user_id/'+$scope.user_id+'?user_type_id='+user_type_id, // CHANGE
                "beforeSend" : function (request) {
                        request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                { "data": "deed_no" }, // CHANGE
                { "data": "cerificate_no" },
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {// CHANGE
                    var html = '<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="detailGap('+aData.id+');"><i class="fa fa-eye"></i></a>';
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
            $('#table_data_gap').DataTable().ajax.reload();
        }, 1500 );
    }
    
    //list show title
    $scope.funcGetGepTitleInfo = function(){
        $http({
            method: 'GET',
            url: url + '/gap_standard_title_info',
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.gap_standard_title_info = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    //list show item in title
    $scope.funcGetGepItemInfo = function(){
        $http({
            method: 'GET',
            url: url + '/gap_standard_item_info',
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.gap_standard_item_info = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    
    $scope.detailGap = function(id){
        $scope.objGap = {};
        $http({
            method: 'GET',
            url: url + '/farmer_user_gap_standard_info/'+id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.objGap = res.data[0];
            $scope.gaplist(JSON.parse($scope.objGap.standard_result_json));
            $('#detailGap').modal('show');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    
    $scope.gaplist = function(obj){
        $("#detailGap input[type=checkbox]").each(function(){
             
             if(obj[$(this).attr("id")]){
                 $(this).prop( "checked", true  );
             }
        });
    }
    
    $scope.funcInsertGap = function(data){
        var jsonItem = {};
        $("#gaplist input[type=checkbox]").each(function(){
             jsonItem[$(this).attr("id")] = $(this).is( ":checked" );
        });
        
        $http({
            method: 'POST',
            url: url + '/farmer_user_gap_standard_info',
            dataType: "json",
            data:{
                "user_id" : $scope.user_id,
                "user_type_id" : user_type_id,
                "farmer_user_cultivated_area_info_id" : data.farmer_user_cultivated_area_info_id,
                "cerificate_no" : data.cerificate_no,
                "standard_result_json" : JSON.stringify(jsonItem),
                "image_data" : ""
            },
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function(res){
             if(res.status == "error"){
                toastr["warning"](res.error);
            }else{

                toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                
                $scope.funcGetGapByID();
                $scope.switchPage('table','tab5');
            }
        },function(err){
            toastr["warning"]("system error");
        });
        
    }
    
    //------------------------ panel 6 IFOAM ---------------------------//
    $scope.funcGetIfoamByID = function(){
        // Always reset value in form when show table
        $scope.IfoamItem = {};

        // AJAX method for dataTables.
        $scope.ajaxIfoamOptions = {
            "ajax": {
                "url": url + '/farmer_user_organic_standard_info/user_id/'+$scope.user_id+'?user_type_id='+user_type_id, // CHANGE
                "beforeSend" : function (request) {
                        request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                { "data": "deed_no" }, // CHANGE
                { "data": "cerificate_no" },
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {// CHANGE
                    var html = '<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="detailIfoam('+aData.id+');"><i class="fa fa-eye"></i></a>';
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
            $('#table_data_ifoam').DataTable().ajax.reload();
        }, 1500 );
    }
    
    $scope.detailIfoam = function(id){
        $scope.objIfoam = {};
        $http({
            method: 'GET',
            url: url + '/farmer_user_organic_standard_info/'+id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.objIfoam = res.data[0];
            $scope.Ifoamlist(JSON.parse($scope.objIfoam.standard_result_json));
            $('#detailIfoam').modal('show');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    
    $scope.Ifoamlist = function(obj){
        $("#detailIfoam input[type=checkbox]").each(function(){
             
             if(obj[$(this).attr("id")]){
                 $(this).prop( "checked", true  );
             }
        });
    }
    
    //list show title
    $scope.funcGetIfoamTitleInfo = function(){
        $http({
            method: 'GET',
            url: url + '/ifoam_standard_title_info',
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.ifoam_standard_title_info = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    
    //list show item LV2 in title
    $scope.funcGetIfoamLV2TitleInfo = function(){
        $http({
            method: 'GET',
            url: url + '/ifoam_standard_lv2_title_info',
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.ifoam_standard_lv2_title_info = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    
    //list show item LV3 in title
    $scope.funcGetIfoamLV3TitleInfo = function(){
        $http({
            method: 'GET',
            url: url + '/ifoam_standard_lv3_title_info',
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.ifoam_standard_lv3_title_info = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    
    //list show item LV4 in title
    $scope.funcGetIfoamLV4TitleInfo = function(){
        $http({
            method: 'GET',
            url: url + '/ifoam_standard_lv4_title_info',
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.ifoam_standard_lv4_title_info = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    
    $scope.funcInsertIfoam = function(data){
        var jsonItem = {};
        $("#ifoamlist input[type=checkbox]").each(function(){
             jsonItem[$(this).attr("id")] = $(this).is( ":checked" );
        });
        
        $http({
            method: 'POST',
            url: url + '/farmer_user_organic_standard_info',
            dataType: "json",
            data:{
                "user_id" : $scope.user_id,
                "user_type_id" : user_type_id,
                "farmer_user_cultivated_area_info_id" : data.farmer_user_cultivated_area_info_id,
                "cerificate_no" : data.cerificate_no,
                "standard_result_json" : JSON.stringify(jsonItem),
                "image_data" : ""
            },
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function(res){
             if(res.status == "error"){
                toastr["warning"](res.error);
            }else{

                toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                
                $scope.funcGetIfoamByID();
                $scope.switchPage('table','tab6');
            }
        },function(err){
            toastr["warning"]("system error");
        });
        
    }
    
    //------------------------ panel 7 International Standard ---------------------------//
    $scope.funcGetInternationalStandardByID = function(){
        // Always reset value in form when show table
        $scope.InternationalStandardItem = {};

        // AJAX method for dataTables.
        $scope.ajaxInterStandardOptions = {
            "ajax": {
                "url": url + '/farmer_user_international_standard_info/user_id/'+$scope.user_id+'?user_type_id='+user_type_id, // CHANGE
                "beforeSend" : function (request) {
                        request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                { "data": "cerificate_no" }, // CHANGE
                { "data": "cerificate_type_name" },
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {// CHANGE
                    var html = '<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="detailInterStandard('+aData.id+');"><i class="fa fa-eye"></i></a>';
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
            $('#table_data_international_standard').DataTable().ajax.reload();
        }, 1500 );
    }
    
    $scope.detailInterStandard = function(id){
        $scope.objInterStandard = {};
        $http({
            method: 'GET',
            url: url + '/farmer_user_international_standard_info/'+id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.objInterStandard = res.data[0];
            $('#detailInterStandard').modal('show');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    
    $scope.funcInsertInterStandard = function(data){
        $http({
            method: 'POST',
            url: url + '/farmer_user_international_standard_info',
            dataType: "json",
            data:{
                "user_id" : $scope.user_id,
                "user_type_id" : user_type_id,
                "cerificate_no" : data.cerificate_no,
                "cerificate_type_id" : data.cerificate_type_id,
                "image_data" : ""
            },
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function(res){
             if(res.status == "error"){
                toastr["warning"](res.error);
            }else{

                toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                
                $scope.funcGetInternationalStandardByID();
                $scope.switchPage('table','tab7');
            }
        },function(err){
            toastr["warning"]("system error");
        });
    }
    
    //------------------------ panel 8 Inspection ---------------------------//
    $scope.funcGetInspectionByID = function(){
        // Always reset value in form when show table
        $scope.InspectionItem = {};

        // AJAX method for dataTables.
        $scope.ajaxInspectionOptions = {
            "ajax": {
                "url": url + '/farmer_user_inspection/user_id/'+$scope.user_id+'?user_type_id='+user_type_id, // CHANGE
                "beforeSend" : function (request) {
                        request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                { "data": "fullname" }, // CHANGE
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {// CHANGE
                    var html = '<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="detailInspection('+aData.id+');"><i class="fa fa-eye"></i></a>';
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
            $('#table_data_inspection').DataTable().ajax.reload();
        }, 1500 );
    }
    
    $scope.detailInspection = function(id){
        $scope.objInspection = {};
        $http({
            method: 'GET',
            url: url + '/farmer_user_inspection/'+id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.objInspection = res.data[0];
            $('#detailInspection').modal('show');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    
    $scope.funcInsertInspection = function(data){
        $http({
            method: 'POST',
            url: url + '/farmer_user_inspection',
            dataType: "json",
            data:{
                "user_id" : $scope.user_id,
                "user_type_id" : user_type_id,
                "inspection_body_info_id" : data.inspection_body_info_id
            },
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function(res){
             if(res.status == "error"){
                toastr["warning"](res.error);
            }else{

                toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                
                $scope.funcGetInspectionByID();
                $scope.switchPage('table','tab8');
            }
        },function(err){
            toastr["warning"]("system error");
        });
    }
});