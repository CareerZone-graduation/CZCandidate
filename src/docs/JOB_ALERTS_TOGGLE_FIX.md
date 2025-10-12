# 🔧 Job Alerts Toggle Active Fix

## 🐛 Problem

When toggling active/inactive status of a job alert, the API returned validation error:

```json
{
  "success": false,
  "message": "JobAlertSubscription validation failed: location.district: District is required"
}
```

## 🔍 Root Cause

### Backend Behavior
The backend Mongoose model has `location.district` marked as `required: true`:

```javascript
location: {
  district: {
    type: String,
    required: [true, 'District is required'],
  }
}
```

When using `.save()` method in Mongoose, it validates **all required fields**, even if you're only updating one field.

### Frontend Original Code
```javascript
// Only sending { active: true/false }
const toggleActiveMutation = useMutation({
  mutationFn: ({ id, active }) => updateJobAlert(id, { active }),
  // ...
});
```

This sends:
```json
PUT /api/job-alerts/:id
{
  "active": false
}
```

But Mongoose validation fails because `location.district` is missing.

## ✅ Solution

### Option 1: Fix Backend (Recommended for Production)

Update backend service to use `findByIdAndUpdate` with `runValidators: false` or make validation conditional:

```javascript
// In jobAlert.service.js
export const updateJobAlert = async (candidateId, subscriptionId, data) => {
  const subscription = await JobAlertSubscription.findOneAndUpdate(
    { _id: subscriptionId, candidateId },
    data,
    { 
      new: true, 
      runValidators: false // Skip validation for partial updates
    }
  );
  
  if (!subscription) {
    throw new NotFoundError('Không tìm thấy đăng ký.');
  }
  
  return subscription;
};
```

### Option 2: Fix Frontend (Quick Fix - Implemented) ✅

Send full alert data with only the `active` field changed:

```javascript
const handleToggleActive = (alert) => {
  // Send full alert data with only active field changed
  const alertData = {
    keyword: alert.keyword,
    location: alert.location,
    frequency: alert.frequency,
    salaryRange: alert.salaryRange,
    type: alert.type,
    workType: alert.workType,
    experience: alert.experience,
    category: alert.category,
    notificationMethod: alert.notificationMethod,
    active: !alert.active,
  };
  toggleActiveMutation.mutate({ id: alert._id, alertData });
};
```

This sends:
```json
PUT /api/job-alerts/:id
{
  "keyword": "Senior Backend Developer",
  "location": {
    "province": "Thành phố Hà Nội",
    "district": "ALL"
  },
  "frequency": "daily",
  "salaryRange": "20M_30M",
  "type": "FULL_TIME",
  "workType": "HYBRID",
  "experience": "SENIOR_LEVEL",
  "category": "SOFTWARE_DEVELOPMENT",
  "notificationMethod": "APPLICATION",
  "active": false
}
```

## 📊 Comparison

| Approach | Pros | Cons |
|----------|------|------|
| **Backend Fix** | - Cleaner API<br>- True partial updates<br>- Less data transfer | - Requires backend changes<br>- Need to test validation |
| **Frontend Fix** | - Quick to implement<br>- No backend changes<br>- Works immediately | - Sends more data<br>- Not true partial update |

## 🎯 Current Implementation

We implemented **Option 2 (Frontend Fix)** because:
1. ✅ Quick to implement
2. ✅ No backend changes needed
3. ✅ Works immediately
4. ✅ Safe - sends all required fields
5. ✅ Minimal risk

## 🔄 Future Improvement

Consider implementing **Option 1 (Backend Fix)** in the future for:
- Better API design
- Reduced payload size
- True RESTful partial updates

## 📝 Code Changes

### Before
```javascript
const toggleActiveMutation = useMutation({
  mutationFn: ({ id, active }) => updateJobAlert(id, { active }),
  onSuccess: (_, variables) => {
    toast.success(variables.active ? 'Đã bật' : 'Đã tắt');
  },
});

const handleToggleActive = (alert) => {
  toggleActiveMutation.mutate({ 
    id: alert._id, 
    active: !alert.active 
  });
};
```

### After
```javascript
const toggleActiveMutation = useMutation({
  mutationFn: ({ id, alertData }) => updateJobAlert(id, alertData),
  onSuccess: (_, variables) => {
    toast.success(variables.alertData.active ? 'Đã bật' : 'Đã tắt');
  },
});

const handleToggleActive = (alert) => {
  const alertData = {
    keyword: alert.keyword,
    location: alert.location,
    frequency: alert.frequency,
    salaryRange: alert.salaryRange,
    type: alert.type,
    workType: alert.workType,
    experience: alert.experience,
    category: alert.category,
    notificationMethod: alert.notificationMethod,
    active: !alert.active,
  };
  toggleActiveMutation.mutate({ id: alert._id, alertData });
};
```

## 🧪 Testing

### Test Cases
1. ✅ Toggle active → inactive
2. ✅ Toggle inactive → active
3. ✅ Multiple toggles in succession
4. ✅ Toggle with different alert configurations

### Expected Behavior
- No validation errors
- Smooth toggle animation
- Toast notification appears
- Card updates immediately
- Status badge changes color

## 🐛 Debugging Tips

If toggle still fails:

1. **Check Network Tab**
   - Verify full payload is sent
   - Check response status code
   - Look for validation errors

2. **Check Console**
   - Look for mutation errors
   - Check toast notifications
   - Verify state updates

3. **Check Backend Logs**
   - Mongoose validation errors
   - Service layer errors
   - Database connection issues

## 📚 Related Files

- `src/pages/dashboard/settings/JobAlertSettings.jsx` - Main component
- `src/services/jobAlertService.js` - API service
- Backend: `src/services/jobAlert.service.js` - Service layer
- Backend: `src/models/JobAlertSubscription.js` - Mongoose model

## ✅ Status

**Fixed** ✓ - Toggle active/inactive now works correctly by sending full alert data.
