import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Icon } from "./components/Icon";
import { PinterestIcon } from "./components/PinterestIcon";
import { SettingsModal } from "./components/SettingsModal";
import { Spinner, type SpinnerHandle } from "./components/Spinner";
import { useWordSource } from "./hooks/useWordSource";

function buildPinterestUrl(word: string) {
  const trimmed = word
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim()
    .toLowerCase();
  return `https://de.pinterest.com/search/pins/?q=${encodeURIComponent(trimmed)}`;
}

const Page = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.75;
`;

const MainTitle = styled.h1`
  font-weight: 300;
`;

const SettingsButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.85rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.75rem;
  padding: 1.5rem;
  text-align: center;
`;

const StatusText = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  min-height: 1.2em;
  margin: 0;
`;

const ErrorBanner = styled.p`
  color: ${({ theme }) => theme.colors.accent};
  margin: 0;
  font-size: 0.9rem;
`;

const SpinButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 20ch;
  padding: 0.85rem 2rem;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accentText};
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    filter 0.15s ease,
    opacity 0.15s ease;

  &:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PinterestButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  padding: 0;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition:
    filter 0.15s ease,
    opacity 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function App() {
  const { items, status, error, config, updateConfig, resetToDefault } =
    useWordSource();
  const spinnerRef = useRef<SpinnerHandle>(null);
  const [spinning, setSpinning] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const hasAutoSpun = useRef(false);

  useEffect(() => {
    setCurrentWord(items.length ? items[0] : null);
  }, [items]);

  useEffect(() => {
    if (status === "ready" && items.length >= 2 && !hasAutoSpun.current) {
      hasAutoSpun.current = true;
      const timer = window.setTimeout(() => spinnerRef.current?.spin(), 250);
      return () => window.clearTimeout(timer);
    }
  }, [status, items]);

  const handleSpin = () => spinnerRef.current?.spin();

  const handlePinterest = () => {
    if (!currentWord) return;
    window.open(buildPinterestUrl(currentWord), "_blank", "noopener,noreferrer");
  };

  return (
    <Page>
      <Header>
        <HeaderTitle>Drawing Decision Wheel</HeaderTitle>
        <SettingsButton type="button" onClick={() => setSettingsOpen(true)}>
          <Icon name="settings-2-outline" size={18} />
          Word list
        </SettingsButton>
      </Header>

      <Main>
        <MainTitle>No idea what to draw? Here you go!</MainTitle>
        {error && <ErrorBanner>{error}</ErrorBanner>}
        {status === "loading" && items.length === 0 ? (
          <StatusText>Loading word list…</StatusText>
        ) : (
          <Spinner
            ref={spinnerRef}
            items={items}
            onSpinStart={() => setSpinning(true)}
            onSpinEnd={(word) => {
              setSpinning(false);
              setCurrentWord(word);
            }}
          />
        )}
        <ButtonRow>
          <SpinButton
            type="button"
            onClick={handleSpin}
            disabled={spinning || items.length < 2}
          >
            <Icon name="refresh-outline" size={20} />
            {spinning ? "Spinning…" : "Spin"}
          </SpinButton>
          <PinterestButton
            type="button"
            onClick={handlePinterest}
            disabled={spinning || !currentWord}
            aria-label="Search this word on Pinterest"
            title="Search this word on Pinterest"
          >
            <PinterestIcon size={20} />
          </PinterestButton>
        </ButtonRow>
      </Main>

      <SettingsModal
        open={settingsOpen}
        config={config}
        onClose={() => setSettingsOpen(false)}
        onSave={updateConfig}
        onReset={resetToDefault}
      />
    </Page>
  );
}

export default App;
