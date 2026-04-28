import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  DatingRegisterFlowContext,
  initialDatingRegisterFormData,
} from "./DatingRegisterFlowState";

export function DatingRegisterFlowProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [formData, setFormData] = useState(initialDatingRegisterFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const photoPreviewUrlRef = useRef<string | null>(null);

  const revokePhotoPreviewUrl = () => {
    if (photoPreviewUrlRef.current) {
      URL.revokeObjectURL(photoPreviewUrlRef.current);
      photoPreviewUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => revokePhotoPreviewUrl();
  }, []);

  const value = useMemo(
    () => ({
      formData,
      currentStep,
      selectMbtiLetter: (index: number, letter: string) => {
        setFormData((prev) => {
          const nextMbti = prev.mbti.padEnd(4, " ").split("");
          nextMbti[index] = letter;

          return {
            ...prev,
            mbti: nextMbti.join("").trimEnd(),
          };
        });
      },
      setRomanticStyle: (nextRomanticStyle: string) => {
        setFormData((prev) => ({
          ...prev,
          romanticStyle: nextRomanticStyle,
        }));
      },
      setIdealType: (nextIdealType: string) => {
        setFormData((prev) => ({
          ...prev,
          idealType: nextIdealType,
        }));
      },
      setPhotoFile: (nextPhotoFile: File) => {
        revokePhotoPreviewUrl();
        const nextPhotoPreviewUrl = URL.createObjectURL(nextPhotoFile);
        photoPreviewUrlRef.current = nextPhotoPreviewUrl;

        setFormData((prev) => ({
          ...prev,
          photoFile: nextPhotoFile,
          photoPreviewUrl: nextPhotoPreviewUrl,
        }));
      },
      goNextStep: () => {
        setCurrentStep((prev) => Math.min(prev + 1, 4));
      },
      goPrevStep: () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
      },
      resetRegisterFlow: () => {
        revokePhotoPreviewUrl();
        setFormData(initialDatingRegisterFormData);
        setCurrentStep(1);
      },
    }),
    [currentStep, formData],
  );

  return (
    <DatingRegisterFlowContext.Provider value={value}>
      {children}
    </DatingRegisterFlowContext.Provider>
  );
}
