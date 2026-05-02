import {
    useMemo,
    useState,
    type ReactNode,
} from "react";

import { initialSignupFormData, SignupFlowContext } from "./SignupFlowState";

export function SignupFlowProvider({ children }: { children: ReactNode }) {
    const [signupFormData, setSignupFormData] = useState(initialSignupFormData);
    const [selectedAnimal, setSelectedAnimal] = useState("수달");

    const value = useMemo(
        () => ({
            signupFormData,
            setSignupFormData,
            selectedAnimal,
            setSelectedAnimal,
            resetSignupFlow: () => {
                setSignupFormData(initialSignupFormData);
                setSelectedAnimal("수달");
            },
        }),
        [selectedAnimal, signupFormData],
    );

    return (
        <SignupFlowContext.Provider value={value}>
            {children}
        </SignupFlowContext.Provider>
    );
}
