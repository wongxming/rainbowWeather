
$(document).ready(function() {

//var myprovince = remote_ip_info['province']; 
//var mycity = remote_ip_info['city'] 
//var mydistrict = remote_ip_info['district'];
//alert(myprovince+mycity+mydistrict);

     sendAjax();
});

function isEmpty(val){
    return (val === undefined || val == null || val.length <= 0) ? true : false;
}

function sendAjax(){

var localStorage = window.localStorage;;
var cityId = localStorage.cityId;
if(!cityId){
    cityId='101210101';
    localStorage.setItem('cityId','101210101');
}

var dataStr = localStorage.getItem(cityId+'data');

if(dataStr){
   var dataArray = dataStr.split('|');
   var lstTime = dataArray[1];
   if((Date.now()-lstTime)<300000){

      fillData(dataArray[0]);
      return ;
   }
 }


   $.ajax({ 
            type: "get",               //也可以是type  
            async: true,               //发送同步请求，此值可忽略,不影响结果  
            timeout: 1000,
            url: "/weather?cityId="+cityId,    //请求地址
            success:function(data){         //成功后的回调函数,返回的数据放在data参数里  
                
                fillData(data);

                localStorage.setItem(cityId+'data',data+'|'+Date.now());

            },
            error:function(xhr, type){         //成功后的回调函数,返回的数据放在data参数里  
                
                var dataStr = localStorage.getItem(cityId+'data');
                if(dataStr){
                  var dataArray = dataStr.split('|');
                  fillData(dataArray[0]);
                }else{
                  $("BODY").append("网络异常啦！");
                  
                }

                

            }
        });
};


function fillData(data){

var weatherData = JSON.parse(data) ;
//today
    fillWeatherToday(weatherData);
//forcast
    fillForcastDays(weatherData.weathers);
    

};

function fillWeatherToday(weatherData){
   
   var aqi= weatherData.aqi.aqi+" "+weatherData.aqi.quality;

var realtime = weatherData.weatherNow;

var tempTemplate = $("#template-weather-today").html();
    tempTemplate = tempTemplate.replace(/{weatherCity}/g, weatherData.city)
    .replace(/{weatherTempNow}/g, realtime.temp)
    .replace(/{weatherMsg}/g, realtime.weather+" "+realtime.temp_day_night)
    .replace(/{weatherAqi}/g, aqi);
    
    $("#weather-today").html(tempTemplate);

};

function fillForcastDays(days){
  var day = days[0];
  days.shift();
  days.shift();
  days.unshift(day);
    days.pop();
    var forcast = $("#template-weather-day").html();
    var weatherForcast = $("#weather-forcast");

    for(var id in days){
        var dayWther = days[id];
        var forcastMsg = forcast.replace(/{weekDay}/g, dayWther.week)
                            .replace(/{dayImg}/g, dayWther.img)
                            .replace(/{dayWeather}/g, dayWther.weather)
                            .replace(/{dayTemp}/g, dayWther.temp_day_night);
    
        weatherForcast.append(forcastMsg);
    }
};

/*
jQuery(function($) {
  var $bodyEl = $('body'),
  $sidedrawerEl = $('#sidedrawer');
  
  
  // ==========================================================================
  // Toggle Sidedrawer
  // ==========================================================================
  function showSidedrawer() {
    console.log('show');
    
    // show overlay
    var options = {
      onclose: function() {
        $sidedrawerEl
          .removeClass('active')
          .appendTo(document.body);
      }
    };
    
    var $overlayEl = $(mui.overlay('on', options));
    
    // show element
    $sidedrawerEl.appendTo($overlayEl);
    setTimeout(function() {
      $sidedrawerEl.addClass('active');
    }, 20);
  }
  
  
  function hideSidedrawer() {
    $bodyEl.toggleClass('hide-sidedrawer');
  }
  
  
  $('.js-show-sidedrawer').on('click', showSidedrawer);
  $('.js-hide-sidedrawer').on('click', hideSidedrawer);
  
  
  // ==========================================================================
  // Animate menu
  // ==========================================================================
  (function() {
    // hide L2
    var $titleEls = $('strong', $sidedrawerEl);
    
    $titleEls
      .next()
      .hide();
    
    $titleEls.on('click', function() {
      $(this).next().slideToggle(200);
    });
  })();
});
*/