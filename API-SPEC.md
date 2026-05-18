REACT_APP_USER_API_URL
endpoint : /users 
schema:

username	"username 1"
password	"password 1"
email	"email 1"
id	"1"

REACT_APP_GAME_AND_FAV_API_URL :

endpoint : /api/v1/games
schema:
[
{
    "id": 1118200,
    "name": "People Playground",
    "genre": [
      "Action",
      "Casual",
      "Indie",
      "Simulation"
    ],
    "platforms": [
      "Windows"
    ],
    "releaseYear": 2019,
    "rating": 9.9,
    "image": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1118200/header.jpg?t=1763123186"
  },
]

endpoint : /api/v1/lists
schema:
id : str
userid : str
gameid : str
status : str