import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const resp = await context.env.WORKER.fetch("https://example.com");
  const text = await resp.text();
  return {
    text,
    stage: context.env.STAGE,
  };
};

export default function Index() {
  const { text, stage } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Remix</h1>
      <div>This stage is {stage}</div>
      <div>{text}</div>
    </div>
  );
}
