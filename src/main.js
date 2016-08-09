  console.log("sanity check");

// promises.all returns an array with all data from each AJAX call
var promises = [getBStatus(), getBStationInfo()];
var allPromises = Promise.all(promises).then(function(returnedAJAXArr) {
  // console.log(returnedAJAXArr);
  var stationsFromStatus = returnedAJAXArr[0].data.stations;
  // console.log(x);
  var stationsObjFromStatus = {};
  for (var i = 0; i < stationsFromStatus.length; i++) {
    var numBikesAvailKey = Object.keys(stationsFromStatus[i])[1];
    var numStationsAvailKey = Object.keys(stationsFromStatus[i])[2];
    var isRenting = Object.keys(stationsFromStatus[i])[4];
    var isReturning = Object.keys(stationsFromStatus[i])[5];
    stationsObjFromStatus[stationsFromStatus[i].station_id] = {
      numBikesAvailKey: stationsFromStatus[i].num_bikes_available,
      numStationsAvailKey: stationsFromStatus[i].num_docks_available,
      isRenting: stationsFromStatus[i].is_renting,
      isReturning: stationsFromStatus[i].is_returning
    };
  }
  // console.log(stationsObjFromStatus);
  return stationsObjFromStatus;

});

  geoFindMe();

function getBStatus() {
  return new Promise(function(resolve, reject) {
  $.ajax({
    url: 'https://gbfs.bcycle.com/bcycle_denver/station_status.json',
    method: 'GET'
  }).done(function (bStatusAJAXReturn){
    resolve(bStatusAJAXReturn);
  });
  });
}

function getBStationInfo() {
  return new Promise(function(resolve, reject) {
  $.ajax ({
    url: 'https://gbfs.bcycle.com/bcycle_denver/station_information.json',
    method: 'GET'
  }).done(function (bStationInfoAJAXReturn){
    resolve(bStationInfoAJAXReturn);
  });
  });
}

// Passing in lat and long perameters from geoFindMe
  function initMap(lat, lng) {
  allPromises.then(function(payload) {
    // console.log(payload.bcycle_denver_1646);

  var myLatLng = new google.maps.LatLng(lat, lng);

  var bLatLong = new google.maps.LatLng(-104.95253, 39.72055);

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: myLatLng
  });

  var marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    title: 'Hello World!'
  });

  var marker2 = new google.maps.Marker({
    position: bLatLong,
    map: map,
    title: 'B-cycle station'
  });
  console.log('miles apart: ' + (((google.maps.geometry.spherical.computeDistanceBetween(myLatLng, bLatLong))*0.000621371).toFixed(2)));
  });
}

// Retrieve user location

function geoFindMe() {

  var output = document.getElementById("out");

  if (!navigator.geolocation){
    output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
    return;
  }

  function success(position) {
    var latitude  = position.coords.latitude;
    var longitude = position.coords.longitude;

    console.log(latitude);
    console.log(longitude);

    initMap(latitude, longitude);
  }

  function error() {
    output.innerHTML = "Unable to retrieve your location";
  }

  // output.innerHTML = "<p>Locating…</p>";

  navigator.geolocation.getCurrentPosition(success, error);
}
