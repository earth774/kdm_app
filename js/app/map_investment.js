app.controller("MapInvestmentCtrl", function ($scope, $cookies,NgMap,$http) {

    $scope.CheckCookies = function(){
        if($cookies.get('api_token') == "" || $cookies.get('api_token')==null){
            window.location.href = "../index.html";
        }
    }
     
      $scope.setHighMap = function(data) {
        // Create the chart
        Highcharts.mapChart('highChart', {
            chart: {
                map: 'countries/th/th-all'
            },

            title: {
                text: 'แผนที่การลงทุน'
            },

            subtitle: {
                //text: 'Source map: <a href="http://code.highcharts.com/mapdata/countries/th/th-all.js">Thailand</a>'
                text: 'ประเทศไทย'
            },

            mapNavigation: {
                enabled: true,
                buttonOptions: {
                    verticalAlign: 'bottom'
                }
            },

            colorAxis: {
                min: 0
            },

            series: [{
                data: data,
                name: 'ข้อมูล',
                states: {
                    hover: {
                        color: '#BADA55'
                    }
                },
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                }
            }]
        });
    }
    
     $http({
         method: 'GET',
         url: url + '/investment_map',
         dataType: "json",
         headers: {'Content-Type': 'application/json','Authorization': $cookies.get('api_token')}
     }).then(function onSuccess(response) {
             var res = response.data;

         if(res.status == "error"){
             toastr["warning"](res.error);
         }else{
             $scope.setHighMap(res.data);
             $scope.position = res.data;
             
         }
     }, function onError(response) {
         toastr["warning"]("system error");
     });
    
});
