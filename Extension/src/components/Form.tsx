import React from 'react';

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
                type="text"
                value={value}
                onChange={(e) => onChange(property, e.target.value)}
            />
        </div>
    );
};



interface ColorInputProps {
    label: string;
    value: string;
    property: string;
    onChange: (property: string, value: string) => void;
}

export const ColorInput: React.FC<ColorInputProps> = ({ label, value, property, onChange }) => {
    return (
        <div style={{ marginBottom: '10px' }}>
            <label>{label}: </label>
            <input
                type="color"
                value={value}
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
    return (
        <div style={{ marginBottom: '10px' }}>
            <label>{label}: </label>
            <select value={value} onChange={(e) => onChange(property, e.target.value)}>
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    );
};

