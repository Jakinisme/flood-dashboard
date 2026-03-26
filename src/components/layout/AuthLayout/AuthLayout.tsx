import React from 'react';
import { Link } from 'react-router-dom';

import logoImage from '../../../assets/icons/logo.svg';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    footerText: string;
    footerLinkText: string;
    footerLinkTo: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
    title,
    subtitle,
    children,
    footerText,
    footerLinkText,
    footerLinkTo
}) => {
    return (
        <div className={styles.layout}>
            <div className={styles.formSection}>
                <div className={styles.contentContainer}>
                    <div className={styles.logo}>
                        <span>HYDROSENSE</span>
                    </div>

                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.subtitle}>{subtitle}</p>

                    {children}

                    <div className={styles.footer}>
                        {footerText}
                        <Link to={footerLinkTo} className={styles.link}>
                            {footerLinkText}
                        </Link>
                    </div>
                </div>
            </div>

            <div className={styles.brandingSection}>
                <div className={styles.brandingContent}>
                    <img src={logoImage} alt="HYDROSENSE Logo" className={styles.brandingLogo} />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
