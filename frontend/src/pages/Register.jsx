import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return alert("Passwords don't match");

    try {
      await api.post("http://localhost:8000/auth/register", {
        email: form.email,
        password: form.password,
      });
      alert("Registered! Now log in.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
        <div className="flex h-screen w-full">
{/* Left - Form */}
<div className="w-1/2 flex justify-center items-center bg-emerald-900 px-10">
  <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
    <h1 className="text-3xl font-bold text-green-950 mb-6">Create Account</h1>
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
      <Input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} />
      <Input type="password" name="confirm" placeholder="Confirm Password" value={form.confirm} onChange={handleChange} />
      <Button type="submit" className="w-full bg-green-950 text-white hover:bg-green-900">Register</Button>
    </form>
    <p className="mt-4 text-sm text-center text-gray-600">
      Already have an account? <a className="text-green-700 font-medium" href="/login">Login</a>
    </p>
  </div>
</div>


        {/* Right - Image */}
        <div className="w-1/2 bg-white flex justify-center items-center">
            <div aria-hidden="true" className="h-full w-full bg-gradient-to-br from-emerald-700 to-slate-950" />
        </div>
        </div>

  );
}

export default Register;
