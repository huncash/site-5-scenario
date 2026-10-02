// PM2. A GitHub Actions ezt a fájlt indítja a current symlinken.
const SLUG = process.env.SITE_SLUG || "szcenario";
const APP_DIR = `/var/www/${SLUG}`;
const CWD = process.env.RELEASE_DIR || `${APP_DIR}/current`;

// Egy processz: static-origin a 5100-on. Nitro SSR (.output/server/index.mjs) nem indul.
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
      },
      out_file: `/var/log/${SLUG}/out.log`,
      error_file: `/var/log/${SLUG}/err.log`,
      time: true,
    },
  ],
};

function pathJoin(root, rel) {
  return `${String(root).replace(/\/+$/, "")}/${rel.replace(/^\/+/, "")}`;
}
