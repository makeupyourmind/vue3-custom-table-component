// eslint-disable-next-line @typescript-eslint/no-var-requires
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  css: {
    extract: false,
    loaderOptions: {
      sass: {},
    },
  },
  configureWebpack: (config) => {
    config.devtool = 'source-map';
    config.plugins = [
      ...config.plugins,
      new CompressionPlugin({
        filename: '[path][base].br',
        algorithm: 'brotliCompress',
        test: /\.js$/,
      }),
    ];
  },
  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg');
    svgRule.uses.clear();

    svgRule
      .test(/\.svg$/)
      .use('svg-url-loader')
      .loader('svg-url-loader');
  },
  devServer: {
    before(app) {
      app.use('*.js', (req, res, next) => {
        if (req.get('Accept-Encoding')?.includes('br')) {
          req.url += '.br';

          res.set('Content-Encoding', 'br');
          res.set('Content-Type', 'application/javascript; charset=utf-8');
        }
        next();
      });
    },
  },
};
