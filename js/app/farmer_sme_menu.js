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

app.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                }
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}]);

app.controller("FarmerSMECtrl", function ($scope, $http, $cookies, $compile, NgMap, $filter, Upload) {
    var user_type_id = 1;

    $scope.$watch('user_data.age', function (newValue, oldValue) {
        if (newValue === "")
            $scope.test.value = null;
    });


    $scope.CheckCookies = function () {
        if ($cookies.get('api_token') == "" || $cookies.get('api_token') == null) {
            window.location.href = "../index.html";
        }
    }
    $scope.base_url = base_url + "/public/";

    $.fn.dataTable.ext.errMode = 'throw';

    //set default variable initial
    $scope.user_id = $cookies.get('user_id');
    $scope.user_role_id = $cookies.get('user_role_id');
    $scope.activeTab = 'tab1';
    $scope.page_tab1 = 'table';
    $scope.CommitteeItem = {};
    // $scope.CultivatedAreaItem = {};
    $scope.AgricultureItem = {};
    $scope.FarmerProductionItem = {};
    $scope.GapItem = {};
    $scope.IfoamItem = {};
    $scope.InternationalStandardItem = {};
    $scope.InspectionItem = {};
    $scope.FarmerExtraItem = {};

    function initUserDataSet() {
        $scope.user_data = {
            "user_id": $scope.user_id,
            "gender_id": '1',
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

        $scope.user_data.gps_lat = window.localStorage.getItem("gps_lat");
        $scope.user_data.gps_long = window.localStorage.getItem("gps_long");
        $scope.search_address = $scope.user_data.gps_lat + ',' + $scope.user_data.gps_long;
    }

    function initCooperategetSet() {
        $scope.cooperate_data = {
            "user_id": $scope.user_id,
            "user_type_id": user_type_id,
            "president_name": null,
            "manager_name": null,
            "start_date_time": null,
            "end_date_time": null
        };
    }

    function initCultivatedAreaSet() {
        $scope.CultivatedAreaItem = {
            "user_id": $scope.user_id,
            "user_type_id": user_type_id,
            "name": null,
            "deed_no": null,
            "gps_lat": null,
            "gps_long": null,
            "area": null,
            "irrigation_info_id": null,
            "file": []
        };
    }

    function initAgricultureItemSet() {
        $scope.AgricultureItem = {
            "user_id": $scope.user_id,
            "user_type_id": user_type_id,
            "farmer_user_cultivated_area_info_id": null,
            "remark": null,
            "farmer_invest_type_id": null,
            "resource_info_id": null,
            "name": null,
            "deed_no": null,
            "gps_lat": null,
            "gps_long": null,
            "start_datetime": null,
            "end_datetime": null,
            "area": null,
            "irrigation_info_id": null,
            "breed_info_id": null,
            "breed_info_explanation": null,
            "resource_info_explanation":null,
            "file": []
        };
    }

    function initGapItem() {
        $scope.GapItem = {
            "user_id": $scope.user_id,
            "user_type_id": user_type_id,
            "cerificate_no": null,
            "farmer_user_crop_id": null
        };
    }

    function initIfoamItem() {
        $scope.IfoamItem = {
            "user_id": $scope.user_id,
            "user_type_id": user_type_id,
            "cerificate_no": null,
            "farmer_user_crop_id": null
        };
    }

    function initInternationalStandardItem() {
        $scope.InternationalStandardItem = {
            "user_id": $scope.user_id,
            "user_type_id": user_type_id,
            "cerificate_no": null,
            "cerificate_type_id": null,
            "farmer_user_crop_id": null
        };
    }

    function initFarmerProductionItem() {
        $scope.FarmerProductionItem = {
            "user_id": $scope.user_id,
            "user_type_id": user_type_id,
            "farmer_user_crop_id": null,
            "product_info_id": null,
            "product_info_explanation": null,
            "cooperative_gen_id": null,
            "exact_qty": null,
            "expect_qty": null,
            "expect_outcome": null,
            "exact_outcome": null,
            "expect_revenue": null,
            "exact_revenue": null,
            "expect_datetime": null,
            "exact_datetime": null,
            "datetime_bestBefore": null
        }
    }


    initCultivatedAreaSet();
    initCooperategetSet();
    initUserDataSet();
    initAgricultureItemSet();
    initGapItem();
    initIfoamItem();
    initInternationalStandardItem();
    initFarmerProductionItem();

    $scope.funcSwitchTab = function (tab) {
        $scope.activeTab = tab;
    }

    $scope.switchPage = function (page, tab) { /*change form or table in tab*/
        $scope.hasSubmit = false;
        $scope.unit_product = null;
        if (tab == 'tab1') {
            $scope.page_tab1 = page;
            if ($scope.page_tab1 == 'table') {
                $scope.CommitteeItem = {};
            }
        } else if (tab == 'tab_extra') {
            $scope.page_tab_extra = page;

            if ($scope.page_tab_extra == 'table') {
                $scope.FarmerExtraItem = {};
            }
        } else if (tab == 'tab2') {
            $scope.page_tab2 = page;


        } else if (tab == 'tab3') {
            $scope.page_tab3 = page;


        } else if (tab == 'tab4') {
            $scope.page_tab4 = page;
            if ($scope.page_tab4 == 'table') {
                $scope.FarmerProductionItem = {};
            }
        } else if (tab == 'tab5') {
            $scope.page_tab5 = page;
            if ($scope.page_tab5 == 'table') {
                $scope.GapItem = {};
            }
        } else if (tab == 'tab6') {
            $scope.page_tab6 = page;
            if ($scope.page_tab6 == 'table') {
                $scope.IfoamItem = {};
            }
        } else if (tab == 'tab7') {
            $scope.page_tab7 = page;
            if ($scope.page_tab7 == 'table') {
                $scope.InternationalStandardItem = {};
            }
        } else if (tab == 'tab8') {
            $scope.page_tab8 = page;
            if ($scope.page_tab8 == 'table') {
                $scope.InspectionItem = {};
            }
        }
    }

    $scope.clearData = function () {
        $scope.page_tab_extra = 'table';
        $scope.page_tab1 = 'table';
        $scope.page_tab2 = 'table';
        $scope.page_tab3 = 'table';
        $scope.page_tab4 = 'table';
        $scope.page_tab5 = 'table';
        $scope.page_tab6 = 'table';
        $scope.page_tab7 = 'table';
        $scope.page_tab8 = 'table';
        $scope.user_data.location_remark = null;
        $scope.hasSubmit = false;
        clearMaterialSelect('.mdb-select');
        $('#select_province').val("");
        $('#select_district').val("");
        $('#select_sub_district').val("");
        $('#select_cultivated_area').val("");
        $('#select_cooperative').val("");
        $('#money_supplied').val("");
        $('#select_resource').val("");
        $('#select_breed').val("");
    }

    $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
        $('.datepicker').pickadate({
            format: 'yyyy-mm-dd',
            formatSubmit: 'yyyy-mm-dd',
            hiddenPrefix: 'prefix__',
            hiddenSuffix: '__suffix'
        });
        setTimeout(function () {
            initMaterialSelect('#select_cultivated_area');
            initMaterialSelect('#select_resource');
            initMaterialSelect('#select_product');
            initMaterialSelect('#select_cerificate_type');
            initMaterialSelect('#select_inspection_body_info');
            initMaterialSelect('#select_farmer_user_crop_gap');
            initMaterialSelect('#select_cultivated_area_ifoam');
            initMaterialSelect('#select_cooperative');
            initMaterialSelect('#money_supplied');
            initMaterialSelect('#select_breed');

            checkselectoption();
        }, 500);

    });

    function checkselectoption() {
        // panel 2 form
        if ($scope.CultivatedAreaItem.irrigation_info_id != null) {
            initMaterialSelect('#select_cultivated_area', $scope.CultivatedAreaItem.irrigation_info_id);
        }

        // panel 3 form
        if ($scope.AgricultureItem.resource_info_id != null) {
            initMaterialSelect('#select_resource', $scope.AgricultureItem.resource_info_id);
        }
        if ($scope.AgricultureItem.breed_info_id != null) {
            initMaterialSelect('#select_breed', $scope.AgricultureItem.breed_info_id);
        }
        if ($scope.AgricultureItem.farmer_user_cultivated_area_info_id != null) {
            initMaterialSelect('#select_cultivated_area', $scope.AgricultureItem.farmer_user_cultivated_area_info_id);
        }
        if ($scope.AgricultureItem.farmer_invest_type_id != null) {
            initMaterialSelect('#money_supplied', $scope.AgricultureItem.farmer_invest_type_id);
        }

        // panel 4 form
        if ($scope.FarmerProductionItem.farmer_user_crop_id != null) {
            initMaterialSelect('#select_farmer_user_crop_gap', $scope.FarmerProductionItem.farmer_user_crop_id);
        }
        if ($scope.FarmerProductionItem.product_info_id != null) {
            initMaterialSelect('#select_product', $scope.FarmerProductionItem.product_info_id);
        }
        if ($scope.FarmerProductionItem.cooperative_gen_id != null) {
            initMaterialSelect('#select_cooperative', $scope.FarmerProductionItem.cooperative_gen_id);
        }

        // panel 5 form
        if ($scope.GapItem.farmer_user_crop_id != null) {
            initMaterialSelect('#select_farmer_user_crop_gap', $scope.GapItem.farmer_user_crop_id);
        }

        // panel 6 form
        if ($scope.IfoamItem.farmer_user_crop_id != null) {
            initMaterialSelect('#select_farmer_user_crop_gap', $scope.IfoamItem.farmer_user_crop_id);
        }

        // panel 7 form
        if ($scope.InternationalStandardItem.farmer_user_crop_id != null) {
            initMaterialSelect('#select_farmer_user_crop_gap', $scope.InternationalStandardItem.farmer_user_crop_id);
        }
        if ($scope.InternationalStandardItem.cerificate_type_id != null) {
            initMaterialSelect('#select_cerificate_type', $scope.InternationalStandardItem.cerificate_type_id);
        }
    }

    $scope.datePicker = function () {
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
                    "url": url + '/farmer_info',
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

    // -------------------------------------------
    // จังหวัด อำเภอ ตำบล
    // -------------------------------------------

    var province_id;
    var district_id;
    var sub_district_id;
    var need_load_address_id = false;

    $scope.$on('ngRepeatFinishedProvince', function (ngRepeatFinishedEvent) {
        if (need_load_address_id) {
            $("#select_province").find('option').get(0).remove(); // Fix angular bug
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
            $("#select_district").find('option').get(0).remove(); // Fix angular bug
            initMaterialSelect('#select_district', district_id);
            $scope.getSubDistrict(district_id);
        } else {
            clearMaterialSelect('#select_district');
            clearMaterialSelect('#select_sub_district');
        }
    });

    $scope.$on('ngRepeatFinishedSub_district', function (ngRepeatFinishedEvent) {
        if (need_load_address_id) {
            $("#select_sub_district").find('option').get(0).remove(); // Fix angular bug
            initMaterialSelect('#select_sub_district', sub_district_id);
        } else {
            clearMaterialSelect('#select_sub_district');
        }
        need_load_address_id = false;
    });

    $scope.getProvince = function () {
        clearMaterialSelect('#select_province');
        clearMaterialSelect('#select_district');
        clearMaterialSelect('#select_sub_district');
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
        if (district_id == undefined) {
            $scope.sub_districts = "";
        } else {
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
                    toastr["warning"]("Location not found");
                }
            } else {
                toastr["warning"]('Geocoder failed due to: ' + status);
            }
        });
    };
    // ----------------------------------------
    //
    //load Master Data
    //
    // ----------------------------------------
    $scope.funcGetResourceInfo = function () {
        // console.log($scope.AgricultureItem.resource_info_id);
        $http({
            method: 'GET',
            url: url + '/resource_info',
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.resource_info = res.data;
            console.log($scope.resource_info)
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.funcGetBreedInfo = function (resource_info_id) {
        // console.log($scope.resource_info);
        $http({
            method: 'GET',
            url: url + '/breed_info/resource/' + resource_info_id,
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.breed_info = res.data;
            console.log($scope.breed_info)
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.funcGetCooperativeGenInfo = function () {
        $http({
            method: 'GET',
            "url": url + '/cooperative_gen/user_id/' + $scope.user_id + '?user_type_id=' + user_type_id, // CHANGE
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.cooperative_info = res.data;
            console.log($scope.cooperative_info)
            if (res.data.length == 0) {
                setTimeout(function () {
                    initMaterialSelect('#select_cooperative');
                }, 500);
            }

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }


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
            console.log($scope.product_info)
            setTimeout(function () { //select option in tab2 set delay
                initMaterialSelect('#select_product_buying');
            }, 50);
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.funcGetCultivatedAreaInfo = function () {
        $http({
            method: 'GET',
            url: url + '/farmer_user_cultivated_area_info/user_id/' + $scope.user_id + "?user_type_id=" + user_type_id,
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.cultivated_area_info = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.funcGetFarmerCropInfo = function () {
        $http({
            method: 'GET',
            url: url + '/farmer_user_crop/user_id/' + $scope.user_id + "?user_type_id=" + user_type_id,
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.farmer_crop_info = res.data;
            console.log($scope.farmer_crop_info)
            setTimeout(function () { //select option in tab2 set delay
                initMaterialSelect('#select_cerificate_type');
                initMaterialSelect('#select_farmer_user_crop_gap');
            }, 50);
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.funcGetCerificateType = function () {
        $http({
            method: 'GET',
            url: url + '/cerificate_type',
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.cerificate_type = res.data;
            setTimeout(function () { //select option in tab2 set delay
                initMaterialSelect('#select_farmer_user_crop_gap');
                initMaterialSelect('#select_farmer_user_crop_ifoam');
                initMaterialSelect('#select_farmer_user_crop_international');

            }, 50);
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.funcGetInspectionInfo = function () {
        $http({
            method: 'GET',
            url: url + '/inspection_body_info',
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.inspection_body_info = res.data;
            // TODO : Need initial selct to show select box when no data insert
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    //------------------------ panel 1 Profile ---------------------------//
    // table ในข้อมูลส่วนตัว
    // ---------------------------------------------------------------------
    $scope.funcGetCooperative = function () { //ข้อมูลสหกรณ์
        // Always reset value in form when show table
        $scope.CooperativeItem = {};

        // AJAX method for dataTables.
        $scope.ajaxCooperativeOptions = {
            "ajax": {
                "url": url + '/cooperative_gen/user_id/' + $scope.user_id + '?user_type_id=' + user_type_id, // CHANGE
                "beforeSend": function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [{
                    "data": "start_date_time"
                }, // CHANGE
                {
                    "data": "end_date_time"
                },
                {
                    "data": "president_name"
                },
                {
                    "data": "manager_name"
                },
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) { // CHANGE
                let menu = 'cooperative_gen';
                var html = '<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="getCooperative_gen(' + aData.id + ');"><i class="fa fa-pencil"></i></a>' +
                    '<a class="btn-floating btn-sm red darken-3 waves-effect waves-light" ng-click="getDelData(' + aData.id + ',' + '\'' + menu + '\');"><i class="fa fa-trash"></i></a>';
                var last_row = $("td:last", nRow);
                if (!last_row.html()) {
                    angular.element(last_row).append($compile(html)($scope))
                }
                $('td', nRow).eq('0').html($filter('limitTo')(aData.start_date_time, 10, 0));
                $('td', nRow).eq('1').html($filter('limitTo')(aData.end_date_time, 10, 0));
                $(nRow).attr("id", 'row_' + aData.id);
                return nRow;
            },
            "fnDrawCallback": function (oSettings, json) {
                initMaterialSelectDataTable();
            },
        };

        setTimeout(function () {
            $('#table_data_cooperative').DataTable().ajax.reload();
        }, 300);
    }

    $scope.getCooperative_gen = function (id) {
        $http({
            method: 'GET',
            url: url + '/cooperative_gen/' + id,
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.cooperate_data = res.data[0];

            $('#addCooperativeData').modal('show');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    // -------------------------------------------
    // เรียกข้อมูลเกษตรกร
    // -------------------------------------------
    $scope.funcGetFarmerInfoByID = function () {
        $http({
            method: 'GET',
            url: url + '/farmer_info/user_id/' + $scope.user_id,
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
                $scope.user_data.gender_id = res.data[0].gender_id.toString();
                $scope.user_data.corporate_type_id = res.data[0].corporate_type_id.toString();
                $scope.user_data.is_corporate = res.data[0].is_corporate.toString();
                $scope.search_address = $scope.user_data.gps_lat + ',' + $scope.user_data.gps_long;
            }

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    // -------------------------------------------
    // เรียกข้อมูลกรรมการ
    // -------------------------------------------
    $scope.funcGetFarmerUserCommitteeByID = function () {

        // Always reset value in form when show table
        $scope.CommitteeItem = {};

        // AJAX method for dataTables.
        $scope.ajaxCommitteeOptions = {
            "ajax": {
                "url": url + '/farmer_user_committee_info/user_id/' + $scope.user_id + '?user_type_id=' + user_type_id, // CHANGE
                "beforeSend": function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [{
                    "data": "name"
                }, // CHANGE
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) { // CHANGE
                var html = '<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="detailFarmerUserCommittee(' + aData.id + ');"><i class="fa fa-eye"></i></a>';
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
            $('#table_data_board_name').DataTable().ajax.reload();
        }, 1500);
    }

    // -------------------------------------------
    // ดูรายละเอียดข้อมูลกรรมการ
    // -------------------------------------------
    $scope.detailFarmerUserCommittee = function (id) {
        $scope.objCommittee = {};
        $http({
            method: 'GET',
            url: url + '/farmer_user_committee_info/' + id,
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.objCommittee = res.data[0];
            $('#DetailCommittee').modal('show');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    };

    // -------------------------------------------
    // เพิ่มข้อมูลกรรมการ
    // -------------------------------------------
    $scope.funcInsertCommittee = function (data) {
        $http({
            method: 'POST',
            url: url + '/farmer_user_committee_info',
            dataType: "json",
            data: {
                "user_id": $scope.user_id,
                "user_type_id": user_type_id,
                "name": data.name,
                "province_id": 0,
                "district_id": 0,
                "sub_district_id": 0,
                "address": data.address,
                "phone": data.phone,
                "tax_id": data.tax_id
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function (res) {
            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {

                //alert('บันทึกข้อมูลเรียบร้อย');
                $scope.funcGetFarmerInfoByID();
                $scope.funcGetFarmerUserCommitteeByID();
                if ($scope.user_data.user_id == null) {
                    $scope.funcInsertUserData($scope.user_data);
                } else {
                    $scope.funcUpdateUserData();
                }
                $scope.switchPage('table', 'tab1');
            }
        }, function (err) {
            toastr["warning"]("system error");
        });

    }
    $scope.funcInsertUserData = function (user_data, require) {

        $scope.hasSubmit = true;
        if (!require) {
            $http({
                method: 'POST',
                url: url + '/farmer_info',
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
                    toastr["success"]("บันทึกข้อมูลเรียบร้อย");

                }
            }, function onError(response) {
                toastr["warning"]("system error" + " : กรุณาใส่ข้อมูลให้ครบ");
            });
        }

    }
    $scope.funcUpdateUserData = function (require) {
        // console.log($scope.user_data);
        $scope.hasSubmit = true;
        if (!require) {
            $http({
                method: 'PUT',
                url: url + '/farmer_info/' + $scope.user_id,
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

    //------------------------ panel Extra info ---------------------------//
    $scope.funcGetFarmerExtraByID = function () {
        $scope.FarmerExtraItem = {};

        $scope.ajaxFarmerExtraOptions = {
            "ajax": {
                "url": url + '/farmer_extra_info/user_id/' + $scope.user_id,
                "beforeSend": function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [{
                    "data": "resource_name"
                }, // CHANGE
                {
                    "data": "production_qty"
                },
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) { // CHANGE
                var html = '<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="detailExtraInfo(' + aData.id + ');"><i class="fa fa-eye"></i></a>';

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
    }

    $scope.funcInsertFarmerExtra = function (user_data) {
        $scope.FarmerExtraItem.user_id = $scope.user_id;
        $http({
            method: 'POST',
            url: url + '/farmer_extra_info',
            dataType: "json",
            data: $scope.FarmerExtraItem,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {
                toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                $scope.switchPage('table', 'tab_extra');
            }
        }, function onError(response) {
            toastr["warning"]("system error" + " : กรุณาใส่ข้อมูลให้ครบ");
        });
    }

    $scope.detailExtraInfo = function (id) {
        $scope.objExtraInfo = {};
        $http({
            method: 'GET',
            url: url + '/farmer_extra_info/' + id,
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.objExtraInfo = res.data[0];
            $scope.objExtraInfo.farmer_extra_type_id = res.data[0].farmer_extra_type_id.toString();
            $('#detailExtraInfo').modal('show');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    // เพิ่มข้อมูลประธาน ผู้จัดการ สหกรณ์
    $scope.funcInsertCoorperat = function (data) {

        $http({
            method: 'POST',
            url: url + '/cooperative_gen',
            dataType: "json",
            data: data,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            let res = response.data;
            if (res.status == "error") {
                toastr["warning"](response.error);
            } else {
                toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                initCooperategetSet();
                $('#addCooperativeData').modal('hide');
                $scope.funcGetCooperative();
            }
        }, function onError(response) {
            toastr["warning"]("system error" + " : กรุณาใส่ข้อมูลให้ครบ");
        });
    }
    // อัพเพทข้อมูลประธาน ผู้จัดการ สหากรณ์
    $scope.funcUpdateCoorperat = function (data) {

        $http({
            method: 'PUT',
            url: url + '/cooperative_gen/' + $scope.user_id + '?user_type_id=' + user_type_id,
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
                $('#addCooperativeData').modal('hide');
                $scope.funcGetCooperative();

            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    //------------------------ panel 2 Cultivated Area---------------------------//
    $scope.getIrrigation_info = function () {
        $http({
            method: 'GET',
            url: url + '/irrigation_info',
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.irrigation_info = res.data;
            console.log($scope.irrigation_info);
            setTimeout(function () { //select option in tab2 set delay
                initMaterialSelect('#select_cultivated_area');
            }, 50);
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.funcGetCultivatedAreaByID = function () {

        $scope.upload_file_div = 1; // default, shwo when add button click
        $scope.edit_file_div = 0; //

        // Always reset value in form when show table
        initCultivatedAreaSet();

        // AJAX method for dataTables.
        $scope.ajaxCultivatedAreaOptions = {
            "ajax": {
                "url": url + '/farmer_user_cultivated_area_info/user_id/' + $scope.user_id + '?user_type_id=' + user_type_id, // CHANGE
                "beforeSend": function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [{
                    "data": "name"
                }, // CHANGE
                {
                    "data": "deed_no"
                },
                {
                    "data": "area"
                },
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) { // CHANGE
                let menu = 'farmer_user_cultivated_area_info';
                var html = //'<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="detailCultivatedArea(' + aData.id + ',' + '\'' + 'view' + '\');"><i class="fa fa-eye"></i></a>' +
                    '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="detailCultivatedArea(' + aData.id + ',' + '\'' + 'edit' + '\');"><i class="fa fa-pencil"></i></a>' +
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
            $('#table_data_cultivated_area').DataTable().ajax.reload();
        }, 300);
    }

    $scope.detailCultivatedArea = function (id, type) {

        $scope.upload_file_div = 0;
        $scope.edit_file_div = 1;

        $scope.objCultivatedArea = {};
        $http({
            method: 'GET',
            url: url + '/farmer_user_cultivated_area_info/' + id,
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;

            if (type == 'view') {
                $scope.objCultivatedArea = res.data[0];
                $('#DetailCultivatedArea').modal('show');
            } else {
                $scope.CultivatedAreaItem = res.data[0];

                if ($scope.CultivatedAreaItem.upload_path == null) {
                    $scope.upload_file_div = 1;
                    $scope.edit_file_div = 0;
                } else {
                    $scope.upload_file_div = 0;
                    $scope.edit_file_div = 1;
                }

                $scope.switchPage('form', 'tab2');
            }


            setTimeout(function () {
                let center = new google.maps.LatLng(res.data[0].gps_lat, res.data[0].gps_long);
                NgMap.getMap({
                    id: 'MapDetailCultivatedArea'
                }).then(function (map) {
                    google.maps.event.trigger(map, 'resize');
                    map.setCenter(center);

                })
            }, 600);

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.funcInsertCultivatedArea = function (require) {
        $scope.hasSubmit = true;
        $scope.CultivatedAreaItem.gps_lat = $scope.user_data.gps_lat;
        $scope.CultivatedAreaItem.gps_long = $scope.user_data.gps_long;

        if (!require) {
            $http({
                method: 'POST',
                url: url + '/farmer_user_cultivated_area_info',
                dataType: "json",
                data: $scope.CultivatedAreaItem,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': $cookies.get('api_token')
                }
            }).then(function (res) {
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {

                    toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                    $scope.uploadFile(res.data.data.id, $scope.CultivatedAreaItem.picFile, '/farmer_user_cultivated_area_info/upload/file');
                    $scope.funcGetCultivatedAreaByID();
                    $scope.funcGetCultivatedAreaInfo();
                    $scope.switchPage('table', 'tab2');
                }
            }, function (err) {
                toastr["warning"]("system error");
            });
        }

    }
    $scope.funcUpdateCultivatedArea = function (require) {
        $scope.CultivatedAreaItem.gps_lat = $scope.user_data.gps_lat;
        $scope.CultivatedAreaItem.gps_long = $scope.user_data.gps_long;
        $scope.hasSubmit = true;
        if (!require) {
            $http({
                method: 'PUT',
                url: url + '/farmer_user_cultivated_area_info/' + $scope.CultivatedAreaItem.id,
                dataType: "json",
                data: $scope.CultivatedAreaItem,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': $cookies.get('api_token')
                }
            }).then(function (res) {
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {

                    toastr["success"]("แก้ไขข้อมูลเรียบร้อย");
                    $scope.uploadFile(res.data.data.id, $scope.CultivatedAreaItem.picFile, '/farmer_user_cultivated_area_info/upload/file');
                    $scope.funcGetCultivatedAreaByID();
                    $scope.funcGetCultivatedAreaInfo();
                    $scope.switchPage('table', 'tab2');
                }
            }, function (err) {
                toastr["warning"]("system error");
            });
        }

    }

    $scope.handle_delete_file = function () {
        $scope.edit_file_div = 0;
        $scope.upload_file_div = 1;
    }

    //------------------------ panel 3 Agriculture ---------------------------//
    $scope.getAllCultivatedArea = function () { //สำหรับเลือกชื่อแปลงเพาะปลูก
        $http({
            method: 'GET',
            url: url + '/farmer_user_cultivated_area_info/user_id/'+$scope.user_id+ '?user_type_id=' + user_type_id,
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.sel_cultivated_area_info = res.data;
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    // แหล่งเงินทุน
    $scope.getAllinvest_type = function () {
        $http({
            method: 'GET',
            url: url + '/farmer_invest_type',
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.sel_farmer_invest_type = res.data;
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    $scope.funcGetAgricultureByID = function () {

        // Always reset value in form when show table
        initAgricultureItemSet();

        // AJAX method for dataTables.
        $scope.ajaxAgricultureOptions = {
            "ajax": {
                "url": url + '/farmer_user_crop/user_id/' + $scope.user_id + '?user_type_id=' + user_type_id, // CHANGE
                "beforeSend": function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [{
                    "data": "name"
                }, // CHANGE
                {
                    "data": "resource_info_name"
                },
                {
                    "data": "start_datetime"
                },
                {
                    "data": "end_datetime"
                },
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) { // CHANGE
                let menu = 'farmer_user_crop';
                var html = '<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="detailAgriculture(' + aData.id + ',' + '\'' + 'view' + '\');"><i class="fa fa-eye"></i></a>' +
                    '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="detailAgriculture(' + aData.id + ',' + '\'' + 'edit' + '\');"><i class="fa fa-pencil"></i></a>' +
                    '<a class="btn-floating btn-sm red darken-3 waves-effect waves-light" ng-click="getDelData(' + aData.id + ',' + '\'' + menu + '\');"><i class="fa fa-trash"></i></a>';
                var last_row = $("td:last", nRow);
                if (!last_row.html()) {
                    angular.element(last_row).append($compile(html)($scope))
                }
                $('td', nRow).eq('2').html($filter('limitTo')(aData.start_datetime, 10, 0));
                $('td', nRow).eq('3').html($filter('limitTo')(aData.end_datetime, 10, 0));
                $(nRow).attr("id", 'row_' + aData.id);
                return nRow;
            },
            "fnDrawCallback": function (oSettings, json) {
                initMaterialSelectDataTable();
            },
        };

        setTimeout(function () {
            $('#table_data_agriculture').DataTable().ajax.reload();
        }, 300);
    }

    $scope.detailAgriculture = function (id, type) {

        $scope.objAgriculture = {};
        $http({
            method: 'GET',
            url: url + '/farmer_user_crop/' + id,
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            if (type == 'view') {
                $scope.objAgriculture = res.data[0];

                console.log($scope.objAgriculture);
                $('#DetailAgriculture').modal('show');

            } else {
                $scope.AgricultureItem = res.data[0];
                console.log($scope.AgricultureItem);
                $scope.switchPage('form', 'tab3');
                // setTimeout(function () {
                //     $("#select_resource").find('option').get(0).remove();// Fix angular bug
                //     initMaterialSelect('#select_resource', $scope.AgricultureItem.resource_info_id);
                // }, 500);
            }

            setTimeout(function () {
                let center = new google.maps.LatLng(res.data[0].gps_lat, res.data[0].gps_long);
                NgMap.getMap({
                    id: 'MapDetailAgriculture'
                }).then(function (map) {
                    google.maps.event.trigger(map, 'resize');
                    map.setCenter(center);
                })
            }, 600);
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.funcInsertAgriculture = function (require) {
        $scope.AgricultureItem.gps_lat = $scope.user_data.gps_lat;
        $scope.AgricultureItem.gps_long = $scope.user_data.gps_long;
        $scope.hasSubmit = true;
        if (!require) {
            $http({
                method: 'POST',
                url: url + '/farmer_user_crop',
                dataType: "json",
                data: $scope.AgricultureItem,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': $cookies.get('api_token')
                }
            }).then(function (res) {
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {

                    toastr["success"]("บันทึกข้อมูลเรียบร้อย");

                    $scope.funcGetAgricultureByID();
                    $scope.switchPage('table', 'tab3');
                }
            }, function (err) {
                toastr["warning"]("system error");
            });
        }

    }
    $scope.funcUpdateAgriculture = function (require) {
        $scope.AgricultureItem.gps_lat = $scope.user_data.gps_lat;
        $scope.AgricultureItem.gps_long = $scope.user_data.gps_long;
        $scope.hasSubmit = true;
        if (!require) {
            $http({
                method: 'PUT',
                url: url + '/farmer_user_crop/' + $scope.AgricultureItem.id,
                dataType: "json",
                data: $scope.AgricultureItem,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': $cookies.get('api_token')
                }
            }).then(function (res) {
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {

                    toastr["success"]("แก้ไขข้อมูลเรียบร้อย");

                    $scope.funcGetAgricultureByID();
                    $scope.switchPage('table', 'tab3');
                }
            }, function (err) {
                toastr["warning"]("system error");
            });
        }

    }

    //------------------------ panel 4 Farmer Production ---------------------------//
    $scope.funcGetFarmerProductionByID = function () {

        // Always reset value in form when show table
        initFarmerProductionItem();

        // AJAX method for dataTables.
        $scope.ajaxFarmerProductionOptions = {
            "ajax": {
                "url": url + '/farmer_user_production_info/user_id/' + $scope.user_id + '?user_type_id=' + user_type_id, // CHANGE
                "beforeSend": function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [{
                    "data": "product_name"
                }, // CHANGE
                {
                    "data": "expect_outcome"
                },
                {
                    "data": "exact_outcome"
                },
                {
                    "data": "expect_revenue"
                },
                {
                    "data": "exact_revenue"
                },
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) { // CHANGE
                let menu = 'farmer_user_production_info';
                var html = //'<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="detailFarmerProduction(' + aData.id + ');"><i class="fa fa-eye"></i></a>';
                    '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="detailFarmerProduction(' + aData.id + ',' + '\'' + 'edit' + '\');"><i class="fa fa-pencil"></i></a>' +
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
            $('#table_data_farmer_production').DataTable().ajax.reload();
        }, 300);
    }

    $scope.detailFarmerProduction = function (id) {
        $scope.objFarmerProduction = {};
        $http({
            method: 'GET',
            url: url + '/farmer_user_production_info/' + id,
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.FarmerProductionItem = res.data[0];
            $scope.FarmerProductionItem.exact_datetime = $filter('limitTo')(res.data[0].exact_datetime, 10, 0);
            $scope.FarmerProductionItem.expect_datetime = $filter('limitTo')(res.data[0].expect_datetime, 10, 0);
            $scope.FarmerProductionItem.datetime_bestBefore = $filter('limitTo')(res.data[0].datetime_bestBefore, 10, 0);
            $scope.switchPage('form', 'tab4');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.funcInsertFarmerProduction = function (require) {
        $scope.hasSubmit = true;
        if (!require) {
            $http({
                method: 'POST',
                url: url + '/farmer_user_production_info',
                dataType: "json",
                data: $scope.FarmerProductionItem,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': $cookies.get('api_token')
                }
            }).then(function (res) {
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {
                    toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                    $scope.funcGetFarmerProductionByID();
                    $scope.switchPage('table', 'tab4');
                }
            }, function (err) {
                toastr["warning"]("system error");
            });
        }

    }

    $scope.funcUpdateFarmerProduction = function (require) {
        if ($scope.FarmerProductionItem.cooperative_gen_id == null) {
            $scope.FarmerProductionItem.cooperative_gen_id = 0;
        }
        $scope.hasSubmit = true;
        if (!require) {
            $http({
                method: 'PUT',
                url: url + '/farmer_user_production_info/' + $scope.FarmerProductionItem.id,
                dataType: "json",
                data: $scope.FarmerProductionItem,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': $cookies.get('api_token')
                }
            }).then(function (res) {
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {
                    toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                    $scope.funcGetFarmerProductionByID();
                    $scope.switchPage('table', 'tab4');
                }
            }, function (err) {
                toastr["warning"]("system error");
            });
        }

    }

    //------------------------ panel 5 GAP ---------------------------//
    $scope.funcGetGapByID = function () {
        $scope.upload_file_div = 1; // default, shwo when add button click
        $scope.edit_file_div = 0; //

        // Always reset value in form when show table
        initGapItem();

        // AJAX method for dataTables.
        $scope.ajaxGapOptions = {
            "ajax": {
                "url": url + '/farmer_user_gap_standard_info/user_id/' + $scope.user_id + '?user_type_id=' + user_type_id, // CHANGE
                "beforeSend": function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [{
                    "data": "crop_name"
                }, // CHANGE
                {
                    "data": "cerificate_no"
                },
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) { // CHANGE
                let menu = 'farmer_user_gap_standard_info';
                var html = //'<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="detailGap(' + aData.id + ');"><i class="fa fa-eye"></i></a>';
                    '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="detailGap(' + aData.id + ',' + '\'' + 'edit' + '\');"><i class="fa fa-pencil"></i></a>' +
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
            $('#table_data_gap').DataTable().ajax.reload();
        }, 300);
    }

    //list show title
    $scope.funcGetGepTitleInfo = function () {
        return; // Not use
        $http({
            method: 'GET',
            url: url + '/gap_standard_title_info',
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.gap_standard_title_info = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    //list show item in title
    $scope.funcGetGepItemInfo = function () {
        return; // Not use
        $http({
            method: 'GET',
            url: url + '/gap_standard_item_info',
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.gap_standard_item_info = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.detailGap = function (id) {
        $scope.upload_file_div = 0;
        $scope.edit_file_div = 1;

        $scope.objGap = {};
        $http({
            method: 'GET',
            url: url + '/farmer_user_gap_standard_info/' + id,
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.GapItem = res.data[0];

            if ($scope.GapItem.upload_path == null) {
                $scope.upload_file_div = 1;
                $scope.edit_file_div = 0;
            } else {
                $scope.upload_file_div = 0;
                $scope.edit_file_div = 1;
            }

            $scope.switchPage('form', 'tab5');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.gaplist = function (obj) {
        return; // Not use
        $("#detailGap input[type=checkbox]").each(function () {

            if (obj[$(this).attr("id")]) {
                $(this).prop("checked", true);
            }
        });
    }

    $scope.funcInsertGap = function (require) {
        $scope.hasSubmit = true;
        console.log(require);
        if (!require) {
            $http({
                method: 'POST',
                url: url + '/farmer_user_gap_standard_info',
                dataType: "json",
                data: $scope.GapItem,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': $cookies.get('api_token')
                }
            }).then(function (res) {
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {

                    toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                    $scope.uploadFile(res.data.data.id, $scope.GapItem.picFile, '/farmer_user_gap_standard_info/upload/file');
                    $scope.funcGetGapByID();
                    $scope.switchPage('table', 'tab5');
                }
            }, function (err) {
                toastr["warning"]("system error");
            });
        }

    }

    $scope.funcUpdateGap = function (require) {
        $scope.hasSubmit = true;
        if (!require) {
            $http({
                method: 'PUT',
                url: url + '/farmer_user_gap_standard_info/' + $scope.GapItem.id,
                dataType: "json",
                data: $scope.GapItem,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': $cookies.get('api_token')
                }
            }).then(function (res) {
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {

                    toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                    $scope.uploadFile(res.data.data.id, $scope.GapItem.picFile, '/farmer_user_gap_standard_info/upload/file');
                    $scope.funcGetGapByID();
                    $scope.switchPage('table', 'tab5');
                }
            }, function (err) {
                toastr["warning"]("system error");
            });
        }


    }

    //------------------------ panel 6 IFOAM ---------------------------//
    $scope.funcGetIfoamByID = function () {
        $scope.upload_file_div = 1; // default, shwo when add button click
        $scope.edit_file_div = 0; //

        // Always reset value in form when show table
        initIfoamItem();

        // AJAX method for dataTables.
        $scope.ajaxIfoamOptions = {
            "ajax": {
                "url": url + '/farmer_user_organic_standard_info/user_id/' + $scope.user_id + '?user_type_id=' + user_type_id, // CHANGE
                "beforeSend": function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [{
                    "data": "crop_name"
                }, // CHANGE
                {
                    "data": "cerificate_no"
                },
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) { // CHANGE
                let menu = "farmer_user_organic_standard_info";
                var html = //'<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="detailIfoam(' + aData.id + ');"><i class="fa fa-eye"></i></a>';
                    '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="detailIfoam(' + aData.id + ',' + '\'' + 'edit' + '\');"><i class="fa fa-pencil"></i></a>' +
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
            $('#table_data_ifoam').DataTable().ajax.reload();
        }, 300);
    }

    $scope.detailIfoam = function (id) {
        $scope.upload_file_div = 0;
        $scope.edit_file_div = 1;

        $scope.objIfoam = {};
        $http({
            method: 'GET',
            url: url + '/farmer_user_organic_standard_info/' + id,
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.IfoamItem = res.data[0];

            if ($scope.IfoamItem.upload_path == null) {
                $scope.upload_file_div = 1;
                $scope.edit_file_div = 0;
            } else {
                $scope.upload_file_div = 0;
                $scope.edit_file_div = 1;
            }

            $scope.switchPage('form', 'tab6');
        }, function onError(response) {
            toastr["warning"]("system error");;
        });
    }

    $scope.Ifoamlist = function (obj) {
        $("#detailIfoam input[type=checkbox]").each(function () {

            if (obj[$(this).attr("id")]) {
                $(this).prop("checked", true);
            }
        });
    }

    //list show title
    $scope.funcGetIfoamTitleInfo = function () {
        return;
        $http({
            method: 'GET',
            url: url + '/ifoam_standard_title_info',
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.ifoam_standard_title_info = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    //list show item LV2 in title
    $scope.funcGetIfoamLV2TitleInfo = function () {
        return;
        $http({
            method: 'GET',
            url: url + '/ifoam_standard_lv2_title_info',
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.ifoam_standard_lv2_title_info = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    //list show item LV3 in title
    $scope.funcGetIfoamLV3TitleInfo = function () {
        return;
        $http({
            method: 'GET',
            url: url + '/ifoam_standard_lv3_title_info',
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.ifoam_standard_lv3_title_info = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    //list show item LV4 in title
    $scope.funcGetIfoamLV4TitleInfo = function () {
        return;
        $http({
            method: 'GET',
            url: url + '/ifoam_standard_lv4_title_info',
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.ifoam_standard_lv4_title_info = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.funcInsertIfoam = function (require) {
        $scope.hasSubmit = true;
        if (!require) {
            $http({
                method: 'POST',
                url: url + '/farmer_user_organic_standard_info',
                dataType: "json",
                data: $scope.IfoamItem,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': $cookies.get('api_token')
                }
            }).then(function (res) {
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {

                    toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                    $scope.uploadFile(res.data.data.id, $scope.IfoamItem.picFile, '/farmer_user_organic_standard_info/upload/file');
                    $scope.funcGetGapByID();
                    $scope.switchPage('table', 'tab6');
                }
            }, function (err) {
                toastr["warning"]("system error");
            });
        }

    }

    $scope.funcUpdateIfoam = function (require) {
        $scope.hasSubmit = true;
        if (!require) {
            $http({
                method: 'PUT',
                url: url + '/farmer_user_organic_standard_info/' + $scope.IfoamItem.id,
                dataType: "json",
                data: $scope.IfoamItem,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': $cookies.get('api_token')
                }
            }).then(function (res) {
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {

                    toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                    $scope.uploadFile(res.data.data.id, $scope.IfoamItem.picFile, '/farmer_user_organic_standard_info/upload/file');
                    $scope.funcGetGapByID();
                    $scope.switchPage('table', 'tab6');
                }
            }, function (err) {
                toastr["warning"]("system error");
            });
        }

    }

    //------------------------ panel 7 International Standard ---------------------------//
    $scope.funcGetInternationalStandardByID = function () {
        $scope.upload_file_div = 1; // default, shwo when add button click
        $scope.edit_file_div = 0; //

        // Always reset value in form when show table
        initInternationalStandardItem();

        // AJAX method for dataTables.
        $scope.ajaxInterStandardOptions = {
            "ajax": {
                "url": url + '/farmer_user_international_standard_info/user_id/' + $scope.user_id + '?user_type_id=' + user_type_id, // CHANGE
                "beforeSend": function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [{
                    "data": "crop_name"
                }, // CHANGE
                {
                    "data": "cerificate_type_name"
                },
                {
                    "data": "cerificate_no"
                }, // CHANGE
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) { // CHANGE
                let menu = "farmer_user_international_standard_info";
                var html = //'<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="detailInterStandard(' + aData.id + ');"><i class="fa fa-eye"></i></a>';
                    '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="detailInterStandard(' + aData.id + ',' + '\'' + 'edit' + '\');"><i class="fa fa-pencil"></i></a>' +
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
            $('#table_data_international_standard').DataTable().ajax.reload();
        }, 300);
    }

    $scope.detailInterStandard = function (id) {
        $scope.upload_file_div = 0;
        $scope.edit_file_div = 1;

        $scope.objInterStandard = {};
        $http({
            method: 'GET',
            url: url + '/farmer_user_international_standard_info/' + id,
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.InternationalStandardItem = res.data[0];

            if ($scope.InternationalStandardItem.upload_path == null) {
                $scope.upload_file_div = 1;
                $scope.edit_file_div = 0;
            } else {
                $scope.upload_file_div = 0;
                $scope.edit_file_div = 1;
            }

            $scope.switchPage('form', 'tab7');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.funcInsertInterStandard = function (require) {
        $scope.hasSubmit = true;
        console.log(require);
        if (!require) {
            $http({
                method: 'POST',
                url: url + '/farmer_user_international_standard_info',
                dataType: "json",
                data: $scope.InternationalStandardItem,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': $cookies.get('api_token')
                }
            }).then(function (res) {
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {

                    toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                    $scope.uploadFile(res.data.data.id, $scope.InternationalStandardItem.picFile, '/farmer_user_international_standard_info/upload/file');
                    $scope.funcGetInternationalStandardByID();
                    $scope.switchPage('table', 'tab7');
                }
            }, function (err) {
                toastr["warning"]("system error");
            });
        }

    }

    $scope.funcUpdateInterStandard = function (require) {

        $scope.hasSubmit = true;
        if (!require) {
            $http({
                method: 'PUT',
                url: url + '/farmer_user_international_standard_info/' + $scope.InternationalStandardItem.id,
                dataType: "json",
                data: $scope.InternationalStandardItem,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': $cookies.get('api_token')
                }
            }).then(function (res) {
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {

                    toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                    $scope.uploadFile(res.data.data.id, $scope.InternationalStandardItem.picFile, '/farmer_user_international_standard_info/upload/file');
                    $scope.funcGetInternationalStandardByID();
                    $scope.switchPage('table', 'tab7');
                }
            }, function (err) {
                toastr["warning"]("system error");
            });
        }

    }

    //------------------------ panel 8 Inspection ---------------------------//
    $scope.funcGetInspectionByID = function () {
        // Always reset value in form when show table
        $scope.InspectionItem = {};

        // AJAX method for dataTables.
        $scope.ajaxInspectionOptions = {
            "ajax": {
                "url": url + '/farmer_user_inspection/user_id/' + $scope.user_id + '?user_type_id=' + user_type_id, // CHANGE
                "beforeSend": function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [{
                    "data": "fullname"
                }, // CHANGE
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) { // CHANGE
                var html = '<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="detailInspection(' + aData.id + ');"><i class="fa fa-eye"></i></a>';
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
            $('#table_data_inspection').DataTable().ajax.reload();
        }, 1500);
    }

    $scope.detailInspection = function (id) {
        $scope.objInspection = {};
        $http({
            method: 'GET',
            url: url + '/farmer_user_inspection/' + id,
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.objInspection = res.data[0];
            $('#detailInspection').modal('show');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.funcInsertInspection = function (data) {
        $http({
            method: 'POST',
            url: url + '/farmer_user_inspection',
            dataType: "json",
            data: {
                "user_id": $scope.user_id,
                "user_type_id": user_type_id,
                "inspection_body_info_id": data.inspection_body_info_id
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $cookies.get('api_token')
            }
        }).then(function (res) {
            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {

                toastr["success"]("บันทึกข้อมูลเรียบร้อย");

                $scope.funcGetInspectionByID();
                $scope.switchPage('table', 'tab8');
            }
        }, function (err) {
            toastr["warning"]("system error");
        });
    }
    // -----------delete alert------------------------
    $scope.getDelData = function (id, menu) {
        $scope.data_alert = {
            'id': id,
            'menu': menu
        };
        $('#modalConfirmDelete').modal('show');
    }

    $scope.DeleteData = function (user_id) {
        $http({
            method: 'DELETE',
            url: url + '/farmer_info/user_id/' + user_id,
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

                if (obj.menu == 'cooperative_gen') {
                    $scope.funcGetCooperative();
                } else if (obj.menu == 'farmer_user_cultivated_area_info') {
                    $scope.funcGetCultivatedAreaByID();
                } else if (obj.menu == 'farmer_user_crop') {
                    $scope.funcGetAgricultureByID();
                } else if (obj.menu == 'farmer_user_gap_standard_info') {
                    $scope.funcGetGapByID();
                } else if (obj.menu == "farmer_user_organic_standard_info") {
                    $scope.funcGetIfoamByID();
                } else if (obj.menu == "farmer_user_international_standard_info") {
                    $scope.funcGetInternationalStandardByID();
                }else if(obj.menu == 'farmer_user_production_info'){
                    $('#table_data_farmer_production').DataTable().ajax.reload();
                }

                $('#modalConfirmDelete').modal('hide');
            }

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    // -----------------------------------------------------------
    // file upload
    // -----------------------------------------------------------
    $scope.uploadFile = function (id, file, upload_url) {
        if (file) {
            Upload.upload({
                method: 'POST',
                url: url + upload_url,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': $cookies.get('api_token')
                },
                data: {
                    file: file,
                    id: id
                }
            }).then(function (response) {
                //alert("Upload success");
            }, function (err) {
                toastr["warning"]('เกิดข้อผิดพลาด อัพโหลดไฟล์ไม่สำเร็จ');
            }).catch(function (e) {
                toastr["warning"](e);
            });
        }
    };
    // search unit
    $scope.findUnit = function (obj, id, type) {
        console.log(obj)
        $scope.unit_product = null;
        if (type == 'ผลผลิต') {

            angular.forEach(obj, function (item) {

                if (item.id == id) {

                    $scope.unit_product = item.unit;
                }
            });

        }
    }
    // -----------
});