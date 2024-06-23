import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import ReactDOM from 'react-dom';
import browser from 'webextension-polyfill';
import { type BrowserMessageType, type ColorScheme } from './models';
import StyleBox from './StyleBox';
import './global.css'

browser.runtime.onMessage.addListener(message => {
    console.log('got message', message);
    switch (message.type as BrowserMessageType) {
        case 'getColorScheme': {
            return Promise.resolve(getColorScheme());
        }
        case 'reloadChanges': {
            reloadSavedChanges();
            break;
        }
    }
});

const escapeClassName = (className: string) => {
    return className.replace(/([\!\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\[\\\]\^\`\{\|\}\~])/g, '\\$1');
};

const applyChanges = (changes: Record<string, Record<string, string>>) => {
    Object.keys(changes).forEach((key) => {
        const [tagName, className, id] = key.split('_');
        const selectorParts = [];
        if (tagName) selectorParts.push(tagName);
        if (className) selectorParts.push(...className.split(/\s+/).map(cls => `.${cls}`));
        if (id) selectorParts.push(`#${id}`);
        const selector = selectorParts.join('');

        console.log(`Applying changes to selector: ${selector}`);

        try {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element) => {
                const styles = changes[key];
                Object.keys(styles).forEach((property) => {
                    if (property === 'innerText') {
                        (element as HTMLElement).innerText = styles[property];
                    } else {
                        (element as HTMLElement).style[property as any] = styles[property];
                    }
                });
            });
        } catch (error) {
            console.error(`Error applying changes to selector: ${selector}`, error);
        }
    });
};

const reloadSavedChanges = () => {
    const savedChanges = localStorage.getItem('styleChanges');
    console.log("reading saved changes");
    if (savedChanges) {
        const changes = JSON.parse(savedChanges);
        applyChanges(changes);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    reloadSavedChanges();
});

function getColorScheme() {
    let scheme: ColorScheme = 'light';
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (darkModeMediaQuery.matches) {
        scheme = 'dark';
    }
    return scheme;
}

// CSS for the blue border class
const style = document.createElement('style');
style.innerHTML = `
  .editing-element {
    outline: 2px solid blue !important;
  }
`;
document.head.appendChild(style);

let currentlyEditingElement: HTMLElement | null = null;
let changes: Record<string, Record<string, string>> = {};
let editMode = false;
let reactive: Root | null = null;

chrome.storage.local.get(['editMode'], (result) => {
    if (result.editMode !== undefined) {
        editMode = result.editMode;
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.editMode !== undefined) {
        editMode = message.editMode;
        if (!editMode) {
            const existingBox = document.querySelector('.style-box');
            if (existingBox) {
                existingBox.remove();
            }
            if (currentlyEditingElement) {
                currentlyEditingElement.classList.remove('editing-element');
            }
            currentlyEditingElement = null;
            const styleBoxRoot = document.getElementById('style-box-root');
            if (styleBoxRoot) {
                ReactDOM.unmountComponentAtNode(styleBoxRoot);
            }
        }
    }
});

document.addEventListener('click', (event: MouseEvent) => {
    if (!editMode) return;

    const target = event.target as HTMLElement;

    // If clicking inside the style box, do nothing
    if (target.closest('.style-box')) {
        return;
    }

    // Remove existing style box if any
    const existingBox = document.querySelector('.style-box');
    if (existingBox) {
        existingBox.remove();
    }

    // Remove the blue border from the previously edited element
    if (currentlyEditingElement) {
        currentlyEditingElement.classList.remove('editing-element');
        currentlyEditingElement.contentEditable = 'false'; // Disable content editable
        currentlyEditingElement.removeEventListener('input', handleInputEvent);
    }

    // Set the currently editing element and add the blue border
    currentlyEditingElement = target;
    currentlyEditingElement.classList.add('editing-element');

    // Make the element content editable and focus on it
    currentlyEditingElement.contentEditable = 'true';
    currentlyEditingElement.focus();

    // Initialize changes object for the current element
    const targetKey = `${target.tagName}_${target.className}_${target.id}`;
    if (!changes[targetKey]) {
        changes[targetKey] = {};
    }

    // Add input event listener to log changes
    currentlyEditingElement.addEventListener('input', handleInputEvent);

    // Ensure style-box-root exists
    let root = document.getElementById('style-box-root');
    if (!root) {
        root = document.createElement('div');
        root.id = 'style-box-root';
        document.body.appendChild(root);
    }

    if (!reactive) {
        reactive = createRoot(root);
    }

    reactive.render(
        <StyleBox
            target={target}
            changes={changes}
            onClose={() => {
                currentlyEditingElement!.classList.remove('editing-element');
                currentlyEditingElement!.contentEditable = 'false'; // Disable content editable
                currentlyEditingElement!.removeEventListener('input', handleInputEvent);
                currentlyEditingElement = null;

                // Ensure style-box-root is removed on close
                const existingRoot = document.getElementById('style-box-root');
                if (existingRoot) {
                    existingRoot.remove();
                    reactive = null;
                }
            }}
        />
    );
});


function handleInputEvent(event: Event) {
    const target = event.target as HTMLElement;
    let className = target.className;
    if (className.includes('editing-element')) {
        className = className.replace('editing-element', '').trim();
    }
    const targetKey = `${target.tagName}_${className}_${target.id}`;
    if (!changes[targetKey]) {
        changes[targetKey] = {};
    }
    changes[targetKey]['innerText'] = target.innerText;
    localStorage.setItem('styleChanges', JSON.stringify(changes));
}
