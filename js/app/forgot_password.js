

app.controller("ForgotPasswordCtrl", function ($scope, $http, $cookies) {

    var $Form_forgot_password = $("#Form_forgot_password");

    $Form_forgot_password.validate({
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

    $scope.checkdata = function(email){
        // console.log($scope.email);
        if($Form_forgot_password.validate().form()){

            $http({
                method: 'GET',
                url: url + '/forgot_password?email='+ email,
            }).then(function onSuccess(response) {
                var data = response.data;
                if(data.status == "error"){
                   toastr["warning"]("อีเมล์ไม่ถูกต้อง");
                }else{
                   toastr["success"]("ส่งรหัสผ่านใหม่ไปยังอีเมล์ของท่านแล้ว");
                }
            }, function onError(response) {
                toastr["warning"]("system error");
            });
        }
    }
});
