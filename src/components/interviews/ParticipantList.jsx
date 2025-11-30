import React from 'react';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const ParticipantItem = ({ name, isLocal, isMuted, isCameraOff, isActiveSpeaker }) => {
    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-all duration-200 group">
            <div className="flex items-center gap-3">
                <div className={cn(
                    "relative rounded-full p-0.5 transition-all duration-300",
                    isActiveSpeaker ? "bg-gradient-to-tr from-green-400 to-emerald-600 shadow-lg shadow-green-500/20" : "bg-transparent"
                )}>
                    <Avatar className="h-9 w-9 border border-white/10">
                        <AvatarImage src="" /> {/* Add avatar URL support later */}
                        <AvatarFallback className="bg-gradient-to-br from-zinc-700 to-zinc-900 text-xs font-bold text-zinc-300">
                            {getInitials(name)}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                        {name}
                        {isLocal && <span className="text-zinc-500 ml-1 font-normal text-xs">(Bạn)</span>}
                    </span>
                    <span className={cn(
                        "text-[10px] font-medium transition-colors",
                        isActiveSpeaker ? "text-green-400" : "text-zinc-500"
                    )}>
                        {isActiveSpeaker ? 'Đang nói...' : isLocal ? 'Đang tham gia' : 'Khách mời'}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1.5">
                {isMuted ? (
                    <div className="p-1.5 rounded-full bg-red-500/10 text-red-400">
                        <MicOff className="h-3.5 w-3.5" />
                    </div>
                ) : (
                    <div className="p-1.5 rounded-full bg-white/5 text-zinc-400">
                        <Mic className="h-3.5 w-3.5" />
                    </div>
                )}
                {isCameraOff ? (
                    <div className="p-1.5 rounded-full bg-red-500/10 text-red-400">
                        <VideoOff className="h-3.5 w-3.5" />
                    </div>
                ) : (
                    <div className="p-1.5 rounded-full bg-white/5 text-zinc-400">
                        <Video className="h-3.5 w-3.5" />
                    </div>
                )}
            </div>
        </div>
    );
};

const ParticipantList = ({ participants, onClose }) => {
    return (
        <div className="flex flex-col h-full bg-black/40 backdrop-blur-xl border-l border-white/10 w-80 shadow-2xl">
            <div className="p-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <h3 className="text-white font-medium tracking-wide">Người tham gia <span className="text-zinc-500 text-sm ml-1">({participants.length})</span></h3>
                {/* Close button if needed, or rely on parent toggle */}
            </div>

            <ScrollArea className="flex-1 p-3 custom-scrollbar">
                <div className="space-y-1">
                    {participants.map((p) => (
                        <ParticipantItem
                            key={p.id}
                            name={p.name}
                            isLocal={p.isLocal}
                            isMuted={p.isMuted}
                            isCameraOff={p.isCameraOff}
                            isActiveSpeaker={p.isActiveSpeaker}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};

export default ParticipantList;
