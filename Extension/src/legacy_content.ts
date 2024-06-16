import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import browser from 'webextension-polyfill';
import { type BrowserMessageType, type ColorScheme } from './models';
import StyleBox from './StyleBox';

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

// Retrieve the initial edit mode state from Chrome storage
chrome.storage.local.get(['editMode'], (result) => {
    if (result.editMode !== undefined) {
        editMode = result.editMode;
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.editMode !== undefined) {
        editMode = message.editMode;
        if (!editMode) {
            // Remove existing style box and blue border if edit mode is disabled
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
    }

    // Set the currently editing element and add the blue border
    currentlyEditingElement = target;
    currentlyEditingElement.classList.add('editing-element');

    // Initialize changes object for the current element
    const targetKey = `${target.tagName}_${target.className}_${target.id}`;
    changes[targetKey] = {};

    // Create a root div for the React component
    let root = document.getElementById('style-box-root');
    if (!root) {
        root = document.createElement('div');
        root.id = 'style-box-root';
        document.body.appendChild(root);
    }

    ReactDOM.render(
        <StyleBox target={ target }
      changes = { changes }
      onClose = {() => {
        currentlyEditingElement!.classList.remove('editing-element');
        currentlyEditingElement = null;
    }}
    />,
    root
);
});
