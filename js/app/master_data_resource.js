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

app.controller("MasterDataResourceCtrl", function ($scope, $http, $cookies, $compile) {
    $scope.div_table_data_plant_animal = 1;
    $scope.btn_menu_add = 1;
    $scope.div_add_data_plant_animal = 0;
    $scope.form_cmd = "";

    setTimeout( function () {
        $('#table_data_plant_animal').DataTable().ajax.reload();
    }, 500 );
    
    //***************** breed ******************************************
    $scope.addBreedData = [];
    $scope.deleteBreedData = [];
    $scope.showBreedData = [];
   
   $scope.addNewBreed = function(data) {
        var name = data.name ;
        if($scope.showBreedData.findIndex(x => x.name== name) === -1) {
            $scope.showBreedData.push({"id" : -1 , "name" : data.name });
            $scope.addBreedData.push({"id" : -1 , "name" : data.name });
            $('#table_data_breed').DataTable().clear().rows.add($scope.showBreedData).draw();
        }else{
            alert("ซ้ำ");
        }
    }
    
    $scope.deleteBreed = function(id,name){
        var index = $scope.showBreedData.findIndex(x => x.name == name) ;
        $scope.showBreedData.splice(index,1);     
        $('#table_data_breed').DataTable().clear().rows.add($scope.showBreedData).draw();
        if(id != -1){
            $scope.deleteBreedData.push({"id" :  id, "name" : name });
        }else{
            var index = $scope.addBreedData.findIndex(x => x.name == name) ;;
            $scope.addBreedData.splice(index,1);
            console.log("test");
            console.log($scope.addBreedData);
        } 
    }
    
    // AJAX method for dataTables breed.
    $scope.ajaxOptionsTableBreed = {
        "data" : $scope.showBreedData,
        "columns": [
            { "data": "name" },
            {
                "mRender": function () {
                    return "";
                }
            },
        ],
        "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                var html = //'<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" data-toggle="modal" data-target="#PlantAnimalDetail" ng-click="PlantAnimalDetailInfo('+aData.id+');"><i class="fa fa-eye"></i></a>'
                           //'<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="PlantAnimalDetailInfo('+aData.id+',\'edit\');"><i class="fa fa-pencil"></i></a>'
                         '<a class="btn-floating btn-sm red darken-3 waves-effect waves-light" ng-click="deleteBreed('+aData.id+',\'' +aData.name+'\');"><i class="fa fa-trash"></i></a>';

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
    
    //***************** End breed ******************************************
    
    // AJAX method for dataTables.
    $scope.ajaxOptions = {
        "ajax": {
            "url": url + '/resource_info',
            "beforeSend" : function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
            }
        },
        "columns": [
            { "data": "name" },
            { "data": "unit" },
            {
                "mRender": function () {
                    return "";
                }
            },
        ],
        "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                var html = //'<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" data-toggle="modal" data-target="#PlantAnimalDetail" ng-click="PlantAnimalDetailInfo('+aData.id+');"><i class="fa fa-eye"></i></a>'
                           '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="PlantAnimalDetailInfo('+aData.id+',\'edit\');"><i class="fa fa-pencil"></i></a>'
                         + '<a class="btn-floating btn-sm red darken-3 waves-effect waves-light" data-toggle="modal" data-target="#ConfirmDel" ng-click="ConfirmDelete('+aData.id+',\'' +aData.name+'\');"><i class="fa fa-trash"></i></a>';

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
    
    var $form_add_data_plant_animal = $("#form_add_data_plant_animal");    
    $form_add_data_plant_animal.validate({
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
        $scope.unit = "";
        $scope.addBreedData = [];
        $scope.deleteBreedData = [];
        $scope.showBreedData = [];
        $('#table_data_breed').DataTable().clear().rows.add($scope.showBreedData).draw();
    }
    
    $scope.CheckCookies = function(){
        if($cookies.get('api_token') == "" || $cookies.get('api_token')==null){
            window.location.href = "../index.html";
        }
    }
    
    $scope.showFormAddPlantAnimal = function(cmd){
        $scope.clearData();
        $scope.div_table_data_plant_animal = 0;
        $scope.div_add_data_plant_animal = 1;
        $scope.btn_menu_add = 0;
        $scope.form_cmd = cmd;
    }
    
    $scope.showTablePlantAnimal = function(){
        $scope.div_table_data_plant_animal = 1;
        $scope.div_add_data_plant_animal = 0;
        $scope.btn_menu_add = 1;
    }
    
    $scope.PlantAnimalDetailInfo = function(id){
        if(id != '0'){
            $http({
                method: 'GET',
                url: url + '/resource_info/'+id,
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
            }).then(function onSuccess(response) {
                    var data = response.data;
                if(data.status == "error"){
                    toastr["warning"](data.error);
                }else{
                    var ret = data.data[0];
                    $scope.showFormAddPlantAnimal("edit");
                    $scope.id = data.data["resourceInfoData"][0].id;
                    $scope.name = data.data["resourceInfoData"][0].name;
                    $scope.unit = data.data["resourceInfoData"][0].unit;
                    $scope.showBreedData = data.data["breedInfoData"] ;
                    $('#table_data_breed').DataTable().clear().rows.add($scope.showBreedData).draw();
                }
            }, function onError(response) {
                toastr["warning"]("system error");
            });
        }else{
            alert("ไม่สามรถแก้ไขข้อมูลนี้ได้")
        }
    }
    
    $scope.SubmitForm = function(id){
        if($form_add_data_plant_animal.validate().form()){
            if($scope.form_cmd == "add"){
                $scope.AddPlantAnimal();
            }else{
                $scope.UpdatePlantAnimal(id);
            }
        }
    }

    $scope.ConfirmDelete = function(id,data){
        $scope.del_id = id;
        $scope.del_data = data;
    }

    $scope.DeleteData = function(id){
        if(id != '0'){
            $http({
                method: 'DELETE',
                url: url + '/resource_info/'+ id,
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
            }).then(function onSuccess(response) {
                    var data = response.data;
                if(data.status == "error"){
                    toastr["warning"](data.error);
                }else{
                    $('#table_data_plant_animal').DataTable().ajax.reload();
                }
            }, function onError(response) {
                toastr["warning"]("system error");
            });
        }else{
            alert("ไม่สามรถลบข้อมูลนี้ได้")
        }
    }
    
    $scope.AddPlantAnimal = function(){
        $http({
                method: 'POST',
                url: url + '/resource_info',
                dataType: "json",
                data: {"name" : $scope.name, "unit" : $scope.unit ,"breedAddData" : $scope.addBreedData}, //forms user object
                headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
            }).then(function onSuccess(response) {
                var data = response.data;
                if(data.status == "error"){
                    toastr["warning"](data.error);
                }else{
                    $scope.showTablePlantAnimal();
                    $('#table_data_plant_animal').DataTable().ajax.reload();
                }
            }, function onError(response) {
                toastr["warning"]("system error");
            });
    }

    $scope.UpdatePlantAnimal = function(id){
        $http({
                method: 'PUT',
                url: url + '/resource_info/' + id,
                dataType: "json",
                data: {"name" : $scope.name, "unit" : $scope.unit ,"breedAddData" : $scope.addBreedData,"breedDelData" :  $scope.deleteBreedData}, //forms user object
                headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
            }).then(function onSuccess(response) {
                var data = response.data;
                if(data.status == "error"){
                    toastr["warning"](data.error);
                }else{
                    $scope.clearData();
                    $scope.showTablePlantAnimal();
                    $('#table_data_plant_animal').DataTable().ajax.reload();
                }
            }, function onError(response) {
                toastr["warning"]("system error");
            });
    }
    
    $("#ModalAddBreed").on('hidden.bs.modal',function(){
        $scope.add_breed = null ;
    });
});