let map;

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");

  var options = {
    zoom: 14,
    center: new google.maps.LatLng(45.4201, -75.7003),
    disableDefaultUI: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP  
  }

  map = new Map(document.getElementById("map"), options);
}

initMap();
