const yts = require("yt-search");
const scrapingEngine = require("./ScrapingEngine");

let page = null;

getVideoInfo = async (videoName) => {
  if (page == null) page = await scrapingEngine.getNewPage();
  await page.goto(`https://www.youtube.com/results?search_query=${videoName}`);
  container = await page.$$("div.text-wrapper");
  if (container.length == "") {
    await scrapingEngine.closePage(page);
    await scrapingEngine.endInstance();
    page = null;
    return getVideoInfo(videoName);
  }
  const video = await container[0].$eval("a", (el) => {
    return {
      title: el.innerText,
      url: `https://www.youtube.com${el.getAttribute("href")}`,
    };
  });
  return video;
};

module.exports = { getVideoInfo };
