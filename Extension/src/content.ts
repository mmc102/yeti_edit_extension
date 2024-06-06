import browser from 'webextension-polyfill';
import { type BrowserMessageType, type ColorScheme } from './models';


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

    // Create a new box to display styles
    const styleBox = document.createElement('div');
    styleBox.classList.add('style-box');

    // Get computed styles of the target element
    const computedStyles = window.getComputedStyle(target);
    const stylesToShow: string[] = ['color', 'background-color', 'font-size', 'align-items', 'justify-content', 'flex-direction'];

    let styles = '';
    stylesToShow.forEach(property => {
        const value = computedStyles.getPropertyValue(property);
        if (property === 'color' || property === 'background-color') {
            styles += `
        <div>
          <label>${property}: </label>
          <input type="color" value="${value}" data-property="${property}" />
        </div>`;
        } else if (property === 'align-items' || property === 'justify-content' || property === 'flex-direction') {
            const options: { [key: string]: string[] } = {
                'align-items': ['stretch', 'center', 'flex-start', 'flex-end', 'baseline'],
                'justify-content': ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
                'flex-direction': ['row', 'row-reverse', 'column', 'column-reverse']
            };
            styles += `
        <div>
          <label>${property}: </label>
          <select data-property="${property}">
            ${options[property].map(opt => `<option value="${opt}" ${opt === value ? 'selected' : ''}>${opt}</option>`).join('')}
          </select>
        </div>`;
        } else {
            styles += `
        <div>
          <label>${property}: </label>
          <input type="text" value="${value}" data-property="${property}" />
        </div>`;
        }
    });

    // Add inner text editing field
    styles += `
    <div>
      <label>innerText: </label>
      <input type="text" value="${target.innerText}" data-property="innerText" />
    </div>`;

    // Set the content and position of the style box
    styleBox.innerHTML = styles;
    styleBox.style.position = 'fixed';
    styleBox.style.right = '10px';
    styleBox.style.bottom = '10px';
    styleBox.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    styleBox.style.border = '1px solid #ccc';
    styleBox.style.padding = '10px';
    styleBox.style.zIndex = '9999';
    styleBox.style.maxHeight = '300px';
    styleBox.style.overflowY = 'scroll';
    styleBox.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.1)';

    // Append the style box to the body
    document.body.appendChild(styleBox);

    // Prevent click events within the style box from propagating
    styleBox.addEventListener('click', function (event: MouseEvent) {
        event.stopPropagation();
    });

    // Add event listeners to the input fields to update styles on change or enter key press
    const inputs = styleBox.querySelectorAll('input, select');
    inputs.forEach(input => {
        if (input instanceof HTMLInputElement && (input.type === 'color' || input.type === 'text')) {
            input.addEventListener('input', function (e: Event) {
                const targetInput = e.target as HTMLInputElement;
                const property = targetInput.dataset.property!;
                const value = targetInput.value;
                if (property === 'innerText') {
                    currentlyEditingElement!.innerText = value;
                } else {
                    currentlyEditingElement!.style[property as any] = value;
                }
                // Log changes
                changes[targetKey][property] = value;
                console.log('Changes:', changes);
            });
        } else if (input instanceof HTMLSelectElement) {
            input.addEventListener('change', function (e: Event) {
                const targetSelect = e.target as HTMLSelectElement;
                const property = targetSelect.dataset.property!;
                const value = targetSelect.value;
                currentlyEditingElement!.style[property as any] = value;
                // Log changes
                changes[targetKey][property] = value;
                console.log('Changes:', changes);
            });
        }
    });
});
