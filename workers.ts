import * as cf from "@pulumi/cloudflare";
import { Input } from "@pulumi/pulumi";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { buildWorker } from "./util/wrangler";

export const createProxyWorker = (
  name: string,
  args: {
    accountId: Input<string>;
    postgresDsn: Input<string>;
    postgresCert: Input<string>;
  },
) =>
  pipe(
    buildWorker("workers/proxy"),
    E.flatMap(({ content, compatibilityDate, compatibilityFlags }) =>
      E.of(
        new cf.WorkerScript("proxy-worker", {
          name,
          accountId: args.accountId,
          module: true,
          content,
          compatibilityDate,
          compatibilityFlags,
          plainTextBindings: [
            {
              name: "POSTGRES_DSN",
              text: args.postgresDsn,
            },
          ],
          secretTextBindings: [
            {
              name: "POSTGRES_CERT",
              text: args.postgresCert,
            },
          ],
        }),
      ),
    ),
  );
