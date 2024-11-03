import fs from "node:fs";
import stream from "node:stream";
import path from "node:path";
import type { DownloadDestination } from "../response.js";

export default function createDownloadDestination(
  outdir: string,
): DownloadDestination {
  return {
    async createWritableStream(pathname) {
      const filepath = path.join(outdir, pathname);
      await fs.promises.mkdir(path.dirname(filepath), { recursive: true });
      return stream.Writable.toWeb(fs.createWriteStream(filepath));
    },
  };
}
