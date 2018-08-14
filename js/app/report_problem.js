app.controller("ReportProblemCtrl", function ($scope, $cookies,$http,Upload) {

    $scope.CheckCookies = function(){
        if($cookies.get('api_token') == "" || $cookies.get('api_token')==null){
            window.location.href = "../index.html";
        }
    }
    $scope.user_id = $cookies.get('user_id');
    $scope.file = null;
    $scope.getUserAgent = function () {
        var parser = new UAParser();
        var Obj_agent = parser.getResult();
        return JSON.stringify(Obj_agent);
    }
    $scope.uploadFile = function () {

            if ($scope.file) {
                Upload.upload({
                    method: 'POST',
                    url: url + "/report_problem_info",
                    headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')},
                    data: {
                        file: $scope.file,
                        title: $scope.title,
                        content: $scope.content,
                        user_id: $scope.user_id,
                        user_agent:  $scope.getUserAgent()
                    }
                }).then(function (response) {
                    toastr["success"]("แจ้งปัญหาให้ทีมงานเรียบร้อยแล้ว");
                    $scope.file=null;
                    document.getElementById('filename').value = '';
                }, function (err) {
                    toastr["warning"]('เกิดข้อผิดพลาด อัพโหลดไฟล์ไม่สำเร็จ');
                }).catch(function (e) {
                    toastr["warning"](e);
                });
            }else{
                $http({
                        method: 'POST',
                        url: url + '/report_problem_info',
                        dataType: "json",
                        data: {
                            title: $scope.title,
                            content: $scope.content,
                            user_id: $scope.user_id,
                            user_agent:  $scope.getUserAgent()
                        },
                        headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
                    }).then(function onSuccess(response) {
                        var data = response.data;
                        if(data.status == "error"){
                            toastr["warning"](data.error);
                        }else{
                            toastr["success"]("แจ้งปัญหาให้ทีมงานเรียบร้อยแล้ว");
                            $scope.file=null;
                            document.getElementById('filename').value = '';
                        }
                    }, function onError(response) {
                        toastr["warning"]("system error");
                });                
            }
        };
});
