import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, BellOff, Plus, Edit3, Trash2, Search, Filter, 
  Clock, MapPin, DollarSign, Briefcase, Tag, Eye, EyeOff,
  AlertCircle, CheckCircle2, Calendar, Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { useJobNotifications } from './useJobNotifications';
import { CreateNotificationDialog } from './components/CreateNotificationDialog';
import { EditNotificationDialog } from './components/EditNotificationDialog';

const JobNotificationManager = () => {
  const navigate = useNavigate();
  const {
    notifications,
    isLoading,
    isSaving,
    isDeleting,
    error,
    totalItems,
    currentPage,
    totalPages,
    fetchNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    toggleNotification,
    handlePageChange,
    activeNotifications,
    hasNotifications,
    canCreateMore
  } = useJobNotifications();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = !searchTerm || 
      notification.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.keywords.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && notification.isActive) ||
      (filterStatus === 'inactive' && !notification.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleCreateNotification = async (notificationData) => {
    const success = await createNotification(notificationData);
    if (success) {
      setShowCreateDialog(false);
    }
    return success;
  };

  const handleUpdateNotification = async (updateData) => {
    if (!editingNotification) return false;
    
    const success = await updateNotification(editingNotification._id, updateData);
    if (success) {
      setEditingNotification(null);
    }
    return success;
  };

  const handleDeleteNotification = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thông báo "${name}"?`)) {
      await deleteNotification(id);
    }
  };

  const handleToggleNotification = async (id, isActive) => {
    await toggleNotification(id, !isActive);
  };

  // Format functions
  const formatFrequency = (frequency) => {
    const frequencyMap = {
      daily: 'Hàng ngày',
      weekly: 'Hàng tuần',
      immediate: 'Ngay lập tức'
    };
    return frequencyMap[frequency] || frequency;
  };

  const formatLastSent = (date) => {
    if (!date) return 'Chưa gửi';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  // Loading skeleton
  if (isLoading && !hasNotifications) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
                  Thông báo việc làm
                </h1>
                <p className="text-lg text-gray-600">
                  Quản lý các thông báo việc làm theo từ khóa và tiêu chí của bạn
                </p>
              </div>
              
              {canCreateMore && (
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Tạo thông báo mới
                </Button>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tổng thông báo</p>
                      <p className="text-3xl font-bold text-gray-900">{totalItems}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Bell className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                      <p className="text-3xl font-bold text-green-600">{activeNotifications.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tạm dừng</p>
                      <p className="text-3xl font-bold text-orange-600">{totalItems - activeNotifications.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <BellOff className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Search and Filter */}
          <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Tìm kiếm theo tên hoặc từ khóa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 bg-white/90 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400 rounded-xl"
                  />
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-48 h-12 bg-white/90 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400 rounded-xl">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-emerald-200">
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="inactive">Tạm dừng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Error State */}
          {error && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center text-red-700">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!hasNotifications && !isLoading && (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Bell className="h-16 w-16 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Chưa có thông báo nào
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Hãy tạo thông báo việc làm đầu tiên để nhận được cơ hội việc làm phù hợp với bạn.
              </p>
              {canCreateMore && (
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Tạo thông báo đầu tiên
                </Button>
              )}
            </div>
          )}

          {/* Notifications List */}
          {filteredNotifications.length > 0 && (
            <div className="space-y-6">
              {filteredNotifications.map((notification) => (
                <Card 
                  key={notification._id}
                  className={`group hover:shadow-xl transition-all duration-300 bg-white border-0 overflow-hidden ${
                    notification.isActive ? 'hover:-translate-y-1' : 'opacity-75'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                            {notification.name}
                          </h3>
                          <Badge 
                            variant={notification.isActive ? "default" : "secondary"}
                            className={`text-xs px-3 py-1 rounded-full ${
                              notification.isActive 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {notification.isActive ? 'Hoạt động' : 'Tạm dừng'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center text-gray-600 mb-3">
                          <Tag className="h-4 w-4 mr-2 text-emerald-500" />
                          <span className="font-medium">Từ khóa:</span>
                          <span className="ml-2">{notification.keywords}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          {notification.location && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-emerald-500" />
                              <span>{notification.location}</span>
                            </div>
                          )}
                          
                          {notification.category && (
                            <div className="flex items-center">
                              <Briefcase className="h-4 w-4 mr-2 text-emerald-500" />
                              <span>{notification.category}</span>
                            </div>
                          )}
                          
                          {notification.salaryRange && (
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-2 text-emerald-500" />
                              <span>{notification.salaryRange}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-emerald-500" />
                            <span>{formatFrequency(notification.frequency)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleNotification(notification._id, notification.isActive)}
                          className={`h-10 w-10 rounded-full transition-all duration-300 ${
                            notification.isActive 
                              ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {notification.isActive ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingNotification(notification)}
                          className="h-10 w-10 rounded-full text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all duration-300"
                        >
                          <Edit3 className="h-5 w-5" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteNotification(notification._id, notification.name)}
                          disabled={isDeleting.has(notification._id)}
                          className="h-10 w-10 rounded-full text-red-600 bg-red-50 hover:bg-red-100 transition-all duration-300"
                        >
                          {isDeleting.has(notification._id) ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Tạo: {new Date(notification.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Gửi lần cuối: {formatLastSent(notification.lastSent)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-12">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-6 h-12 border-emerald-200 bg-white/80 hover:bg-emerald-50 rounded-xl font-semibold"
              >
                Trước
              </Button>
              
              <div className="flex space-x-2">
                <span className="px-6 py-3 text-sm text-emerald-700 bg-emerald-100 border-2 border-emerald-200 rounded-xl font-bold">
                  {currentPage} / {totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-6 h-12 border-emerald-200 bg-white/80 hover:bg-emerald-50 rounded-xl font-semibold"
              >
                Sau
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      {showCreateDialog && (
        <CreateNotificationDialog
          onClose={() => setShowCreateDialog(false)}
          onSubmit={handleCreateNotification}
          isLoading={isSaving}
        />
      )}

      {/* Edit Dialog */}
      {editingNotification && (
        <EditNotificationDialog
          notification={editingNotification}
          onClose={() => setEditingNotification(null)}
          onSubmit={handleUpdateNotification}
          isLoading={isSaving}
        />
      )}
    </div>
  );
};

export default JobNotificationManager;