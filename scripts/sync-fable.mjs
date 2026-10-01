import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const REF = "aea8b1035030952555395de0c1de14ba693a1427";
const URL = `https://github.com/rawprogress/fable-cities/archive/${REF}.tar.gz`;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "skyline-city-"));
const archive = path.join(tmp, "fable.tar.gz");
const unpacked = path.join(tmp, "src");

function copyTree(from, to) {
  fs.mkdirSync(to, { recursive: true });
  fs.cpSync(from, to, {
    recursive: true,
    force: true,
    filter: (source) => !source.includes(`${path.sep}.git${path.sep}`) && !source.endsWith(`${path.sep}.git`),
  });
}

function rewriteTextFiles(root) {
  const skip = new Set([".git", ".github", "node_modules"]);
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue;
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.isFile()) {
        try {
          const text = fs.readFileSync(file, "utf8");
          if (!/^[\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]*$/.test(text)) continue;
          let out = text
            .replaceAll("Fable Cities", "Skyline City")
            .replaceAll("Fable Cities HUD", "Skyline City HUD")
            .replaceAll("fable-cities", "skyline-city")
            .replaceAll("https://fablecities.rawscollections.com", "https://blank-page-buddy-54.lovable.app")
            .replaceAll("https://github.com/rawprogress/fable-cities", "https://github.com/marcosrbertoni-hub/blank-page-buddy-54");
          if (file.endsWith("Config.js")) {
            out = out
              .replace(
                "this.demo = p.has('demo') ? p.get('demo') !== '0' : !this.showcase;",
                "this.demo = p.has('demo') ? p.get('demo') !== '0' : false;",
              )
              .replace(" : 'high';", " : 'medium';");
          }
          if (out !== text) fs.writeFileSync(file, out);
        } catch {}
      }
    }
  };
  walk(root);
}

try {
  console.log("[skyline] downloading Fable Cities base:", REF);
  const response = await fetch(URL, { redirect: "follow" });
  if (!response.ok) throw new Error(`download failed: HTTP ${response.status}`);
  fs.writeFileSync(archive, Buffer.from(await response.arrayBuffer()));

  fs.mkdirSync(unpacked);
  execFileSync("tar", ["-xzf", archive, "-C", unpacked], { stdio: "inherit" });
  const rootDir = fs.readdirSync(unpacked, { withFileTypes: true }).find((e) => e.isDirectory());
  if (!rootDir) throw new Error("archive root not found");
  const source = path.join(unpacked, rootDir.name);

  // Replace the active application, while keeping the project's GitHub/Lovable plumbing.
  for (const name of ["src", "public", "assets", "reference", "docs", "tools"]) {
    fs.rmSync(path.join(ROOT, name), { recursive: true, force: true });
  }
  fs.rmSync(path.join(ROOT, "index.html"), { force: true });
  fs.rmSync(path.join(ROOT, "vite.config.ts"), { force: true });

  for (const name of ["src", "public", "assets", "reference", "docs", "tools"]) {
    const from = path.join(source, name);
    if (fs.existsSync(from)) copyTree(from, path.join(ROOT, name));
  }
  copyTree(path.join(source, "index.html"), path.join(ROOT, "index.html"));
  copyTree(path.join(source, "vite.config.js"), path.join(ROOT, "vite.config.js"));

  rewriteTextFiles(ROOT);
  console.log("[skyline] base installed and rebranded");
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
