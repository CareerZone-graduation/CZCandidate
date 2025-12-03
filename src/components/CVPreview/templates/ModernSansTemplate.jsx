import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Calendar } from 'lucide-react';

const ModernSansTemplate = ({ cvData, showHeader = true, measureMode = false, pageNumber = 1 }) => {
  const { personalInfo, professionalSummary, workExperience, education, skills, projects, certificates, sectionOrder } = cvData;

  // Section rendering functions
  const renderSummary = () => {
    if (!professionalSummary) return null;
    return (
      <section data-section="summary" className="mb-8 break-inside-avoid">
        <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-wider break-after-avoid">
          About
        </h2>
        <p className="text-gray-600 leading-relaxed text-base">{professionalSummary}</p>
      </section>
    );
  };

  const renderExperience = () => {
    if (!workExperience || workExperience.length === 0) return null;
    return (
      <section data-section="experience" className="mb-8">
        <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-wider break-after-avoid">
          Experience
        </h2>
        <div className="space-y-6">
          {workExperience.map((job) => (
            <div key={job.id} className="border-l-4 border-blue-500 pl-6 break-inside-avoid mb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{job.position}</h3>
                  <p className="text-blue-600 font-semibold">{job.company}</p>
                </div>
                <div className="text-sm text-gray-500 flex items-center bg-gray-100 px-3 py-1 rounded-full">
                  <Calendar className="w-3 h-3 mr-1" />
                  {job.startDate} - {job.isCurrentJob ? 'Now' : job.endDate}
                </div>
              </div>
              <p className="text-gray-600 mb-3 leading-relaxed">{job.description}</p>
              {job.achievements && job.achievements.length > 0 && (
                <ul className="text-gray-600 space-y-1">
                  {job.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
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
        <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-wider break-after-avoid">
          Education
        </h2>
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id} className="bg-gray-50 rounded-lg p-4 break-inside-avoid mb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{edu.degree}</h3>
                  <p className="text-blue-600 font-semibold">{edu.institution}</p>
                  <p className="text-gray-600">{edu.fieldOfStudy}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {edu.startDate} - {edu.endDate}
                </div>
              </div>
              {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
              {edu.honors && <p className="text-sm text-blue-600 font-medium">{edu.honors}</p>}
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
        <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-wider break-after-avoid">
          Skills
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Technical', 'Soft Skills', 'Language'].map((category) => {
            const categorySkills = skills.filter(skill => skill.category === category);
            if (categorySkills.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">{category}</h3>
                <div className="space-y-3">
                  {categorySkills.map((skill) => (
                    <div key={skill.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{skill.name}</span>
                        <span className="text-gray-500 text-xs">{skill.level}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
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
      </section>
    );
  };

  const renderProjects = () => {
    if (!projects || projects.length === 0) return null;
    return (
      <section data-section="projects" className="mb-8">
        <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-wider break-after-avoid">
          Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow break-inside-avoid mb-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                <div className="text-xs text-gray-500">
                  {project.startDate} - {project.endDate}
                </div>
              </div>
              <p className="text-gray-600 mb-3 text-sm leading-relaxed">{project.description}</p>
              <div className="flex flex-wrap gap-1">
                {project.technologies && project.technologies.map((tech, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
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
        <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-wider break-after-avoid">
          Certifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100 break-inside-avoid mb-6">
              <h3 className="font-bold text-gray-900 mb-1">{cert.name}</h3>
              <p className="text-blue-600 font-semibold text-sm">{cert.issuer}</p>
              <p className="text-xs text-gray-500 mt-1">{cert.issueDate}</p>
              {cert.credentialId && (
                <p className="text-xs text-gray-400">ID: {cert.credentialId}</p>
              )}
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
    <div className="w-full bg-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header - only show when showHeader is true */}
      {showHeader && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8">
          <div className="flex items-center space-x-6">
            {personalInfo.profileImage && (
              <img
                src={personalInfo.profileImage}
                alt={personalInfo.fullName}
                className="w-24 h-24 rounded-full border-4 border-white/20 object-cover"
              />
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-black mb-3 tracking-tight">{personalInfo.fullName}</h1>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
                {personalInfo.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {personalInfo.email}
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {personalInfo.phone}
                  </div>
                )}
                {personalInfo.address && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {personalInfo.address}
                  </div>
                )}
                {personalInfo.website && (
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    <a href={personalInfo.website} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white hover:underline">
                      {personalInfo.website}
                    </a>
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div className="flex items-center">
                    <Linkedin className="w-4 h-4 mr-2" />
                    <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white hover:underline">
                      LinkedIn
                    </a>
                  </div>
                )}
                {personalInfo.github && (
                  <div className="flex items-center">
                    <Github className="w-4 h-4 mr-2" />
                    <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white hover:underline">
                      GitHub
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Content based on sectionOrder */}
      <div className="p-8">
        {sectionOrder && sectionOrder.map((sectionId) => {
          const renderFunction = sectionComponents[sectionId];
          return renderFunction ? renderFunction() : null;
        })}
      </div>
    </div>
  );
};

export default ModernSansTemplate;