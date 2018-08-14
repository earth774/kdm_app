app.controller("RegisterCtrl", function ($scope, $http, $cookies) {
  $scope.$on('ngRepeatFinishedUserTypeList', function (ngRepeatFinishedEvent) {
    user_type_list_rendered = true;
    $scope.setUserTypeList();
  });

  function initVar() {
    $scope.hasSubmit = false;
    $scope.user_type_list = [];
    $scope.dataregis = {
      "username": null,
      "fullname": null,
      "email": null,
      "password": null,
      "user_role_id": "4",
      "user_type_list": []
    };
  }
  initVar();

  $scope.loadUserTypeList = function () {
    $http({
      method: 'GET',
      url: url + '/register/user_type',
      dataType: "json",
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function onSuccess(response) {
      var data = response.data;
      if (data.status == "error") {
        toastr["warning"](data.error);
      } else {
        $scope.userType = data.data;

      }
    }, function onError(response) {
      toastr["warning"]("system error");
    });
  }
  $scope.loadUserTypeList();

  function pushUsertype() {
    $scope.dataregis.user_type_list = [];

    angular.forEach($scope.userType, function (list) {
      if (list.is_check) {
        $scope.dataregis.user_type_list.push({
          'user_type_id': list.id
        });
      }
    });
  }

  $scope.regisUser = function (requir) {
    if (!requir) {

      pushUsertype();
      $http({
        method: 'POST',
        url: url + '/register',
        dataType: "json",
        data: $scope.dataregis,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(function onSuccess(response) {
        var data = response.data;
        if (data.status == "error") {
          toastr["warning"](data.error);
        } else {
          initVar();
          $('#confirmforback').modal('show');
        }
      }, function onError(response) {
        toastr["warning"]("system error");
      });
    }

  }

});