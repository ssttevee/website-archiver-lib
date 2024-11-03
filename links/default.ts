import scrapeHtmlLinks from "./html.js";
import scrapeCssLinks from "./css.js";

export default {
  "text/html": scrapeHtmlLinks,
  "text/css": scrapeCssLinks,
};
