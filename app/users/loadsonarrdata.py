import json, requests
from datetime import date, timedelta, datetime


def GETsonarrData(basepath, apikey):
    #Get the sonarr releases
    startdate = date.today() - timedelta(days=30)
    enddate = date.today() + timedelta(days=30)
    url = f"{basepath}/api/calendar?apikey={apikey}&start={startdate}&end={enddate}"
    try:
        response = requests.request("GET", url)
    except:
        print(f"Script Error: Could not connect to Sonarr Module - {basepath}")
    else:
        return json.loads(response.text)