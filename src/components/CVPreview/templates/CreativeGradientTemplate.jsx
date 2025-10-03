import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Calendar } from 'lucide-react';

const CreativeGradientTemplate = ({ cvData }) => {
  const { personalInfo, professionalSummary, workExperience, education, skills, projects, certificates, sectionOrder } = cvData;

  // Section rendering functions
  const renderSummary = () => {
    if (!professionalSummary) return null;
    return (
      <section className="mb-8">
        <div className="relative">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">
            Professional Summary
          </h2>
          <div className="absolute left-0 top-8 w-12 h-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded"></div>
        </div>
        <p className="text-gray-700 leading-relaxed mt-6 text-lg">{professionalSummary}</p>
      </section>
    );
  };

  const renderExperience = () => {
    if (!workExperience || workExperience.length === 0) return null;
    return (
      <section className="mb-8">
        <div className="relative">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">
            Work Experience
          </h2>
          <div className="absolute left-0 top-8 w-12 h-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded"></div>
        </div>
        <div className="space-y-8 mt-6">
          {workExperience.map((job, index) => (
            <div key={job.id} className="relative">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-l-4 border-gradient-to-b from-purple-500 to-pink-500">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{job.position}</h3>
                    <p className="text-purple-600 font-semibold text-lg">{job.company}</p>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center bg-white px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4 mr-1" />
                    {job.startDate} - {job.isCurrentJob ? 'Present' : job.endDate}
                  </div>
                </div>
                <p className="text-gray-700 mb-4 text-lg">{job.description}</p>
                {job.achievements && job.achievements.length > 0 && (
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {job.achievements.map((achievement, index) => (
                      <li key={index} className="leading-relaxed">{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderEducation = () => {
    if (!education || education.length === 0) return null;
    return (
      <section className="mb-8">
        <div className="relative">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">
            Education
          </h2>
          <div className="absolute left-0 top-8 w-12 h-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded"></div>
        </div>
        <div className="space-y-4 mt-6">
          {education.map((edu) => (
            <div key={edu.id} className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border-l-4 border-orange-400">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{edu.degree}</h3>
                  <p className="text-orange-600 font-semibold">{edu.institution}</p>
                  <p className="text-gray-600">{edu.fieldOfStudy}</p>
                  {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
                  {edu.honors && <p className="text-sm text-gray-500">{edu.honors}</p>}
                </div>
                <div className="text-sm text-gray-500 flex items-center bg-white px-2 py-1 rounded">
                  <Calendar className="w-4 h-4 mr-1" />
                  {edu.startDate} - {edu.endDate}
                </div>
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
      <section className="mb-8">
        <div className="relative">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">
            Skills
          </h2>
          <div className="absolute left-0 top-8 w-12 h-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {['Technical', 'Soft Skills', 'Language'].map((category) => {
            const categorySkills = skills.filter(skill => skill.category === category);
            if (categorySkills.length === 0) return null;
            
            return (
              <div key={category} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-800 mb-3 text-lg">{category}</h3>
                <div className="space-y-3">
                  {categorySkills.map((skill) => (
                    <div key={skill.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-purple-600 font-semibold">{skill.level}</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
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
      <section className="mb-8">
        <div className="relative">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">
            Projects
          </h2>
          <div className="absolute left-0 top-8 w-12 h-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded"></div>
        </div>
        <div className="space-y-4 mt-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-blue-400">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                <div className="text-sm text-gray-500 flex items-center bg-white px-2 py-1 rounded">
                  <Calendar className="w-4 h-4 mr-1" />
                  {project.startDate} - {project.endDate}
                </div>
              </div>
              <p className="text-gray-700 mb-3">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.technologies && project.technologies.map((tech, index) => (
                  <span key={index} className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-medium">
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
      <section className="mb-8">
        <div className="relative">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">
            Certifications
          </h2>
          <div className="absolute left-0 top-8 w-12 h-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded"></div>
        </div>
        <div className="space-y-3 mt-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border-l-4 border-green-400">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{cert.name}</h3>
                  <p className="text-green-600 font-semibold">{cert.issuer}</p>
                  {cert.credentialId && (
                    <p className="text-sm text-gray-500">ID: {cert.credentialId}</p>
                  )}
                </div>
                <div className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                  {cert.issueDate}
                  {cert.expiryDate && ` - ${cert.expiryDate}`}
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
    <div className="a4-size w-full max-w-4xl mx-auto bg-white shadow-lg print:shadow-none print:max-w-none overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white p-8 relative">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-6">
            {personalInfo.profileImage && (
              <img
                src={personalInfo.profileImage}
                alt={personalInfo.fullName}
                className="w-28 h-28 rounded-full border-4 border-white/50 object-cover shadow-lg"
              />
            )}
            <div className="flex-1">
              <h1 className="text-5xl font-bold mb-3 drop-shadow-lg">{personalInfo.fullName}</h1>
              <div className="grid grid-cols-2 gap-3 text-sm opacity-95">
                {personalInfo.email && (
                  <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                    <Mail className="w-4 h-4 mr-2" />
                    {personalInfo.email}
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                    <Phone className="w-4 h-4 mr-2" />
                    {personalInfo.phone}
                  </div>
                )}
                {personalInfo.address && (
                  <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                    <MapPin className="w-4 h-4 mr-2" />
                    {personalInfo.address}
                  </div>
                )}
                {personalInfo.website && (
                  <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                    <Globe className="w-4 h-4 mr-2" />
                    {personalInfo.website}
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </div>
                )}
                {personalInfo.github && (
                  <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default CreativeGradientTemplate;