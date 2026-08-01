/* global URL, process */

import { readFile } from "node:fs/promises";

const config = await readFile(new URL("../.dependency-cruiser.cjs", import.meta.url), "utf8");
const requiredRules = ["no-circular", "no-react-island-to-api-import", "no-api-route-to-react-island"];
const missingRules = requiredRules.filter((rule) => !config.includes(`name: "${rule}"`));

if (missingRules.length > 0) {
  process.stderr.write(`Dependency-cruiser configuration is missing required rules: ${missingRules.join(", ")}\n`);
  process.exit(1);
}

process.stdout.write(`Dependency-cruiser configuration declares ${requiredRules.length} required structural rules.\n`);
