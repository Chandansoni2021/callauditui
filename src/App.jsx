import { useState, useEffect, lazy, Suspense } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Outlet,
} from "react-router-dom";
 
import Navbar from "./Component/Navbar";
 
// Lazy loaded components
const CallSummary = lazy(() => import("./Products/CallSummary"));
const CallAnalysis = lazy(() => import("./Products/CallAnalysis"));
const Admin = lazy(() => import("./Admin/Admin"));
const HomePage = lazy(() => import("./Products/HomePage"));
const CallEvaluation = lazy(() => import("./Evalution/CallEvalution"));
const UploadDocumentsPopup = lazy(() => import("./Products/UploadDocumentsPopup"));
// const LoginPage = lazy(() => import("./LandingPage/LoginPage"));
const LandingPage = lazy(() => import("./Pages/LandingPage"));
 
// Layout for protected routes
function ProtectedLayout({
  isAuthenticated,
  onLogout,
  showPopup,
  setShowPopup,
  showLoader,
  isSidebarOpen,
  setIsSidebarOpen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
}) {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
 
  return (
    <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Navbar
        showPopup={showPopup}
        setShowPopup={setShowPopup}
        showLoader={showLoader}
        onLogout={onLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
 
function App() {
  const [showPopup, setShowPopup] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // const [isLoginOpen, setIsLoginOpen] = useState(false);
 
  const navigate = useNavigate();
  const location = useLocation(); // 🧠 Get current route path
 
  useEffect(() => {
    let timer;
    if (showPopup) {
      timer = setTimeout(() => {
        setShowPopup(false);
      }, 4000);
    }
    return () => timer && clearTimeout(timer);
  }, [showPopup]);
 
  // const handleLogin = () => {
  //   setIsAuthenticated(true);
  //   localStorage.setItem('isAuthenticated', 'true');
  //   setIsLoginOpen(false);
  //   navigate("/dashboard");
  // };
 
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    navigate("/");
  };
 
  return (
    <div className="app">
      <Suspense fallback={<div className="loader">Loading...</div>}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <LandingPage
                
              />
            }
          />
          {/* <Route
            path="/login"
            element={
              <LoginPage
                onLogin={handleLogin}
                isOpen={isLoginOpen}
                setIsOpen={setIsLoginOpen}
              />
            }
          /> */}
 
          {/* Protected Routes */}
          <Route
            element={
              <ProtectedLayout
                isAuthenticated={isAuthenticated}
                onLogout={handleLogout}
                showPopup={showPopup}
                setShowPopup={setShowPopup}
                showLoader={showLoader}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarCollapsed={isSidebarCollapsed}
                setIsSidebarCollapsed={setIsSidebarCollapsed}
              />
            }
          >
            <Route
              path="/admin"
              element={
                <Admin
                  key={location.pathname}
                  setShowPopup={setShowPopup}
                  setShowLoader={setShowLoader}
                  isSidebarOpen={isSidebarOpen}
                  isSidebarCollapsed={isSidebarCollapsed}
                />
              }
            />
            <Route
              path="/call-analysis"
              element={
                <CallAnalysis
                  key={location.pathname}
                  isSidebarCollapsed={isSidebarCollapsed}
                />
              }
            />
            <Route
              path="/upload-audio"
              element={
                <HomePage
                  key={location.pathname}
                  isSidebarCollapsed={isSidebarCollapsed}
                />
              }
            />
            <Route
              path="/call-summary"
              element={
                <CallSummary
                  key={location.pathname}
                  isSidebarCollapsed={isSidebarCollapsed}
                />
              }
            />
            <Route
              path="/upload-documents"
              element={<UploadDocumentsPopup key={location.pathname} />}
            />
            <Route
              path="/call-evaluation/:call_id"
              element={<CallEvaluation key={location.pathname} />}
            />
          </Route>
 
          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/admin" : "/"} replace />}
          />
        </Routes>
      </Suspense>
    </div>
  );
}
 
export default App;
 
 