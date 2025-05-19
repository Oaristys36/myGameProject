import React, { useState } from "react";
import { GoldenButton, ShineLink } from "../components/Buttons";
import { getFieldColorStatus, isValidEmail, runValidators } from "../utils/userUtils";
import { InputField } from "../components/InputField";
import { Footer } from "../components/Footer";

export const RecoveryPage: React.FC = () => {
    
    const [email, setEmail] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{email?: boolean}>({});
    const [submitted, setSubmitted] = useState(false);

    const handleRecovery = async (type: "password" | "username") => {
        setSuccessMessage("");
        setErrorMessage("");
        setSubmitted(true);

        const result = runValidators([
            () => isValidEmail(email),
        ]);

        const fields = { email };
                const { visualErrors, hasEmptyField } = getFieldColorStatus(fields, {
                    email: () => true,
                });

        if (hasEmptyField) {
            const fieldErrors = Object.fromEntries(
                Object.entries(visualErrors).map(([key, status]) => [key, status === "empty"])
            );
            setFieldErrors(fieldErrors);
            setErrorMessage(result.message!);
            return;
        };

        if(!result.success){
            if(result.field){
                setFieldErrors(prev => ({ ...prev, [result.field!]: true}))
            }
            setErrorMessage(result.message!);
            return;
        };

        try {
            const response = await fetch("http://localhost:3000/api/users/recovery", {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({ email, type}),
            });

            const data = await response.json();
            if(!data.success) {
                setErrorMessage(data.error?.message || "Une erreur est survenue.");
                return;
            };

            setSuccessMessage("Un e-mail de récupération vous a été envoyé.");
            setEmail("");
        } catch(err) {
            setErrorMessage("Erreur réseau, veuillez réessayer.");
        }
    };

    return(
        <div className="page-wrapper recovery-page">
            <div className="form-panel recovery-page">   
                <h1 className="page-title recovery">Vous n'avez pas encore perdu</h1>
                <InputField
                    type="email"
                    className={submitted && fieldErrors.email ? 'input error-border' : 'input recovery-email'}
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value.toLowerCase())
                        setFieldErrors(prev => ({...prev, email: false}))
                    }}
                    placeholder="nehendertus@tribut.org" 
                />
                    {errorMessage && <p className="error-text">{errorMessage}</p>}
                    {successMessage && <p className="success-text">{successMessage}</p>}
                    <p>Vous recevrez les instructions par e-mail pour récupérer votre : </p>
                <div className="recovery-buttons">
                    <GoldenButton variant="recovery-password" aria-label="Réinitialiser le mot de passe" onClick={() => handleRecovery("password")}></GoldenButton>
                    <p>ou votre</p>
                    <GoldenButton variant="recovery-username" aria-label="Récupérer son identifiant" onClick={() => handleRecovery("username")}></GoldenButton>
                </div> 
                    <div className="recovery-link"><ShineLink to="/">Se connecter</ShineLink></div>
            </div>
            <Footer/>
        </div>
    );
};