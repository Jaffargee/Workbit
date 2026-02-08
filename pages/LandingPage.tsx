import React from "react";
import { Logo } from "../components/Logo";
import {
      ArrowRight,
      CheckCircle,
      Zap,
      ShieldCheck,
      Smartphone,
      Users,
      Target,
      BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";


const LandingPage: React.FC = () => {

      const stats = [
            { label: "Active Jobs", value: "2.5k+" },
            { label: "Total Workers", value: "150k+" },
            { label: "Total Payouts", value: "₦45M+" },
            { label: "Trust Score", value: "99.9%" },
      ];

      const { isAuthenticated } = { isAuthenticated: false }; // Replace with actual auth logic

      return (
            <div className="bg-white min-h-screen">
                  {/* Navbar */}
                  <nav className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
                        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                              <Logo />
                              <div className="hidden md:flex items-center gap-8 text-slate-600 font-medium">
                                    <div className="block relative w-full h-full">
                                          <ul className="flex gap-6 h-full">
                                                <li className="inline-block mx-2 h-full">
                                                      <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
                                                            <div className="flex flex-col items-center justify-center relative h-full">
                                                                  <span>How it Works</span>
                                                            </div>
                                                      </a>
                                                </li>
                                                <li className="inline-block mx-2 h-full">
                                                      <a href="#pricing" className="hover:text-blue-600 transition-colors">
                                                            <div className="flex flex-col items-center justify-center relative h-full">
                                                                  <span>Pricing</span>
                                                            </div>
                                                      </a>
                                                </li>
                                                <li className="inline-block mx-2 h-full">
                                                      <a href="#features" className="hover:text-blue-600 transition-colors">
                                                            <div className="flex flex-col items-center justify-center relative h-full">
                                                                  <span>Features</span>
                                                            </div>
                                                      </a>
                                                </li>
                                          </ul>
                                    </div>
                              </div>
                              <AuthTypeLoggedInORNot />
                        </div>
                  </nav>

                  {/* Hero */}
                  <section className="pt-40 pb-20 px-6">
                        <div className="max-w-7xl mx-auto grid lg:grid-cols- gap-12">
                              <div className="space-y-8 text-center justify-center w-full">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-semibold text-sm">
                                          <Zap size={16} />
                                          <span>Join the 1st Micro-Job Communityin Nigeria</span>
                                    </div>
                                    <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1]">
                                          Earn Daily with <br />
                                          <span className="text-blue-600">
                                                Simple Social Media
                                          </span>{" "} Tasks
                                    </h1>
                                    <p className="text-lg text-slate-600 leading-relaxed max-w-lg mx-auto">
                                          Follow, Like, Subscribe, and Share. We
                                          bridge the gap between business owners
                                          and workers. Build your wallet by
                                          helping brands grow.
                                    </p>
                                    <div className="flex flex-col sm:flex-row w-full justify-center gap-4 pt-4">
                                          <Link
                                                to={isAuthenticated ? "/dashboard" : "/auth/signup"}
                                                className="bg-blue-600 border border-slate-600 shadow-lg shadow-blue-200 border-1 text-white px-8 py-3 rounded-full font-semibold text-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                          >
                                                Start Earning Now{" "}
                                                <ArrowRight size={20} />
                                          </Link>
                                          <Link
                                                to="/marketplace"
                                                className="border-2 border-slate-200 text-slate-800 px-8 py-3 rounded-full font-semibold text-md hover:bg-slate-50 transition-all flex items-center justify-center"
                                          >
                                                Browse Jobs
                                          </Link>
                                    </div>
                              </div>
                              {/* <div className="relative">
                                    <div className="absolute -inset-4 bg-blue-100 rounded-3xl rotate-3"></div>
                                    <img
                                          src="https://picsum.photos/800/600?random=1"
                                          alt="Dashboard Preview"
                                          className="relative rounded-3xl shadow-2xl border border-white"
                                    />
                              </div> */}
                        </div>
                  </section>

                  {/* Stats */}
                  <section
                        id="features"
                        className="py-20 bg-slate-50 border-y border-slate-100"
                  >
                        <div className="max-w-7xl mx-auto px-6">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                    {stats.map((s, idx) => (
                                          <div
                                                key={idx}
                                                className="text-center space-y-2"
                                          >
                                                <p className="text-4xl font-extrabold text-blue-600">
                                                      {s.value}
                                                </p>
                                                <p className="text-slate-500 font-medium uppercase tracking-wider text-sm">
                                                      {s.label}
                                                </p>
                                          </div>
                                    ))}
                              </div>
                        </div>
                  </section>

                  {/* How it Works */}
                  <section id="how-it-works" className="py-24 px-6">
                        <div className="max-w-7xl mx-auto space-y-16">
                              <div className="text-center space-y-4 max-w-2xl mx-auto">
                                    <h2 className="text-4xl font-bold text-slate-900">
                                          How Workbit Works
                                    </h2>
                                    <p className="text-slate-600">
                                          Three simple steps to start earning or
                                          growing your business presence.
                                    </p>
                              </div>
                              <div className="grid md:grid-cols-3 gap-12">
                                    {[
                                          {
                                                title: "Create Account",
                                                desc: "Sign up for free and activate your dashboard in seconds.",
                                                icon: (
                                                      <Users
                                                            className="text-blue-600"
                                                            size={32}
                                                      />
                                                ),
                                          },
                                          {
                                                title: "Browse & Perform",
                                                desc: "Choose from hundreds of social media tasks that match your profile.",
                                                icon: (
                                                      <Target
                                                            className="text-blue-600"
                                                            size={32}
                                                      />
                                                ),
                                          },
                                          {
                                                title: "Get Paid",
                                                desc: "Once your proof is approved, your wallet is credited instantly.",
                                                icon: (
                                                      <CheckCircle
                                                            className="text-blue-600"
                                                            size={32}
                                                      />
                                                ),
                                          },
                                    ].map((step, idx) => (
                                          <div
                                                key={idx}
                                                className="bg-slate-50 p-10 rounded-3xl space-y-6 relative overflow-hidden group"
                                          >
                                                <div className="absolute top-0 right-0 p-8 text-8xl font-black text-slate-100 group-hover:text-blue-50 transition-colors">
                                                      0{idx + 1}
                                                </div>
                                                <div className="relative p-4 bg-white rounded-2xl w-fit shadow-sm">
                                                      {step.icon}
                                                </div>
                                                <div className="relative space-y-3">
                                                      <h3 className="text-2xl font-bold text-slate-900">
                                                            {step.title}
                                                      </h3>
                                                      <p className="text-slate-600 leading-relaxed">
                                                            {step.desc}
                                                      </p>
                                                </div>
                                          </div>
                                    ))}
                              </div>
                        </div>
                  </section>

                  {/* Pricing */}
                  <section
                        id="pricing"
                        className="py-24 px-6 bg-slate-900 text-white"
                  >
                        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                              <div className="space-y-8">
                                    <h2 className="text-4xl font-bold">
                                          Unbeatable Value for Earners
                                    </h2>
                                    <p className="text-slate-400 text-lg leading-relaxed">
                                          To ensure our platform remains secure
                                          and only includes serious workers, we
                                          require a small annual subscription
                                          fee. This helps us maintain high job
                                          quality and faster payouts.
                                    </p>
                                    <div className="space-y-4">
                                          {[
                                                "Unlimited Job Access",
                                                "Priority Payouts",
                                                "Referral Bonuses (₦500)",
                                                "24/7 Support",
                                          ].map((feat, i) => (
                                                <div
                                                      key={i}
                                                      className="flex items-center gap-3"
                                                >
                                                      <CheckCircle
                                                            className="text-blue-500"
                                                            size={20}
                                                      />
                                                      <span>{feat}</span>
                                                </div>
                                          ))}
                                    </div>
                              </div>
                              <div className="bg-white text-slate-900 p-12 rounded-3xl shadow-2xl space-y-8 border-4 border-blue-600 relative">
                                    <div className="absolute top-0 right-12 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                                          ANNUAL PLAN
                                    </div>
                                    <div className="space-y-2">
                                          <h3 className="text-2xl font-bold">
                                                Subscription
                                          </h3>
                                          <div className="flex items-baseline gap-1">
                                                <span className="text-5xl font-black">
                                                      ₦5,000
                                                </span>
                                                <span className="text-slate-500 font-semibold">
                                                      /year
                                                </span>
                                          </div>
                                    </div>
                                    <p className="text-slate-500">
                                          Everything you need to maximize your
                                          side income.
                                    </p>
                                    <Link
                                          to="/auth/signup"
                                          className="block text-center bg-blue-600 text-white py-3 rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                                    >
                                          Get Started Now
                                    </Link>
                              </div>
                        </div>
                  </section>

                  {/* Footer */}
                  <footer className="py-20 border-t border-slate-100">
                        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
                              <div className="space-y-6">
                                    <Logo />
                                    <p className="text-slate-500">
                                          Leading the digital gig economy in
                                          Nigeria. Fast, Reliable, Secure.
                                    </p>
                              </div>
                              <div>
                                    <h4 className="font-bold mb-6">Platform</h4>
                                    <ul className="space-y-4 text-slate-600">
                                          <li>
                                                <a
                                                      href="#/marketplace"
                                                      className="hover:text-blue-600 transition-colors"
                                                >
                                                      Marketplace
                                                </a>
                                          </li>
                                          <li>
                                                <a
                                                      href="#/post-job"
                                                      className="hover:text-blue-600 transition-colors"
                                                >
                                                      Post a Job
                                                </a>
                                          </li>
                                          <li>
                                                <a
                                                      href="#pricing"
                                                      className="hover:text-blue-600 transition-colors"
                                                >
                                                      Pricing
                                                </a>
                                          </li>
                                    </ul>
                              </div>
                              <div>
                                    <h4 className="font-bold mb-6">Support</h4>
                                    <ul className="space-y-4 text-slate-600">
                                          <li>
                                                <a
                                                      href="#"
                                                      className="hover:text-blue-600 transition-colors"
                                                >
                                                      Help Center
                                                </a>
                                          </li>
                                          <li>
                                                <a
                                                      href="#"
                                                      className="hover:text-blue-600 transition-colors"
                                                >
                                                      Contact Us
                                                </a>
                                          </li>
                                          <li>
                                                <a
                                                      href="#"
                                                      className="hover:text-blue-600 transition-colors"
                                                >
                                                      Terms of Service
                                                </a>
                                          </li>
                                    </ul>
                              </div>
                              <div>
                                    <h4 className="font-bold mb-6">
                                          Stay Updated
                                    </h4>
                                    <div className="flex gap-2">
                                          <input
                                                type="email"
                                                placeholder="Email address"
                                                className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg flex-1 focus:outline-none focus:border-blue-500"
                                          />
                                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                                                Join
                                          </button>
                                    </div>
                              </div>
                        </div>
                        <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                              <p className="text-slate-400 text-sm">
                                    © 2024 Workbit Technologies. All rights
                                    reserved.
                              </p>
                              <div className="flex gap-6 text-slate-400">
                                    <Smartphone
                                          size={20}
                                          className="hover:text-blue-600 cursor-pointer"
                                    />
                                    <ShieldCheck
                                          size={20}
                                          className="hover:text-blue-600 cursor-pointer"
                                    />
                                    <BarChart3
                                          size={20}
                                          className="hover:text-blue-600 cursor-pointer"
                                    />
                              </div>
                        </div>
                  </footer>
            </div>
      );
};

const AuthTypeLoggedInORNot: React.FC = () => {

      const { isAuthenticated } = { isAuthenticated: false }; // Replace with actual auth logic

      return (
            isAuthenticated ? (
                  <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">Go to Dashboard</Link>
                  </div>
            ) : (
                  <div className="flex items-center gap-4">
                        <Link to="/auth/login" className="text-slate-600 font-semibold px-4 py-2 hover:text-blue-600 transition-colors">Login</Link>
                        <Link to="/auth/signup" className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">Get Started</Link>
                  </div>
            )
      );
};

export default LandingPage;