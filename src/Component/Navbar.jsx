import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaPhone,
  FaChartBar,
  FaChevronDown,
  FaBars,
  FaCloudUploadAlt,
  FaUserCircle,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaUserShield,
  FaFileInvoiceDollar ,

  FaBell,
  FaTrash
} from "react-icons/fa";
import notificationSound from "../assets/notification.mp3";

const Navbar = ({
  showLoader,
  isSidebarOpen,
  setIsSidebarOpen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  onLogout,
  uploadProgress = 0,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [latestPopupMessage, setLatestPopupMessage] = useState(null);
  const clearedNotifIds = useRef(new Set());
  const audioRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/admin", icon: <FaHome className="w-3 h-3 text-gray-700" />, label: "Admin" },
    { path: "/call-analysis", icon: <FaChartBar className="w-3 h-3 text-gray-700" />, label: "Call Analysis" },
    { path: "/upload-documents", icon: <FaCloudUploadAlt className="w-3 h-3 text-gray-700" />, label: "Upload Data" },
    { path: "/upload-audio", icon: <FaUserShield className="w-3 h-3 text-gray-700" />, label: "Upload audio" },
    { path: "/Billing", icon: <FaFileInvoiceDollar className="w-3 h-3 text-gray-700" />, label: "Usage & Billing Dashboard" }
  ];

  useEffect(() => {
    // Initialize audio ref
    audioRef.current = new Audio(notificationSound);
    
    // Load cleared notifications from localStorage
    const savedClearedNotifs = localStorage.getItem('clearedNotifIds');
    if (savedClearedNotifs) {
      clearedNotifIds.current = new Set(JSON.parse(savedClearedNotifs));
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (accessToken && refreshToken) {
        await fetch("http://65.0.95.155:8000/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      onLogout();
      navigate("/");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setIsDropdownOpen(false);
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen, isNotifOpen]);

  return (
    <>
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-1 lg:px-6 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 mr-2 text-gray-600 rounded-lg cursor-pointer lg:hidden hover:bg-gray-100"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>Meridian CallPro<button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:block p-2 mr-2 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-100"
              aria-label="Collapse sidebar"
            >
              {isSidebarCollapsed ? <FaChevronRight size={20} /> : <FaChevronLeft size={20} />}
            </button>

            <Link to="/" className="flex items-center">
              {!isSidebarCollapsed && (
                <span className="text-xl font-semibold text-gray-800 whitespace-nowrap"></span>
              )}
            </Link>
          </div>

          <div className="hidden md:flex flex-1 justify-center">
            <span className="text-2xl font-semibold text-gray-800">
              {navItems.find((item) => item.path === location.pathname)?.label || "Admin"}
            </span>
          </div>

          <div className="flex items-center space-x-4 relative dropdown-container">
            {/* Notification Bell */}
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setHasNewNotification(false);
              }}
              className="relative p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              aria-label="Notifications"
            >
              <FaBell size={20} />
              {hasNewNotification && (
                <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-12 top-12 z-50 w-80 max-h-96 overflow-auto bg-white rounded-md shadow-lg border border-gray-200">
                <div className="flex justify-between items-center p-3 text-gray-800 font-semibold border-b border-gray-200">
                  <span>Notifications ({notifications.length})</span>
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearAllNotifications}
                      className="text-red-500 hover:text-red-700 flex items-center text-sm"
                      title="Clear all notifications"
                    >
                      <FaTrash className="mr-1" /> Clear All
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-gray-500 text-sm">No notifications to display</div>
                ) : (
                  <ul className="text-sm text-gray-700 max-h-80 overflow-y-auto">
                    {notifications.map((notif, index) => (
                      <li key={index} className="px-4 py-2 border-b border-gray-200 hover:bg-gray-50">
                        {notif.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* User Dropdown */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 text-sm rounded-full focus:ring-4 focus:ring-gray-200 px-3 py-1 hover:bg-gray-100"
              aria-label="User menu"
            >
              <FaUserCircle className="w-8 h-8 text-gray-600" />
              {!isSidebarCollapsed && (
                <FaChevronDown
                  className={`ml-2 text-gray-600 transition-transform ${isDropdownOpen ? "rotate-180" : "rotate-0"}`}
                />
              )}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-12 z-50 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-50 h-screen pt-20 transition-transform bg-white border-r border-gray-200 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-100"
        } lg:translate-x-0 ${isSidebarCollapsed ? "lg:w-20" : "lg:w-50"}`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 pb-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg ${
                    location.pathname === item.path 
                      ? "bg-blue-50 text-blue-600" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  title={item.label}
                >
                  <span className={`${isSidebarCollapsed ? "mx-auto" : "mr-3"}`}>{item.icon}</span>
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Loader */}
      {showLoader && (
        <div className="fixed bottom-4 left-4 bg-white text-gray-800 p-4 rounded-lg shadow-lg z-50 border border-gray-200">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3"></div>
            <div>
              <h2 className="text-lg font-semibold">Processing...</h2>
              <p className="text-sm text-gray-600">Analyzing file, please wait...</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}

      {/* New Notification Popup */}
      {latestPopupMessage && (
        <div className="fixed bottom-4 right-4 bg-white text-gray-800 p-4 rounded-lg shadow-lg z-50 border border-gray-200 animate-fade-in-up">
          <div className="flex items-center">
            <div className="bg-blue-500 text-white rounded-full p-2 mr-3">
              <FaBell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">New Notification</h2>
              <p className="text-sm text-gray-600">{latestPopupMessage}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;