# Hướng dẫn cập nhật Frontend - Profile & CV Integration

## ✅ Đã hoàn thành

1. **Tạo components mới:**
   - ✅ `CertificatesSection.jsx` - Quản lý chứng chỉ
   - ✅ `ProjectsSection.jsx` - Quản lý dự án
   - ✅ `SocialLinksSection.jsx` - Quản lý liên kết mạng xã hội
   
2. **Cập nhật ProfilePage:**
   - ✅ Import các sections mới
   - ✅ Thêm sections vào layout

## 🔄 Cần cập nhật

### 1. SkillsSection.jsx

**Thêm trường level và category cho mỗi skill:**

```jsx
// Thay đổi state formData
const [formData, setFormData] = useState({
  name: '',
  level: '',      // MỚI
  category: ''    // MỚI
});

// Thêm dropdown cho level
<div className="space-y-2">
  <Label htmlFor="level">Cấp độ</Label>
  <Select
    value={formData.level}
    onValueChange={(value) => setFormData({ ...formData, level: value })}
  >
    <SelectTrigger>
      <SelectValue placeholder="Chọn cấp độ" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="Beginner">Beginner</SelectItem>
      <SelectItem value="Intermediate">Intermediate</SelectItem>
      <SelectItem value="Advanced">Advanced</SelectItem>
      <SelectItem value="Expert">Expert</SelectItem>
    </SelectContent>
  </Select>
</div>

// Thêm dropdown cho category
<div className="space-y-2">
  <Label htmlFor="category">Phân loại</Label>
  <Select
    value={formData.category}
    onValueChange={(value) => setFormData({ ...formData, category: value })}
  >
    <SelectTrigger>
      <SelectValue placeholder="Chọn phân loại" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="Technical">Technical</SelectItem>
      <SelectItem value="Soft Skills">Soft Skills</SelectItem>
      <SelectItem value="Language">Language</SelectItem>
      <SelectItem value="Other">Other</SelectItem>
    </SelectContent>
  </Select>
</div>

// Hiển thị level và category trong skill badge
<Badge variant="secondary">
  {skill.name}
  {skill.level && <span className="ml-1 text-xs">({skill.level})</span>}
</Badge>
```

### 2. EducationSection.jsx

**Thêm trường location và honors:**

```jsx
// Thêm vào formData
const [formData, setFormData] = useState({
  school: '',
  major: '',
  degree: '',
  startDate: '',
  endDate: '',
  description: '',
  gpa: '',
  location: '',    // MỚI
  honors: []       // MỚI
});

// Thêm input cho location
<div className="space-y-2">
  <Label htmlFor="location">Địa điểm</Label>
  <Input
    id="location"
    value={formData.location}
    onChange={(e) => onFormChange('location', e.target.value)}
    placeholder="VD: TP. Hồ Chí Minh"
  />
</div>

// Thêm input cho honors (array)
<div className="space-y-2">
  <Label htmlFor="honors">Giải thưởng / Danh hiệu</Label>
  <div className="space-y-2">
    {formData.honors.map((honor, index) => (
      <div key={index} className="flex gap-2">
        <Input
          value={honor}
          onChange={(e) => {
            const newHonors = [...formData.honors];
            newHonors[index] = e.target.value;
            onFormChange('honors', newHonors);
          }}
          placeholder="VD: Học bổng xuất sắc"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const newHonors = formData.honors.filter((_, i) => i !== index);
            onFormChange('honors', newHonors);
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    ))}
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => onFormChange('honors', [...formData.honors, ''])}
    >
      <Plus className="w-4 h-4 mr-2" />
      Thêm giải thưởng
    </Button>
  </div>
</div>

// Hiển thị location và honors trong card
{education.location && (
  <p className="text-sm text-muted-foreground flex items-center gap-1">
    <MapPin className="w-3 h-3" />
    {education.location}
  </p>
)}
{education.honors && education.honors.length > 0 && (
  <div className="mt-2">
    <p className="text-xs font-medium text-muted-foreground mb-1">Giải thưởng:</p>
    <ul className="text-xs text-muted-foreground list-disc list-inside">
      {education.honors.map((honor, i) => (
        <li key={i}>{honor}</li>
      ))}
    </ul>
  </div>
)}
```

### 3. ExperienceSection.jsx

**Thêm trường location, isCurrentJob, và achievements:**

```jsx
// Thêm vào formData
const [formData, setFormData] = useState({
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  description: '',
  responsibilities: [],
  location: '',        // MỚI
  isCurrentJob: false, // MỚI
  achievements: []     // MỚI
});

// Thêm input cho location
<div className="space-y-2">
  <Label htmlFor="location">Địa điểm</Label>
  <Input
    id="location"
    value={formData.location}
    onChange={(e) => onFormChange('location', e.target.value)}
    placeholder="VD: TP. Hồ Chí Minh"
  />
</div>

// Thêm checkbox cho isCurrentJob
<div className="flex items-center space-x-2">
  <Checkbox
    id="isCurrentJob"
    checked={formData.isCurrentJob}
    onCheckedChange={(checked) => onFormChange('isCurrentJob', checked)}
  />
  <Label htmlFor="isCurrentJob" className="text-sm font-normal">
    Đây là công việc hiện tại
  </Label>
</div>

// Disable endDate nếu isCurrentJob = true
<Input
  id="endDate"
  type="date"
  value={formData.endDate}
  onChange={(e) => onFormChange('endDate', e.target.value)}
  disabled={formData.isCurrentJob}
/>

// Thêm section cho achievements (tách biệt với responsibilities)
<div className="space-y-2">
  <Label>Thành tựu nổi bật</Label>
  <div className="space-y-2">
    {formData.achievements.map((achievement, index) => (
      <div key={index} className="flex gap-2">
        <Input
          value={achievement}
          onChange={(e) => {
            const newAchievements = [...formData.achievements];
            newAchievements[index] = e.target.value;
            onFormChange('achievements', newAchievements);
          }}
          placeholder="VD: Tăng doanh thu 30%"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const newAchievements = formData.achievements.filter((_, i) => i !== index);
            onFormChange('achievements', newAchievements);
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    ))}
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => onFormChange('achievements', [...formData.achievements, ''])}
    >
      <Plus className="w-4 h-4 mr-2" />
      Thêm thành tựu
    </Button>
  </div>
</div>

// Hiển thị trong card
{experience.location && (
  <p className="text-sm text-muted-foreground flex items-center gap-1">
    <MapPin className="w-3 h-3" />
    {experience.location}
  </p>
)}
{experience.isCurrentJob && (
  <Badge variant="secondary" className="text-xs">
    Hiện tại
  </Badge>
)}
{experience.achievements && experience.achievements.length > 0 && (
  <div className="mt-2">
    <p className="text-xs font-medium text-muted-foreground mb-1">Thành tựu:</p>
    <ul className="text-xs text-muted-foreground list-disc list-inside">
      {experience.achievements.map((achievement, i) => (
        <li key={i}>{achievement}</li>
      ))}
    </ul>
  </div>
)}
```

### 4. CV Service - Thêm API tạo CV từ profile

**File: `fe/src/services/cvService.js`**

```javascript
// Thêm function mới
export const createCvFromProfile = async (templateId, title) => {
  const response = await apiClient.post('/cvs/from-profile', {
    templateId,
    title
  });
  return response.data;
};
```

### 5. CV Management Page - Thêm nút "Tạo từ Profile"

**File: `fe/src/pages/cv/CVManagementPage.jsx`**

```jsx
import { createCvFromProfile } from '@/services/cvService';

// Thêm mutation
const createFromProfileMutation = useMutation({
  mutationFn: ({ templateId, title }) => createCvFromProfile(templateId, title),
  onSuccess: (response) => {
    toast.success('Đã tạo CV từ hồ sơ');
    navigate(`/cv/edit/${response.data._id}`);
  },
  onError: (error) => {
    toast.error(error.response?.data?.message || 'Không thể tạo CV');
  }
});

// Thêm button trong template gallery
<div className="flex gap-2">
  <Button onClick={() => handleCreateCv(template.id)}>
    Tạo CV trống
  </Button>
  <Button 
    variant="outline"
    onClick={() => createFromProfileMutation.mutate({
      templateId: template.id,
      title: 'My CV'
    })}
  >
    Tạo từ hồ sơ
  </Button>
</div>
```

### 6. Import các components UI cần thiết

Đảm bảo các components sau đã được import:

```jsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin } from 'lucide-react';
```

## 📝 Checklist

- [ ] Cập nhật SkillsSection với level và category
- [ ] Cập nhật EducationSection với location và honors
- [ ] Cập nhật ExperienceSection với location, isCurrentJob, achievements
- [ ] Thêm API createCvFromProfile vào cvService
- [ ] Thêm nút "Tạo từ hồ sơ" trong CV Management Page
- [ ] Test tất cả CRUD operations cho sections mới
- [ ] Test tạo CV từ profile với đầy đủ dữ liệu
- [ ] Test tạo CV từ profile với dữ liệu thiếu
- [ ] Kiểm tra responsive design
- [ ] Kiểm tra validation

## 🎨 UI/UX Notes

1. **Certificates & Projects**: Hiển thị ở cột trái (main content) để có không gian rộng hơn
2. **Social Links**: Hiển thị ở cột phải (sidebar) vì ít nội dung
3. **Skills**: Thêm visual indicator cho level (có thể dùng stars hoặc progress bar)
4. **Education**: Honors hiển thị dạng list với icon
5. **Experience**: Tách biệt rõ ràng giữa responsibilities và achievements

## 🐛 Known Issues & Solutions

1. **Issue**: Date input format khác nhau giữa frontend và backend
   - **Solution**: Sử dụng type="month" cho consistency

2. **Issue**: Array fields (technologies, honors, achievements) cần validation
   - **Solution**: Filter empty strings trước khi submit

3. **Issue**: URL validation cho social links
   - **Solution**: Sử dụng type="url" và regex validation

## 📚 Resources

- Backend API docs: `be/PROFILE_CV_INTEGRATION.md`
- Quick guide: `be/QUICK_PROFILE_UPDATE_GUIDE.md`
- Component examples: `fe/src/components/profile/`
