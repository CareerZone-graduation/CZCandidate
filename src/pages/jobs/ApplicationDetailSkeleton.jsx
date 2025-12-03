import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const ApplicationDetailSkeleton = () => {
    return (
        <div className="container mx-auto px-4 py-6">
            <div className="max-w-5xl mx-auto">
                {/* Back Button Skeleton */}
                <Skeleton className="h-10 w-40 mb-4" />

                {/* Main Header Card Skeleton */}
                <Card className="mb-6 overflow-hidden border shadow-sm">
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                            {/* Company Logo & Job Info */}
                            <div className="flex items-start gap-4 flex-1">
                                <Skeleton className="h-20 w-20 rounded-full" />
                                <div className="flex-1 space-y-3">
                                    <Skeleton className="h-8 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-8 w-32 rounded-full" />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <Skeleton className="h-10 w-48" />
                                <Skeleton className="h-10 w-40" />
                            </div>
                        </div>
                    </div>

                    {/* Timeline Skeleton */}
                    <CardContent className="py-4 border-t">
                        <div className="flex flex-wrap gap-6">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-5 w-48" />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* CV Section Skeleton */}
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-6 w-24" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 border rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="h-12 w-12 rounded-xl" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-5 w-48" />
                                                <Skeleton className="h-4 w-64" />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Skeleton className="h-9 w-24" />
                                            <Skeleton className="h-9 w-24" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cover Letter Skeleton */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity History Skeleton */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-40" />
                            </CardHeader>
                            <CardContent>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-4 mb-6 last:mb-0">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-5 w-48" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Info Skeleton */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-4 w-56" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div className="space-y-1 flex-1">
                                            <Skeleton className="h-3 w-16" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Quick Actions Skeleton */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-40" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-px w-full my-4" />
                                <Skeleton className="h-4 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetailSkeleton;
