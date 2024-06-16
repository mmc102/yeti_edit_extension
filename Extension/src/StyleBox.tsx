import React, { useEffect, useState } from 'react';
import { ColorInput, SelectInput, TextInput } from './components/Form';

interface StyleBoxProps {
    target: HTMLElement;
    changes: Record<string, Record<string, string>>;
    onClose: () => void;
}

const StyleBox: React.FC<StyleBoxProps> = ({ target, changes, onClose }) => {
    const targetKey = `${target.tagName}_${target.className}_${target.id}`;
    changes[targetKey] = {};

    const computedStyles = window.getComputedStyle(target);
    const stylesToShow: string[] = ['color', 'background-color', 'font-size', 'align-items', 'justify-content', 'flex-direction'];

    const [styleValues, setStyleValues] = useState(
        stylesToShow.reduce((acc, property) => {
            acc[property] = computedStyles.getPropertyValue(property);
            return acc;
        }, {} as Record<string, string>)
    );
    const [innerText, setInnerText] = useState(target.innerText);

    const handleChange = (property: string, value: string) => {
        if (property === 'innerText') {
            setInnerText(value);
            target.innerText = value;
        } else {
            setStyleValues((prevValues) => ({ ...prevValues, [property]: value }));
            target.style[property as any] = value;
        }
        changes[targetKey][property] = value;
    };

    useEffect(() => {
        return () => {
            onClose();
        };
    }, [onClose]);

    const flexOptions = {
        'align-items': ['stretch', 'center', 'flex-start', 'flex-end', 'baseline'],
        'justify-content': ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
        'flex-direction': ['row', 'row-reverse', 'column', 'column-reverse'],
    };

    const calculateContrastingColor = (bgColor: string): string => {
        const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 155 ? '#000' : '#fff';
    };

    const backgroundColor = '#333';
    const textColor = calculateContrastingColor(backgroundColor);

    return (
        <div
            style={{
                all: 'initial', // CSS reset
                position: 'fixed',
                right: '10px',
                bottom: '10px',
                backgroundColor,
                color: textColor,
                border: '1px solid #444',
                padding: '10px',
                zIndex: 9998,
                maxHeight: '300px',
                overflowY: 'scroll',
                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
                borderRadius: '8px',
                fontFamily: 'Arial, sans-serif',
            }}
            onClick={(e) => e.stopPropagation()}
        >

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>Style Box</span>
                <button
                    onClick={onClose}
                    style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: textColor,
                        fontSize: '16px',
                        cursor: 'pointer',
                    }}
                >
                    &times;
                </button>
            </div>
            {stylesToShow.map((property) => {
                const value = styleValues[property];
                if (property === 'color' || property === 'background-color') {
                    return (
                        <ColorInput
                            key={property}
                            label={property}
                            value={value}
                            property={property}
                            onChange={handleChange}
                        />
                    );
                } else if (property === 'align-items' || property === 'justify-content' || property === 'flex-direction') {
                    return (
                        <SelectInput
                            key={property}
                            label={property}
                            value={value}
                            property={property}
                            options={flexOptions[property]}
                            onChange={handleChange}
                        />
                    );
                } else {
                    return (
                        <TextInput
                            key={property}
                            label={property}
                            value={value}
                            property={property}
                            onChange={handleChange}
                            unit="px"
                        />
                    );
                }
            })}

            <TextInput
                label="Inner Text"
                value={innerText}
                property="innerText"
                onChange={handleChange}
            />
        </div>
    );
};

export default StyleBox;
