# 4. Asynchronous Logic and Testing

## 🔄 Handling Async States (Loading, Error, Empty)
A robust UI must handle all possible states of an asynchronous operation. We have dedicated components for this.

- **Loading State**: Use the `<JobListSkeleton />` or the generic `<Skeleton />` component from `src/components/ui/skeleton.jsx` to build placeholder UIs. This provides a better user experience than a simple spinner.
- **Error State**: Use the `<ErrorState />` component from `src/components/common/ErrorState.jsx`. It should display an error message and provide a "Retry" button.
- **Empty State**: Use the `<EmptyState />` component from `src/components/common/EmptyState.jsx` when an API call succeeds but returns no data (e.g., no jobs found).

**Standard Component Structure for Data Fetching:**
```javascript
const MyFeatureComponent = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    // ... fetching logic ...
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <FeatureSkeleton />; // Or a generic skeleton
  }

  if (error) {
    return <ErrorState onRetry={fetchData} message={error.message} />;
  }

  if (data.length === 0) {
    return <EmptyState message="No items found." />;
  }

  return (
    // Render the successful state with the data
    <div>
      {data.map(item => (...))}
    </div>
  );
};
```

## ✅ Testing
When asked to write tests, follow these guidelines:

- **Frameworks**: Use **Jest** as the test runner and **React Testing Library (RTL)** for rendering and interacting with components.
- **Philosophy**: Test user behavior, not implementation details. The user doesn't care if you use `useState` or `useReducer`; they care that when they click a button, something happens.
- **Queries**: Use `screen` queries from RTL (e.g., `screen.getByRole`, `screen.getByText`).
- **Mocking**: Mock API services using `jest.mock()`. The component should not make real network requests during tests.

**Example Test for a Login Component:**
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '@/pages/auth/Login';
import * as authService from '@/services/authService';

// Mock the authService
jest.mock('@/services/authService');

describe('Login Component', () => {
  it('should allow a user to log in successfully', async () => {
    render(<Login />);

    // Mock the successful login response
    authService.login.mockResolvedValue({
      data: { accessToken: 'fake-token', role: 'recruiter' },
    });

    // Simulate user input
    await userEvent.type(screen.getByLabelText(/tên đăng nhập/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/mật khẩu/i), 'password123');

    // Simulate form submission
    fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

    // Assert that the login service was called
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
    });
  });
});
```