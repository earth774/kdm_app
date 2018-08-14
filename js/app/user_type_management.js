
app.controller("UserTypeManagementCtrl", function ($scope, $http, $cookieStore) {

    $scope.CheckCookies = function(){
        if($cookieStore.get('api_token') == "" || $cookieStore.get('api_token')==null){
            window.location.href = "index.html";
        }
    }
});