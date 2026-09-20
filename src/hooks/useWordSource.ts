import { useCallback, useEffect, useState } from "react";

export type SourceMode = "default" | "url" | "custom";

export interface SourceConfig {
  mode: SourceMode;
  url: string;
  custom: string;
}

export type LoadStatus = "loading" | "ready" | "error";

const STORAGE_KEY = "decision-wheel:source-config";

const DEFAULT_CONFIG: SourceConfig = { mode: "default", url: "", custom: "" };

function readStoredConfig(): SourceConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<SourceConfig>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function parseList(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

async function fetchDefaultList(): Promise<string> {
  const res = await fetch(`${import.meta.env.BASE_URL}default-items.txt`);
  if (!res.ok) throw new Error("Could not load the default word list.");
  return res.text();
}

async function resolveText(config: SourceConfig): Promise<string> {
  if (config.mode === "custom") {
    if (!config.custom.trim()) throw new Error("No custom word list was provided.");
    return config.custom;
  }
  if (config.mode === "url") {
    if (!config.url.trim()) throw new Error("No URL was provided.");
    const res = await fetch(config.url);
    if (!res.ok) throw new Error(`Could not load list (HTTP ${res.status}).`);
    return res.text();
  }
  return fetchDefaultList();
}

export function useWordSource() {
  const [config, setConfig] = useState<SourceConfig>(readStoredConfig);
  const [items, setItems] = useState<string[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      setError(null);
      try {
        const text = await resolveText(config);
        const parsed = parseList(text);
        if (parsed.length < 2) {
          throw new Error("The word list must contain at least 2 words.");
        }
        if (!cancelled) {
          setItems(parsed);
          setStatus("ready");
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load word list.";
        if (cancelled) return;
        setError(message);
        if (config.mode !== "default") {
          try {
            const fallback = parseList(await fetchDefaultList());
            if (!cancelled) {
              setItems(fallback);
              setStatus("ready");
            }
            return;
          } catch {
            // fall through to error state below
          }
        }
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [config]);

  const updateConfig = useCallback((next: SourceConfig) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setConfig(next);
  }, []);

  const resetToDefault = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setConfig(DEFAULT_CONFIG);
  }, []);

  return { items, status, error, config, updateConfig, resetToDefault };
}
