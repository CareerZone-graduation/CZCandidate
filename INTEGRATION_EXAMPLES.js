// ============================================================================
// INTEGRATION EXAMPLE: How to add new components to JobDetail.jsx
// ============================================================================

// 1. ADD IMPORTS at the top
import SalaryVisualization from '@/components/common/SalaryVisualization';
import { motion } from 'framer-motion';

// 2. USAGE IN COMPONENT (Add after job description section)

// In the return statement, after job description:
<div className="space-y-6">
  {/* Existing job description */}
  
  {/* NEW: Salary Visualization */}
  {job.salaryMin && job.salaryMax && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <SalaryVisualization
        minSalary={job.salaryMin}
        maxSalary={job.salaryMax}
        // Optional: Add market data if available from API
        // averageSalary={marketData?.average}
        // marketMin={marketData?.min}
        // marketMax={marketData?.max}
      />
    </motion.div>
  )}

  {/* Rest of content */}
</div>

// ============================================================================
// INTEGRATION EXAMPLE: How to add ProfileCompletion to Dashboard/Profile
// ============================================================================

// File: src/pages/dashboard/Dashboard.jsx or src/pages/profile/Profile.jsx

// 1. ADD IMPORTS
import ProfileCompletion from '@/components/common/ProfileCompletion';
import { useSelector } from 'react-redux';

// 2. IN COMPONENT
const Dashboard = () => {
  const { user } = useSelector(state => state.auth);
  
  const handleProfileAction = (action, item) => {
    switch(action) {
      case 'editBasicInfo':
        navigate('/profile/edit');
        break;
      case 'editBio':
        navigate('/profile/edit?section=bio');
        break;
      case 'addExperience':
        // Open experience modal or navigate
        setShowExperienceModal(true);
        break;
      case 'addEducation':
        setShowEducationModal(true);
        break;
      case 'addSkills':
        navigate('/profile/edit?section=skills');
        break;
      case 'uploadCV':
        navigate('/profile/cv');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  return (
    <div className="container py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Completion Card */}
        <ProfileCompletion
          profile={user}
          onActionClick={handleProfileAction}
        />

        {/* Rest of dashboard content */}
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE: Map View Toggle (Optional - needs backend support)
// ============================================================================

// File: src/pages/jobs/JobSearch.jsx

// 1. ADD STATE
const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

// 2. ADD TOGGLE BUTTONS (before results)
<div className="flex gap-2 mb-6">
  <Button
    variant={viewMode === 'list' ? 'default' : 'outline'}
    onClick={() => setViewMode('list')}
    className="flex items-center gap-2"
  >
    <List className="h-4 w-4" />
    Xem danh sách
  </Button>
  <Button
    variant={viewMode === 'map' ? 'default' : 'outline'}
    onClick={() => setViewMode('map')}
    className="flex items-center gap-2"
  >
    <MapPin className="h-4 w-4" />
    Xem bản đồ
  </Button>
</div>

// 3. CONDITIONAL RENDERING
{viewMode === 'list' ? (
  <JobResultsList {...props} />
) : (
  <JobMapView 
    jobs={searchResults?.data || []}
    onJobClick={(job) => navigate(`/jobs/${job._id}`)}
  />
)}

// ============================================================================
// NOTES
// ============================================================================

/**
 * 1. SalaryVisualization:
 *    - Works best with both min and max salary
 *    - Can show market comparison if data available
 *    - Automatically calculates competitive level
 * 
 * 2. ProfileCompletion:
 *    - Tracks 6 aspects of profile completion
 *    - Each item has weight (total 100%)
 *    - Shows motivational messages
 *    - Provides direct action buttons
 * 
 * 3. SalaryRangeSlider:
 *    - Already integrated in SearchFilters
 *    - Dual-handle slider for better UX
 *    - Quick presets for common ranges
 * 
 * 4. Framer Motion:
 *    - Already applied to JobResultCard and JobResultsList
 *    - Add to any component with motion.div wrapper
 *    - Use stagger for lists
 * 
 * 5. All components:
 *    - Follow semantic color system
 *    - Responsive by default
 *    - Accessible (ARIA labels)
 *    - No errors/warnings
 */
