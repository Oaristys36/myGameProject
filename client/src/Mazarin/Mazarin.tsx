import React, { useState, useEffect, useRef } from 'react';
import { MiniMazarinButton } from '../components/Buttons';
import "./styles/mazarin.css";
const PROGRESS_KEY = "mazarinStep";

type Step = {
    targetRef: React.RefObject<HTMLElement | null>;
    message: string;
    validate?: () => boolean;
};

type MazarinProps = {
    steps: Step[];
    onFinish: () => void;
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
