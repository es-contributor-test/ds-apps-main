---
title: 'How I AI: From Prompting to Partnering'
description: 'A month building products with Claude changed how I work with AI. Here are the principles and workflows that made the difference.'
publishDate: '2025-11-27'
draft: false
tags: ['ai', 'workflows', 'building', 'opinion']
---

A month ago, I was using AI like most people: copy-paste a problem, get an answer, move on.

Today, I ship production code 5x faster, maintain a 3-package monorepo, and have pushed 40+ commits—all orchestrated through conversation with Claude.

This isn't a story about AI getting smarter. It's about how I got smarter at working *with* AI.

---

## The Evolution: Three Stages of AI Collaboration

Looking back at my git history, I can see distinct phases in how my AI usage evolved:

### Stage 1: The Prompter (Weeks 1-2)
**Pattern:** Ask → Receive → Paste

I'd ask Claude for code snippets, copy them into my editor, and debug the inevitable errors myself. The AI was a Stack Overflow replacement—helpful, but transactional.

```
Me: "How do I fetch GitHub issues with the GraphQL API?"
AI: [code block]
Me: *pastes, fixes errors, moves on*
```

**Problem:** Context was lost between questions. Every interaction started from zero.

---

### Stage 2: The Delegator (Weeks 2-3)
**Pattern:** Dump Context → Hope for Magic

I started giving Claude more context—entire files, error logs, architectural decisions. But I was still treating it like a service to be invoked, not a partner to collaborate with.

```
Me: "Here's my whole codebase [10 files]. Make the leaderboard work."
AI: *produces a solution that technically works but doesn't fit the architecture*
```

**Problem:** Without principles, the AI optimized for *completing the task* rather than *solving the right problem*.

---

### Stage 3: The Partner (Weeks 3-4)
**Pattern:** Shared Principles → Incremental Progress → Verification

This is where everything changed. I stopped asking Claude to solve problems and started *working through problems together*.

The shift? **I gave the AI my working philosophy, not just my code.**

---

## The Working Principles That Changed Everything

I embedded these principles into my AI interactions (literally—they're in my `.github/instructions/` file):

| Principle | What It Means | How It Changes AI Behavior |
|-----------|---------------|---------------------------|
| **Fix root causes, not symptoms** | Don't patch; understand | AI researches docs before proposing solutions |
| **Chunk-based delivery** | Small, verifiable wins | AI asks before proceeding to next chunk |
| **Brutalize scope** | Remove what doesn't earn weight | AI suggests deletions, not just additions |
| **Enterprise mindset** | Defensible decisions | No toy code; production patterns only |
| **Tools over custom code** | PostHog > custom analytics | AI recommends established solutions first |
| **Show the work** | Explain before executing | AI proposes plan, waits for approval |
| **Commit small, clear changes** | Easy to review/rollback | AI structures work into logical commits |

The magic? **When the AI knows your principles, it can push back on *you*.**

---

## The Workflow That Emerged

Here's how a typical feature development now looks:

> **1. IDEATE** 💡
> 
> *Me:* "I want to add a projects section to the home page"
> 
> *AI:* "Before we code, let's think about the data source..."

> **2. ARCHITECT** 📐
> 
> *AI proposes:* YAML data file → shared component → both pages consume same source
> 
> *Me:* "I like it. What about DRY with the build log?"

> **3. PLAN** 📋
> 
> *AI:* Creates todo list, proposes GitHub issue with labels
> 
> *Me:* "Add labels: cat:frontend, diff:medium"

> **4. EXECUTE** ⚡ *(chunk by chunk)*
> 
> *AI:* "Created projects.yaml. Ready to build the loader?"
> 
> *Me:* "Yes, go"
> 
> *AI:* "Loader done. Want me to build the component?"

> **5. VERIFY** 🔍
> 
> *AI:* Runs build, checks for errors
> 
> *Me:* "Preview looks broken—styles not rendering"
> 
> *AI:* Diagnoses Tailwind content paths, fixes root cause

> **6. SHIP** 🚀
> 
> *AI:* "Ready to commit. Suggested message: [...]"
> 
> *Me:* "Use separate Closes lines for each issue"
> 
> *AI:* "Noted for next time."

Notice what's different: **The AI asks permission at every stage.** It proposes, waits, executes, verifies. This isn't slower—it's *faster*, because we catch mistakes before they compound.

---

## Real Example: The DRY Projects Refactor

Today I noticed the home page had a hardcoded project card while the Build Log had the same card with different styling. Classic DRY violation.

**Old me:** Would have fixed it myself, probably creating tech debt.

**New workflow:**

1. **I asked:** "Is this DRY?"
2. **AI analyzed:** "No—home page is hardcoded, build log is hardcoded differently."
3. **AI proposed:** Shared `projects.yaml` + `ProjectCard.astro` with variants.
4. **I reviewed the plan**, asked for changes (add "Try It" button to compact variant).
5. **AI created GitHub issue** with full implementation spec.
6. **I said "let's go."**
7. **AI executed in chunks:** YAML → types → component → home page → build log → verify.
8. **Problem appeared:** Tag colors not rendering.
9. **I pushed back:** "Fix root cause, not symptoms. Don't add tech debt."
10. **AI diagnosed:** Tailwind wasn't scanning the shared package.
11. **AI fixed correctly:** Added to `tailwind.config.js` content array.
12. **Shipped:** One clean commit, issue auto-closed.

Total time: ~20 minutes for a cross-cutting refactor that would have taken me 2 hours alone.

---

## The Mental Shifts

### From "AI writes code" to "AI is my senior engineer"

I review AI output like I'd review a PR. I question decisions. I ask "why this approach?" The AI explains, and sometimes I learn something. Sometimes I push back and we find a better solution.

### From "Context is expensive" to "Context is everything"

The more the AI knows about my:
- Working principles
- Tech stack
- Project history
- Previous decisions

...the better its suggestions become. I invest in context upfront because it compounds.

### From "Ship fast" to "Ship correctly"

AI makes it easy to ship broken code fast. The discipline is *verification*. I always:
- Run the build locally
- Check the preview
- Verify errors are gone

The AI does this automatically now because it's in the workflow.

### From "Ask permission" to "Give permission"

The AI asks: "Should I proceed?" I say yes or no. This tiny friction prevents runaway changes and keeps me in control.

---

## The Numbers

A month of this workflow:

| Metric | Value |
|--------|-------|
| Commits | 40+ |
| Issues closed | 39 |
| Packages in monorepo | 3 |
| Lines of code (net) | ~8,000 |
| Custom CSS | 0 lines |
| Production bugs from AI code | 2 (both caught before deploy) |

---

## What I'd Tell Past Me

1. **Invest in principles first.** Write down how you work. Give it to the AI.

2. **Chunk everything.** Never say "build me X." Say "let's plan X, then execute piece by piece."

3. **Verify obsessively.** AI is confident even when wrong. Always check the output.

4. **Push back on shortcuts.** If the AI proposes a hack, ask for the right solution. It usually knows one.

5. **Treat context as an asset.** Long conversation history = better suggestions. Don't start fresh unnecessarily.

6. **Let the AI own the boring parts.** Git commands, file creation, build verification—automate these so you can focus on decisions.

---

## The Tools

My current AI-assisted development stack:

- **VS Code + GitHub Copilot Chat** — Claude model for agent mode
- **Instructions file** — `.github/instructions/chatbot.instructions.md` with principles
- **Workspace context** — AI sees full project structure
- **Terminal access** — AI runs commands directly (with permission)
- **GitHub CLI** — AI creates issues, closes them, manages labels

---

## What's Next

I'm still learning. Every session surfaces new patterns:

- When to trust AI completely (boilerplate, file ops)
- When to micromanage (architecture, UX decisions)
- When to step back and think without AI (strategy, vision)

The goal isn't to replace thinking—it's to amplify it. AI handles the mechanical work so I can focus on *what* to build, not *how* to type it.

If you're still in Stage 1 (prompting) or Stage 2 (delegating), try this: **Write down your working principles and give them to your AI.** Watch how the conversation changes.

---

*This post was drafted with AI assistance, following the exact workflow described above. The ideas, opinions, and editorial decisions are mine.*
