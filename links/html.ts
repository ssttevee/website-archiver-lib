import * as cheerio from "cheerio";
import { byteStreamToString } from "../utils.js";

export interface HTMLMatcher {
  selector: string;
  attr: string;
  regex?: RegExp;
}

export const defaultMatchers: HTMLMatcher[] = [
  { selector: "a", attr: "href" },
  { selector: 'link[rel="stylesheet"]', attr: "href" },
  { selector: "img", attr: "src" },
  { selector: "img", attr: "srcset", regex: /(?:^|,)([^\s]+)(?:\s+|$)/g },
];

function* scrapeHtmlString(
  matchers: HTMLMatcher[],
  html: string,
): IterableIterator<string> {
  const $ = cheerio.load(html);
  for (const { selector, attr, regex } of matchers) {
    for (const el of $(selector)) {
      const value = $(el).attr(attr);
      if (value) {
        if (regex) {
          for (const match of value.matchAll(regex)) {
            yield match[1];
          }
        } else {
          yield value;
        }
      }
    }
  }
}

export function createHtmlLinkScraper(
  matchers: HTMLMatcher[],
): (body: ReadableStream) => Promise<IterableIterator<string>> {
  return async function (body) {
    return scrapeHtmlString(matchers, await byteStreamToString(body));
  };
}

export default async function scrapeHtmlLinks(
  body: ReadableStream,
): Promise<IterableIterator<string>> {
  return scrapeHtmlString(defaultMatchers, await byteStreamToString(body));
}
