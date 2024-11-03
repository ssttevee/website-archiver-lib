import type { AnyIteratorOrIterable, ResponseHookResult } from "./fetch";

function isAnyIteratorOrIterable<T>(v: any): v is AnyIteratorOrIterable<T> {
  return (
    (v as any).next ||
    Symbol.asyncIterator in v ||
    Symbol.iterator in v ||
    false
  );
}

function iteratorFinalizer<T>(
  it: AnyIteratorOrIterable<T>,
  finalizer: () => Promise<void>,
): AnyIteratorOrIterable<T> {
  let done = false;
  if (!(it as any).next) {
    if (Symbol.asyncIterator in it) {
      return {
        [Symbol.asyncIterator]() {
          return iteratorFinalizer(it[Symbol.asyncIterator](), finalizer);
        },
      } as any;
    }

    if (Symbol.iterator in it) {
      return {
        [Symbol.iterator]() {
          return iteratorFinalizer(it[Symbol.iterator](), finalizer);
        },
      } as any;
    }

    throw new Error("invalid iterator or iterable");
  }

  return {
    next() {
      const result = (it as any).next();
      if (result instanceof Promise) {
        return result.then(async (result) => {
          if (result.done && !done) {
            done = true;
            await finalizer();
          }

          return result;
        });
      }

      if (result.done && !done) {
        done = true;
        return finalizer().then(() => result);
      }

      return result;
    },
  } as any;
}

export interface FixExtensionHook {
  (filepath: string, contentType: string | null): string | undefined;
}

export interface DownloadDestination {
  createWritableStream(
    pathname: string,
  ): Promise<WritableStream<Uint8Array>> | WritableStream;
}

export interface ScrapeLinksHook {
  (
    contentType: string | null,
    body: ReadableStream<Uint8Array>,
  ): ResponseHookResult;
}

export interface ResponseHandlerOptions {
  dest: DownloadDestination;
  fixextension?: FixExtensionHook;
  scrapelinks?: ScrapeLinksHook;
}

export default function createResponseHandler(options: ResponseHandlerOptions) {
  return async (
    url: URL,
    res: Response,
  ): Promise<Awaited<ResponseHookResult>> => {
    if (res.status !== 200) {
      throw new Error(`Failed to fetch ${url}: ${res.status}`);
    }

    if (!res.body) {
      // no body means nothing to do
      return;
    }

    const contentType = res.headers.get("content-type");
    const writableStream = await options.dest.createWritableStream(
      options.fixextension?.(url.pathname, contentType) ?? url.pathname,
    );
    const [a, b] = res.body.tee();
    const ap = a.pipeTo(writableStream);
    const bp = options.scrapelinks?.(contentType, b);

    return Promise.all([ap, bp]).then(([, paths]) =>
      isAnyIteratorOrIterable(paths)
        ? iteratorFinalizer(paths, () => b.cancel())
        : b.cancel().then(() => paths),
    );
  };
}
