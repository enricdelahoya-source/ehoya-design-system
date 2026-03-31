# ERP Design System Lab

Exploration of a token-driven design system built with React and Tailwind v4, focused on complex, enterprise-style products.

This project is not a UI showcase.  
It’s a system-first approach to defining structure, interaction, and scalability.

---

## Context

Enterprise tools (ERP, case management, admin systems) are:

- dense
- constraint-heavy
- interaction-driven
- often inconsistent over time

This project explores how to bring:

- clarity
- consistency
- and extensibility

through a code-driven design system.

---

## Principles

- **Structure over decoration**  
  Visual decisions should reinforce hierarchy and usability, not aesthetics alone.

- **Semantic tokens**  
  No raw values. Everything maps to meaning (surface, text, action, feedback).

- **Interaction clarity**  
  Hover, focus, and states are part of the system, not afterthoughts.

- **Scalable primitives**  
  Components encode behavior, not just appearance.

- **Pragmatism over purity**  
  System decisions are balanced with implementation constraints.

---

## Stack

- React + Vite
- TypeScript
- Tailwind v4 (`@theme`)
- CSS variables for tokens

---

## Current Scope

### Tokens

- Color system
  - surfaces, text, actions, feedback
- Spacing (rem-based scale)
- Semantic spacing (inline, stack, section)
- Radius, shadows
- Control heights and typography

### Components

- Button
  - variants: primary, secondary, ghost
  - sizes: sm, md
  - states: hover, active, focus, disabled

### Interaction model

- Primary → surface-driven (filled)
- Secondary → structure-driven (border)
- Ghost → text-driven (minimal)

Hover and active states are aligned across variants to reduce noise and improve consistency.

---

## Playground

A small UI is used to validate:

- hierarchy
- spacing
- states
- token behavior

This acts as a testing surface rather than a final product.

---

## Next Steps

- Input component (labels, errors, focus states)
- Form patterns
- Table / list patterns
- Case management application (real use case)
- AI layer:
  - case summarization
  - timeline structuring
  - next-step suggestions
  - grounded recommendations

---

## Goal

To build a system that:

- handles complexity (not just simple UI)
- bridges design and engineering
- supports real workflows
- integrates AI in a controlled, explainable way

---

## Notes

This is an evolving system.

Decisions are intentionally iterative:
- define → test → adjust → scale

The focus is not visual polish, but system clarity.







# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
