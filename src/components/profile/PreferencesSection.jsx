import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, MapPin, DollarSign, Edit3, Save, X, Plus, Trash2, Briefcase, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import locationData from '@/data/oldtree.json';
import { JOB_CATEGORIES, getCategoryLabel, getCategoryIcon } from '@/constants/jobCategories';

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

const EXPERIENCE_LEVELS = [
    { value: 'NO_EXPERIENCE', label: 'Chưa có kinh nghiệm' },
    { value: 'INTERN', label: 'Thực tập sinh' },
    { value: 'FRESHER', label: 'Mới ra trường' },
    { value: 'ENTRY_LEVEL', label: 'Mới đi làm' },
    { value: 'MID_LEVEL', label: 'Trung cấp' },
    { value: 'SENIOR_LEVEL', label: 'Cao cấp' },
    { value: 'EXECUTIVE', label: 'Quản lý/Điều hành' }
];

const DistrictSelector = ({ province, value, onChange }) => {
    const [open, setOpen] = useState(false);

    // In PreferencesSection, DISTRICT_MAP returns the array directly
    const districts = DISTRICT_MAP.get(province) || [];

    const selectedValue = value === 'ALL_DISTRICTS' || value === '' ? null : value;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    <span className="truncate">
                        {selectedValue || "Tất cả quận/huyện"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Tìm quận/huyện..." />
                    <CommandList>
                        <CommandEmpty>Không tìm thấy quận/huyện.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value="ALL_DISTRICTS"
                                onSelect={() => {
                                    onChange('ALL_DISTRICTS');
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        !selectedValue ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                Tất cả quận/huyện
                            </CommandItem>
                            {districts.map((district) => (
                                <CommandItem
                                    key={district.name}
                                    value={district.name}
                                    onSelect={(currentValue) => {
                                        // Use the original name to ensure casing matches if needed,
                                        // though district.name is usually what we want.
                                        onChange(district.name);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedValue === district.name ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {district.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export const PreferencesSection = ({ profile, onUpdate }) => {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [openProvince, setOpenProvince] = useState(false);

    const normalizeWorkPreferences = (prefs) => ({
        workTypes: prefs?.workTypes || [],
        contractTypes: prefs?.contractTypes || [],
        experienceLevel: Array.isArray(prefs?.experienceLevel)
            ? prefs.experienceLevel
            : (prefs?.experienceLevel ? [prefs.experienceLevel] : [])
    });

    const [formData, setFormData] = useState({
        preferredLocations: profile?.preferredLocations || [],
        expectedSalary: profile?.expectedSalary || { min: 0, max: 0, currency: 'VND' },
        workPreferences: normalizeWorkPreferences(profile?.workPreferences),
        preferredCategories: profile?.preferredCategories || []
    });

    const [newLocation, setNewLocation] = useState({ province: '', district: '' });

    // Sync formData with profile when not editing
    useEffect(() => {
        if (!isEditing && profile) {
            setFormData({
                preferredLocations: profile?.preferredLocations || [],
                expectedSalary: profile?.expectedSalary || { min: 0, max: 0, currency: 'VND' },
                workPreferences: normalizeWorkPreferences(profile?.workPreferences),
                preferredCategories: profile?.preferredCategories || []
            });
        }
    }, [profile, isEditing]);

    const handleEdit = () => {
        setFormData({
            preferredLocations: profile?.preferredLocations || [],
            expectedSalary: profile?.expectedSalary || { min: 0, max: 0, currency: 'VND' },
            workPreferences: normalizeWorkPreferences(profile?.workPreferences),
            preferredCategories: profile?.preferredCategories || []
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
            console.log('Saving preferences:', formData);
            await onUpdate(formData);

            // Invalidate related queries to refresh recommendations and completeness
            queryClient.invalidateQueries({ queryKey: ['myProfile'] });
            queryClient.invalidateQueries({ queryKey: ['jobRecommendations'] });
            queryClient.invalidateQueries({ queryKey: ['profileCompleteness'] });

            setIsEditing(false);
            toast.success('Cập nhật thông tin thành công');
        } catch (error) {
            console.error('Update error:', error);
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

        // Normalize district: empty string → null
        const normalizedDistrict = newLocation.district || null;

        const exists = formData.preferredLocations.some(
            loc => loc.province === newLocation.province && (loc.district || null) === normalizedDistrict
        );

        if (exists) {
            toast.error('Địa điểm này đã được thêm');
            return;
        }

        const newLocationData = {
            province: newLocation.province,
            district: normalizedDistrict
        };

        console.log('Adding location:', newLocationData);

        setFormData(prev => {
            const updated = {
                ...prev,
                preferredLocations: [...prev.preferredLocations, newLocationData]
            };
            console.log('Updated formData:', updated);
            return updated;
        });

        setNewLocation({ province: '', district: '' });
        toast.success('Đã thêm địa điểm');
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

    const toggleCategory = (categoryValue) => {
        setFormData(prev => {
            const categories = prev.preferredCategories || [];
            const newCategories = categories.includes(categoryValue)
                ? categories.filter(c => c !== categoryValue)
                : [...categories, categoryValue];

            return { ...prev, preferredCategories: newCategories };
        });
    };

    const getProvinceName = (provinceName) => {
        return provinceName;
    };



    return (
        <Card className="card-hover">
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
                {/* Preferred Categories */}
                <div>
                    <Label className="text-base font-semibold mb-3 flex items-center">
                        <Layers className="w-4 h-4 mr-2" />
                        Ngành nghề quan tâm
                    </Label>

                    {isEditing ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {JOB_CATEGORIES.map((category) => (
                                    <Button
                                        key={category.value}
                                        type="button"
                                        variant={
                                            formData.preferredCategories?.includes(category.value)
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => toggleCategory(category.value)}
                                        className="justify-start h-auto py-2 px-3"
                                    >
                                        <span className="mr-2 text-lg">{getCategoryIcon(category.value)}</span>
                                        <span className="text-xs">{category.label}</span>
                                    </Button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Đã chọn: {formData.preferredCategories?.length || 0} ngành nghề
                                {formData.preferredCategories?.length > 0 &&
                                    formData.preferredCategories.length < 1 &&
                                    ' (Tối thiểu 1 ngành nghề)'}
                                {formData.preferredCategories?.length > 5 &&
                                    ' (Tối đa 5 ngành nghề)'}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {profile?.preferredCategories?.length > 0 ? (
                                profile.preferredCategories.map((category) => (
                                    <Badge key={category} variant="secondary" className="px-3 py-1">
                                        <span className="mr-1">{getCategoryIcon(category)}</span>
                                        {getCategoryLabel(category)}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm">Chưa cập nhật ngành nghề</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Preferred Locations */}
                <div>
                    <Label className="text-base font-semibold mb-3 flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Địa điểm làm việc mong muốn
                    </Label>

                    {isEditing ? (
                        <div className="space-y-3">
                            <div className="flex gap-2">

                                {/* Province Selector */}
                                <div className="flex-1">
                                    <Popover open={openProvince} onOpenChange={setOpenProvince}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openProvince}
                                                className="w-full justify-between font-normal"
                                            >
                                                <span className="truncate">
                                                    {newLocation.province || "Chọn tỉnh/thành phố"}
                                                </span>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[280px] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Tìm tỉnh/thành phố..." />
                                                <CommandList>
                                                    <CommandEmpty>Không tìm thấy.</CommandEmpty>
                                                    <CommandGroup>
                                                        {PROVINCES.map((province) => (
                                                            <CommandItem
                                                                key={province.name}
                                                                value={province.name}
                                                                onSelect={(currentValue) => {
                                                                    setNewLocation(prev => ({ province: province.name, district: '' }));
                                                                    setOpenProvince(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        newLocation.province === province.name ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {province.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {newLocation.province && (
                                    <div className="flex-1">
                                        <DistrictSelector
                                            province={newLocation.province}
                                            value={newLocation.district || 'ALL_DISTRICTS'}
                                            onChange={(value) => setNewLocation(prev => ({
                                                ...prev,
                                                district: value === 'ALL_DISTRICTS' ? '' : value
                                            }))}
                                        />
                                    </div>
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

                {/* Experience Level */}
                <div>
                    <Label className="text-base font-semibold mb-3">Mức độ kinh nghiệm</Label>
                    {isEditing ? (
                        <div className="flex flex-wrap gap-2">
                            {EXPERIENCE_LEVELS.map((level) => (
                                <Button
                                    key={level.value}
                                    type="button"
                                    variant={
                                        (Array.isArray(formData.workPreferences?.experienceLevel)
                                            ? formData.workPreferences.experienceLevel
                                            : [formData.workPreferences?.experienceLevel])
                                            .includes(level.value)
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => {
                                        setFormData(prev => {
                                            const currentLevels = Array.isArray(prev.workPreferences?.experienceLevel)
                                                ? prev.workPreferences.experienceLevel
                                                : [prev.workPreferences?.experienceLevel].filter(Boolean);

                                            const newLevels = currentLevels.includes(level.value)
                                                ? currentLevels.filter(l => l !== level.value)
                                                : [...currentLevels, level.value];

                                            return {
                                                ...prev,
                                                workPreferences: { ...prev.workPreferences, experienceLevel: newLevels }
                                            };
                                        });
                                    }}
                                >
                                    {level.label}
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {profile?.workPreferences?.experienceLevel && (Array.isArray(profile.workPreferences.experienceLevel)
                                ? profile.workPreferences.experienceLevel
                                : [profile.workPreferences.experienceLevel]
                            ).length > 0 ? (
                                (Array.isArray(profile.workPreferences.experienceLevel)
                                    ? profile.workPreferences.experienceLevel
                                    : [profile.workPreferences.experienceLevel]
                                ).map((val) => (
                                    <Badge key={val} variant="secondary" className="px-3 py-1">
                                        {EXPERIENCE_LEVELS.find(level => level.value === val)?.label || val}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm">Chưa cập nhật mức độ kinh nghiệm</p>
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
