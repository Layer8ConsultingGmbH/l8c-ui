---
name: Feature
about: A new or changed capability, written as a user story and refined until it can be implemented and tested end to end.
title: "[Feature] "
labels: ["feature"]
type: Feature
assignees: ""
---

<!--
How to use this template
- Anyone can open a feature. Fill in "Request" at minimum.
- All sections below the line are completed during refinement (manually or with the refinement skill).
- Set the project status to "Ready" only when the Definition of Ready at the bottom is fully checked.
- All relationships live only in the sidebar (parent, sub-issues, blocked by / blocking); the text has no
  dependency section. Where an issue comes from (e.g. split from a collection) belongs in the background.
- Add area labels (area:components, area:styles, area:docs, area:ci).
-->

## Request

### User story
**As a** `<role>`,
**I want** `<capability>`,
**so that** `<benefit>`.

### Background
<!-- Why is this needed, what triggered it, who asked for it? -->

---

<!-- ===== Completed during refinement ===== -->

## Scope

### In scope
- 

### Out of scope
- 

---

## Solution outline

### Affected areas
<!-- Name components, modules and files concretely, e.g. projects/l8c-ui/src/lib/dialog. -->
- 

### UI
<!--
Reference the design system instead of describing visuals:
- components by name, e.g. DataTable, ConfirmDialog (Angular: l8c-confirm-dialog)
Design first: every new or changed component needs an approved design in the design system before
implementation.
-->

| Screen / route | Components | Behaviour notes |
|---|---|---|
| | | |

### API and data
<!-- Public API of the component: inputs, outputs, CSS custom properties, exported types. Breaking changes. -->
- 

### Compatibility
<!--
- Does this change break existing consumers (renamed inputs, changed styles or tokens)? Migration notes?
Write "n/a" if not.
-->
- 

### Non-functional requirements
- [ ] Built-in texts (e.g. aria labels) can be overridden by the consuming application
- [ ] Security: `<e.g. no unsanitised HTML input>`
- [ ] Accessibility: usable by keyboard, labels for screen readers
- [ ] Performance: `<e.g. renders 1,000 rows without visible lag>`

---

## Decisions
<!--
Decisions taken during refinement, with a short reason, so that nobody "corrects" them later as an oversight.
Example: "Copied templates start with status READY – users should be able to send them without a release step."
-->
- 

---

## Acceptance criteria
<!-- One behaviour per criterion. Every criterion must be covered by at least one test in the test specification. -->

**AC-1: `<short title>`**
- **Given** 
- **When** 
- **Then** 

**AC-2: `<short title>`**
- **Given** 
- **When** 
- **Then** 

---

## Test specification

### Test matrix
<!-- Mark the levels that verify each criterion with x. Every user-facing criterion needs an E2E scenario. -->

| AC | Unit | Integration | E2E | Notes |
|---|:---:|:---:|:---:|---|
| AC-1 | | | | |
| AC-2 | | | | |

### E2E scenarios

**E2E-1 (covers AC-1): `<title>`**
- Preconditions: `<user and role, seed data, environment>`
- Steps:
  1. 
  2. 
- Expected result: 

### Negative and edge cases
- 

### Test data
<!-- Fixtures and example data. Never real personal data. -->
- 

---

## Implementation notes
<!-- For the implementing agent or developer. -->
- Guidelines: `CONTRIBUTING.md`
- Code state: `<repository @ commit this issue was refined against>`
- Constraints: 
- Open questions: <!-- must be empty before Ready -->

---

## Definition of Ready
- [ ] User story and background are understood
- [ ] Scope and out of scope are agreed
- [ ] Compatibility for existing consumers is addressed
- [ ] Every acceptance criterion is written as Given / When / Then and is testable
- [ ] Every acceptance criterion is covered in the test matrix, every user-facing one by an E2E scenario
- [ ] An approved design exists for every new or changed component
- [ ] Relationships (parent, blocked by) are set in GitHub, no open questions left
- [ ] Fits into one pull request, otherwise split into sub-issues

## Definition of Done
- [ ] All acceptance criteria verified by the tests in the test matrix, CI is green
- [ ] Repository checklist fulfilled (see `CONTRIBUTING.md`)
- [ ] Documentation updated
- [ ] Reviewed by the requester
