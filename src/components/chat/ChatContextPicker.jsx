import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Paperclip, Briefcase, Building2, Calendar } from 'lucide-react';
import { getMyApplications } from '@/services/jobService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ChatContextPicker = ({ onSelect, children, recipientId }) => {
    const [isOpen, setIsOpen] = useState(false);

    const { data: applicationsData, isLoading } = useQuery({
        queryKey: ['my-applications', { limit: 50 }],
        queryFn: () => getMyApplications({ limit: 50 }),
        enabled: isOpen,
    });

    const applications = applicationsData?.data || [];

    const filteredApplications = applications.filter(app => {
        if (!recipientId) return true;
        // Ensure jobId is populated and has recruiterProfileId
        const recruiterUserId = app.jobId?.recruiterProfileId?.userId;
        return String(recruiterUserId) === String(recipientId);
    });

    const handleSelect = (app) => {
        const contextData = {
            type: 'APPLICATION',
            contextId: app._id,
            title: app.jobId.title,
            data: {
                jobId: app.jobId._id,
                status: app.status,
                appliedAt: app.appliedAt
            }
        };
        onSelect(contextData);
        setIsOpen(false);
    };


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Paperclip className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Đính kèm đơn ứng tuyển</DialogTitle>
                </DialogHeader>

                <ScrollArea className="h-[300px] pr-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredApplications.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Bạn chưa có đơn ứng tuyển nào.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredApplications.map((app) => (
                                <div
                                    key={app._id}
                                    className="p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                                    onClick={() => handleSelect(app)}
                                >
                                    <div className="font-medium text-sm mb-2 line-clamp-1">
                                        {app.jobId.title}
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(app.appliedAt), 'dd/MM/yyyy', { locale: vi })}
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium text-[10px]">
                                            {app.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default ChatContextPicker;
