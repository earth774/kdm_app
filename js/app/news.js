
app.controller("NewsCtrl", function ($scope, $http, $cookies,$filter,$compile) {
    $scope.myDropzone = null ;
    $scope.newsId = null ;
    $scope.url = url ;
    var dropzoneStackforDelete = [];
    $scope.CheckCookies = function(){
        if($cookies.get('api_token') == "" || $cookies.get('api_token')==null){
            window.location.href = "../index.html";
        }
    }
    // initial variable
    $scope.user_role_id = $cookies.get('user_role_id');
    $scope.select_page = 'user_news';
    $scope.page_tab = 'table';
    $scope.user_id = $cookies.get('user_id');
    $scope.set_newsid = null ;
    $scope.select = 0 ;
    var $newsOfPage = 5;

     $scope.selectPage = function selectPage(page){
        $scope.select = page ;
        var firstNews ;
        for(var i=0;i<=(page+1)*$newsOfPage;i++){
         firstNews=i-($newsOfPage-1)
        }
        getAllNews(firstNews-1,$newsOfPage)
     }

    $scope.selectFirstPage = function (){
        $scope.select = 0;
        $scope.selectPage(0);
    }

    $scope.selectLastPage = function (){
        var last = $scope.sizeofpage;
        $scope.select = last;
        $scope.selectPage(last);
    }

    $scope.selectPrevious = function (){
        $scope.select = $scope.select-1;
        if ($scope.select>=0) {
        $scope.selectPage($scope.select)
        }else {
            $scope.select = 0;
        }
    }

    $scope.selectNext = function (){
        $scope.select = $scope.select+1;
        if ($scope.select<=$scope.sizeofpage) {
        $scope.selectPage($scope.select)
        }else {
            $scope.select = $scope.sizeofpage;
        }
    }

    $scope.switchPage = function (page) {

        $scope.page_tab = page;
        if ($scope.page_tab == 'table') {
            $scope.funcGetNews();
        }

    }
    $scope.clearData = function () {
        $scope.page_tab = 'table';
        
        initNews();
        clearMaterialSelect('.mdb-select');
    }
    function initNews(){
        $scope.news = {
            "creator_user_id": $scope.user_id,
            "title": null,
            "content": null,
        };
    }
    initNews();
    $scope.clearData();
    // function

    $scope.modalAddnews = function(){
        $('#addNews').modal('show');
    }
    // แสดงข้อมูลหน้า user
    function getAllNews(startNews,newsInOnePage){
        $http({
            method: 'GET',
            url: url + '/news_info/page',
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')},
            params: {startNews: startNews,newsInOnePage: newsInOnePage}
        }).then(function (res,req) {
            if (res.status == "error") {
                alert(res.error);
            } else {
                $scope.list_news = res.data.data;
            }
        }, function (err) {
            alert(err);
        });
    }

    function countPage(){
        $http({
            method: 'GET',
            url: url + '/news_info/count',
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')},
            params:{count:$newsOfPage}
        }).then(function (res) {
            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {
                var size = res.data.data;
                var page = []
                for(var i=0;i<size;i++){
                    page.push(i)
                    $scope.sizeofpage = i;
                }
                $scope.size_page = page;
            }
        }, function (err) {
            toastr["warning"](err);
        });
    }
    countPage();
    //เพิ่มข่าวใหม่
    $scope.funcInsertNews = function(){
        $http({
            method: 'POST',
            url: url + '/news_info',
            dataType: "json",
            data: $scope.news,
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function (res) {
            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {
                toastr["success"]("บันทึกข้อมูลเรียบร้อย");
                $scope.page_tab = 'table';
                // $scope.funcGetNews();
                initNews();
                $scope.set_newsid = res.data.data.id ;
                if($scope.set_newsid !== null){
                     myDropzone.processQueue();
                }
            }
        }, function (err) {
            toastr["warning"]("system error"  + " : กรุณาใส่ข้อมูลให้ครบ");
        });
    }
    //แก้ไขข่าวใหม่
    $scope.funcUpdateNews = function(){
        $http({
            method: 'PUT',
            url: url + '/news_info/'+$scope.news.id,
            dataType: "json",
            data: $scope.news,
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function (res) {
            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {
                toastr["success"]("แก้ไขข้อมูลเรียบร้อย");
                $scope.page_tab = 'table';
                // $scope.funcGetNews();
                initNews();
                
                $scope.set_newsid = res.data.data.id ;
                if($scope.set_newsid !== null){
                     myDropzone.processQueue();
                     $scope.dropzoneDeletefile();
                }
              
            }
        }, function (err) {
            toastr["warning"]("system error"  + " : กรุณาใส่ข้อมูลให้ครบ");
        });
    }
    $scope.funcGetNews = function () {

        // Always reset value in form when show table
        initNews();

        // AJAX method for dataTables.
        $scope.ajaxNewsOptions = {
            "ajax": {
                "url": url + '/news_info',
                "beforeSend": function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
                }
            },
            "columns": [
                {"data": "title"},
                {"data": "content"},
                {"data": "updated_at"},
                {
                    "mRender": function () {
                        return "";
                    }
                },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                var html = '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="detailNews(' + aData.id + ');"><i class="fa fa-pencil"></i></a>' +
                        '<a class="btn-floating btn-sm red darken-3 waves-effect waves-light" ng-click="getDelData(' + aData.id + ');"><i class="fa fa-trash"></i></a>';
                var last_row = $("td:last", nRow);
                if (!last_row.html()) {
                    angular.element(last_row).append($compile(html)($scope))
                }

                $('td', nRow).eq('2').html($filter('limitTo')(aData.import_datetime, 10, 0));
                $(nRow).attr("id", 'row_' + aData.id);
                return nRow;
            },
            "fnDrawCallback": function (oSettings, json) {
                initMaterialSelectDataTable();
            },
        };

        setTimeout(function () {
            $('#table_data_news').DataTable().ajax.reload();
        }, 300);
    }
    // -----------------------------------------------
    $scope.detailNews = function (id) {
        $scope.newsId = id ;
        dropzoneStackforDelete = [];
         
        $http({
            method: 'GET',
            url: url + '/news_info/' + id,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.news = res.data[0];
            $scope.switchPage('form');
        }, function onError(response) {
            toastr["warning"]("system error");
        });  
    };
    // -----------delete alert------------------------
    $scope.getDelData = function (id) {
        $scope.data_alert = {'id': id};
        $('#modalConfirmDelete').modal('show');
    }
    $scope.delData = function (obj) {

        $http({
            method: 'DELETE',
            url: url + '/news_info/' + obj.id,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            if (res.status == "error") {
                toastr["warning"](res.error);
            } else {
                $scope.funcGetNews();
                $('#modalConfirmDelete').modal('hide');

            }

        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }
    
    $scope.dropzoneDeletefile = function(){
        if(dropzoneStackforDelete !== null){
            $http({
                method: 'DELETE',
                url: url + '/news_info_resource/dropzone',
                dataType: "json",
                data : {data : dropzoneStackforDelete },
                headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
            }).then(function onSuccess(response) {
    //            var res = response.data;
    //            if (res.status == "error") {
    //                alert(res.error);
    //            } else {
    //                $scope.funcGetNews();
    //                $('#modalConfirmDelete').modal('hide');
    //
    //            }

            }, function onError(response) {
                toastr["warning"]("system error");
            });

        }
    }
    
    
    $scope.dropzoneLoadfile = function(elemDropzone){
        $http({
            method: 'GET',
            url: url + '/news_info_resource/' + $scope.newsId,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            for (key in res.data) {
                var existingFiles = [{ name: res.data[key].src_filename }];
                path = url+"/../../"+res.data[key].src_path ;
                
                elemDropzone.emit("addedfile", existingFiles[0]);
                elemDropzone.emit("thumbnail",existingFiles[0], url+"/../../"+res.data[key].src_path);
                elemDropzone.emit("complete", existingFiles[0]);
            }
            $(".dropzone .dz-preview .dz-image img").css("width","120%");
        }, function onError(response) {
            toastr["warning"]("system error");
        }); 
    }
    
   $scope.setDropzone = function(){
        Dropzone.autoDiscover = false;

        $scope.myDropzone = new Dropzone("div#mydropzone", {
            url: url +"/news_info_resource/dropzone",
            autoProcessQueue: false, 
            addRemoveLinks: true, //btn remove
            parallelUploads: 100, //limit files upload
            acceptedFiles: "image/*",
            dataType: "HTML",
            maxFilesize: 200, //mb
            //timeout: 180000,
            removedfile: function(file){
                var name = file.name;
                //dropzoneStackforDelete.push({"fileName": name});
                dropzoneStackforDelete.push(name);
                //console.log(dropzoneStackforDelete);
                file.previewElement.remove();
            },
            init: function() {
                myDropzone = this;
                fail_status = 1 ;
                myDropzone.on('sending', function(file, xhr, formData){ //send paramiter 
                    //var set_newsId = $("#set_newsId").val();
                    formData.append('news_info_id', $scope.set_newsid);
                });
                
                myDropzone.on("error", function(file, message) { 
                    toastr["warning"]("เกิดข้อผิดพลาดในการอัพโหลดไฟล์");
                    fail_status = 0 ;
                });
                
                myDropzone.on("complete", function (file) {
                    //myDropzone.removeFile(file);
                    fail_status = 1;                       
                });
                
                myDropzone.on("queuecomplete", function (file) {
                    if (fail_status == 1){
                        //alert('บันทึกข้อมูลเรียบร้อย');
                    }
                });
                
                if($scope.newsId !== null){
                    $scope.dropzoneLoadfile(this);
                    $scope.newsId = null ;
                }
                
                
            }           
        });
       
   }
    $scope.previewNews = function(id,title,content){
        $scope.previewNewTitle = title ;
        $scope.previewNewContent = content ;
        $scope.select_page='previewNews';  
        
        $http({
            method: 'GET',
            url: url + '/news_info_resource/' + id,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
            var res = response.data;
            $scope.list_path = res.data;
            //console.log($scope.list_path);
        }, function onError(response) {
            toastr["warning"]("system error");
        }); 
    }   
  
});
