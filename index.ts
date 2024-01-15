import * as cf from "@pulumi/cloudflare";
import { Config, getProject, getStack } from "@pulumi/pulumi";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

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
          }),
        ),
      ),
    ),
  ),
  E.bind("web", ({ proxy }) =>
    E.of(
      new cf.PagesProject("web-pages", {
        accountId: cfAccountId,
        name: `${resourcePrefix}-web`,
        productionBranch: "main",
        buildConfig: {
          rootDir: "web",
          buildCommand: "pnpm build",
          destinationDir: "web/public",
        },
        deploymentConfigs: {
          preview: {
            serviceBindings: [
              {
                name: "WORKER",
                service: proxy.name,
                environment: "production",
              },
            ],
            environmentVariables: {
              STAGE: "DEV",
            },
          },
          production: {
            serviceBindings: [
              {
                name: "WORKER",
                service: proxy.name,
                environment: "production",
              },
            ],
            environmentVariables: {
              STAGE: "PROD",
            },
          },
        },
      }),
    ),
  ),
);

if (E.isLeft(result)) {
  throw new Error(result.left);
}

export const proxyWorkerId = result.right.proxy.id;
