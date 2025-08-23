const PopularCategories = () => {
  const categories = [
    {
      name: 'Công nghệ thông tin',
      jobs: '2,500+ việc làm',
      icon: '💻',
      color: 'bg-white text-[#1976D2] border-[#1976D2]'
    },
    {
      name: 'Marketing & PR',
      jobs: '1,200+ việc làm',
      icon: '📱',
      color: 'bg-white text-[#1976D2] border-[#1976D2]'
    },
    {
      name: 'Thiết kế',
      jobs: '800+ việc làm',
      icon: '🎨',
      color: 'bg-white text-[#1976D2] border-[#1976D2]'
    },
    {
      name: 'Tài chính & Kế toán',
      jobs: '950+ việc làm',
      icon: '💰',
      color: 'bg-white text-[#1976D2] border-[#1976D2]'
    },
    {
      name: 'Nhân sự',
      jobs: '650+ việc làm',
      icon: '👥',
      color: 'bg-white text-[#1976D2] border-[#1976D2]'
    },
    {
      name: 'Bán hàng',
      jobs: '1,100+ việc làm',
      icon: '📊',
      color: 'bg-white text-[#1976D2] border-[#1976D2]'
    },
    {
      name: 'Giáo dục',
      jobs: '450+ việc làm',
      icon: '📚',
      color: 'bg-white text-[#1976D2] border-[#1976D2]'
    },
    {
      name: 'Y tế',
      jobs: '720+ việc làm',
      icon: '🏥',
      color: 'bg-white text-[#1976D2] border-[#1976D2]'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-4">
            Danh mục phổ biến
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá các lĩnh vực việc làm hot nhất hiện nay
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`${category.color} border-2 rounded-xl p-6 text-center hover:shadow-lg transition duration-300 cursor-pointer transform hover:-translate-y-1 hover:bg-[#1976D2] hover:text-white`}
            >
              <div className="text-4xl mb-4">{category.icon}</div>
              <h3 className="font-semibold mb-2">
                {category.name}
              </h3>
              <p className="text-sm opacity-75">
                {category.jobs}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-[#00C853] text-white px-8 py-3 rounded-lg hover:bg-[#28A745] transition duration-300 font-semibold shadow-lg">
            Xem tất cả danh mục
          </button>
        </div>
      </div>
    </section>
  )
}

export default PopularCategories
