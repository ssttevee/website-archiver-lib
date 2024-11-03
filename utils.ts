export async function byteStreamToString(
  stream: ReadableStream<Uint8Array>,
): Promise<string> {
  const fragments: string[] = [];
  for await (const chunk of stream.pipeThrough(new TextDecoderStream())) {
    fragments.push(chunk);
  }

  return fragments.join("");
}
