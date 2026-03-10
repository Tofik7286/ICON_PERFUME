module.exports = {
    apps: [
      {
        name: 'hidelifestyle-uk',
        script: 'npm',
        args: 'start',
        env: {
          NODE_ENV: 'production',
          PORT: 4019
        }
      }
    ]
  };

