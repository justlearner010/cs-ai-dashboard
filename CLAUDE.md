## Agent skills

### Issue tracker

Issues live in GitHub Issues (justlearner010/cs-ai-dashboard), managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), label string = role name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root are created lazily by domain modeling — they may not exist yet (proceed silently if absent). Consumption rules: `docs/agents/domain.md`.
