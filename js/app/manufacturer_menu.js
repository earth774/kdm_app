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
            ctrl.$parsers.push(function (viewValue) {
                if (viewValue === "") {
                    return null;
                }
                return viewValue;
            });
        }
    };
});

app.controller("LenderCtrl", function ($scope, $http, $cookies, $compile, NgMap, $filter) {

    $scope.$watch('user_data.age', function (newValue, oldValue) {
        if (newValue === "")
            $scope.test.value = null;
    });

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
    $scope.user_id = $cookies.get('user_id');
    $scope.user_type_id = 6;
    $scope.activeTab = 'tab1';
    $scope.page_tab3 = 'table';
    $scope.page_tab4 = 'table';
    $scope.type_modal = null;

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
            "age": null,
            "house_number": null,
            "village": null,
            "village_number": null,
            "alley": null,
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
            "corporate_type_id": '1'
        };
    }

    function initDataProducts() {
        $scope.dataproducts = {
            "user_id": $scope.user_id,
            "user_type_id": $scope.user_type_id,
            "bestbefore_date_time": null,
            'product_name': null,
            'product_unit': null,
            'price': null,
            'cost': null,
            'qty': null,
            'cpacity': null,
            'manufacturer_factory_info_id': null,

            'standard_name': null,
            'cerificate_name': null,
            'cefrificate_number': null,

        };
    }

    function initDataMaterial() {
        $scope.datamaterial = {
            "user_id": $scope.user_id,
            "user_type_id": $scope.user_type_id,
            "manufacturer_product_info_id": null,
            "is_product": "0",
            "product_info_id": null,
            "select_manufacturer_product_info_id": 0,
            "qty": null,
            "price": null
        };
    }
    initUserDataSet();
    initDataProducts();
    initDataMaterial();
    // ================init function======================
    $scope.funcSwitchTab = function (tab) { /*change tab*/
        $scope.activeTab = tab;
    }

    $scope.switchPage = function (page, tab) { /*change form or table in tab*/
        $scope.hasSubmit = false;
        if (tab == 'tab3') {
            $scope.page_tab3 = page;
            if ($scope.page_tab3 == 'table') {
                initDataProducts();
            }
        } else if (tab == 'tab4') {
            $scope.page_tab4 = page;
            if ($scope.page_tab4 == 'table') {
                initDataMaterial();
            }
        }
    }
    $scope.clearData = function () {
        $scope.hasSubmit = false;
        $scope.page_tab3 = 'table';
        $scope.page_tab4 = 'table';
        $scope.type_modal = null;
        initDataProducts();
        initDataMaterial();
        clearMaterialSelect('.mdb-select');
        $('#select_province').val("");
        $('#select_district').val("");
        $('#select_sub_district').val("");

        $('#select_product_buying').val("");
        $('#select_product_fac').val("");
        $('#select_product').val("");
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
            initMaterialSelect('#select_product');
            initMaterialSelect('#select_product_buying');
            initMaterialSelect('#select_product_fac');
            checkselectoption();
        }, 500);

    });

    function checkselectoption() {
        // tab 4 form
        if ($scope.datamaterial.manufacturer_product_info_id != null) {
            initMaterialSelect('#select_product', $scope.datamaterial.manufacturer_product_info_id);
        }
        if ($scope.datamaterial.product_info_id != null) {
            initMaterialSelect('#select_product_buying', $scope.datamaterial.product_info_id);
        }

        if ($scope.datamaterial.select_manufacturer_product_info_id != null) {
            initMaterialSelect('#select_product_fac', $scope.datamaterial.select_manufacturer_product_info_id);
        }
    }

    $scope.callDatepicker = function () {
        $('.datepicker').pickadate({
            format: 'yyyy-mm-dd',
            formatSubmit: 'yyyy-mm-dd',
            hiddenPrefix: 'prefix__',
            hiddenSuffix: '__suffix'
        });
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
                    "url": url + '/manufacturer_info',
                    "beforeSend": function (request) {
                        request.setRequestHeader("Authorization", $cookies.get('api_token'));
                    }
                },
                "columns": [{
                        "data": "user_fullname"
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
                        '<a class="btn-floating btn-sm red darken-3 waves-effect waves-light" data-toggle="modal" data-target="#ConfirmDel" ng-click="ConfirmDelete(' + aData.id + ',\'' + aData.name + '\');"><i class="fa fa-trash"></i></a>';
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
    }
    // set map center
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
    };
    // ------------------------------------------

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
    // เรียกข้อมูลผลผลิต
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
                if($scope.datamaterial.product_info_id == "" && !$scope.datamaterial.product_info_explanation){
                    $( "#select_product_buying_select2_show" ).val("").change();
                }
             }, 100);

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    // เรียกข้อมูลผลิตภัณฑ์
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
                    initMaterialSelect('#select_product_fac_products');
                }, 500);
            }
            setTimeout(function () {
                if($scope.datamaterial.select_manufacturer_product_info_id == "" && !$scope.datamaterial.select_manufacturer_product_info_explanation){
                    $( "#select_product_fac_select2_show" ).val("").change();
                }
             }, 100);
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    // =================function=======================
    // --------------tab1 ข้อมูลผู้ผลิต--------
    $scope.funcGetManufacturerByID = function () {
        $http({
            method: 'GET',
            url: url + '/manufacturer_info/user_id/' + $scope.user_id,
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
                $scope.user_data.gender_id = res.data[0].gender_id.toString();
                $scope.user_data.corporate_type_id = res.data[0].corporate_type_id.toString();
                $scope.user_data.is_corporate = res.data[0].is_corporate.toString();

                province_id = res.data[0].province_id;
                district_id = res.data[0].district_id;
                sub_district_id = res.data[0].sub_district_id;
            }

            $scope.resizeMap();
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    // เพิ่มข้อมูลผู้ผลิต
    $scope.funcInsertManufacturer = function (require) {
        if (!require) {
            $http({
                method: 'POST',
                url: url + '/manufacturer_info',
                dataType: "json",
                data: $scope.user_data,
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
    $scope.funcUpdateManufacturer = function (require) {

        if (!require) {
            $http({
                method: 'PUT',
                url: url + '/manufacturer_info/' + $scope.user_id,
                dataType: "json",
                data: $scope.user_data,
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

    // =====================ข้อมูลผลิตภัณฑ์==================
    $scope.funcGetProductsByID = function () {
        // Always reset value in form when show table
        initDataProducts();

        // AJAX method for dataTables.
        $scope.ajaxProductsOptions = {
            "ajax": {
                "url": url + '/manufacturer_product_info/user_id/' + $scope.user_id + '?user_type_id=' + $scope.user_type_id,
                "beforeSend": function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [{
                    "data": "product_name"
                },
                {
                    "data": "price"
                },
                {
                    "data": "cost"
                },
                {
                    "data": "qty"
                },
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {

                $scope.type_modal = 'product';
                let menu = 'manufacturer_product_info';
                var html = '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="detailModal(' + aData.id + ');"><i class="fa fa-pencil"></i></a>' +
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
            $('#table_data_products').DataTable().ajax.reload();
        }, 1500);
    }
    $scope.funcSelectProductsByID = function () { //สำหรับเลือกในฟอร์มของ tab4
        $http({
            method: 'GET',
            url: url + '/manufacturer_product_info/user_id/' + $scope.user_id + '?user_type_id=' + $scope.user_type_id,
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function (res) {
            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {
                $scope.products = res.data.data;

            }
        }, function (err) {
            toastr["warning"]("system error");
        });
    }
    /*เพิ่มข้อมูลผลิตภัณฑ์*/
    $scope.funcInsertProductsData = function (require) {
        $scope.hasSubmit = true;
        if (!require) {
            $http({
                method: 'POST',
                url: url + '/manufacturer_product_info',
                dataType: "json",
                data: $scope.dataproducts,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': $cookies.get('api_token')
                }
            }).then(function (res) {
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {
                    toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                    $scope.switchPage('table', 'tab3');
                }
            }, function (err) {
                toastr["warning"]("system error");
            });
        }



    }
    /*เพิ่มข้อมูลผลิตภัณฑ์*/
    $scope.funcUpdateProductsData = function (require) {
        $scope.hasSubmit = true;
        if (!require) {
            $http({
                method: 'PUT',
                url: url + '/manufacturer_product_info/' + $scope.dataproducts.id,
                dataType: "json",
                data: $scope.dataproducts,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': $cookies.get('api_token')
                }
            }).then(function (res) {
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {
                    toastr["success"]("แก้ไขข้อมูลเรียบร้อย");
                    $scope.switchPage('table', 'tab3');
                }
            }, function (err) {
                toastr["warning"]("system error");
            });
        }


    }
    // =====================ข้อมูลวัดถุดิบ==================
    $scope.funcGetMaterialByID = function () {
        // Always reset value in form when show table
        initDataMaterial();

        // AJAX method for dataTables.
        $scope.ajaxMaterialOptions = {
            "ajax": {
                "url": url + '/manufacturer_material_info/user_id/' + $scope.user_id + '?user_type_id=' + $scope.user_type_id,
                "beforeSend": function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [{
                    "data": "manufacturer_product_info_name"
                },
                {
                    "data": "product_info_name"
                },
                {
                    "data": "select_manufacturer_product_info_name"
                },
                //  { "data": "qty" },
                //  { "data": "price" },
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {

                $scope.type_modal = 'material';
                let menu = 'manufacturer_material_info';
                var html = '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="detailModal(' + aData.id + ');"><i class="fa fa-pencil"></i></a>' +
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
            $('#table_data_material').DataTable().ajax.reload();
        }, 1500);
    }
    /*เพิ่มข้อมูลผลิตภัณฑ์*/
    $scope.funcInsertMaterialData = function (require) {
        $scope.hasSubmit = true;
            if (!require) {
                $http({
                    method: 'POST',
                    url: url + '/manufacturer_material_info',
                    dataType: "json",
                    data: $scope.datamaterial,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': $cookies.get('api_token')
                    }
                }).then(function (res) {
                    if (res.status == "error") {
                        toastr["warning"](res.error);
                    } else {
                        toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                        $scope.switchPage('table', 'tab4');
                    }
                }, function (err) {
                    toastr["warning"]("system error");
                });
            }
    }
    /*แก้ไขข้อมูลผลิตภัณฑ์*/
    $scope.funcUpdateMaterialData = function (require) {
        $scope.hasSubmit = true;
            if (!require) {
                $http({
                    method: 'PUT',
                    url: url + '/manufacturer_material_info/' + $scope.datamaterial.id,
                    dataType: "json",
                    data: $scope.datamaterial,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': $cookies.get('api_token')
                    }
                }).then(function (res) {
                    if (res.status == "error") {
                        toastr["warning"](res.error);
                    } else {
                        toastr["success"]("แก้ไขข้อมูลเรียบร้อย");
                        $scope.switchPage('table', 'tab4');
                    }
                }, function (err) {
                    toastr["warning"]("system error");
                });
            }
    }
    // ---------------modal
    $scope.detailModal = function (id) {
        let url_api = null;

        if ($scope.type_modal === 'product') {
            $http({
                method: 'GET',
                url: url + '/manufacturer_product_info/' + id,
                dataType: "json",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': $cookies.get('api_token')
                }
            }).then(function onSuccess(response) {
                var res = response.data;
                $scope.dataproducts = res.data[0];
                $scope.dataproducts.bestbefore_date_time = $filter('limitTo')($scope.dataproducts.bestbefore_date_time, 10, 0);

                $scope.switchPage('form', 'tab3');

            }, function onError(response) {
                toastr["warning"]("system error");
            });
        } else if ($scope.type_modal === 'material') {
            $http({
                method: 'GET',
                url: url + '/manufacturer_material_info/' + id,
                dataType: "json",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': $cookies.get('api_token')
                }
            }).then(function onSuccess(response) {
                var res = response.data;
                $scope.datamaterial = res.data[0];
                $scope.datamaterial.is_product = res.data[0].is_product.toString();
                $scope.switchPage('form', 'tab4');
            }, function onError(response) {
                toastr["warning"]("system error");
            });
        }

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
            url: url + '/manufacturer_info/user_id/' + user_id,
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
                if (obj.menu == 'manufacturer_product_info') {
                    $scope.funcGetProductsByID();
                }
                if (obj.menu == 'manufacturer_material_info') {
                    $scope.funcGetMaterialByID();
                }

                $('#modalConfirmDelete').modal('hide');

            }

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
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

        $( "#select_product_select2_show" ).change(function() {
            var product_id = $(this).val().toString()
            $("#select_product").val(product_id).change();
        });
        
        $( "#select_product_buying_select2_show" ).change(function() {
            var product_id = $(this).val().toString()
            $("#select_product_buying").val(product_id).change();

            $("#product_info_explanation").val("").change();
        });

        $( "#select_product_fac_select2_show" ).change(function() {
            var product_id = $(this).val().toString()
            $("#select_product_fac").val(product_id).change();

            $("#select_manufacturer_product_info_explanation").val("").change();
        });
    }




});