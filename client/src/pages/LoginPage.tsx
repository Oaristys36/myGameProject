import React, {useState} from "react";
import { isValidUsernameForLogin, isValidPasswordForLogin, runValidators, getFieldColorStatus } from "../../src/utils/userUtils";
import { GoldenButton, ShineLink, GoogleButton, AppleButton } from "../components/Buttons";
import { TopBar } from "../components/topBar";
import { InputField } from "../components/InputField";

type LoginResponse = {
    success: boolean;
    data?: {token: string; userId: string;};
    error?: {type: string; name: string; message: string;};
};

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{username?: boolean, password?: boolean}>({});
    const [submitted, setSubmitted] = useState(false);

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage(""); // Reset erreur 
        setSubmitted(true);

        const result = runValidators([
            () => isValidUsernameForLogin(username),
            () => isValidPasswordForLogin(password),
        ]);

        const fields = { username, password };
        const { visualErrors, hasEmptyField } = getFieldColorStatus(fields, {
            username: () => true,
            password: () => true,
        });

        if(hasEmptyField) {
            const fieldErrors = Object.fromEntries(
                Object.entries(visualErrors).map(([key, status]) => [key, status === "empty"])
            );
            setFieldErrors(fieldErrors);
            setErrorMessage("Veuillez remplir le(s) champ(s) manquant(s)");
            return;
        };

        if(result.success){
            setErrorMessage(result.message!);
            return;
        };
           
        try{
            const response = await fetch("http://localhost:3000/api/users/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ username, password }),
            });
            const data: LoginResponse = await response.json();

            if (!data.success){
                const msg = data.error?.message || "Erreur inconnue";
                setErrorMessage(msg);
                console.warn(`[${data.error?.type}] ${data.error?.name}: ${msg}`);
                return;
            };
            
            // Connexion réussie 

            localStorage.setItem("token", data.data!.token);
            localStorage.setItem("userId", data.data!.userId);
            window.location.href="/accueil";
        } catch (err) {
            console.error("Erreur réseau ou serveur :", err);
            setErrorMessage("Erreur réseau. Veuillez réessayer plus tard.");
          };
    };

    return(
        <div className="page-wrapper login">
            <video className="background-video login" autoPlay playsInline muted ref={(video) => {
    if (video) {
      video.play().catch((err) => {
        console.warn("Lecture refusée :", err);
      });
    }
  }}>
        <source src="/PaysanVideo.mp4" type="video/mp4"/> 
            Votre navigateur ne supporte pas les vidéos en arrière plan.
        </video>
        <div className="page-container login">
            <TopBar/>
            <h1 className="page-title login">MyGameProject</h1>
            <form className="form-panel login" onSubmit={handleLogin}>
                {errorMessage && (
                    <div className="error-message" style={{marginBottom: "0.2rem"}}>
                        {errorMessage}
                    </div>
                )}
                <InputField
                value={username}
                onChange={(e) => { 
                    setUsername(e.target.value);
                    setFieldErrors(prev => ({ ...prev, username: false}));
                }}
                className={submitted && fieldErrors.username ? 'input error-border' : 'input'}
                placeholder="Nom d'utilisateur"
                type="text"
                autoComplete="username"
                />
                <InputField
                type="password"
                value={password}
                onChange={(e) => { 
                    setPassword(e.target.value);
                    setFieldErrors(prev => ({ ...prev, password: false}));
                }}
                className={submitted && fieldErrors.password ? 'input error-border' : 'input'}
                placeholder="Mot de passe"
                autoComplete="current-password"
                />
                <div className="underform-menu login"><label>
                    <input type="checkbox"/>Se souvenir</label>
                    <ShineLink to="/RecoveryPage"> Mot de passe oublié ? </ShineLink>
                </div>
                <GoldenButton variant="login" type="submit"></GoldenButton>
                <p>Se connecter avec : </p>
                <div className="social-link login">
                    <GoogleButton/>
                    <AppleButton/>
                </div> 
                <div className="switch-page login">
                    <p className="login-newaccount">Pas de compte?{" "} 
                        <ShineLink to="/RegisterPage" >Créer</ShineLink> 
                    </p>
                </div>     
            </form>
            </div>
        </div>
    );
};

export default LoginPage;