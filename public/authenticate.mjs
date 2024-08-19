document.getElementById("strava_connect").addEventListener("click", gotoAuthenticationLink);

function gotoAuthenticationLink() {
    
    window.location.replace("https://www.strava.com/oauth/authorize?client_id=130819&scope=activity:read&response_type=code&redirect_uri=http://localhost:3000/receive_auth_code");
}

