import * as cf from "@pulumi/cloudflare";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { Input } from "@pulumi/pulumi";

import { buildWorker } from "./util/wrangler";

export const createProxyWorker = (
  name: string,
  args: {
    accountId: Input<string>;
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
        }),
      ),
    ),
  );
