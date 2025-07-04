import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const [loggedin, setLogin] = useState(false);
  useEffect(() => {
    const log = localStorage.getItem("data");
    setLogin(!!log); // Set to true if data exists, otherwise false
  }, []);
  const handelLogout = () => {
    localStorage.removeItem("data");
    navigate("/login")
  }
  return (
    <div className="min-h-screen bg-orange-50">
      {/* Simple Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xl">T</div>
            <span className="ml-3 text-xl font-semibold text-orange-800">TaskFlow</span>
          </div>
          <div className="flex items-center space-x-4">
            {!loggedin ? (
              <Link to="/login" className="px-4 py-2 text-orange-600 hover:text-orange-800">
                Login
              </Link>
            ) : (
              <button onClick={handelLogout} className="px-4 py-2 text-orange-600 hover:text-orange-800">Logout</button>

            )}

            <Link to="/dashboard" className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-r from-orange-400 to-orange-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Streamline Your Workflow</h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">Simple, intuitive kanban boards for your team</p>
          <Link to="/login" className="inline-block px-8 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors shadow-md">
            Get Started
          </Link>
        </div>
      </header>

      {/* Key Features */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-orange-800 mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "1. Create Boards",
              description: "Make a workspace for your projects"
            },
            {
              title: "2. Add Tasks",
              description: "Organize work into todo, doing, done"
            },
            {
              title: "3. Collaborate",
              description: "Invite team members and work together"
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm text-center">
              <h3 className="text-xl font-semibold text-orange-800 mb-2">{feature.title}</h3>
              <p className="text-orange-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-orange-200 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-orange-500">
          © {new Date().getFullYear()} TaskFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;