import { NavLink } from "react-router-dom";
import { MdDashboard, MdHistory, MdLogout } from "react-icons/md";

import Button from "../../ui/Button";
import Profile from "../../ui/Profile/Profile";
import styles from "./SideNav.module.css";
import { useAuth } from "../../../hooks/useAuth";

const SideNav = () => {
  const { logout } = useAuth();

  const menuItems = [
    {
      path: "/",
      icon: <MdDashboard className={styles.icon} />,
      label: "Dashboard",
    },

    {
      path: "/history",
      icon: <MdHistory className={styles.icon} />,
      label: "History",
    },
  ];

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    try {
      await logout();
    } catch (error) {
      console.error("Unable to logout:", error);
    }
  };

  return (
    <nav className={styles.SideNav}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <span>HYDROSENSE</span>
        </div>

        <div className={styles.menu}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `${styles.ButtonMenu} ${isActive ? styles.active : ""}`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
          <div className={styles.ButtonMenu}>
            <Button onClick={handleLogout}>
              <MdLogout className={styles.icon} />
              Logout
            </Button>
          </div>
        </div>
        <div className={styles.profile}>
          <Profile />
        </div>
      </div>
    </nav>
  );
};

export default SideNav;