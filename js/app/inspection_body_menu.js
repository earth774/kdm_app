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

app.controller("InspectionBodyCtrl", function ($scope, $http, $cookies, $compile, $filter, NgMap) {

    $scope.$watch('user_data.age', function (newValue, oldValue) {
        if(newValue === "")
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
    $scope.user_type_id = 11;
    $scope.activeTab = 'tab1';
    $scope.page_tab2 = 'table';
    $scope.page_tab3 = 'table';
    $scope.user_id = $cookies.get('user_id');
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
            "age" : null,
            "house_number" : null,
            "village" : null,
            "village_number" : null,
            "alley" : null,
            "phone": null,
            "email": null,
            "zipcode": null,
            'position': null,
            'company': null,
            'operation_areas': null,
        };
        $scope.user_data.gps_lat  = window.localStorage.getItem("gps_lat");
        $scope.user_data.gps_long = window.localStorage.getItem("gps_long"); 
        $scope.search_address = $scope.user_data.gps_lat +','+ $scope.user_data.gps_long;        
    }
    function initDataStandard() {
        $scope.dataStandard = {
            "user_id": $scope.user_id,
            "user_type_id": $scope.user_type_id,
            "standard_name": null,
            "cerificate_name": null,
            "cerificate_number": null,
            "inspection_number": null,
            "inspection_price": null
        };
    }
    function initDataCultivated() {
        $scope.dataCultivated = {
            "user_id": $scope.user_id,
            "user_type_id": $scope.user_type_id,
            "farmer_user_crop_id": null,
            "record_datetime": null,
            "inspection_result": null,
            "inspection_standard_info_id": null
        }
    }
    initUserDataSet();
    initDataStandard();
    initDataCultivated();
    // ================init function======================
    $scope.funcSwitchTab = function (tab) { /*change tab*/
        $scope.activeTab = tab;
    }

    $scope.switchPage = function (page, tab) { /*change form or table in tab*/
        if (tab == 'tab2') {
            $scope.page_tab2 = page;
            if ($scope.page_tab2 == 'table') {
                initDataStandard();
            }
        } else if (tab == 'tab3') {
            $scope.page_tab3 = page;
            if ($scope.page_tab3 == 'table') {
                initDataCultivated();
            }
        }

    }
    $scope.clearData = function () {
        $scope.page_tab2 = 'table';
        $scope.page_tab3 = 'table';

        $scope.type_modal = null;
        initDataStandard();
        initDataCultivated();
        clearMaterialSelect('.mdb-select');
        $('#select_province').val("");
        $('#select_district').val("");
        $('#select_sub_district').val("");
        $('#select_inspection_standard_info').val("");
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
            initMaterialSelect('#select_cultivated_area_info');
            initMaterialSelect('#select_inspection_standard_info');
            checkselectoption();
        }, 500);

    });
    function checkselectoption() {

        // tab 3 form
        if ($scope.dataCultivated.farmer_user_crop_id != null) {
            initMaterialSelect('#select_cultivated_area_info', $scope.dataCultivated.farmer_user_crop_id);
        }

        if ($scope.dataCultivated.inspection_standard_info_id != null) {
            initMaterialSelect('#select_inspection_standard_info', $scope.dataCultivated.inspection_standard_info_id);
        }
    }
    // -----------------------------
    // set map center
    // -----------------------------
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
                    "url": url + '/inspection_body_info',
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
        $scope.check_admin = false;
        initUserDataSet();
        initDataStandard();
        initDataCultivated();
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

    // =================function=======================
    // --------------tab1 ข้อมูลผู้ตรวจสอบ--------
    $scope.funcGetInspectionByID = function () {
        $http({
            method: 'GET',
            url: url + '/inspection_body_info/user_id/' + $scope.user_id,
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

                province_id = res.data[0].province_id;
                district_id = res.data[0].district_id;
                sub_district_id = res.data[0].sub_district_id;
                $scope.user_data.gender_id = res.data[0].gender_id.toString();
                $scope.search_address = $scope.user_data.gps_lat +','+ $scope.user_data.gps_long;
            }
            $scope.resizeMap();
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    // เพิ่มข้อมูลผู้ตรวจสอบ
    $scope.funcInsertInspection = function (require) {
        if(!require){
            $http({
                method: 'POST',
                url: url + '/inspection_body_info',
                dataType: "json",
                data: $scope.user_data,
                headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
            }).then(function (res) {
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {
                    toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                    $scope.user_data = res.data.data;
                }
            }, function (err) {
                toastr["warning"]("system error"  + " : กรุณาใส่ข้อมูลให้ครบ");
            });
        }

    }
    // อัพเดทข้อมูล
    $scope.funcUpdateInspection = function (data, require) {
        if(!require){
        $http({
            method: 'PUT',
            url: url + '/inspection_body_info/' + data.user_id,
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
    // --------------tab2 มาตรฐานการตรวจสอบ--------
    $scope.funcGetStandardByID = function () {
        // Always reset value in form when show table
        initDataStandard();

        // AJAX method for dataTables.
        $scope.ajaxStandardOptions = {
            "ajax": {
                "url": url + '/inspection_standard_info/user_id/' + $scope.user_id + '?user_type_id=' + $scope.user_type_id,
                "beforeSend": function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                {"data": "standard_name"},
                {"data": "cerificate_number"},
                {"data": "inspection_price"},
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {

                $scope.type_modal = 'standard';
                let menu = "inspection_standard_info";
                var html = //'<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="detailModal(' + aData.id + ');"><i class="fa fa-eye"></i></a>'
                        '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="detailStandard(' + aData.id + ');"><i class="fa fa-pencil"></i></a>' +
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
            $('#table_data_standard').DataTable().ajax.reload();
        }, 300);
    }

    /*บันทึกมาตรฐานการตรวจสอบ*/
    $scope.funcInsertStandardData = function (require) {
        if(!require){
            $http({
                method: 'POST',
                url: url + '/inspection_standard_info',
                dataType: "json",
                data: $scope.dataStandard,
                headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
            }).then(function (res) {
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {
                    toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                    initDataStandard();
                    $scope.switchPage('table', 'tab2');
                }
            }, function (err) {
                toastr["warning"]("system error");
            });
        }

    }

    $scope.funcUpdateStandardData = function (require) {
        if(!require){
        $http({
            method: 'PUT',
            url: url + '/inspection_standard_info/' + $scope.dataStandard.id,
            dataType: "json",
            data: $scope.dataStandard,
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function (res) {
            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {
                toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                initDataStandard();
                $scope.switchPage('table', 'tab2');
            }
        }, function (err) {
            toastr["warning"]("system error");
        });
    }
    }
    // ดูข้อมูลมาตรฐานการตรวจสอบ
    $scope.detailStandard = function (id) {
        $http({
            method: 'GET',
            url: url + '/inspection_standard_info/' + id,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.dataStandard = res.data[0];
            $scope.switchPage('form', 'tab2');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    };
    // =====================บันทึกการตรวจ==================
    $scope.funcGetCultivatedByID = function () {
        // Always reset value in form when show table
        initDataCultivated();

        // AJAX method for dataTables.
        $scope.ajaxCultivatedOptions = {
            "ajax": {
                "url": url + '/inspection_crop_info/user_id/' + $scope.user_id + '?user_type_id=' + $scope.user_type_id,
                "beforeSend": function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                {"data": "farmer_user_crop_id"}, //รอบแปลงเพาะปลูก
                {"data": "record_datetime"},
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {

                $scope.type_modal = 'cultivated';
                let menu ='inspection_crop_info';
                var html = '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="detailCultivatedData(' + aData.id + ');"><i class="fa fa-pencil"></i></a>'+
                        '<a class="btn-floating btn-sm red darken-3 waves-effect waves-light" ng-click="getDelData(' + aData.id + ',' + '\'' + menu + '\');"><i class="fa fa-trash"></i></a>';
                var last_row = $("td:last", nRow);

                if (!last_row.html()) {
                    angular.element(last_row).append($compile(html)($scope))
                }
                $('td', nRow).eq('1').html($filter('limitTo')(aData.record_datetime, 10, 0));
                $(nRow).attr("id", 'row_' + aData.id);

                return nRow;
            },
            "fnDrawCallback": function (oSettings, json) {


                initMaterialSelectDataTable();
            },
        };

        setTimeout(function () {
            $('#table_data_cultivated').DataTable().ajax.reload();
        }, 1500);
    }
    $scope.funcSelectCultivatedArea = function () { //สำหรับเลือกในฟอร์มของ tab3
        $http({
            method: 'GET',
            url: url + '/farmer_user_crop',
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function (res) {
            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {
                if (res.data.data.length != 0) {
                    $scope.cultivated_area_info = res.data.data;
                } else {
                    $scope.cultivated_area_info = [{'user_id': null, 'deed_no': 'ไม่พบข้อมูล'}];
                }



            }
        }, function (err) {
            toastr["warning"]("system error");
        });
    }
    // select by user_id มาตรฐานการตรวจสอบ
    $scope.funcSelectInspectionStandard = function () { //สำหรับเลือกในฟอร์มของ tab3
        $http({
            method: 'GET',
            url: url + '/inspection_standard_info/user_id/'+$scope.user_id+'?user_type_id='+$scope.user_type_id,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function (res) {
            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {
                if (res.data.data.length != 0) {
                    $scope.inspection_standard_info_id = res.data.data;
                } else {
                    $scope.inspection_standard_info_id = [{'user_id': null, 'deed_no': 'ไม่พบข้อมูล'}];
                }



            }
        }, function (err) {
            toastr["warning"]("system error");
        });
    }
    /*เพิ่มข้อมูลผลิตภัณฑ์*/
    $scope.funcInsertCultivatedData = function (required) {
        if(!required){
            $http({
                method: 'POST',
                url: url + '/inspection_crop_info',
                dataType: "json",
                data: $scope.dataCultivated,
                headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
            }).then(function (res) {
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {
                    toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                    initDataCultivated();
                    $scope.switchPage('table', 'tab3');
                }
            }, function (err) {
                toastr["warning"]("system error");
            });
        }


    }
    /*แก้ไขข้อมูลผลิตภัณฑ์*/
    $scope.funcUpdateCultivatedData = function (required) {
        if(!required){
        $http({
            method: 'PUT',
            url: url + '/inspection_crop_info/'+$scope.dataCultivated.id,
            dataType: "json",
            data: $scope.dataCultivated,
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
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
    // รายละเอียดบันทึกการตรวจ
    $scope.detailCultivatedData = function (id) {

        $http({
            method: 'GET',
            url: url + '/inspection_crop_info/' + id,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;

            $scope.dataCultivated = res.data[0];
            $scope.dataCultivated.record_datetime = $filter('limitTo')($scope.dataCultivated.record_datetime, 10, 0);

            $scope.switchPage('form', 'tab3');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    };
    // ---------------modal
    $scope.detailModal = function (id) {
        let url_api = null;

        if ($scope.type_modal === 'standard') {
            url_api = url + '/inspection_standard_info/' + id;
        } else if ($scope.type_modal === 'cultivated') {
            url_api = url + '/inspection_cultivated_info/' + id;
        }
        $scope.objItem = {};
        $http({
            method: 'GET',
            url: url_api,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.objItem = res.data[0];
            $('#detailModal').modal('show');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    };

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
            url: url + '/inspection_body_info/user_id/'+ user_id,
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
        })
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

                if (obj.menu == 'inspection_crop_info') {
                    $scope.funcGetCultivatedByID();
                } else if (obj.menu == 'inspection_standard_info') {
                    $scope.funcGetStandardByID();
                }
                $('#modalConfirmDelete').modal('hide');

            }

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
});
