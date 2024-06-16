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
    }
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
            ReactDOM.unmountComponentAtNode(document.getElementById('style-box-root')!);
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
    }

    // Set the currently editing element and add the blue border
    currentlyEditingElement = target;
    currentlyEditingElement.classList.add('editing-element');

    // Make the element content editable and focus on it
    currentlyEditingElement.contentEditable = 'true';
    currentlyEditingElement.focus();

    // Initialize changes object for the current element
    const targetKey = `${target.tagName}_${target.className}_${target.id}`;
    changes[targetKey] = {};

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
