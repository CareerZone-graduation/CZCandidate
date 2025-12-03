import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Calendar } from 'lucide-react';

const TwoColumnSidebarTemplate = ({ cvData, showHeader = true, measureMode = false, pageNumber = 1 }) => {
  const { personalInfo, professionalSummary, workExperience, education, skills, projects, certificates, sectionOrder } = cvData;

  // Left sidebar sections
  const renderPersonalInfo = () => (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wide">Contact</h2>
      <div className="space-y-3 text-sm">
        {personalInfo.email && (
          <div className="flex items-center text-gray-200">
            <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
            <span className="break-all">{personalInfo.email}</span>
          </div>
        )}
        {personalInfo.phone && (
          <div className="flex items-center text-gray-200">
            <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
            <span>{personalInfo.phone}</span>
          </div>
        )}
        {personalInfo.address && (
          <div className="flex items-center text-gray-200">
            <MapPin className="w-4 h-4 mr-3 flex-shrink-0" />
            <span>{personalInfo.address}</span>
          </div>
        )}
        {personalInfo.website && (
          <div className="flex items-center text-gray-200">
            <Globe className="w-4 h-4 mr-3 flex-shrink-0" />
            <a href={personalInfo.website} target="_blank" rel="noopener noreferrer" className="break-all hover:text-white hover:underline">
              {personalInfo.website}
            </a>
          </div>
        )}
        {personalInfo.linkedin && (
          <div className="flex items-center text-gray-200">
            <Linkedin className="w-4 h-4 mr-3 flex-shrink-0" />
            <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">
              LinkedIn
            </a>
          </div>
        )}
        {personalInfo.github && (
          <div className="flex items-center text-gray-200">
            <Github className="w-4 h-4 mr-3 flex-shrink-0" />
            <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">
              GitHub
            </a>
          </div>
        )}
      </div>
    </div>
  );

  const renderSidebarSkills = () => {
    if (!skills || skills.length === 0) return null;
    return (
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wide">Skills</h2>
        <div className="space-y-4">
          {['Technical', 'Soft Skills', 'Language'].map((category) => {
            const categorySkills = skills.filter(skill => skill.category === category);
            if (categorySkills.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">{category}</h3>
                <div className="space-y-2">
                  {categorySkills.map((skill) => (
                    <div key={skill.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-200">{skill.name}</span>
                        <span className="text-gray-400">{skill.level}</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-1">
                        <div
                          className="bg-blue-400 h-1 rounded-full"
                          style={{
                            width: skill.level === 'Expert' ? '100%' :
                              skill.level === 'Advanced' ? '80%' :
                                skill.level === 'Intermediate' ? '60%' : '40%'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSidebarEducation = () => {
    if (!education || education.length === 0) return null;
    return (
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wide">Education</h2>
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id}>
              <h3 className="text-sm font-semibold text-gray-200">{edu.degree}</h3>
              <p className="text-xs text-gray-300">{edu.institution}</p>
              <p className="text-xs text-gray-400">{edu.startDate} - {edu.endDate}</p>
              {edu.gpa && <p className="text-xs text-gray-400">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Main content sections
  const renderSummary = () => {
    if (!professionalSummary) return null;
    return (
      <section data-section="summary" className="mb-6 break-inside-avoid">
        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-blue-600 pb-1 break-after-avoid">
          Professional Summary
        </h2>
        <p className="text-gray-700 leading-relaxed">{professionalSummary}</p>
      </section>
    );
  };

  const renderExperience = () => {
    if (!workExperience || workExperience.length === 0) return null;
    return (
      <section data-section="experience" className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-blue-600 pb-1 break-after-avoid">
          Work Experience
        </h2>
        <div className="space-y-5">
          {workExperience.map((job) => (
            <div key={job.id} className="break-inside-avoid mb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{job.position}</h3>
                  <p className="text-blue-600 font-medium">{job.company}</p>
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {job.startDate} - {job.isCurrentJob ? 'Present' : job.endDate}
                </div>
              </div>
              <p className="text-gray-700 mb-2">{job.description}</p>
              {job.achievements && job.achievements.length > 0 && (
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  {job.achievements.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderProjects = () => {
    if (!projects || projects.length === 0) return null;
    return (
      <section data-section="projects" className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-blue-600 pb-1 break-after-avoid">
          Projects
        </h2>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="break-inside-avoid mb-6">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                <div className="text-sm text-gray-500">
                  {project.startDate} - {project.endDate}
                </div>
              </div>
              <p className="text-gray-700 mb-2 text-sm">{project.description}</p>
              <div className="flex flex-wrap gap-1">
                {project.technologies && project.technologies.map((tech, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
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
      <section data-section="certificates" className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-blue-600 pb-1 break-after-avoid">
          Certifications
        </h2>
        <div className="space-y-3">
          {certificates.map((cert) => (
            <div key={cert.id} className="break-inside-avoid mb-6">
              <h3 className="font-semibold text-gray-800">{cert.name}</h3>
              <p className="text-blue-600 text-sm">{cert.issuer}</p>
              <p className="text-xs text-gray-500">{cert.issueDate}</p>
            </div>
          ))}
        </div>
      </section>
    );
  };

  // Section mapping for main content
  const mainSectionComponents = {
    summary: renderSummary,
    experience: renderExperience,
    projects: renderProjects,
    certificates: renderCertificates
  };

  return (
    <div className="w-full bg-white flex">
      {/* Left Sidebar - only show when showHeader is true */}
      {showHeader && (
        <div className="w-1/3 bg-gray-800 p-6">
          {/* Profile Image */}
          {personalInfo.profileImage && (
            <div className="text-center mb-6">
              <img
                src={personalInfo.profileImage}
                alt={personalInfo.fullName}
                className="w-24 h-24 rounded-full mx-auto border-4 border-gray-600 object-cover"
              />
            </div>
          )}

          {/* Name */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">{personalInfo.fullName}</h1>
          </div>

          {/* Sidebar Content */}
          {renderPersonalInfo()}
          {renderSidebarSkills()}
          {renderSidebarEducation()}
        </div>
      )}

      {/* Main Content */}
      <div className={showHeader ? "w-2/3 p-6" : "w-full p-6"}>
        {sectionOrder && sectionOrder.map((sectionId) => {
          const renderFunction = mainSectionComponents[sectionId];
          return renderFunction ? renderFunction() : null;
        })}
      </div>
    </div>
  );
};

export default TwoColumnSidebarTemplate;