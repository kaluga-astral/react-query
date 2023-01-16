// eslint-disable-next-line
module.exports = {
  'package/**/*.{ts}': [
    'npm run lint --workspace=@astral/react-query',
    () => 'npm run lint:types --workspace=@astral/react-query',
  ],
  'pack/**/*.{js}': ['npm run lint --workspace=@astral/pack'],
  'PRLinter/**/*.{js}': ['npm run lint --workspace=@astral/PRLinter'],
};
