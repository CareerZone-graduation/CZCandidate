import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Calendar, Award, Briefcase, GraduationCap, Code, User } from 'lucide-react';

const ProfessionalHexTemplate = ({ cvData, showHeader = true, measureMode = false, pageNumber = 1 }) => {
    const { personalInfo, professionalSummary, workExperience, education, skills, projects, certificates, sectionOrder } = cvData;

    // Hexagon Icon Component
    const HexIcon = ({ icon: Icon }) => (
        <div className="relative flex items-center justify-center w-10 h-10 mr-4 flex-shrink-0">
            <div className="absolute inset-0 bg-slate-800 rotate-45 rounded-lg"></div>
            <Icon className="relative w-5 h-5 text-white z-10" />
        </div>
    );

    // Section rendering functions
    const renderSummary = () => {
        if (!professionalSummary) return null;
        return (
            <section data-section="summary" className="mb-10 break-inside-avoid">
                <div className="flex items-center mb-6 border-b-2 border-slate-200 pb-2 break-after-avoid">
                    <HexIcon icon={User} />
                    <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-widest">
                        Profile
                    </h2>
                </div>
                <div className="pl-14">
                    <p className="text-slate-600 leading-loose text-justify">{professionalSummary}</p>
                </div>
            </section>
        );
    };

    const renderExperience = () => {
        if (!workExperience || workExperience.length === 0) return null;
        return (
            <section data-section="experience" className="mb-10">
                <div className="flex items-center mb-8 border-b-2 border-slate-200 pb-2 break-after-avoid">
                    <HexIcon icon={Briefcase} />
                    <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-widest">
                        Experience
                    </h2>
                </div>
                <div className="pl-4 border-l-2 border-slate-200 ml-5 space-y-10">
                    {workExperience.map((job) => (
                        <div key={job.id} className="relative pl-8 break-inside-avoid">
                            <div className="absolute w-4 h-4 bg-slate-800 rounded-sm rotate-45 -left-[9px] top-1.5 border-2 border-white"></div>
                            <div className="flex justify-between items-baseline mb-2">
                                <h3 className="text-xl font-bold text-slate-800">{job.position}</h3>
                                <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded">
                                    {job.startDate} - {job.isCurrentJob ? 'Present' : job.endDate}
                                </span>
                            </div>
                            <p className="text-lg font-semibold text-blue-600 mb-3">{job.company}</p>
                            <p className="text-slate-600 mb-4 leading-relaxed">{job.description}</p>
                            {job.achievements && job.achievements.length > 0 && (
                                <ul className="space-y-2">
                                    {job.achievements.map((achievement, index) => (
                                        <li key={index} className="flex items-start text-slate-600 text-sm">
                                            <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
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
                <div className="flex items-center mb-8 border-b-2 border-slate-200 pb-2 break-after-avoid">
                    <HexIcon icon={GraduationCap} />
                    <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-widest">
                        Education
                    </h2>
                </div>
                <div className="pl-14 grid grid-cols-1 gap-6">
                    {education.map((edu) => (
                        <div key={edu.id} className="bg-slate-50 p-6 rounded-lg border-l-4 border-blue-600 break-inside-avoid">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{edu.degree}</h3>
                                    <p className="text-blue-600 font-medium">{edu.institution}</p>
                                </div>
                                <span className="text-sm font-medium text-slate-500">
                                    {edu.startDate} - {edu.endDate}
                                </span>
                            </div>
                            <p className="text-slate-600 mt-1">{edu.fieldOfStudy}</p>
                            {edu.gpa && <p className="text-sm text-slate-500 mt-2">GPA: {edu.gpa}</p>}
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
                <div className="flex items-center mb-8 border-b-2 border-slate-200 pb-2 break-after-avoid">
                    <HexIcon icon={Code} />
                    <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-widest">
                        Skills
                    </h2>
                </div>
                <div className="pl-14 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {['Technical', 'Soft Skills', 'Language'].map((category) => {
                        const categorySkills = skills.filter(skill => skill.category === category);
                        if (categorySkills.length === 0) return null;

                        return (
                            <div key={category}>
                                <h3 className="font-bold text-slate-700 mb-4 uppercase text-sm tracking-wide">{category}</h3>
                                <div className="space-y-4">
                                    {categorySkills.map((skill) => (
                                        <div key={skill.id}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-slate-700">{skill.name}</span>
                                                <span className="text-blue-600 font-bold text-xs">{skill.level}</span>
                                            </div>
                                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-slate-800 h-full"
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
            <section data-section="projects" className="mb-10">
                <div className="flex items-center mb-8 border-b-2 border-slate-200 pb-2 break-after-avoid">
                    <HexIcon icon={Briefcase} />
                    <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-widest">
                        Projects
                    </h2>
                </div>
                <div className="pl-14 grid grid-cols-1 gap-6">
                    {projects.map((project) => (
                        <div key={project.id} className="break-inside-avoid border border-slate-200 p-5 rounded-lg hover:border-blue-400 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-slate-800">{project.name}</h3>
                                <span className="text-xs font-bold text-white bg-slate-800 px-2 py-1 rounded">
                                    {project.startDate} - {project.endDate}
                                </span>
                            </div>
                            <p className="text-slate-600 mb-4 text-sm leading-relaxed">{project.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {project.technologies && project.technologies.map((tech, index) => (
                                    <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold uppercase tracking-wide">
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
                <div className="flex items-center mb-8 border-b-2 border-slate-200 pb-2 break-after-avoid">
                    <HexIcon icon={Award} />
                    <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-widest">
                        Certifications
                    </h2>
                </div>
                <div className="pl-14 grid grid-cols-2 gap-4">
                    {certificates.map((cert) => (
                        <div key={cert.id} className="bg-slate-50 p-4 rounded border-l-4 border-slate-800 break-inside-avoid">
                            <h3 className="font-bold text-slate-800 text-sm">{cert.name}</h3>
                            <p className="text-blue-600 text-xs font-medium mt-1">{cert.issuer}</p>
                            <p className="text-slate-400 text-xs mt-2">{cert.issueDate}</p>
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
        <div className="w-full bg-white font-sans text-slate-800">
            {/* Header */}
            {showHeader && (
                <div className="bg-slate-900 text-white p-12" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)' }}>
                    <div className="flex items-center gap-8">
                        {personalInfo.profileImage && (
                            <div className="relative flex-shrink-0">
                                <div className="absolute inset-0 bg-blue-500 rotate-6 rounded-xl"></div>
                                <img
                                    src={personalInfo.profileImage}
                                    alt={personalInfo.fullName}
                                    className="relative w-32 h-32 rounded-lg object-cover border-4 border-white shadow-2xl"
                                />
                            </div>
                        )}
                        <div className="flex-1">
                            <h1 className="text-5xl font-black mb-2 tracking-tight uppercase">
                                {personalInfo.fullName}
                            </h1>
                            <div className="h-1 w-20 bg-blue-500 mb-6"></div>

                            <div className="grid grid-cols-2 gap-y-2 gap-x-8 text-sm font-medium text-slate-300">
                                {personalInfo.email && (
                                    <div className="flex items-center">
                                        <Mail className="w-4 h-4 mr-3 text-blue-400" />
                                        {personalInfo.email}
                                    </div>
                                )}
                                {personalInfo.phone && (
                                    <div className="flex items-center">
                                        <Phone className="w-4 h-4 mr-3 text-blue-400" />
                                        {personalInfo.phone}
                                    </div>
                                )}
                                {personalInfo.address && (
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-3 text-blue-400" />
                                        {personalInfo.address}
                                    </div>
                                )}
                                {personalInfo.website && (
                                    <div className="flex items-center">
                                        <Globe className="w-4 h-4 mr-3 text-blue-400" />
                                        <a href={personalInfo.website} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                            {personalInfo.website}
                                        </a>
                                    </div>
                                )}
                                {personalInfo.linkedin && (
                                    <div className="flex items-center">
                                        <Linkedin className="w-4 h-4 mr-3 text-blue-400" />
                                        <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                            LinkedIn
                                        </a>
                                    </div>
                                )}
                                {personalInfo.github && (
                                    <div className="flex items-center">
                                        <Github className="w-4 h-4 mr-3 text-blue-400" />
                                        <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
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
            <div className="p-12">
                {sectionOrder && sectionOrder.map((sectionId) => {
                    const renderFunction = sectionComponents[sectionId];
                    return renderFunction ? renderFunction() : null;
                })}
            </div>
        </div>
    );
};

export default ProfessionalHexTemplate;
