import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import Post from "./pages/Post";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthContext } from "./helpers/AuthContext";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaUser } from "react-icons/fa"; // Correct import

function App() {
  const [authState, setAuthState] = useState({
    username: "",
    id: 0,
    status: false,
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      axios
        .get("http://localhost:3001/auth", {
          headers: {
            accessToken: token,
          },
        })
        .then((response) => {
          if (response.data.error) {
            setAuthState({ username: "", id: 0, status: false });
          } else {
            setAuthState({
              username: response.data.username,
              id: response.data.id,
              status: true,
            });
          }
        })
        .catch((error) => {
          console.error("Token validation failed", error);
          setAuthState({ username: "", id: 0, status: false });
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setAuthState({
      username: "",
      id: 0,
      status: false,
    });
    setDropdownOpen(false); // Close dropdown on logout
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", closeDropdown);
    return () => {
      document.removeEventListener("mousedown", closeDropdown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <AuthContext.Provider value={{ authState, setAuthState }}>
        <Router>
          <nav className="bg-blue-700 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex-shrink-0">
                  <Link to="/" className="text-white text-2xl font-semibold">
                    MyApp
                  </Link>
                </div>
                <div className="hidden md:flex space-x-4">
                  <Link
                    to="/"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Home
                  </Link>
                  <Link
                    to="/create-post"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Create Post
                  </Link>
                </div>
                <div
                  className="hidden md:flex items-center space-x-4 relative"
                  ref={dropdownRef}
                >
                  {!authState.status ? (
                    <>
                      <Link
                        to="/login"
                        className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Register
                      </Link>
                    </>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={toggleDropdown}
                        className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
                      >
                        {authState.username} <FaUser className="ml-2" />
                      </button>
                      {dropdownOpen && (
                        <div
                          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                          onMouseEnter={() => setDropdownOpen(true)}
                          onMouseLeave={() => setDropdownOpen(false)}
                        >
                          <Link
                            to="/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Profile
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </nav>

          <main className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create-post" element={<CreatePost />} />
                <Route path="/post/:id" element={<Post />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </div>
          </main>
        </Router>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
