export interface FetchHook {
  (url: URL): Promise<Response | undefined> | Response | undefined;
}

export type AnyIteratorOrIterable<T> =
  | Iterator<string>
  | Iterable<string>
  | AsyncIterator<string>
  | AsyncIterable<string>;

export type ResponseHookResult =
  | Promise<AnyIteratorOrIterable<string> | undefined>
  | AnyIteratorOrIterable<string>
  | undefined;

export interface ResponseHook {
  (url: URL, res: Response): ResponseHookResult;
}

function getIterator<T>(
  it: AnyIteratorOrIterable<T>,
): Iterator<T> | AsyncIterator<T> {
  if (!(it as any).next) {
    if (Symbol.asyncIterator in it) {
      return it[Symbol.asyncIterator]() as AsyncIterator<T>;
    }

    if (Symbol.iterator in it) {
      return it[Symbol.iterator]() as Iterator<T>;
    }
  }

  return it as any;
}

export interface FetchResourcesOptions {
  baseurl: string;
  entrypaths?: string[];

  /**
   * Fetch function to use. Defaults to globalThis.fetch
   */
  onfetch?: FetchHook;

  /**
   * Called after a url is fetched.
   *
   * If this function returns an iterable of paths, those paths will be fetched.
   *
   * @param url url that was fetched
   * @param res response from fetching url
   * @returns an optional iterable of paths to fetch
   */
  onresponse: ResponseHook;

  concurrency?: number;
}

export default async function fetchResources(
  options: FetchResourcesOptions,
): Promise<void> {
  const fetch = options.onfetch ?? globalThis.fetch;

  const seen = new Set(options.entrypaths?.length ? options.entrypaths : ["/"]);
  const queue = [...seen];

  const maxRequests = options.concurrency ?? 2;
  let activeRequests = 0;

  function startNextJob(): Promise<any> {
    const pathname = queue.shift();
    if (!pathname) {
      return Promise.resolve();
    }

    activeRequests += 1;

    const url = new URL(pathname, options.baseurl);
    const promise = Promise.resolve(fetch(url))
      .then((res) => (res ? options.onresponse(url, res) : undefined))
      .finally(() => {
        activeRequests -= 1;
      })
      .then(async (pathnames) => {
        if (pathnames) {
          const it = getIterator<string>(pathnames);
          while (true) {
            const r = await it.next();
            if (r.done) {
              break;
            }

            let p = r.value;
            if (p[0] !== "/") {
              if (p.startsWith(options.baseurl)) {
                p = p.slice(options.baseurl.length);
              } else {
                continue;
              }
            }

            if (!seen.has(p)) {
              seen.add(p);
              queue.push(p);
            }
          }
        }

        return startNextJob();
      });

    if (activeRequests < maxRequests) {
      return Promise.all([promise, startNextJob()]);
    }

    return promise;
  }

  return startNextJob().then(() => {});
}
