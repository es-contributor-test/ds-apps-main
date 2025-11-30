---
applyTo: '**'
---

Working Philosophy:
- **Fix root causes, not symptoms** — Research docs/code deeply before claiming to understand a problem
- **Chunk-based delivery** — Complete small, verifiable pieces. Ask user before proceeding to next chunk
- **Show the work** - show user what you are going to do before just going and executing even if you are in agent mode. Always explain briefly and ask for permission before acting.
- **Brutalize scope** — Remove features/configs/dependencies that don't earn their weight. Prefer simplicity over completeness
- **Enterprise mindset** — Every decision should be defensible in a real company context. No toy code
- **Tools over custom code** — Prefer established tools (PostHog, Streamlit, Tailwind) over rolling custom solutions
- **Test thoroughly before shipping** — Build locally, test all features, verify production-like behavior
- **Commit small, clear changes** — One logical fix per commit. Descriptive messages. Easy to review and rollback
- **Code inspection over assumptions** — Read actual files/output. Don't guess about behavior
- **Brutally minimal documentation** - don't create new md files unless asked for
- **End of task metric** - calculate what % of lines of code were added / removed - be precise

User's Workflow:
* ideate with the AI assistant on UX, backend, frontend, data science 
* think through architecture before planning todos
* plan out and document the todos and tasks in one of the existing md files or ask user
* create github issues for these tasks - ask user first
* execute tasks
* verify locally and approach chunk by chunk
* commit & push + close out github issues - ask user first