import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

const ElegantSerifTemplate = ({ cvData, showHeader = true, measureMode = false, pageNumber = 1 }) => {
  const { personalInfo, professionalSummary, workExperience, education, skills, projects, certificates, sectionOrder } = cvData;

  // Section rendering functions
  const renderSummary = () => {
    if (!professionalSummary) return null;
    return (
      <section data-section="summary" className="mb-10 break-inside-avoid">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 font-serif border-b border-gray-300 pb-2 break-after-avoid">
          Professional Summary
        </h2>
        <p className="text-gray-700 leading-loose text-lg font-serif">{professionalSummary}</p>
      </section>
    );
  };

  const renderExperience = () => {
    if (!workExperience || workExperience.length === 0) return null;
    return (
      <section data-section="experience" className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 font-serif border-b border-gray-300 pb-2 break-after-avoid">
          Professional Experience
        </h2>
        <div className="space-y-8">
          {workExperience.map((job) => (
            <div key={job.id} className="break-inside-avoid mb-6">
              <div className="flex justify-between items-baseline mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 font-serif">{job.position}</h3>
                  <p className="text-lg text-gray-600 font-serif italic">{job.company}</p>
                </div>
                <div className="text-sm text-gray-500 font-sans">
                  {job.startDate} — {job.isCurrentJob ? 'Present' : job.endDate}
                </div>
              </div>
              <p className="text-gray-700 mb-4 leading-loose font-serif">{job.description}</p>
              {job.achievements && job.achievements.length > 0 && (
                <ul className="text-gray-700 space-y-2 font-serif">
                  {job.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start leading-loose">
                      <span className="text-gray-400 mr-3 mt-2">•</span>
                      <span>{achievement}</span>
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
      <section data-section="education" className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 font-serif border-b border-gray-300 pb-2 break-after-avoid">
          Education
        </h2>
        <div className="space-y-6">
          {education.map((edu) => (
            <div key={edu.id} className="break-inside-avoid mb-6">
              <div className="flex justify-between items-baseline mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 font-serif">{edu.degree}</h3>
                  <p className="text-lg text-gray-600 font-serif italic">{edu.institution}</p>
                  <p className="text-gray-600 font-serif">{edu.fieldOfStudy}</p>
                </div>
                <div className="text-sm text-gray-500 font-sans">
                  {edu.startDate} — {edu.endDate}
                </div>
              </div>
              {edu.gpa && <p className="text-sm text-gray-500 font-serif">GPA: {edu.gpa}</p>}
              {edu.honors && <p className="text-sm text-gray-600 font-serif italic">{edu.honors}</p>}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSkills = () => {
    if (!skills || skills.length === 0) return null;
    return (
      <section data-section="skills" className="mb-10 break-inside-avoid">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 font-serif border-b border-gray-300 pb-2 break-after-avoid">
          Core Competencies
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {['Technical', 'Soft Skills', 'Language'].map((category) => {
            const categorySkills = skills.filter(skill => skill.category === category);
            if (categorySkills.length === 0) return null;
            
            return (
              <div key={category}>
                <h3 className="text-lg font-bold text-gray-800 mb-4 font-serif">{category}</h3>
                <div className="space-y-3">
                  {categorySkills.map((skill) => (
                    <div key={skill.id} className="flex justify-between items-center">
                      <span className="text-gray-700 font-serif">{skill.name}</span>
                      <span className="text-sm text-gray-500 font-sans">{skill.level}</span>
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
      <section data-section="projects" className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 font-serif border-b border-gray-300 pb-2 break-after-avoid">
          Notable Projects
        </h2>
        <div className="space-y-6">
          {projects.map((project) => (
            <div key={project.id} className="break-inside-avoid mb-6">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-xl font-bold text-gray-800 font-serif">{project.name}</h3>
                <div className="text-sm text-gray-500 font-sans">
                  {project.startDate} — {project.endDate}
                </div>
              </div>
              <p className="text-gray-700 mb-3 leading-loose font-serif">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.technologies && project.technologies.map((tech, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-sans">
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
      <section data-section="certificates" className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 font-serif border-b border-gray-300 pb-2 break-after-avoid">
          Professional Certifications
        </h2>
        <div className="space-y-4">
          {certificates.map((cert) => (
            <div key={cert.id} className="flex justify-between items-start break-inside-avoid mb-6">
              <div>
                <h3 className="font-bold text-gray-800 font-serif text-lg">{cert.name}</h3>
                <p className="text-gray-600 font-serif italic">{cert.issuer}</p>
                {cert.credentialId && (
                  <p className="text-sm text-gray-500 font-sans">Credential ID: {cert.credentialId}</p>
                )}
              </div>
              <div className="text-sm text-gray-500 font-sans">
                {cert.issueDate}
                {cert.expiryDate && ` — ${cert.expiryDate}`}
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
    <div className="w-full bg-white" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Header - only show when showHeader is true */}
      {showHeader && (
        <div className="border-b-2 border-gray-800 p-10 bg-gray-50">
          <div className="text-center">
            {personalInfo.profileImage && (
              <img
                src={personalInfo.profileImage}
                alt={personalInfo.fullName}
                className="w-28 h-28 rounded-full mx-auto mb-6 object-cover border-4 border-gray-300 shadow-lg"
              />
            )}
            <h1 className="text-5xl font-bold text-gray-800 mb-4 font-serif">{personalInfo.fullName}</h1>
            <div className="flex flex-wrap justify-center gap-6 text-gray-600 font-sans">
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
      )}

      {/* Dynamic Content based on sectionOrder */}
      <div className="p-10">
        {sectionOrder && sectionOrder.map((sectionId) => {
          const renderFunction = sectionComponents[sectionId];
          return renderFunction ? renderFunction() : null;
        })}
      </div>
    </div>
  );
};

export default ElegantSerifTemplate;