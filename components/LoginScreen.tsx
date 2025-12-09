import React, { useState } from 'react';
import { Trophy, Eye, Zap, Lock, WifiOff } from 'lucide-react';
import type { Role } from '../types';
import { ADMIN_CREDENTIALS } from '../constants';
import { isFirebaseInitialized } from '../services/firebase';

interface LoginScreenProps {
    onLogin: (role: Role) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [mode, setMode] = useState<'selection' | 'adminForm'>('selection');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFirebaseInitialized) {
            setError('La conexión con la base de datos no está disponible.');
            return;
        }
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            onLogin('admin');
        } else {
            setError('Credenciales incorrectas');
        }
    };

    if (mode === 'adminForm') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
                 <div className="w-full max-w-sm">
                    <button onClick={() => setMode('selection')} className="text-slate-400 mb-6 flex items-center gap-2 hover:text-white">
                         ← Volver
                    </button>
                    <h2 className="text-3xl font-bold text-amber-400 mb-2">Acceso Admin</h2>
                    <p className="text-slate-400 mb-8">Ingresa tus credenciales de organizador.</p>
                    
                    <form onSubmit={handleAdminLogin} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Usuario</label>
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                                placeholder="Usuario"
                                disabled={!isFirebaseInitialized}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Contraseña</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                                placeholder="••••••••"
                                disabled={!isFirebaseInitialized}
                            />
                        </div>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        
                        <button type="submit" disabled={!isFirebaseInitialized} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-4 rounded-xl shadow-lg mt-4 transition disabled:opacity-50 disabled:cursor-not-allowed">
                            INGRESAR
                        </button>
                    </form>
                 </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 p-32 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>

            <div className="z-10 w-full max-w-sm text-center">
                <div className="flex justify-center mb-6">
                     <div className="bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-700">
                        <Trophy size={48} className="text-amber-400" />
                     </div>
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter mb-2">PADEL 3x9</h1>
                <p className="text-slate-400 mb-6">Gestiona y visualiza torneos en tiempo real.</p>

                {!isFirebaseInitialized && (
                    <div className="mb-6 bg-red-900/50 border border-red-500/50 p-3 rounded-xl flex items-center gap-3 text-red-300">
                        <WifiOff size={32} />
                        <div className="text-left text-sm">
                            <p className="font-bold">Sin conexión a la base de datos.</p>
                            <p className="text-xs">Los modos Admin y Espectador están desactivados.</p>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <button 
                        onClick={() => onLogin('spectator')}
                        disabled={!isFirebaseInitialized}
                        className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Eye className="text-blue-400 group-hover:scale-110 transition" />
                        ENTRAR COMO ESPECTADOR
                    </button>
                    
                    <button 
                        onClick={() => onLogin('simulator')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition group shadow-blue-800/50 shadow-md"
                    >
                        <Zap className="text-white group-hover:scale-110 transition" />
                        SIMULAR TORNEO
                    </button>

                    <div className="flex items-center gap-2 py-2">
                        <div className="h-px bg-slate-800 flex-1"></div>
                        <span className="text-slate-600 text-xs font-bold uppercase">ACCESO COMPLETO</span>
                        <div className="h-px bg-slate-800 flex-1"></div>
                    </div>

                    <button 
                        onClick={() => setMode('adminForm')}
                        disabled={!isFirebaseInitialized}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:to-amber-500 text-slate-900 font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Lock size={20} />
                        ACCESO ADMIN
                    </button>
                </div>
                
                <p className="mt-8 text-xs text-slate-600">v1.2.1 • Powered by Gemini AI</p>
            </div>
        </div>
    );
};

export default LoginScreen;
