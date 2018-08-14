
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

app.controller("OnlineRetailerCtrl", function ($scope, $http, $cookies, $compile) {
    var user_type_id = 5;

    $scope.CheckCookies = function(){
        if($cookies.get('api_token') == "" || $cookies.get('api_token')==null){
            window.location.href = "../index.html";
        }
    }
    $scope.user_id =  $cookies.get('user_id');
    $scope.buyingItem={};
    $scope.sellingItem={};
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
                $scope.buyingItem = {};
            }
    	}else if(tab=='tab3'){
            $scope.page_tab3 = page;
            if($scope.page_tab3=='table'){
                $scope.sellingItem = {};
            }
    	}
    }

    $scope.clearData = function(){
        $scope.page_tab2 = 'table';
        $scope.page_tab3 = 'table';
        clearMaterialSelect('.mdb-select');
        $('#select_province').val("");
        $('#select_district').val("");
        $('#select_sub_district').val("");
    }

    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
        initMaterialSelect('#select_product_buying');
        initMaterialSelect('#select_product_selling');
    });

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
                      "url": url + '/online_retailer_info',
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
    // เรียกข้อมูลพ่อค้าออนไลน์
    // -------------------------------------------
    $scope.funcGetUserDataByID = function(){
        $http({
            method: 'GET',
            url: url + '/online_retailer_info/user_id/'+$scope.user_id,
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
    // เพิ่มข้อมูลพ่อค้าออนไลน์
    $scope.funcInsertUserData = function(user_data){
        $scope.user_data = user_data;
        $scope.user_data.user_id = $scope.user_id;
        $http({
            method: 'POST',
            url: url + '/online_retailer_info',
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
            url: url + '/online_retailer_info/'+$scope.user_id,
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
    // เรียกข้อมูลผลผลิต
    // -------------------------------------------
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

    // -------------------------------------------
    // เรียกข้อมูลผลผลิตที่ต้องการซื้อ
    // -------------------------------------------
    $scope.funcGetBuyingItemByID = function(){

        // Always reset value in form when show table
        $scope.buyingItem = {};

        // AJAX method for dataTables.
        $scope.ajaxBuyOptions = {
            "ajax": {
                "url": url + '/buying_item_info/user_id/'+$scope.user_id+'?user_type_id='+user_type_id, // CHANGE
                "beforeSend" : function (request) {
                        request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                { "data": "product_name" }, // CHANGE
                { "data": "qty" },
                { "data": "price" },
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {// CHANGE
                    var html = '<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="detailProductBuying('+aData.id+');"><i class="fa fa-eye"></i></a>'
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
            $('#table_data_product_buying').DataTable().ajax.reload();
        }, 1500 );
    }

    // เพิ่มข้อมูลผลผลิตที่ต้องการซื้อ
    $scope.funcInsertbBuyingItem = function(data){
        $http({
            method: 'POST',
            url: url + '/buying_item_info',
            dataType: "json",
            data:{
                "product_info_id" : data.product_info_id,
                "user_id" : $scope.user_id,
                "user_type_id" : user_type_id,
                "qty" : data.qty,
                "price" : data.price,
                "address" : data.address
            },
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function(res){
             if(res.status == "error"){
                toastr["warning"](res.error);
            }else{

                toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                $scope.buyingItem = {};
                initMaterialSelect('#select_product_buying');

                $scope.funcGetBuyingItemByID();
                $scope.page_tab2 = 'table';
            }
        },function(err){
            toastr["warning"]("system error");
        });

    }

    // ดูรายละเอียดข้อมูลผลผลิตที่ต้องการซื้อ
    $scope.detailProductBuying = function(id){
      $scope.objProduct = {};
        $http({
            method: 'GET',
            url: url + '/buying_item_info/'+id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.objProduct = res.data[0];
            $('#ProductDetailBuy').modal('show');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    };

    // ----------------------------------------------
    /// เรียกข้อมูลผลผลิตที่ต้องการขาย
    // -------------------------------------------
    $scope.funcGetSellingItemByID = function(){

        // Always reset value in form when show table
        $scope.sellingItem = {};

        // AJAX method for dataTables.
        $scope.ajaxSellOptions = {
            "ajax": {
                "url": url + '/selling_item_info/user_id/'+$scope.user_id+'?user_type_id='+user_type_id,
                "beforeSend" : function (request) {
                        request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                { "data": "product_name" },
                { "data": "qty" },
                { "data": "price" },
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    var html = '<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="detailProductSelling('+aData.id+');"><i class="fa fa-eye"></i></a>'
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
            $('#table_data_product_selling').DataTable().ajax.reload();
        }, 1500 );
    }
    // เพิ่มข้อมูลผลผลิตที่ต้องการขาย
    $scope.funcInsertbSellingItem = function(data){
       console.log(data);
        $http({
            method: 'POST',
            url: url + '/selling_item_info',
            dataType: "json",
            data:{
                  "product_info_id" : data.product_info_id,
                    "user_id" : $scope.user_id,
                    "user_type_id" : user_type_id,
                  "qty" : data.qty,
                  "price" : data.price,
                  "address" : data.address
                },
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            if(res.status == "error"){
                toastr["warning"](res.error);
            }else{
                toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                $scope.sellingItem = {};
                initMaterialSelect('#select_product_selling');

                $scope.funcGetSellingItemByID();
                $scope.page_tab3='table';
            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    // ดูรายละเอียดข้อมูลผลผลิตที่ต้องการขาย
    $scope.detailProductSelling = function(id){
      $scope.objProduct = {};
        $http({
            method: 'GET',
            url: url + '/selling_item_info/'+id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var res = response.data;
            $scope.objProduct = res.data[0];
            $('#ProductDetailSell').modal('show');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    };
    // -------------------------------------------
});