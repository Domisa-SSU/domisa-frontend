import { useContext } from "react";

import { SignupFlowContext } from "./SignupFlowState";

export function useSignupFlow() {
    const context = useContext(SignupFlowContext);

    if (!context) {
        throw new Error("useSignupFlow must be used within SignupFlowProvider");
    }

    return context;
}
