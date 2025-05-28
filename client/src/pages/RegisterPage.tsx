import {useState, useRef, useEffect } from "react";
import { isValidUsernameForRegister, isValidPasswordForRegister, runValidators, isValidEmail, getFieldColorStatus } from "../../src/utils/userUtils";
import { GoldenButton, ShineLink } from "../components/Buttons";
import { CheckboxField, InputField } from "../components/InputField";
import { Footer } from "../components/Footer";
import { TopBar } from "../components/topBar";
import { Mazarin } from "../Mazarin/Mazarin";
import { useEmailSuffixSuggestion } from "../Mazarin/utils/emailsFunctions";

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
    const [acceptCGU, setAcceptCGU] = useState(false);;
    const usernameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const cguRef = useRef<HTMLInputElement>(null);
    const {suggestion, correction, clearCorrection} = useEmailSuffixSuggestion(newMail);
    const atIndex = newMail.indexOf("@");
    const base = atIndex !== -1 ? newMail.slice(0, atIndex + 1) : newMail;
    const suffixTyped = atIndex !== -1 ? newMail.slice(atIndex + 1) : '' ;
    const suggestionText = suggestion?.slice(suffixTyped.length) || '';

    const steps = [
        {
            targetRef: usernameRef,
            message: "Votre identifiant doit contenir au moins 3 caractères. Il sera utilisé pour vous connecter.",
            validate: () => {
                const el = usernameRef.current as HTMLInputElement | null;
                return !!el?.value.trim();
            }
        },
        {
            targetRef: emailRef,
            message: "L'adresse email permet de retrouver votre compte en cas de perte.",
            validate: () => {
                const el = emailRef.current as HTMLInputElement | null;
                return !!el?.value.trim();
            }
        },
        {
            targetRef: passwordRef,
            message: "Choisissez un mot de passe fort avec lettres, chiffres, et symboles si possible.",
            validate: () => {
                const el = passwordRef.current as HTMLInputElement | null;
                return !!el?.value.trim();
            }
        },
        {
            targetRef: cguRef,
            message: "Il est conseillé de la lire... Mais surtout, la valider.",
            validate: () => {
                const el = cguRef.current as HTMLInputElement | null;
                return !!el?.value.trim();
            }            
        }
    ];
    
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

        useEffect(() => {
        if (correction && newMail === base + correction) {
            clearCorrection();
        }
        }, [newMail, correction]);
    };

    return (
        <div className="page-wrapper inscription-page">
                <TopBar/>
                <Mazarin steps={steps} onFinish={() => {/* désactive le focus guide ici */}} />  
            <form className="form-panel register" onSubmit={handleRegister}>
            <h1 className="page-title register">Inscription</h1>
                {errorMessage && (
                <div className="error-message" style={{ marginBottom: "0.2rem"}}>
                    {errorMessage}
                </div>
                )}
                <InputField
                ref={usernameRef} 
                type="text"
                className={submitted && fieldErrors.newUsername ? 'input error-border' : 'input'} 
                autoCapitalize="none" 
                autoCorrect="off" 
                value={newUsername} 
                onChange={(e) => {
                    setNewUsername(e.target.value);
                    setFieldErrors(prev => ({ ...prev, newUsername: false}))
                }}
                minLength={3}
                maxLength={24}
                placeholder="Nom d'utilisateur"/>
                    <InputField
                    ref={emailRef}
                    type="email" 
                    className={submitted && fieldErrors.newMail ? "input error-border" : "register-input"}
                    value={newMail} 
                    onChange={(e) =>{ 
                        const val = e.target.value.toLowerCase();
                        setNewMail(val);
                        setFieldErrors(prev => ({ ...prev, newMail: false}));
                        clearCorrection();
                    }}
                    minLength={3}
                    maxLength={24}
                    placeholder="nehendertus@tribut.org"
                    autoCapitalize="none"  
                    autoCorrect="off" 
                    autoComplete="off" 
                    onKeyDown={(e) => {
                        if ((e.key === "Tab" || e.key === "Enter") && suggestionText && !correction) {
                            e.preventDefault();
                            setNewMail(base + suffixTyped + suggestionText);
                            clearCorrection();
                        } else if ((e.key === "Tab" || e.key === "Enter") && correction && !suggestionText) {
                            e.preventDefault();
                            clearCorrection();
                        } else if (e.key === "Escape") {
                            setNewMail(base + suffixTyped); 
                            clearCorrection();
                        }
                    }}   
                    >
                    {suggestionText && (
                        <div className="email-suggestion-overlay">
                            {base}
                            <span className="typed">{suffixTyped}</span>
                            <span className="suggested">{suggestionText}</span>
                        </div>
                    )}
                    {correction && (
                          <div className="register-correction-overlay">
                            <span className="overlay-gray">
                            {base}
                            <span className="typed">{correction}</span>
                            </span>
                        </div>
                    )}   
                    </InputField>
                <InputField
                ref={passwordRef}
                type="password"  
                className={submitted && fieldErrors.newPassword ? "input error-border" : "input"}
                autoCapitalize="none" 
                autoCorrect="off" 
                value={newPassword} 
                onChange={(e) => {
                    setNewPassword(e.target.value)
                    setFieldErrors(prev => ({ ...prev, newPassword : false}))
                }}
                minLength={8}
                maxLength={24}
                placeholder="Mot de passe"/>
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
                minLength={8}
                maxLength={24}
                placeholder="Confirmer Mot de passe"/>
                <div className="underform-menu register">
                    <CheckboxField
                    checked={acceptCGU}
                    ref={cguRef} 
                    onChange={(e) => setAcceptCGU(e.target.checked)}
                    label="J'accepte les CGU"
                    className="acceptCGU"
                    />
                </div>
                    <GoldenButton className="register-submit" variant="register" type="submit"/>

                <div className="switch-page register">
                    <ShineLink to="/">Se connecter</ShineLink>
                </div>
            </form>
            {successMessage && (
                <div className="success-message" style={{ color:"green", marginTop: "1rem"}}>
                    {successMessage}
                </div>
             )}
             <Footer/>
        </div>
)};

export default RegisterPage;
