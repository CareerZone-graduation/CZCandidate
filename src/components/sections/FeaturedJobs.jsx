const FeaturedJobs = () => {
  const jobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp Vietnam',
      location: 'Hà Nội',
      salary: '25-35 triệu',
      type: 'Full-time',
      logo: '🏢',
      tags: ['ReactJS', 'TypeScript', 'Next.js'],
      featured: true
    },
    {
      id: 2,
      title: 'Marketing Manager',
      company: 'Digital Agency',
      location: 'TP.HCM',
      salary: '20-30 triệu',
      type: 'Full-time',
      logo: '🚀',
      tags: ['Digital Marketing', 'SEO', 'Social Media'],
      featured: true
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      company: 'Creative Studio',
      location: 'Đà Nẵng',
      salary: '15-25 triệu',
      type: 'Full-time',
      logo: '🎨',
      tags: ['Figma', 'Adobe XD', 'Sketch'],
      featured: false
    },
    {
      id: 4,
      title: 'Backend Developer',
      company: 'StartupXYZ',
      location: 'Remote',
      salary: '22-32 triệu',
      type: 'Remote',
      logo: '💻',
      tags: ['Node.js', 'MongoDB', 'AWS'],
      featured: true
    },
    {
      id: 5,
      title: 'Data Analyst',
      company: 'BigData Corp',
      location: 'Hà Nội',
      salary: '18-28 triệu',
      type: 'Full-time',
      logo: '📊',
      tags: ['Python', 'SQL', 'Power BI'],
      featured: false
    },
    {
      id: 6,
      title: 'Product Manager',
      company: 'InnovateTech',
      location: 'TP.HCM',
      salary: '30-45 triệu',
      type: 'Full-time',
      logo: '🏆',
      tags: ['Product Strategy', 'Agile', 'Analytics'],
      featured: true
    }
  ]

  return (
    <section className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Việc làm nổi bật
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Những cơ hội việc làm tốt nhất từ các công ty hàng đầu
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition duration-300 cursor-pointer relative hover:border-[#00C853]"
            >
              {job.featured && (
                <div className="absolute top-4 right-4">
                  <span className="bg-[#00C853] text-white text-xs px-2 py-1 rounded-full font-semibold">
                    Nổi bật
                  </span>
                </div>
              )}

              <div className="flex items-start mb-4">
                <div className="text-3xl mr-4">{job.logo}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-black mb-1 hover:text-[#00C853] transition duration-300">
                    {job.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{job.company}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-[#00C853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location}
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-[#00C853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  {job.salary}
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-[#00C853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {job.type}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {job.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs border border-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button className="w-full bg-[#00C853] text-white py-2 rounded-lg hover:bg-[#28A745] transition duration-300 font-semibold shadow-lg">
                Ứng tuyển ngay
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-white text-black px-8 py-3 rounded-lg hover:bg-gray-100 transition duration-300 font-semibold border-2 border-[#00C853]">
            Xem thêm việc làm
          </button>
        </div>
      </div>
    </section>
  )
}

export default FeaturedJobs
