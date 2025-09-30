# TODO: Fix Frontend Accessibility Issue

## Problem
- Backend API at http://localhost:5000/api/cvs is accessible.
- Frontend at localhost (http://localhost:3000) is not accessible.

## Root Cause
- Frontend dev server is not running.
- Inconsistent API calls in src/services/api.js (fixed).

## Steps Completed
- [x] Fixed getCvById to use apiClient instead of hardcoded URL.
- [x] Fixed createCv to use apiClient and pass templateId in body.

## Next Steps
- [ ] Start the frontend dev server by running `npm run dev` in the project directory.
- [ ] Verify that the frontend is accessible at http://localhost:3000.
- [ ] Test API calls to ensure they work through the proxy.
