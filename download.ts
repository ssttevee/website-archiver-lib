import createExtensionFixer, { defaultExtensionsMap } from "./extensions.js";
import defaultLinkScraperDict from "./links/default.js";
import fetchResources, {
  type FetchResourcesOptions,
  type FetchHook,
} from "./fetch.js";
import createLinkScraper from "./links.js";
import createResponseHandler, {
  DownloadDestination,
  FixExtensionHook,
  ScrapeLinksHook,
} from "./response.js";

export interface DownloadResourcesOptions
  extends Omit<FetchResourcesOptions, "onresponse" | "baseurl"> {
  dest: DownloadDestination;
  fixextension?: FixExtensionHook | Record<string, string>;
  scrapelinks?:
    | ScrapeLinksHook
    | Record<
        string,
        (body: ReadableStream<Uint8Array>) => Promise<Iterable<string>>
      >;
}

export default function downloadResources(
  url: string,
  options: DownloadResourcesOptions,
) {
  const parsed = new URL(url);
  return fetchResources({
    baseurl: parsed.origin,
    entrypaths: [...(options.entrypaths ?? []), parsed.pathname].map((p) =>
      p.startsWith("/") ? p : `/${p}`,
    ),
    concurrency: options.concurrency,
    onfetch: options.onfetch,

    onresponse: createResponseHandler({
      dest: options.dest,
      fixextension:
        typeof options.fixextension === "function"
          ? options.fixextension
          : createExtensionFixer(options.fixextension ?? defaultExtensionsMap),
      scrapelinks:
        typeof options.scrapelinks === "function"
          ? options.scrapelinks
          : createLinkScraper(options.scrapelinks ?? defaultLinkScraperDict),
    }),
  });
}
