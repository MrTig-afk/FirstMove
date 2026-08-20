import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // useMultiTouch is a timer-driven multi-touch state machine and
    // useCardDeck mirrors its loading pattern. Both use the latest-value-ref
    // and setState-in-effect idioms that eslint-plugin-react-hooks' compiler
    // rules flag; the compliant rewrites change WHEN values update relative
    // to touch events, which is exactly what this code is sensitive to.
    // Deliberately disabled per-file rather than "fixed" blind - revisit only
    // if these hooks are rewritten. 2026-08-20.
    files: ['src/hooks/useMultiTouch.js', 'src/hooks/useCardDeck.js'],
    rules: {
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
