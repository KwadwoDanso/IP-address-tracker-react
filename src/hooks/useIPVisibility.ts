// useIPVisibility.ts — toggles whether the IP is shown or masked

import { useState, useCallback } from "react";

function useIPVisibility() {
    const [visible, setVisible] = useState(true);
    const toggle = useCallback(() => setVisible((v) => !v), []);
    const maskIP = (ip: string) => visible ? ip : ip.replace(/[0-9a-fA-F]/g, "•");
    return { visible, toggle, maskIP };
}

export default useIPVisibility;