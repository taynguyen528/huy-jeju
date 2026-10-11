# Repository instructions

## User documentation

`docs/HUONG-DAN-SU-DUNG.md` is the canonical user and local-operator guide for this repository.

Whenever a change adds, removes, renames, or materially changes a user-visible feature, route, role, permission, API endpoint, environment variable, setup step, or npm script:

1. Update `docs/HUONG-DAN-SU-DUNG.md` in the same task.
2. Update its version, last-updated date, and change-history table when the change is material.
3. Keep incomplete or mock-backed functionality clearly identified.
4. Update `docs/TEST-ACCOUNTS.md` when authentication roles, test users, passwords, or access expectations change.

Do not claim a feature is production-ready when it is backed only by mock data or in-memory storage.
