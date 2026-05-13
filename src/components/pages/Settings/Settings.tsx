import { useState, useEffect } from "react";
import { useWifiConfig } from "../../../hooks/useWifiConfig";
import styles from "./Settings.module.css";

const formatUpdatedAt = (ts?: number): string => {
    if (!ts) return "";
    return new Date(ts).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const Settings = () => {
    const { config, loading, saving, error: saveError, saveConfig } = useWifiConfig();

    const [ssid, setSsid] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect(() => {
        if (config) {
            setSsid(config.ssid);
            setPassword(config.password);
        }
    }, [config]);

    const handleSsidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSsid(e.target.value);
        setIsDirty(true);
        setFeedback(null);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        setIsDirty(true);
        setFeedback(null);
    };

    const handleCancel = () => {
        setSsid(config?.ssid ?? "");
        setPassword(config?.password ?? "");
        setIsDirty(false);
        setFeedback(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);

        if (!ssid.trim()) {
            setFeedback({ type: "error", message: "SSID cannot be empty." });
            return;
        }

        try {
            await saveConfig(ssid, password);
            setIsDirty(false);
            setFeedback({ type: "success", message: "WiFi credentials saved. ESP32 will use these on next boot." });
        } catch {
            setFeedback({ type: "error", message: saveError ?? "Failed to save. Please try again." });
        }
    };

    return (
        <main className={styles.main}>
            <section className={styles.header}>
                <h1 className={styles.title}>Settings</h1>
                <p className={styles.subtitle}>Manage device configuration for your HYDROSENSE system.</p>
            </section>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardIcon}></span>
                    <h2 className={styles.cardTitle}>WiFi Credentials</h2>
                </div>

                <div className={styles.cardBody}>
                    {!loading && (
                        <div className={styles.statusBanner}>
                            <span className={`${styles.statusDot} ${config?.ssid ? styles.connected : styles.empty}`} />
                            <span className={styles.statusLabel}>Current SSID:</span>
                            <span className={styles.statusValue}>
                                {config?.ssid || "Not configured"}
                            </span>
                            {config?.updatedAt && (
                                <span className={styles.statusTime}>
                                    Updated {formatUpdatedAt(config.updatedAt)}
                                </span>
                            )}
                        </div>
                    )}

                    {loading && (
                        <div className={styles.statusBanner}>
                            <span className={`${styles.statusDot} ${styles.empty}`} />
                            <span className={styles.statusLabel}>Loading current config...</span>
                        </div>
                    )}

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="wifi-ssid">
                                Network Name (SSID)
                            </label>
                            <input
                                id="wifi-ssid"
                                className={styles.input}
                                type="text"
                                placeholder="e.g. MyHomeNetwork"
                                value={ssid}
                                onChange={handleSsidChange}
                                autoComplete="off"
                                maxLength={64}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="wifi-password">
                                Password
                            </label>
                            <div className={styles.inputWrapper}>
                                <input
                                    id="wifi-password"
                                    className={`${styles.input} ${styles.hasToggle}`}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="WiFi password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    autoComplete="new-password"
                                    maxLength={64}
                                />
                                <button
                                    type="button"
                                    className={styles.toggleBtn}
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            <span className={styles.hint}>Leave blank for open (no password) networks.</span>
                        </div>

                        {feedback && (
                            <div className={`${styles.feedbackBar} ${styles[feedback.type]}`}>
                                {feedback.type === "success" ? "✓" : "✗"} {feedback.message}
                            </div>
                        )}

                        {isDirty && (
                            <div className={styles.actions}>
                                <button
                                    type="submit"
                                    className={styles.saveButton}
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : "Save Credentials"}
                                </button>
                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </main>
    );
};

export default Settings;