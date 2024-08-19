import express from 'express';
import path from 'path'
import { fileURLToPath } from 'url';

import { config } from 'dotenv';
import request from 'request'
import fetch from 'node-fetch';

import polyline from '@mapbox/polyline';

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config();

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

app.use(express.static('public'))

let session;

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is running. Currently listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

app.get("/", (req, res) => {
    if(session == null){
        res.sendFile('welcome.html', { root: path.join(__dirname, 'public') });
    }
    else
    {
        res.sendFile('Map.html', { root: path.join(__dirname, 'public') });
    }
});

app.get("/activities", async(req, res) => {
    let json = await getAthleteActivities(session.access_token);

    const activities = json["activities"];
    const athlete = json["athlete"];
    
    let result = [];

    activities.forEach(activity => {
        result.push({
            "name": activity.name,
            "polyline": polyline.decode(activity.map.summary_polyline, 5),
            "distance": activity.distance,
            "type": activity.sport_type,
            "date": getDateFromDatetime(activity.start_date)
        });
    });

    res.send({
        "activities": result,
        "athlete": athlete
    });
});

app.get("/athlete", async(req, res) => {
    let athlete = await getAthlete(session.access_token, null);
    res.send(athlete);
});

app.get("/authenticate", (req, res) => {
    res.sendFile('welcome.html', { root: path.join(__dirname, 'public') });
});

app.get("/receive_auth_code", async(req, res) => {
    let code = req.query.code;

    try {
        let session_info = await authenticationRequest(code);

        session = session_info;

        res.sendFile('auth_complete.html', { root: path.join(__dirname, 'public') });
        
    } catch (error) {
        console.error(error);
    }
});

function authenticationRequest(code) {
    return new Promise(function (resolve, reject) {
        request.post(
            'https://www.strava.com/api/v3/oauth/token',
            { json: { "client_id": client_id, "client_secret":client_secret, "code": code, "grant_type":"authorization_code"} },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                }
                else
                {
                    reject(error);
                }
            }
        );
    });
  }

  async function getAthleteActivities(access_token, athlete_id) {
    let athlete;
    let activities;

    athlete = await getAthlete(access_token, athlete_id);

    await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=200&page=1', {
        headers: {Authorization: 'Bearer ' + access_token}
    }).then(resp => resp.json()).then(json => { 
        activities = json;
    });

    return {"activities": activities, "athlete": athlete};
  }

  async function getAthlete(access_token, athlete_id) {
    let athlete;

    await fetch('https://www.strava.com/api/v3/athlete', {
        headers: {Authorization: 'Bearer ' + access_token}
    }).then(resp => resp.json()).then(json => { 
        athlete = json;
    });

    return athlete;
  }

  function getDateFromDatetime(datetime)
  {
    datetime.substring(0,10)
    return datetime.substring(0,10);
  }