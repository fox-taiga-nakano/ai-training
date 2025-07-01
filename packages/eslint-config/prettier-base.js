/** @type {import("prettier").Config} */
module.exports = {
  plugins: [
    '@trivago/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrder: [
    '^(react)',
    '^(next)',
    '<THIRD_PARTY_MODULES>',
    '^(@/lib)',
    '^(@/metadata)',
    '^(@/const)',
    '^(@/providers|@/atoms|@/hooks|@/contexts|@/components|@/svg|@/pages|@/interfaces|@/app)',
    '^(@/styles|(.*).css+$)',
    '^[./]',
  ],
  importOrderParserPlugins: [
    'typescript',
    'jsx',
    'classProperties',
    'decorators-legacy',
  ],
  semi: true,
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  trailingComma: 'es5',
  bracketSameLine: false,
  singleAttributePerLine: false,
};
