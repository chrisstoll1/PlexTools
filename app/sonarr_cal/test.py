import requests

url = 'http://localhost:8000/calapi/delete/'
Niid = 60743
Nuid = 1
Mode = 'email'
Ciid = 1
myobj = {'deletenotifications': 'true', 'Niid': Niid, 'Nuid': Nuid, 'Mode': Mode, 'Ciid': Ciid}

x = requests.post(url, json = myobj)

print(x.text)