require("dotenv").config();

const spotifyTokenGenerator = require("./spotifyTokenGenerator");

const SpotifyWebApi = require("spotify-web-api-node");
const spotifyApi = new SpotifyWebApi();

getTopHits = () =>
  new Promise(async (resolve, reject) => {
    const token = await spotifyTokenGenerator.getToken(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET
    );
    spotifyApi.setAccessToken(token);

    spotifyApi.getPlaylist("37i9dQZF1DXcBWIGoYBM5M").then(
      function (data) {
        songs = data.body.tracks.items.map(
          (el) => el.track.artists[0].name + " - " + el.track.name
        );
        resolve(songs);
      },
      function (err) {
        resolve(err);
      }
    );
  });

module.exports = { getTopHits };
