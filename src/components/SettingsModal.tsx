import { useEffect, useState } from "react";
import styled from "styled-components";
import type { SourceConfig, SourceMode } from "../hooks/useWordSource";
import { Icon } from "./Icon";

interface SettingsModalProps {
    open: boolean;
    config: SourceConfig;
    onClose: () => void;
    onSave: (config: SourceConfig) => void;
    onReset: () => void;
}

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 10;
`;

const Panel = styled.div`
    width: min(90vw, 520px);
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 12px;
    padding: 1.5rem;
    color: ${({ theme }) => theme.colors.text};
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;

    h2 {
        margin: 0;
        font-size: 1.25rem;
    }
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: pointer;
    display: flex;
    padding: 0.25rem;

    &:hover {
        color: ${({ theme }) => theme.colors.text};
    }
`;

const Tabs = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
`;

const Tab = styled.button<{ $active: boolean }>`
    flex: 1;
    padding: 0.5rem 1rem;
    border-radius: 12px;
    border: 1px solid
        ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.border)};
    background: ${({ theme, $active }) => ($active ? theme.colors.accent : "transparent")};
    color: ${({ theme, $active }) => ($active ? theme.colors.accentText : theme.colors.text)};
    cursor: pointer;
    font-weight: 600;
    transition: all 0.15s ease;
`;

const Field = styled.div`
    margin-bottom: 1rem;

    label {
        display: block;
        margin-bottom: 0.4rem;
        color: ${({ theme }) => theme.colors.textMuted};
        font-size: 0.85rem;
    }
`;

const TextInput = styled.input`
    width: 100%;
    padding: 0.6rem 0.75rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.95rem;

    &:focus {
        outline: 2px solid ${({ theme }) => theme.colors.accent};
    }
`;

const TextArea = styled.textarea`
    width: 100%;
    min-height: 200px;
    resize: vertical;
    padding: 0.6rem 0.75rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.95rem;
    font-family: inherit;

    &:focus {
        outline: 2px solid ${({ theme }) => theme.colors.accent};
    }
`;

const ErrorText = styled.p`
    color: ${({ theme }) => theme.colors.accent};
    font-size: 0.85rem;
    margin: 0 0 1rem;
`;

const Footer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
`;

const ButtonRow = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const GhostButton = styled.button`
    padding: 0.55rem 1rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    cursor: pointer;

    &:hover {
        border-color: ${({ theme }) => theme.colors.accent};
    }
`;

const PrimaryButton = styled.button`
    padding: 0.55rem 1.25rem;
    border-radius: 8px;
    border: none;
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accentText};
    font-weight: 600;
    cursor: pointer;

    &:hover {
        filter: brightness(1.1);
    }
`;

export function SettingsModal({
    open,
    config,
    onClose,
    onSave,
    onReset,
}: SettingsModalProps) {
    const [mode, setMode] = useState<SourceMode>(
        config.mode === "default" ? "url" : config.mode,
    );
    const [url, setUrl] = useState(config.url);
    const [custom, setCustom] = useState(config.custom);
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setMode(config.mode === "default" ? "url" : config.mode);
            setUrl(config.url);
            setCustom(config.custom);
            setValidationError(null);
        }
    }, [open, config]);

    if (!open) return null;

    const handleSave = () => {
        if (mode === "url" && !url.trim()) {
            setValidationError("Please enter a URL to a text file.");
            return;
        }
        if (mode === "custom" && !custom.trim()) {
            setValidationError("Please enter at least one word.");
            return;
        }
        onSave({ mode, url, custom });
        onClose();
    };

    const handleReset = () => {
        onReset();
        onClose();
    };

    return (
        <Overlay onMouseDown={onClose}>
            <Panel onMouseDown={(e) => e.stopPropagation()}>
                <Header>
                    <h2>Word list source</h2>
                    <CloseButton onClick={onClose} aria-label="Close">
                        <Icon name="close-outline" size={22} />
                    </CloseButton>
                </Header>

                <Tabs>
                    <Tab
                        type="button"
                        $active={mode === "url"}
                        onClick={() => setMode("url")}
                    >
                        From URL
                    </Tab>
                    <Tab
                        type="button"
                        $active={mode === "custom"}
                        onClick={() => setMode("custom")}
                    >
                        Custom list
                    </Tab>
                </Tabs>

                {mode === "url" ? (
                    <Field>
                        <label htmlFor="source-url">
                            URL to a plain text file (one word per line)
                        </label>
                        <TextInput
                            id="source-url"
                            type="url"
                            placeholder="https://example.com/words.txt"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </Field>
                ) : (
                    <Field>
                        <label htmlFor="source-custom">One word per line</label>
                        <TextArea
                            id="source-custom"
                            placeholder={"Pizza\nSushi\nTacos"}
                            value={custom}
                            onChange={(e) => setCustom(e.target.value)}
                        />
                    </Field>
                )}

                {validationError && <ErrorText>{validationError}</ErrorText>}

                <Footer>
                    <GhostButton type="button" onClick={handleReset}>
                        Reset to default
                    </GhostButton>
                    <ButtonRow>
                        <GhostButton type="button" onClick={onClose}>
                            Cancel
                        </GhostButton>
                        <PrimaryButton type="button" onClick={handleSave}>
                            Save &amp; load
                        </PrimaryButton>
                    </ButtonRow>
                </Footer>
            </Panel>
        </Overlay>
    );
}
