import React, { useState, useEffect, useRef } from 'react';
import { MiniMazarinButton } from '../components/Buttons';
import "./styles/mazarin.css";

type Step = {
    targetRef: React.RefObject<HTMLElement | null>;
    message: string;
    validate?: () => boolean;
};

type MazarinProps = {
    steps: Step[];
    onFinish: () => void;
};

type MyPair = {
    matched: number,
    domain: string,
    mistakes: number,
    score: number,
};

const PROGRESS_KEY = "mazarinStep";
const commonEmailDomains = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "orange.fr",
  "hotmail.fr",
  "laposte.net"
];

function matchLettersContains(email: string): MyPair[] {
    const hasAt = email.includes("@")
    let domainInput = '';
    if(!hasAt) return [];

        const parts = email.split("@");
        if(parts.length === 2){
            domainInput = parts[1];
        } else {
            return [];
        }

        const myNewPairs: MyPair[] = [];

        for(const domain of commonEmailDomains){
            let mistakes = 0;
            let matched = 0;
            const setA = domainInput.toLowerCase();
            const setB = domain.toLocaleLowerCase().split('');
            const domainLettersCopy = [...setB];

            for (const letter of setA){
                const index = domainLettersCopy.indexOf(letter);
                if(index !== -1){
                    matched++;
                    domainLettersCopy.splice(index, 1);
                } else {
                    mistakes++;
                }
            }
            const score = matched / (mistakes + 1);
            myNewPairs.push({ matched, domain, mistakes: mistakes, score });
        }

        if(myNewPairs.length === 0 ) return [];
        const bestGuess = myNewPairs.reduce((a, b) => (a.score > b.score ? a : b));
        console.log(`Domaine: ${bestGuess.domain}, Reussite: ${bestGuess.matched}, Echec: ${bestGuess.mistakes}, TauxTotal: ${bestGuess.score}`);   
        
    return myNewPairs;
};  

function matchExactSuffix(email: string): MyPair[] {
    const hasAt = email.includes("@");
    let domainInput = '';

    if(!hasAt) return [];
    const parts = email.split("@");
    if(parts.length === 2){
        domainInput = parts[1];
    } else {
        return []
    };

    const results: MyPair[] = [];

    for(const domain of commonEmailDomains){
        let matched = 0;
        let mistakes = 0;

        const maxLen = Math.min(domainInput.length, domain.length);
        for(let i = 0; i < maxLen; i++){
            const charInput = domainInput[domainInput.length - 1 - i];
            const charDomain = domain[domain.length - 1 - i];

            if(charInput === charDomain){
                matched++;
            } else {
                mistakes++;
            }
        }

        const score = matched / (mistakes + 1);
        results.push({ matched, mistakes, domain, score})
    }

  return results;
};

function matchDomainLength(email: string): MyPair[] {
    const hasAt = email.includes("@");
    if(!hasAt) return [];

    let domainInput = '';
    const parts = email.split("@");
    if(parts.length === 2){
        domainInput = parts[1]
    } else {
        return [];
    }

    let results: MyPair[] = [];

    for(const domain of commonEmailDomains){
        let lengthDifference = Math.abs(domainInput.length - domain.length);
        let mistakes = lengthDifference;
        let matched = Math.min(domainInput.length, domain.length) - mistakes;
        const score = matched  / (mistakes + 1); 
        results.push({ matched, mistakes, domain, score })  ; 
    };
    return results;
};

function agregateDomainScores(email: string): MyPair[]{
    const lettersScores = matchLettersContains(email);
    const suffixScores = matchExactSuffix(email);
    const lengthScores = matchDomainLength(email);

    const domainMap: Record<string, MyPair> = {};

    const applyScores = (source: MyPair[], weight: number) => {
        for(const item of source) {
            const existing = domainMap[item.domain];
            if (!existing) {
                domainMap[item.domain] = {
                    domain: item.domain,
                    matched: item.matched,
                    mistakes: item.mistakes,
                    score: item.score * weight
                };
            } else {
                existing.matched += item.matched;
                existing.mistakes += item.mistakes;
                existing.score += item.score * weight;
            }
        }
    };

    applyScores(lettersScores, 1);
    applyScores(suffixScores, 1.5);
    applyScores(lengthScores, 1.2);

    return Object.values(domainMap).sort((a, b) => b.score - a.score);
};
 
function getMazarinInState() {
    const saved = localStorage.getItem("mazarinStep");
    return saved ? parseInt(saved, 10) : 0;
};

function saveMazarinState(index: number) {
    localStorage.setItem(PROGRESS_KEY, index.toString());
};

function clearMazarinState() {
    localStorage.removeItem(PROGRESS_KEY);
};

function runMazarin(
    step: Step | undefined,
    bubbleRef: React.RefObject<HTMLDivElement | null>,
    setBubbleVisible: (b: boolean) => void,
    lastTargetRef: React.MutableRefObject<HTMLElement | null>
) {
    if (!step || !step.targetRef?.current || !bubbleRef)  return;
        
    const bubble = bubbleRef.current;
    const target = step?.targetRef?.current;
    const input = target as HTMLInputElement;

    console.log("🎯 Valeur de l'input :", input.value);
    
    if (step.validate) {
        const result = step.validate();
        console.log(result ? "✔️ Champ rempli" : "❌ Champ vide");
    } else {
        console.log("ℹ️ Aucune validation définie pour cette étape.");
    };

    if (!bubble || !target) {
        console.warn("Un des éléments nécessaires à Mazarin est null");
        return;
    };

    lastTargetRef.current = target;
    setBubbleVisible(true);

    requestAnimationFrame(() => {
        const updatedRect = target.getBoundingClientRect();
        bubble.style.top = `${updatedRect.top + window.scrollY}px`;
        bubble.style.left = `${updatedRect.left + updatedRect.width + 40}px`;
        bubble.style.position = "absolute";
        bubble.style.opacity = '1';
    });

    target.classList.add("mazarin-highlight");
    target.focus?.();
    target.scrollIntoView({ behavior: "smooth", block: "center" });
};

export const Mazarin: React.FC<MazarinProps> = ({ steps, onFinish }) => {
    const [minimized, setMinimized] = useState(false);
    const [bubbleVisible, setBubbleVisible] = useState(false);
    const [stepIndex, setStepIndex] = useState(getMazarinInState());
    const step = steps[stepIndex];
    const bubbleRef = useRef<HTMLDivElement>(null);
    const lastTargetRef = useRef<HTMLElement | null>(null);

    const email1 = "paul.benard33@geefl.com";
    const email2 = "paul.benard33@gil.com";
    const suggestion1 = agregateDomainScores(email1);
    const suggestion2 = agregateDomainScores(email2);
    if(suggestion1 || suggestion2){
        console.log("Suggestion 1 :", suggestion1);
        console.log("Suggestion 2 :", suggestion2);
    };

    useEffect(() => {
        if(minimized) return;

        const timeout = setTimeout(() => {
            runMazarin(step, bubbleRef, setBubbleVisible, lastTargetRef);
        }, 200)
        return () => {
            clearTimeout(timeout);
            const target = step?.targetRef?.current;
            target?.classList.remove("mazarin-highlight");
            setBubbleVisible(false);
        };
    }, [stepIndex, minimized]);

    useEffect(() => {
    saveMazarinState(stepIndex);
    }, [stepIndex]);

    const handleNext = () => {
    if (stepIndex >= steps.length -1){
        handleFinish();
        setMinimized(true);
        return
    }
    setStepIndex(stepIndex +1);
    };

    const handlePrevious = () => {
        if (stepIndex > 0) {
            setStepIndex(stepIndex -1);
        }
    };

    const handleFinish = () => {
    if (lastTargetRef.current) {
        lastTargetRef.current.classList.remove("mazarin-highlight");
        lastTargetRef.current = null;
    };
    if(stepIndex >= steps.length -1) {
        clearMazarinState();
    };
    setMinimized(true);
    onFinish();
    };

    const handleSkip = () => {
        setMinimized(true);
        handleFinish();
    };

    return !minimized ? (
    <>
    <div className="mazarin-background"/>
    <div
        ref={bubbleRef}
        className={`mazarin-bubble ${bubbleVisible ? 'active' : ''}`}
        style={{ visibility: bubbleVisible ? 'visible' : 'hidden' }}
    >
        <p>{step.message}</p>
        <div className="mazarin-controls">
        <button onClick={handleNext}>Suivant</button>
        <button onClick={handlePrevious}>Précédent</button>
        <button onClick={handleSkip}>Terminer</button>
        </div>
    </div>
</>
    ) : (
        <MiniMazarinButton onClick={() => {
            setStepIndex(getMazarinInState());
            setMinimized(false);
        }}className='mazarin-mini'/>
    );
};
