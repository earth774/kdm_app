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

app.controller("ExporterCtrl", function ($scope, $http, $cookies, $compile, $filter, NgMap) {

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
    $scope.user_type_id = 9;
    $scope.activeTab = 'tab1';
    $scope.page_tab2 = 'table';
    $scope.user_id = $cookies.get('user_id');

    // ================init function======================
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
            "corporate_type_id": '1'
        };
        
        $scope.user_data.gps_lat  = window.localStorage.getItem("gps_lat");
        $scope.user_data.gps_long = window.localStorage.getItem("gps_long"); 
        $scope.search_address = $scope.user_data.gps_lat +','+ $scope.user_data.gps_long;
    }
    function initDataexport() {
        $scope.dataexport = {
            'user_id': $scope.user_id,
            'user_type_id': $scope.user_type_id,
            "is_product": '0',
            "product_info_id": null,
            "manufacturer_product_info_id": 0,
            'qty': null,
            'price': null,
            'export_datetime': null,
            'transport_day': null,
            'transport_cost': null,
            'tax': null,
            'operation_cost': null,
            'product_cost': null,
            'source_phone': null,
            'source_address': null,
            'country_id': null,
            'dest_name': null,
            'dest_address': null,
            'dest_phone': null,
            "loss_qty": null,
            "loss_cause": null,
            "transport_delay_day": null,
            "hs_code": null,
            "warehouse_cost": null
        };
    }

    initUserDataSet();
    initDataexport();

    $scope.funcSwitchTab = function (tab) { /*change tab*/
        $scope.activeTab = tab;
    }

    $scope.switchPage = function (page) {
        $scope.unit_product = null;
        $scope.hasSubmit = false;
        $scope.page_tab2 = page;
        if ($scope.page_tab2 == 'table') {
            $scope.dataexport = {};
        }
    }
    $scope.clearData = function () {
        $scope.page_tab2 = 'table';
        $scope.hasSubmit = false;
         $scope.unit_product = null;
        initDataexport();
        clearMaterialSelect('.mdb-select');
        $('#select_province').val("");
        $('#select_district').val("");
        $('#select_sub_district').val("");

        $('#select_product_buying').val("");
        $('#select_product_fac').val("");
        $('#select_country').val("");
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
            initMaterialSelect('#select_country');
            initMaterialSelect('#select_import_cost_type_id');

            checkselectoption();
        }, 500);
    });
    function checkselectoption() {
        // tab 2 form
        if ($scope.dataexport.product_info_id != null) {
            initMaterialSelect('#select_product_buying', $scope.dataexport.product_info_id);
        }

        if ($scope.dataexport.manufacturer_product_info_id != null) {
            initMaterialSelect('#select_product_fac', $scope.dataexport.manufacturer_product_info_id);
        }

        if ($scope.dataexport.country_id != null) {
            initMaterialSelect('#select_country', $scope.dataexport.country_id);
        }
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
                    toastr["warning"]("Location not found");
                }
            } else {
                toastr["warning"]('Geocoder failed due to: ' + status);

            }
        });    
    };   
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
            if (res.data.length == 0) {
                setTimeout(function () {
                    initMaterialSelect('#select_product_buying');
                }, 500);
            }
            setTimeout(function () {
                if($scope.dataexport.product_info_id == "" && !$scope.dataexport.product_info_explanation){
                    $( "#select_product_buying_select2_show" ).val("").change();
                }
             }, 100);
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    // -------------------------------------------
    // เรียกข้อมูลประเทศ
    // -------------------------------------------
    $scope.getCountry = function () {
        $http({
            method: 'GET',
            url: url + '/country',
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.countrys = res.data;
            if (res.data.length == 0) {
                setTimeout(function () {
                    initMaterialSelect('#select_country');
                }, 500);
            }

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    // -------------------------------------------
    // เรียกข้อมูลผลิตภัณฑ์
    // -------------------------------------------
    $scope.funcGetManufacProductInfo = function () {
        $http({
            method: 'GET',
            url: url + '/manufacturer_product_info',
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.manufac_product_info = res.data;
            if (res.data.length == 0) {
                setTimeout(function () {
                    initMaterialSelect('#select_product_fac');
                }, 500);
            }
            setTimeout(function () {
                if($scope.dataexport.manufacturer_product_info_id == "" && !$scope.dataexport.manufacturer_product_info_explanation){
                    $( "#select_product_fac_select2_show" ).val("").change();
                }
             }, 100);

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
                    "url": url + '/exporter_info',
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
        initDataexport();
    }

    // =================function=======================
    // ข้อมูลส่วนตัว
    $scope.funcGetExporterByID = function () {/*{{host}}\exporter_info\user_id\1*/
        $http({
            method: 'GET',
            url: url + '/exporter_info/user_id/' + $scope.user_id,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            console.log(res.data);
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
    $scope.funcInsertExporter = function (require) {/*insert exporter*/
        if(!require){
            $http({
                method: 'POST',
                url: url + '/exporter_info',
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
    $scope.funcUpdateExporter = function (require) {
        if(!require){
        $http({
            method: 'PUT',
            url: url + '/exporter_info/' + $scope.user_id,
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
    // =====================ข้อมูลการส่งออก==================
    $scope.funcGetExportItemByID = function () {
        // Always reset value in form when show table
        initDataexport();
        // AJAX method for dataTables.
        $scope.ajaxExportOptions = {
            "ajax": {
                "url": url + '/exporter_item_info/user_id/' + $scope.user_id + '?user_type_id=' + $scope.user_type_id,
                "beforeSend": function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                {"data": "product_name"},
                {"data": "qty"},
                {"data": "price"},
                {"data": "export_datetime"},
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                var html = '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="detailExportItem(' + aData.id + ');"><i class="fa fa-pencil"></i></a>' +
                        '<a class="btn-floating btn-sm red darken-3 waves-effect waves-light" ng-click="getDelData(' + aData.id + ');"><i class="fa fa-trash"></i></a>';

                var last_row = $("td:last", nRow);
                if (!last_row.html()) {
                    angular.element(last_row).append($compile(html)($scope))
                }

                $('td', nRow).eq('3').html($filter('limitTo')(aData.export_datetime, 10, 0));
                $(nRow).attr("id", 'row_' + aData.id);
                return nRow;
            },
            "fnDrawCallback": function (oSettings, json) {
                initMaterialSelectDataTable();
            },
        };

        setTimeout(function () {
            $('#table_data_export').DataTable().ajax.reload();
        }, 500);
    }

    $scope.funcInsertExportItem = function (require) { /*เพิ่มข้อมูลสินค้าส่งออก*/
            if(!require){
                $http({
                    method: 'POST',
                    url: url + '/exporter_item_info',
                    dataType: "json",
                    data: $scope.dataexport,
                    headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
                }).then(function (res) {
                    if (res.status == "error") {
                        toastr["warning"](res.error);
                    } else {
                        toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                        initDataexport();
                        $scope.switchPage('table');
                    }
                }, function (err) {
                    toastr["warning"]("system error");
                });
            }
    }
    $scope.funcUpdateExportItem = function (require) { /*เพิ่มข้อมูลสินค้าส่งออก*/
            if(!require){
                $http({
                    method: 'PUT',
                    url: url + '/exporter_item_info/' + $scope.dataexport.id,
                    dataType: "json",
                    data: $scope.dataexport,
                    headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
                }).then(function (res) {
                    if (res.status == "error") {
                        toastr["warning"](res.error);
                    } else {
                        toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                        initDataexport();
                        $scope.switchPage('table');
                    }
                }, function (err) {
                    toastr["warning"]("system error");
                });
            }
    }

    $scope.detailExportItem = function (export_item_id) {
        $http({
            method: 'GET',
            url: url + '/exporter_item_info/' + export_item_id,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            var res = response.data;
            $scope.dataexport = res.data[0];
            $scope.dataexport.export_datetime = $filter('limitTo')($scope.dataexport.export_datetime, 10, 0);
            $scope.dataexport.is_product = res.data[0].is_product.toString();
            $scope.switchPage('form', 'tab2');
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    };
    // -----------delete alert------------------------
    $scope.getDelData = function (id, menu) {
        $scope.data_alert = {'id': id};
        $('#modalConfirmDelete').modal('show');
    }

    $scope.ConfirmDelete = function(id,data){
        $scope.del_id = id;
        $scope.del_data = data;
    }

    $scope.DeleteData = function(user_id){
        $http({
            method: 'DELETE',
            url: url + '/exporter_info/user_id/'+ user_id,
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
            url: url + '/exporter_item_info/' + obj.id,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {
                $scope.funcGetExportItemByID();
                $('#modalConfirmDelete').modal('hide');
            }

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    // search unit
  $scope.findUnit = function(obj,id,type) {
      $scope.unit_product = null;
      if(type=='ผลผลิต'){

          angular.forEach(obj,function(item){

              if(item.id == id) {

                  $scope.unit_product = item.unit;
              }
          });

      }else{
          angular.forEach(obj,function(item){
             
              if(item.id == id) {

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
