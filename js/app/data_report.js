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
app.controller("DataReportCtrl", function ($scope, $http, $cookies, $compile) {
    $scope.div_table_data_report = 1;
    $scope.div_modal_img = 0 ;
    var parser = new UAParser();
    
    setTimeout( function () {
        $('#table_data_report').DataTable().ajax.reload();
    }, 500 );
    
    // AJAX method for dataTables.
    $scope.ajaxOptions = {
        "ajax": {
            "url": url + '/report_problem_info',
            "beforeSend" : function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
            }
        },
        "columns": [
            { "data": "created_at" },
            { "data": "user_id" },
            { "data": "title" },
            { "data": 'user_agent',
                "mRender": function (data) {
                    var os = " ";
                    if(data !== null && data != ""){
                        parser.setUA(data);
                        var result = parser.getResult();
                        os = result.os.name;
                    }
                    return os;
                }
            },
            {
                "mRender": function () {
                    return "";
                }
            },
        ],
        "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                var html = '<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" data-toggle="modal" data-target="#DataReportModal" ng-click="dataReportView('+aData.id+');"><i class="fa fa-eye"></i></a>'
                           //'<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="PlantAnimalDetailInfo('+aData.id+',\'edit\');"><i class="fa fa-pencil"></i></a>'
                         + '<a class="btn-floating btn-sm red darken-3 waves-effect waves-light" data-toggle="modal" data-target="#ConfirmDel" ng-click="ConfirmDelete('+aData.id+',\'' +aData.title+'\');"><i class="fa fa-trash"></i></a>';
                         //+ '<a class="btn-floating btn-sm red darken-3 waves-effect waves-light" data-toggle="modal" data-target="#ConfirmDel" ng-click="ConfirmDelete('+aData.id+',\'' +aData.name+'\');"><i class="fa fa-trash"></i></a>';

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
    
    $scope.dataReportView = function(id){
      $scope.objDataReport = {};
        $http({
            method: 'GET',
            url: url + '/report_problem_info/'+id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.objDataReport = res.data[0];
            
            //download file
            var str = res.data[0].upload_path.substring(res.data[0].upload_path.length -3, res.data[0].upload_path.length);
            str = str.toLowerCase();
            
            if(res.data[0].upload_path == ""){
                $scope.div_modal_img = 0 ;
                $scope.div_modal_audio = 0 ;
                $scope.div_modal_video = 0 ;                
            }else{
                if(str == "png" || str == "jpg"){
                    $scope.div_modal_img = 1 ;
                    $scope.div_modal_audio = 0 ;
                    $scope.div_modal_video = 0 ;

                    $("#aTagDownload").attr('href', url+"../../../"+res.data[0].upload_path);
                    $("#btnTagDownload").attr('href', url+"../../../"+res.data[0].upload_path);
                    $("#imgTagDownload").attr('src', url+"../../../"+res.data[0].upload_path);
                }else if(str == "mp3" ){
                    $scope.div_modal_img = 0 ;
                    $scope.div_modal_audio = 1 ;
                    $scope.div_modal_video = 0 ;

                    $("#audioPathDownload").attr('src', url+"../../../"+res.data[0].upload_path);
                    $("#tagAudioPathDownload").attr('href', url+"../../../"+res.data[0].upload_path);
                }else if(str == "mp4" || str == "avi"){
                    $scope.div_modal_img = 0 ;
                    $scope.div_modal_audio = 0 ;
                    $scope.div_modal_video = 1 ;

                    $("#videoPathDownload").attr('src', url+"../../../"+res.data[0].upload_path);
                    $("#tagVideoPathDownload").attr('href', url+"../../../"+res.data[0].upload_path);
                }                
            }
            

            if(res.data[0].user_agent !== null){
                parser.setUA(res.data[0].user_agent);
                $scope.objUserAgent = parser.getResult(); 
            }
            

        }, function onError(response) {
            toastr["warning"]("system error");
        });  
    }

    $scope.ConfirmDelete = function(id,data){
        $scope.del_id = id;
        $scope.del_data = data;
    }

    $scope.DeleteData = function(id){
        $http({
            method: 'DELETE',
            url: url + '/report_problem_info/'+ id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var data = response.data;
            if(data.status == "error"){
                toastr["warning"](data.error);
            }else{
                $('#table_data_report').DataTable().ajax.reload();
            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    
    $('#DataReportModal').modal({
        show: false
    }).on('hidden.bs.modal', function(){
        $(this).find('audio')[0].pause();
        $(this).find('video')[0].pause();
    });
});