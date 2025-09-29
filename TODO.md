# TODO: Add "Create CV" Item to Header

## Tasks
- [x] Add "Tạo CV" navigation link to Header.jsx navLinks array
- [x] Link to `/editor` route for CV creation functionality
- [x] Use appropriate icon (FileText or Plus)
- [x] Test the navigation link works correctly

## Information Gathered
- Header component located at `src/components/layout/Header.jsx`
- Navigation links are defined in `navLinks` array with properties: to, label, title, href, icon
- CV creation functionality is CVBuilder component at `/editor` route
- Existing nav links: "Tìm việc làm", "Công ty", "Tin tức"

## Plan
1. Update the navLinks array in Header.jsx to include the new "Tạo CV" link
2. Use FileText icon and link to "/editor"
3. Ensure the link appears in both desktop and mobile navigation
