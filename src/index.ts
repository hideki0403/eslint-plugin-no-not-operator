import config from './config/config.json'

export = {
    configs: {
        config
    },
    rules: {
        'no-not-operator': require('./rules/no-not-operator'),
    }
}