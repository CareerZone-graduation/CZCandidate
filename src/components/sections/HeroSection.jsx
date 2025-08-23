import { useState } from 'react'

const HeroSection = () => {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [location, setLocation] = useState('')

  return (
    <section className="bg-black py-20 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Tìm việc làm phù hợp với
              <span className="text-[#0B8043]"> kỹ năng & sở thích</span> của bạn
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Khám phá hàng ngàn cơ hội việc làm từ các công ty hàng đầu. 
              Bắt đầu hành trình sự nghiệp của bạn ngay hôm nay.
            </p>

            {/* Search Box */}
            <div className="bg-white rounded-lg shadow-xl p-2 flex flex-col md:flex-row gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm việc làm, công ty..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-2 focus:ring-[#0B8043] rounded bg-white text-black placeholder-gray-500"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Địa điểm"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-2 focus:ring-[#0B8043] rounded bg-white text-black placeholder-gray-500"
                />
              </div>
              <button className="bg-[#0B8043] text-white px-8 py-3 rounded-lg hover:bg-[#0F6B3D] transition duration-300 font-semibold shadow-lg">
                Tìm kiếm
              </button>
            </div>

            {/* Popular Keywords */}
            <div className="mt-6">
              <p className="text-gray-300 mb-3">Từ khóa phổ biến:</p>
              <div className="flex flex-wrap gap-2">
                {['ReactJS', 'NodeJS', 'Python', 'Java', 'Marketing', 'Designer'].map((keyword) => (
                  <span
                    key={keyword}
                    className="bg-white text-black px-3 py-1 rounded-full text-sm hover:bg-[#0B8043] hover:text-white cursor-pointer transition duration-300"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Illustration */}
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 transform rotate-3 hover:rotate-0 transition duration-500">
              <div className="bg-[#0B8043] rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">10,000+ Việc làm</h3>
              <p className="text-gray-600">Cơ hội nghề nghiệp đa dạng</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
