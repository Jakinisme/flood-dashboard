import { useEffect, useState, useCallback } from "react";
import { onValue, ref, set } from "firebase/database";
import { database } from "../services/Firebase";

export interface WifiConfig {
    ssid: string;
    password: string;
    updatedAt?: number;
}

interface UseWifiConfigResult {
    config: WifiConfig | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
    saveConfig: (ssid: string, password: string) => Promise<void>;
}

const WIFI_CONFIG_PATH = "config/wifi";

export const useWifiConfig = (): UseWifiConfigResult => {
    const [config, setConfig] = useState<WifiConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const configRef = ref(database, WIFI_CONFIG_PATH);

        const unsubscribe = onValue(
            configRef,
            (snapshot) => {
                const raw = snapshot.val() as Record<string, unknown> | null;

                if (!raw) {
                    setConfig(null);
                } else {
                    setConfig({
                        ssid: String(raw.ssid ?? ""),
                        password: String(raw.password ?? ""),
                        updatedAt: raw.updatedAt ? Number(raw.updatedAt) : undefined,
                    });
                }

                setError(null);
                setLoading(false);
            },
            (firebaseError) => {
                setError(firebaseError.message);
                setLoading(false);
            },
        );

        return () => unsubscribe();
    }, []);

    const saveConfig = useCallback(async (ssid: string, password: string) => {
        setSaving(true);
        setError(null);

        try {
            const configRef = ref(database, WIFI_CONFIG_PATH);
            await set(configRef, {
                ssid: ssid.trim(),
                password: password,
                updatedAt: Date.now(),
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to save WiFi config.";
            setError(message);
            throw err;
        } finally {
            setSaving(false);
        }
    }, []);

    return { config, loading, saving, error, saveConfig };
};