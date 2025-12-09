
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
    message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
        <Loader2 className="animate-spin text-amber-500" size={48} />
        <span className="text-slate-400 font-bold tracking-widest text-sm">{message}</span>
    </div>
);

export default Loader;
