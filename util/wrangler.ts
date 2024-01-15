import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import * as IOE from "fp-ts/IOEither";
import { pipe } from "fp-ts/function";
import * as toml from "toml";
import * as z from "zod";

const wranglerTomlSchema = z.object({
  main: z.string().min(0),
  compatibility_date: z.string().min(0),
  compatibility_flags: z.array(z.string().min(0)),
  build: z.object({
    command: z.string().min(0),
  }),
});

const readWranglerToml = () =>
  pipe(
    readFileSync("wrangler.toml").toString(),
    toml.parse,
    wranglerTomlSchema.parse,
  );

export const buildWorker = (dir: string) =>
  pipe(
    IOE.bracket(
      IOE.of({ cwd: process.cwd(), chdir: process.chdir(dir) }),
      () =>
        pipe(
          IOE.Do,
          IOE.bind("config", () =>
            IOE.tryCatch(
              () => readWranglerToml(),
              (e) => `${e}`,
            ),
          ),
          IOE.bindW("build", ({ config }) =>
            IOE.tryCatch(
              () => execSync(config.build.command),
              (e) => `${e}`,
            ),
          ),
          IOE.flatMap(({ config }) =>
            IOE.of({
              content: readFileSync(config.main).toString(),
              compatibilityDate: config.compatibility_date,
              compatibilityFlags: config.compatibility_flags,
            }),
          ),
        ),
      ({ cwd }) => IOE.of(process.chdir(cwd)),
    ),
  )();
