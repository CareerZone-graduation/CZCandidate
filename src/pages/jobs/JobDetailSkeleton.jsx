import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const JobDetailSkeleton = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-6 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Back Button Skeleton */}
                    <Skeleton className="h-10 w-24 mb-6" />

                    {/* Header Skeleton */}
                    <div className="mb-8">
                        <div className="bg-card rounded-xl shadow-sm border p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column (2/3 width) */}
                                <div className="lg:col-span-2 space-y-4">
                                    <Skeleton className="h-8 w-3/4" /> {/* Title */}
                                    <Skeleton className="h-6 w-1/2" /> {/* Company Name */}
                                    <Skeleton className="h-4 w-1/3" /> {/* Location */}

                                    {/* Salary */}
                                    <div className="flex items-center gap-2 mt-4">
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                        <Skeleton className="h-6 w-32" />
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex gap-3 mt-6">
                                        <Skeleton className="h-10 w-32" />
                                        <Skeleton className="h-10 w-32" />
                                        <Skeleton className="h-10 w-10" />
                                    </div>
                                </div>

                                {/* Right Column (1/3 width) - Company Info */}
                                <div className="lg:col-span-1">
                                    <div className="bg-muted/50 rounded-lg p-4 h-full border border-transparent">
                                        <div className="flex items-center gap-4 mb-4">
                                            <Skeleton className="w-14 h-14 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-5 w-3/4" />
                                                <Skeleton className="h-4 w-1/2" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-px w-full my-4" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Job Overview Skeleton */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <Skeleton className="h-7 w-48" />
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-6">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Skeleton className="w-10 h-10 rounded-full" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-20" />
                                                <Skeleton className="h-5 w-32" />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Job Description Skeleton */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <Skeleton className="h-7 w-40" />
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-4/5" />
                                </CardContent>
                            </Card>

                            {/* Requirements Skeleton */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <Skeleton className="h-7 w-40" />
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column (Sidebar) */}
                        <div className="lg:col-span-1">
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <Skeleton className="h-7 w-48" />
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="flex gap-3">
                                            <Skeleton className="w-10 h-10 rounded" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-3 w-2/3" />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetailSkeleton;
