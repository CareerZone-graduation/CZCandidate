const TopCompanies = () => {
  const companies = [
    {
      id: 1,
      name: 'FPT Software',
      logo: '🏢',
      employees: '10,000+ nhân viên',
      jobs: '120 việc làm',
      industry: 'Công nghệ thông tin',
      rating: 4.8,
      featured: true
    },
    {
      id: 2,
      name: 'VinGroup',
      logo: '🏭',
      employees: '50,000+ nhân viên',
      jobs: '200 việc làm',
      industry: 'Tập đoàn đa ngành',
      rating: 4.7,
      featured: true
    },
    {
      id: 3,
      name: 'Shopee Vietnam',
      logo: '🛒',
      employees: '5,000+ nhân viên',
      jobs: '85 việc làm',
      industry: 'Thương mại điện tử',
      rating: 4.6,
      featured: false
    },
    {
      id: 4,
      name: 'Grab Vietnam',
      logo: '🚗',
      employees: '3,000+ nhân viên',
      jobs: '60 việc làm',
      industry: 'Công nghệ - Vận tải',
      rating: 4.5,
      featured: true
    },
    {
      id: 5,
      name: 'Viettel Group',
      logo: '📱',
      employees: '20,000+ nhân viên',
      jobs: '150 việc làm',
      industry: 'Viễn thông',
      rating: 4.4,
      featured: false
    },
    {
      id: 6,
      name: 'Techcombank',
      logo: '🏦',
      employees: '8,000+ nhân viên',
      jobs: '75 việc làm',
      industry: 'Ngân hàng',
      rating: 4.3,
      featured: true
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-4">
            Top công ty hàng đầu
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá và ứng tuyển vào các công ty uy tín, môi trường làm việc tốt nhất
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-xl p-6 hover:shadow-lg transition duration-300 cursor-pointer border-2 border-gray-200 relative hover:border-[#00C853]"
            >
              {company.featured && (
                <div className="absolute top-4 right-4">
                  <span className="bg-[#00C853] text-white text-xs px-2 py-1 rounded-full font-semibold">
                    Top
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <div className="text-5xl mb-3">{company.logo}</div>
                <h3 className="font-bold text-xl text-black mb-2">
                  {company.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{company.industry}</p>
                
                {/* Rating */}
                <div className="flex items-center justify-center mb-3">
                  <div className="flex text-[#00C853]">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(company.rating) ? 'fill-current' : 'text-gray-300'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">{company.rating}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-[#00C853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {company.employees}
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-[#00C853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                  {company.jobs}
                </div>
              </div>

              <button className="w-full bg-[#00C853] text-white py-2 rounded-lg hover:bg-[#28A745] transition duration-300 font-semibold shadow-lg">
                Xem công ty
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-white text-black px-8 py-3 rounded-lg hover:bg-gray-100 transition duration-300 font-semibold border-2 border-[#00C853]">
            Xem tất cả công ty
          </button>
        </div>
      </div>
    </section>
  )
}

export default TopCompanies
