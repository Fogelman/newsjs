const axios = require("axios");

class Request {
  static async get({ url, baseURL, params = {} }) {
    const res = await axios
      .get(url, { baseURL, params })
      .then(({ data }) => data);
    return res;
  }

  static async download({ url, baseURL }) {
    const res = await axios
      .get(url, {
        baseURL,
        responseType: "arraybuffer",
      })
      .then(({ data }) => data);
    return res;
  }
}

module.exports = Request;
