import { useState } from 'react'

const LandingPage = () => {
  const [detectableMode, setDetectableMode] = useState(false)

  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden">
      {/* Ambient background glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#7C3AED] opacity-20 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#3B82F6] opacity-15 blur-[150px] rounded-full" />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] bg-clip-text text-transparent">
              cHeAtEr
            </div>
            <div className="px-2 py-1 text-xs font-medium bg-[rgba(124,58,237,0.1)] text-[#A78BFA] rounded-md border border-[rgba(124,58,237,0.3)]">
              Beta
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 text-sm font-medium text-[#9CA3AF] hover:text-white transition-colors duration-200">
              Features
            </button>
            <button className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] rounded-full shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] hover:brightness-110 transition-all duration-200 transform hover:-translate-y-0.5">
              Download App
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-8 py-20 text-center">
          <div className="space-y-8">
            {/* Hero headline */}
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-bold leading-tight">
                The AI Superpower
                <br />
                <span className="bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#3B82F6] bg-clip-text text-transparent">
                  for your GPA
                </span>
              </h1>
              <p className="text-xl text-[#9CA3AF] max-w-3xl mx-auto leading-relaxed">
                Never miss a detail in class again. Get real-time answers, lecture transcription,
                and homework help without leaving your tab.
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex items-center justify-center gap-4">
              <button className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] rounded-full shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:shadow-[0_0_50px_rgba(124,58,237,0.7)] hover:brightness-110 transition-all duration-200 transform hover:-translate-y-1">
                Start Studying Smarter
              </button>
              <button className="px-8 py-4 text-lg font-semibold bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-all duration-200">
                Watch Demo
              </button>
            </div>

            {/* Visual mockup placeholder */}
            <div className="mt-16 relative max-w-5xl mx-auto">
              {/* Glow behind the mockup */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#7C3AED] opacity-30 blur-[80px] rounded-[3rem]" />

              {/* Main mockup container with glassmorphism */}
              <div className="relative bg-gradient-to-br from-[rgba(30,30,40,0.7)] to-[rgba(20,20,30,0.4)] backdrop-blur-xl border border-[rgba(255,255,255,0.15)] rounded-3xl p-8 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.4)]">
                {/* Simulated browser/app window */}
                <div className="bg-[#12121A] rounded-2xl overflow-hidden">
                  {/* Window header */}
                  <div className="bg-[#1C1C26] px-4 py-3 flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)]">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                      <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                      <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                    </div>
                    <div className="flex-1 text-center text-sm text-[#6B7280]">
                      canvas.university.edu
                    </div>
                  </div>

                  {/* Simulated content area */}
                  <div className="p-6 space-y-4 min-h-[400px] relative">
                    {/* Simulated lecture content */}
                    <div className="space-y-2">
                      <div className="h-4 bg-[#1C1C26] rounded w-3/4" />
                      <div className="h-4 bg-[#1C1C26] rounded w-full" />
                      <div className="h-4 bg-[#1C1C26] rounded w-5/6" />
                    </div>

                    {/* Floating widget overlay */}
                    <div className="absolute bottom-6 right-6 bg-gradient-to-br from-[#2E2E45] to-[#1A1A2E] border border-[rgba(124,58,237,0.3)] rounded-2xl p-4 shadow-[0_0_30px_rgba(124,58,237,0.3)] w-80">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center text-xl">
                          🤖
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="text-sm font-medium text-white">AI Assistant</div>
                          <div className="text-xs text-[#9CA3AF] leading-relaxed">
                            This integral can be solved using substitution. Let u = x² + 1...
                          </div>
                          <div className="flex gap-2">
                            <div className="h-2 bg-[#7C3AED] rounded-full w-2/3 animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Built for Students Who Won't Settle</h2>
            <p className="text-lg text-[#9CA3AF]">Everything you need to dominate your coursework</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature Card 1: Instant Explanations */}
            <div className="group relative bg-[#12121A] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 hover:border-[rgba(124,58,237,0.4)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,58,237,0.2)]">
              {/* Subtle glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(124,58,237,0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                  ⚡
                </div>
                <h3 className="text-2xl font-bold">Instant Explanations</h3>
                <p className="text-[#9CA3AF] leading-relaxed">
                  Screenshot any problem or question. Get step-by-step solutions faster than your professor can say "office hours."
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 text-xs bg-[rgba(124,58,237,0.1)] text-[#A78BFA] rounded-md border border-[rgba(124,58,237,0.2)]">
                    Math
                  </span>
                  <span className="px-3 py-1 text-xs bg-[rgba(59,130,246,0.1)] text-[#60A5FA] rounded-md border border-[rgba(59,130,246,0.2)]">
                    Physics
                  </span>
                  <span className="px-3 py-1 text-xs bg-[rgba(124,58,237,0.1)] text-[#A78BFA] rounded-md border border-[rgba(124,58,237,0.2)]">
                    CS
                  </span>
                </div>
              </div>
            </div>

            {/* Feature Card 2: Essay Assistance */}
            <div className="group relative bg-[#12121A] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 hover:border-[rgba(124,58,237,0.4)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,58,237,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(124,58,237,0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                  ✍️
                </div>
                <h3 className="text-2xl font-bold">Essay Assistance</h3>
                <p className="text-[#9CA3AF] leading-relaxed">
                  Stuck on that 10-page paper? Get research help, outline suggestions, and citation formatting without the all-nighter.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    Plagiarism-free suggestions
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    Citation formatting
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Card 3: Detectable Mode */}
            <div className="group relative bg-gradient-to-br from-[#2E2E45] to-[#1A1A2E] border border-[rgba(124,58,237,0.3)] rounded-2xl p-8 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                  👁️
                </div>
                <h3 className="text-2xl font-bold">Detectable Mode</h3>
                <p className="text-[#9CA3AF] leading-relaxed">
                  Full control over your privacy. Toggle between stealth mode and active assistance based on your needs.
                </p>

                {/* Interactive Toggle */}
                <div className="mt-6 p-4 bg-[rgba(0,0,0,0.3)] rounded-xl border border-[rgba(255,255,255,0.08)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Current Mode:</span>
                    <span className={`text-sm font-semibold ${detectableMode ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                      {detectableMode ? 'Active' : 'Stealth'}
                    </span>
                  </div>

                  {/* Custom toggle switch */}
                  <button
                    onClick={() => setDetectableMode(!detectableMode)}
                    className={`relative w-full h-12 rounded-full transition-all duration-300 ${
                      detectableMode
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] shadow-[0_0_20px_rgba(124,58,237,0.4)]'
                        : 'bg-[rgba(255,255,255,0.1)]'
                    }`}
                  >
                    <div
                      className={`absolute top-1 ${
                        detectableMode ? 'right-1' : 'left-1'
                      } w-10 h-10 bg-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center text-xl`}
                    >
                      {detectableMode ? '🔓' : '🔒'}
                    </div>
                  </button>

                  <p className="text-xs text-[#6B7280] mt-3 text-center">
                    {detectableMode
                      ? 'Visible assistance active'
                      : 'Working incognito'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Stats Section */}
        <section className="max-w-7xl mx-auto px-8 py-20">
          <div className="bg-gradient-to-br from-[rgba(30,30,40,0.7)] to-[rgba(20,20,30,0.4)] backdrop-blur-xl border border-[rgba(255,255,255,0.15)] rounded-3xl p-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-5xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] bg-clip-text text-transparent">
                  10K+
                </div>
                <div className="text-[#9CA3AF]">Students Acing Exams</div>
              </div>
              <div className="space-y-2">
                <div className="text-5xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] bg-clip-text text-transparent">
                  500K+
                </div>
                <div className="text-[#9CA3AF]">Problems Solved</div>
              </div>
              <div className="space-y-2">
                <div className="text-5xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] bg-clip-text text-transparent">
                  3.8 → 4.0
                </div>
                <div className="text-[#9CA3AF]">Average GPA Jump</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="max-w-4xl mx-auto px-8 py-20 text-center">
          <div className="space-y-6">
            <h2 className="text-5xl font-bold">
              Ready to Level Up
              <br />
              <span className="bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] bg-clip-text text-transparent">
                Your Study Game?
              </span>
            </h2>
            <p className="text-xl text-[#9CA3AF]">
              Join thousands of students already crushing it with AI-powered assistance.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <button className="px-10 py-5 text-lg font-semibold bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] rounded-full shadow-[0_0_40px_rgba(124,58,237,0.6)] hover:shadow-[0_0_60px_rgba(124,58,237,0.8)] hover:brightness-110 transition-all duration-200 transform hover:-translate-y-1 hover:scale-105">
                Download for Free
              </button>
            </div>
            <p className="text-sm text-[#6B7280]">
              Available for Windows, Mac, and Linux • No credit card required
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[rgba(255,255,255,0.08)] mt-20">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-[#6B7280]">
                © 2025 cHeAtEr. Built for students, by students.
              </div>
              <div className="flex gap-6">
                <a href="#" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">
                  Privacy
                </a>
                <a href="#" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">
                  Terms
                </a>
                <a href="#" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default LandingPage
