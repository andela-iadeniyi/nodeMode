require('babel-register');

const webpack = require('webpack'),
    dotenv    = require('dotenv')
    fs        = require('fs'),
    path      = require('path'),
    join      = path.join,
    resolve   = path.resolve,
    getConfig = require('hjs-webpack'),
    NODE_ENV  = process.env.NODE_ENV,
    isDev     = NODE_ENV === 'development',
    isTest    = NODE_ENV === 'test',
    root      = resolve(__dirname),
    src       = join(root, 'src'),
    modules   = join(root, 'node_modules'),
    dest      = join(root, 'dist');


const config  = getConfig({
    isDev: isDev,
    in: join(src, 'app.js'),
    out: dest,
    clearBeforeBuild: true
});

if (isTest) {
    config.externals = {
        'react/lib/ReactContext': true,
        'react/lib/ExecutionEnvironment': true
    }

    config.plugins = config.plugins.filter(p => {
        const name = p.constructor.toString();
        const fnName = name.match(/^function (.*)\((.*\))/);

        const idx = [
            'DedupePlugin',
            'UglifyJsPlugin'
        ].indexOf(fnName[1]);

        return idx < 0;
    });
}

config.externals = {
    'react/lib/ReactContext': true,
    'react/lib/ExecutionEnvironment': true,
    'react/addons': true
}

config.resolve.root = [src, modules];
config.resolve.alias =  {
    'css': join(src, 'styles'),
    'containers': join(src, 'containers'),
    'components': join(src, 'components'),
    'utils': join(src, 'utils')
}

config.postcss = [].concat([
    require('precss')({}),
    require('autoprefixer')({}),
    require('cssnano')({})
]);

const cssModuleNames  = `${isDev ? '[path][name]__[local]__':''}[hash:base64:5]`,
    matchCssLoaders = /(^|!)(css-loader)($|!)/;

const findLoader = (loaders, match) => {
    const found = loaders.filter(l => l && l.loader && l.loader.match(match));
    return found ? found[0] : null;
}

const cssloader = findLoader(config.module.loaders, matchCssLoaders);

const newLoader = Object.assign({}, cssloader, {
    test: /\.module\.css$/,
    include: [src],
    loader: cssloader.loader
        .replace(matchCssLoaders, `$1$2?modules&localIdentName=${cssModuleNames}$3`)
});
config.module.loaders.push(newLoader);
cssloader.test = new RegExp(`[^module]${cssloader.test.source}`);
cssloader.loader = newLoader.loader;

config.module.loaders.push({
    test: /\.css$/,
    include: [modules],
    loader: 'style!css'
});

const dotEnvVars = dotenv.config(),
    environmentEnv = dotenv.config({
        path: join(root, 'config', `${NODE_ENV}.config.js`),
        silent: true,
    });
const envVariables = Object.assign({}, dotEnvVars, environmentEnv);

const defines = Object.keys(envVariables).reduce((memo, key) => {
    const val = JSON.stringify(envVariables[key]);
    memo[`__${key.toUpperCase()}__`] = val;
    return memo;
}, {
    __NODE_ENV__: JSON.stringify(NODE_ENV)
});

config.plugins = [
    new webpack.DefinePlugin(defines)
].concat(config.plugins);

module.exports = config;
