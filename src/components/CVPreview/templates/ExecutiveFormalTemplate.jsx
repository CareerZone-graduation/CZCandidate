import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

const ExecutiveFormalTemplate = ({ cvData }) => {
  const { personalInfo, professionalSummary, workExperience, education, skills, projects, certificates, sectionOrder } = cvData;

  // Section rendering functions
  const renderSummary = () => {
    if (!professionalSummary) return null;
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b-2 border-gray-300 pb-3">
          EXECUTIVE SUMMARY
        </h2>
        <p className="text-gray-700 leading-loose text-lg text-center max-w-4xl mx-auto">{professionalSummary}</p>
      </section>
    );
  };

  const renderExperience = () => {
    if (!workExperience || workExperience.length === 0) return null;
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b-2 border-gray-300 pb-3">
          PROFESSIONAL EXPERIENCE
        </h2>
        <div className="space-y-10">
          {workExperience.map((job) => (
            <div key={job.id} className="bg-gray-50 rounded-lg p-8 border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{job.position}</h3>
                <p className="text-xl text-gray-600 mb-2">{job.company}</p>
                <p className="text-sm text-gray-500 uppercase tracking-wide">
                  {job.startDate} — {job.isCurrentJob ? 'Present' : job.endDate}
                </p>
              </div>
              <p className="text-gray-700 mb-6 leading-loose text-center">{job.description}</p>
              {job.achievements && job.achievements.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-4 text-center">Key Achievements</h4>
                  <ul className="text-gray-700 space-y-3 max-w-3xl mx-auto">
                    {job.achievements.map((achievement, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mt-3 mr-4 flex-shrink-0"></span>
                        <span className="leading-loose">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
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
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b-2 border-gray-300 pb-3">
          EDUCATION
        </h2>
        <div className="space-y-6 max-w-3xl mx-auto">
          {education.map((edu) => (
            <div key={edu.id} className="text-center bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{edu.degree}</h3>
              <p className="text-lg text-gray-600 mb-2">{edu.institution}</p>
              <p className="text-gray-600 mb-2">{edu.fieldOfStudy}</p>
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                {edu.startDate} — {edu.endDate}
              </p>
              {edu.gpa && <p className="text-sm text-gray-500 mt-2">GPA: {edu.gpa}</p>}
              {edu.honors && <p className="text-sm text-gray-600 mt-2 italic">{edu.honors}</p>}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSkills = () => {
    if (!skills || skills.length === 0) return null;
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b-2 border-gray-300 pb-3">
          CORE COMPETENCIES
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {['Technical', 'Soft Skills', 'Language'].map((category) => {
            const categorySkills = skills.filter(skill => skill.category === category);
            if (categorySkills.length === 0) return null;
            
            return (
              <div key={category} className="text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase tracking-wide">{category}</h3>
                <div className="space-y-3">
                  {categorySkills.map((skill) => (
                    <div key={skill.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="font-semibold text-gray-800">{skill.name}</div>
                      <div className="text-sm text-gray-600">{skill.level}</div>
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
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b-2 border-gray-300 pb-3">
          NOTABLE PROJECTS
        </h2>
        <div className="space-y-8 max-w-4xl mx-auto">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{project.name}</h3>
                <p className="text-sm text-gray-500 uppercase tracking-wide">
                  {project.startDate} — {project.endDate}
                </p>
              </div>
              <p className="text-gray-700 mb-4 leading-loose text-center">{project.description}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {project.technologies && project.technologies.map((tech, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-300">
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
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b-2 border-gray-300 pb-3">
          PROFESSIONAL CERTIFICATIONS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center">
              <h3 className="font-bold text-gray-800 text-lg mb-2">{cert.name}</h3>
              <p className="text-gray-600 mb-2">{cert.issuer}</p>
              <p className="text-sm text-gray-500 uppercase tracking-wide">{cert.issueDate}</p>
              {cert.credentialId && (
                <p className="text-xs text-gray-400 mt-2">Credential ID: {cert.credentialId}</p>
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
    <div className="a4-size w-full max-w-5xl mx-auto bg-white shadow-lg print:shadow-none print:max-w-none">
      {/* Formal Header */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-12 text-center border-b-4 border-gray-800">
        {personalInfo.profileImage && (
          <img
            src={personalInfo.profileImage}
            alt={personalInfo.fullName}
            className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-gray-300 shadow-lg"
          />
        )}
        <h1 className="text-5xl font-bold text-gray-800 mb-6 tracking-wide">{personalInfo.fullName}</h1>
        <div className="flex flex-wrap justify-center gap-8 text-gray-600 text-lg">
          {personalInfo.email && (
            <div className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              {personalInfo.email}
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              {personalInfo.phone}
            </div>
          )}
          {personalInfo.address && (
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              {personalInfo.address}
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              {personalInfo.website}
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center">
              <Linkedin className="w-5 h-5 mr-2" />
              LinkedIn
            </div>
          )}
          {personalInfo.github && (
            <div className="flex items-center">
              <Github className="w-5 h-5 mr-2" />
              GitHub
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Content based on sectionOrder */}
      <div className="p-12">
        {sectionOrder && sectionOrder.map((sectionId) => {
          const renderFunction = sectionComponents[sectionId];
          return renderFunction ? renderFunction() : null;
        })}
      </div>
    </div>
  );
};

export default ExecutiveFormalTemplate;