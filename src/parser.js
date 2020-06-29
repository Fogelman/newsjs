const cheerio = require("cheerio");

class Parser {
  static link(html) {
    const doc = cheerio.load(html);
    const arr = [];
    doc(".artifact-description").each((i, el) => {
      const author = doc(el).find(".artifact-author > span").text().trim();
      const link = doc(el).find("a");
      const title = link.text();
      const href = link.attr("href");
      const citation = doc(el).find("span.citation").text();
      const date = doc(el).find("span.date").text();

      arr.push({
        title,
        href,
        author,
        citation,
        date,
      });
    });

    return arr;
  }

  static files(html) {
    const doc = cheerio.load(html);
    const files = [];
    doc(".file-wrapper").each((i, el) => {
      const props = doc(el).find(".file-metadata span:not([class])");
      const href = doc(el).find(".file-link a").attr("href");

      files.push({
        name: props.eq(0).text(),
        size: props.eq(1).text(),
        filetype: props.eq(2).text(),
        href,
      });
    });

    return files;
  }
}

module.exports = Parser;
