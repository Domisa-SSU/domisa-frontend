import {
    createContext,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

export type SignupFormData = {
    nickname: string;
    gender: string;
    birthYear: string;
    referralCode: string;
    contactMethod: string;
    phonePrefix: string;
    phoneMiddle: string;
    phoneLast: string;
    contactValue: string;
};

const initialSignupFormData: SignupFormData = {
    nickname: "",
    gender: "",
    birthYear: "2003",
    referralCode: "",
    contactMethod: "",
    phonePrefix: "010",
    phoneMiddle: "",
    phoneLast: "",
    contactValue: "",
};

type SignupFlowContextValue = {
    signupFormData: SignupFormData;
    setSignupFormData: (nextFormData: SignupFormData) => void;
    selectedAnimal: string;
    setSelectedAnimal: (nextAnimal: string) => void;
    resetSignupFlow: () => void;
};

const SignupFlowContext = createContext<SignupFlowContextValue | null>(null);

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

export function useSignupFlow() {
    const context = useContext(SignupFlowContext);

    if (!context) {
        throw new Error("useSignupFlow must be used within SignupFlowProvider");
    }

    return context;
}
