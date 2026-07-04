import { readFile, stat } from "fs/promises";
import { join } from "path";

const VIDEO_PATH = join(
  process.cwd(),
  "upload",
  "YTDown_YouTube_That-Time-I-Got-Reincarnated-as-a-Slime-_Media_Y2B6dARUEqo_001_1080p (1)(1).mp4"
);

export async function GET(request: Request) {
  try {
    const { headers } = request;

    const fileStat = await stat(VIDEO_PATH);
    const fileSize = fileStat.size;

    // Parse range header for seeking support
    const rangeHeader = headers.get("range");
    let start = 0;
    let end = fileSize - 1;

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        start = parseInt(match[1], 10);
        if (match[2]) {
          end = parseInt(match[2], 10);
        }
      }
    }

    const chunkSize = end - start + 1;

    const fileBuffer = await readFile(VIDEO_PATH, {
      encoding: null,
    });

    const slice = fileBuffer.slice(start, end + 1);

    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", "video/mp4");
    responseHeaders.set("Content-Length", chunkSize.toString());
    responseHeaders.set("Accept-Ranges", "bytes");
    responseHeaders.set("Content-Range", `bytes ${start}-${end}/${fileSize}`);
    responseHeaders.set("Cache-Control", "public, max-age=86400");
    responseHeaders.set("Access-Control-Allow-Origin", "*");

    if (rangeHeader) {
      return new Response(slice, {
        status: 206,
        headers: responseHeaders,
      });
    }

    return new Response(slice, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Video streaming error:", error);
    return new Response("Video not found", { status: 404 });
  }
}