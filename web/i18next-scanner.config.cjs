module.exports = {
  input: ['src/**/*.{ts,tsx}'],
  output: './',
  options: {
    func: { list: ['t', 'i18next.t'], extensions: ['.tsx', '.ts'] },
    lngs: ['en', 'hi'],
    ns: ['translation'],
    defaultLng: 'en',
    defaultNs: 'translation',
    resource: {
      loadPath: 'src/i18n/locales/{{lng}}.json',
      savePath:  'src/i18n/locales/{{lng}}.json',
      jsonIndent: 2,
    },
    nsSeparator: false,
    keySeparator: false,
  },
}
