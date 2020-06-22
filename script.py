import requests
import json
import sys

CLIENT_ID = sys.argv[1]
CLIENT_SECRET = sys.argv[2]


grant_type = 'client_credentials'
body_params = {'grant_type': grant_type}

url = 'https://accounts.spotify.com/api/token'
response = requests.post(url, data=body_params,
                         auth=(CLIENT_ID, CLIENT_SECRET))

token_raw = json.loads(response.text)
token = token_raw["access_token"]
print(token)
