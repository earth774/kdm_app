
/**
 * 
 * 
 * @author Chanwoot  See-ngam <chanwoot2536@gmail.com>
 * 
 */


// For getting select value
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

app.controller("MasterDataProductCtrl", function ($scope, $http, $cookies, $compile) {
    $scope.div_table_data_product = 1;
    $scope.btn_menu_add = 1;
    $scope.div_add_data_product = 0;
    $scope.form_cmd = "";

    $scope.funcGetDataTable = function(){
        // AJAX method for dataTables.
        $scope.ajaxOptions = {
            "ajax": {
                "url": url + '/product_info',
                "beforeSend" : function (request) {
                        request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                { "data": "name" },
                { "data": "unit" },
                {
                    "mRender": function () {
                        return "";
                    }
                },            
            ],
            "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    var html = //'<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" data-toggle="modal" data-target="#ProductDetail" ng-click="ProductDetailInfo('+aData.id+');"><i class="fa fa-eye"></i></a>'
                           '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="ProductDetailInfo('+aData.id+',\'edit\');"><i class="fa fa-pencil"></i></a>'
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
            $('#table_data_product').DataTable().ajax.reload();
        }, 300 );
    }
    
    
    var $form_add_data_product = $("#form_add_data_product");    
    $form_add_data_product.validate({
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

    $scope.clearData = function(){
        $scope.id = "";
        $scope.name = "";
        $scope.unit = "";   
        $('#select_resource_info').val('');
        $('#select_breed').val('');    
        clearMaterialSelect('#select_resource_info');
        clearMaterialSelect('#select_breed');

        $scope.resource_info = '';
        $scope.resource_info_id = "";
        $scope.resource_info_explanation = "";
        $scope.breed_info_id = "";
        $scope.breed_info_explanation = ""; 
    }
    
    $scope.CheckCookies = function(){
        if($cookies.get('api_token') == "" || $cookies.get('api_token')==null){
            window.location.href = "../index.html";
        }
    }
    
    $scope.showFormAddProduct = function(cmd){
        $scope.clearData();
        $scope.loadDataResource();
        $scope.div_table_data_product = 0;
        $scope.div_add_data_product = 1;
        $scope.btn_menu_add = 0;
        $scope.form_cmd = cmd;
    }
    
    $scope.showTableProduct = function(){
        $scope.div_table_data_product = 1;
        $scope.div_add_data_product = 0;
        $scope.btn_menu_add = 1;
        $scope.breed_info = null;
        $scope.resource_info_id = null;
        $scope.hasSubmit = false;
    }

    $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
        
        setTimeout(function () {
            initMaterialSelect('#select_resource_info');
            initMaterialSelect('#select_breed');
            checkselectoption();
        }, 500);
    });

    function checkselectoption() {
        if ($scope.resource_info_id != null) {
            initMaterialSelect('#select_resource_info', $scope.resource_info_id);
        }
        if ($scope.breed_info_id != null) {
            initMaterialSelect('#select_breed', $scope.breed_info_id);
        }
    }
    
    $scope.ProductDetailInfo = function(id){
        if(id != 0){
            $http({
                method: 'GET',
                url: url + '/product_info/'+id,
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
                    $scope.name = ret.name;
                    $scope.unit = ret.unit;
                    $scope.resource_info_id = ret.resource_info_id;
                    $scope.resource_info_explanation = ret.resource_info_explanation;
                    $scope.funcGetBreedInfo($scope.resource_info_id);
                    $scope.breed_info_id = ret.breed_info_id;
                    $scope.breed_info_explanation = ret.breed_info_explanation;
                    initMaterialSelect($('#select_resource_info'), ret.resource_info_id);
                    initMaterialSelect($('#select_breed'), ret.breed_info_id);
                }
            }, function onError(response) {
                toastr["warning"]("system error");
            });   
        }else{
            alert("ไม่สามรถแก้ไขข้อมูลนี้ได้")
        }
        
    }
    
    $scope.ResourceDetailInfo = function(id){
        $http({
            method: 'GET',
            url: url + '/resource_info/'+id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var data = response.data;
            if(data.status == "error"){
                toastr["warning"](data.error);
            }else{
                var ret = data.data[0];
                $scope.resource_info_name = ret.name;                
            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });   
    }
    
    $scope.loadDataResource = function(){
        $http({
            method: 'GET',
            url: url + '/resource_info',
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var data = response.data;
            if(data.status == "error"){
                toastr["warning"](data.error);
            }else{
                $scope.resource_info = data.data;
                setTimeout(function () {
                    if($scope.resource_info_id == "" && $scope.resource_info_id != "0"){
                        $( "#select_resource_info_select2_show" ).val("").change();
                    }
                 }, 100);
            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });   
    }

    $scope.funcGetBreedInfo = function (resource_info_id) {
        $http({
            method: 'GET',
            url: url + '/breed_info/resource/' + resource_info_id,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.breed_info = res.data;
            // console.log($scope.breed_info);

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    
    $scope.SubmitForm = function(id){
        if($form_add_data_product.validate().form()){
            if($scope.form_cmd == "add"){
                $scope.AddProduct();
            }else{
                $scope.UpdateProduct(id);
            }
        }
    }

    $scope.ConfirmDelete = function(id,data){
        $scope.del_id = id;
        $scope.del_data = data;
    }

    $scope.DeleteData = function(id){
        if(id != '0'){
            $http({
                method: 'DELETE',
                url: url + '/product_info/'+ id,
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
            }).then(function onSuccess(response) {
                    var data = response.data;
                if(data.status == "error"){
                    toastr["warning"](data.error);
                }else{
                    $('#table_data_product').DataTable().ajax.reload();
                }
            }, function onError(response) {
                toastr["warning"]("system error");
            });
        }else{
            alert("ไม่สามารถลบข้อมูลนี้ได้")
        }
    }
    
    $scope.AddProduct = function(){
        if($scope.resource_info_id != null && $scope.breed_info_id != null){
            if($scope.resource_info_id != 0 || $scope.resource_info_explanation != null){
                if($scope.breed_info_id != 0 || $scope.breed_info_explanation != null){
                    $http({
                            method: 'POST',
                            url: url + '/product_info',
                            dataType: "json",
                            data: { "name" : $scope.name, 
                                    "unit" : $scope.unit, 
                                    "resource_info_id" : $('#select_resource_info').val(), 
                                    'resource_info_explanation': $scope.resource_info_explanation,
                                    "breed_info_id" : $('#select_breed_select2_show').val(),
                                    'breed_info_explanation': $scope.breed_info_explanation}, //forms user object
                            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
                        }).then(function onSuccess(response) {
                            var data = response.data;
                            if(data.status == "error"){
                                toastr["warning"](data.error);
                            }else{
                                $scope.showTableProduct();
                                $('#table_data_product').DataTable().ajax.reload();
                            }
                        }, function onError(response) {
                            toastr["warning"]("system error");
                    });
                }
            }
        }
    }

    $scope.UpdateProduct = function(id){
        if($scope.resource_info_id != null && $scope.breed_info_id != null){
            if($scope.resource_info_id != 0 || $scope.resource_info_explanation != null){
                if($scope.breed_info_id != 0 || $scope.breed_info_explanation != null){
                    $http({
                            method: 'PUT',
                            url: url + '/product_info/' + id,
                            dataType: "json",
                            data: { "name" : $scope.name, 
                                    "unit" : $scope.unit, 
                                    "resource_info_id" : $('#select_resource_info').val(),
                                    'resource_info_explanation': $scope.resource_info_explanation, 
                                    "breed_info_id" : $('#select_breed').val(),
                                    'breed_info_explanation': $scope.breed_info_explanation}, //forms user object
                            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
                        }).then(function onSuccess(response) {
                            var data = response.data;
                            if(data.status == "error"){
                                toastr["warning"](data.error);
                            }else{
                                $scope.showTableProduct();
                                $('#table_data_product').DataTable().ajax.reload();
                            }
                        }, function onError(response) {
                            toastr["warning"]("system error");
                    });
                }
            }
        }
    }
});