require("dotenv").config();
var PythonShell = require("python-shell");

const getToken = (CLIENT_ID, CLIENT_SECRET) =>
  new Promise(function (resolve, reject) {
    let options = {
      args: [CLIENT_ID, CLIENT_SECRET],
    };
    PythonShell.PythonShell.run("script.py", options, (err, output) => {
      if (err) console.log(err);
      resolve(output[0]);
    });
  });

module.exports = { getToken };
