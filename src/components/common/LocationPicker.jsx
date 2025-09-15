import { useState, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import locationData from '@/data/location_tree.json'; // Tải dữ liệu

// Hàm xử lý dữ liệu, chỉ lấy Tỉnh và Quận
const processLocationData = (tree) => {
  if (!tree) return null;

  const provinceNames = ['Tất cả tỉnh thành'];
  const districtMap = { 'Tất cả tỉnh thành': ['Tất cả quận/huyện'] };

  tree.forEach(province => {
    if (!province?.name) return;
    provinceNames.push(province.name);
    const currentDistricts = ['Tất cả quận/huyện']; // Thêm option "Tất cả" cho mỗi tỉnh
    (province.districts || []).forEach(district => {
      if (district?.name) {
        currentDistricts.push(district.name);
      }
    });
    districtMap[province.name] = currentDistricts;
  });

  return { provinceNames, districtMap };
};

const LocationPicker = ({ control, provinceFieldName, districtFieldName }) => {
  const { setValue, getValues } = useFormContext();
  const [processedData, setProcessedData] = useState(null);
  const [availableDistricts, setAvailableDistricts] = useState([]);

  // Tải và xử lý dữ liệu một lần
  useEffect(() => {
    const data = processLocationData(locationData);
    setProcessedData(data);
  }, []);

  const watchedProvince = useWatch({ control, name: provinceFieldName });
  const watchedDistrict = useWatch({ control, name: districtFieldName });

  // Cập nhật danh sách Quận/Huyện khi Tỉnh/Thành phố thay đổi
  useEffect(() => {
    if (watchedProvince && processedData) {
      // Nếu chọn "Tất cả tỉnh thành", set quận/huyện là "ALL" và vô hiệu hóa
      if (watchedProvince === 'Tất cả tỉnh thành') {
        setValue(districtFieldName, 'Tất cả quận/huyện');
        setAvailableDistricts(['Tất cả quận/huyện']);
      } else {
        const districts = processedData.districtMap[watchedProvince] || [];
        setAvailableDistricts(districts);
        const currentDistrict = getValues(districtFieldName);
        if (currentDistrict && !districts.includes(currentDistrict)) {
          setValue(districtFieldName, 'Tất cả quận/huyện'); // Mặc định là "Tất cả" khi đổi tỉnh
        }
      }
    } else {
      setAvailableDistricts([]);
    }
  }, [watchedProvince, processedData, setValue, districtFieldName, getValues]);

  if (!processedData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <>
      {/* Province Picker */}
      <Select onValueChange={(value) => setValue(provinceFieldName, value)} value={watchedProvince || ''}>
        <SelectTrigger>
          <SelectValue placeholder="Chọn tỉnh/thành phố" />
        </SelectTrigger>
        <SelectContent>
          {processedData.provinceNames.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* District Picker */}
      <Select
        onValueChange={(value) => setValue(districtFieldName, value)}
        value={watchedDistrict || ''}
        disabled={!watchedProvince || watchedProvince === 'Tất cả tỉnh thành'}
      >
        <SelectTrigger>
          <SelectValue placeholder="Chọn quận/huyện" />
        </SelectTrigger>
        <SelectContent key={watchedProvince}>
          {availableDistricts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
        </SelectContent>
      </Select>
    </>
  );
};

export default LocationPicker;