# 3. API and State Management

## 📞 API Calls
- **Service Layer**: All API logic MUST reside in the `src/services/` directory. Components should not call `axios` directly.
- **`apiClient`**: **ALWAYS** use the `apiClient` instance imported from `src/services/apiClient.js`. It is pre-configured with interceptors for:
  - Automatically attaching the `Authorization` header.
  - Handling the refresh token flow for 401 errors.
  - Displaying toast notifications for errors.
- **Service Functions**: Follow the existing pattern in `jobService.js` or `companyService.js`. Each function should correspond to a single API endpoint.

**Example of a component calling a service:**
```javascript
import { getMyJobs } from '@/services/jobService';

// Inside a component...
const fetchJobs = async () => {
  try {
    const response = await getMyJobs({ status: 'ACTIVE' });
    setJobs(response.data);
  } catch (error) {
    const errorMessage = response?.data?.message || error?.message + ' : '+ error.response.statusText || 'Đã có lỗi xảy ra';
    toast.error(errorMessage);
    console.error("Failed to fetch jobs:", error);
  }
};
```

## 🗄️ State Management
- **Authentication State**: Managed by `AuthContext`. Use the `useAuth()` hook to access user data and authentication status.
- **Local UI State**: Use `useState` and `useReducer` for state that is local to a single component (e.g., form inputs, dialog visibility).
- **Server State (Data Fetching)**:
  - **Current Pattern**: The project currently uses `useState` + `useEffect` for data fetching, as seen in `JobList.jsx`. When asked to add new data fetching, you can follow this pattern.
  - **Best Practice (Future Direction)**: For new complex features, propose using **TanStack Query (React Query)**. It simplifies server state management by handling caching, refetching, loading, and error states automatically.

**Example of proposing a React Query implementation:**
```javascript
// If asked to fetch company data, you can suggest this:
import { useQuery } from '@tanstack/react-query';
import { getMyCompany } from '@/services/companyService';

const useCompanyProfile = () => {
  return useQuery({
    queryKey: ['myCompany'], // A unique key for this query
    queryFn: getMyCompany,   // The function that fetches the data
    select: (response) => response.data // Optional: transform the data
  });
};

// In the component:
const CompanyProfile = () => {
  const { data: company, isLoading, isError, error } = useCompanyProfile();

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error: {error.message}</p>;

  // Render component with `company` data
}
```