# Error Handling and Validation Implementation

## Overview
Comprehensive error handling and validation system for the onboarding flow, ensuring robust user experience with proper error recovery mechanisms.

## Implemented Features

### 1. Enhanced Form Validation (Subtask 8.1)

#### Client-Side Validation
- **Enhanced Zod Schemas** (`src/schemas/onboardingSchemas.js`)
  - Detailed error messages in Vietnamese
  - Field-specific validation rules
  - Custom validation logic (e.g., duplicate skills detection, salary range validation)
  - Phone number format validation for Vietnamese numbers
  - Full name validation requiring at least 2 words
  - File upload validation (size, type)

#### Validation Features
- **Real-time validation** on blur for better UX
- **Field-level error display** with inline error messages
- **Avatar upload validation**:
  - File size limit (5MB)
  - File type validation (JPG, PNG, GIF)
  - Error handling for file read failures
- **Location validation** with automatic trigger after add/remove
- **Salary range validation** with reasonable limits

#### Error Handling Utilities (`src/utils/errorHandling.js`)
- **Error Type Detection**: Identifies network, timeout, server, validation errors
- **User-Friendly Messages**: Converts technical errors to Vietnamese messages
- **Retry Logic**: Determines if errors are retryable
- **Exponential Backoff**: Implements retry delays with jitter
- **Online Detection**: Checks and waits for network connection
- **Error Logging**: Centralized error logging for debugging

### 2. Error Boundaries and Fallback Components (Subtask 8.2)

#### Error Boundary Component (`src/components/common/ErrorBoundary.jsx`)
- **React Error Boundary**: Catches JavaScript errors in component tree
- **Error Recovery**: Allows users to retry or navigate away
- **Development Mode**: Shows detailed error stack traces
- **Error Count Tracking**: Warns users after multiple failures
- **Custom Fallback Support**: Accepts custom fallback UI

#### Fallback UI Components (`src/components/common/FallbackUI.jsx`)
- **ErrorFallback**: Generic error display with retry
- **NetworkErrorFallback**: Specific UI for network errors
- **ServerErrorFallback**: Server error display
- **TimeoutErrorFallback**: Timeout error handling
- **UnauthorizedFallback**: Session expiry handling
- **NotFoundFallback**: 404 error display
- **LoadingFallback**: Skeleton loading states
- **InlineErrorAlert**: Inline error alerts with retry
- **EmptyStateFallback**: Empty state display
- **RetryButton**: Reusable retry button component

#### Onboarding Error Boundary (`src/components/onboarding/OnboardingErrorBoundary.jsx`)
- **Custom Onboarding Fallback**: Tailored error UI for onboarding flow
- **Progress Preservation**: Informs users their progress is saved
- **Multiple Recovery Options**: Retry, go to dashboard, or home
- **Context-Aware**: Specific to onboarding context

### 3. Custom Hooks

#### useFormSubmitWithRetry (`src/hooks/useFormSubmitWithRetry.js`)
- **Automatic Retry**: Retries failed submissions with exponential backoff
- **Online Detection**: Waits for network connection before retry
- **Loading States**: Manages submission and retry states
- **Success/Error Callbacks**: Customizable handlers
- **Toast Notifications**: Automatic success/error toasts
- **Retry Count Tracking**: Tracks number of retry attempts

#### useRetry (`src/hooks/useRetry.js`)
- **Generic Retry Logic**: Reusable retry mechanism
- **Online Monitoring**: Tracks online/offline status
- **Configurable Retries**: Customizable max retries and delays
- **Manual Retry Trigger**: Hook for manual retry control

### 4. Enhanced Service Layer

#### Onboarding Service (`src/services/onboardingService.js`)
- **Error Logging**: All API calls log errors
- **Input Validation**: Validates data before sending
- **Consistent Error Handling**: Standardized error handling across all methods
- **Context Information**: Includes context in error logs

### 5. Enhanced Components

#### BasicInfoStep Updates
- **Offline Detection**: Shows warning when offline
- **External Error Display**: Shows errors from parent component
- **Avatar Validation**: Client-side file validation
- **Loading States**: Shows validation and submission states
- **Disabled States**: Disables submit when offline or validating

#### OnboardingWrapper Updates
- **Global Error Display**: Shows errors at the top of the page
- **Retry Mechanism**: Allows retrying failed operations
- **Enhanced Mutations**: All mutations have retry logic
- **Error State Management**: Centralized error state
- **Status Error Handling**: Handles errors loading onboarding status

## Usage Examples

### Using Error Boundary
```jsx
import { OnboardingErrorBoundary } from '@/components/onboarding';

function App() {
  return (
    <OnboardingErrorBoundary>
      <OnboardingFlow />
    </OnboardingErrorBoundary>
  );
}
```

### Using Form Submit with Retry
```jsx
import { useFormSubmitWithRetry } from '@/hooks/useFormSubmitWithRetry';

const { handleSubmit, isSubmitting, error } = useFormSubmitWithRetry(
  async (data) => await saveProfile(data),
  {
    maxRetries: 3,
    successMessage: 'Đã lưu thành công',
    errorContext: 'Lưu hồ sơ'
  }
);
```

### Using Fallback Components
```jsx
import { NetworkErrorFallback } from '@/components/common/FallbackUI';

{error && <NetworkErrorFallback onRetry={refetch} />}
```

## Error Types Handled

1. **Validation Errors** (400)
   - Form validation errors
   - Invalid data format
   - Missing required fields

2. **Network Errors**
   - Connection lost
   - DNS resolution failed
   - Request timeout

3. **Server Errors** (500, 502, 503, 504)
   - Internal server error
   - Bad gateway
   - Service unavailable

4. **Authentication Errors** (401, 403)
   - Session expired
   - Unauthorized access
   - Forbidden resource

5. **Not Found Errors** (404)
   - Resource not found
   - Invalid endpoint

6. **Conflict Errors** (409)
   - Duplicate data
   - State conflict

## Retry Strategy

### Exponential Backoff
- **Attempt 1**: 1 second delay
- **Attempt 2**: 2 seconds delay
- **Attempt 3**: 4 seconds delay
- **Maximum**: 10 seconds delay
- **Jitter**: Random 0-500ms added to prevent thundering herd

### Retryable Errors
- Network errors
- Timeout errors
- Server errors (5xx)

### Non-Retryable Errors
- Validation errors (400)
- Authentication errors (401, 403)
- Not found errors (404)
- Conflict errors (409)

## Offline Handling

### Detection
- Monitors `navigator.onLine` status
- Listens to `online` and `offline` events
- Shows offline indicator in UI

### Recovery
- Waits for connection restoration (up to 30 seconds)
- Automatically retries after connection restored
- Shows loading toast while waiting

### User Feedback
- Offline warning in forms
- Disabled submit buttons when offline
- Clear messaging about network status

## Testing Recommendations

### Manual Testing
1. **Network Errors**: Disable network and test form submission
2. **Server Errors**: Mock 500 errors from backend
3. **Validation Errors**: Submit invalid data
4. **Timeout**: Simulate slow network
5. **Offline/Online**: Toggle network connection during submission

### Error Scenarios
- Submit form while offline
- Submit with invalid data
- Server returns 500 error
- Network timeout during submission
- Multiple rapid submissions
- Session expiry during submission

## Future Enhancements

1. **Error Tracking Service**: Integrate Sentry or similar
2. **Analytics**: Track error rates and types
3. **User Feedback**: Allow users to report errors
4. **Offline Queue**: Queue requests when offline
5. **Progressive Enhancement**: Better offline support
6. **Error Recovery Suggestions**: Context-specific recovery steps

## Files Modified/Created

### Created
- `src/utils/errorHandling.js`
- `src/hooks/useFormSubmitWithRetry.js`
- `src/hooks/useRetry.js`
- `src/components/common/ErrorBoundary.jsx`
- `src/components/common/FallbackUI.jsx`
- `src/components/onboarding/OnboardingErrorBoundary.jsx`

### Modified
- `src/schemas/onboardingSchemas.js`
- `src/services/onboardingService.js`
- `src/components/onboarding/OnboardingWrapper.jsx`
- `src/components/onboarding/steps/BasicInfoStep.jsx`
- `src/components/onboarding/index.js`

## Benefits

1. **Better User Experience**: Clear error messages in Vietnamese
2. **Automatic Recovery**: Retries failed operations automatically
3. **Progress Preservation**: User progress is saved even on errors
4. **Offline Support**: Handles offline scenarios gracefully
5. **Developer Experience**: Centralized error handling, easier debugging
6. **Maintainability**: Reusable error handling components and hooks
7. **Robustness**: Application doesn't crash on errors
8. **User Confidence**: Clear feedback and recovery options
