import { useContext } from "react";

import { DatingRegisterFlowContext } from "./DatingRegisterFlowState";

export function useDatingRegisterFlow() {
  const context = useContext(DatingRegisterFlowContext);

  if (!context) {
    throw new Error(
      "useDatingRegisterFlow must be used within DatingRegisterFlowProvider",
    );
  }

  return context;
}
