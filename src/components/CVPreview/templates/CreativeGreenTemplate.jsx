import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Calendar, Award } from 'lucide-react';

const CreativeGreenTemplate = ({ cvData, showHeader = true, measureMode = false, pageNumber = 1 }) => {
    const { personalInfo, professionalSummary, workExperience, education, skills, projects, certificates, sectionOrder } = cvData;

    // Section rendering functions
    const renderSummary = () => {
        if (!professionalSummary) return null;
        return (
            <section data-section="summary" className="mb-8 break-inside-avoid">
                <div className="flex items-center mb-4">
                    <div className="w-2 h-8 bg-emerald-500 mr-3 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
                        Profile
                    </h2>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">{professionalSummary}</p>
            </section>
        );
    };

    const renderExperience = () => {
        if (!workExperience || workExperience.length === 0) return null;
        return (
            <section data-section="experience" className="mb-8">
                <div className="flex items-center mb-6 break-after-avoid">
                    <div className="w-2 h-8 bg-emerald-500 mr-3 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
                        Experience
                    </h2>
                </div>
                <div className="space-y-8">
                    {workExperience.map((job) => (
                        <div key={job.id} className="relative pl-8 border-l-2 border-emerald-200 break-inside-avoid">
                            <div className="absolute w-4 h-4 bg-emerald-500 rounded-full -left-[9px] top-0 border-4 border-white shadow-sm"></div>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{job.position}</h3>
                                    <p className="text-emerald-600 font-semibold text-lg">{job.company}</p>
                                </div>
                                <div className="text-sm text-emerald-700 font-medium bg-emerald-50 px-3 py-1 rounded-full">
                                    {job.startDate} - {job.isCurrentJob ? 'Present' : job.endDate}
                                </div>
                            </div>
                            <p className="text-gray-700 mb-4 leading-relaxed">{job.description}</p>
                            {job.achievements && job.achievements.length > 0 && (
                                <ul className="space-y-2">
                                    {job.achievements.map((achievement, index) => (
                                        <li key={index} className="flex items-start text-gray-700">
                                            <span className="text-emerald-500 mr-2 mt-1.5">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                            </span>
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
            <section data-section="education" className="mb-8">
                <div className="flex items-center mb-6 break-after-avoid">
                    <div className="w-2 h-8 bg-emerald-500 mr-3 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
                        Education
                    </h2>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    {education.map((edu) => (
                        <div key={edu.id} className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100 break-inside-avoid">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{edu.degree}</h3>
                                    <p className="text-emerald-700 font-medium">{edu.institution}</p>
                                    <p className="text-gray-600">{edu.fieldOfStudy}</p>
                                </div>
                                <div className="text-sm text-gray-500 font-medium">
                                    {edu.startDate} - {edu.endDate}
                                </div>
                            </div>
                            {edu.gpa && <p className="text-sm text-gray-600 mt-2">GPA: <span className="font-semibold text-emerald-600">{edu.gpa}</span></p>}
                            {edu.honors && <p className="text-sm text-emerald-600 font-medium mt-1">{edu.honors}</p>}
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
                <div className="flex items-center mb-6 break-after-avoid">
                    <div className="w-2 h-8 bg-emerald-500 mr-3 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
                        Skills
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['Technical', 'Soft Skills', 'Language'].map((category) => {
                        const categorySkills = skills.filter(skill => skill.category === category);
                        if (categorySkills.length === 0) return null;

                        return (
                            <div key={category} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">{category}</h3>
                                <div className="space-y-3">
                                    {categorySkills.map((skill) => (
                                        <div key={skill.id}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-gray-700">{skill.name}</span>
                                                <span className="text-emerald-600 font-medium">{skill.level}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div
                                                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
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
                <div className="flex items-center mb-6 break-after-avoid">
                    <div className="w-2 h-8 bg-emerald-500 mr-3 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
                        Projects
                    </h2>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    {projects.map((project) => (
                        <div key={project.id} className="break-inside-avoid">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-gray-800">{project.name}</h3>
                                <div className="text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full">
                                    {project.startDate} - {project.endDate}
                                </div>
                            </div>
                            <p className="text-gray-700 mb-3 leading-relaxed">{project.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {project.technologies && project.technologies.map((tech, index) => (
                                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
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
                <div className="flex items-center mb-6 break-after-avoid">
                    <div className="w-2 h-8 bg-emerald-500 mr-3 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
                        Certifications
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certificates.map((cert) => (
                        <div key={cert.id} className="flex items-start p-4 bg-emerald-50 rounded-lg border border-emerald-100 break-inside-avoid">
                            <Award className="w-8 h-8 text-emerald-500 mr-3 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-gray-800">{cert.name}</h3>
                                <p className="text-emerald-700 font-medium">{cert.issuer}</p>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                    <Calendar className="w-3 h-3 mr-1" />
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
        <div className="w-full bg-white font-sans">
            {/* Header */}
            {showHeader && (
                <div className="relative bg-gray-900 text-white p-10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10 flex items-center gap-8">
                        {personalInfo.profileImage && (
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500 rounded-full blur-md opacity-50"></div>
                                <img
                                    src={personalInfo.profileImage}
                                    alt={personalInfo.fullName}
                                    className="relative w-32 h-32 rounded-full border-4 border-gray-800 object-cover shadow-xl"
                                />
                            </div>
                        )}
                        <div className="flex-1">
                            <h1 className="text-5xl font-black mb-4 tracking-tight">
                                {personalInfo.fullName}
                            </h1>
                            <div className="flex flex-wrap gap-y-2 gap-x-6 text-gray-300 text-sm font-medium">
                                {personalInfo.email && (
                                    <div className="flex items-center hover:text-emerald-400 transition-colors">
                                        <Mail className="w-4 h-4 mr-2" />
                                        {personalInfo.email}
                                    </div>
                                )}
                                {personalInfo.phone && (
                                    <div className="flex items-center hover:text-emerald-400 transition-colors">
                                        <Phone className="w-4 h-4 mr-2" />
                                        {personalInfo.phone}
                                    </div>
                                )}
                                {personalInfo.address && (
                                    <div className="flex items-center hover:text-emerald-400 transition-colors">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        {personalInfo.address}
                                    </div>
                                )}
                                {personalInfo.website && (
                                    <div className="flex items-center hover:text-emerald-400 transition-colors">
                                        <Globe className="w-4 h-4 mr-2" />
                                        <a href={personalInfo.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            {personalInfo.website}
                                        </a>
                                    </div>
                                )}
                                {personalInfo.linkedin && (
                                    <div className="flex items-center hover:text-emerald-400 transition-colors">
                                        <Linkedin className="w-4 h-4 mr-2" />
                                        <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            LinkedIn
                                        </a>
                                    </div>
                                )}
                                {personalInfo.github && (
                                    <div className="flex items-center hover:text-emerald-400 transition-colors">
                                        <Github className="w-4 h-4 mr-2" />
                                        <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            GitHub
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Dynamic Content */}
            <div className="p-10">
                {sectionOrder && sectionOrder.map((sectionId) => {
                    const renderFunction = sectionComponents[sectionId];
                    return renderFunction ? renderFunction() : null;
                })}
            </div>
        </div>
    );
};

export default CreativeGreenTemplate;
