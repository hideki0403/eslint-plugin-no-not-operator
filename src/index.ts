import config from './config/config.json'

// rules
import noNotOperator from './rules/no-not-operator'

export default {
    configs: {
        config
    },
    rules: {
        'no-not-operator': noNotOperator,
    }
}