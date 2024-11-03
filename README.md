# website-archiver-lib

`website-archiver-lib` is a modular library for archiving/downloading/cloning/scraping websites. It was inspired by other packages like [`website-scraper`](https://www.npmjs.com/package/website-scraper) and [`web-clone`](https://www.npmjs.com/package/web-clone), but with a focus on modularity and extensibility.


## Quick Start

The quickest way to get started is to use the default module export which provides a simple function to archive a website:

```sh
npm install website-archiver-lib cheerio
```

This cheerio is an optional dependency that is used for parsing HTML files. The default module assume you have cheerio installed and are running a compatible version of node.

```js
import download from 'website-archiver-lib';

await download("https://example.com", "outdir");
```

This will download the website at `https://example.com` and save it to the `outdir` directory.

## API

### `downloadResources(url: string, options?: DownloadResourcesOptions)`

This function is similar to the default module export, except it doesn't assume that a node environment is available so dest must be passed in as an object, but is otherwise the same. It is mainly a convenience wrapper for `downloadResources` and `createResponseHandler` that has some reasonable defaults in addition to some more convenient option types.

```js
import downloadResources from 'website-archiver-lib/download';
import createDownloadDestination from 'website-archiver-lib/download/node';

await downloadResources("https://example.com", {
  dest: createDownloadDestination("outdir"),
});
```

### `fetchResources(options: FetchResourcesOptions)`

This low level function is used internally by the `downloadResources` function, but can be used directly if you want more control over the fetching process. It handles deduplication, job queueing, and concurrency.

```js
import fetchResources from 'website-archiver-lib/fetch';
import createDownloadDestination from 'website-archiver-lib/download/node';
import createResponseHandler from 'website-archiver-lib/response';

await fetchResources({
  baseurl: "https://example.com",
  entrypaths: ["/"],
  onresponse: createResponseHandler({
    dest: createDownloadDestination("outdir"),
  }),
});
```
