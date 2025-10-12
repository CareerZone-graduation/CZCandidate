import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Calendar } from 'lucide-react';

const ModernBlueTemplate = ({ cvData, showHeader = true, measureMode = false, pageNumber = 1 }) => {
  const { personalInfo, professionalSummary, workExperience, education, skills, projects, certificates, sectionOrder } = cvData;

  // Section rendering functions
  const renderSummary = () => {
    if (!professionalSummary) return null;
    return (
      <section className="mb-8 break-inside-avoid" data-section="summary">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2 break-after-avoid">
          Professional Summary
        </h2>
        <p className="text-gray-700 leading-relaxed">{professionalSummary}</p>
      </section>
    );
  };

  const renderExperience = () => {
    if (!workExperience || workExperience.length === 0) return null;

    return (
      <section className="mb-8" data-section="experience">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2 break-after-avoid">
          Work Experience
        </h2>
        <div className="space-y-6">
          {workExperience.map((job) => (
            <div key={job.id} className="relative pl-6 border-l-2 border-blue-200 break-inside-avoid mb-6">
              <div className="absolute w-4 h-4 bg-blue-600 rounded-full -left-2 top-0"></div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{job.position}</h3>
                  <p className="text-blue-600 font-medium">{job.company}</p>
                </div>
                <div className="text-sm text-gray-500 flex items-center whitespace-nowrap ml-4">
                  <Calendar className="w-4 h-4 mr-1" />
                  {job.startDate} - {job.isCurrentJob ? 'Present' : job.endDate}
                </div>
              </div>
              <p className="text-gray-700 mb-3">{job.description}</p>
              {job.achievements && job.achievements.length > 0 && (
                <ul className="list-disc list-inside text-gray-700 space-y-1">
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

  const renderEducation = () => {
    if (!education || education.length === 0) return null;

    return (
      <section className="mb-8" data-section="education">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2 break-after-avoid">
          Education
        </h2>
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id} className="flex justify-between items-start break-inside-avoid mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{edu.degree}</h3>
                <p className="text-blue-600">{edu.institution}</p>
                <p className="text-gray-600">{edu.fieldOfStudy}</p>
                {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
                {edu.honors && <p className="text-sm text-gray-500">{edu.honors}</p>}
              </div>
              <div className="text-sm text-gray-500 flex items-center whitespace-nowrap ml-4">
                <Calendar className="w-4 h-4 mr-1" />
                {edu.startDate} - {edu.endDate}
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
      <section className="mb-8 break-inside-avoid" data-section="skills">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">
          Skills
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Technical', 'Soft Skills', 'Language'].map((category) => {
            const categorySkills = skills.filter(skill => skill.category === category);
            if (categorySkills.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="font-semibold text-gray-800 mb-2">{category}</h3>
                <div className="space-y-2">
                  {categorySkills.map((skill) => (
                    <div key={skill.id}>
                      <div className="flex justify-between text-sm">
                        <span>{skill.name}</span>
                        <span className="text-blue-600">{skill.level}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
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
      <section className="mb-8" data-section="projects">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2 break-after-avoid">
          Projects
        </h2>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="break-inside-avoid mb-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                <div className="text-sm text-gray-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {project.startDate} - {project.endDate}
                </div>
              </div>
              <p className="text-gray-700 mb-2">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.technologies && project.technologies.map((tech, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
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
      <section className="mb-8" data-section="certificates">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2 break-after-avoid">
          Certifications
        </h2>
        <div className="space-y-3">
          {certificates.map((cert) => (
            <div key={cert.id} className="flex justify-between items-start break-inside-avoid mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">{cert.name}</h3>
                <p className="text-blue-600">{cert.issuer}</p>
                {cert.credentialId && (
                  <p className="text-sm text-gray-500">ID: {cert.credentialId}</p>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {cert.issueDate}
                {cert.expiryDate && ` - ${cert.expiryDate}`}
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
      {/* Header - only show on first page or when showHeader is true */}
      {showHeader && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
          <div className="flex items-center space-x-6">
            {personalInfo.profileImage && (
              <img
                src={personalInfo.profileImage}
                alt={personalInfo.fullName}
                className="w-24 h-24 rounded-full border-4 border-white object-cover"
              />
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{personalInfo.fullName}</h1>
              <div className="grid grid-cols-2 gap-2 text-sm opacity-90">
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
                    {personalInfo.website}
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div className="flex items-center">
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </div>
                )}
                {personalInfo.github && (
                  <div className="flex items-center">
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
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

export default ModernBlueTemplate;