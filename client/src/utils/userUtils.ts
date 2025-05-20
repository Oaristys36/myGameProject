const charAllowed = /[a-zA-Z0-9éÉ_-]/;
const regexNumber = /[\d]/
const specialAllowed = /[!%-_=+]/;
const minCharUsername = 3;
const minCharPassword = 8;
const isValidEmails = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
const hasInjectionPattern = (input: string): boolean => {
  const injectionPattern = /[<>\/\\'"`;]|--|script|on\w+=|javascript:/gi;
  return injectionPattern.test(input);
};

export type ValidationResult = {
    success: boolean,
    message?: string,
    field?: string,
};

type Validator = () => ValidationResult;

export function isValidUsernameForRegister(input: string): ValidationResult {
    if(input.length < minCharUsername) return { success: false, message: `Le champ utilisateur doit contenir au moins ${minCharUsername} caractères.`, field: "newUsername"};
    if(!charAllowed.test(input)) return { success: false, message: "Utilisation de caractères non autorisés.", field: "newUsername"};
    return {success: true};
};

export function isValidPasswordForRegister(input: string): ValidationResult {
    if(input.length < minCharPassword) return { success: false, message: `Le champ mot de passe doit contenir au moins ${minCharPassword} caractères.`, field: "newPassword"};
    if(!/[A-Z]/.test(input)) return { success: false, message: "Le champ mot de passe doit contenir au moins 1 majuscule", field: "newPassword" };
    if(!/[a-z]/.test(input)) return { success: false, message: "Le champ mot de passe doit contenir au moins 1 minuscule", field: "newPassword" };
    if(!regexNumber.test(input)) return { success: false, message: "Le champ mot de passe doit contenir au moins 1 chiffre", field: "newPassword" };
    if(!specialAllowed.test(input)) return { success: false, message: "Le champ mot de passe doit contenir au moins 1 caractère spécial", field: "newPassword" };
    if(hasInjectionPattern(input)) return { success: false, message: "Utilisation de caractères non autorisés", field: "newPassword" };
    return { success: true};
};

export function isValidEmail(input: string): ValidationResult {
    if(input.length <= 0) return {success: false, message: `L'adresse e-mail est requise`, field: "email"};
    if(!isValidEmails(input)) return { success: false, message: `Format d'e-mail invalide, exemple: nehandertus@tribu.org`, field: "email"};
    if(hasInjectionPattern(input)) return {success: false, message: "l'adresse e-mail ne peut contenir que des caractères autorisés", field: "email"};
    return { success: true };
};

export function isValidUsernameForLogin(input: string): ValidationResult {
    if(input.length <= 0) return { success: false, message: "Veuillez entrer votre nom d'utilisateur."};
    if(!charAllowed.test(input)) return { success: false, message: "Utilisation de caractères non autorisés"};
    return { success: true };
};

export function isValidPasswordForLogin(input: string): ValidationResult {
    if(input.length <= 0) return { success: false, message: "Veuillez entrer votre mot de passe."};
    if(hasInjectionPattern(input)) return { success: false, message: "Utilisation de caractères non autorisés"};
    return {success: true};
};

export const getFieldColorStatus = (
    fields: Record<string, string>,
    validators: Record<string, (value: string) => boolean>
): {
    visualErrors: Record<string, "empty" | "invalid" | "valid">;
    hasEmptyField: boolean;  
    } => {
        const visualErrors: Record<string, "empty"  | "invalid" | "valid"> = {};
        let hasEmpty = false;

        for(const [key, value] of Object.entries(fields)) {
            const trimmed = value.trim();

            if(!trimmed) {
                visualErrors[key] = "empty";
                hasEmpty = true;
                continue;
            };

            const validator = validators[key];
            const isValid = validator ? validator(trimmed) : true;

            visualErrors[key] = isValid ? "valid" : "invalid";
        };
        return {
            visualErrors,
            hasEmptyField: hasEmpty,
        };
};

export function runValidators(validators: Validator[]) : ValidationResult {
    for (const validate of validators) {
        const result = validate();
        if(!result.success) return result;
    }
    return { success: true};
};





