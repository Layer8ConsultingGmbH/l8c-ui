# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| 1.x | Yes |
| < 1.0 | No |

Security fixes are released as patch versions of the latest minor release.

## Reporting a vulnerability

Please do **not** open a public GitHub issue for security vulnerabilities.

Report them privately via [GitHub Security Advisories](https://github.com/Layer8ConsultingGmbH/l8c-ui/security/advisories/new).

Please include:

- a description of the issue and its impact,
- the affected `@l8c/ui` version(s),
- steps or a minimal example to reproduce it.

We aim to acknowledge reports within 3 working days and to provide a fix or mitigation plan within 30 days, depending on severity. We will credit reporters in the release notes unless they prefer to stay anonymous.

## Scope

`@l8c/ui` is a client-side component library. Issues that are typically in scope include cross-site scripting through component inputs, unsafe handling of user-supplied HTML, and dependency vulnerabilities in the published package. Issues in applications that merely consume the library are out of scope unless caused by the library itself.
