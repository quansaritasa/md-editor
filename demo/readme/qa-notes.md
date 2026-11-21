## QA notes (Dev/UAT/Prod)

### Original bug

`PUT /api/dispatches/` returned 400 with "Office with the technician office code was not found." The technician's office was in a different region than the project's office, and the same office code also exists under another region.

### When it happens

Any dispatch where the technician's office is in a different region than the project's office, and the same office code also exists under another region.

### What we fixed

API now looks up the technician office using the technician's own region, not the project's region. If the technician has no region configured and the office code is ambiguous, the API returns a clear 400 validation error on `technicianOfficeCode`.

### Scope

Create dispatch (`POST /api/dispatches/`) and update dispatch (`PUT /api/dispatches/`). Nothing else touched.

---

