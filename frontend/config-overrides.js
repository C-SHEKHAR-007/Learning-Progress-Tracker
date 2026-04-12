module.exports = {
  webpack: function(config, env) {
    if (env === 'development') {
      // Remove HotModuleReplacementPlugin
      config.plugins = config.plugins.filter(
        plugin => plugin.constructor.name !== 'HotModuleReplacementPlugin'
      );
      
      // Remove hot entries from entry points
      if (Array.isArray(config.entry)) {
        config.entry = config.entry.filter(entry => 
          !entry.includes('webpack/hot') && !entry.includes('react-refresh')
        );
      }
    }
    return config;
  },
  devServer: function(configFunction) {
    return function(proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);
      config.hot = false;
      config.liveReload = false;
      config.client = {
        ...config.client,
        webSocketURL: undefined
      };
      return config;
    };
  }
};
