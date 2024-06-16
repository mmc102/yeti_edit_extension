import React, { useState } from 'react';

interface TextInputProps {
    label: string;
    value: string;
    property: string;
    onChange: (property: string, value: string) => void;
}

export const TextInput: React.FC<TextInputProps> = ({ label, value, property, onChange }) => {



    return (
        <div style={{ marginBottom: '10px' }}>
            <label>{label}: </label>
            <input
                style={{ color: 'black' }}
                type="text"
                value={value}
                onChange={(e) => { console.log(value); console.log(e.target.value); return onChange(property, e.target.value) }}
            />
        </div>
    );
};


const rgbToHex = (rgb: string) => {
    const result = rgb.match(/\d+/g);
    if (!result) return '#000000';
    const r = parseInt(result[0], 10);
    const g = parseInt(result[1], 10);
    const b = parseInt(result[2], 10);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
};

const formatHex = (hex: string) => {
    if (!hex.startsWith('#')) {
        return `#${hex}`;
    }
    return hex;
};

interface ColorInputProps {
    label: string;
    value: string;
    property: string;
    onChange: (property: string, value: string) => void;
}

export const ColorInput: React.FC<ColorInputProps> = ({ label, value, property, onChange }) => {

    const hexValue = value.startsWith('rgb') ? rgbToHex(value) : formatHex(value);

    return (
        <div style={{ marginBottom: '10px' }}>
            <label>{label}: </label>
            <input
                type="color"
                value={hexValue}
                onChange={(e) => onChange(property, e.target.value)}
            />
        </div>
    );
};




interface SelectInputProps {
    label: string;
    value: string;
    property: string;
    options: string[];
    onChange: (property: string, value: string) => void;
}

export const SelectInput: React.FC<SelectInputProps> = ({ label, value, property, options, onChange }) => {

    const [val, setVal] = useState(value)

    return (
        <div style={{ marginBottom: '10px' }}>
            <label>{label}: </label>
            <select style={{ color: 'black' }} value={val} onChange={(e) => { setVal(e.target.value); onChange(property, e.target.value) }}>
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    );
};

