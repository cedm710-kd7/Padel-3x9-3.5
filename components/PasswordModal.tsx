
import React, { useState } from 'react';
import { Key } from 'lucide-react';
import { ADMIN_CREDENTIALS } from '../constants';

interface PasswordModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (password === ADMIN_CREDENTIALS.password) {
            setError('');
            onConfirm();
            setPassword('');
        } else {
            setError('Contraseña incorrecta.');
        }
    };
    
    const handleCancel = () => {
        onCancel();
        setPassword('');
        setError('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full transform transition-all scale-100 opacity-100">
                <div className="p-6">
                    <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <Key size={24} /> {title}
                    </h3>
                    <p className="text-slate-700 mb-4">{message}</p>
                    
                    <input 
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        placeholder="Introduce la contraseña de administrador"
                        className="w-full p-3 mb-4 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                    />

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-4 py-2 text-sm font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition shadow-md"
                        >
                            Verificar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasswordModal;
