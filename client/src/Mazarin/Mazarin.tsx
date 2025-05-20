import React, { useState, useEffect, useRef } from 'react';
import { MiniMazarinButton } from '../components/Buttons';
import "./mazarin.css";

type Step = {
    targetRef: React.RefObject<HTMLElement | null>;
    message: string;
};

type MazarinProps = {
    steps: Step[];
    onFinish: () => void;
};

export const Mazarin: React.FC<MazarinProps> = ({ steps, onFinish }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [minimized, setMinimized] = useState(false);
    const [bubbleVisible, setBubbleVisible] = useState(false);
    const step = steps[stepIndex];
    const bubbleRef = useRef<HTMLDivElement>(null);
    const lastTargetRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        
        const timeout = setTimeout(() => {
            
            const bubble = bubbleRef.current;
            const target = step?.targetRef?.current;

            if (!bubble || !target) {
                console.warn("Un des éléments nécessaires à Mazarin est null");
                return;
            }

            if (target && bubble) {

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
            target.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }, 200);

    return () => {
        clearTimeout(timeout);
        const target = step?.targetRef?.current;
        target?.classList.remove("mazarin-highlight");
        setBubbleVisible(false);
    };
    }, [step]);

    const handleNext = () => {
        if (stepIndex + 1 < steps.length) {
            setStepIndex(stepIndex +1);
        } else {
            setMinimized(true);
            handleFinish();
        }
    };

    const handleFinish = () => {
    if (lastTargetRef.current) {
        lastTargetRef.current.classList.remove("mazarin-highlight");
        lastTargetRef.current = null;
    }
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
        <button onClick={handleSkip}>Passer</button>
        </div>
    </div>
</>
    ) : (
        <MiniMazarinButton className='mazarin-mini'/>
    );
};