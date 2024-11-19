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

function truncateUrl(url: string): string {
    try {
        const urlObj = new URL(url);
        const pathSegments = urlObj.pathname.split('/').filter(Boolean);
        let truncatedPath = pathSegments.length > 0
            ? `/${pathSegments[0]}${pathSegments.length > 1 ? '/...' : ''}`
            : '/';
        return `${urlObj.hostname}${truncatedPath}`;
    } catch (error) {
        return url.substring(0, 30) + '...';
    }
}

function truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function IndexPopup() {
    const [currentUrl, setCurrentUrl] = useState<string>("");
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [savedUrls, setSavedUrls] = useState<Record<string, { url: string; description: string }[]>>({
        mistralUrls: [],
        geminiUrls: [],
        claudeUrls: [],
        gptUrls: []
    });
    const storage = new Storage();
    const [description, setDescription] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [hoveredUrl, setHoveredUrl] = useState<string | null>(null);

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
                setDescription("");
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

    const getFilteredResults = () => {
        const query = searchQuery.toLowerCase();
        let results: { storageKey: string; url: string; description: string }[] = [];

        // When searching, include results from all categories
        if (searchQuery) {
            Object.entries(savedUrls).forEach(([storageKey, urls]) => {
                urls.forEach(item => {
                    if (item.description.toLowerCase().includes(query) ||
                        item.url.toLowerCase().includes(query)) {
                        results.push({
                            storageKey,
                            url: item.url,
                            description: item.description
                        });
                    }
                });
            });
        } else {
            // When not searching, only show results from selected category
            Object.entries(savedUrls).forEach(([storageKey, urls]) => {
                if (!selectedKey || storageKey === selectedKey) {
                    urls.forEach(item => {
                        results.push({
                            storageKey,
                            url: item.url,
                            description: item.description
                        });
                    });
                }
            });
        }

        return results;
    };

    const getTotalUrlCount = (storageKey?: string) => {
        if (storageKey) {
            return savedUrls[storageKey].length;
        }
        return Object.values(savedUrls).reduce((total, urls) => total + urls.length, 0);
    };

    const filteredResults = getFilteredResults();

    return (
        <div className="w-[400px] min-h-[300px] p-4 bg-gray-50">
            <div className="mb-4">
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (e.target.value) {
                                setSelectedKey(null); // Clear category selection when searching
                            }
                        }}
                        placeholder="Search across all saved URLs..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {shouldDisplaySaveButton && (
                <div className="mb-6 space-y-2 bg-white p-4 rounded-lg shadow-sm">
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add a description..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 text-sm font-medium shadow-sm"
                        onClick={clickToSave}
                    >
                        Save Current URL
                    </button>
                </div>
            )}

            {!searchQuery && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {Object.entries(STORAGE_KEY_NAMES).map(([key, name]) => (
                        <button
                            key={key}
                            className={`px-3 py-2 rounded-md transition duration-200 text-sm font-medium shadow-sm
                                ${selectedKey === key
                                    ? "bg-blue-600 text-white ring-2 ring-blue-300"
                                    : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
                                }`}
                            onClick={() => setSelectedKey(key === selectedKey ? null : key)}
                        >
                            {name} ({getTotalUrlCount(key)})
                        </button>
                    ))}
                </div>
            )}

            <div className="mt-4">
                {filteredResults.length > 0 ? (
                    <div>
                        <h3 className="font-medium text-sm text-gray-600 mb-3">
                            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
                            {!searchQuery && selectedKey ? ` in ${STORAGE_KEY_NAMES[selectedKey as keyof typeof STORAGE_KEY_NAMES]}` : ''}
                        </h3>
                        <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                            {filteredResults.map((item, index) => (
                                <div key={index}
                                    className="flex items-start bg-white p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 group shadow-sm">
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <div className="flex items-center gap-2 w-full">
                                            {(!selectedKey || searchQuery) && (
                                                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-md font-medium">
                                                    {STORAGE_KEY_NAMES[item.storageKey as keyof typeof STORAGE_KEY_NAMES]}
                                                </span>
                                            )}
                                            <div className="relative flex-1 min-w-0">
                                                <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 hover:text-blue-700 truncate block"
                                                    onMouseEnter={() => setHoveredUrl(item.url)}
                                                    onMouseLeave={() => setHoveredUrl(null)}
                                                    title={item.url}
                                                >
                                                    {truncateUrl(item.url)}
                                                </a>
                                                {hoveredUrl === item.url && (
                                                    <div className="absolute z-10 bg-gray-900 text-white p-2 rounded-md text-xs mt-1 max-w-xs break-all shadow-lg">
                                                        {item.url}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {item.description && (
                                            <p className="text-sm text-gray-600 mt-1.5 truncate" title={item.description}>
                                                {truncateText(item.description, 100)}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => deleteUrl(item.storageKey, item.url)}
                                        className="text-gray-400 hover:text-red-500 text-lg px-2 ml-2 flex-shrink-0 transition-colors duration-200"
                                        title="Delete"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        {getTotalUrlCount() > 0 ? (
                            searchQuery ? (
                                <p>No results found for "{searchQuery}"</p>
                            ) : (
                                <p>Start typing to search across {getTotalUrlCount()} saved URLs</p>
                            )
                        ) : (
                            <p>No saved URLs yet</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default IndexPopup;