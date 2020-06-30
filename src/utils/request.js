const axios = require("axios");

class Request {
  static async get({ url, baseURL }) {
    const res = axios.get(url, { baseURL }).then(({ data }) => data);
    return res;
  }
}

module.exports = Request;
