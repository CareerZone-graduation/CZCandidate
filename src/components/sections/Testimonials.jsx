const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Nguyễn Văn An',
      position: 'Frontend Developer tại TechCorp',
      content: 'CareerZone đã giúp tôi tìm được công việc mơ ước. Giao diện thân thiện, thông tin việc làm chi tiết và quy trình ứng tuyển rất thuận tiện.',
      avatar: '👨‍💻',
      rating: 5
    },
    {
      id: 2,
      name: 'Trần Thị Mai',
      position: 'Marketing Manager tại StartupXYZ',
      content: 'Tôi rất ấn tượng với chất lượng các cơ hội việc làm trên CareerZone. Đặc biệt là các công ty đều rất uy tín và môi trường làm việc chuyên nghiệp.',
      avatar: '👩‍💼',
      rating: 5
    },
    {
      id: 3,
      name: 'Lê Minh Tuấn',
      position: 'UI/UX Designer tại Creative Agency',
      content: 'Platform tuyệt vời cho người tìm việc! Tôi đã nhận được nhiều lời mời phỏng vấn chỉ trong vòng 2 tuần sau khi đăng ký.',
      avatar: '🎨',
      rating: 5
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-4">
            Câu chuyện thành công
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nghe chia sẻ từ những ứng viên đã thành công tìm được việc làm qua CareerZone
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-xl p-6 hover:shadow-lg transition duration-300 border-2 border-gray-200 hover:border-[#00C853]"
            >
              {/* Stars */}
              <div className="flex text-[#00C853] mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <div className="text-3xl mr-4">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-semibold text-black">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {testimonial.position}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <div className="bg-black rounded-2xl p-8 max-w-4xl mx-auto border-2 border-[#00C853]">
            <h3 className="text-2xl font-bold text-white mb-4">
              Bạn cũng muốn có câu chuyện thành công như vậy?
            </h3>
            <p className="text-gray-300 mb-6">
              Hãy tham gia CareerZone ngay hôm nay và khám phá hàng ngàn cơ hội việc làm tuyệt vời!
            </p>
            <button className="bg-[#00C853] text-white px-8 py-3 rounded-lg hover:bg-[#28A745] transition duration-300 font-semibold shadow-lg">
              Đăng ký ngay
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
