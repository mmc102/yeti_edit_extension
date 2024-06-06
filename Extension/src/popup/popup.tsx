import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';



const App = () => {

    const [isEditMode, setIsEditMode] = useState(false);
    useEffect(() => {
        // Retrieve the edit mode state from Chrome storage when the popup is opened
        chrome.storage.local.get(['editMode'], (result) => {
            if (result.editMode !== undefined) {
                setIsEditMode(result.editMode);
            }
        });
    }, []);

    const toggleEditMode = () => {
        const newEditMode = !isEditMode;
        setIsEditMode(newEditMode);
        chrome.storage.local.set({ editMode: newEditMode });
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { editMode: newEditMode });
            }
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1>Yeti Edit</h1>
            <button onClick={toggleEditMode}>
                {isEditMode ? 'Disable Edit Mode' : 'Enable Edit Mode'}
            </button>
        </div>
    );
};

const rootElem = document.getElementById('root') as HTMLElement;
const root = createRoot(rootElem);
root.render(<App />);
