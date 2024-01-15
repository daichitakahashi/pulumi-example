import { ulidFactory } from "ulid-workers";

import { Buffer } from "node:buffer";

const ulid = ulidFactory({ monotonic: true });

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
  //
  // Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
  // MY_QUEUE: Queue;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const buf = Buffer.from("hello world", "utf8");
    console.log(buf.toString("hex"));
    // Prints: 68656c6c6f20776f726c64
    console.log(buf.toString("base64"));
    // Prints: aGVsbG8gd29ybGQ=

    return new Response(`Hello World! ${ulid()}`);
  },
};
