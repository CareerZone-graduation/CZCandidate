import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

const ClassicWhiteTemplate = ({ cvData, showHeader = true, measureMode = false, pageNumber = 1 }) => {
  const { personalInfo, professionalSummary, workExperience, education, skills, projects, certificates, sectionOrder } = cvData;

  // Section rendering functions
  const renderSummary = () => {
    if (!professionalSummary) return null;
    return (
      <section data-section="summary" className="mb-8 break-inside-avoid">
        <h2 className="text-xl font-bold text-gray-800 mb-3 uppercase tracking-wide break-after-avoid">
          Professional Summary
        </h2>
        <hr className="border-gray-300 mb-4" />
        <p className="text-gray-700 leading-relaxed">{professionalSummary}</p>
      </section>
    );
  };

  const renderExperience = () => {
    if (!workExperience || workExperience.length === 0) return null;
    return (
      <section data-section="experience" className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-3 uppercase tracking-wide break-after-avoid">
          Work Experience
        </h2>
        <hr className="border-gray-300 mb-4" />
        <div className="space-y-6">
          {workExperience.map((job) => (
            <div key={job.id} className="break-inside-avoid mb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{job.position}</h3>
                  <p className="text-gray-600 font-medium">{job.company}</p>
                </div>
                <div className="text-sm text-gray-500 text-right">
                  {job.startDate} - {job.isCurrentJob ? 'Present' : job.endDate}
                </div>
              </div>
              <p className="text-gray-700 mb-3">{job.description}</p>
              {job.achievements && job.achievements.length > 0 && (
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
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
      <section data-section="education" className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-3 uppercase tracking-wide break-after-avoid">
          Education
        </h2>
        <hr className="border-gray-300 mb-4" />
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id} className="flex justify-between items-start break-inside-avoid mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{edu.degree}</h3>
                <p className="text-gray-600">{edu.institution}</p>
                <p className="text-gray-600">{edu.fieldOfStudy}</p>
                {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
                {edu.honors && <p className="text-sm text-gray-500">{edu.honors}</p>}
              </div>
              <div className="text-sm text-gray-500 text-right">
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
      <section data-section="skills" className="mb-8 break-inside-avoid">
        <h2 className="text-xl font-bold text-gray-800 mb-3 uppercase tracking-wide">
          Skills
        </h2>
        <hr className="border-gray-300 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Technical', 'Soft Skills', 'Language'].map((category) => {
            const categorySkills = skills.filter(skill => skill.category === category);
            if (categorySkills.length === 0) return null;
            
            return (
              <div key={category}>
                <h3 className="font-bold text-gray-800 mb-3">{category}</h3>
                <ul className="space-y-1">
                  {categorySkills.map((skill) => (
                    <li key={skill.id} className="flex justify-between">
                      <span className="text-gray-700">{skill.name}</span>
                      <span className="text-gray-500">{skill.level}</span>
                    </li>
                  ))}
                </ul>
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
        <h2 className="text-xl font-bold text-gray-800 mb-3 uppercase tracking-wide break-after-avoid">
          Projects
        </h2>
        <hr className="border-gray-300 mb-4" />
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="break-inside-avoid mb-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                <div className="text-sm text-gray-500">
                  {project.startDate} - {project.endDate}
                </div>
              </div>
              <p className="text-gray-700 mb-2">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.technologies && project.technologies.map((tech, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm">
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
        <h2 className="text-xl font-bold text-gray-800 mb-3 uppercase tracking-wide break-after-avoid">
          Certifications
        </h2>
        <hr className="border-gray-300 mb-4" />
        <div className="space-y-3">
          {certificates.map((cert) => (
            <div key={cert.id} className="flex justify-between items-start break-inside-avoid mb-3">
              <div>
                <h3 className="font-bold text-gray-800">{cert.name}</h3>
                <p className="text-gray-600">{cert.issuer}</p>
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
      {/* Header - only show when showHeader is true */}
      {showHeader && (
        <div className="border-b-4 border-gray-800 p-8">
          <div className="text-center">
            {personalInfo.profileImage && (
              <img
                src={personalInfo.profileImage}
                alt={personalInfo.fullName}
                className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-gray-300"
              />
            )}
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{personalInfo.fullName}</h1>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              {personalInfo.email && (
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {personalInfo.email}
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  {personalInfo.phone}
                </div>
              )}
              {personalInfo.address && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {personalInfo.address}
                </div>
              )}
              {personalInfo.website && (
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  {personalInfo.website}
                </div>
              )}
              {personalInfo.linkedin && (
                <div className="flex items-center">
                  <Linkedin className="w-4 h-4 mr-1" />
                  LinkedIn
                </div>
              )}
              {personalInfo.github && (
                <div className="flex items-center">
                  <Github className="w-4 h-4 mr-1" />
                  GitHub
                </div>
              )}
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

export default ClassicWhiteTemplate;