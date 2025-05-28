import damerauLevenshtein from "damerau-levenshtein";
import { commonEmailDomains, domainExtension, domainRoots } from "./emailDomain";
import {useState, useEffect } from 'react';
import { CgPacman } from "react-icons/cg";

type MyPair = {
    matched: number,
    domain: string,
    mistakes: number,
    score: number,
};

function penalizeExponentially(mistakes: number, maxAllowed = 10): number {
  if (mistakes >= maxAllowed) return Infinity;
  const base = 1.2; // Plus la base est haute, plus c'est sévère
  return Math.pow(base, mistakes);
};

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

            let matched = 0;
            const setA = domainInput.toLowerCase();
            const setB = domain.toLocaleLowerCase().split('');
            const domainLettersCopy = [...setB];

            for (const letter of setA){
                const index = domainLettersCopy.indexOf(letter);
                if(index !== -1){
                    matched++;
                    domainLettersCopy.splice(index, 1);
                }
            };

            const penalty = penalizeExponentially(0, 5);
            const score = matched / (penalty + 1);
            myNewPairs.push({ matched, domain, mistakes: 0, score });
        };

        if(myNewPairs.length === 0 ) return [];

    return myNewPairs;
};  

function matchExactSuffixFromEnd(email: string): MyPair[] {
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

        let penalty = penalizeExponentially(mistakes, 5);
        let score = matched / (penalty + 1);
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
        const penalty = penalizeExponentially(mistakes, 5);
        const score = matched / (penalty + 1);
        results.push({ matched, mistakes, domain, score })  ; 
    };
    return results;
};

function matchLevenshtein(email: string): MyPair[] {
    const hasAt = email.includes("@");
    if (!hasAt) return [];

    let domainInput = '';
    const parts = email.split("@");
    if(parts.length === 2){
        domainInput = parts[1]
    } else {
        return [];
    };

    const results: MyPair[] = [];
    const matched = 30;

    for(const domain of commonEmailDomains) {
        let mistakes = damerauLevenshtein(domainInput, domain).steps
        let penalty = penalizeExponentially(mistakes, 10);
        let score = matched / ( penalty + 1);
        results.push({ matched, mistakes, domain, score });
    }

    return results;

};

function agregateDomainScores(email: string): MyPair[]{
    const lettersScores = matchLettersContains(email);
    const suffixScores = matchExactSuffixFromEnd(email);
    const lengthScores = matchDomainLength(email);
    const levenshteinScores = matchLevenshtein(email);

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

    applyScores(lettersScores, 1.5);
    applyScores(suffixScores, 1.5);
    applyScores(lengthScores, 0.5);
    applyScores(levenshteinScores, 2);

    return Object.values(domainMap).sort((a, b) => b.score - a.score);
};

export function getBestDomainSuggestion(email: string): MyPair | null{
    const scores = agregateDomainScores(email);
    if(scores.length === 0) return null;

    const bestScore = scores[0];
    return bestScore.score > 24 ? bestScore : null;
};
 
export function useEmailSuffixSuggestion(email: string, minChars = 2){
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [correction, setCorrection] = useState<string | null>(null);

    useEffect(() => {
        const atIndex = email.indexOf("@");
        if(atIndex === -1 || atIndex === email.length -1) {
            setSuggestion(null);
            setCorrection(null);
            return;
        };
        
        const suffixTyped = email.slice(atIndex + 1).toLowerCase();

        if (suffixTyped.length < minChars) {
            setSuggestion(null);
            setCorrection(null);
            return;
        };

        const matches = commonEmailDomains.filter(domain => domain.startsWith(suffixTyped));
  
        if(matches.length === 1 && !suffixTyped.includes(".")) {
            setSuggestion(matches[0]);
            return;
        }; 

        const [maybeRoot, maybeExtension] = suffixTyped.split(".");
        if(!suffixTyped.includes(".")){
            const rootMatch = domainRoots.find((root) => root.startsWith(suffixTyped));
            if(rootMatch){
                setSuggestion(rootMatch);
                return;
            }
        } 
        
        if( maybeRoot && maybeExtension !== undefined) {
            const fullMatch = domainRoots
            .flatMap((root) => domainExtension.map((ext) => root + ext))
            .find((fullDomain) => fullDomain.startsWith(suffixTyped));

        if(fullMatch){
            setSuggestion(fullMatch);
            return;
        }
      }

      const correctionResult = getBestDomainSuggestion(email);
      if(correctionResult){
        setCorrection(correctionResult.domain);
        setSuggestion(null);
        return;
      }

    setSuggestion(null);
    setCorrection(null);

    }, [email, minChars]);

    const clearCorrection = () => setCorrection(null);

    return {suggestion, correction, clearCorrection };
};