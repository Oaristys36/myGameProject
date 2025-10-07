import { useState } from 'react';
import { SignInForm } from '../components/SignInForm';
import { SignUpForm } from '../components/SignUpForm';

export function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(false);

  return (
    <div className="min-h-screen auth-gradient">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 md:grid-cols-2">
        {/* Panneau branding */}
        <div className="relative hidden md:flex flex-col justify-center p-12 overflow-hidden">
          <div className="absolute inset-0 opacity-20" aria-hidden>
            <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-brand-600 blur-3xl" />
            <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-emerald-400 blur-3xl" />
          </div>
          <div className="relative z-10 max-w-md">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white font-bold shadow-lg">ST</div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">StoryTelling With Choice</h1>
            <p className="mt-4 text-gray-600">
              Créez des histoires interactives, suivez vos progrès et partagez vos choix. Rejoignez la communauté.
            </p>
          </div>
        </div>

        {/* Panneau formulaire */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="auth-card">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {isSignIn ? 'Connexion' : 'Créer un compte'}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {isSignIn ? 'Ravi de vous revoir.' : 'Rejoignez-nous en quelques secondes.'}
                </p>
              </div>

              {isSignIn ? <SignInForm /> : <SignUpForm />}

              <div className="mt-6 text-center text-sm">
                <button
                  onClick={() => setIsSignIn(!isSignIn)}
                  className="link"
                >
                  {isSignIn 
                    ? "Pas encore de compte ? S'inscrire" 
                    : "Déjà un compte ? Se connecter"}
                </button>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              En continuant, vous acceptez nos Conditions d’utilisation et notre Politique de confidentialité.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
