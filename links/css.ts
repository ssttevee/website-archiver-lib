import { byteStreamToString } from "../utils.js";

function* scrapeCssString(css: string): IterableIterator<string> {
  for (const match of css.matchAll(/url\(["']?([^"'\)]+)["']?\)/g)) {
    yield match[1];
  }
}

export default async function scrapeCssLinks(
  body: ReadableStream<Uint8Array>,
): Promise<IterableIterator<string>> {
  return scrapeCssString(await byteStreamToString(body));
}
