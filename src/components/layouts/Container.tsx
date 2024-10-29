import { useEffect, useReducer, useState } from "react"

import "../../style.css";

function IndexPopup() {
    const [currentUrl, setCurrentUrl] = useState("");
    useEffect(() => {
        async function currentUrlSetter() {
            const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
            setCurrentUrl(tabs[0].url);
        }
        currentUrlSetter();
    }, [])
    return (
        <>
            <p className="w-full">
                {currentUrl}
            </p>
        </>
    )
}

export default IndexPopup