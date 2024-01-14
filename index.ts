import { Config } from "@pulumi/pulumi";
import * as cf from "@pulumi/cloudflare";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";

import { buildWorker } from "./util/wrangler";

const config = new Config();
const cfAccountId = config.require("cf-account-id");

pipe(
  buildWorker("workers/proxy"),
  E.flatMap(({ content, compatibilityDate, compatibilityFlags }) =>
    E.of(
      new cf.WorkerScript("hello-worker", {
        name: "hello-worker",
        accountId: cfAccountId,
        content,
        compatibilityDate,
        compatibilityFlags,
      })
    )
  )
);
