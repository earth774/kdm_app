
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

app.directive('emptyToNull', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            ctrl.$parsers.push(function(viewValue) {
                if(viewValue === "") {
                    return null;
                }
                return viewValue;
            });
        }
    };
});

app.controller("WholeSalerCtrl", function ($scope, $http, $cookies, $compile, $filter, NgMap) {
    var user_type_id = 2;

     $scope.$watch('user_data.age', function (newValue, oldValue) {
        if(newValue === "")
        $scope.test.value = null;
    });

    $scope.CheckCookies = function () {
        if ($cookies.get('api_token') == "" || $cookies.get('api_token') == null) {
            window.location.href = "../index.html";
        }
    }
    $scope.user_id = $cookies.get('user_id');
    $scope.user_type_id = 2;
    $scope.activeTab = 'tab1';
    function initUserDataSet() {
        $scope.user_data = {
            "user_id": $scope.user_id,
            "gender_id": '1',
            "name": null,
            "surname": null,
            "province_id": null,
            "district_id": null,
            "sub_district_id": null,
            "address": null,
            "gps_lat": null,
            "gps_long": null,
            "tax_id": null,
            "age" : null,
            "house_number" : null,
            "village" : null,
            "village_number" : null,
            "alley" : null,
            "phone": null,
            "email": null,
            "is_corporate": '0',
            "corp_type": null,
            "corp_certificate": null,
            "corp_name": null,
            "corp_president_name": null,
            "corp_number_member": null,
            "corp_number": null,
            "registered_capital": null,
            "corporate_type_id": '1',
            "shop_name": null,
            "shop_website": null,
            "shop_email": null,
            "shop_line": null,
            "shop_facebook": null,
            "shop_ig": null,
            "shop_phone": null
        };
        $scope.user_data.gps_lat  = window.localStorage.getItem("gps_lat");
        $scope.user_data.gps_long = window.localStorage.getItem("gps_long"); 
        $scope.search_address = $scope.user_data.gps_lat +','+ $scope.user_data.gps_long;        
    }
    function initBuyingItemSet() {
        $scope.buyingItem = {
            "user_id": $scope.user_id,
            "user_type_id": user_type_id,
            "product_info_id": null,
            "product_info_explanation": null,
            "qty": null,
            "price": null,
            "address": null,
            "sub_id": 0,
            "loss_qty": null,
            "buying_start_date_time": null,
            "buying_end_date_time": null,
            "transport_duration_start_datetime": null,
            "transport_duration_end_datetime": null
        };
    }
    function initSellingItemSet() {
        $scope.sellingItem = {
            "user_id": $scope.user_id,
            "user_type_id": user_type_id,
            "product_info_id": null,
            "product_info_explanation": null,
            "qty": null,
            "price": null,
            "address": null,
            "sub_id": 0,
            "loss_qty": null,
            "selling_start_date_time": null,
            "selling_end_date_time": null,
            "transport_duration_start_datetime": null,
            "transport_duration_end_datetime": null
        };
    }
    initUserDataSet();
    initBuyingItemSet();
    initSellingItemSet();

    $scope.funcSwitchTab = function (tab) {
        $scope.activeTab = tab;
    }

    $scope.switchPage = function (page, tab) { /*change form or table in tab*/
        $scope.hasSubmit = false;
        $scope.unit_product = null;
        if (tab == 'tab3') {
            $scope.page_tab3 = page;
            if ($scope.page_tab3 == 'table') {
                initBuyingItemSet();
            }
        } else if (tab == 'tab4') {
            $scope.page_tab4 = page;
            if ($scope.page_tab4 == 'table') {
                initSellingItemSet();
            }
        }
    }

    $scope.clearData = function () {
        $scope.page_tab2 = 'table';
        $scope.page_tab3 = 'table';
        $scope.page_tab4 = 'table';
        $scope.hasSubmit = false;
        clearMaterialSelect('.mdb-select');
        $('#select_province').val("");
        $('#select_district').val("");
        $('#select_sub_district').val("");
        $('#select_store').val("");

        $('#select_product_buying').val("");
        $('#select_product_selling').val("");
    }

    $scope.$on('ngProductRepeatFinished', function (ngRepeatFinishedEvent) {

        $('.datepicker').pickadate({
            format: 'yyyy-mm-dd',
            formatSubmit: 'yyyy-mm-dd',
            hiddenPrefix: 'prefix__',
            hiddenSuffix: '__suffix'
        });

        setTimeout(function () {
            initMaterialSelect('#select_product_buying');
            initMaterialSelect('#select_product_selling');
            checkselectoption();
        }, 500);
    });

    function checkselectoption() {
        // tab 3 form
        if ($scope.buyingItem.product_info_id) {
            initMaterialSelect('#select_product_buying', $scope.buyingItem.product_info_id);
        }
        // tab 4 form
        if ($scope.sellingItem.product_info_id) {
            initMaterialSelect('#select_product_selling', $scope.sellingItem.product_info_id);
        }
    }

    // set map center
    $scope.resizeMap = function () {
        if ($scope.user_data.id) {
            setTimeout(function () {
                var center = new google.maps.LatLng($scope.user_data.gps_lat, $scope.user_data.gps_long);

                NgMap.getMap({id: 'userMap'}).then(function (map) {
                    google.maps.event.trigger(map, 'resize');
                    map.setCenter(center);

                });
            }, 600);
        } else {
            navigator.geolocation.getCurrentPosition(function (pos) {
                $scope.position = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                console.log(JSON.stringify($scope.position));
            });
            setTimeout(function () {
                NgMap.getMap({id: 'userMap'}).then(function (map) {
                    google.maps.event.trigger(map, 'resize');
                    map.setCenter($scope.position);
                });
            }, 600);
        }
    }

    // ------------------------------------------
    // Admin view control
    // ------------------------------------------
    $scope.check_admin = true;   // เพิ่มเติม check_admin
    $scope.user_role_id = $cookies.get('user_role_id'); // เพิ่มเติม check_admin

    $scope.showAdmin = function () {
        $scope.check_admin = true;
    }

    $scope.funcCheckUserRole = function () {
        if (['1', '2', '3'].indexOf($scope.user_role_id) > -1) {
            $scope.ajaxAllUserDataInfoOptions = {
                "ajax": {
                    "url": url + '/wholesaler_info',
                    "beforeSend": function (request) {
                        request.setRequestHeader("Authorization", $cookies.get('api_token'));
                    }
                },
                "columns": [
                    {"data": "user_fullname"},
                    {"data": "username"},
                    {"data": "user_email"},
                    {
                        "mRender": function () {
                            return "";
                        }
                    },
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    var first_row = $("td:first", nRow);
                    var html = '<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="funcSelUser(' + aData.user_id + ',' + '\'' + first_row.html() + '\');"><i class="fa fa-pencil"></i></a>'
                             + '<a class="btn-floating btn-sm red darken-3 waves-effect waves-light" data-toggle="modal" data-target="#ConfirmDel" ng-click="ConfirmDelete('+aData.id+',\'' +aData.name+'\');"><i class="fa fa-trash"></i></a>';
                    var last_row = $("td:last", nRow);
                    if (!last_row.html()) {
                        angular.element(last_row).append($compile(html)($scope))
                    }

                    $(nRow).attr("id", 'row_' + aData.id);
                    return nRow;
                },
                "fnDrawCallback": function (oSettings, json) {
                    initMaterialSelectDataTable();
                },
            };
        } else {
            $scope.check_admin = false;
        }
    }

    $scope.funcSelUser = function (user_id, user_fullname) {
        $scope.user_id = user_id;
        $scope.user_fullname = user_fullname;
        $scope.username = user_fullname;
        $scope.check_admin = false;
        initUserDataSet();
        initBuyingItem();
        initSellingItem();
    }

    // -------------------------------------------
    // จังหวัด อำเภอ ตำบล
    // -------------------------------------------

    var province_id;
    var district_id;
    var sub_district_id;
    var need_load_address_id = false;

    $scope.$on('ngRepeatFinishedProvince', function (ngRepeatFinishedEvent) {
        if (need_load_address_id) {
            $("#select_province").find('option').get(0).remove();// Fix angular bug
            initMaterialSelect('#select_province', province_id);
            $scope.getDistrict(province_id);
        } else {
            clearMaterialSelect('#select_province');
            clearMaterialSelect('#select_district');
            clearMaterialSelect('#select_sub_district');
        }
    });

    $scope.$on('ngRepeatFinishedDistrict', function (ngRepeatFinishedEvent) {
        if (need_load_address_id) {
            $("#select_district").find('option').get(0).remove();// Fix angular bug
            initMaterialSelect('#select_district', district_id);
            $scope.getSubDistrict(district_id);
        } else {
            clearMaterialSelect('#select_district');
        }
    });

    $scope.$on('ngRepeatFinishedSub_district', function (ngRepeatFinishedEvent) {
        if (need_load_address_id) {
            $("#select_sub_district").find('option').get(0).remove();// Fix angular bug
            initMaterialSelect('#select_sub_district', sub_district_id);
        } else {
            clearMaterialSelect('#select_sub_district');
        }
        need_load_address_id = false;
    });

    $scope.getProvince = function () {
        $http({
            method: 'GET',
            url: url + '/province',
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;

            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {
                $scope.provinces = res.data;
            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.getDistrict = function (province_id) {
        clearMaterialSelect('#select_district');
        clearMaterialSelect('#select_sub_district');
        $http({
            method: 'GET',
            url: url + '/district/' + province_id,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;

            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {
                $scope.districts = res.data;
            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    $scope.getSubDistrict = function (district_id) {
        clearMaterialSelect('#select_sub_district');
        $http({
            method: 'GET',
            url: url + '/sub_district/' + district_id,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {
                $scope.sub_districts = res.data;
            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    // -------------------------------------------
    // เรียกข้อมูลพ่อค้าคนกลาง
    // -------------------------------------------
    $scope.funcGetUserDataByID = function () {
        $http({
            method: 'GET',
            url: url + '/wholesaler_info/user_id/' + $scope.user_id,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;

            $scope.getProvince();

            if (res.data.length == 0) {
                need_load_address_id = false;
            } else {
                need_load_address_id = true;
                $scope.user_data = res.data[0];
                $scope.user_data.gender_id = res.data[0].gender_id.toString();
                $scope.user_data.corporate_type_id = res.data[0].corporate_type_id.toString();
                $scope.user_data.is_corporate = res.data[0].is_corporate.toString();
                province_id = res.data[0].province_id;
                district_id = res.data[0].district_id;
                sub_district_id = res.data[0].sub_district_id;
                $scope.search_address = $scope.user_data.gps_lat +','+ $scope.user_data.gps_long;
            }
            $scope.resizeMap();

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    // เพิ่มข้อมูลพ่อค้าคนกลาง
    $scope.funcInsertUserData = function (required) {
        $scope.hasSubmit = true;
        if(!required){
            $http({
                method: 'POST',
                url: url + '/wholesaler_info',
                dataType: "json",
                data: $scope.user_data,
                headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
            }).then(function onSuccess(response) {
                var res = response.data;
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {
                    toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                    $scope.user_data = res.data;
                }
            }, function onError(response) {
                toastr["warning"]("system error"  + " : กรุณาใส่ข้อมูลให้ครบ");
            });
        }

    }
    // อัพเดทข้อมูลพ่อค้าคนกลาง
    $scope.funcUpdateUserData = function (required) {

    $scope.hasSubmit = true;
    if(!required){
        $http({
            method: 'PUT',
            url: url + '/wholesaler_info/' + $scope.user_id,
            dataType: "json",
            data: $scope.user_data,
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {
                toastr["success"]("แก้ไขข้อมูลเรียบร้อย");

            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }


    }
    // -------------------------------------------
    // เรียกข้อมูลผลผลิต
    // -------------------------------------------
    $scope.funcGetProductInfo = function () {
        $http({
            method: 'GET',
            url: url + '/product_info',
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.product_info = res.data;
           
            setTimeout(function () { //select option in tab2 set delay
                initMaterialSelect('#select_product_buying');
            }, 50);
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    // -------------------------------------------
    // เรียกข้อมูลผลผลิตที่ต้องการซื้อ
    // -------------------------------------------
    $scope.funcGetBuyingItemByID = function () {

        // Always reset value in form when show table
        initBuyingItemSet();

        // AJAX method for dataTables.
        $scope.ajaxBuyOptions = {
            "ajax": {
                "url": url + '/buying_item_info/user_id/' + $scope.user_id + '?user_type_id=' + user_type_id, // CHANGE
                "beforeSend": function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                {"data": "product_name"}, // CHANGE
                {"data": "qty"},
                {"data": "price"},
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {// CHANGE
                let menu = 'buying_item_info';
                var html = '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="detailProductBuying(' + aData.id + ');"><i class="fa fa-pencil"></i></a>' +
                        '<a class="btn-floating btn-sm red darken-3 waves-effect waves-light" ng-click="getDelData(' + aData.id + ',' + '\'' + menu + '\');"><i class="fa fa-trash"></i></a>';

                var last_row = $("td:last", nRow);
                if (!last_row.html()) {
                    angular.element(last_row).append($compile(html)($scope))
                }
                $(nRow).attr("id", 'row_' + aData.id);
                return nRow;
            },
            "fnDrawCallback": function (oSettings, json) {
                initMaterialSelectDataTable();
            },
        };

        setTimeout(function () {
            $('#table_data_product_buying').DataTable().ajax.reload();
        }, 300);
    }

    // เพิ่มข้อมูลผลผลิตที่ต้องการซื้อ
    $scope.funcInsertbBuyingItem = function (require) {
        $scope.hasSubmit = true;
        if(!require){
            $http({
                method: 'POST',
                url: url + '/buying_item_info',
                dataType: "json",
                data: $scope.buyingItem,
                headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
            }).then(function (res) {
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {

                    toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                    initBuyingItemSet();
                    initMaterialSelect('#select_product_buying');

                    $scope.funcGetBuyingItemByID();
                    $scope.page_tab3 = 'table';
                }
            }, function (err) {
                toastr["warning"]("system error");
            });
        }

    }

    // แก้ไขรายละเอียดผลผลิตที่ต้องการซื้อ
    $scope.funcUpdateBuyingItem = function (require) {
    $scope.hasSubmit = true;
            if(!require){
                $http({
                    method: 'PUT',
                    url: url + '/buying_item_info/' + $scope.buyingItem.id,
                    dataType: "json",
                    data: $scope.buyingItem,
                    headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
                }).then(function (res) {
                    if (res.status == "error") {
                        toastr["warning"](res.error);
                    } else {

                        toastr["success"]("แก้ไขข้อมูลเรียบร้อย");
                        initBuyingItemSet();
                        initMaterialSelect('#select_product_buying');

                        $scope.funcGetBuyingItemByID();
                        $scope.page_tab3 = 'table';
                    }
                }, function (err) {
                    toastr["warning"]("system error");
                });
            }

    }

    // ดูรายละเอียดข้อมูลผลผลิตที่ต้องการซื้อ
    $scope.detailProductBuying = function (id) {
        $scope.objProduct = {};
        $http({
            method: 'GET',
            url: url + '/buying_item_info/' + id,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.objProduct = res.data[0];
            $scope.buyingItem = res.data[0];
            // $('#ProductDetailBuy').modal('show');
            $scope.buyingItem.buying_end_date_time = $filter('limitTo')($scope.buyingItem.buying_end_date_time, 10, 0);
            $scope.buyingItem.buying_start_date_time = $filter('limitTo')($scope.buyingItem.buying_start_date_time, 10, 0);
            $scope.buyingItem.transport_duration_end_datetime = $filter('limitTo')($scope.buyingItem.transport_duration_end_datetime, 10, 0);
            $scope.buyingItem.transport_duration_start_datetime = $filter('limitTo')($scope.buyingItem.transport_duration_start_datetime, 10, 0);
            $scope.switchPage('form', 'tab3');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    };

    // ----------------------------------------------
    /// เรียกข้อมูลผลผลิตที่ต้องการขาย
    // -------------------------------------------
    $scope.funcGetSellingItemByID = function () {

        // Always reset value in form when show table
        initSellingItemSet();

        // AJAX method for dataTables.
        $scope.ajaxSellOptions = {
            "ajax": {
                "url": url + '/selling_item_info/user_id/' + $scope.user_id + '?user_type_id=' + user_type_id,
                "beforeSend": function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                {"data": "product_name"},
                {"data": "qty"},
                {"data": "price"},
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                let menu = 'selling_item_info';
                var html = '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="detailProductSelling(' + aData.id + ');"><i class="fa fa-pencil"></i></a>' +
                        '<a class="btn-floating btn-sm red darken-3 waves-effect waves-light" ng-click="getDelData(' + aData.id + ',' + '\'' + menu + '\');"><i class="fa fa-trash"></i></a>';

                var last_row = $("td:last", nRow);
                if (!last_row.html()) {
                    angular.element(last_row).append($compile(html)($scope))
                }
                $(nRow).attr("id", 'row_' + aData.id);
                return nRow;
            },
            "fnDrawCallback": function (oSettings, json) {
                initMaterialSelectDataTable();
            },
        };

        setTimeout(function () {
            $('#table_data_product_selling').DataTable().ajax.reload();
        }, 300);
    }
    // เพิ่มข้อมูลผลผลิตที่ต้องการขาย
    $scope.funcInsertbSellingItem = function (require) {
        $scope.hasSubmit = true;
        if(!require){
            $http({
                method: 'POST',
                url: url + '/selling_item_info',
                dataType: "json",
                data:$scope.sellingItem,
                headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
            }).then(function onSuccess(response) {
                var res = response.data;
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {
                    toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                    initSellingItemSet();
                    initMaterialSelect('#select_product_selling');

                    $scope.funcGetSellingItemByID();
                    $scope.page_tab4='table';
                }
            }, function onError(response) {
                toastr["warning"]("system error");
            });
        }

    }
    // แก้ไขข้อมูลผลผลิตที่ต้องการขาย
    $scope.funcUpdateSellingItem = function(require){

    $scope.hasSubmit = true;
            if(!require){
                $http({
                    method: 'PUT',
                    url: url + '/selling_item_info/'+$scope.sellingItem.id,
                    dataType: "json",
                    data:$scope.sellingItem,
                    headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
                }).then(function onSuccess(response) {
                        var res = response.data;
                    if(res.status == "error"){
                        toastr["warning"](res.error);
                    }else{
                        toastr["success"]("แก้ไขข้อมูลเรียบร้อย");
                        initSellingItemSet();
                        initMaterialSelect('#select_product_selling');

                        $scope.funcGetSellingItemByID();
                        $scope.page_tab4='table';
                    }
                }, function onError(response) {
                    toastr["warning"]("system error");
                });
            }

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
            $scope.sellingItem = res.data[0];
            // $('#ProductDetailSell').modal('show');
            $scope.sellingItem.selling_end_date_time = $filter('limitTo')($scope.sellingItem.selling_end_date_time, 10, 0);
            $scope.sellingItem.selling_start_date_time = $filter('limitTo')($scope.sellingItem.selling_start_date_time, 10, 0);
            $scope.sellingItem.transport_duration_end_datetime = $filter('limitTo')($scope.sellingItem.transport_duration_end_datetime, 10, 0);
            $scope.sellingItem.transport_duration_start_datetime = $filter('limitTo')($scope.sellingItem.transport_duration_start_datetime, 10, 0);
            $scope.switchPage('form','tab4');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    };
    // -------------------------------------------
    // -----------delete alert------------------------
    $scope.getDelData = function (id, menu) {
        $scope.data_alert = {'id': id, 'menu': menu};
        $('#modalConfirmDelete').modal('show');
    }

    $scope.ConfirmDelete = function(id,data){
        $scope.del_id = id;
        $scope.del_data = data;
    }

    $scope.DeleteData = function(user_id){
        $http({
            method: 'DELETE',
            url: url + '/wholesaler_info/user_id/'+ user_id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var data = response.data;
            if(data.status == "error"){
                toastr["warning"](data.error);
            }else{
                $('#table_all_user_data_info_list').DataTable().ajax.reload();
            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.delData = function (obj) {

        $http({
            method: 'DELETE',
            url: url + '/' + obj.menu + '/' + obj.id,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {

                if (obj.menu == 'buying_item_info') {
                    $scope.funcGetBuyingItemByID();
                } else if (obj.menu == 'selling_item_info') {
                    $scope.funcGetSellingItemByID();
                }
                $('#modalConfirmDelete').modal('hide');

            }

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    // --------------------map-------------------------
    $scope.getCurrentlocation = function (event) {
        $scope.user_data.gps_lat = event.latLng.lat();
        $scope.user_data.gps_long = event.latLng.lng();
        reverseGeocode(event.latLng.lat(), event.latLng.lng());
    };
    function reverseGeocode(lat, lng) {
        var geocoder = new google.maps.Geocoder();
        var latlng = new google.maps.LatLng(lat, lng);

        geocoder.geocode({'latLng': latlng}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {

                    $scope.user_data.location_remark = results[1].formatted_address;

                } else {
                    toastr["warning"]('Location not found');
                }
            } else {
                toastr["warning"]('Geocoder failed due to: ' + status);
            }
        });
    };    
    // search unit
  $scope.findUnit = function(obj,id,type) {
      $scope.unit_product = null;
      if(type=='ผลผลิต'){

          angular.forEach(obj,function(item){

              if(item.id == id) {

                  $scope.unit_product = item.unit;
              }
          });

      }

  }
});
