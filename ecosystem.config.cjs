// PM2. A GitHub Actions ezt a fájlt indítja a current symlinken.
const SLUG = process.env.SITE_SLUG || "szcenario";
const APP_DIR = `/var/www/${SLUG}`;
const CWD = process.env.RELEASE_DIR || `${APP_DIR}/current`;

// static-origin a 5100-on (SPA). bill-app a 5110-en (/api/billing).
// Nitro SSR (.output/server/index.mjs) nem indul.
module.exports = {
  apps: [
    {
      name: SLUG,
      script: pathJoin(CWD, "scripts/static-origin.mjs"),
      cwd: CWD,
      instances: 1,
      exec_mode: "fork",
      interpreter: "node",
      max_memory_restart: "512M",
      min_uptime: 5000,
      listen_timeout: 10000,
      kill_timeout: 8000,
      merge_logs: true,
      env: {
        NODE_ENV: process.env.NODE_ENV || "production",
        HOST: process.env.HOST || "127.0.0.1",
        PORT: process.env.PORT || process.env.NITRO_PORT || "5100",
        STATIC_ROOT: process.env.STATIC_ROOT || pathJoin(CWD, ".output/public"),
        BUILD_SHA: process.env.BUILD_SHA || "",
        BILL_PORT: process.env.BILL_PORT || "5110",
      },
      out_file: `/var/log/${SLUG}/out.log`,
      error_file: `/var/log/${SLUG}/err.log`,
      time: true,
    },
    {
      name: "bill-app",
      script: pathJoin(CWD, ".output/bill-server.mjs"),
      cwd: CWD,
      instances: 1,
      exec_mode: "fork",
      interpreter: "node",
      max_memory_restart: "256M",
      min_uptime: 5000,
      listen_timeout: 10000,
      kill_timeout: 8000,
      merge_logs: true,
      env: {
        NODE_ENV: "production",
        BILL_PORT: process.env.BILL_PORT || "5110",
        BILL_PUBLIC_URL: process.env.BILL_PUBLIC_URL || "https://bill.szcenario.hu",
        BILL_DATA_DIR: process.env.BILL_DATA_DIR || pathJoin(APP_DIR, "shared/bill-data"),
      },
      out_file: `/var/log/${SLUG}/bill-out.log`,
      error_file: `/var/log/${SLUG}/bill-err.log`,
      time: true,
    },
  ],
};

function pathJoin(root, rel) {
  return `${String(root).replace(/\/+$/, "")}/${rel.replace(/^\/+/, "")}`;
}
