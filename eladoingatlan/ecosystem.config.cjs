// PM2 — eladoingatlan.szcenario.hu → 127.0.0.1:5140
// TILOS: site-1..4 / 3000–3003 / szcenario :5100
// Env: helyezz .env.production-t a cwd-be (Next betölti).

const CWD = process.env.ELADOINGATLAN_DIR || __dirname;

module.exports = {
  apps: [
    {
      name: "eladoingatlan-szcenario",
      cwd: CWD,
      script: "node_modules/next/dist/bin/next",
      args: "start --port 5140",
      instances: 1,
      exec_mode: "fork",
      interpreter: "node",
      max_memory_restart: "384M",
      min_uptime: 5000,
      listen_timeout: 10000,
      kill_timeout: 8000,
      merge_logs: true,
      env: {
        NODE_ENV: "production",
        PORT: "5140",
        HOSTNAME: "127.0.0.1",
      },
      out_file: "/var/log/eladoingatlan/out.log",
      error_file: "/var/log/eladoingatlan/err.log",
      time: true,
    },
  ],
};
