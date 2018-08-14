
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

app.controller("InvestorMenuCtrl", function ($scope, $http, $cookies, $compile, $filter) {
    var user_type_id = 7;
    $scope.user_type_id = 7;

    $scope.$watch('user_data.age', function (newValue, oldValue) {
        if(newValue === "")
        $scope.test.value = null;
    });

    $scope.CheckCookies = function () {
        if ($cookies.get('api_token') == "" || $cookies.get('api_token') == null) {
            window.location.href = "../index.html";
        }
    }

    $.fn.dataTable.ext.errMode = 'throw';

    $scope.user_id = $cookies.get('user_id');
    $scope.investorItem = {};
    $scope.investorHistoryItem = {};
    $scope.activeTab = 'tab1';

    function initUserDataSet() {
        $scope.user_data = {
            "user_id": $scope.user_id,
            "gender_id":'1',
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
             "affiliation" : null,
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
        $scope.user_data.gps_lat  = window.localStorage.getItem("gps_lat");
        $scope.user_data.gps_long = window.localStorage.getItem("gps_long"); 
        $scope.search_address = $scope.user_data.gps_lat +','+ $scope.user_data.gps_long;        
    }
    function initInvestItem(){
        $scope.investItem = {
            "user_id": $scope.user_id ,
            "user_type_id" : user_type_id ,
            "resource_info_id" : null,
            "invest_money" : null,
            "expect_profit_percent" : null,
            "risk_accept_percent" : null,
            "return_time_year" : null
        };
    }
    function initInvestHistoryItem(){
        $scope.investHistoryItem = {
            "user_id": $scope.user_id ,
            "user_type_id" : user_type_id ,
            "farmer_user_crop_id" : null,
            "invest_money" : null,
            "profit" : null,
            "start_datetime" : null,
            "end_datetime" : null,
            "is_payback" : "0"
        };
    }

    initUserDataSet();
    initInvestItem();
    initInvestHistoryItem();

    $scope.funcSwitchTab = function (tab) {
        $scope.activeTab = tab;
    }

    $scope.switchPage = function (page, tab) { /*change form or table in tab*/
        $scope.hasSubmit=false;
        if (tab == 'tab2') {
            $scope.page_tab2 = page;
            if ($scope.page_tab2 == 'table') {
                initInvestItem();
            }
        } else if (tab == 'tab3') {
            $scope.page_tab3 = page;
            if ($scope.page_tab3 == 'table') {
                initInvestHistoryItem();
            }
        }
    }

    $scope.clearData = function () {
        $scope.page_tab2 = 'table';
        $scope.page_tab3 = 'table';
        $scope.hasSubmit=false;
        clearMaterialSelect('.mdb-select');
        $('#select_province').val("");
        $('#select_district').val("");
        $('#select_sub_district').val("");
    }

    $scope.$on('ngRepeatFinishedResource', function (ngRepeatFinishedEvent) {
        initMaterialSelect('#select_resource');
        setTimeout(function () {
            if($scope.investItem.resource_info_id!=null){
                initMaterialSelect('#select_resource', $scope.investItem.resource_info_id);
            }
        }, 500);

        initMaterialSelect('#province_id');
        setTimeout(function () {
            if($scope.investItem.resource_info_id!=null){
                initMaterialSelect('#province_id', $scope.investItem.province_id);
            }
        }, 500);
    });
             
    $scope.$on('ngRepeatFinishedCrop', function (ngRepeatFinishedEvent) {

        $('.datepicker').pickadate({
                format: 'yyyy-mm-dd',
                formatSubmit: 'yyyy-mm-dd',
                hiddenPrefix: 'prefix__',
                hiddenSuffix: '__suffix'
        });

        initMaterialSelect('#select_crop');
        setTimeout(function () {
            if($scope.investHistoryItem.farmer_user_crop_id != null){
                initMaterialSelect('#select_crop', $scope.investHistoryItem.farmer_user_crop_id);
            }
        }, 500);
    });


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
                    "url": url + '/investor_info',
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
    }

    // -------------------------------------------
    // เรียกข้อมูลพ่อนักลงทุน
    // -------------------------------------------
    $scope.funcGetUserDataByID = function () {
        $http({
            method: 'GET',
            url: url + '/investor_info/user_id/' + $scope.user_id,
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
                $scope.user_data.corporate_type_id = res.data[0].corporate_type_id.toString();
                $scope.user_data.is_corporate = res.data[0].is_corporate.toString();
            }

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    // เพิ่มข้อมูลพ่อนักลงทุน
    $scope.funcInsertUserData = function (require) {
        $scope.hasSubmit=true;
        // $scope.user_data = user_data;
        $scope.user_data.user_id = $scope.user_id;
        if(!require){
            $http({
                method: 'POST',
                url: url + '/investor_info',
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
    // อัพเดทข้อมูลนักลงทุน
    $scope.funcUpdateUserData = function (require,valid) {
        $scope.hasSubmit=true;
        if(!require && valid){
        $http({
            method: 'PUT',
            url: url + '/investor_info/' + $scope.user_id,
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
    $scope.funcGetResourceInfo = function () {
        $http({
            method: 'GET',
            url: url + '/resource_info',
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.resource_info = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    // -------------------------------------------
    // เรียกข้อมูลรอบการเพาะปลูก
    // -------------------------------------------
    $scope.funcGetFarmerCorpInfo = function () {
        $http({
            method: 'GET',
            url: url + '/farmer_user_crop',
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.farmer_user_crop_list = res.data;
            setTimeout(function () { //select option in tab2 set delay
                initMaterialSelect('#select_crop_Investor');
            }, 50);
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    // -------------------------------------------
    // เรียกข้อมูลแปลงเพาะปลูก
    // -------------------------------------------
    $scope.funcGetCultivatedInfo = function () {
        $http({
            method: 'GET',
            url: url + '/farmer_user_cultivated_area_info',
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.farmer_user_cultivated_area_info = res.data;

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    // -------------------------------------------
    // เรียกข้อมูลพืช/สัตว์ ที่ต้องการลงทุน
    // -------------------------------------------
    $scope.funcGetInvestorInterestByID = function () {

        // AJAX method for dataTables.
        $scope.ajaxBuyOptions = {
            "ajax": {
                "url": url + '/investor_interest_info/user_id/' + $scope.user_id + '?user_type_id=' + user_type_id, // CHANGE
                "beforeSend": function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                {"data": "resource_name"}, // CHANGE
                {"data": "invest_money"},
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {// CHANGE
                let menu = 'investor_interest_info';
                var html =
                        //'<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="detailInvestItem(' + aData.id + ');"><i class="fa fa-eye"></i></a>'
                        '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="detailInvestItem('+aData.id+');"><i class="fa fa-pencil"></i></a>'+
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
            $('#table_data_investor_interest').DataTable().ajax.reload();
        }, 300);
    }

    // เพิ่มข้อมูลที่ต้องการลงทุน
    $scope.funcInsertInvestItem = function (require) {
        if(!require){
            $http({
                method: 'POST',
                url: url + '/investor_interest_info',
                dataType: "json",
                data: $scope.investItem,
                headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
            }).then(function (res) {
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {

                    toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                    initInvestItem();
                    initMaterialSelect('#select_resource');
                    initMaterialSelect('#province_id');
                    $scope.funcGetInvestorInterestByID();
                    $scope.page_tab2 = 'table';
                }
            }, function (err) {
                toastr["warning"]("system error");
            });
        }

    }

    // อัพเดตข้อมูลที่ต้องการลงทุน
    $scope.funcUpdateInvestItem = function (require) {

    if(!require){
        $http({
            method: 'PUT',
            url: url + '/investor_interest_info/' + $scope.investItem.id,
            dataType: "json",
            data: $scope.investItem,
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function (res) {
            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {

                toastr["success"]("แก้ไขข้อมูลเรียบร้อย");
                initInvestItem();
                initMaterialSelect('#select_resource');
                initMaterialSelect('#province_id');
                $scope.funcGetInvestorInterestByID();
                $scope.page_tab2 = 'table';
            }
        }, function (err) {
            toastr["warning"]("system error");
        });
    }
    }

    // ดูรายละเอียดข้อมูลผลผลิตที่ต้องการลงทุน
    $scope.detailInvestItem = function (id) {
        $scope.objProduct = {};
        $http({
            method: 'GET',
            url: url + '/investor_interest_info/' + id,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.investItem = res.data[0];
            $scope.switchPage('form','tab2');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    };
    // -------------------------------------------
    // ประวัติการลงทุน
    // -------------------------------------------
    $scope.funcGetInvestorHistoryByID = function () {

        // AJAX method for dataTables.
        $scope.ajaxInvestHistoryOptions = {
            "ajax": {
                "url": url + '/invest_history_info/user_id/' + $scope.user_id + '?user_type_id=' + user_type_id, // CHANGE
                "beforeSend": function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                {"data": "crop_name"},
                {"data": "invest_money"},
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {// CHANGE
                let menu = 'invest_history_info';
                var html = '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="detailInvestHistoryItem('+aData.id+');"><i class="fa fa-pencil"></i></a>'+
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
            $('#table_data_investor_history').DataTable().ajax.reload();
        }, 300);
    }
    // เพิ่มประวัติการลงทุน
    $scope.funcInsertInvestHistoryItem = function (required) {
        if(!required){
            $http({
                method: 'POST',
                url: url + '/invest_history_info',
                dataType: "json",
                data: $scope.investHistoryItem,
                headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
            }).then(function (res) {
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {

                    toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                    initInvestHistoryItem();
                    initMaterialSelect('#select_crop');
                    $scope.funcGetInvestorHistoryByID();
                    $scope.page_tab3 = 'table';
                }
            }, function (err) {
                toastr["warning"]("system error");
            });
        }

    }

    // อัพเดตประวัติการลงทุน
    $scope.funcUpdateInvestHistoryItem = function (required) {

    if(!required){
        $http({
            method: 'PUT',
            url: url + '/invest_history_info/' + $scope.investHistoryItem.id,
            dataType: "json",
            data: $scope.investHistoryItem,
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function (res) {
            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {

                toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                initInvestHistoryItem();
                initMaterialSelect('#select_crop');
                $scope.funcGetInvestorHistoryByID();
                $scope.page_tab3 = 'table';
            }
        }, function (err) {
            toastr["warning"]("system error");
        });
    }
    }

    // ดูรายละเอียดประวัติการลงทุน
    $scope.detailInvestHistoryItem = function (id) {
        initInvestHistoryItem();
        $http({
            method: 'GET',
            url: url + '/invest_history_info/' + id,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.investHistoryItem = res.data[0];
            $scope.investHistoryItem.is_payback = res.data[0].is_payback.toString();
            $scope.investHistoryItem.start_datetime = $filter('limitTo')(res.data[0].start_datetime, 10, 0);
            $scope.investHistoryItem.end_datetime = $filter('limitTo')(res.data[0].end_datetime, 10, 0);
            $scope.switchPage('form','tab3');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    };

    $scope.getDelData = function (id, menu) {
        $scope.data_alert = {'id': id, 'menu': menu};
        $('#modalConfirmDelete').modal('show');
    };

    $scope.ConfirmDelete = function(id,data){
        $scope.del_id = id;
        $scope.del_data = data;
    }

    $scope.DeleteData = function(user_id){
        $http({
            method: 'DELETE',
            url: url + '/investor_info/user_id/'+ user_id,
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

                if (obj.menu == 'investor_interest_info') {
                    $scope.funcGetInvestorInterestByID();
                } else if (obj.menu == 'invest_history_info') {
                    $scope.funcGetInvestorHistoryByID();
                }
                $('#modalConfirmDelete').modal('hide');

            }

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    };
    
    //ข้อมูลนักลงทุน
    $scope.loadInvestorInterestType = function(){
        //investor_interest_type
        $http({
            method: 'GET',
            url: url + '/investor_interest_type',
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {
                $scope.investor_interest_type_menu = res.data;
            }

        }, function onError(response) {
            toastr["warning"]("system error");
        });
        
        //investor_income_type
        $http({
            method: 'GET',
            url: url + '/investor_income_type',
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {
                 $scope.investor_income_type_menu = res.data;
            }

        }, function onError(response) {
            toastr["warning"]("system error");
        });
        
        //investor_invest_type
        $http({
            method: 'GET',
            url: url + '/investor_invest_type',
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {
                 $scope.investor_invest_type_menu = res.data;
            }

        }, function onError(response) {
            toastr["warning"]("system error");
        });
        
    }
    
    $scope.pushInvestorInterestType = function(){
        $scope.investor_interest_type_list=[];
//        angular.forEach($scope.investor_interest_type_menu,function(list){
//            if(list.is_check){
//                $scope.investor_interest_type_list.push(list.id);
//            }
//        });

        for (var i = 0; i < $scope.investor_interest_type_menu.length; i++) {
            var x = document.getElementsByName("investor_interest_type_"+$scope.investor_interest_type_menu[i].id);    
            if(x[0].checked){
                 $scope.investor_interest_type_list.push($scope.investor_interest_type_menu[i].id);
            }       
        }
        $scope.investor_investment.investor_interest_type = $scope.investor_interest_type_list ;
    }
    
    $scope.clearInvestorInterest = function() {
        $scope.hasSubmit = false ;
        $scope.investor_investment = {
            'investor_income_type_id' : null,
            'investor_income_type_note' : null,
            'investor_invest_type_id' : null,
            'investor_invest_type_note' : null,
            'investor_comment' : null,
            'interest' : null,
            'investor_interest_type' : null
        }; 
    }
    $scope.clearInvestorInterest();
    
    $scope.loadDatauser = function() {
         $http({
            method: 'GET',
            url: url + '/investor_interest_info_extra/' + $scope.user_id,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {
                if(response.data.data.length != 0){
                    if(res.data[0].investor_income_type_id !== undefined){
                        $scope.investor_investment.investor_income_type_id = res.data[0].investor_income_type_id ; 
                    }
                    if(res.data[0].investor_income_remark !== undefined){
                        $scope.investor_investment.investor_income_type_note = res.data[0].investor_income_remark ;
                    }
                    if(res.data[0].investor_invest_type_id !== undefined){
                        $scope.investor_investment.investor_invest_type_id = res.data[0].investor_invest_type_id ;
                    }
                    if(res.data[0].investor_invest_remark !== undefined){
                        $scope.investor_investment.investor_invest_type_note = res.data[0].investor_invest_remark ;
                    }  
                    if(res.data[0].investor_comment !== undefined){
                        $scope.investor_investment.investor_comment = res.data[0].investor_comment ;
                    }     
                    if(res.data[0].is_interest !== undefined){
                        $scope.investor_investment.interest = res.data[0].is_interest ;
                    } 
                    if(res.data[0].investor_interest_type_str_id !== undefined){
                        $scope.investor_investment.investor_interest_type = JSON.parse("[" + res.data[0].investor_interest_type_str_id + "]") ;
                    } 
                        
                        

                }
            }

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
   
    $scope.sendForm = function(errorRequire){
        $scope.hasSubmit = true ;
        if(!errorRequire){
            $scope.pushInvestorInterestType();
            $http({
                method: 'PUT',
                url: url + '/investor_interest_info_extra/'+ $scope.user_id ,
                dataType: "json",
                data: $scope.investor_investment,
                headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
            }).then(function (res) {
                if (res.status == "error") {
                    toastr["warning"](res.error);
                } else {
                    toastr["success"]('บันทึกข้อมูลเรียบร้อย');
                    $scope.clearInvestorInterest();
                    $scope.loadDatauser();
                }
            }, function (err) {
                toastr["warning"]('system error');
            }); 
        }
    }
});
