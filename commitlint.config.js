// eslint-disable-next-line import/no-extraneous-dependencies
const { createConfig } = require('@astral/commitlint-config');

module.exports = createConfig({ scopes: packagesNames, ticketPrefix: 'UIKIT' });
