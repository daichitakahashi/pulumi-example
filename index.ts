import { Config, getProject, getStack } from "@pulumi/pulumi";
import * as cf from "@pulumi/cloudflare";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";

import { buildWorker } from "./util/wrangler";

// Project information.
const project = getProject();
const stack = getStack();
const resourcePrefix = `${project}-${stack}`;

const config = new Config();
const cfAccountId = config.requireSecret("cfAccountId");

const result = pipe(
  E.Do,
  E.bind("proxy", () =>
    pipe(
      buildWorker("workers/proxy"),
      E.flatMap(({ content, compatibilityDate, compatibilityFlags }) =>
        E.of(
          new cf.WorkerScript("proxy-worker", {
            name: `${resourcePrefix}-proxy-worker`,
            accountId: cfAccountId,
            module: true,
            content,
            compatibilityDate,
            compatibilityFlags,
          })
        )
      )
    )
  )
);

if (E.isLeft(result)) {
  throw new Error(result.left);
}

export const proxyWorkerId = result.right.proxy.id;
