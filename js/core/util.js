function initMaterialSelect(selector, val){
    $(selector).val(val);
    $(selector).material_select();
}

function clearMaterialSelect(selector){
    $(selector).material_select('destroy');
    $(selector).material_select();
}

function initMaterialSelectDataTable(){
    $('.mdb-select').material_select('destroy');
    $('select').addClass('mdb-select');
    $('.mdb-select').material_select();
}

function isPhoneGap() {
    return (window.cordova || window.PhoneGap || window.phonegap) 
    && /^file:\/{3}[^\/]/i.test(window.location.href) 
    && /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent);
}

//config md bootstap alert
toastr.options = {
"closeButton": true, // true/false
"debug": false, // true/false
"newestOnTop": false, // true/false
"progressBar": false, // true/false
"positionClass": "toast-bottom-center", // toast-top-right / toast-top-left / toast-bottom-right / toast-bottom-left
"preventDuplicates": false, //true/false
"onclick": null,
"showDuration": "300", // in milliseconds
"hideDuration": "2000", // in milliseconds
"timeOut": "5000", // in milliseconds
"extendedTimeOut": "1000", // in milliseconds
"showEasing": "swing",
"hideEasing": "linear",
"showMethod": "fadeIn",
"hideMethod": "fadeOut"
}

