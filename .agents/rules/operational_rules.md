# SkillNova Project Operational Rules & Safety Guidelines

These rules are strictly enforced across all development and refactoring sessions:

1. **Commit or Back Up First:**
   - Always commit or back up the working project before initiating large architectural or multi-file changes.
   - Maintain a clean Git working tree with descriptive commit messages.

2. **Inspect Before Editing:**
   - Always inspect and review all relevant files, dependencies, and types thoroughly before modifying code.

3. **Strict Secrets & Security Protection:**
   - Never stage, commit, or push `.env`, secrets, private keys, database connection strings, passwords, or credentials to Git/GitHub.
   - Verify `.gitignore` rules before any commit.

4. **Build Validation & Flow Testing:**
   - After applying changes, always run the build (`npm run build` or typecheck) and test the affected user flows to prevent regressions.

5. **Explicit Approval for Destructive Operations:**
   - Never execute destructive file deletions, table drops, schema resets (`prisma migrate reset` / `prisma db push --force-reset`), or data purges without explicit user approval.
