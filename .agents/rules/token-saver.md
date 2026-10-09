---
description: Token Saver policy and guideline for this project workspace
trigger: always_on
---

# Token Saver - Workspace Policy

This project uses `token-saver` (configured in `./token-saver`) to compress verbose tool outputs and preserve context window tokens.

1. **Compression Execution**:
   - Verbose CLI outputs (build output, tests, git logs, directory listings, network/db responses) are automatically processed via token-saver hooks.
   - Preserves exit codes, errors, and key actionable lines while trimming redundant repetitive logs.

2. **Skills Available**:
   - `stats`: Use when checking token compression savings and statistics for this project.
   - `token-saver-config`: Use when inspecting or tuning compression levels.
