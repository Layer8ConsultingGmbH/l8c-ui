---
name: Task
about: Technical work without a user story of its own, e.g. a part of a feature, refactoring, infrastructure, dependency update, research, an architecture decision or content work.
title: "[Task] "
labels: []
type: Task
assignees: ""
---

<!--
How to use this template
- Use a task for technical work, e.g. as a sub-issue of a feature or epic.
- Variants, each with its own label and section below (delete the sections that do not apply, or write n/a):
  - research: question with timebox, no production code
  - adr: architecture decision, result is an accepted ADR
  - content: content delivered by a domain expert (texts, templates, translations), not code
  - design: design of components in the design system, before implementation
- All relationships live only in the sidebar (parent, sub-issues, blocked by / blocking); the text has no
  dependency section. Where an issue comes from (e.g. split from a collection) belongs in the background.
- Add area labels (area:components, area:styles, area:docs, area:ci).
-->

## Goal

### What and why
<!-- What has to be done, and why is it needed? -->

---

## Scope

### In scope
- 

### Out of scope
- 

---

## Technical notes
<!-- Affected modules, approach, constraints. Reference AGENTS.md files for the implementing agent. -->
- Guidelines: 
- Code state: `<repository @ commit this issue was refined against>`
- 

---

## Decisions
<!-- Decisions taken during refinement, with a short reason. -->
- 

---

## Acceptance criteria
<!-- Verifiable statements, numbered for traceability. Use Given / When / Then if the task changes behaviour. -->
- [ ] **AC-1:** 
- [ ] **AC-2:** 

## Verification
<!-- How a reviewer checks the result per AC: tests, command, request, screenshot. -->
- 

---

## Research (only with label "research")
- Question to answer: 
- Timebox: 
- Expected result: `<decision, ADR, prototype, comparison>`

## Decision (only with label "adr")
- Options to decide: <!-- each open point with the considered alternatives -->
- Result: ADR `docs/decisions/adr-xxx-<name>.md` with status Accepted
- Superseded or amended ADRs: 

## Design (only with label "design")
- Screens and components to design: 
- Location in the design system: <!-- component name -->
- Based on: <!-- existing screen templates or components to extend -->
- Approval: <!-- who approves the design before implementation starts -->

## Content (only with label "content")
- Author: 
- Delivery format: <!-- e.g. Markdown, SVG -->
- Quantity and batches: 
- Review: <!-- who checks content before merge -->
- Licence and copyright: <!-- e.g. icon licence -->

---

## Definition of Ready
- [ ] Goal, scope and out of scope are agreed
- [ ] Every acceptance criterion is verifiable, the verification is described
- [ ] Variant section (research / adr / design / content) is filled in where it applies
- [ ] Relationships (parent, blocked by) are set in GitHub, no open questions left
- [ ] Fits into one pull request, otherwise split

## Definition of Done
- [ ] Acceptance criteria met and verified
- [ ] Tests added or updated where code changed, CI is green
- [ ] Documentation or ADR updated where relevant
