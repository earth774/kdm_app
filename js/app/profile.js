/**
 * 
 * 
 * @author Chanwoot  See-ngam <chanwoot2536@gmail.com>
 * 
 */

app.controller("ProfileCtrl", function ($scope, $http, $cookies) {
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
    
    $scope.clearData = function(){
        $scope.id = "";
        $scope.username = "";
        $scope.password = "";
        $scope.fullname = "";
        $scope.email = "";
        $scope.user_role_id = "";
    }
    
    $scope.CheckCookies = function(){
        if($cookies.get('api_token') == "" || $cookies.get('api_token')==null){
            window.location.href = "index.html";
        }
    }
    
    $scope.AccountInfo = function(){
        $http({
            method: 'GET',
            url: url + '/user/'+$cookies.get('user_id'),
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var data = response.data;
            if(data.status == "error"){
                toastr["warning"](data.error);
            }else{
                var ret = data.data[0];
                $scope.id = ret.id;
                $scope.username = ret.username;
                $scope.password = ret.password;
                $scope.fullname = ret.fullname;
                $scope.email = ret.email;
                $scope.user_role_id = ret.user_role_id;
                
                
            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });   
    }
    
    $scope.SubmitForm = function(account_id){
        if($form_add_account.validate().form()){
            $scope.UpdateAccount(account_id);
        }
    }
    
    
    $scope.UpdateAccount = function(account_id){
        $http({
                method: 'PUT',
                url: url + '/user/'+account_id,
                dataType: "json",
                data: {"username" : $scope.username, "password" : $scope.password,
                        "fullname" : $scope.fullname, "email" : $scope.email,
                        "user_role_id" : $scope.user_role_id}, //forms user object
                headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
            }).then(function onSuccess(response) {
                var data = response.data;
                if(data.status == "error"){
                    toastr["warning"](data.error);
                }else{
                    toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                }
            }, function onError(response) {
                toastr["warning"]("system error");
            });
    }
    
    
});