// PM2 — kézi üzemeltetés. A GitHub Actions közvetlen pm2 startot használ.
const SLUG = process.env.SITE_SLUG || "szcenario";
const APP_DIR = `/var/www/${SLUG}`;

module.exports = {
  apps: [
    {
      name: SLUG,
      script: ".output/server/index.mjs",
      cwd: `${APP_DIR}/current`,
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "512M",
      node_args: `--env-file=${APP_DIR}/shared/.env.production`,
      out_file: `/var/log/${SLUG}/out.log`,
      error_file: `/var/log/${SLUG}/err.log`,
      time: true,
    },
  ],
};
