/**
 * PM2 Production Configuration
 * Usage: pm2 start infra/pm2/production.config.js
 */

module.exports = {
  apps: [
    {
      name: 'funnelos-backend',
      cwd: process.cwd(),
      script: './apps/backend/src/index.js',
      instances: 4,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
