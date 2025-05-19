import React from "react";
import { useAutoSessionCheck } from "../../src/utils/sessionUtils";
import { Link } from 'react-router-dom';

const MenusPage: React.FC = () => {
    
    useAutoSessionCheck();
    
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        <Link to="/LoginPage"></Link>;
    };

    return (
        <div className="menu-container">
            <div className="title-wrapper"><h1>monLivreJeu</h1></div>
            <div>
                <button> Nouvelle Partie </button>
                <button onClick={handleLogout}>Déconnexion</button>
            </div>
        </div>
    );
};

export default MenusPage;