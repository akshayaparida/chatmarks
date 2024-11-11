import { useEffect, useState } from "react";
import { Storage } from "@plasmohq/storage";
import "../../style.css";

const DOMAIN_STORAGE_KEYS = {
    "chat.mistral.ai": "mistralUrls",
    "gemini.google.com": "geminiUrls",
    "claude.ai": "claudeUrls",
    "chatgpt.com": "gptUrls",
} as const;

const STORAGE_KEY_NAMES = {
    mistralUrls: "Mistral",
    geminiUrls: "Gemini",
    claudeUrls: "Claude",
    gptUrls: "ChatGPT"
} as const;

function IndexPopup() {
    const [currentUrl, setCurrentUrl] = useState<string>("");
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [savedUrls, setSavedUrls] = useState<Record<string, { url: string; description: string }[]>>(
        {
            mistralUrls: [],
            geminiUrls: [],
            claudeUrls: [],
            gptUrls: []
        }
    );
    const storage = new Storage();
    const [description, setDescription] = useState<string>("");

    function getStorageKey(url: string): string | null {
        try {
            const domain = new URL(url).hostname;
            return DOMAIN_STORAGE_KEYS[domain as keyof typeof DOMAIN_STORAGE_KEYS] || null;
        } catch (error) {
            console.error("Error parsing URL:", error);
            return null;
        }
    }

    async function clickToSave() {
        try {
            const storageKey = getStorageKey(currentUrl);
            if (!storageKey) return;

            const existingUrls: { url: string; description: string }[] = (await storage.get(storageKey)) || [];
            if (!existingUrls.some(url => url.url === currentUrl)) {
                existingUrls.push({ url: currentUrl, description: description });
                await storage.set(storageKey, existingUrls);
                setSavedUrls(prev => ({
                    ...prev,
                    [storageKey]: existingUrls
                }));
                setDescription(""); // Clear the description input after saving
            }
        } catch (error) {
            console.error("Error saving URL:", error);
        }
    }

    async function loadAllSavedUrls() {
        try {
            const allUrls: Record<string, { url: string; description: string }[]> = {};
            for (const key of Object.values(DOMAIN_STORAGE_KEYS)) {
                allUrls[key] = (await storage.get(key)) || [];
            }
            setSavedUrls(allUrls);
        } catch (error) {
            console.error("Error loading saved URLs:", error);
        }
    }

    async function deleteUrl(storageKey: string, urlToDelete: string) {
        try {
            const updatedUrls = savedUrls[storageKey].filter(url => url.url !== urlToDelete);
            await storage.set(storageKey, updatedUrls);
            setSavedUrls(prev => ({
                ...prev,
                [storageKey]: updatedUrls
            }));
        } catch (error) {
            console.error("Error deleting URL:", error);
        }
    }

    useEffect(() => {
        async function currentUrlSetter() {
            try {
                if (typeof chrome !== 'undefined' && chrome.tabs) {
                    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                    if (tabs.length > 0 && tabs[0].url) {
                        setCurrentUrl(tabs[0].url);
                    }
                }
                await loadAllSavedUrls();
            } catch (error) {
                console.error("Error setting current URL:", error);
            }
        }

        currentUrlSetter();
    }, []);

    const shouldDisplaySaveButton = currentUrl && getStorageKey(currentUrl);

    return (
        <div className="w-[400px] min-h-[300px] p-4">

            <div className="mb-6 text-center">
                {shouldDisplaySaveButton && (
                    <>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description"
                            className="mb-2 px-4 py-2 border border-gray-300 rounded-md"
                        />
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
                            onClick={clickToSave}
                        >
                            Save Current URL!!!
                        </button>
                    </>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
                {Object.entries(STORAGE_KEY_NAMES).map(([key, name]) => (
                    <button
                        key={key}
                        className={`px-3 py-2 rounded transition duration-300 ${selectedKey === key
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                            }`}
                        onClick={() => setSelectedKey(key === selectedKey ? null : key)}
                    >
                        {name} ({savedUrls[key]?.length || 0})
                    </button>
                ))}
            </div>

            {selectedKey && (
                <div className="mt-4">
                    <h3 className="font-semibold mb-2">{STORAGE_KEY_NAMES[selectedKey as keyof typeof STORAGE_KEY_NAMES]} URLs:</h3>
                    <div className="max-h-[200px] overflow-y-auto">
                        {savedUrls[selectedKey]?.length > 0 ? (
                            <ul className="space-y-2">
                                {savedUrls[selectedKey].map((url, index) => (
                                    <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <a
                                            href={url.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:text-blue-800 truncate flex-1 mr-2"
                                        >
                                            {url.url} {/* Changed from new URL(url.url).pathname to url.url */}
                                        </a>
                                        <p className="text-sm text-gray-600">{url.description}</p>
                                        <button
                                            onClick={() => deleteUrl(selectedKey, url.url)}
                                            className="text-red-500 hover:text-red-700 text-sm px-2"
                                        >
                                            ×
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm">No saved URLs</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default IndexPopup;