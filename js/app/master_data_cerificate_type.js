
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

app.controller("MasterDataCerificateTypeCtrl", function ($scope, $http, $cookies, $compile) {

    $scope.div_table_data_certificate = 1;
    $scope.btn_menu_add = 1;
    $scope.div_add_data_certificate = 0;
    $scope.form_cmd = "";

    setTimeout( function () {
        $('#table_data_certificate').DataTable().ajax.reload();
    }, 1000 );

    // AJAX method for dataTables.        
    $scope.ajaxOptions = {
        "ajax": {
            "url": url + '/cerificate_type',
            "beforeSend" : function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
            }
        },
        "columns": [
            { "data": "name" },
            {
                "mRender": function () {
                    return "";
                }
            },
        ],
        "fnDrawCallback": function (oSettings, json){
            initMaterialSelectDataTable();
        },
        "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {
            var html = //'<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" data-toggle="modal" data-target="#ProductDetail" ng-click="ProductDetailInfo('+aData.id+');"><i class="fa fa-eye"></i></a>'
                   '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="CertificateType('+aData.id+',\'edit\');"><i class="fa fa-pencil"></i></a>'
                 + '<a class="btn-floating btn-sm red darken-3 waves-effect waves-light" data-toggle="modal" data-target="#ConfirmDel" ng-click="ConfirmDelete('+aData.id+',\'' +aData.name+'\');"><i class="fa fa-trash"></i></a>';

            var last_row = $("td:last", nRow);
            if(  ! last_row.html() ){
                angular.element(last_row).append( $compile(html)($scope) )
            }
            $(nRow).attr("id",'row_' + aData.id);
            return nRow;
        },
    };

    var $form_add_data_certificate = $("#form_add_data_certificate");

    $form_add_data_certificate.validate({
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
    }

    $scope.CheckCookies = function(){
        if($cookies.get('api_token') == "" || $cookies.get('api_token')==null){
            window.location.href = "../index.html";
        }
    }

    $scope.loadDataTable = function(){
        $http({
            method: 'GET',
            url: url + '/cerificate_type',
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var data = response.data;
            if(data.status == "error"){
                toastr["warning"](data.error);
            }else{
                $scope.certificate = data.data;
            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.showFormAddCertificate = function(cmd){
        $scope.clearData();
        $scope.div_table_data_certificate = 0;
        $scope.div_add_data_certificate = 1;
        $scope.btn_menu_add = 0;
        $scope.form_cmd = cmd;
        
    }

    $scope.showTableCertificate = function(){
        $scope.div_table_data_certificate = 1;
        $scope.div_add_data_certificate = 0;
        $scope.btn_menu_add = 1;
    }

    $scope.CertificateType = function(id){
        $http({
            method: 'GET',
            url: url + '/cerificate_type/'+id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var data = response.data;
            if(data.status == "error"){
                toastr["warning"](data.error);
            }else{
                var ret = data.data[0];
                $scope.showFormAddCertificate("edit");
                $scope.id = ret.id;
                $scope.name = ret.name;
            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.SubmitForm = function(id){
        if($form_add_data_certificate.validate().form()){
            if($scope.form_cmd == "add"){
                $scope.AddCertificate();
            }else{
                $scope.UpdateCertificate(id);
            }
        }
    }

    $scope.ConfirmDelete = function(id,data){
        $scope.del_id = id;
        $scope.del_data = data;
    }

    $scope.DeleteData = function(id){
        $http({
            method: 'DELETE',
            url: url + '/cerificate_type/'+ id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var data = response.data;
            if(data.status == "error"){
                toastr["warning"](data.error);
            }else{
                $('#table_data_certificate').DataTable().ajax.reload();
            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.AddCertificate = function(){
        $http({
                method: 'POST',
                url: url + '/cerificate_type',
                dataType: "json",
                data: {"name" : $scope.name}, //forms user object
                headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
            }).then(function onSuccess(response) {
                var data = response.data;
                if(data.status == "error"){
                    toastr["warning"](data.error);
                }else{
                    //$scope.loadDataTable();
                    $scope.showTableCertificate();
                    $('#table_data_certificate').DataTable().ajax.reload();
                }
            }, function onError(response) {
                toastr["warning"]("system error");
        });
    }

    $scope.UpdateCertificate = function(id){
        $http({
                method: 'PUT',
                url: url + '/cerificate_type/' + id,
                dataType: "json",
                data: {"name" : $scope.name}, //forms user object
                headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
            }).then(function onSuccess(response) {
                var data = response.data;
                if(data.status == "error"){
                    toastr["warning"](data.error);
                }else{
                    //$scope.loadDataTable();
                    $scope.showTableCertificate();
                    $('#table_data_certificate').DataTable().ajax.reload();
                }
            }, function onError(response) {
                toastr["warning"]("system error");
        });
    }
});