let map;
let activities;
let athlete;

// UI selected filters
let selectedTime = document.getElementById("default_time");
let selectedSport = document.getElementById("default_sport");

let selectedActivities;
let currentPolylines = [];

const base_url = "http://localhost:3000/";

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

function drawPolyline(activity)
{
  polyline = activity.polyline;
  let activityPoints = [];
  polyline.forEach(point => {
    activityPoints.push({"lat": point[0], "lng": point[1]});
  });

  let color = "#e39919";
  if(activity.type == "Hike")
  {
    color = "red";
  }
  else if(activity.type == "Swim")
  {
    color = "navyblue";
  }
  else if(activity.type == "Tennis")
  {
    color = "green";
  }

  const activityPath = new google.maps.Polyline({
    path: activityPoints,
    geodesic: true,
    strokeColor: color,
    strokeOpacity: 1.0,
    strokeWeight: 3,
  });

  activityPath.setMap(map);

  currentPolylines.push(activityPath);
}

function drawPolylines()
{
  currentPolylines.forEach(polyline => {
    polyline.setMap(null);
  });

  currentPolylines = [];
   
  selectedActivities.forEach(activity => {
    drawPolyline(activity);
  });
}

function getActivities()
{
  const xhr = new XMLHttpRequest();
  xhr.open("GET", base_url + "activities");
  xhr.send();
  xhr.responseType = "json";
  xhr.onload = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      const response = xhr.response;

      activities = response.activities;
      athlete = response.athlete;

      const latest = activities[0];

      if(latest == null)
      {
        console.log("No activities to show");
      }

      document.getElementById("activity_count").innerText = "Showing " + activities.length + " activities from your Strava profile";

      initializeFilters();

      applyFilters();

      drawPolylines();

    } else {
      console.log(`Error: ${xhr.status}`);
    }
  };
}

function getAthlete()
{
  const xhr = new XMLHttpRequest();
  xhr.open("GET", base_url + "athlete");
  xhr.send();
  xhr.responseType = "json";
  xhr.onload = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      athlete = xhr.response;
      getActivities();
    } else {
      console.log(`Error: ${xhr.status}`);
    }
  };
}

function initializeFilters()
{
  const timeOptions = document.getElementsByClassName("time_option");
  const sportOptions = document.getElementsByClassName("sport_option");

  for(let option of timeOptions)
  {
    option.addEventListener("click", function(){
      selectedTime.style.fontWeight = "normal";
      selectedTime = option;
      selectedTime.style.fontWeight = "700";

      applyFilters();
    });
  }

  for(let option of sportOptions)
    {
      option.addEventListener("click", function(){
        selectedSport.style.fontWeight = "300";
        selectedSport = option;
        selectedSport.style.fontWeight = "700";

        applyFilters();
      });
    }

}

function applyFilters()
{
  let currentTimeFilter = selectedTime.innerHTML;
  let currentSportFilter = selectedSport.innerHTML;

  selectTimeFilter(currentTimeFilter);
  selectActivityTypeFilter(currentSportFilter, selectedActivities);

  drawPolylines();
}

function selectTimeFilter(time)
{
  let today = new Date();
  let filterDate;
  switch(time)
  {
    case "All time":
      selectedActivities = activities;
      break;
    case "Today":
      selectedActivities = [];
      activities.forEach(activity => {
        if(activity.date == new Date().toISOString().substring(0,10))
        {
          console.log(activity.date);
          console.log(new Date().toISOString().substring(0,10));
          selectedActivities.push(activity);
        }
      });
      break;
    case "Last 7 days":
      selectedActivities = [];

      filterDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      activities.forEach(activity => {
        if(isDateBetween(new Date(activity.date), filterDate, today))
        {
          selectedActivities.push(activity);
        }
      });
      break;
    case "Last 30 days":
      selectedActivities = [];

      filterDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      activities.forEach(activity => {
        if(isDateBetween(new Date(activity.date), filterDate, today))
        {
          selectedActivities.push(activity);
        }
      });
      break;
    case "Last 12 months":
      selectedActivities = [];

      filterDate = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

      activities.forEach(activity => {
        if(isDateBetween(new Date(activity.date), filterDate, today))
        {
          selectedActivities.push(activity);
        }
      });
      break;
    default:
      selectedActivities = [];
      break;
  }
}

function selectActivityTypeFilter(sport, time_activities)
{
  switch(sport){
    case "All activities":
      selectedActivities = time_activities;
      break;
    case "Cycling":
      selectedActivities = [];
      time_activities.forEach(activity => {
        if(activity.type == "Ride")
        {
          selectedActivities.push(activity);
        }
      });
      break;
    case "Running":
      selectedActivities = [];
      time_activities.forEach(activity => {
        if(activity.type == "Run")
        {
          selectedActivities.push(activity);
        }
      });
      break;
    case "Swimming":
      selectedActivities = [];
      time_activities.forEach(activity => {
        if(activity.type == "Swim")
        {
          selectedActivities.push(activity);
        }
      });
      break;
    case "Hiking":
      selectedActivities = [];
      time_activities.forEach(activity => {
        if(activity.type == "Hike" || activity.type == "Walk")
        {
          selectedActivities.push(activity);
        }
      });
      break;
      case "Tennis":
        selectedActivities = [];
        time_activities.forEach(activity => {
          if(activity.type == "Tennis")
          {
            selectedActivities.push(activity);
          }
        });
        break;
    default:
      selectedActivities = [];
      break;
  }
}

function isDateBetween(date, startDate, endDate)
{
  return (date.valueOf() >= startDate.valueOf() && date.valueOf() <= endDate.valueOf());
}

initMap();

getActivities();