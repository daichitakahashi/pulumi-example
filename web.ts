import * as cf from "@pulumi/cloudflare";
import { Input } from "@pulumi/pulumi";

export const createWebPage = (
  name: string,
  args: {
    isProd: boolean;
    accountId: Input<string>;
    proxyWorkerName: Input<string>;
  },
) =>
  new cf.PagesProject("web-pages", {
    accountId: args.accountId,
    name,
    productionBranch: args.isProd ? "main" : "dev",
    deploymentConfigs: {
      preview: {
        serviceBindings: [
          {
            name: "WORKER",
            service: args.proxyWorkerName,
            environment: "production",
          },
        ],
        environmentVariables: {
          STAGE: args.isProd ? "PROD" : "DEV",
        },
      },
      production: {
        serviceBindings: [
          {
            name: "WORKER",
            service: args.proxyWorkerName,
            environment: "production",
          },
        ],
        environmentVariables: {
          STAGE: args.isProd ? "PROD" : "DEV",
        },
      },
    },
  });
