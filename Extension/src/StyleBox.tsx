import React, { useEffect } from 'react';
import { ColorInput, TextInput, SelectInput } from './components/Form';

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

    const handleChange = (property: string, value: string) => {
        if (property === 'innerText') {
            target.innerText = value;
        } else {
            target.style[property as any] = value;
        }
        changes[targetKey][property] = value;
    };

    useEffect(() => {
        return () => {
            onClose();
        };
    }, []);

    const flexOptions = {
        'align-items': ['stretch', 'center', 'flex-start', 'flex-end', 'baseline'],
        'justify-content': ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
        'flex-direction': ['row', 'row-reverse', 'column', 'column-reverse'],
    };

    return (
        <div
            style={{
                position: 'fixed',
                right: '10px',
                bottom: '10px',
                backgroundColor: '#333',
                color: '#fff',
                border: '1px solid #444',
                padding: '10px',
                zIndex: 9999,
                maxHeight: '300px',
                overflowY: 'scroll',
                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
                borderRadius: '8px',
                fontFamily: 'Arial, sans-serif',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {stylesToShow.map((property) => {
                const value = computedStyles.getPropertyValue(property);
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
                        />
                    );
                }
            })}
            <TextInput
                label="innerText"
                value={target.innerText}
                property="innerText"
                onChange={handleChange}
            />
        </div>
    );
};

export default StyleBox;
