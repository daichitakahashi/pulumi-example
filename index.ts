import { Config, getProject, getStack, interpolate } from "@pulumi/pulumi";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { createSupabaseProject } from "./supabase";
import { createWebPage } from "./web";
import { createProxyWorker } from "./workers";

// Project information.

const result = pipe(
  E.Do,

  // 各設定値
  E.let("config", () => {
    const project = getProject();
    const stack = getStack();
    const config = new Config();
    return {
      isProd: stack === "prod",
      prefix: `${project}-${stack}`,
      supabaseOrganizationId: config.requireNumber("supabaseOrganizationId"),
      supabaseDbPassword: config.requireSecret("supabaseDbPassword"),
      supabaseDbCert: config.requireSecret("supabaseDbCert"),
      cfAccountId: config.requireSecret("cfAccountId"),
    };
  }),

  // Supabase: データベース
  E.let("supabase", ({ config }) =>
    createSupabaseProject(
      `${config.prefix}-supabase-project`,
      config.supabaseOrganizationId,
      config.supabaseDbPassword,
    ),
  ),

  // Worker: プロキシ
  E.bind("proxy", ({ config, supabase }) =>
    createProxyWorker(`${config.prefix}-proxy-worker`, {
      accountId: config.cfAccountId,
      postgresDsn: interpolate`postgres://postgres.${supabase.project_ref}:${supabase.db_pass}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`,
      postgresCert: config.supabaseDbCert,
    }),
  ),

  // Pages: Webサイト
  E.let("web", ({ config, proxy }) =>
    createWebPage(`${config.prefix}-web`, {
      isProd: config.isProd,
      accountId: config.cfAccountId,
      proxyWorkerName: proxy.name,
    }),
  ),
);

if (E.isLeft(result)) {
  throw new Error(result.left);
}

// Output:
const { proxy, web } = result.right;
export const proxyWorkerId = proxy.id;
export const webProjectName = web.name;
