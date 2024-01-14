import * as cf from "@pulumi/cloudflare";

new cf.D1Database("", {
  accountId: "",
  name: "",
});

const q = new cf.Queue("", {
  accountId: "",
  name: "",
});

new cf.WorkerScript("", {
  name: "",
  accountId: "",
  content: "",
  queueBindings: [
    {
      binding: "",
      queue: q.name,
    },
  ],
});
