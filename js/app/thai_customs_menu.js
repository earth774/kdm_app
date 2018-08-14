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
app.controller("ThaiCustomsCtrl", function ($scope, $http, $cookies, $compile, $filter, NgMap) {

    $scope.CheckCookies = function () {
        if ($cookies.get('api_token') == "" || $cookies.get('api_token') == null) {
            window.location.href = "index.html";
        }
    }
    // ==================init variable ==============
    var province_id;
    var district_id;
    var sub_district_id;
    var need_load_address_id = false;
    $scope.user_type_id = 10;
    $scope.activeTab = 'tab1';
    $scope.page_tab2 = 'table';
    $scope.page_tab3 = 'table';
    $scope.user_id = $cookies.get('user_id');


    // ================init function======================
    function initUserDataSet() {
        $scope.user_data = {
            'user_id': $scope.user_id,
            'customs_name': null,
            'customs_address': null,
            'province_id': null,
            'district_id': null,
            'sub_district_id': null,
            'contact_name': null,
            'contact_address': null,
            'contact_position': null,
            'contact_phone': null,
            'contact_email': null,
            "address": null,
            "gps_lat": null,
        };
        $scope.user_data.gps_lat = window.localStorage.getItem("gps_lat");
        $scope.user_data.gps_long = window.localStorage.getItem("gps_long");
        $scope.search_address = $scope.user_data.gps_lat + ',' + $scope.user_data.gps_long;
    }

    function initDataimport() {
        $scope.dataimport = {
            'product_info_id': null,
            "product_info_explanation": null,
            'user_id': $scope.user_id,
            'user_type_id': $scope.user_type_id,
            "is_product": '0',
            "manufacturer_product_info_id": 0,
            "manufacturer_product_info_explanation":null,
            'qty': null,
            'start_valid_datetime': null,
            'end_valid_datetime': null,
        };
    }

    function initDataexport() {
        $scope.dataexport = {
            'product_info_id': null,
            "product_info_explanation": null,
            'user_id': $scope.user_id,
            'user_type_id': $scope.user_type_id,
            "is_product": '0',
            "manufacturer_product_info_id": 0,
            "manufacturer_product_info_explanation":null,
            'qty': null,
            'start_valid_datetime': null,
            'end_valid_datetime': null,
        };

    }

    initUserDataSet();
    initDataimport();
    initDataexport();

    $scope.funcSwitchTab = function (tab) { /*change tab*/
        $scope.activeTab = tab;
    }

    $scope.switchPage = function (page, tab) { /*change form or table in tab*/
        $scope.hasSubmit = false;
        $scope.unit_product = null;

        if (tab == 'tab2') {
            $scope.page_tab2 = page;
            if ($scope.page_tab2 == 'table') {
                $scope.dataimport = {};
                $scope.clearData();
            }
        } else if (tab == 'tab3') {
            $scope.page_tab3 = page;
            if ($scope.page_tab3 == 'table') {
                $scope.dataexport = {};
            }
        }
    }
    $scope.clearData = function () {
        $scope.page_tab2 = 'table';
        $scope.page_tab3 = 'table';
        $scope.hasSubmit = false;
        $scope.unit_product = null;
        initDataimport();
        initDataexport();
        clearMaterialSelect('.mdb-select');
        $('#select_province').val("");
        $('#select_district').val("");
        $('#select_sub_district').val("");

        $('#select_product_buying').val("");
        $('#select_product_fac').val("");
    }
    // -------set initMaterialSelect-------------
    $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
        $('.datepicker').pickadate({
            format: 'yyyy-mm-dd',
            formatSubmit: 'yyyy-mm-dd',
            hiddenPrefix: 'prefix__',
            hiddenSuffix: '__suffix'
        });
        setTimeout(function () {
            initMaterialSelect('#select_product_buying');
            initMaterialSelect('#select_product_fac');

            checkselectoption();
        }, 500);
    });

    function checkselectoption() {
        // tab 2 form
        if ($scope.dataimport.product_info_id != null) {
            initMaterialSelect('#select_product_buying', $scope.dataimport.product_info_id);
        }

        if ($scope.dataimport.manufacturer_product_info_id != null) {
            initMaterialSelect('#select_product_fac', $scope.dataimport.manufacturer_product_info_id);
        }

        if ($scope.dataexport.product_info_id != null) {
            initMaterialSelect('#select_product_buying', $scope.dataexport.product_info_id);
        }

        if ($scope.dataexport.manufacturer_product_info_id != null) {
            initMaterialSelect('#select_product_fac', $scope.dataexport.manufacturer_product_info_id);
        }
    }

    // ------------------------------------------
    // Admin view control
    // ------------------------------------------
    $scope.check_admin = true; // เพิ่มเติม check_admin
    $scope.user_role_id = $cookies.get('user_role_id'); // เพิ่มเติม check_admin

    $scope.showAdmin = function () {
        $scope.check_admin = true;
    }

    $scope.funcCheckUserRole = function () {
        if (['1', '2', '3'].indexOf($scope.user_role_id) > -1) {
            $scope.ajaxAllUserDataInfoOptions = {
                "ajax": {
                    "url": url + '/thai_customs_info',
                    "beforeSend": function (request) {
                        request.setRequestHeader("Authorization", $cookies.get('api_token'));
                    }
                },
                "columns": [{
                        "data": "user_fullname"
                    },
                    {
                        "data": "username"
                    },
                    {
                        "data": "user_email"
                    },
                    {
                        "mRender": function () {
                            return "";
                        }
                    },
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    var first_row = $("td:first", nRow);
                    var html = '<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="funcSelUser(' + aData.user_id + ',' + '\'' + first_row.html() + '\');"><i class="fa fa-pencil"></i></a>' +
                        '<a class="btn-floating btn-sm red darken-3 waves-effect waves-light" data-toggle="modal" data-target="#ConfirmDel" ng-click="ConfirmDelete(' + aData.id + ',\'' + aData.customs_name + '\');"><i class="fa fa-trash"></i></a>';
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
        $scope.check_admin = false;
        initUserDataSet();
        initDataimport();
        initDataexport();
    }

    // -------------------------------------------
    // จังหวัด อำเภอ ตำบล
    // -------------------------------------------

    $scope.$on('ngRepeatFinishedProvince', function (ngRepeatFinishedEvent) {

        if (need_load_address_id) {
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
            initMaterialSelect('#select_district', district_id);
            $scope.getSubDistrict(district_id);
        } else {
            clearMaterialSelect('#select_district');
        }
    });

    $scope.$on('ngRepeatFinishedSub_district', function (ngRepeatFinishedEvent) {
        if (need_load_address_id) {
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
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
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
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
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
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
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

    // ---------------------------------------------------
    // set map center
    // ---------------------------------------------------
    $scope.resizeMap = function () {
        if ($scope.user_data.id) {
            setTimeout(function () {
                var center = new google.maps.LatLng($scope.user_data.gps_lat, $scope.user_data.gps_long);

                NgMap.getMap({
                    id: 'userMap'
                }).then(function (map) {
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
                NgMap.getMap({
                    id: 'userMap'
                }).then(function (map) {
                    google.maps.event.trigger(map, 'resize');
                    map.setCenter($scope.position);
                });
            }, 600);
        }
    }
    // ---------------------------------------------------
    // เรียกข้อมูลผลผลิต
    // ---------------------------------------------------
    $scope.funcGetProductInfo = function () {
        $http({
            method: 'GET',
            url: url + '/product_info',
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.product_info = res.data;
            if (res.data.length == 0) {
                setTimeout(function () {
                    initMaterialSelect('#select_product_buying');
                }, 500);
            }
            setTimeout(function () {
                if($scope.activeTab == 'tab2'){
                    if($scope.dataimport.product_info_id == "" && !$scope.dataimport.product_info_explanation){
                        $( "#select_product_buying_select2_show" ).val("").change();
                    }
                }else if($scope.activeTab == 'tab3'){ 
                    if($scope.dataexport.product_info_id == "" && !$scope.dataexport.product_info_explanation){
                        $( "#select_product_buying_select2_show" ).val("").change();
                    }
                }
             }, 100);

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    // ---------------------------------------------------
    // เรียกข้อมูลผลิตภัณฑ์
    // ---------------------------------------------------
    $scope.funcGetManufacProductInfo = function () {
        $http({
            method: 'GET',
            url: url + '/manufacturer_product_info',
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.manufac_product_info = res.data;
            if (res.data.length == 0) {
                setTimeout(function () {
                    initMaterialSelect('#select_product_fac');
                }, 500);
            }
            setTimeout(function () {

                if($scope.activeTab == 'tab2'){
                    if($scope.dataimport.manufacturer_product_info_id == "" && !$scope.dataimport.manufacturer_product_info_explanation){
                        $( "#select_product_fac_select2_show" ).val("").change();
                    }
                }else if($scope.activeTab == 'tab3'){
                    if($scope.dataexport.manufacturer_product_info_id == "" && !$scope.dataexport.manufacturer_product_info_explanation){
                        $( "#select_product_fac_select2_show" ).val("").change();
                    }
                }
             }, 100);
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    // =================function=======================
    // ข้อมูลศุลกากร
    $scope.funcGetThaiCustomsByID = function () { /*{{host}}\thai_customs_info\user_id\{user_id}*/
        $http({
            method: 'GET',
            url: url + '/thai_customs_info/user_id/' + $scope.user_id,
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;

            $scope.getProvince();

            if (res.data.length == 0) {
                need_load_address_id = false;
            } else {
                need_load_address_id = true;
                $scope.user_data = res.data[0];

                province_id = res.data[0].province_id;
                district_id = res.data[0].district_id;
                sub_district_id = res.data[0].sub_district_id;
                $scope.search_address = $scope.user_data.gps_lat + ',' + $scope.user_data.gps_long;
            }
            $scope.resizeMap();
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    $scope.funcInsertThaiCustoms = function (data, require) { /*insert thai_customs_info*/
        if (!require) {
            $http({
                method: 'POST',
                url: url + '/thai_customs_info',
                dataType: "json",
                data: data,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': $cookies.get('api_token')
                }
            }).then(function (res) {
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {
                    toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                    $scope.user_data = res.data.data;
                }
            }, function (err) {
                toastr["warning"]("system error" + " : กรุณาใส่ข้อมูลให้ครบ");
            });
        }

    }
    // อัพเดทข้อมูล
    $scope.funcUpdateThaiCustoms = function (data, require) {
        if (!require) {
            $http({
                method: 'PUT',
                url: url + '/thai_customs_info/' + data.user_id,
                dataType: "json",
                data: data,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': $cookies.get('api_token')
                }
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
    // =====================ข้อมูลผลผลิตนำเข้า==================
    $scope.funcGetThaiCustomsImportByID = function () {
        // Always reset value in form when show table
        $scope.buyingItem = {};

        // AJAX method for dataTables.
        $scope.ajaxThaiCustomsImportOptions = {
            "ajax": {
                "url": url + '/thai_customs_import_info/user_id/' + $scope.user_id + '?user_type_id=' + $scope.user_type_id,
                "beforeSend": function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [{
                    "data": "product_name"
                },
                {
                    "data": "qty"
                },
                {
                    "data": "start_valid_datetime"
                },
                {
                    "data": "end_valid_datetime"
                }, /*$filter('limitTo')(end_valid_datetime,10,0)*/
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                let menu = 'thai_customs_import_info';
                var html = '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="detailImportItem(' + aData.id + ');"><i class="fa fa-pencil"></i></a>' +
                    '<a class="btn-floating btn-sm red darken-3 waves-effect waves-light" ng-click="getDelData(' + aData.id + ',' + '\'' + menu + '\');"><i class="fa fa-trash"></i></a>';
                var last_row = $("td:last", nRow);

                if (!last_row.html()) {
                    angular.element(last_row).append($compile(html)($scope))
                }

                var oSettings = $('#table_thaicustoms_import').dataTable().fnSettings();

                $('td', nRow).eq('2').html($filter('limitTo')(aData.start_valid_datetime, 10, 0));
                $('td', nRow).eq('3').html($filter('limitTo')(aData.end_valid_datetime, 10, 0));

                $(nRow).attr("id", 'row_' + aData.id);

                return nRow;
            },
            "fnDrawCallback": function (oSettings, json) {
                initMaterialSelectDataTable();
            },
        };

        setTimeout(function () {
            $('#table_thaicustoms_import').DataTable().ajax.reload();
        }, 300);
    }
    $scope.funcInsertThaiCustomsImportItem = function (require) { /*เพิ่มข้อมูลผลผลิตนำเข้า*/
            if (!require) {
                $http({
                    method: 'POST',
                    url: url + '/thai_customs_import_info',
                    dataType: "json",
                    data: $scope.dataimport,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': $cookies.get('api_token')
                    }
                }).then(function (res) {
                    if (res.status == "error") {
                        toastr["warning"](res.error);
                    } else {
                        toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                        initDataimport();
                        $scope.switchPage('table', 'tab2');
                    }
                }, function (err) {
                    toastr["warning"]("system error");
                });
            }
    }
    $scope.funcUpdateThaiCustomsImportItem = function (require) { /*แก้ไขข้อมูลผลผลิตนำเข้า*/
            if (!require) {
                $http({
                    method: 'PUT',
                    url: url + '/thai_customs_import_info/' + $scope.dataimport.id,
                    dataType: "json",
                    data: $scope.dataimport,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': $cookies.get('api_token')
                    }
                }).then(function (res) {
                    if (res.status == "error") {
                        toastr["warning"](res.error);
                    } else {
                        toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                        initDataimport();
                        $scope.switchPage('table', 'tab2');
                    }
                }, function (err) {
                    toastr["warning"]("system error");
                });
            }
    }
    $scope.detailImportItem = function (import_item_id) {
        $http({
            method: 'GET',
            url: url + '/thai_customs_import_info/' + import_item_id,
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.dataimport = res.data[0];
            $scope.dataimport.start_valid_datetime = $filter('limitTo')($scope.dataimport.start_valid_datetime, 10, 0);
            $scope.dataimport.end_valid_datetime = $filter('limitTo')($scope.dataimport.end_valid_datetime, 10, 0);
            $scope.dataimport.is_product = res.data[0].is_product.toString();
            $scope.switchPage('form', 'tab2');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    };
    // =====================ข้อมูลผลผลิตส่งออก==================
    $scope.funcGetThaiCustomsExportByID = function () {
        // Always reset value in form when show table
        initDataexport();

        // AJAX method for dataTables.
        $scope.ajaxThaiCustomsExportOptions = {
            "ajax": {
                "url": url + '/thai_customs_export_info/user_id/' + $scope.user_id + '?user_type_id=' + $scope.user_type_id,
                "beforeSend": function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [{
                    "data": "product_name"
                },
                {
                    "data": "qty"
                },
                {
                    "data": "start_valid_datetime"
                },
                {
                    "data": "end_valid_datetime"
                },
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                let menu = 'thai_customs_export_info';
                var html = '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="detailExportItem(' + aData.id + ');"><i class="fa fa-pencil"></i></a>' +
                    '<a class="btn-floating btn-sm red darken-3 waves-effect waves-light" ng-click="getDelData(' + aData.id + ',' + '\'' + menu + '\');"><i class="fa fa-trash"></i></a>';
                var last_row = $("td:last", nRow);
                if (!last_row.html()) {
                    angular.element(last_row).append($compile(html)($scope))
                }
                $('td', nRow).eq('2').html($filter('limitTo')(aData.start_valid_datetime, 10, 0));
                $('td', nRow).eq('3').html($filter('limitTo')(aData.end_valid_datetime, 10, 0));
                $(nRow).attr("id", 'row_' + aData.id);
                return nRow;
            },
            "fnDrawCallback": function (oSettings, json) {
                initMaterialSelectDataTable();
            },
        };

        setTimeout(function () {
            $('#table_thaicustoms_export').DataTable().ajax.reload();
        }, 500);
    }
    $scope.funcInsertThaiCustomsExportItem = function (require) { /*เพิ่มข้อมูลผลผลิตส่งออก*/
            if (!require) {
                $http({
                    method: 'POST',
                    url: url + '/thai_customs_export_info',
                    dataType: "json",
                    data: $scope.dataexport,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': $cookies.get('api_token')
                    }
                }).then(function (res) {
                    if (res.status == "error") {
                        toastr["warning"](res.error);
                    } else {
                        toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                        initDataexport();
                        $scope.switchPage('table', 'tab3');
                    }
                }, function (err) {
                    toastr["warning"]("system error");
                });
            }
    }

    $scope.funcUpdateThaiCustomsExportItem = function (require) { /*แก้ไขข้อมูลผลผลิตส่งออก*/
            if (!require) {
                $http({
                    method: 'PUT',
                    url: url + '/thai_customs_export_info/' + $scope.dataexport.id,
                    dataType: "json",
                    data: $scope.dataexport,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': $cookies.get('api_token')
                    }
                }).then(function (res) {
                    if (res.status == "error") {
                        toastr["warning"](res.error);
                    } else {
                        toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                        initDataexport();
                        $scope.switchPage('table', 'tab3');
                    }
                }, function (err) {
                    toastr["warning"]("system error");
                });
            }
    }
    $scope.detailExportItem = function (export_item_id) {
        $http({
            method: 'GET',
            url: url + '/thai_customs_export_info/' + export_item_id,
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.dataexport = res.data[0];
            $scope.dataexport.start_valid_datetime = $filter('limitTo')($scope.dataexport.start_valid_datetime, 10, 0);
            $scope.dataexport.end_valid_datetime = $filter('limitTo')($scope.dataexport.end_valid_datetime, 10, 0);
            $scope.dataexport.is_product = res.data[0].is_product.toString();
            $scope.switchPage('form', 'tab3');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    };

    // -----------delete alert------------------------
    $scope.getDelData = function (id, menu) {
        $scope.data_alert = {
            'id': id,
            'menu': menu
        };
        $('#modalConfirmDelete').modal('show');
    }

    $scope.ConfirmDelete = function (id, data) {
        $scope.del_id = id;
        $scope.del_data = data;
    }

    $scope.DeleteData = function (user_id) {
        $http({
            method: 'DELETE',
            url: url + '/thai_customs_info/user_id/' + user_id,
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var data = response.data;
            if (data.status == "error") {
                toastr["warning"](data.error);
            } else {
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
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {
                if (obj.menu == "thai_customs_export_info") {
                    $scope.funcGetThaiCustomsExportByID();
                } else if (obj.menu == "thai_customs_import_info") {
                    $scope.funcGetThaiCustomsImportByID();
                }
            }
            $('#modalConfirmDelete').modal('hide');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    // -------------------------------------------
    // --------------------map--------------------
    // -------------------------------------------
    $scope.getCurrentlocation = function (event) {
        $scope.user_data.gps_lat = event.latLng.lat();
        $scope.user_data.gps_long = event.latLng.lng();
        reverseGeocode(event.latLng.lat(), event.latLng.lng());
    };

    function reverseGeocode(lat, lng) {
        var geocoder = new google.maps.Geocoder();
        var latlng = new google.maps.LatLng(lat, lng);

        geocoder.geocode({
            'latLng': latlng
        }, function (results, status) {
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
    $scope.findUnit = function (obj, id, type) {
        $scope.unit_product = null;

        if (type == 'ผลผลิต') {

            angular.forEach(obj, function (item) {

                if (item.id == id) {

                    $scope.unit_product = item.unit;
                }
            });

        } else {
            angular.forEach(obj, function (item) {

                if (item.id == id) {

                    $scope.unit_product = item.product_unit;

                }
            });

        }


    }

    $scope.initSelect2 = function(){
        $('.mdb-select-2').select2();
        $(".select2").css("width","100%");
        $(".select2-selection__rendered").css("color","#757575");
        $(".select2-selection__rendered").css("color","#757575");
        
        $( "#select_product_buying_select2_show" ).change(function() {
            var product_id = $(this).val().toString()
            $("#select_product_buying").val(product_id).change();

            $("#product_info_explanation").val("").change();
        });

        $( "#select_product_fac_select2_show" ).change(function() {
            var product_id = $(this).val().toString()
            $("#select_product_fac").val(product_id).change();

            $("#manufacturer_product_info_explanation").val("").change();
        });
    }

});
