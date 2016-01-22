var babel = require('babel-core');

module.exports = function (wallaby) {
    return {
        files: [
            'index.js',
            'lib/**/*.js'
        ],
        tests: [
            'test/**/*.test.js'
        ],
        compilers: {
            '**/*.js': wallaby.compilers.babel({
                babel: babel,
                presets: ['es2015'],
                plugins: ['transform-runtime']
            })
        },
        env: {
            type: 'node'
        },
        workers: {
            recycle: true
        }
    };
};