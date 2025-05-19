import { useEffect} from "react";

const oneMinute = 60 * 1000;

function useAutoSessionCheck() {
    useEffect(() => {
        setTimeout(() => {
            verifierSession();
        },30 * oneMinute)
        
    }, []);
};

const verifierSession = () => {
    const token = localStorage.getItem("token");

    if(!token) {
        console.warn("Pas de token, redirection vers la page de connexion");
        window.location.href="/";
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expiration = payload.exp * 1000;
        const now = Date.now();

        if(now > expiration) {
            console.warn("Session expirée", "Déconnexion");
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            window.location.href="/";
        } else {
            console.log("Session valide. Bienvenue :", payload.username);
        }
    } catch(error) {
        console.error("Erreur lors du décodage du token", error);
        window.location.href="/";
    }
};

export {
    useAutoSessionCheck,
    verifierSession
};

