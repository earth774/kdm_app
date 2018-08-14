

app.controller("LoginCtrl", function ($scope, $http, $cookies) {

    $scope.handleLoginDashboard = function(){
        // Support login from client dashboard
        if (document.URL.indexOf("?") > 0) {
    
          let splitURL = document.URL.split("?");    
          let splitParams = splitURL[1].split("&");
          let singleURLParam = splitParams[0].split('=');
    
          if(singleURLParam[0] == 'otp'){
            let otp = singleURLParam[1];
            
            $http({
                method: 'GET',
                url: usrm_api_url + '/user_otp/base/' + otp,
                dataType: "json",
                headers: {'Content-Type': 'application/json'}
            }).then(function onSuccess(response) {
                var data = response.data;
                if(data.status == "error"){
                    $error_login.show();
                    $error_login.html(data.error);
                }else{

                    $cookies.put('api_token',data.data.api_token, {
                                        expires: exp
                                      });
                    $cookies.put('user_role_id',data.data.user_role_id, {
                                        expires: exp
                                      });
                    $cookies.put('user_id',data.data.id, {
                                        expires: exp
                                      });
                    window.location.href = "./view/index.html";
                }
            }, function onError(response) {
                toastr["warning"]("system error");
            });            
            return true;       
          }else{
            return false;
          }
        }else{
          return false;
        }
    }    

    $scope.handleLoginDashboard();
    navigator.geolocation.getCurrentPosition(function (pos) {

        var position = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        console.log(JSON.stringify(position));
        //alert(JSON.stringify(position));
        var convert = JSON.parse(JSON.stringify(position)); 
        window.localStorage.setItem("gps_lat", convert.lat);
        window.localStorage.setItem("gps_long", convert.lng);

    });    

    var now = new Date(),
    // this will set the expiration to 6 months
    exp = new Date(now.getFullYear(), now.getMonth()+6, now.getDate());
    var $form_login = $("#form_login");
    var $error_login = $("#error_login");

    $form_login.validate({
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

    $scope.login = function(){
        if($form_login.validate().form()){

            $http({
                method: 'PUT',
                url: url + '/user/authen',
                dataType: "json",
                data: {"username" : $scope.username, "password" : $scope.password}, //forms user object
                headers: {'Content-Type': 'application/json'}
            }).then(function onSuccess(response) {
                var data = response.data;
                if(data.status == "error"){
                    $error_login.show();
                    $error_login.html(data.error);
                }else{

                    $cookies.put('api_token',data.data.api_token, {
                                        expires: exp
                                      });
                    $cookies.put('user_role_id',data.data.user_role_id, {
                                        expires: exp
                                      });
                    $cookies.put('user_id',data.data.id, {
                                        expires: exp
                                      });
                    window.location.href = "./view/index.html";
                }
            }, function onError(response) {
                toastr["warning"]("system error");
            });
        }
    }
});
