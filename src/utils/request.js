const axios = require("axios");

class Request {
  static async get({ url, baseURL }) {
    const res = await axios.get(url, { baseURL }).then(({ data }) => data);
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
