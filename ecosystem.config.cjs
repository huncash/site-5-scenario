// PM2. A GitHub Actions ezt a fájlt indítja a current symlinken.
const SLUG = process.env.SITE_SLUG || "szcenario";
const APP_DIR = `/var/www/${SLUG}`;
const CWD = process.env.RELEASE_DIR || `${APP_DIR}/current`;

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
      env: {
        NODE_ENV: process.env.NODE_ENV || "production",
        HOST: process.env.HOST || "127.0.0.1",
        PORT: process.env.PORT || process.env.NITRO_PORT || "4100",
        STATIC_ROOT: process.env.STATIC_ROOT || pathJoin(CWD, ".output/public"),
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
