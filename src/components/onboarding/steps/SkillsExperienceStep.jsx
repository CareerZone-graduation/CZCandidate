// Legacy component - redirects to new SkillsStep
// This file is kept for backward compatibility
import { SkillsStep } from './SkillsStep';

// Legacy component wrapper for backward compatibility
export const SkillsExperienceStep = (props) => {
  return <SkillsStep {...props} />;
};
