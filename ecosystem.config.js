module.exports = {
  apps: [{
    name: 'geolocalizacao-service',
    script: './dist/src/main.js',
    env: {
      NODE_ENV: 'dev'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};