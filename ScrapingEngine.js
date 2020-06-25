const puppeteer = require("puppeteer-extra");
const os = require("os");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const userAgent = require("user-agents");

let browser = null;

const getChromiumExecPath = () => {
  return os.platform() === "win32"
    ? puppeteer.executablePath().replace("app.asar", "app.asar.unpacked")
    : puppeteer.executablePath();
};

const startBrowser = async () => {
  puppeteer.use(StealthPlugin());
  browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
};

module.exports = {
  getNewPage: async (cookies, fullLoad) => {
    if (!browser) await startBrowser();
    let page = await browser.newPage();
    await page.setUserAgent(userAgent.toString());
    if (cookies) await page.setCookie(...cookies);
    page.setViewport({ width: 1366, height: 4000 });
    if (!fullLoad) {
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        if (
          req.resourceType() == "image" ||
          req.resourceType() == "stylesheet" ||
          req.resourceType() == "font"
        ) {
          req.abort();
        } else {
          req.continue();
        }
      });
    }
    return page;
  },
  closePage: async (page) => {
    try {
      page.close();
    } catch (e) {}
  },
  endInstance: async () => {
    if (!browser) return;
    await browser.close();
    browser = null;
  },
  isUp: async () => {
    return browser;
  },
};
