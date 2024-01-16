import * as supabase from "@nitric/pulumi-supabase";
import { Input } from "@pulumi/pulumi";

// Supabaseのプロジェクトを作成する。
export const createSupabaseProject = (
  name: string,
  organizationId: Input<number>,
  dbPassword: Input<string>,
) =>
  new supabase.projects.Project("supabase-project", {
    name,
    organization_id: organizationId,
    plan: "tier_free",
    region: "Northeast Asia (Tokyo)",
    cloud: "AWS",
    db_pass: dbPassword,
  });
