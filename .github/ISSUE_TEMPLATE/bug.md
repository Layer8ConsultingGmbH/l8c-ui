---
name: Bug
about: Something does not work as specified. Security vulnerabilities are not reported here.
title: "[Bug] "
labels: ["bug"]
type: Bug
assignees: ""
---

<!--
How to use this template
- Anyone can report a bug. Fill in "Report" at minimum.
- One defect per issue; improvements and questions become features, tasks or comments, not bugs.
- Security vulnerabilities: do not use this template; report them via the security advisory link on the template chooser.
- "Analysis" and the sections below are completed during refinement.
- Severity is set as label (severity:critical, severity:high, severity:medium, severity:low).
- Parent and blocked-by are set only via GitHub relationships (sidebar), not repeated in the text.
- Redact secrets and personal data in logs and screenshots.
-->

## Report

### What happened
<!-- When I ... then ... -->

### Steps to reproduce
1. 
2. 
3. 

### Expected behaviour

### Actual behaviour

### Environment
<!-- @l8c/ui version, Angular version, browser, OS. A minimal reproduction (e.g. StackBlitz) helps most. -->
- 
- Last known good: <!-- version, commit or date when it still worked, or "unknown" / "never worked" -->

### Evidence
<!-- Logs, console output, screenshots. -->
```text
```

### Impact
- Who is affected: 
- Workaround: 

---

<!-- ===== Completed during refinement ===== -->

## Analysis

### Affected areas
- 

### Root cause
<!-- Mark as hypothesis or confirmed. -->

### Fix outline
- 

### Code state
- `<repository @ commit this bug was analysed against>`

---

## Acceptance criteria

**AC-1: The reported behaviour is fixed**
- **Given** the preconditions from "Steps to reproduce"
- **When** the steps are executed
- **Then** the expected behaviour occurs

**AC-2: `<further criterion if needed>`**
- **Given** 
- **When** 
- **Then** 

---

## Test specification

### Regression test (required)
<!-- A test that fails without the fix and passes with it. -->
- Level: `unit / integration / E2E`
- Location: 
- Scenario: 

### E2E scenario (if user-facing)
- Preconditions: 
- Steps:
  1. 
- Expected result: 

---

## Dependencies
<!-- Parent and blocked-by live only in the GitHub relationships. List here only what GitHub cannot express. -->
- Related: 

---

## Definition of Ready
- [ ] Bug is reproducible, or the missing information is listed
- [ ] Severity label is set
- [ ] Acceptance criteria and regression test are defined

## Definition of Done
- [ ] Fix merged, regression test fails without it and passes with it, CI is green
- [ ] Repository checklist fulfilled (see `CONTRIBUTING.md`)
- [ ] Verified in the showcase or a consuming application
