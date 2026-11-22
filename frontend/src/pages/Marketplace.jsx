import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { v4 as uuidv4 } from "uuid";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
  } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { isTestCheckoutKey } from "@/lib/checkout";
import { Star, Shield, TrendingUp, Zap, Users, Lock, Brain, CreditCard, Globe, BarChart3, AlertTriangle, Smartphone, PlusCircle } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Secure UPI Gateway",
    desc: "Seamless and secure UPI payments with 99.9% uptime guarantee.",
    price: "₹499",
    originalPrice: "₹599",
    rating: 4.8,
    reviews: 324,
    category: "Payment Gateway",
    icon: CreditCard,
    badge: "Popular",
    features: ["Real-time processing", "Multi-bank support", "24/7 monitoring"]
  },
  {
    id: 2,
    name: "Risk Analytics Engine",
    desc: "Real-time transaction risk analysis with machine learning algorithms.",
    price: "₹999",
    originalPrice: "₹1,199",
    rating: 4.9,
    reviews: 156,
    category: "Analytics",
    icon: TrendingUp,
    badge: "Best Seller",
    features: ["AI-powered insights", "Custom dashboards", "API integration"]
  },
  {
    id: 3,
    name: "Fraud Detection API",
    desc: "ML-powered fraud detection system with 95% accuracy rate.",
    price: "₹1,299",
    originalPrice: "₹1,499",
    rating: 4.7,
    reviews: 89,
    category: "Security",
    icon: Shield,
    badge: "New",
    features: ["Machine learning", "Real-time alerts", "Custom rules"]
  },
  {
    id: 4,
    name: "Cybersecurity Shield",
    desc: "Advanced encryption and protection for your financial data.",
    price: "₹799",
    originalPrice: "₹999",
    rating: 4.6,
    reviews: 234,
    category: "Security",
    icon: Lock,
    badge: null,
    features: ["End-to-end encryption", "Multi-factor auth", "Compliance ready"]
  },
  {
    id: 5,
    name: "Banking API Toolkit",
    desc: "Complete suite for integrating core banking features seamlessly.",
    price: "₹1,499",
    originalPrice: "₹1,799",
    rating: 4.8,
    reviews: 178,
    category: "Integration",
    icon: Globe,
    badge: "Enterprise",
    features: ["50+ APIs", "SDK included", "Documentation"]
  },
  {
    id: 6,
    name: "AI Transaction Monitor",
    desc: "Intelligent monitoring system to detect and prevent fraudulent activities.",
    price: "₹899",
    originalPrice: "₹1,099",
    rating: 4.7,
    reviews: 267,
    category: "AI/ML",
    icon: Brain,
    badge: null,
    features: ["24/7 monitoring", "Smart alerts", "Pattern recognition"]
  },
  {
    id: 7,
    name: "Digital Wallet SDK",
    desc: "Ready-to-use wallet solution with seamless user experience.",
    price: "₹1,199",
    originalPrice: "₹1,399",
    rating: 4.5,
    reviews: 143,
    category: "Payment Gateway",
    icon: Smartphone,
    badge: null,
    features: ["Cross-platform", "QR payments", "Loyalty programs"]
  },
  {
    id: 8,
    name: "Compliance Automation",
    desc: "Automated regulatory compliance and reporting for financial institutions.",
    price: "₹1,799",
    originalPrice: "₹2,099",
    rating: 4.9,
    reviews: 92,
    category: "Compliance",
    icon: AlertTriangle,
    badge: "Premium",
    features: ["Auto reporting", "Multi-region", "Audit trails"]
  },
  {
    id: 9,
    name: "Customer Analytics Hub",
    desc: "Deep insights into customer behavior and transaction patterns.",
    price: "₹1,099",
    originalPrice: "₹1,299",
    rating: 4.6,
    reviews: 201,
    category: "Analytics",
    icon: BarChart3,
    badge: null,
    features: ["360° view", "Predictive analytics", "Custom reports"]
  },
  {
    id: 10,
    name: "Multi-Currency Exchange",
    desc: "Real-time currency conversion with competitive exchange rates.",
    price: "₹699",
    originalPrice: "₹849",
    rating: 4.4,
    reviews: 187,
    category: "Exchange",
    icon: Globe,
    badge: null,
    features: ["150+ currencies", "Live rates", "Low fees"]
  },
  {
    id: 11,
    name: "Biometric Authentication",
    desc: "Advanced biometric security for secure user authentication.",
    price: "₹949",
    originalPrice: "₹1,149",
    rating: 4.8,
    reviews: 156,
    category: "Security",
    icon: Users,
    badge: "Trending",
    features: ["Fingerprint", "Face recognition", "Voice auth"]
  },
  {
    id: 12,
    name: "Payment Orchestration",
    desc: "Intelligent payment routing and optimization platform.",
    price: "₹1,599",
    originalPrice: "₹1,899",
    rating: 4.7,
    reviews: 134,
    category: "Payment Gateway",
    icon: Zap,
    badge: "Enterprise",
    features: ["Smart routing", "Fallback options", "Cost optimization"]
  }
];

const categories = ["All", "Payment Gateway", "Security", "Analytics", "AI/ML", "Integration", "Compliance", "Exchange"];

const MarketplaceHome = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [lastTxResponse, setLastTxResponse] = useState(null);

  // For transaction card
  const [txDialogOpen, setTxDialogOpen] = useState(false);
  const [txForm, setTxForm] = useState({
    name: "",
    email: "",
    contact: "",
    amount: "",
    location: "",
  });
  const [txStatus, setTxStatus] = useState("");

  // For products
  const [userDetails, setUserDetails] = useState({ name: "", email: "", contact: "" });
  const [selectedProduct, setSelectedProduct] = useState(null);

  const getIP = async () => {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip;
  };

  const getLocation = async (ip) => {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await res.json();
    return `${data.city}, ${data.region}, ${data.country_name}`;
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Autofill location when dialog opens
  useEffect(() => {
    if (txDialogOpen && !txForm.location) {
      (async () => {
        const ip = await getIP();
        const location = await getLocation(ip);
        setTxForm(f => ({ ...f, location }));
      })();
    }
    // eslint-disable-next-line
  }, [txDialogOpen]);

  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter(product => product.category === selectedCategory);

  // ---------- Create Transaction Card Logic ----------
  const handleTxChange = (e) => {
    setTxForm({ ...txForm, [e.target.name]: e.target.value });
  };

  const scanReceipt = async (event) => {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Sign in before scanning a receipt.");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    try {
      const response = await fetch("http://localhost:8000/ocr/scan", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!response.ok) throw new Error("Receipt scanner unavailable");
      const receipt = await response.json();
      if (receipt.amount !== null) {
        setTxForm((current) => ({ ...current, amount: String(receipt.amount) }));
      } else {
        alert("No receipt total was found. Enter the amount manually.");
      }
    } catch {
      alert("Unable to scan this receipt. You can enter the amount manually.");
    }
  };

  const handleTxSubmit = async (e) => {
    e.preventDefault();
    setTxStatus("Processing...");
    setLastTxResponse(null);

    const ip = await getIP();

    // Only send fields required by backend model
    const txData = {
      amount: Number(txForm.amount),
      sender: txForm.email,
      receiver: "FraudShield Marketplace",
      location: txForm.location,
      ip_address: ip,
      device_id: uuidv4(),
    };

    try {
      const res = await fetch("http://localhost:8000/transactions/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(txData),
      });
      const data = await res.json();
      setLastTxResponse(data);
      if (data.status === "approved") {
        setTxStatus(`✅ Approved! Please complete the payment.`);
        // Here, you can open Razorpay, or show a "Pay Now" button.
      } else if (data.status === "flagged") {
        setTxStatus(`🚨 Flagged as High Risk! Waiting for manual review by admin/analyst.`);
      } else {
        setTxStatus("❌ Unknown status. Something went wrong.");
      }
    } catch (err) {
      setTxStatus("❌ Error submitting transaction.");
    }
  };

  // ---------- Product Payment Logic ----------
  const handlePayment = async (product, userDetails) => {
    const checkoutKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!isTestCheckoutKey(checkoutKey) || typeof window.Razorpay !== "function") {
      alert("Configure a Razorpay test-mode key to use demo checkout.");
      return;
    }
    const ip = await getIP();
    const location = await getLocation(ip);
    const amountInPaise = parseInt(product.price.replace("₹", "")) * 100;
    const deviceId = uuidv4();

    const options = {
      key: checkoutKey,
      amount: amountInPaise,
      currency: "INR",
      name: product.name,
      description: product.desc,
      handler: function (response) {
        // Only send what backend expects
        const txData = {
          amount: parseInt(product.price.replace("₹", "")),
          sender: userDetails.email,
          receiver: "FraudShield Marketplace",
          location: location,
          ip_address: ip,
          device_id: deviceId,
        };

        fetch("http://localhost:8000/transactions/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(txData),
        })
          .then((res) => res.json())
          .then((data) => console.log("✅ Transaction saved:", data))
          .catch((err) => console.error("❌ Failed to save transaction", err));
      },
      prefill: {
        name: userDetails.name || "Guest",
        email: userDetails.email || "guest@example.com",
        contact: userDetails.contact || "0000000000",
      },
      theme: {
        color: "#0d6efd",
      },
      modal: {
        ondismiss: function () {
          console.log("❌ Payment Cancelled");
          const failedData = {
            status: "failed",
            product_id: product.id,
            product_name: product.name,
            reason: "User cancelled the payment",
            created_at: new Date().toISOString(),
          };
          console.log("❌ Payment Failed:", failedData);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const getBadgeColor = (badge) => {
    switch(badge) {
      case "Popular": return "bg-blue-100 text-blue-800";
      case "Best Seller": return "bg-green-100 text-green-800";
      case "New": return "bg-purple-100 text-purple-800";
      case "Enterprise": return "bg-orange-100 text-orange-800";
      case "Premium": return "bg-red-100 text-red-800";
      case "Trending": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              <span className="text-blue-600">🛡️ FraudShield</span> Marketplace
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
              Discover cutting-edge fintech solutions to secure, analyze, and optimize your financial operations
            </p>
            <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Enterprise Ready</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4" />
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>10,000+ Customers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full transition-all ${
                  selectedCategory === category
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid + Create Transaction Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* --- Create Transaction Card --- */}
          <Card className="bg-white border border-green-200 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-7 h-7 text-green-700" />
                <CardTitle className="text-xl font-bold text-green-900">
                  Create Transaction
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-green-800 hover:bg-amber-700 text-white font-semibold mt-3"
                onClick={() => setTxDialogOpen(true)}
              >
                New Transaction
              </Button>
              <Dialog open={txDialogOpen} onOpenChange={setTxDialogOpen}>
                <DialogContent className="bg-white rounded-lg shadow-xl p-6">
                  <DialogHeader>
                    <DialogTitle>Create Transaction</DialogTitle>
                  </DialogHeader>
                  <form className="flex flex-col gap-3" onSubmit={handleTxSubmit}>
                    {import.meta.env.VITE_ENABLE_RECEIPT_SCAN === "true" && (
                      <label className="text-sm">
                        Scan a test receipt
                        <input type="file" accept="image/png,image/jpeg" onChange={scanReceipt} />
                      </label>
                    )}
                    <input
                      type="text"
                      name="name"
                      placeholder="Name"
                      className="border rounded px-4 py-2"
                      value={txForm.name}
                      onChange={handleTxChange}
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      className="border rounded px-4 py-2"
                      value={txForm.email}
                      onChange={handleTxChange}
                      required
                    />
                    <input
                      type="tel"
                      name="contact"
                      placeholder="Contact"
                      className="border rounded px-4 py-2"
                      value={txForm.contact}
                      onChange={handleTxChange}
                      required
                    />
                    <input
                      type="number"
                      name="amount"
                      placeholder="Amount (₹)"
                      className="border rounded px-4 py-2"
                      value={txForm.amount}
                      onChange={handleTxChange}
                      required
                    />
                    <input
                      type="text"
                      name="location"
                      placeholder="Location (e.g., India, US, Nigeria)"
                      className="border rounded px-4 py-2"
                      value={txForm.location}
                      onChange={handleTxChange}
                      required
                    />
                    <DialogFooter>
                      <Button
                        type="submit"
                        className="w-full bg-green-800 hover:bg-amber-700 text-white"
                      >
                        Submit
                      </Button>
                    </DialogFooter>
                  </form>
                  {txStatus && (
                      <div className={`mt-3 text-center font-semibold text-base ${
                        lastTxResponse?.status === "flagged"
                          ? "text-red-700 border-2 border-red-400 bg-red-100 rounded-xl text-xl p-3"
                          : "text-gray-700"
                      }`}>
                        {txStatus}
                      </div>
                    )}
                  {/* Only show pay button if status is approved */}
{lastTxResponse?.status === "approved" && (
  <Button
    className="w-full bg-blue-800 hover:bg-blue-900 text-white mt-4"
    onClick={async () => {
      // Razorpay payment logic here (minimal demo below)
      const checkoutKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!isTestCheckoutKey(checkoutKey) || typeof window.Razorpay !== "function") {
        alert("Configure a Razorpay test-mode key to use demo checkout.");
        return;
      }
      const amountInPaise = Number(txForm.amount) * 100;
      const options = {
        key: checkoutKey,
        amount: amountInPaise,
        currency: "INR",
        name: "Manual Transaction",
        description: "Demo Transaction",
        prefill: {
          name: txForm.name,
          email: txForm.email,
          contact: txForm.contact,
        },
        theme: { color: "#0d6efd" },
        handler: function (response) {
          // If you want to update backend with payment_id, you can do that here!
          alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    }}
  >
    Pay Now
  </Button>
)}

{/* Show warning if flagged */}
{lastTxResponse?.status === "flagged" && (
  <div className="mt-3 p-3 text-center text-red-700 font-bold border-2 border-red-400 bg-red-100 rounded-xl text-xl">
    🚨 Transaction flagged for review!<br/>
    Please wait for admin/analyst approval.
  </div>
)}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* --- All other product cards below --- */}
          {filteredProducts.map((product) => {
            const IconComponent = product.icon;
            return (
              <Card
                key={product.id}
                className={`bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                  hoveredCard === product.id ? 'transform -translate-y-1' : ''
                }`}
                onMouseEnter={() => setHoveredCard(product.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    {product.badge && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(product.badge)}`}>
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-gray-600">{product.rating}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{product.reviews} reviews</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.desc}
                  </p>
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {product.features.slice(0, 2).map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                          {feature}
                        </span>
                      ))}
                      {product.features.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                          +{product.features.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                      )}
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                        <Button
                        className="w-full mt-4 bg-green-800 hover:bg-amber-700 text-white transition-colors"
                        size="sm"
                        onClick={() => setSelectedProduct(product)}
                        >
                        Buy Now
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white rounded-lg shadow-xl p-6">
                        <DialogHeader>
                        <DialogTitle>Enter Your Details</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 py-4">
                        <input
                            type="text"
                            placeholder="Name"
                            className="border rounded px-4 py-2"
                            value={userDetails.name}
                            onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="border rounded px-4 py-2"
                            value={userDetails.email}
                            onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                        />
                        <input
                            type="tel"
                            placeholder="Contact"
                            className="border rounded px-4 py-2"
                            value={userDetails.contact}
                            onChange={(e) => setUserDetails({ ...userDetails, contact: e.target.value })}
                        />
                        </div>
                        <DialogFooter>
                        <Button
                        className="w-full mt-4 bg-green-800 hover:bg-amber-700 text-white transition-colors"
                        onClick={() => {
                            if (selectedProduct) handlePayment(selectedProduct, userDetails);
                          }}
                        >
                            Make Payment
                        </Button>
                        </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer Stats */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Trusted by Industry Leaders</h3>
            <p className="text-gray-600">Join thousands of businesses securing their financial operations</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">10K+</div>
              <div className="text-gray-600 text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">₹500Cr+</div>
              <div className="text-gray-600 text-sm">Transactions Secured</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">99.9%</div>
              <div className="text-gray-600 text-sm">Uptime Guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">24/7</div>
              <div className="text-gray-600 text-sm">Expert Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceHome;
