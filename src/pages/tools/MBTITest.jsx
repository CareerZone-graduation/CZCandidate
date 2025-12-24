import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
  Target,
  Brain,
  Users,
  Heart,
  Lightbulb,
  Shield,
  Compass,
  Star,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  CheckCircle,
  Briefcase,
  Sparkles,
  BookOpen,
  Award
} from 'lucide-react';
import { cn } from '../../lib/utils';

// 16 nhóm tính cách MBTI
const MBTI_TYPES = {
  INTJ: {
    name: 'Nhà chiến lược',
    title: 'INTJ - The Architect',
    description: 'Người có tư duy chiến lược, độc lập và quyết đoán. Luôn có kế hoạch dài hạn và theo đuổi mục tiêu một cách kiên định.',
    strengths: ['Tư duy logic', 'Độc lập', 'Quyết đoán', 'Có tầm nhìn xa'],
    weaknesses: ['Khó gần', 'Cầu toàn', 'Thiếu kiên nhẫn với người khác'],
    careers: ['Nhà khoa học', 'Kỹ sư', 'Quản lý dự án', 'Luật sư', 'Nhà phân tích'],
    color: 'bg-purple-500',
    percentage: '2%'
  },
  INTP: {
    name: 'Nhà logic học',
    title: 'INTP - The Logician',
    description: 'Người sáng tạo với khả năng phân tích xuất sắc. Thích khám phá ý tưởng mới và giải quyết vấn đề phức tạp.',
    strengths: ['Sáng tạo', 'Phân tích tốt', 'Khách quan', 'Tò mò'],
    weaknesses: ['Hay trì hoãn', 'Thiếu quyết đoán', 'Khó diễn đạt cảm xúc'],
    careers: ['Lập trình viên', 'Nhà nghiên cứu', 'Kiến trúc sư', 'Nhà toán học'],
    color: 'bg-indigo-500',
    percentage: '3%'
  },
  ENTJ: {
    name: 'Nhà chỉ huy',
    title: 'ENTJ - The Commander',
    description: 'Người lãnh đạo bẩm sinh với khả năng tổ chức và điều hành xuất sắc. Quyết đoán và có tầm nhìn chiến lược.',
    strengths: ['Lãnh đạo tốt', 'Quyết đoán', 'Tự tin', 'Hiệu quả'],
    weaknesses: ['Thiếu kiên nhẫn', 'Hay áp đặt', 'Khó chấp nhận thất bại'],
    careers: ['CEO', 'Quản lý', 'Doanh nhân', 'Luật sư', 'Tư vấn'],
    color: 'bg-red-500',
    percentage: '3%'
  },
  ENTP: {
    name: 'Người tranh luận',
    title: 'ENTP - The Debater',
    description: 'Người thông minh, sáng tạo và thích thử thách. Giỏi tranh luận và tìm ra giải pháp mới.',
    strengths: ['Sáng tạo', 'Nhanh nhạy', 'Tự tin', 'Linh hoạt'],
    weaknesses: ['Hay tranh cãi', 'Thiếu kiên nhẫn', 'Khó tập trung'],
    careers: ['Doanh nhân', 'Luật sư', 'Nhà báo', 'Marketing', 'Tư vấn'],
    color: 'bg-orange-500',
    percentage: '3%'
  },

  INFJ: {
    name: 'Người che chở',
    title: 'INFJ - The Advocate',
    description: 'Người lý tưởng với trực giác mạnh mẽ. Quan tâm đến người khác và muốn tạo ra sự thay đổi tích cực.',
    strengths: ['Trực giác tốt', 'Sáng tạo', 'Tận tâm', 'Có nguyên tắc'],
    weaknesses: ['Quá nhạy cảm', 'Cầu toàn', 'Hay lo lắng'],
    careers: ['Nhà tâm lý', 'Nhà văn', 'Giáo viên', 'Tư vấn', 'HR'],
    color: 'bg-teal-500',
    percentage: '1.5%'
  },
  INFP: {
    name: 'Người hòa giải',
    title: 'INFP - The Mediator',
    description: 'Người lý tưởng, sáng tạo với giá trị cá nhân mạnh mẽ. Luôn tìm kiếm ý nghĩa và mục đích trong cuộc sống.',
    strengths: ['Sáng tạo', 'Đồng cảm', 'Trung thành', 'Lý tưởng'],
    weaknesses: ['Quá lý tưởng', 'Hay tự phê bình', 'Khó thực tế'],
    careers: ['Nhà văn', 'Nghệ sĩ', 'Nhà tâm lý', 'Giáo viên', 'Thiết kế'],
    color: 'bg-pink-500',
    percentage: '4%'
  },
  ENFJ: {
    name: 'Người cho đi',
    title: 'ENFJ - The Protagonist',
    description: 'Người lãnh đạo có sức hút với khả năng truyền cảm hứng. Quan tâm đến sự phát triển của người khác.',
    strengths: ['Lãnh đạo tốt', 'Đồng cảm', 'Truyền cảm hứng', 'Đáng tin cậy'],
    weaknesses: ['Quá lý tưởng', 'Hay lo lắng', 'Khó từ chối'],
    careers: ['Giáo viên', 'HR', 'Tư vấn', 'Marketing', 'Quản lý'],
    color: 'bg-emerald-500',
    percentage: '2.5%'
  },
  ENFP: {
    name: 'Người truyền cảm hứng',
    title: 'ENFP - The Campaigner',
    description: 'Người nhiệt tình, sáng tạo và lạc quan. Thích khám phá ý tưởng mới và kết nối với mọi người.',
    strengths: ['Sáng tạo', 'Nhiệt tình', 'Giao tiếp tốt', 'Linh hoạt'],
    weaknesses: ['Thiếu tập trung', 'Quá lý tưởng', 'Hay lo lắng'],
    careers: ['Marketing', 'Nhà báo', 'Diễn viên', 'Tư vấn', 'Giáo viên'],
    color: 'bg-yellow-500',
    percentage: '7%'
  },
  ISTJ: {
    name: 'Người trách nhiệm',
    title: 'ISTJ - The Logistician',
    description: 'Người đáng tin cậy, có trách nhiệm và làm việc chăm chỉ. Tuân thủ quy tắc và hoàn thành nhiệm vụ.',
    strengths: ['Đáng tin cậy', 'Có trách nhiệm', 'Kiên nhẫn', 'Thực tế'],
    weaknesses: ['Cứng nhắc', 'Khó thay đổi', 'Thiếu linh hoạt'],
    careers: ['Kế toán', 'Quản lý', 'Luật sư', 'Kỹ sư', 'Quân đội'],
    color: 'bg-blue-600',
    percentage: '12%'
  },
  ISFJ: {
    name: 'Người bảo vệ',
    title: 'ISFJ - The Defender',
    description: 'Người tận tâm, ấm áp và có trách nhiệm. Luôn sẵn sàng giúp đỡ và bảo vệ người thân yêu.',
    strengths: ['Tận tâm', 'Đáng tin cậy', 'Kiên nhẫn', 'Quan sát tốt'],
    weaknesses: ['Quá khiêm tốn', 'Khó từ chối', 'Hay lo lắng'],
    careers: ['Y tá', 'Giáo viên', 'HR', 'Hành chính', 'Dịch vụ khách hàng'],
    color: 'bg-cyan-500',
    percentage: '13%'
  },
  ESTJ: {
    name: 'Người giám sát',
    title: 'ESTJ - The Executive',
    description: 'Người tổ chức giỏi, quyết đoán và có trách nhiệm. Thích duy trì trật tự và hoàn thành công việc.',
    strengths: ['Tổ chức tốt', 'Quyết đoán', 'Đáng tin cậy', 'Thực tế'],
    weaknesses: ['Cứng nhắc', 'Hay phán xét', 'Thiếu linh hoạt'],
    careers: ['Quản lý', 'Luật sư', 'Quân đội', 'Tài chính', 'Kinh doanh'],
    color: 'bg-slate-600',
    percentage: '9%'
  },
  ESFJ: {
    name: 'Người quan tâm',
    title: 'ESFJ - The Consul',
    description: 'Người ấm áp, hòa đồng và quan tâm đến người khác. Thích tạo ra môi trường hài hòa.',
    strengths: ['Hòa đồng', 'Tận tâm', 'Đáng tin cậy', 'Thực tế'],
    weaknesses: ['Quá quan tâm ý kiến người khác', 'Khó chấp nhận phê bình', 'Hay lo lắng'],
    careers: ['Y tá', 'Giáo viên', 'HR', 'Dịch vụ khách hàng', 'Sự kiện'],
    color: 'bg-rose-500',
    percentage: '12%'
  },
  ISTP: {
    name: 'Nhà kỹ thuật',
    title: 'ISTP - The Virtuoso',
    description: 'Người thực tế, linh hoạt với khả năng giải quyết vấn đề xuất sắc. Thích làm việc với công cụ và máy móc.',
    strengths: ['Thực tế', 'Linh hoạt', 'Bình tĩnh', 'Giải quyết vấn đề tốt'],
    weaknesses: ['Khó cam kết', 'Thiếu nhạy cảm', 'Hay mạo hiểm'],
    careers: ['Kỹ sư', 'Thợ máy', 'Phi công', 'Lập trình viên', 'Thể thao'],
    color: 'bg-gray-600',
    percentage: '5%'
  },
  ISFP: {
    name: 'Người nghệ sĩ',
    title: 'ISFP - The Adventurer',
    description: 'Người nhạy cảm, sáng tạo và thích khám phá. Sống theo cảm xúc và đánh giá cao vẻ đẹp.',
    strengths: ['Sáng tạo', 'Nhạy cảm', 'Linh hoạt', 'Hòa nhã'],
    weaknesses: ['Hay trì hoãn', 'Khó lên kế hoạch', 'Quá nhạy cảm'],
    careers: ['Nghệ sĩ', 'Thiết kế', 'Nhiếp ảnh', 'Đầu bếp', 'Thời trang'],
    color: 'bg-amber-500',
    percentage: '9%'
  },
  ESTP: {
    name: 'Người thực thi',
    title: 'ESTP - The Entrepreneur',
    description: 'Người năng động, thực tế và thích hành động. Giỏi xử lý tình huống và nắm bắt cơ hội.',
    strengths: ['Năng động', 'Thực tế', 'Linh hoạt', 'Xã giao tốt'],
    weaknesses: ['Thiếu kiên nhẫn', 'Hay mạo hiểm', 'Khó cam kết'],
    careers: ['Kinh doanh', 'Marketing', 'Thể thao', 'Cảnh sát', 'Sales'],
    color: 'bg-lime-600',
    percentage: '4%'
  },
  ESFP: {
    name: 'Người trình diễn',
    title: 'ESFP - The Entertainer',
    description: 'Người vui vẻ, hòa đồng và thích là trung tâm của sự chú ý. Sống trong hiện tại và tận hưởng cuộc sống.',
    strengths: ['Vui vẻ', 'Hòa đồng', 'Thực tế', 'Linh hoạt'],
    weaknesses: ['Thiếu tập trung', 'Hay trì hoãn', 'Khó lên kế hoạch'],
    careers: ['Diễn viên', 'MC', 'Sales', 'Sự kiện', 'Du lịch'],
    color: 'bg-fuchsia-500',
    percentage: '9%'
  }
};


// Câu hỏi trắc nghiệm MBTI
const MBTI_QUESTIONS = [
  // E vs I (Hướng ngoại vs Hướng nội)
  { id: 1, question: 'Bạn cảm thấy tràn đầy năng lượng khi:', optionA: 'Giao tiếp với nhiều người', optionB: 'Ở một mình hoặc với ít người thân', dimension: 'EI' },
  { id: 2, question: 'Trong một buổi tiệc, bạn thường:', optionA: 'Nói chuyện với nhiều người, kể cả người lạ', optionB: 'Chỉ nói chuyện với những người quen biết', dimension: 'EI' },
  { id: 3, question: 'Khi làm việc, bạn thích:', optionA: 'Làm việc nhóm, trao đổi ý tưởng', optionB: 'Làm việc độc lập, tập trung', dimension: 'EI' },
  { id: 4, question: 'Bạn thường:', optionA: 'Suy nghĩ trong khi nói', optionB: 'Suy nghĩ kỹ trước khi nói', dimension: 'EI' },
  { id: 5, question: 'Cuối tuần lý tưởng của bạn là:', optionA: 'Đi chơi, gặp gỡ bạn bè', optionB: 'Ở nhà đọc sách, xem phim', dimension: 'EI' },
  
  // S vs N (Giác quan vs Trực giác)
  { id: 6, question: 'Khi học điều mới, bạn thích:', optionA: 'Học từ kinh nghiệm thực tế, ví dụ cụ thể', optionB: 'Học từ lý thuyết, khái niệm tổng quát', dimension: 'SN' },
  { id: 7, question: 'Bạn thường chú ý đến:', optionA: 'Chi tiết cụ thể, sự kiện thực tế', optionB: 'Bức tranh tổng thể, khả năng tương lai', dimension: 'SN' },
  { id: 8, question: 'Khi giải quyết vấn đề, bạn dựa vào:', optionA: 'Kinh nghiệm và phương pháp đã được chứng minh', optionB: 'Trực giác và ý tưởng sáng tạo mới', dimension: 'SN' },
  { id: 9, question: 'Bạn thích công việc:', optionA: 'Có quy trình rõ ràng, kết quả cụ thể', optionB: 'Đòi hỏi sáng tạo, khám phá ý tưởng mới', dimension: 'SN' },
  { id: 10, question: 'Khi đọc sách, bạn thích:', optionA: 'Sách thực tế, hướng dẫn cụ thể', optionB: 'Sách về ý tưởng, triết học, tương lai', dimension: 'SN' },
  
  // T vs F (Lý trí vs Cảm xúc)
  { id: 11, question: 'Khi đưa ra quyết định, bạn dựa vào:', optionA: 'Logic, phân tích khách quan', optionB: 'Cảm xúc, giá trị cá nhân', dimension: 'TF' },
  { id: 12, question: 'Khi có mâu thuẫn, bạn thường:', optionA: 'Tìm giải pháp công bằng, hợp lý', optionB: 'Quan tâm đến cảm xúc của mọi người', dimension: 'TF' },
  { id: 13, question: 'Bạn đánh giá cao hơn:', optionA: 'Sự thật và công bằng', optionB: 'Sự hài hòa và đồng cảm', dimension: 'TF' },
  { id: 14, question: 'Khi góp ý cho người khác, bạn:', optionA: 'Nói thẳng, tập trung vào vấn đề', optionB: 'Nhẹ nhàng, quan tâm đến cảm xúc họ', dimension: 'TF' },
  { id: 15, question: 'Bạn thường được người khác nhận xét là:', optionA: 'Lý trí, khách quan', optionB: 'Ấm áp, quan tâm', dimension: 'TF' },
  
  // J vs P (Nguyên tắc vs Linh hoạt)
  { id: 16, question: 'Bạn thích cuộc sống:', optionA: 'Có kế hoạch, tổ chức rõ ràng', optionB: 'Linh hoạt, tự do, tùy hứng', dimension: 'JP' },
  { id: 17, question: 'Khi có deadline, bạn thường:', optionA: 'Hoàn thành sớm, không để đến phút cuối', optionB: 'Làm việc tốt nhất khi có áp lực deadline', dimension: 'JP' },
  { id: 18, question: 'Bạn cảm thấy thoải mái khi:', optionA: 'Mọi thứ được quyết định và lên kế hoạch', optionB: 'Có nhiều lựa chọn và có thể thay đổi', dimension: 'JP' },
  { id: 19, question: 'Không gian làm việc của bạn thường:', optionA: 'Ngăn nắp, có tổ chức', optionB: 'Hơi lộn xộn nhưng bạn biết mọi thứ ở đâu', dimension: 'JP' },
  { id: 20, question: 'Khi đi du lịch, bạn thích:', optionA: 'Lên kế hoạch chi tiết trước', optionB: 'Khám phá tự do, quyết định tại chỗ', dimension: 'JP' }
];


const MBTITest = () => {
  const [currentView, setCurrentView] = useState('intro'); // intro, test, result
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  // Tính kết quả MBTI
  const calculateResult = () => {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = MBTI_QUESTIONS.find(q => q.id === parseInt(questionId));
      if (question) {
        const dimension = question.dimension;
        if (answer === 'A') {
          scores[dimension[0]]++;
        } else {
          scores[dimension[1]]++;
        }
      }
    });

    const mbtiType = 
      (scores.E >= scores.I ? 'E' : 'I') +
      (scores.S >= scores.N ? 'S' : 'N') +
      (scores.T >= scores.F ? 'T' : 'F') +
      (scores.J >= scores.P ? 'J' : 'P');

    setResult({
      type: mbtiType,
      scores,
      details: MBTI_TYPES[mbtiType]
    });
    setCurrentView('result');
  };

  // Xử lý trả lời câu hỏi
  const handleAnswer = (answer) => {
    const newAnswers = { ...answers, [MBTI_QUESTIONS[currentQuestion].id]: answer };
    setAnswers(newAnswers);

    if (currentQuestion < MBTI_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Hoàn thành test
      setTimeout(() => {
        const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        Object.entries(newAnswers).forEach(([questionId, ans]) => {
          const question = MBTI_QUESTIONS.find(q => q.id === parseInt(questionId));
          if (question) {
            const dimension = question.dimension;
            if (ans === 'A') {
              scores[dimension[0]]++;
            } else {
              scores[dimension[1]]++;
            }
          }
        });
        const mbtiType = 
          (scores.E >= scores.I ? 'E' : 'I') +
          (scores.S >= scores.N ? 'S' : 'N') +
          (scores.T >= scores.F ? 'T' : 'F') +
          (scores.J >= scores.P ? 'J' : 'P');
        setResult({ type: mbtiType, scores, details: MBTI_TYPES[mbtiType] });
        setCurrentView('result');
      }, 300);
    }
  };

  // Reset test
  const resetTest = () => {
    setCurrentView('intro');
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
  };

  const progress = ((currentQuestion + 1) / MBTI_QUESTIONS.length) * 100;

  // Intro View
  if (currentView === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <Brain className="h-8 w-8 text-orange-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Trắc nghiệm tính cách MBTI
              </h1>
              <p className="text-lg text-gray-600">
                Khám phá 16 nhóm tính cách và định hướng nghề nghiệp phù hợp
              </p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-md border-0 text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-1">20 câu hỏi</h3>
                  <p className="text-sm text-gray-500">Trả lời nhanh trong 5-10 phút</p>
                </CardContent>
              </Card>
              <Card className="shadow-md border-0 text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-1">16 nhóm tính cách</h3>
                  <p className="text-sm text-gray-500">Phân loại chi tiết và chính xác</p>
                </CardContent>
              </Card>
              <Card className="shadow-md border-0 text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-1">Gợi ý nghề nghiệp</h3>
                  <p className="text-sm text-gray-500">Phù hợp với tính cách của bạn</p>
                </CardContent>
              </Card>
            </div>

            {/* MBTI Explanation */}
            <Card className="shadow-md border-0 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  MBTI là gì?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  <strong>MBTI (Myers-Briggs Type Indicator)</strong> là phương pháp trắc nghiệm tính cách được phát triển bởi 
                  Katharine Cook Briggs và Isabel Briggs Myers, dựa trên lý thuyết của Carl Jung. MBTI phân loại con người 
                  thành 16 nhóm tính cách dựa trên 4 cặp đặc điểm:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { pair: 'E - I', title: 'Hướng ngoại vs Hướng nội', desc: 'Cách bạn lấy năng lượng' },
                    { pair: 'S - N', title: 'Giác quan vs Trực giác', desc: 'Cách bạn tiếp nhận thông tin' },
                    { pair: 'T - F', title: 'Lý trí vs Cảm xúc', desc: 'Cách bạn đưa ra quyết định' },
                    { pair: 'J - P', title: 'Nguyên tắc vs Linh hoạt', desc: 'Cách bạn tổ chức cuộc sống' }
                  ].map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <Badge className="mb-2 bg-orange-100 text-orange-700">{item.pair}</Badge>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Start Button */}
            <div className="text-center">
              <Button 
                size="lg" 
                onClick={() => setCurrentView('test')}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-6 text-lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Bắt đầu làm bài test
              </Button>
              <p className="text-sm text-gray-500 mt-3">Miễn phí • Không cần đăng ký</p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  // Test View
  if (currentView === 'test') {
    const question = MBTI_QUESTIONS[currentQuestion];
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Câu {currentQuestion + 1}/{MBTI_QUESTIONS.length}</span>
                <span className="text-sm font-medium text-orange-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Question Card */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-orange-600">{currentQuestion + 1}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                    {question.question}
                  </h2>
                </div>

                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full p-6 h-auto text-left justify-start hover:bg-orange-50 hover:border-orange-300 transition-all"
                    onClick={() => handleAnswer('A')}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="font-semibold text-orange-600">A</span>
                      </div>
                      <span className="text-gray-700">{question.optionA}</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full p-6 h-auto text-left justify-start hover:bg-purple-50 hover:border-purple-300 transition-all"
                    onClick={() => handleAnswer('B')}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="font-semibold text-purple-600">B</span>
                      </div>
                      <span className="text-gray-700">{question.optionB}</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="ghost"
                onClick={() => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1)}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Câu trước
              </Button>
              <Button variant="ghost" onClick={resetTest}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Làm lại
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Result View
  if (currentView === 'result' && result) {
    const { type, scores, details } = result;
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Result Header */}
            <Card className={cn("shadow-lg border-0 text-white mb-8", details.color)}>
              <CardContent className="p-8 text-center">
                <Badge className="bg-white/20 text-white mb-4">Kết quả của bạn</Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{type}</h1>
                <h2 className="text-2xl mb-2">{details.name}</h2>
                <p className="text-white/80">{details.title}</p>
                <p className="text-sm mt-4 text-white/70">
                  Chiếm khoảng {details.percentage} dân số thế giới
                </p>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="shadow-md border-0 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-orange-500" />
                  Mô tả tính cách
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{details.description}</p>
              </CardContent>
            </Card>

            {/* Scores */}
            <Card className="shadow-md border-0 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Chi tiết điểm số
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { left: 'E', right: 'I', leftLabel: 'Hướng ngoại', rightLabel: 'Hướng nội' },
                    { left: 'S', right: 'N', leftLabel: 'Giác quan', rightLabel: 'Trực giác' },
                    { left: 'T', right: 'F', leftLabel: 'Lý trí', rightLabel: 'Cảm xúc' },
                    { left: 'J', right: 'P', leftLabel: 'Nguyên tắc', rightLabel: 'Linh hoạt' }
                  ].map((dim, index) => {
                    const leftScore = scores[dim.left];
                    const rightScore = scores[dim.right];
                    const total = leftScore + rightScore;
                    const leftPercent = (leftScore / total) * 100;
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={leftScore >= rightScore ? 'font-semibold text-orange-600' : 'text-gray-500'}>
                            {dim.left} - {dim.leftLabel} ({leftScore})
                          </span>
                          <span className={rightScore > leftScore ? 'font-semibold text-purple-600' : 'text-gray-500'}>
                            {dim.right} - {dim.rightLabel} ({rightScore})
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-orange-500 to-purple-500 transition-all"
                            style={{ width: `${leftPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    Điểm mạnh
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {details.strengths.map((strength, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <Shield className="h-5 w-5" />
                    Điểm cần cải thiện
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {details.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Career Suggestions */}
            <Card className="shadow-md border-0 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-purple-500" />
                  Nghề nghiệp phù hợp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {details.careers.map((career, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {career}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={resetTest} variant="outline" size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                Làm lại bài test
              </Button>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-pink-500"
                onClick={() => {
                  const text = `Kết quả MBTI của tôi: ${type} - ${details.name}`;
                  navigator.clipboard.writeText(text);
                }}
              >
                <Award className="h-4 w-4 mr-2" />
                Chia sẻ kết quả
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MBTITest;
