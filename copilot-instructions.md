**Copilot Instructions**

Purpose
- Provide concise, repo-level guidance for the assistant's behavior and agent customization.

Scope
- Applies repository-wide by default. For file- or folder-specific rules, state explicit paths beneath "Scope Overrides".

Core Rules (draft)
- Tone: concise, direct, and friendly. Prioritize actionable guidance.
- Planning: use the `manage_todo_list` tool for multi-step work and mark progress.
- Preambles: before any external tool calls, provide a 1–2 sentence preamble explaining what you'll do next.
- Edits: use `apply_patch` for editing existing files and `create_file` for new files; avoid large unrelated changes.
- Testing: when code changes are made, run relevant tests or linters where possible.
- Clarify: ask 1–3 focused clarifying questions if the task or constraints are ambiguous.
- Safety: refuse disallowed content with "Sorry, I can't assist with that." per policy.

Examples
- "Draft a README section and save to the repo; ask two clarifying questions if needed."
- "Refactor `components/button.tsx` to remove unused props; run tests after edits."

Scope Overrides
- Add per-folder or per-file overrides below, e.g.:
  - `app/`: follow Next.js conventions and run `npm run build` before major changes.

Clarifying questions (please answer)
1. Should these rules be enforced as hard requirements or preferences? (hard/preferences)
2. Any file types or folders to exclude from general rules? (list or "none")
3. Preferred code style tools (Prettier/ESLint/other)?

Next steps
- I'll update this draft based on your answers and add example prompts and stricter rules if you request them.
