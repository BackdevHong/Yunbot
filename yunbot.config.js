module.exports = {
  apps: [
    {
      name: 'yunbot',
      script: 'yarn start',
      instances: 0,
      exec_mode: 'cluster',
    }
  ]
}