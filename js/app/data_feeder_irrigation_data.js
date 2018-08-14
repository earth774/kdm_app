
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

app.controller("dataFeederIrrigationDataCtrl", function ($scope, $http, $cookies, $compile,$filter) {
    $scope.div_table_data_feeder_irrigation_data = 1; //show table
    $scope.btn_menu_add = 1; //btn add
    $scope.div_add_data_feeder_irrigation_data = 0;
    $scope.form_cmd = "";

//    $('.datepicker').pickadate({
//        format: 'yyyy-mm-dd',
//        formatSubmit: 'yyyy-mm-dd',
//        hiddenPrefix: 'prefix__',
//        hiddenSuffix: '__suffix'
//    });

    setTimeout( function () {
       $('#date-format').bootstrapMaterialDatePicker({ format : 'YYYY-MM-DD HH:mm'});
    }, 10 );

    setTimeout( function () {
        $('#table_data_feeder_irrigation_data').DataTable().ajax.reload();
    }, 1000 );

    // AJAX method for dataTables.
    $scope.ajaxOptions = {
        "ajax": {
            "url": url + '/irrigation_data_feeder_info',
            "beforeSend" : function (request) {
                    request.setRequestHeader("Authorization", $cookies.get('api_token'));
            }
        },
        "columns": [
            { "data": "name"},
            { "data": "water_percent" },
            { "data": "data_datetime" },
            {
                "mRender": function () {
                    return "";
                }
            },
        ],
        "fnDrawCallback": function (oSettings, json){
            initMaterialSelectDataTable();
        },
        "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {
            var html = //'<a class="btn-floating btn-sm blue lighten-3 waves-effect waves-light" data-toggle="modal" data-target="#ProductDetail" ng-click="ProductDetailInfo('+aData.id+');"><i class="fa fa-eye"></i></a>'
                   '<a class="btn-floating btn-sm blue light-blue darken-4 waves-effect waves-light" ng-click="EditData('+aData.id+',\'edit\');"><i class="fa fa-pencil"></i></a>'
                 + '<a class="btn-floating btn-sm red darken-3 waves-effect waves-light" data-toggle="modal" data-target="#ConfirmDel" ng-click="ConfirmDelete('+aData.id+',\'' +"มูลชลประทาน"+'\');"><i class="fa fa-trash"></i></a>';

            var last_row = $("td:last", nRow);
            if(  ! last_row.html() ){
                angular.element(last_row).append( $compile(html)($scope) )
            }
            $(nRow).attr("id",'row_' + aData.id);
            return nRow;
        },
    };

    //delete
    $scope.ConfirmDelete = function(id,data){
        $scope.del_id = id;
        $scope.del_data = data;
    }

    $scope.DeleteData = function(id){
        $http({
            method: 'DELETE',
            url: url + '/irrigation_data_feeder_info/'+ id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var data = response.data;
            if(data.status == "error"){
                toastr["warning"](data.error);
            }else{
                $('#table_data_feeder_irrigation_data').DataTable().ajax.reload();
            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    //form
    var $form_add_data_feeder_irrigation_data = $("#form_add_data_feeder_irrigation_data");
    $form_add_data_feeder_irrigation_data.validate({
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
        //$scope.id = "";
        $scope.water_percent = "";
        $scope.data_datetime = "";
        $scope.hasSubmit = false;

        var select = $('#select_irrigation_info');
        select.prop('selectedIndex', 0); //Sets the first option as selected
        select.material_select();        //Update material select
    }

    // show controller
    $scope.showFormAddDataFeederIrrigationData = function(cmd){
        $scope.clearData();
        $scope.div_table_data_feeder_irrigation_data = 0;
        $scope.div_add_data_feeder_irrigation_data = 1;
        $scope.btn_menu_add = 0;
        $scope.form_cmd = cmd;

    }

    $scope.showTableAddDataFeederIrrigationData = function(){
        $scope.div_table_data_feeder_irrigation_data = 1;
        $scope.div_add_data_feeder_irrigation_data = 0;
        $scope.btn_menu_add = 1;

    }

    $scope.loadDataIrrigationInfoType = function(){
        $http({
            method: 'GET',
            url: url + '/irrigation_info',
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var data = response.data;
            if(data.status == "error"){
                toastr["warning"](data.error);
            }else{
                $scope.irrigation_info = data.data;
                initMaterialSelect($('#select_irrigation_info'), response.data.resource_info_id);
            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    $scope.SubmitForm = function(id){ //submit
        $scope.hasSubmit = true;
        if($form_add_data_feeder_irrigation_data.validate().form()){
            if($scope.form_cmd == "add"){
                $scope.AddProduct();
            }else{
                $scope.UpdateProduct(id);
            }
        }
    }

    //add
    $scope.AddProduct = function(){
        $http({
                method: 'POST',
                url: url + '/irrigation_data_feeder_info',
                dataType: "json",
                data: {"water_percent" : $scope.water_percent,"irrigation_info_id" : $('#select_irrigation_info').val(),"data_datetime" :$scope.data_datetime}, //forms user object
                headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
            }).then(function onSuccess(response) {
                var data = response.data;
                if(data.status == "error"){
                    toastr["warning"](data.error);
                }else{
                    $scope.showTableAddDataFeederIrrigationData();
                    $('#table_data_feeder_irrigation_data').DataTable().ajax.reload();
                }
            }, function onError(response) {
                toastr["warning"]("system error");
        });
    }

    //Edit
    $scope.EditData = function(id){
        $http({
            method: 'GET',
            url: url + '/irrigation_data_feeder_info/'+id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
        }).then(function onSuccess(response) {
                var data = response.data;
            if(data.status == "error"){
                toastr["warning"](data.error);
            }else{
                var ret = data.data[0];
                $scope.id = ret.id;
                $scope.showFormAddDataFeederIrrigationData("edit");
                $scope.water_percent = ret.water_percent;
                $scope.data_datetime = ret.data_datetime;
                //$scope.data_datetime = $filter('limitTo')(ret.data_datetime, 10, 0);
                initMaterialSelect($('#select_irrigation_info'), ret.irrigation_info_id);

            }
        }, function onError(response) {
            toastr["warning"]("system error");
        });
    }

    //update
    $scope.UpdateProduct = function(id){
        //alert(id);
        $http({
                method: 'PUT',
                url: url + '/irrigation_data_feeder_info/' + id,
                dataType: "json",
                data: {"water_percent" : $scope.water_percent, "irrigation_info_id" : $('#select_irrigation_info').val(), "data_datetime" : $scope.data_datetime}, //forms user object
                headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
            }).then(function onSuccess(response) {
                var data = response.data;
                if(data.status == "error"){
                    toastr["warning"](data.error);
                }else{
                    $scope.showTableAddDataFeederIrrigationData();
                    $('#table_data_feeder_irrigation_data').DataTable().ajax.reload();
                }
            }, function onError(response) {
                toastr["warning"]("system error");
        });
    }

});
