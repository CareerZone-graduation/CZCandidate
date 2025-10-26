import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, DollarSign, Edit3, Save, X, Plus, Trash2, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import locationData from '@/data/oldtree.json';

// Process location data từ oldtree.json
const processLocationData = () => {
    const provinces = [];
    const districtMap = new Map();

    locationData.forEach(province => {
        if (!province?.name) return;
        provinces.push({ name: province.name });
        const districts = (province.districts || []).map(d => ({ name: d.name }));
        districtMap.set(province.name, districts);
    });

    return { provinces, districtMap };
};

const { provinces: PROVINCES, districtMap: DISTRICT_MAP } = processLocationData();

const WORK_TYPES = [
    { value: 'ON_SITE', label: 'Tại văn phòng', icon: '🏢' },
    { value: 'REMOTE', label: 'Từ xa', icon: '🏠' },
    { value: 'HYBRID', label: 'Linh hoạt', icon: '🔄' }
];

const CONTRACT_TYPES = [
    { value: 'FULL_TIME', label: 'Toàn thời gian' },
    { value: 'PART_TIME', label: 'Bán thời gian' },
    { value: 'CONTRACT', label: 'Hợp đồng' },
    { value: 'INTERNSHIP', label: 'Thực tập' },
    { value: 'TEMPORARY', label: 'Tạm thời' },
    { value: 'FREELANCE', label: 'Freelance' }
];

const SALARY_RANGES = [
    { min: 5000000, max: 10000000, label: '5-10 triệu' },
    { min: 10000000, max: 15000000, label: '10-15 triệu' },
    { min: 15000000, max: 20000000, label: '15-20 triệu' },
    { min: 20000000, max: 30000000, label: '20-30 triệu' },
    { min: 30000000, max: 50000000, label: '30-50 triệu' },
    { min: 50000000, max: 100000000, label: '50-100 triệu' }
];

export const PreferencesSection = ({ profile, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const [formData, setFormData] = useState({
        preferredLocations: profile?.preferredLocations || [],
        expectedSalary: profile?.expectedSalary || { min: 0, max: 0, currency: 'VND' },
        workPreferences: profile?.workPreferences || { workTypes: [], contractTypes: [] }
    });

    const [newLocation, setNewLocation] = useState({ province: '', district: '' });

    const handleEdit = () => {
        setFormData({
            preferredLocations: profile?.preferredLocations || [],
            expectedSalary: profile?.expectedSalary || { min: 0, max: 0, currency: 'VND' },
            workPreferences: profile?.workPreferences || { workTypes: [], contractTypes: [] }
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setNewLocation({ province: '', district: '' });
    };

    const handleSave = async () => {
        try {
            setIsUpdating(true);
            await onUpdate(formData);
            setIsEditing(false);
            toast.success('Cập nhật thông tin thành công');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setIsUpdating(false);
        }
    };

    const addLocation = () => {
        if (!newLocation.province) {
            toast.error('Vui lòng chọn tỉnh/thành phố');
            return;
        }

        const exists = formData.preferredLocations.some(
            loc => loc.province === newLocation.province && loc.district === newLocation.district
        );

        if (exists) {
            toast.error('Địa điểm này đã được thêm');
            return;
        }

        setFormData(prev => ({
            ...prev,
            preferredLocations: [...prev.preferredLocations, { ...newLocation }]
        }));
        setNewLocation({ province: '', district: '' });
    };

    const removeLocation = (index) => {
        setFormData(prev => ({
            ...prev,
            preferredLocations: prev.preferredLocations.filter((_, i) => i !== index)
        }));
    };

    const toggleWorkType = (type) => {
        setFormData(prev => {
            const workTypes = prev.workPreferences?.workTypes || [];
            const newWorkTypes = workTypes.includes(type)
                ? workTypes.filter(t => t !== type)
                : [...workTypes, type];

            return {
                ...prev,
                workPreferences: { ...prev.workPreferences, workTypes: newWorkTypes }
            };
        });
    };

    const toggleContractType = (type) => {
        setFormData(prev => {
            const contractTypes = prev.workPreferences?.contractTypes || [];
            const newContractTypes = contractTypes.includes(type)
                ? contractTypes.filter(t => t !== type)
                : [...contractTypes, type];

            return {
                ...prev,
                workPreferences: { ...prev.workPreferences, contractTypes: newContractTypes }
            };
        });
    };

    const setSalaryRange = (range) => {
        setFormData(prev => ({
            ...prev,
            expectedSalary: { ...prev.expectedSalary, min: range.min, max: range.max }
        }));
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value || 0);
    };

    const getProvinceName = (provinceName) => {
        return provinceName;
    };

    const selectedDistricts = newLocation.province ? DISTRICT_MAP.get(newLocation.province) || [] : [];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-primary" />
                        Điều kiện làm việc
                    </CardTitle>
                    {!isEditing && (
                        <Button variant="outline" size="sm" onClick={handleEdit}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Preferred Locations */}
                <div>
                    <Label className="text-base font-semibold mb-3 flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Địa điểm làm việc mong muốn
                    </Label>

                    {isEditing ? (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <Select
                                    value={newLocation.province}
                                    onValueChange={(value) => setNewLocation({ province: value, district: '' })}
                                >
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Chọn tỉnh/thành phố" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PROVINCES.map((province) => (
                                            <SelectItem key={province.name} value={province.name}>
                                                {province.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {newLocation.province && (
                                    <Select
                                        value={newLocation.district || 'ALL_DISTRICTS'}
                                        onValueChange={(value) => setNewLocation(prev => ({
                                            ...prev,
                                            district: value === 'ALL_DISTRICTS' ? '' : value
                                        }))}
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Tất cả quận/huyện" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL_DISTRICTS">Tất cả quận/huyện</SelectItem>
                                            {selectedDistricts.map((district) => (
                                                <SelectItem key={district.name} value={district.name}>
                                                    {district.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                <Button type="button" onClick={addLocation} size="icon">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {formData.preferredLocations.map((location, index) => (
                                    <Badge key={index} variant="secondary" className="px-3 py-1">
                                        {getProvinceName(location.province)}
                                        {location.district && ` - ${location.district}`}
                                        <button
                                            onClick={() => removeLocation(index)}
                                            className="ml-2 hover:text-destructive"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {profile?.preferredLocations?.length > 0 ? (
                                profile.preferredLocations.map((location, index) => (
                                    <Badge key={index} variant="secondary" className="px-3 py-1">
                                        {getProvinceName(location.province)}
                                        {location.district && ` - ${location.district}`}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm">Chưa cập nhật địa điểm</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Expected Salary */}
                <div>
                    <Label className="text-base font-semibold mb-3 flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Mức lương mong muốn
                    </Label>

                    {isEditing ? (
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {SALARY_RANGES.map((range) => (
                                    <Button
                                        key={range.label}
                                        type="button"
                                        variant={
                                            formData.expectedSalary?.min === range.min &&
                                                formData.expectedSalary?.max === range.max
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => setSalaryRange(range)}
                                    >
                                        {range.label}
                                    </Button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="minSalary">Tối thiểu</Label>
                                    <Input
                                        id="minSalary"
                                        type="number"
                                        value={formData.expectedSalary?.min || 0}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            expectedSalary: { ...prev.expectedSalary, min: parseInt(e.target.value) || 0 }
                                        }))}
                                        placeholder="5000000"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatCurrency(formData.expectedSalary?.min || 0)}
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="maxSalary">Tối đa</Label>
                                    <Input
                                        id="maxSalary"
                                        type="number"
                                        value={formData.expectedSalary?.max || 0}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            expectedSalary: { ...prev.expectedSalary, max: parseInt(e.target.value) || 0 }
                                        }))}
                                        placeholder="20000000"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatCurrency(formData.expectedSalary?.max || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-foreground">
                            {profile?.expectedSalary?.min > 0 || profile?.expectedSalary?.max > 0 ? (
                                <>
                                    {formatCurrency(profile.expectedSalary.min)} - {formatCurrency(profile.expectedSalary.max)}
                                </>
                            ) : (
                                <span className="text-muted-foreground text-sm">Chưa cập nhật mức lương</span>
                            )}
                        </p>
                    )}
                </div>

                {/* Work Types */}
                <div>
                    <Label className="text-base font-semibold mb-3 flex items-center">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Hình thức làm việc
                    </Label>

                    {isEditing ? (
                        <div className="flex flex-wrap gap-2">
                            {WORK_TYPES.map((type) => (
                                <Button
                                    key={type.value}
                                    type="button"
                                    variant={
                                        formData.workPreferences?.workTypes?.includes(type.value)
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => toggleWorkType(type.value)}
                                >
                                    <span className="mr-2">{type.icon}</span>
                                    {type.label}
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {profile?.workPreferences?.workTypes?.length > 0 ? (
                                profile.workPreferences.workTypes.map((type) => {
                                    const workType = WORK_TYPES.find(t => t.value === type);
                                    return (
                                        <Badge key={type} variant="secondary" className="px-3 py-1">
                                            <span className="mr-1">{workType?.icon}</span>
                                            {workType?.label || type}
                                        </Badge>
                                    );
                                })
                            ) : (
                                <p className="text-muted-foreground text-sm">Chưa cập nhật hình thức làm việc</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Contract Types */}
                <div>
                    <Label className="text-base font-semibold mb-3">Loại hợp đồng</Label>

                    {isEditing ? (
                        <div className="flex flex-wrap gap-2">
                            {CONTRACT_TYPES.map((type) => (
                                <Button
                                    key={type.value}
                                    type="button"
                                    variant={
                                        formData.workPreferences?.contractTypes?.includes(type.value)
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => toggleContractType(type.value)}
                                >
                                    {type.label}
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {profile?.workPreferences?.contractTypes?.length > 0 ? (
                                profile.workPreferences.contractTypes.map((type) => {
                                    const contractType = CONTRACT_TYPES.find(t => t.value === type);
                                    return (
                                        <Badge key={type} variant="secondary" className="px-3 py-1">
                                            {contractType?.label || type}
                                        </Badge>
                                    );
                                })
                            ) : (
                                <p className="text-muted-foreground text-sm">Chưa cập nhật loại hợp đồng</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                {isEditing && (
                    <div className="flex gap-2 pt-4 border-t">
                        <Button onClick={handleSave} disabled={isUpdating}>
                            <Save className="w-4 h-4 mr-2" />
                            {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                        <Button variant="outline" onClick={handleCancel} disabled={isUpdating}>
                            <X className="w-4 h-4 mr-2" />
                            Hủy
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
