const path = require('path')
module.exports = {
    i18n: {
        defaultLocale: 'en',
        locales: ['en', 'es', 'cn', 'id', 'ru'],
        localePath: path.resolve('./public/locales'),
    },
}
