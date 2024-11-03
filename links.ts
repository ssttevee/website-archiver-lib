export default function createLinkScraper(
  scrapers: Record<
    string,
    (body: ReadableStream<Uint8Array>) => Promise<Iterable<string>>
  >,
): (
  contentType: string | null,
  body: ReadableStream<Uint8Array>,
) => AsyncIterableIterator<string> {
  return async function* (
    contentType: string | null,
    body: ReadableStream,
  ): AsyncGenerator<string> {
    if (contentType && contentType in scrapers) {
      yield* await scrapers[contentType](body);
    }
  };
}
