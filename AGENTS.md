# AGENTS.md

## Read first
- Always read `CONTRACT.md` before making changes
- Follow its rules strictly

## Core rules
- Use semantic tokens (no hardcoded values)
- Preserve existing component APIs
- Edit the smallest possible surface
- Prefer consistency over cleverness

## Components
- Button and Input define control sizing
- Keep alignment consistent across all controls
- Do not create new variants unless explicitly asked
- Do not duplicate components

## Styling
- Use shared spacing and typography rules
- Maintain visual balance (padding, line-height, font-size)
- Avoid decorative styling (gradients, shadows, random colors)

## Forms
- Keep label, field, helper aligned
- Maintain consistent spacing rhythm
- Read-only fields should remain legible and structured

## Changes
- Do not modify unrelated files
- Do not rename props, variants, or files unnecessarily
- Prefer adjusting existing logic over adding new logic

## When unsure
- Follow existing patterns
- Choose the most reusable and simple solution

## Commands
- run dev: npm run dev
