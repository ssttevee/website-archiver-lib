import { type DownloadDestination } from "./response.js";

import downloadResources, {
  type DownloadResourcesOptions,
} from "./download.js";
import createDownloadDestination from "./download/node.js";

export default function (
  url: string,
  outdir: string | DownloadDestination,
  options: Omit<DownloadResourcesOptions, "dest">,
): Promise<void> {
  return downloadResources(url, {
    ...options,
    dest:
      typeof outdir === "string" ? createDownloadDestination(outdir) : outdir,
  });
}

export {
  default as createExtensionFixer,
  defaultExtensionsMap,
} from "./extensions.js";
export { default as fetchResources } from "./fetch.js";
export { default as createLinkScraper } from "./links.js";
export { default as defaultLinkScraperDict } from "./links/default.js";
export { default as createResponseHandler } from "./response.js";
export { byteStreamToString } from "./utils.js";

export { DownloadResourcesOptions, createDownloadDestination };

export type * from "./response.js";
export type * from "./download.js";
export type * from "./fetch.js";
