import {useState} from "react";
import { isValidUsernameForRegister, isValidPasswordForRegister, runValidators, isValidEmail, getFieldColorStatus } from "../../src/utils/userUtils";
import { GoldenButton, ShineLink } from "../components/Buttons";
import { InputField } from "../components/InputField";

type RegisterResponse = {
    success: boolean; 
    data?: { userId: string};
    error?: {type: string; name: string; message: string};
};

const RegisterPage:  React.FC = () => {
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newMail, setNewMail] = useState("");
    const [confirmePassword, setConfirmePassword] = useState(""); 
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{newUsername?: boolean, newPassword?: boolean, confirmePassword?: boolean, newMail?: boolean}>({});
    const [submitted, setSubmitted] = useState(false);

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");
        setSubmitted(true);

        const result = runValidators([
            () => isValidUsernameForRegister(newUsername),
            () => isValidPasswordForRegister(newPassword),
            () => isValidPasswordForRegister(confirmePassword),
            () => isValidEmail(newMail),
        ]);

        const field = { newUsername, newPassword, confirmePassword, newMail };
        const  { visualErrors, hasEmptyField } = getFieldColorStatus(field, {
            newUsername : () => true,
            newPassword : () => true,
            confirmePassword : () => true,
            newMail : () => true,
        });

        if(hasEmptyField){
            const fieldErrors = Object.fromEntries(
                Object.entries(visualErrors).map(([key, status]) => [key, status === "empty"])
            );
            setFieldErrors(fieldErrors);
            setErrorMessage("Veuillez remplir le(s) champ(s) manquant(s)");
            return;
        };

        if(!result.success){
            if(result.field) {
                setFieldErrors(prev => ({ ...prev, [result.field!]: true}));
            }
            setErrorMessage(result.message!);
            return;
        };

        if(confirmePassword !== newPassword){
            setErrorMessage("Les champs Mots de passes doivent être identiques");
            return;
        };

        try {
            const response = await fetch("http://localhost:3000/api/users/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ username: newUsername, password: newPassword}),
            }); 
            const data : RegisterResponse = await response.json();
            
            if (!data.success) {
                const msg = data.error?.message || "Erreur inconnue";
                setErrorMessage(msg);
                console.warn(`[${data.error?.type}] ${data.error?.name} : ${msg}`);
                return;
            }

            //Inscription réussie 

            setSuccessMessage("Inscription réussie ! Vous pouvez maintenant vous connecter.");
            setNewUsername("");
            setNewPassword("");

            // Ajouter le successMessage pour les utilisateurs

            setTimeout(() => {
                window.location.href="/";
            }, 3000);
        } catch (err) {
            console.error("Erreur réseau ou serveur : ", err);
            setErrorMessage("Erreur réseau. Veuillez réessayer plus tard.");
        }
    };

    return (
        <div className="page-wrapper inscription-page">
            <form className="form-panel register" onSubmit={handleRegister}>
            <h1>Inscription</h1>
                {errorMessage && (
                <div className="error-message" style={{ marginBottom: "0.2rem"}}>
                    {errorMessage}
                </div>
                )}
                <InputField 
                type="text"
                className={submitted && fieldErrors.newUsername ? 'input error-border' : 'input'} 
                autoCapitalize="none" 
                autoCorrect="off" 
                value={newUsername} 
                onChange={(e) => {
                    setNewUsername(e.target.value);
                    setFieldErrors(prev => ({ ...prev, newUsername: false}))
                }}
                placeholder="Nom d'utilisateur"/>
                <InputField
                type="email" 
                className={submitted && fieldErrors.newMail ? "input error-border" : "input"} 
                autoCapitalize="none"  
                autoCorrect="off" 
                value={newMail} 
                onChange={(e) =>{ 
                    setNewMail(e.target.value.toLowerCase())
                    setFieldErrors(prev => ({ ...prev, newMail: false}))
                }}
                placeholder="nehendertus@tribut.org"/>
                <InputField
                type="password"  
                className={submitted && fieldErrors.newPassword ? "input error-border" : "input"}
                autoCapitalize="none" 
                autoCorrect="off" 
                value={newPassword} 
                onChange={(e) => {
                    setNewPassword(e.target.value)
                    setFieldErrors(prev => ({ ...prev, newPassword : false}))
                }}
                placeholder="Mot de passe" />
                <InputField
                type="password" 
                className={submitted && fieldErrors.confirmePassword ? "input error-border" : "input"}
                autoCapitalize="none" 
                autoCorrect="off" 
                value={confirmePassword} 
                onChange={(e) => {
                    setConfirmePassword(e.target.value)
                    setFieldErrors(prev => ({ ...prev, confirmePassword : false}))
                }}
                placeholder="Confirmer Mot de passe"/>
                <GoldenButton variant="register" type="submit"></GoldenButton>
                <div className="register-submit">
                <ShineLink to="/">Se connecter</ShineLink>
                </div>
            </form>
            {successMessage && (
                <div className="success-message" style={{ color:"green", marginTop: "1rem"}}>
                    {successMessage}
                </div>
             )}
        </div>
    );
};

export default RegisterPage;
