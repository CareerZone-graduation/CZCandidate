import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

const MinimalGrayTemplate = ({ cvData, showHeader = true, measureMode = false, pageNumber = 1 }) => {
  const { personalInfo, professionalSummary, workExperience, education, skills, projects, certificates, sectionOrder } = cvData;

  // Section rendering functions
  const renderSummary = () => {
    if (!professionalSummary) return null;
    return (
      <section data-section="summary" className="mb-8 break-inside-avoid">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 break-after-avoid">
          About
        </h2>
        <p className="text-gray-700 leading-relaxed">{professionalSummary}</p>
      </section>
    );
  };

  const renderExperience = () => {
    if (!workExperience || workExperience.length === 0) return null;
    return (
      <section data-section="experience" className="mb-8">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 break-after-avoid">
          Experience
        </h2>
        <div className="space-y-6">
          {workExperience.map((job) => (
            <div key={job.id} className="break-inside-avoid mb-6">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-lg font-medium text-gray-900">{job.position}</h3>
                <span className="text-sm text-gray-500">
                  {job.startDate} — {job.isCurrentJob ? 'Present' : job.endDate}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{job.company}</p>
              <p className="text-gray-700 mb-3 leading-relaxed">{job.description}</p>
              {job.achievements && job.achievements.length > 0 && (
                <ul className="text-gray-700 space-y-1">
                  {job.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-gray-400 mr-2 mt-2 w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></span>
                      <span className="leading-relaxed">{achievement}</span>
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
      <section data-section="education" className="mb-8">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 break-after-avoid">
          Education
        </h2>
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id} className="break-inside-avoid mb-6">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-lg font-medium text-gray-900">{edu.degree}</h3>
                <span className="text-sm text-gray-500">
                  {edu.startDate} — {edu.endDate}
                </span>
              </div>
              <p className="text-gray-600">{edu.institution}</p>
              <p className="text-gray-600">{edu.fieldOfStudy}</p>
              {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
              {edu.honors && <p className="text-sm text-gray-600">{edu.honors}</p>}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSkills = () => {
    if (!skills || skills.length === 0) return null;
    return (
      <section data-section="skills" className="mb-8 break-inside-avoid">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 break-after-avoid">
          Skills
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Technical', 'Soft Skills', 'Language'].map((category) => {
            const categorySkills = skills.filter(skill => skill.category === category);
            if (categorySkills.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="text-sm font-medium text-gray-700 mb-3">{category}</h3>
                <div className="space-y-2">
                  {categorySkills.map((skill) => (
                    <div key={skill.id} className="flex justify-between">
                      <span className="text-gray-700">{skill.name}</span>
                      <span className="text-xs text-gray-500">{skill.level}</span>
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
      <section data-section="projects" className="mb-8">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 break-after-avoid">
          Projects
        </h2>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="break-inside-avoid mb-6">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                <span className="text-sm text-gray-500">
                  {project.startDate} — {project.endDate}
                </span>
              </div>
              <p className="text-gray-700 mb-2 leading-relaxed">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.technologies && project.technologies.map((tech, index) => (
                  <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
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
      <section data-section="certificates" className="mb-8">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 break-after-avoid">
          Certifications
        </h2>
        <div className="space-y-3">
          {certificates.map((cert) => (
            <div key={cert.id} className="break-inside-avoid mb-6">
              <div className="flex justify-between items-baseline">
                <div>
                  <h3 className="font-medium text-gray-900">{cert.name}</h3>
                  <p className="text-gray-600">{cert.issuer}</p>
                  {cert.credentialId && (
                    <p className="text-xs text-gray-500">ID: {cert.credentialId}</p>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {cert.issueDate}
                  {cert.expiryDate && ` — ${cert.expiryDate}`}
                </div>
              </div>
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
    <div className="w-full bg-white">
      {/* Header - only show when showHeader is true */}
      {showHeader && (
        <div className="p-8 pb-6">
          <div className="flex items-start space-x-8">
            {personalInfo.profileImage && (
              <img
                src={personalInfo.profileImage}
                alt={personalInfo.fullName}
                className="w-24 h-24 rounded object-cover grayscale"
              />
            )}
            <div className="flex-1">
              <h1 className="text-5xl font-light text-gray-900 mb-4">{personalInfo.fullName}</h1>
              <div className="space-y-1 text-sm text-gray-600">
                {personalInfo.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    {personalInfo.email}
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    {personalInfo.phone}
                  </div>
                )}
                {personalInfo.address && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                    {personalInfo.address}
                  </div>
                )}
                {personalInfo.website && (
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-3 text-gray-400" />
                    <a href={personalInfo.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {personalInfo.website}
                    </a>
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div className="flex items-center">
                    <Linkedin className="w-4 h-4 mr-3 text-gray-400" />
                    <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {personalInfo.github && (
                  <div className="flex items-center">
                    <Github className="w-4 h-4 mr-3 text-gray-400" />
                    <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      GitHub Profile
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Content based on sectionOrder */}
      <div className={`px-8 pb-8 ${!showHeader ? 'pt-8' : ''}`}>
        {sectionOrder && sectionOrder.map((sectionId) => {
          const renderFunction = sectionComponents[sectionId];
          return renderFunction ? renderFunction() : null;
        })}
      </div>
    </div>
  );
};

export default MinimalGrayTemplate;