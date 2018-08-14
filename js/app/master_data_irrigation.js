/**
 *
 *
 * @author Chanwoot  See-ngam <chanwoot2536@gmail.com>
 *
 */
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
app.controller("MasterDataIrrigationCtrl", function ($scope, $http, $cookies, $compile, NgMap) {
    $scope.div_table_data_irrigation = 1;
    $scope.btn_menu_add = 1;
    $scope.irrigation_type_id = 0;
    $scope.form_cmd = "";
    $scope.gps_lat = null;
    $scope.gps_long = null;

    $scope.irrigationItem = {};
    function initItemSet() {
        $scope.irrigationItem = {
            "id": null,
            "name": null,
            "capacity": null,
            "surface_area": null,
            "remark": null,
            "gps_lat": null,
            "gps_long": null
        };
    }
   initItemSet();

    $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
        setTimeout(function () {
            initMaterialSelect('#select_irrigation_type');
            checkselectoption();
        }, 500);

    });

    function checkselectoption() {
        if ($scope.irrigation_type != null) {
            initMaterialSelect('#select_irrigation_type', $scope.irrigationItem.irrigation_type_id);
        }
    }

    $scope.funcGetDataTable = function(){
        // AJAX method for dataTables.
        $scope.ajaxOptions = {
            "ajax": {
                "url": url + '/irrigation_info',
                "beforeSend" : function (request) {
                        request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                { "data": "name" },
                { "data": "irrigation_type" },
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    var html = //'<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" data-toggle="modal" data-target="#ProductDetail" ng-click="ProductDetailInfo('+aData.id+');"><i class="fa fa-eye"></i></a>'
                           '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="IrrigationDetailInfo('+aData.id+',\'edit\');"><i class="fa fa-pencil"></i></a>'
                         + '<a class="btn-floating btn-sm red darken-3 waves-effect waves-light" data-toggle="modal" data-target="#ConfirmDel" ng-click="ConfirmDelete('+aData.id+',\'' +aData.name+'\');"><i class="fa fa-trash"></i></a>';

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

        // Data table initial
        setTimeout( function () {
            $('#table_data_irrigation').DataTable().ajax.reload();
        }, 300 );
    }

    // delete
    $scope.ConfirmDelete = function(id,data){
        $scope.del_id = id;
        $scope.del_data = data;
    }

    $scope.DeleteData = function(id){
        $http({
            method: 'DELETE',
            url: url + '/irrigation_info/'+ id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var data = response.data;
            if(data.status == "error"){
                toastr["warning"](data.error);
            }else{
                $('#table_data_irrigation').DataTable().ajax.reload();
            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.CheckCookies = function(){
        if($cookies.get('api_token') == "" || $cookies.get('api_token')==null){
            window.location.href = "../index.html";
        }
    }

    // form
    var $form_add_data_irrigaiton = $("#form_add_data_irrigation");
    $form_add_data_irrigaiton.validate({
        errorElement: 'span', // default input error message container
        errorClass: 'red-text', // default input error message class
        focusInvalid: false, // do not focus the last invalid input
        messages: { // custom messages for radio buttons and checkboxes

        },
        invalidHandler: function(event, validator) { //display error alert on form submit
        },
        errorPlacement: function(error, element){
            error.insertAfter(element);
        },
        highlight: function(element) { // hightlight error inputs
            $(element).closest('.form-group').removeClass('has-success').addClass('has-error'); // set error class to the control group

        },
        unhighlight: function(element) { // revert the change done by hightlight
            $(element).closest('.form-group').removeClass('has-error'); // set error class to the control group

        },
        success: function(label) {
            label.addClass('valid') // mark the current input as valid and display OK icon
                 .closest('.form-group').removeClass('has-error').addClass('has-success'); // set success class to the control group
        },
        submitHandler: function(form) {
        }
    });
    // --------------------map-------------------------
    $scope.getCurrentlocation = function (event) {
        $scope.gps_lat = event.latLng.lat();
        $scope.gps_long = event.latLng.lng();
        reverseGeocode(event.latLng.lat(), event.latLng.lng());
    };
    function reverseGeocode(lat, lng) {
        var geocoder = new google.maps.Geocoder();
        var latlng = new google.maps.LatLng(lat, lng);

        geocoder.geocode({'latLng': latlng}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    //$scope.user_data.location_remark = results[1].formatted_address;
                } else {
                    toastr["warning"]('Location not found');
                }
            } else {
                toastr["warning"]('Geocoder failed due to: ' + status);
            }
        });
    };    
    // ----------------------------------------

    $scope.clearData = function(){ //clear form
        $scope.id = "";
        $scope.name = "";
        $scope.gps_lat = "";
        $scope.gps_long = "";
        $scope.capacity = "";
        $scope.surface_area = "";
        $scope.remark = "";
        $scope.gps_lat = null;
        $scope.gps_long = null;
        $scope.hasSubmit=false;
        initItemSet();

    }

    $scope.showFormAddProduct = function(cmd){ //show forms
        $scope.clearData();
        $scope.div_table_data_irrigation = 0;
        $scope.div_add_data_irrigation = 1;
        $scope.btn_menu_add = 0;
        $scope.form_cmd = cmd;
    }

    $scope.showTableProduct = function(){ //close form
        $scope.div_table_data_irrigation = 1;
        $scope.div_add_data_irrigation = 0;
        $scope.btn_menu_add = 1;
    }

    $scope.loadDataIrrigationType = function(){
        $http({
            method: 'GET',
            url: url + '/irrigation_type',
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.irrigation_type = res.data;
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.SubmitForm = function(id){ //submit
//        if($form_add_data_irrigaiton.validate().form()){
//            if($scope.form_cmd == "add"){
//                $scope.AddProduct();
//            }else{
//                $scope.UpdateProduct(id);
//            }
//        }

        if($scope.form_cmd == "add"){
            $scope.AddProduct();
        }else{
            $scope.UpdateProduct(id);
        }

    }

    $scope.AddProduct = function(){
       $scope.irrigationItem.gps_lat = $scope.gps_lat ;
       $scope.irrigationItem.gps_long = $scope.gps_long ;
       $scope.irrigationItem.irrigation_type_id = $('#select_irrigation_type').val();
        $http({
                method: 'POST',
                url: url + '/irrigation_info',
                dataType: "json",
                //data: {"name" : $scope.name_irrigation,"gps_lat" :$scope.gps_lat,"gps_long" :$scope.gps_long,"capacity" :$scope.capacity,"surface_area" :$scope.surface_area,"irrigation_type_id" : $('#select_irrigation_type').val(),"remark" :$scope.remark}, //forms user object
                //headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
                data: $scope.irrigationItem,
                headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
            }).then(function onSuccess(response) {
                var data = response.data;
                if(data.status == "error"){
                    toastr["warning"](data.error);
                }else{
                    $scope.showTableProduct();
                    $('#table_data_irrigation').DataTable().ajax.reload();
                }
            }, function onError(response) {
                $scope.hasSubmit=true;
                toastr["warning"]("system error");
        });
    }

        //Edit
    $scope.IrrigationDetailInfo = function(id){
        $http({
            method: 'GET',
            url: url + '/irrigation_info/'+id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var data = response.data;
            if(data.status == "error"){
                toastr["warning"](data.error);
            }else{
                var ret = data.data[0];
                $scope.showFormAddProduct("edit");
                $scope.id = ret.id;
                $scope.name = ret.name ;
                $scope.gps_lat = ret.gps_lat ;
                $scope.gps_long = ret.gps_long ;
                $scope.capacity = ret.capacity ;
                $scope.surface_area = ret.surface_area;
                $scope.remark = ret.remark;

                $scope.irrigationItem = data.data[0];

                if($scope.gps_lat == null && $scope.gps_long == null){
                    $scope.irrigationItem.id = false ;
                }

                setTimeout(function () {
                        $("#select_irrigation_type").find('option').get(0).remove();// Fix angular bug
                        initMaterialSelect('#select_irrigation_type', $scope.irrigationItem.irrigation_type_id);
                }, 500);
            }

//            setTimeout(function () {
//
//                NgMap.getMap({id: 'MapDetailAgriculture'}).then(function (map) {
//                    google.maps.event.trigger(map, 'resize');
//                    // map.setCenter(center);
//                })
//            }, 500);

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.UpdateProduct = function(id){
        $scope.irrigationItem.gps_lat = $scope.gps_lat ;
        $scope.irrigationItem.gps_long = $scope.gps_long ;
        $scope.irrigationItem.irrigation_type_id = $('#select_irrigation_type').val();
        $http({
                method: 'PUT',
                url: url + '/irrigation_info/' + id,
                dataType: "json",
                data: $scope.irrigationItem,
                headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
            }).then(function onSuccess(response) {
                var data = response.data;
                if(data.status == "error"){
                    toastr["warning"](data.error);
                }else{
                    $scope.showTableProduct();
                    $('#table_data_irrigation').DataTable().ajax.reload();
                }
            }, function onError(response) {
                toastr["warning"]("system error");
        });
    }


});
