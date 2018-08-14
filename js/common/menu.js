app.controller("MenuCtrl", function ($scope, $http, $cookies) {


  $scope.initMenu = function () {
    $scope.index_menu = true;
    $scope.main_menu = false;
    $scope.master_data_resource = false;
    $scope.master_data_resource_unit = false;
    $scope.master_data_product = false;
    $scope.master_data_product_unit = false;
    $scope.master_data_cerificate_type = false;
    $scope.master_data_deseases_type = false;
    $scope.master_data_weed_type = false;
    $scope.master_data_irrigation = false;

    $scope.data_feeder_menu = false;
    $scope.data_feeder_weather = false;
    $scope.data_feeder_soil = false;
    $scope.data_feeder_irrigation = false;
    $scope.data_feeder_plant_disease = false;
    $scope.data_feeder_regulation = false;
    $scope.data_feeder_international_price = false;
    $scope.data_feeder_irrigation_data = false;
    $scope.data_feeder_plant_diseases_country_data = false;
    $scope.data_feeder_competitive_country_data = false;

    $scope.data_report = false;
    $scope.data_report_chart = false;
    $scope.farmer_sme_menu = false;
    //$scope.farmer_large_menu = false;
    //$scope.cooperative_menu = false;
    $scope.wholesaler_menu = false;
    //$scope.online_retailer_menu = false;
    $scope.market_retailer_menu = false;
    $scope.consumer_menu = false;
    $scope.manufacturer_menu = false;
    $scope.investor_menu = false;
    $scope.modern_trader_menu = false;
    $scope.importer_menu = false;
    $scope.exporter_menu = false;
    $scope.thai_customs_menu = false;
    $scope.inspection_body_menu = false;
    //$scope.lender_menu = false;
    //$scope.report_menu = false;

    $scope.setting_menu = false;
    $scope.user_management = false;
    $scope.user_type_management = false;
  }

  $scope.showMenu = function () {
    $scope.initMenu();

    function userTypeMenuControl(user_type_id) {
      if (user_type_id == 1) {
        $scope.farmer_sme_menu = true;
      } else if (user_type_id == 2) {
        $scope.wholesaler_menu = true;
      } else if (user_type_id == 3) {
        $scope.market_retailer_menu = true;
      } else if (user_type_id == 4) {
        $scope.modern_trader_menu = true;
      } else if (user_type_id == 5) {
        $scope.consumer_menu = true;
      } else if (user_type_id == 6) {
        $scope.manufacturer_menu = true;
      } else if (user_type_id == 7) {
        $scope.investor_menu = true;
      } else if (user_type_id == 8) {
        $scope.importer_menu = true;
      } else if (user_type_id == 9) {
        $scope.exporter_menu = true;
      } else if (user_type_id == 10) {
        $scope.thai_customs_menu = true;
      } else if (user_type_id == 11) {
        $scope.inspection_body_menu = true;
      }
    }

    function showUserMenu($scope) {
      $scope.farmer_sme_menu = true;
      //$scope.farmer_large_menu = true;
      //$scope.cooperative_menu = true;
      $scope.wholesaler_menu = true;
      //$scope.online_retailer_menu = true;
      $scope.market_retailer_menu = true;
      $scope.manufacturer_menu = true;
      $scope.consumer_menu = true;
      $scope.investor_menu = true;
      $scope.modern_trader_menu = true;
      $scope.importer_menu = true;
      $scope.exporter_menu = true;
      $scope.thai_customs_menu = true;
      $scope.inspection_body_menu = true;
      //$scope.lender_menu = true;
      //$scope.report_menu = true;
    }

    function showMainMenu($scope) {
      $scope.main_menu = true;
      $scope.master_data_resource = true;
      $scope.master_data_resource_unit = false;
      $scope.master_data_product = true;
      $scope.master_data_product_unit = false;
      $scope.master_data_cerificate_type = true;
      $scope.master_data_diseases_type = true;
      $scope.master_data_weed_type = true;
      $scope.master_data_irrigation = true;
      $scope.data_report_chart = true;
    }

    function showDataFeederMenu($scope) {
      $scope.data_feeder_menu = true;
      $scope.data_feeder_weather = true;
      $scope.data_feeder_soil = true;
      $scope.data_feeder_irrigation = true;
      $scope.data_feeder_plant_disease = true;
      $scope.data_feeder_regulation = true;
      $scope.data_feeder_international_price = true;
      $scope.data_feeder_irrigation_data = true;
      $scope.data_feeder_plant_diseases_country_data = true;
      $scope.data_feeder_competitive_country_data = true;
      $scope.data_report = true; //admin
    }

    function showSettingMenu($scope) {
      $scope.setting_menu = true;
      $scope.user_management = true;
      $scope.user_type_management = true;

    }

    // Get valid menu from server
    $http({

      method: 'GET',
      url: url + '/user_user_type/user_id/' + $cookies.get('user_id'),
      dataType: "json",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': $cookies.get('api_token')
      }

    }).then(function onSucess(response) {
      if (response.data.length == 0) {
        $scope.dataregis = {
          "user_id": $cookies.get('user_id'),
          "user_type_list": []
        };
        // Get the modal
        var modal = document.getElementById('myModal');

        modal.style.display = "block";

        // When the user clicks on <span> (x), close the modal
        $scope.close = function () {
          $cookies.remove('api_token', {
            path: '/kdm_client_app'
          });
          $cookies.remove('user_id', {
            path: '/kdm_client_app'
          });
          $cookies.remove('user_role_id', {
            path: '/kdm_client_app'
          });
          modal.style.display = "none";
          window.location.href = "../index.html";
        }

        // load user type 
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

        // init function loadUserTypeList
        $scope.loadUserTypeList();

        function pushUsertype() {
          $scope.dataregis.user_type_list = [];
          angular.forEach($scope.userType, function (list) {
            if (list.is_check) {
              $scope.dataregis.user_type_list.push({
                'user_id': $cookies.get('user_id'),
                'user_type_id': list.id
              });
            }
          });
        }

        $scope.AddUserType = function () {
          pushUsertype();
          console.log($scope.dataregis);
          $http({
            method: 'POST',
            url: url + '/user_user_type',
            dataType: "json",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': $cookies.get('api_token')
            },
            data: $scope.dataregis
          }).then(function onSuccess(response) {
            var data = response.data;
            if (data.status == "error") {
              toastr["warning"](data.error);
            } else {
              window.location.href = "index.html";
            }
          }, function onError(response) {
            toastr["warning"]("system error");
          });
        }
      }
      $scope.index_menu = true;
      $scope.main_menu = false;
      $scope.master_data_resource = false;
      $scope.master_data_resource_unit = false;
      $scope.master_data_product = false;
      $scope.master_data_product_unit = false;
      $scope.master_data_cerificate_type = false;
      $scope.master_data_diseases_type = false;
      $scope.master_data_weed_type = false;
      $scope.master_data_irrigation = false;

      $scope.data_feeder_menu = false;
      $scope.data_feeder_weather = false;
      $scope.data_feeder_soil = false;
      $scope.data_feeder_irrigation = false;
      $scope.data_feeder_plant_disease = false;
      $scope.data_feeder_regulation = false;
      $scope.data_feeder_international_price = false;
      $scope.data_feeder_irrigation_data = false;
      $scope.data_feeder_plant_diseases_country_data = false;
      $scope.data_feeder_competitive_country_data = false;

      $scope.data_report_chart = false;
      $scope.farmer_sme_menu = false;
      //$scope.farmer_large_menu = false;
      //$scope.cooperative_menu = false;
      $scope.wholesaler_menu = false;
      //$scope.online_retailer_menu = false;
      $scope.market_retailer_menu = false;
      $scope.consumer_menu = false;
      $scope.manufacturer_menu = false;
      $scope.investor_menu = false;
      $scope.modern_trader_menu = false;
      $scope.importer_menu = false;
      $scope.exporter_menu = false;
      $scope.thai_customs_menu = false;
      $scope.inspection_body_menu = false;
      //$scope.lender_menu = false;
      //$scope.report_menu = false;

      $scope.setting_menu = false;
      $scope.user_management = false;
      $scope.user_type_management = false;

      var res = response.data;
      angular.forEach(res, function (item) {
        //alert(item.user_type_id);
        userTypeMenuControl(item.user_type_id);
      });


      var user_role_id = $cookies.get('user_role_id');
      if (user_role_id == 1 || user_role_id == 2) { //super admin and admin
        showMainMenu($scope);
        showDataFeederMenu($scope);
        showUserMenu($scope);
        showSettingMenu($scope);
      } else if (user_role_id == 3) { //officer
        showMainMenu($scope);
        showDataFeederMenu($scope);
        showUserMenu($scope);
      }


      $(".button-collapse").sideNav();
      $('.collapsible').collapsible();

    }, function onError(response) {
      toastr["warning"]("system error");
    });
  };


  $scope.ActionMasterDataResource = function () {
    window.location.href = "master_data_resource.html";
  };

  $scope.ActionMasterDataResourceUnit = function () {
    window.location.href = "master_data_resource_unit.html";
  };

  $scope.ActionMasterDataProduct = function () {
    window.location.href = "master_data_product.html";
  };

  $scope.ActionMasterDataProductUnit = function () {
    window.location.href = "master_data_product_unit.html";
  };

  $scope.ActionMasterDataCerificateType = function () {
    window.location.href = "master_data_cerificate_type.html";
  };

  $scope.ActionDataFeederWeather = function () {
    window.location.href = "data_feeder_weather.html";
  };

  $scope.ActionDataFeederSoil = function () {
    window.location.href = "data_feeder_soil.html";
  };

  $scope.ActionDataFeederIrrigation = function () {
    window.location.href = "data_feeder_irrigation.html";
  };

  $scope.ActionDataFeederPlantDisease = function () {
    window.location.href = "data_feeder_plant_disease.html";
  };

  $scope.ActionDataFeederRegulation = function () {
    window.location.href = "data_feeder_regulation.html";
  };

  $scope.ActionDataFeederInternationalPrice = function () {
    window.location.href = "data_feeder_international_price.html";
  };

  $scope.ActionDataFeederIrrigationData = function () {
    window.location.href = "data_feeder_irrigation_data.html";
  };

  $scope.ActionDataFeederPlantDiseasesCountryData = function () {
    window.location.href = "data_feeder_plant_diseases_country_data.html";
  };

  $scope.ActionDataFeederCompetitiveCountryData = function () {
    window.location.href = "data_feeder_competitive_country_data.html";
  };

  $scope.ActionFarmerSME = function () {
    window.location.href = "farmer_sme_menu.html";
  };

  $scope.ActionFarmerLarge = function () {
    window.location.href = "farmer_large_menu.html";
  };

  $scope.ActionCooperative = function () {
    window.location.href = "cooperative_menu.html";
  };

  $scope.ActionWholeSaler = function () {
    window.location.href = "wholesaler_menu.html";
  };

  $scope.ActionOnlineRetailer = function () {
    window.location.href = "online_retailer_menu.html";
  };

  $scope.ActionMarketRetailer = function () {
    window.location.href = "market_retailer_menu.html";
  };

  $scope.ActionConsumer = function () {
    window.location.href = "consumer_menu.html";
  };

  $scope.ActionManufacturer = function () {
    window.location.href = "manufacturer_menu.html";
  };

  $scope.ActionInvestor = function () {
    window.location.href = "investor_menu.html";
  };

  $scope.ActionModernTrader = function () {
    window.location.href = "modern_trader_menu.html";
  };

  $scope.ActionImporter = function () {
    window.location.href = "importer_menu.html";
  };

  $scope.ActionExporter = function () {
    window.location.href = "exporter_menu.html";
  };

  $scope.ActionThaiCustoms = function () {
    window.location.href = "thai_customs_menu.html";
  };

  $scope.ActionInspectionBody = function () {
    window.location.href = "inspection_body_menu.html";
  };

  $scope.ActionLender = function () {
    window.location.href = "lender_menu.html";
  };

  $scope.ActionUserManagement = function () {
    window.location.href = "account.html";
  };

  $scope.ActionUserTypeManagement = function () {
    window.location.href = "user_type_management.html";
  };

  $scope.Actionlogout = function () {
    $cookies.remove('api_token', {
      path: '/kdm_client_app'
    });
    window.location.href = "../index.html";
  };

  $scope.ActionMasterDataDiseasesType = function () {
    window.location.href = "master_data_diseases_type.html";
  };

  $scope.ActionMasterDataWeedType = function () {
    window.location.href = "master_data_weed_type.html";
  };

  $scope.ActionMasterDataIrrigation = function () {
    window.location.href = "master_data_irrigation.html";
  };

  $scope.ActioDataReport = function () {
    window.location.href = "master_data_irrigation.html";
  };

  $scope.init_slide_button = function () {
    $(".button-collapse").sideNav();
    $('.collapsible').collapsible();

    $nav_menu_title = $("#nav_menu_title");
    var menu_title = "Agriconnect";
    var url = window.location.href;
    var url_fn = url.substring(url.lastIndexOf('/') + 1);

    if (url_fn === "farmer_sme_menu.html") {
      menu_title = "เกษตรกร";
    } else if (url_fn === "data_news.html") {
      menu_title = "ข่าวสาร";
    } else if (url_fn === "data_report_chart.html") {
      menu_title = "รายงาน";
    } else if (url_fn === "map_investment.html") {
      menu_title = "แผนที่การลงทุน";
    } else if (url_fn === "wholesaler_menu.html") {
      menu_title = "พ่อค้าคนลาง";
    } else if (url_fn === "market_retailer_menu.html") {
      menu_title = "พ่อค้าตลาดห้าง";
    } else if (url_fn === "modern_trader_menu.html") {
      menu_title = "ตลาดห้าง";
    } else if (url_fn === "consumer_menu.html") {
      menu_title = "ผู้บริโภค";
    } else if (url_fn === "manufacturer_menu.html") {
      menu_title = "ผู้ค้าแปรรูป";
    } else if (url_fn === "investor_menu.html") {
      menu_title = "นักลงทุน";
    } else if (url_fn === "importer_menu.html") {
      menu_title = "ผู้นำเข้า";
    } else if (url_fn === "exporter_menu.html") {
      menu_title = "ผู้ส่งออก";
    } else if (url_fn === "thai_customs_menu.html") {
      menu_title = "ศุลกากร";
    } else if (url_fn === "inspection_body_menu.html") {
      menu_title = "ผู้ตรวจสอบ";
    } else if (url_fn === "report_problem.html") {
      menu_title = "แจ้งปัญหา";
    } else if (url_fn === "master_data_resource.html") {
      menu_title = "ข้อมูลพืช/สัตว์";
    } else if (url_fn === "master_data_product.html") {
      menu_title = "ข้อมูลผลผลิต";
    } else if (url_fn === "master_data_cerificate_type.html") {
      menu_title = "ประเภทใบรับรอง";
    } else if (url_fn === "master_data_diseases_type.html") {
      menu_title = "ข้อมูลโรค";
    } else if (url_fn === "master_data_weed_type.html") {
      menu_title = "ข้อมูลศัตรูพืช";
    } else if (url_fn === "master_data_irrigation.html") {
      menu_title = "ข้อมูลชลประทาน";
    } else if (url_fn === "data_feeder_weather.html") {
      menu_title = "ข้อมูลภูมิอากาศ";
    } else if (url_fn === "data_feeder_soil.html") {
      menu_title = "ข้อมูลสภาพดิน";
    } else if (url_fn === "data_feeder_soil.html") {
      menu_title = "ข้อมูลสภาพดิน";
    } else if (url_fn === "data_feeder_irrigation.html") {
      menu_title = "ข้อมูลคุณภาพน้ำ";
    } else if (url_fn === "data_feeder_plant_disease.html") {
      menu_title = "ข้อมูลสัญญาณจากโรคพืช";
    } else if (url_fn === "data_feeder_regulation.html") {
      menu_title = "ข้อมูลนโยบายจากภาครัฐบาล";
    } else if (url_fn === "data_feeder_international_price.html") {
      menu_title = "ข้อมูลราคาสินค้าต่างประเทศ";
    } else if (url_fn === "data_feeder_irrigation_data.html") {
      menu_title = "ข้อมูลแหล่งชลประทาน";
    } else if (url_fn === "data_feeder_plant_diseases_country_data.html") {
      menu_title = "ข้อมูลโรคพืช/สัตว์ ประเทศคู่แข่ง";
    } else if (url_fn === "data_feeder_competitive_country_data.html") {
      menu_title = "ข้อมูลประเทศคู่แข่งทางการค้า";
    }

    $nav_menu_title.text(menu_title);
  }

  $scope.modal = function () {

  }
});