import { Buffer } from "node:buffer";
import { Client } from "pg";
import { ulidFactory } from "ulid-workers";

const ulid = ulidFactory({ monotonic: true });

export interface Env {
  POSTGRES_DSN: string;
  POSTGRES_CERT: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    // SSLモードでDBに接続する。
    const db = new Client({
      connectionString: env.POSTGRES_DSN,
      ssl: {
        rejectUnauthorized: true,
        ca: env.POSTGRES_CERT,
      },
    });
    const result = await db.query("select * from users");
    const rows = JSON.stringify(result.rows);

    const buf = Buffer.from("hello world", "utf8");
    console.log(buf.toString("hex"));
    // Prints: 68656c6c6f20776f726c64
    console.log(buf.toString("base64"));
    // Prints: aGVsbG8gd29ybGQ=

    ctx.waitUntil(db.end());

    return new Response(`Hello World! ${ulid()}, ${rows}`);
  },
};
