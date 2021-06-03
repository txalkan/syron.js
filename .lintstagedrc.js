/*
 * Syntax needed because filenames get passed as an argument which
 * makes tsc to ignore the tsconfig file in the project.
 */
const checkTypes = () => 'npx tsc --skipLibCheck --noEmit';

module.exports = {
  '*/**': [
    checkTypes,
    'eslint src --ignore-pattern *.scss',
    'prettier --write --ignore-unknown'
  ]
};
