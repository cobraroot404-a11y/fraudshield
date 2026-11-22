import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("http://localhost:8000/auth/login", form);
      const token = res.data.access_token;
      const decoded = JSON.parse(atob(token.split('.')[1])); // decode JWT payload

      localStorage.setItem("token", token);
      localStorage.setItem("role", decoded.role);

      // Redirect based on role
      if (decoded.role === "admin") {
        navigate("/admin/transactions");
      } else if (decoded.role === "analyst") {
        navigate("/analyst");
      } else {
        navigate("/");
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <>
      {/* Marketplace Button (Top-Right) */}
      <div className="absolute top-6 right-10 z-50">
        <Link to="/marketplace">
          <button className="px-5 py-2 rounded-xl bg-emerald-900 text-white font-semibold shadow hover:bg-emerald-700 transition">
            Go to Marketplace
          </button>
        </Link>
      </div>

      <div className="flex min-h-screen">
        {/* Left: Form */}
        <div className="w-1/2 flex justify-center items-center bg-emerald-800 px-10">
          <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-green-950 mb-6">Login</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
              />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
              />
              <Button type="submit" className="w-full bg-green-950 text-white hover:bg-green-900">
                Login
              </Button>
            </form>
            <p className="mt-4 text-sm text-center text-gray-600">
              Don’t have an account?{" "}
              <a className="text-green-700 font-medium" href="/register">
                Register
              </a>
            </p>
          </div>
        </div>

        {/* Right: Image */}
        <div className="w-1/2 bg-gray-100 flex justify-center items-center">
          <div aria-hidden="true" className="h-full w-full bg-gradient-to-br from-emerald-700 to-slate-950" />
        </div>
      </div>
    </>
  );
}

export default Login;
