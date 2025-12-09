
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTournamentData } from './hooks/useTournamentData';
import type { Role, Tab } from './types';

import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import AddPlayersTab from './components/tabs/AddPlayersTab';
import TournamentTab from './components/tabs/TournamentTab';
import ClassificationTab from './components/tabs/ClassificationTab';
import RankingTab from './components/tabs/RankingTab';
import ConfirmationModal from './components/ConfirmationModal';
import PasswordModal from './components/PasswordModal';
import Loader from './components/ui/Loader';

const App: React.FC = () => {
    const { user, role, loading: authLoading, login, logout } = useAuth();
    const { 
        players, 
        currentState, 
        history, 
        mutations, 
        isSimulating, 
        loading: dataLoading 
    } = useTournamentData(role, user);
    
    const [activeTab, setActiveTab] = useState<Tab>('torneo');

    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        message: '',
        onConfirm: () => {}
    });

    const [passwordConfirmState, setPasswordConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    const openConfirm = useCallback((message: string, onConfirm: () => void) => {
        setConfirmState({ isOpen: true, message, onConfirm });
    }, []);

    const closeConfirm = useCallback(() => {
        setConfirmState({ isOpen: false, message: '', onConfirm: () => {} });
    }, []);

    const openPasswordConfirm = useCallback((title: string, message: string, onConfirm: () => void) => {
        setPasswordConfirmState({ isOpen: true, title, message, onConfirm });
    }, []);

    const closePasswordConfirm = useCallback(() => {
        setPasswordConfirmState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    }, []);

    const handleLogin = (selectedRole: Role) => {
        login(selectedRole).then(() => {
            if (selectedRole === 'spectator' || selectedRole === 'simulator') {
                setActiveTab('torneo');
            } else {
                setActiveTab('agregar');
            }
        });
    };

    useEffect(() => {
      if (role === 'simulator' && activeTab === 'ranking') {
          setActiveTab('torneo');
      }
    }, [role, activeTab]);

    if (authLoading) {
        return <Loader message="CARGANDO..." />;
    }

    if (!role) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    const isAdmin = role === 'admin';
    const isRankingVisible = !isSimulating;
    
    const renderContent = () => {
        if (dataLoading && role !== 'simulator') {
            return <div className="flex-1 flex items-center justify-center"><Loader message="CARGANDO DATOS..." /></div>;
        }

        switch (activeTab) {
            case 'agregar':
                return (isAdmin || isSimulating) ? (
                    <AddPlayersTab
                        players={players}
                        mutations={mutations}
                        isSimulating={isSimulating}
                        openConfirm={openConfirm}
                        setActiveTab={setActiveTab}
                    />
                ) : null;
            case 'torneo':
                return (
                    <TournamentTab
                        currentState={currentState}
                        mutations={mutations}
                        setActiveTab={setActiveTab}
                        isAdmin={isAdmin}
                        isSimulating={isSimulating}
                    />
                );
            case 'live':
                return (
                    <ClassificationTab
                        currentState={currentState}
                        mutations={mutations}
                        setActiveTab={setActiveTab}
                        isAdmin={isAdmin}
                        isSimulating={isSimulating}
                        openConfirm={openConfirm}
                    />
                );
            case 'ranking':
                return isRankingVisible ? (
                    <RankingTab
                        history={history}
                        isAdmin={isAdmin}
                        mutations={mutations}
                        openPasswordConfirm={openPasswordConfirm}
                    />
                ) : null;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans max-w-md mx-auto relative border-x border-slate-200">
            <Header role={role} onLogout={logout} isTournamentActive={!!currentState?.active} />
            
            <div className="flex-1 overflow-y-auto -mt-4 pt-4">
                {renderContent()}
            </div>

            <BottomNav 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                isAdmin={isAdmin} 
                isSimulating={isSimulating} 
            />

            <ConfirmationModal
                isOpen={confirmState.isOpen}
                message={confirmState.message}
                onConfirm={() => {
                    confirmState.onConfirm();
                    closeConfirm();
                }}
                onCancel={closeConfirm}
            />

            <PasswordModal
                isOpen={passwordConfirmState.isOpen}
                title={passwordConfirmState.title}
                message={passwordConfirmState.message}
                onConfirm={() => {
                    mutations.deleteHistory().then(() => {
                        closePasswordConfirm();
                    });
                }}
                onCancel={closePasswordConfirm}
            />
        </div>
    );
};

export default App;
