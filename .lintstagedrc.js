/*
 * Syntax needed because filenames get passed as an argument which
 * makes tsc to ignore the tsconfig file in the project.
 */
const checkTypes = () => 'npx tsc --skipLibCheck --noEmit';

module.exports = {
  'src/*.{js,jsx,ts,tsx}': [
    checkTypes,
    'eslint src',
    'prettier --write --ignore-unknown'
  ]
};
