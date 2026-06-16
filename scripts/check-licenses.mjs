// @ts-check

import { execSync } from "child_process";

const ALLOWED_LICENSES = new Set(["BSD-3-Clause", "CC0-1.0", "ISC", "MIT", "MIT-0", "Python-2.0"]);

/**
 * @type {Partial<Record<string, string[]>>}
 */
const ALLOWED_PACKAGES = {
  Unknown: [],
};

const output = execSync("pnpm licenses list --json", { encoding: "utf-8" });

/**
 * @type {Record<string, { name: string }[]>}
 */
const pnpmLicenses = JSON.parse(output);

const detectedLicenses = Object.keys(pnpmLicenses);
const violatingLicenses = detectedLicenses.filter((lic) => !ALLOWED_LICENSES.has(lic));

if (violatingLicenses.length > 0) {
  const violationEntries = violatingLicenses
    .map((lic) => {
      const packages = pnpmLicenses[lic].map((pkg) => pkg.name);
      const allowedPackages = ALLOWED_PACKAGES[lic] ?? [];
      const violatingPackages = packages.filter((pkg) => !allowedPackages.includes(pkg));
      return /** @type {const} */ ([lic, violatingPackages]);
    })
    .filter(([, pkgs]) => pkgs.length > 0);

  if (violationEntries.length > 0) {
    console.error("License compliance check failed:");
    violationEntries.forEach(([lic, pkgs]) => {
      console.error(`${lic} - ${pkgs.join(", ")}`);
    });
    process.exit(1);
  }
}

console.log("All licenses are compliant.");
