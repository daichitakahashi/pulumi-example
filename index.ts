import * as supabase from "@nitric/pulumi-supabase";
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

const org = new supabase.organizations.Organization("my-org", {
  name: "my-org",
  tier: "tier_free",
});

const proj = new supabase.projects.Project("supabase-project", {
  name: `${resourcePrefix}-supabase-project`,
  organization_id: org.organization_id,
  plan: "tier_free",
  region: "Northeast Asia (Tokyo)",
  cloud: "AWS",
  db_pass: "",
});

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
        productionBranch: stack === "prod" ? "main" : "dev",
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
              STAGE: stack === "prod" ? "PROD" : "DEV",
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
              STAGE: stack === "prod" ? "PROD" : "DEV",
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

// Output:
const { proxy, web } = result.right;
export const proxyWorkerId = proxy.id;
export const webProjectName = web.name;
