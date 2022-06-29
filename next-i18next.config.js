const path = require('path')
module.exports = {
    i18n: {
        defaultLocale: 'en',
        locales: ['en', 'es', 'cn', 'id'],
        localePath: path.resolve('./public/locales'),
    },
}
