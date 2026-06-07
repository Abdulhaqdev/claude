/** PM2 production config — Docker'siz ishga tushirish */
module.exports = {
  apps: [
    {
      name: "nexus-app",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000 -H 0.0.0.0",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "450M",
      env_file: ".env",
      env: {
        NODE_ENV: "production",
      },
      error_file: "./logs/app-error.log",
      out_file: "./logs/app-out.log",
      merge_logs: true,
      time: true,
    },
    {
      name: "nexus-worker",
      cwd: __dirname,
      script: "node_modules/.bin/tsx",
      args: "src/workers/index.ts",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env_file: ".env",
      env: {
        NODE_ENV: "production",
      },
      error_file: "./logs/worker-error.log",
      out_file: "./logs/worker-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
