const axios = require("axios");
const apiUrl = "https://api.publicapis.org/entries";

const getData = (req, res, next) => {
  return new Promise((res, reject) => {
    axios
      .get(apiUrl)
      .then((response) => {
        res(response.data);
      })
      .catch((err) => {
        rej(err);
      });
  });
};

module.exports = getData;
