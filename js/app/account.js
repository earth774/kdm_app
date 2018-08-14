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

app.controller("AccountCtrl", function ($scope, $http, $cookies, $compile) {
    $scope.form_cmd = "";
    $scope.div_table_account = 1;
    $scope.btn_menu_add = 1;
    $scope.div_add_account = 0;    
    var user_type_list_rendered = false;
    
    var $form_add_account = $("#form_add_account");
    
    $form_add_account.validate({
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

    $scope.$on('ngRepeatFinishedUserTypeList', function(ngRepeatFinishedEvent) {
        user_type_list_rendered = true;
        $scope.setUserTypeList();
    });

    $scope.clearData = function(){
        $scope.id = "";
        $scope.username = "";
        $scope.password = "";
        $scope.fullname = "";
        $scope.email = "";
        $scope.form_cmd = "";
        initMaterialSelect($("#select_user_role"), 4);
        $scope.div_user_type = true;
    }
    
    $scope.showFormAddAccount = function(){
        $scope.clearData();
        $scope.div_table_account = 0;
        $scope.div_add_account = 1;
        $scope.btn_menu_add = 0;
        $scope.form_cmd = "add";
        $scope.resetUserTypeList();
    }
    
    $scope.showTableAccount = function(){
        $scope.div_table_account = 1;
        $scope.div_add_account = 0;
        $scope.btn_menu_add = 1;
        $scope.form_cmd = "";
    }
    
    $scope.CheckCookies = function(){
        if($cookies.get('api_token') == "" || $cookies.get('api_token')==null){
            window.location.href = "index.html";
        }
    }

    // AJAX method for dataTables.
    $scope.ajaxOptions = {
        "ajax": {
            "url": url + '/user',
            "beforeSend" : function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
            }
        },
        "columns": [
            { "data": "username" },
            { "data": "fullname" },
            { "data": "email" },
            {
                "mRender": function () {
                    return "";
                }
            },
        ],
        "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                var html = //'<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" data-toggle="modal" data-target="#AccountDetail" ng-click="AccountInfo('+aData.id+',\'view\');"><i class="fa fa-eye"></i></a>'
                           '<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" ng-click="AccountInfo('+aData.id+',\'view\');"><i class="fa fa-eye"></i></a>'
                         + '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="AccountInfo('+aData.id+',\'edit\');"><i class="fa fa-pencil"></i></a>'
                         + '<a class="btn-floating btn-sm red darken-3 waves-effect waves-light" data-toggle="modal" data-target="#ConfirmDel" ng-click="ConfirmDelete('+aData.id+',\'' +aData.username+'\');"><i class="fa fa-trash"></i></a>';

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
    $.fn.dataTable.ext.errMode = 'throw';

    // Data table initial
    setTimeout( function () {
        // AJAX method for dataTables.
    $('#table_account').DataTable().ajax.reload();
    }, 500 );

    $scope.loadUserTypeList = function(){
        $http({
            method: 'GET',
            url: url + '/register/user_type',
            dataType: "json",
            headers: {'Content-Type': 'application/json'}
        }).then(function onSuccess(response) {
            var data = response.data;
            if(data.status == "error"){
                toastr["warning"](data.error);
            }else{
                $scope.userType = data.data;

            }
        }, function onError(response){
                toastr["warning"]("system error");
        });
    }   
    $scope.loadUserTypeList();    
    
    $scope.resetUserTypeList = function(){
        var data = $(".checkUser");
        for(var i = 0; i < data.length; i++){
            data[i].checked = false;
        }
    }

    $scope.setUserTypeList = function(){
        if($scope.form_cmd == "edit" || $scope.form_cmd == "view"){
            angular.forEach($scope.user_type_list, function(item){
                $(".checkUser#"+item.user_type_id).prop('checked', true);
            });
        }
    }

    $scope.getUserForm = function(){
        $scope.userJsonData = [];
        var data = $(".checkUser");
        for(var i = 0; i < data.length; i++){
            if(data[i].checked == true){
                $scope.userJsonData.push({'user_type_id': data[i].id});
            }
        }
        return $scope.userJsonData ;
    }


    $scope.loadUserTypeList = function(){
        $http({
            method: 'GET',
            url: url + '/user_type',
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var data = response.data;
            if(data.status == "error"){
                toastr["warning"](data.error);
            }else{
                $scope.userType = data.data;
            }
        }, function onError(response){
                toastr["warning"]("system error");
        });
    }

    $scope.check_role = function(){
        $scope.div_user_type = $("#select_user_role").val() >= 4;
    }    
    
    $scope.AccountInfo = function(account_id,form_cmd){
        $scope.form_cmd = form_cmd;
        $http({
            method: 'GET',
            url: url + '/user/'+account_id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var data = response.data;
            if(data.status == "error"){
                toastr["warning"](data.error);
            }else{

                //clearMaterialSelect($("#select_user_role"));

                var ret = data.data[0];
                $scope.id = ret.id;
                $scope.username = ret.username;
                $scope.password = ret.password;
                $scope.fullname = ret.fullname;
                $scope.email = ret.email;                

                if(ret.user_role_id == 1){
                    $("#div_user_role").hide();
                }else{
                    $("#div_user_role").show();
                }

                initMaterialSelect('#select_user_role', ret.user_role_id);

                if( $scope.form_cmd == "edit" || $scope.form_cmd == "view"){
                    $scope.div_table_account = 0;
                    $scope.div_add_account = 1;
                    $scope.btn_menu_add = 0;
                    $scope.resetUserTypeList();
                    $scope.user_type_list = data.data.user_type_list;                    
                    $scope.div_user_type = $("#select_user_role").val() >= 4;
                    if(user_type_list_rendered){
                        $scope.setUserTypeList();
                    }
                }
            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });   
    }
    
    $scope.SubmitForm = function(account_id){
        if($form_add_account.validate().form()){
            if($scope.form_cmd == "add"){
                $scope.AddAccount();
            }else{
                $scope.UpdateAccount(account_id);
            }
        }
    }
    
    $scope.AddAccount = function(){

        var user_type_list;
        if($("#select_user_role").val() >= 4){
            user_type_list = $scope.getUserForm();
        }
        
        $http({
                method: 'POST',
                url: url + '/user',
                dataType: "json",
                data: {"username" : $scope.username, "password" : $scope.password,
                        "fullname" : $scope.fullname, "email" : $scope.email,
                        "user_role_id" : $("#select_user_role").val(),
                        "user_type_list" : user_type_list}, //forms user object
                headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
            }).then(function onSuccess(response) {
                var data = response.data;
                if(data.status == "error"){
                    toastr["warning"](data.error);
                }else{
                    $scope.showTableAccount();
                    $('#table_account').DataTable().ajax.reload();
                }
            }, function onError(response) {
                toastr["warning"]("system error");
            });
    }
    
    $scope.UpdateAccount = function(account_id){

        var user_type_list;
        if($("#select_user_role").val() >= 4){
            user_type_list = $scope.getUserForm();
        }
        
        $http({
                method: 'PUT',
                url: url + '/user/'+account_id,
                dataType: "json",
                data: {"username" : $scope.username, "password" : $scope.password,
                        "fullname" : $scope.fullname, "email" : $scope.email,
                        "user_role_id" : $("#select_user_role").val(),
                        "user_type_list" : user_type_list}, //forms user object
                headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
            }).then(function onSuccess(response) {
                var data = response.data;
                if(data.status == "error"){
                    toastr["warning"](data.error);
                }else{
                    $('#table_account').DataTable().ajax.reload();
                    $scope.showTableAccount();
                }
            }, function onError(response) {
                toastr["warning"]("system error");
            });
    }
    
    $scope.ConfirmDelete = function(id,data){
        $scope.del_id = id;
        $scope.del_data = data;
    }
    
    $scope.DeleteAccount = function(account_id){
        $http({
            method: 'DELETE',
            url: url + '/user/'+account_id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var data = response.data;
            if(data.status == "error"){
                toastr["warning"](data.error);
            }else{
                $('#table_account').DataTable().ajax.reload();
            }
        }, function onError(response) {
            toastr["warning"]("system error");
        }); 
    }
    
    $scope.loadUserRole = function(){
        $http({
            method: 'GET',
            url: url + '/user_role',
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var data = response.data;
            if(data.status == "error"){
                toastr["warning"](data.error);
            }else{
                $scope.user_role = data.data;
            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });   
    }
    
    
});