import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Calendar } from 'lucide-react';

const CreativeSplitTemplate = ({ cvData }) => {
  const { personalInfo, professionalSummary, workExperience, education, skills, projects, certificates, sectionOrder } = cvData;

  // Left side sections (colored background)
  const renderLeftSideSkills = () => {
    if (!skills || skills.length === 0) return null;
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Skills</h2>
        <div className="space-y-6">
          {['Technical', 'Soft Skills', 'Language'].map((category) => {
            const categorySkills = skills.filter(skill => skill.category === category);
            if (categorySkills.length === 0) return null;
            
            return (
              <div key={category}>
                <h3 className="text-sm font-semibold text-pink-200 mb-3 uppercase tracking-wide">{category}</h3>
                <div className="space-y-2">
                  {categorySkills.map((skill) => (
                    <div key={skill.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white">{skill.name}</span>
                        <span className="text-pink-200">{skill.level}</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-pink-300 to-yellow-300 h-2 rounded-full"
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

  const renderLeftSideEducation = () => {
    if (!education || education.length === 0) return null;
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Education</h2>
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id} className="bg-white/10 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white">{edu.degree}</h3>
              <p className="text-pink-200">{edu.institution}</p>
              <p className="text-sm text-pink-100">{edu.startDate} - {edu.endDate}</p>
              {edu.gpa && <p className="text-sm text-pink-100">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLeftSideCertificates = () => {
    if (!certificates || certificates.length === 0) return null;
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Certifications</h2>
        <div className="space-y-3">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white/10 rounded-lg p-3">
              <h3 className="font-bold text-white text-sm">{cert.name}</h3>
              <p className="text-pink-200 text-sm">{cert.issuer}</p>
              <p className="text-xs text-pink-100">{cert.issueDate}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Right side sections (white background)
  const renderSummary = () => {
    if (!professionalSummary) return null;
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">About Me</h2>
        <p className="text-gray-700 leading-relaxed text-lg">{professionalSummary}</p>
      </section>
    );
  };

  const renderExperience = () => {
    if (!workExperience || workExperience.length === 0) return null;
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Experience</h2>
        <div className="space-y-6">
          {workExperience.map((job) => (
            <div key={job.id} className="border-l-4 border-pink-500 pl-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{job.position}</h3>
                  <p className="text-pink-600 font-semibold">{job.company}</p>
                </div>
                <div className="text-sm text-gray-500 flex items-center bg-pink-100 px-3 py-1 rounded-full">
                  <Calendar className="w-4 h-4 mr-1" />
                  {job.startDate} - {job.isCurrentJob ? 'Present' : job.endDate}
                </div>
              </div>
              <p className="text-gray-700 mb-3">{job.description}</p>
              {job.achievements && job.achievements.length > 0 && (
                <ul className="text-gray-700 space-y-1">
                  {job.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
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

  const renderProjects = () => {
    if (!projects || projects.length === 0) return null;
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Projects</h2>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-gradient-to-r from-pink-50 to-yellow-50 rounded-lg p-4 border border-pink-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                <div className="text-sm text-gray-500">
                  {project.startDate} - {project.endDate}
                </div>
              </div>
              <p className="text-gray-700 mb-3">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.technologies && project.technologies.map((tech, index) => (
                  <span key={index} className="px-3 py-1 bg-gradient-to-r from-pink-500 to-yellow-500 text-white rounded-full text-sm font-medium">
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

  // Section mapping for right side
  const rightSectionComponents = {
    summary: renderSummary,
    experience: renderExperience,
    projects: renderProjects
  };

  return (
    <div className="a4-size w-full max-w-6xl mx-auto bg-white shadow-lg print:shadow-none print:max-w-none flex">
      {/* Left Side - Colored Background */}
      <div className="w-2/5 bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 p-8 text-white">
        {/* Profile Section */}
        <div className="text-center mb-8">
          {personalInfo.profileImage && (
            <img
              src={personalInfo.profileImage}
              alt={personalInfo.fullName}
              className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white/30 object-cover shadow-lg"
            />
          )}
          <h1 className="text-3xl font-bold mb-2">{personalInfo.fullName}</h1>
        </div>

        {/* Contact Info */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Contact</h2>
          <div className="space-y-3 text-sm">
            {personalInfo.email && (
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="break-all">{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.address && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-3 flex-shrink-0" />
                <span>{personalInfo.address}</span>
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="break-all">{personalInfo.website}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center">
                <Linkedin className="w-4 h-4 mr-3 flex-shrink-0" />
                <span>LinkedIn</span>
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-center">
                <Github className="w-4 h-4 mr-3 flex-shrink-0" />
                <span>GitHub</span>
              </div>
            )}
          </div>
        </div>

        {/* Left Side Content */}
        {renderLeftSideSkills()}
        {renderLeftSideEducation()}
        {renderLeftSideCertificates()}
      </div>

      {/* Right Side - White Background */}
      <div className="w-3/5 p-8">
        {sectionOrder && sectionOrder.map((sectionId) => {
          const renderFunction = rightSectionComponents[sectionId];
          return renderFunction ? renderFunction() : null;
        })}
      </div>
    </div>
  );
};

export default CreativeSplitTemplate;