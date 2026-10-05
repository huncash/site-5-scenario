import { spawn } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";

function run(name, args, extraEnv = {}) {
  const child = spawn(npm, args, {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, ...extraEnv },
  });
  child.on("exit", (code) => {
    console.error(`[dev-sites] ${name} kilépett: ${code}`);
    process.exit(code ?? 1);
  });
  return child;
}

console.log("[dev-sites] bill  → http://127.0.0.1:5110/?tier=pro&interval=yearly&lang=hu");
console.log("[dev-sites] support → http://127.0.0.1:5120/");
console.log("[dev-sites] path    → http://127.0.0.1:5100/bill  és  /support");

run("bill", ["run", "bill:dev"], {
  BILL_PORT: "5110",
  BILL_PUBLIC_URL: "http://127.0.0.1:5110",
});
run("support", ["run", "support:dev"]);
