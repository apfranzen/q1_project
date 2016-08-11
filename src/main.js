console.log("sanity check");

// geoFindMe().then(someFn).then()


var distances = [];
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
  var stationsFromInfo = returnedAJAXArr[1].data.stations;

  for (var j = 0; j < stationsFromInfo.length; j++) {

    var key = stationsFromInfo[j].station_id;
    var lonVal = stationsFromInfo[j].lon;
    var latVal = stationsFromInfo[j].lat;
    var nameVal = stationsFromInfo[j].name;

    stationsObjFromStatus[key].lat = latVal;
    stationsObjFromStatus[key].lon = lonVal;
    stationsObjFromStatus[key].name = nameVal;

  }

  return stationsObjFromStatus;

});

  // geoFindMe();

function getBStatus() {
  return new Promise(function(resolve, reject) {
  $.ajax({
    url: 'https://gbfs.bcycle.com/bcycle_denver/station_status.json',
    method: 'GET'
  }).done(function (bStatusAJAXReturn){
    resolve(bStatusAJAXReturn);
  }).fail(function(err){
    return reject(err);
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
  }).fail(function(err){
    return reject(err);
  });
  });
}

// Passing in lat and long perameters from geoFindMe
geoFindMe();


function initMap(lat, lng) {

allPromises.then(function(payload) {
  // console.log(payload);
  for (var station in payload) {
    var lat = (payload[station].lat);
    var lon = (payload[station].lon);
    var name = (payload[station].name);
    var bLatLong = new google.maps.LatLng(lat, lon);
    mapMarker(bLatLong, name);
    // distanceAway(blatLong);
  }
  // return payload;
  //
});

var myLatLng = new google.maps.LatLng(lat, lng);

var map = new google.maps.Map(document.getElementById('map'), {
  zoom: 13,
  center: myLatLng
});

var marker = new google.maps.Marker({
  position: myLatLng,
  map: map,
  title: 'Current Location',
  icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
});

function mapMarker(loc, description) {
  new google.maps.Marker({
    position: loc,
    map: map,
    title: description,
    icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
  });
  var myLatLng = new google.maps.LatLng(lat, lng);
  var distanceArray = distanceAway(loc, myLatLng, description);
}

function distanceAway(stationLoc, userLocation, description1) {

  var distance = parseFloat((google.maps.geometry.spherical.computeDistanceBetween(
    stationLoc, userLocation)*0.000621371).toFixed(2));

  distances.push({
    name: description1,
    distance: distance,
    stationLatLon: stationLoc
  });


}
detClosest(distances);
}

function detClosest(distancesArr) {
  var index = 0;
  var value = 100;
  for (var i = 0; i < distancesArr.length; i++) {
    if (distancesArr[i].distance < value) {
      value = distancesArr[i].distance;
      index = i;
    }
    // var marker = new google.maps.Marker({
    //   position: distancesArr[index].stationLatLon,
    //   map: map,
    //   title: 'Closest Station',
    //   icon: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png'
    // });
  }

  // $( ".title" ).append( "<p>'The closest station is: ' + distancesArr[index].name + ' and it is ' + value + ' miles away!'</p>" );
  //
  // console.log(distancesArr, index, distancesArr[0]);
  console.log('The closest station is: ' + distancesArr[index].name + ' and it is ' + value + ' miles away!');
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
