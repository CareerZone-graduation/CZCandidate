import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Search,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Star,
  BookOpen,
  Briefcase,
  Code,
  TrendingUp,
  Users,
  Megaphone,
  Calculator,
  Truck,
  Heart,
  Filter,
  CheckCircle,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Dữ liệu câu hỏi phỏng vấn theo ngành
const INTERVIEW_CATEGORIES = [
  { id: 'general', name: 'Câu hỏi chung', icon: MessageSquare, color: 'bg-blue-500' },
  { id: 'it', name: 'Công nghệ thông tin', icon: Code, color: 'bg-purple-500' },
  { id: 'sales', name: 'Kinh doanh / Sales', icon: TrendingUp, color: 'bg-green-500' },
  { id: 'marketing', name: 'Marketing', icon: Megaphone, color: 'bg-pink-500' },
  { id: 'hr', name: 'Nhân sự (HR)', icon: Users, color: 'bg-orange-500' },
  { id: 'accounting', name: 'Kế toán / Tài chính', icon: Calculator, color: 'bg-cyan-500' },
  { id: 'logistics', name: 'Logistics', icon: Truck, color: 'bg-yellow-500' },
  { id: 'customer-service', name: 'Chăm sóc khách hàng', icon: Heart, color: 'bg-red-500' }
];


const INTERVIEW_QUESTIONS = {
  general: [
    {
      id: 1,
      question: 'Hãy giới thiệu về bản thân bạn?',
      answer: 'Tôi là [Tên], tốt nghiệp ngành [Ngành học] tại [Trường]. Tôi có [X năm] kinh nghiệm trong lĩnh vực [Lĩnh vực]. Điểm mạnh của tôi là [Điểm mạnh]. Tôi đang tìm kiếm cơ hội để phát triển sự nghiệp và đóng góp cho công ty.',
      tips: ['Giới thiệu ngắn gọn trong 2-3 phút', 'Tập trung vào kinh nghiệm liên quan đến vị trí ứng tuyển', 'Thể hiện sự tự tin nhưng không kiêu ngạo'],
      difficulty: 'easy',
      isFeatured: true
    },
    {
      id: 2,
      question: 'Tại sao bạn muốn làm việc tại công ty chúng tôi?',
      answer: 'Tôi ấn tượng với [văn hóa công ty/sản phẩm/dịch vụ] của quý công ty. Tôi tin rằng với kinh nghiệm và kỹ năng của mình, tôi có thể đóng góp vào [mục tiêu cụ thể]. Đây cũng là cơ hội tuyệt vời để tôi phát triển trong lĩnh vực [lĩnh vực].',
      tips: ['Nghiên cứu kỹ về công ty trước khi phỏng vấn', 'Liên kết mục tiêu cá nhân với mục tiêu công ty', 'Tránh nói về lương thưởng ở câu này'],
      difficulty: 'easy',
      isFeatured: true
    },
    {
      id: 3,
      question: 'Điểm mạnh và điểm yếu của bạn là gì?',
      answer: 'Điểm mạnh: Tôi có khả năng [kỹ năng cụ thể], luôn hoàn thành công việc đúng deadline. Điểm yếu: Trước đây tôi hay [điểm yếu], nhưng tôi đã cải thiện bằng cách [giải pháp cụ thể].',
      tips: ['Chọn điểm mạnh liên quan đến công việc', 'Điểm yếu nên là điều có thể cải thiện', 'Luôn kèm theo cách bạn đang khắc phục điểm yếu'],
      difficulty: 'medium',
      isFeatured: true
    },
    {
      id: 4,
      question: 'Bạn xử lý áp lực công việc như thế nào?',
      answer: 'Tôi thường chia nhỏ công việc thành các task cụ thể, ưu tiên theo mức độ quan trọng. Tôi cũng duy trì lịch làm việc khoa học và biết cách nghỉ ngơi hợp lý để giữ hiệu suất cao.',
      tips: ['Đưa ra ví dụ cụ thể về tình huống áp lực bạn đã xử lý', 'Thể hiện khả năng quản lý thời gian', 'Cho thấy bạn có phương pháp làm việc rõ ràng'],
      difficulty: 'medium'
    },
    {
      id: 5,
      question: 'Mục tiêu nghề nghiệp của bạn trong 5 năm tới?',
      answer: 'Trong 5 năm tới, tôi muốn phát triển chuyên môn sâu trong lĩnh vực [lĩnh vực], đảm nhận vai trò [vị trí cao hơn] và đóng góp vào sự phát triển của công ty.',
      tips: ['Mục tiêu nên thực tế và phù hợp với vị trí ứng tuyển', 'Thể hiện cam kết gắn bó lâu dài', 'Liên kết mục tiêu cá nhân với cơ hội tại công ty'],
      difficulty: 'medium'
    },
    {
      id: 6,
      question: 'Tại sao bạn rời công ty cũ?',
      answer: 'Tôi rời công ty cũ vì muốn tìm kiếm cơ hội phát triển mới, thử thách bản thân trong môi trường [mô tả môi trường mong muốn]. Tôi đánh giá cao những gì đã học được ở công ty cũ.',
      tips: ['Không nói xấu công ty/sếp cũ', 'Tập trung vào cơ hội phát triển', 'Thể hiện thái độ tích cực'],
      difficulty: 'medium',
      isFeatured: true
    },
    {
      id: 7,
      question: 'Mức lương mong muốn của bạn là bao nhiêu?',
      answer: 'Dựa trên kinh nghiệm và kỹ năng của tôi, cùng với mức lương thị trường cho vị trí này, tôi mong muốn mức lương từ [X] đến [Y]. Tuy nhiên, tôi sẵn sàng thảo luận thêm dựa trên tổng đãi ngộ của công ty.',
      tips: ['Nghiên cứu mức lương thị trường trước', 'Đưa ra khoảng lương thay vì con số cụ thể', 'Cân nhắc cả phúc lợi, không chỉ lương cứng'],
      difficulty: 'hard'
    },
    {
      id: 8,
      question: 'Bạn có câu hỏi gì cho chúng tôi không?',
      answer: 'Tôi muốn hỏi về: 1) Văn hóa làm việc tại công ty như thế nào? 2) Cơ hội đào tạo và phát triển cho vị trí này? 3) Thách thức lớn nhất của team hiện tại là gì?',
      tips: ['Luôn chuẩn bị 2-3 câu hỏi', 'Hỏi về công việc, team, cơ hội phát triển', 'Tránh hỏi về lương, nghỉ phép ở vòng đầu'],
      difficulty: 'easy'
    }
  ],

  it: [
    {
      id: 1,
      question: 'Hãy giải thích sự khác nhau giữa var, let và const trong JavaScript?',
      answer: 'var: function-scoped, có thể redeclare và reassign, bị hoisting. let: block-scoped, không thể redeclare nhưng có thể reassign. const: block-scoped, không thể redeclare và reassign (với primitive), nhưng có thể modify object/array.',
      tips: ['Đưa ra ví dụ code cụ thể', 'Giải thích về hoisting', 'Nói về best practices khi sử dụng'],
      difficulty: 'easy',
      isFeatured: true
    },
    {
      id: 2,
      question: 'RESTful API là gì? Các HTTP methods phổ biến?',
      answer: 'REST (Representational State Transfer) là kiến trúc thiết kế API. Các HTTP methods: GET (lấy dữ liệu), POST (tạo mới), PUT (cập nhật toàn bộ), PATCH (cập nhật một phần), DELETE (xóa). RESTful API tuân theo các nguyên tắc: stateless, uniform interface, cacheable.',
      tips: ['Giải thích rõ từng method', 'Đưa ra ví dụ endpoint', 'Nói về status codes phổ biến'],
      difficulty: 'medium',
      isFeatured: true
    },
    {
      id: 3,
      question: 'Git là gì? Các lệnh Git cơ bản bạn thường dùng?',
      answer: 'Git là hệ thống quản lý phiên bản phân tán. Các lệnh cơ bản: git clone, git add, git commit, git push, git pull, git branch, git checkout, git merge, git rebase, git stash.',
      tips: ['Giải thích workflow Git của bạn', 'Nói về cách xử lý conflict', 'Đề cập đến Git branching strategy'],
      difficulty: 'easy'
    },
    {
      id: 4,
      question: 'Giải thích về SQL JOIN và các loại JOIN?',
      answer: 'JOIN dùng để kết hợp dữ liệu từ nhiều bảng. INNER JOIN: chỉ lấy records khớp ở cả 2 bảng. LEFT JOIN: lấy tất cả từ bảng trái + records khớp từ bảng phải. RIGHT JOIN: ngược lại. FULL OUTER JOIN: lấy tất cả từ cả 2 bảng.',
      tips: ['Vẽ diagram minh họa nếu có thể', 'Đưa ra ví dụ query cụ thể', 'Nói về performance considerations'],
      difficulty: 'medium'
    },
    {
      id: 5,
      question: 'React hooks là gì? Kể tên các hooks phổ biến?',
      answer: 'Hooks cho phép sử dụng state và lifecycle trong functional components. useState: quản lý state. useEffect: side effects. useContext: truy cập context. useRef: tham chiếu DOM. useMemo/useCallback: optimization. useReducer: complex state logic.',
      tips: ['Giải thích rules of hooks', 'So sánh với class components', 'Đưa ra use cases cụ thể'],
      difficulty: 'medium',
      isFeatured: true
    },
    {
      id: 6,
      question: 'Microservices là gì? Ưu nhược điểm?',
      answer: 'Microservices là kiến trúc chia ứng dụng thành các services nhỏ, độc lập. Ưu điểm: scalability, flexibility, fault isolation. Nhược điểm: complexity, network latency, data consistency challenges.',
      tips: ['So sánh với monolithic', 'Nói về communication patterns', 'Đề cập đến containerization'],
      difficulty: 'hard'
    }
  ],
  sales: [
    {
      id: 1,
      question: 'Bạn xử lý từ chối từ khách hàng như thế nào?',
      answer: 'Tôi xem từ chối là cơ hội để hiểu rõ hơn nhu cầu khách hàng. Tôi sẽ lắng nghe lý do, đặt câu hỏi để tìm hiểu pain points, và đề xuất giải pháp phù hợp. Nếu không thành công, tôi vẫn duy trì mối quan hệ tốt cho cơ hội tương lai.',
      tips: ['Đưa ra ví dụ cụ thể', 'Thể hiện sự kiên nhẫn', 'Cho thấy khả năng học hỏi từ thất bại'],
      difficulty: 'medium',
      isFeatured: true
    },
    {
      id: 2,
      question: 'Mô tả quy trình bán hàng của bạn?',
      answer: 'Quy trình của tôi gồm: 1) Nghiên cứu khách hàng tiềm năng, 2) Tiếp cận và tạo ấn tượng đầu tiên, 3) Tìm hiểu nhu cầu qua câu hỏi, 4) Trình bày giải pháp, 5) Xử lý phản đối, 6) Chốt đơn, 7) Chăm sóc sau bán hàng.',
      tips: ['Customize theo ngành hàng', 'Nhấn mạnh việc lắng nghe khách hàng', 'Đề cập đến CRM tools'],
      difficulty: 'medium',
      isFeatured: true
    },
    {
      id: 3,
      question: 'Làm thế nào để đạt được target doanh số?',
      answer: 'Tôi chia target thành mục tiêu nhỏ theo tuần/ngày, xây dựng pipeline đủ lớn, ưu tiên leads có khả năng chuyển đổi cao, và liên tục theo dõi KPIs để điều chỉnh chiến lược kịp thời.',
      tips: ['Đưa ra con số cụ thể nếu có', 'Nói về cách quản lý thời gian', 'Thể hiện tư duy data-driven'],
      difficulty: 'medium'
    },
    {
      id: 4,
      question: 'Bạn xây dựng mối quan hệ với khách hàng như thế nào?',
      answer: 'Tôi tập trung vào việc hiểu nhu cầu thực sự của khách hàng, cung cấp giá trị trước khi bán hàng, duy trì liên lạc thường xuyên, và luôn giữ lời hứa. Tôi cũng chủ động chia sẻ thông tin hữu ích cho khách hàng.',
      tips: ['Nhấn mạnh long-term relationship', 'Đề cập đến follow-up strategy', 'Nói về customer retention'],
      difficulty: 'easy'
    }
  ],

  marketing: [
    {
      id: 1,
      question: 'Sự khác nhau giữa Marketing truyền thống và Digital Marketing?',
      answer: 'Marketing truyền thống: TV, radio, báo chí, billboard - khó đo lường, chi phí cao, reach rộng. Digital Marketing: SEO, SEM, Social Media, Email - đo lường chính xác, target cụ thể, chi phí linh hoạt, tương tác 2 chiều.',
      tips: ['Đưa ra ví dụ campaign cụ thể', 'Nói về ROI measurement', 'Đề cập đến omnichannel approach'],
      difficulty: 'easy',
      isFeatured: true
    },
    {
      id: 2,
      question: 'Bạn đo lường hiệu quả của một chiến dịch marketing như thế nào?',
      answer: 'Tôi sử dụng các KPIs phù hợp với mục tiêu: Awareness (reach, impressions), Engagement (likes, shares, comments), Conversion (CTR, conversion rate), Revenue (ROI, ROAS, CAC, LTV).',
      tips: ['Nói về tools analytics', 'Đề cập đến A/B testing', 'Giải thích cách optimize dựa trên data'],
      difficulty: 'medium',
      isFeatured: true
    },
    {
      id: 3,
      question: 'SEO là gì? Các yếu tố quan trọng trong SEO?',
      answer: 'SEO (Search Engine Optimization) là tối ưu website để xếp hạng cao trên search engines. Yếu tố quan trọng: On-page (content, keywords, meta tags), Off-page (backlinks, social signals), Technical (site speed, mobile-friendly, structured data).',
      tips: ['Đề cập đến Google algorithm updates', 'Nói về keyword research tools', 'Giải thích white hat vs black hat SEO'],
      difficulty: 'medium'
    },
    {
      id: 4,
      question: 'Làm thế nào để xây dựng content strategy hiệu quả?',
      answer: 'Bước 1: Xác định target audience và buyer persona. Bước 2: Audit content hiện tại. Bước 3: Chọn content types và channels phù hợp. Bước 4: Lập content calendar. Bước 5: Sản xuất và phân phối. Bước 6: Đo lường và optimize.',
      tips: ['Nói về content pillars', 'Đề cập đến repurposing content', 'Giải thích về content funnel'],
      difficulty: 'medium'
    }
  ],
  hr: [
    {
      id: 1,
      question: 'Quy trình tuyển dụng của bạn như thế nào?',
      answer: 'Quy trình gồm: 1) Phân tích nhu cầu và JD, 2) Đăng tin và sourcing, 3) Sàng lọc CV, 4) Phỏng vấn (HR + Technical), 5) Reference check, 6) Offer và negotiation, 7) Onboarding.',
      tips: ['Nói về ATS và recruitment tools', 'Đề cập đến employer branding', 'Giải thích cách đánh giá culture fit'],
      difficulty: 'medium',
      isFeatured: true
    },
    {
      id: 2,
      question: 'Làm thế nào để giữ chân nhân tài?',
      answer: 'Các chiến lược: Competitive compensation, Career development opportunities, Positive work culture, Recognition programs, Work-life balance, Regular feedback và communication, Employee engagement activities.',
      tips: ['Đưa ra ví dụ cụ thể', 'Nói về exit interview insights', 'Đề cập đến employee satisfaction surveys'],
      difficulty: 'medium',
      isFeatured: true
    },
    {
      id: 3,
      question: 'Bạn xử lý conflict giữa nhân viên như thế nào?',
      answer: 'Tôi sẽ: 1) Lắng nghe cả hai bên riêng biệt, 2) Xác định nguyên nhân gốc rễ, 3) Tổ chức buổi mediation, 4) Tìm giải pháp win-win, 5) Follow up để đảm bảo vấn đề được giải quyết.',
      tips: ['Nhấn mạnh tính trung lập', 'Nói về documentation', 'Đề cập đến company policy'],
      difficulty: 'hard'
    }
  ],
  accounting: [
    {
      id: 1,
      question: 'Giải thích về các báo cáo tài chính cơ bản?',
      answer: 'Bảng cân đối kế toán: thể hiện tài sản, nợ phải trả, vốn chủ sở hữu tại một thời điểm. Báo cáo kết quả kinh doanh: doanh thu, chi phí, lợi nhuận trong kỳ. Báo cáo lưu chuyển tiền tệ: dòng tiền vào/ra từ hoạt động kinh doanh, đầu tư, tài chính.',
      tips: ['Nói về mối quan hệ giữa các báo cáo', 'Đề cập đến các chỉ số tài chính', 'Giải thích về auditing'],
      difficulty: 'medium',
      isFeatured: true
    },
    {
      id: 2,
      question: 'Sự khác nhau giữa kế toán tài chính và kế toán quản trị?',
      answer: 'Kế toán tài chính: báo cáo cho bên ngoài (cổ đông, ngân hàng), tuân theo chuẩn mực kế toán, dữ liệu lịch sử. Kế toán quản trị: phục vụ quản lý nội bộ, linh hoạt, tập trung vào dự báo và ra quyết định.',
      tips: ['Đưa ra ví dụ cụ thể', 'Nói về cost accounting', 'Đề cập đến budgeting'],
      difficulty: 'medium'
    },
    {
      id: 3,
      question: 'Bạn xử lý sai sót trong sổ sách kế toán như thế nào?',
      answer: 'Tôi sẽ: 1) Xác định và phân tích sai sót, 2) Đánh giá mức độ ảnh hưởng, 3) Thực hiện bút toán điều chỉnh, 4) Cập nhật documentation, 5) Báo cáo cho cấp trên nếu cần, 6) Đề xuất biện pháp phòng ngừa.',
      tips: ['Nhấn mạnh tính chính xác', 'Nói về internal controls', 'Đề cập đến audit trail'],
      difficulty: 'medium',
      isFeatured: true
    }
  ],

  logistics: [
    {
      id: 1,
      question: 'Supply Chain Management là gì?',
      answer: 'SCM là quản lý toàn bộ chuỗi cung ứng từ nguyên liệu đến sản phẩm cuối cùng đến tay khách hàng. Bao gồm: procurement, production, inventory management, warehousing, transportation, và distribution.',
      tips: ['Nói về các KPIs trong SCM', 'Đề cập đến technology (ERP, WMS)', 'Giải thích về lean và just-in-time'],
      difficulty: 'medium',
      isFeatured: true
    },
    {
      id: 2,
      question: 'Làm thế nào để tối ưu chi phí vận chuyển?',
      answer: 'Các phương pháp: Route optimization, Consolidation shipments, Negotiate với carriers, Sử dụng multi-modal transport, Warehouse location optimization, Demand forecasting để giảm expedited shipping.',
      tips: ['Đưa ra ví dụ cụ thể', 'Nói về TMS (Transportation Management System)', 'Đề cập đến last-mile delivery'],
      difficulty: 'medium'
    },
    {
      id: 3,
      question: 'Inventory management và các phương pháp quản lý tồn kho?',
      answer: 'Các phương pháp: FIFO (First In First Out), LIFO (Last In First Out), ABC Analysis (phân loại theo giá trị), EOQ (Economic Order Quantity), Safety stock, Just-in-time inventory.',
      tips: ['Giải thích khi nào dùng phương pháp nào', 'Nói về inventory turnover', 'Đề cập đến stockout và overstock costs'],
      difficulty: 'medium',
      isFeatured: true
    }
  ],
  'customer-service': [
    {
      id: 1,
      question: 'Bạn xử lý khách hàng khó tính như thế nào?',
      answer: 'Tôi sẽ: 1) Giữ bình tĩnh và lắng nghe, 2) Thể hiện sự đồng cảm, 3) Xin lỗi về sự bất tiện, 4) Tìm hiểu vấn đề cụ thể, 5) Đề xuất giải pháp, 6) Follow up để đảm bảo hài lòng.',
      tips: ['Đưa ra ví dụ cụ thể', 'Nhấn mạnh kỹ năng lắng nghe', 'Nói về de-escalation techniques'],
      difficulty: 'medium',
      isFeatured: true
    },
    {
      id: 2,
      question: 'Customer satisfaction và customer loyalty khác nhau như thế nào?',
      answer: 'Satisfaction: khách hàng hài lòng với sản phẩm/dịch vụ tại thời điểm đó. Loyalty: khách hàng tiếp tục mua hàng, giới thiệu cho người khác, và gắn bó lâu dài với thương hiệu. Satisfaction là điều kiện cần nhưng chưa đủ cho loyalty.',
      tips: ['Nói về NPS (Net Promoter Score)', 'Đề cập đến customer retention strategies', 'Giải thích về customer lifetime value'],
      difficulty: 'medium'
    },
    {
      id: 3,
      question: 'Làm thế nào để cải thiện trải nghiệm khách hàng?',
      answer: 'Các cách: Lắng nghe feedback, Personalization, Omnichannel support, Giảm thời gian chờ đợi, Training nhân viên, Proactive communication, Continuous improvement dựa trên data.',
      tips: ['Đưa ra ví dụ cụ thể', 'Nói về customer journey mapping', 'Đề cập đến CRM tools'],
      difficulty: 'medium',
      isFeatured: true
    }
  ]
};

const DIFFICULTY_CONFIG = {
  easy: { label: 'Dễ', color: 'bg-green-100 text-green-700 border-green-200' },
  medium: { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  hard: { label: 'Khó', color: 'bg-red-100 text-red-700 border-red-200' }
};


const InterviewQuestions = () => {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Lọc câu hỏi
  const filteredQuestions = useMemo(() => {
    let questions = INTERVIEW_QUESTIONS[selectedCategory] || [];
    
    if (searchTerm) {
      questions = questions.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (difficultyFilter !== 'all') {
      questions = questions.filter(q => q.difficulty === difficultyFilter);
    }
    
    return questions;
  }, [selectedCategory, searchTerm, difficultyFilter]);

  // Toggle expand câu hỏi
  const toggleQuestion = (id) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Copy câu trả lời
  const copyAnswer = (answer, id) => {
    navigator.clipboard.writeText(answer);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Đếm số câu hỏi theo category
  const getCategoryCount = (categoryId) => {
    return INTERVIEW_QUESTIONS[categoryId]?.length || 0;
  };

  const currentCategory = INTERVIEW_CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Câu hỏi phỏng vấn thường gặp
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              500+ câu hỏi phỏng vấn phổ biến với gợi ý trả lời chi tiết
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Cập nhật thường xuyên
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Lightbulb className="h-3 w-3 mr-1" />
                Có gợi ý trả lời
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <BookOpen className="h-3 w-3 mr-1" />
                Phân loại theo ngành
              </Badge>
            </div>
          </div>

          {/* Category Selection */}
          <div className="mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {INTERVIEW_CATEGORIES.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "h-auto py-2 px-4",
                      selectedCategory === category.id && `${category.color} hover:opacity-90`
                    )}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {category.name}
                    <Badge variant="secondary" className="ml-2 bg-white/20">
                      {getCategoryCount(category.id)}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Tìm kiếm câu hỏi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'easy', 'medium', 'hard'].map((diff) => (
                <Button
                  key={diff}
                  variant={difficultyFilter === diff ? "default" : "outline"}
                  onClick={() => setDifficultyFilter(diff)}
                  className={cn(
                    "h-12",
                    difficultyFilter === diff && diff !== 'all' && DIFFICULTY_CONFIG[diff]?.color
                  )}
                >
                  {diff === 'all' ? 'Tất cả' : DIFFICULTY_CONFIG[diff]?.label}
                </Button>
              ))}
            </div>
          </div>


          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((item, index) => (
                <Card 
                  key={item.id} 
                  className={cn(
                    "shadow-md border-0 overflow-hidden transition-all duration-300",
                    item.isFeatured && "ring-2 ring-yellow-400"
                  )}
                >
                  <CardHeader 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleQuestion(item.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0",
                          currentCategory?.color || 'bg-blue-500'
                        )}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {item.isFeatured && (
                              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                                <Star className="h-3 w-3 mr-1" />
                                Phổ biến
                              </Badge>
                            )}
                            <Badge className={DIFFICULTY_CONFIG[item.difficulty]?.color}>
                              {DIFFICULTY_CONFIG[item.difficulty]?.label}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {item.question}
                          </h3>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        {expandedQuestions[item.id] ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  
                  {expandedQuestions[item.id] && (
                    <CardContent className="pt-0 pb-6">
                      <div className="ml-11 space-y-4">
                        {/* Answer */}
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-green-800 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Gợi ý trả lời
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyAnswer(item.answer, item.id)}
                              className="text-green-700 hover:text-green-800"
                            >
                              {copiedId === item.id ? (
                                <>
                                  <Check className="h-4 w-4 mr-1" />
                                  Đã copy
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                          <p className="text-green-900 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>

                        {/* Tips */}
                        {item.tips && item.tips.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h4 className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
                              <Lightbulb className="h-4 w-4" />
                              Mẹo trả lời
                            </h4>
                            <ul className="space-y-1">
                              {item.tips.map((tip, tipIndex) => (
                                <li key={tipIndex} className="text-blue-900 flex items-start gap-2">
                                  <span className="text-blue-500 mt-1">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            ) : (
              <Card className="shadow-md border-0">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Không tìm thấy câu hỏi
                  </h3>
                  <p className="text-gray-500">
                    Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stats */}
          <Card className="mt-8 shadow-md border-0 bg-gradient-to-r from-purple-500 to-blue-600 text-white">
            <CardContent className="py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold">500+</p>
                  <p className="text-purple-100">Câu hỏi</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">8</p>
                  <p className="text-purple-100">Ngành nghề</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">100%</p>
                  <p className="text-purple-100">Miễn phí</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">24/7</p>
                  <p className="text-purple-100">Truy cập</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips Section */}
          <Card className="mt-6 shadow-md border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Bí quyết phỏng vấn thành công
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Chuẩn bị kỹ', desc: 'Nghiên cứu về công ty, vị trí ứng tuyển và chuẩn bị câu trả lời' },
                  { title: 'Đến đúng giờ', desc: 'Đến sớm 10-15 phút để ổn định tâm lý và làm quen môi trường' },
                  { title: 'Trang phục phù hợp', desc: 'Ăn mặc chuyên nghiệp, phù hợp với văn hóa công ty' },
                  { title: 'Ngôn ngữ cơ thể', desc: 'Giao tiếp bằng mắt, ngồi thẳng, bắt tay chắc chắn' },
                  { title: 'Lắng nghe kỹ', desc: 'Nghe hết câu hỏi trước khi trả lời, hỏi lại nếu chưa rõ' },
                  { title: 'Đặt câu hỏi', desc: 'Chuẩn bị 2-3 câu hỏi thông minh về công việc và công ty' }
                ].map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{tip.title}</h4>
                      <p className="text-sm text-gray-600">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterviewQuestions;
