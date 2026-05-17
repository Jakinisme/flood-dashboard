import { useState, useCallback, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SideNav from "../SideNav";
import styles from "./Layout.module.css";

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const handleToggle = useCallback(() => {
        setSidebarOpen((prev) => !prev);
    }, []);

    const handleClose = useCallback(() => {
        setSidebarOpen(false);
    }, []);

    return (
        <div className={styles.container}>
            {/* Mobile hamburger button */}
            <button
                className={styles.hamburger}
                onClick={handleToggle}
                aria-label="Toggle navigation"
            >
                <span className={`${styles.hamburgerLine} ${sidebarOpen ? styles.hamburgerOpen : ""}`} />
                <span className={`${styles.hamburgerLine} ${sidebarOpen ? styles.hamburgerOpen : ""}`} />
                <span className={`${styles.hamburgerLine} ${sidebarOpen ? styles.hamburgerOpen : ""}`} />
            </button>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div className={styles.overlay} onClick={handleClose} />
            )}

            <section className={`${styles.Sidebar} ${sidebarOpen ? styles.sidebarVisible : ""}`}>
                <div className={styles.sidebarContent}>
                    <SideNav />
                </div>
            </section>
            <section className={styles.MainContent}>
                <Outlet />
            </section>
        </div>
    );
};

export default Layout;
