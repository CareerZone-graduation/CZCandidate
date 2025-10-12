import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

const CompactDenseTemplate = ({ cvData, showHeader = true, measureMode = false, pageNumber = 1 }) => {
  const { personalInfo, professionalSummary, workExperience, education, skills, projects, certificates, sectionOrder } = cvData;

  // Section rendering functions
  const renderSummary = () => {
    if (!professionalSummary) return null;
    return (
      <section data-section="summary" className="mb-4 break-inside-avoid">
        <h2 className="text-sm font-bold text-gray-800 mb-2 uppercase break-after-avoid">Summary</h2>
        <p className="text-xs text-gray-700 leading-tight">{professionalSummary}</p>
      </section>
    );
  };

  const renderExperience = () => {
    if (!workExperience || workExperience.length === 0) return null;
    return (
      <section data-section="experience" className="mb-4">
        <h2 className="text-sm font-bold text-gray-800 mb-2 uppercase break-after-avoid">Experience</h2>
        <div className="space-y-3">
          {workExperience.map((job) => (
            <div key={job.id} className="break-inside-avoid mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-sm font-semibold text-gray-800">{job.position}</h3>
                <span className="text-xs text-gray-500">
                  {job.startDate} - {job.isCurrentJob ? 'Present' : job.endDate}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-1">{job.company}</p>
              <p className="text-xs text-gray-700 leading-tight mb-1">{job.description}</p>
              {job.achievements && job.achievements.length > 0 && (
                <ul className="text-xs text-gray-700 space-y-0.5">
                  {job.achievements.slice(0, 2).map((achievement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-gray-400 mr-1">•</span>
                      <span className="leading-tight">{achievement}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderEducation = () => {
    if (!education || education.length === 0) return null;
    return (
      <section data-section="education" className="mb-4">
        <h2 className="text-sm font-bold text-gray-800 mb-2 uppercase break-after-avoid">Education</h2>
        <div className="space-y-2">
          {education.map((edu) => (
            <div key={edu.id} className="break-inside-avoid mb-4">
              <div className="flex justify-between items-baseline">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">{edu.degree}</h3>
                  <p className="text-xs text-gray-600">{edu.institution}</p>
                  {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
                </div>
                <span className="text-xs text-gray-500">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSkills = () => {
    if (!skills || skills.length === 0) return null;
    return (
      <section data-section="skills" className="mb-4 break-inside-avoid">
        <h2 className="text-sm font-bold text-gray-800 mb-2 uppercase break-after-avoid">Skills</h2>
        <div className="grid grid-cols-3 gap-3">
          {['Technical', 'Soft Skills', 'Language'].map((category) => {
            const categorySkills = skills.filter(skill => skill.category === category);
            if (categorySkills.length === 0) return null;
            
            return (
              <div key={category}>
                <h3 className="text-xs font-semibold text-gray-700 mb-1">{category}</h3>
                <div className="space-y-1">
                  {categorySkills.slice(0, 4).map((skill) => (
                    <div key={skill.id} className="text-xs text-gray-600">
                      {skill.name} ({skill.level})
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderProjects = () => {
    if (!projects || projects.length === 0) return null;
    return (
      <section data-section="projects" className="mb-4">
        <h2 className="text-sm font-bold text-gray-800 mb-2 uppercase break-after-avoid">Projects</h2>
        <div className="space-y-2">
          {projects.slice(0, 3).map((project) => (
            <div key={project.id} className="break-inside-avoid mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-sm font-semibold text-gray-800">{project.name}</h3>
                <span className="text-xs text-gray-500">
                  {project.startDate} - {project.endDate}
                </span>
              </div>
              <p className="text-xs text-gray-700 leading-tight mb-1">{project.description}</p>
              <div className="flex flex-wrap gap-1">
                {project.technologies && project.technologies.slice(0, 4).map((tech, index) => (
                  <span key={index} className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderCertificates = () => {
    if (!certificates || certificates.length === 0) return null;
    return (
      <section data-section="certificates" className="mb-4">
        <h2 className="text-sm font-bold text-gray-800 mb-2 uppercase break-after-avoid">Certifications</h2>
        <div className="space-y-1">
          {certificates.slice(0, 4).map((cert) => (
            <div key={cert.id} className="flex justify-between items-baseline break-inside-avoid mb-4">
              <div>
                <h3 className="text-xs font-semibold text-gray-800">{cert.name}</h3>
                <p className="text-xs text-gray-600">{cert.issuer}</p>
              </div>
              <span className="text-xs text-gray-500">{cert.issueDate}</span>
            </div>
          ))}
        </div>
      </section>
    );
  };

  // Section mapping
  const sectionComponents = {
    summary: renderSummary,
    experience: renderExperience,
    education: renderEducation,
    skills: renderSkills,
    projects: renderProjects,
    certificates: renderCertificates
  };

  return (
    <div className="w-full bg-white text-xs leading-tight">
      {/* Compact Header - only show when showHeader is true */}
      {showHeader && (
        <div className="border-b-2 border-gray-800 p-4">
          <div className="flex items-center space-x-4">
            {personalInfo.profileImage && (
              <img
                src={personalInfo.profileImage}
                alt={personalInfo.fullName}
                className="w-16 h-16 rounded object-cover border border-gray-300"
              />
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{personalInfo.fullName}</h1>
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                {personalInfo.email && (
                  <div className="flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    {personalInfo.email}
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    {personalInfo.phone}
                  </div>
                )}
                {personalInfo.address && (
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {personalInfo.address}
                  </div>
                )}
                {personalInfo.website && (
                  <div className="flex items-center">
                    <Globe className="w-3 h-3 mr-1" />
                    Website
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div className="flex items-center">
                    <Linkedin className="w-3 h-3 mr-1" />
                    LinkedIn
                  </div>
                )}
                {personalInfo.github && (
                  <div className="flex items-center">
                    <Github className="w-3 h-3 mr-1" />
                    GitHub
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compact Content */}
      <div className="p-4 space-y-4">
        {sectionOrder && sectionOrder.map((sectionId) => {
          const renderFunction = sectionComponents[sectionId];
          return renderFunction ? renderFunction() : null;
        })}
      </div>
    </div>
  );
};

export default CompactDenseTemplate;