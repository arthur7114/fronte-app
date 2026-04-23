# Editorial Flow Split

## Goal
Separate strategy curation from article production so topic approval only validates editorially and post creation happens through an explicit production action.

## Execution Order
- [ ] Phase 0: Canonical keyword/topic statuses and adapters.
- [ ] Phase 1: Worker payloads and `suggested` creation status.
- [ ] Phase 2: Approval actions no longer create posts; explicit production action exists.
- [ ] Phase 3: Production idempotency by tenant, strategy, normalized title, and site when available.
- [ ] Phase 4: Keyword UX for suggestions, approved, rejected, manual add, and AI suggestion.
- [ ] Phase 5: Topic UX for suggestions, approved, rejected, structured manual add, scoped AI suggestion, and production CTA.
- [ ] Phase 6: Remove articles tab from strategy and support `/dashboard/artigos?strategy=ID`.
- [ ] Phase 7: Clean workspace mocks after dependency checks.

## Verification
Run project validation after each phase where feasible: lint, typecheck, build, targeted tests if present, plus `.agent/scripts/checklist.py` at the end.
