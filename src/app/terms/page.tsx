'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="min-h-screen relative overflow-hidden bg-sam-bg">
      {/* Background effects */}
      <div className="landing-nebula" />
      <div className="landing-stars" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </motion.div>

        {/* Content */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <article className="prose prose-invert prose-lg max-w-none">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-rose-500 via-slate-400 to-teal-400 bg-clip-text text-transparent mb-4">
              ClawdBody – Terms and Conditions
            </h1>
            
            <p className="text-gray-400 text-sm mb-8">
              <strong>Last Updated:</strong> {lastUpdated}
            </p>

            <p className="text-gray-300 leading-relaxed">
              Welcome to <strong>ClawdBody</strong> ("ClawdBody", "we", "our", or "us"). These Terms and Conditions ("Terms") govern your access to and use of the ClawdBody platform, services, software, and website (collectively, the "Service").
            </p>

            <p className="text-gray-300 leading-relaxed">
              By accessing or using ClawdBody, you agree to be bound by these Terms. If you do not agree, you may not use the Service.
            </p>

            <hr className="border-white/10 my-8" />

            <Section number="1" title="Description of Service">
              <p>
                ClawdBody provides tools to deploy, manage, and operate automation agents ("ClawdBots") across cloud-based virtual machines and infrastructure using third-party services and APIs.
              </p>
              <p>
                ClawdBody does <strong>not</strong> provide cloud infrastructure, API services, or credentials itself. The Service relies on integrations with third-party providers selected and configured by the user.
              </p>
            </Section>

            <Section number="2" title="User Responsibilities">
              <p>You are solely responsible for:</p>
              <ul>
                <li>All actions performed using your ClawdBody account</li>
                <li>Any infrastructure, cloud resources, or third-party services you connect to the Service</li>
                <li>Compliance with all applicable laws, provider terms, and usage policies</li>
              </ul>
              <p>You agree not to use ClawdBody for unlawful, abusive, or malicious purposes.</p>
            </Section>

            <Section number="3" title="API Keys, Credentials, and Secrets">
              <h4 className="text-white font-semibold mt-6 mb-3">3.1 Ownership and Responsibility</h4>
              <p>You acknowledge and agree that:</p>
              <ul>
                <li>Any API keys, access tokens, credentials, or secrets ("API Keys") you provide remain <strong>your sole property</strong></li>
                <li>You are fully responsible for the security, rotation, revocation, and proper usage of all API Keys</li>
                <li>You are responsible for ensuring that your use of API Keys complies with the terms of the relevant third-party providers</li>
              </ul>

              <h4 className="text-white font-semibold mt-6 mb-3">3.2 Storage and Handling</h4>
              <p>While ClawdBody may temporarily store API Keys to enable functionality:</p>
              <ul>
                <li>ClawdBody does <strong>not</strong> assume ownership or liability for any API Keys</li>
                <li>ClawdBody makes no guarantees regarding the suitability of API Keys for any particular use</li>
                <li>You acknowledge that storing credentials always carries inherent risk</li>
              </ul>

              <h4 className="text-white font-semibold mt-6 mb-3">3.3 Limitation of Liability for API Keys</h4>
              <p>ClawdBody shall <strong>not</strong> be responsible or liable for:</p>
              <ul>
                <li>Unauthorized access to your API Keys</li>
                <li>Misuse, overuse, or abuse of third-party services using your API Keys</li>
                <li>Charges, costs, rate limits, suspensions, or bans imposed by third-party providers</li>
                <li>Data loss, service disruption, or security incidents caused by compromised credentials</li>
              </ul>
              <p>You assume <strong>full responsibility</strong> for any consequences arising from the use of your API Keys.</p>
            </Section>

            <Section number="4" title="Third-Party Services">
              <p>ClawdBody integrates with third-party services (e.g., cloud providers, APIs, infrastructure platforms).</p>
              <ul>
                <li>We do not control or endorse third-party services</li>
                <li>We are not responsible for outages, changes, pricing, or policy updates of third-party providers</li>
                <li>Your use of third-party services is governed by their respective terms and conditions</li>
              </ul>
            </Section>

            <Section number="5" title="Security Disclaimer">
              <p>While we take reasonable measures to protect the Service:</p>
              <ul>
                <li>No system is completely secure</li>
                <li>You acknowledge and accept the inherent risks of cloud-based software and credential usage</li>
                <li>You are encouraged to use least-privilege access, rotate keys regularly, and monitor usage</li>
              </ul>
            </Section>

            <Section number="6" title="Data and Logs">
              <p>ClawdBody may collect operational logs, metadata, and usage metrics for:</p>
              <ul>
                <li>Service functionality</li>
                <li>Debugging and performance optimization</li>
                <li>Security monitoring</li>
              </ul>
              <p>We do <strong>not</strong> claim ownership over your data or credentials.</p>
            </Section>

            <Section number="7" title="Service Availability">
              <p>The Service is provided on an <strong>"as is"</strong> and <strong>"as available"</strong> basis.</p>
              <p>We do not guarantee:</p>
              <ul>
                <li>Continuous availability</li>
                <li>Error-free operation</li>
                <li>Compatibility with all third-party services</li>
              </ul>
            </Section>

            <Section number="8" title="Limitation of Liability">
              <p>To the maximum extent permitted by law, ClawdBody shall not be liable for:</p>
              <ul>
                <li>Indirect, incidental, special, or consequential damages</li>
                <li>Loss of data, revenue, profits, or business opportunities</li>
                <li>Costs incurred due to third-party services or infrastructure usage</li>
              </ul>
              <p>Our total liability shall not exceed the amount paid by you to ClawdBody in the preceding 12 months, or zero if no fees were paid.</p>
            </Section>

            <Section number="9" title="Indemnification">
              <p>You agree to indemnify and hold harmless ClawdBody, its founders, employees, and affiliates from any claims, damages, or liabilities arising from:</p>
              <ul>
                <li>Your use of the Service</li>
                <li>Your API Keys or third-party integrations</li>
                <li>Your violation of these Terms or applicable laws</li>
              </ul>
            </Section>

            <Section number="10" title="Termination">
              <p>We reserve the right to suspend or terminate access to the Service at any time for:</p>
              <ul>
                <li>Violations of these Terms</li>
                <li>Security risks</li>
                <li>Abuse or misuse of the Service</li>
              </ul>
              <p>You may stop using the Service at any time.</p>
            </Section>

            <Section number="11" title="Changes to These Terms">
              <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
            </Section>

            <Section number="12" title="Contact">
              <p>If you have questions about these Terms, contact us at:</p>
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:contact@clawdbody.com" className="text-teal-400 hover:text-teal-300">
                  contact@clawdbody.com
                </a>
              </p>
              <p><strong>Company:</strong> ClawdBody</p>
            </Section>

            {/* Development Notice */}
            <div className="mt-12 p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <p className="text-amber-400 text-sm flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>
                  <strong>Notice:</strong> This Service is currently in active development. Users should assume responsibility for validating outputs, monitoring activity, and safeguarding credentials.
                </span>
              </p>
            </div>
          </article>
        </motion.div>

        {/* Footer */}
        <motion.footer
          className="mt-16 pt-8 border-t border-white/10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} ClawdBody. All rights reserved.
          </p>
        </motion.footer>
      </div>
    </div>
  )
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="my-8">
      <h2 className="text-2xl font-bold text-white mb-4">
        {number}. {title}
      </h2>
      <div className="text-gray-300 leading-relaxed space-y-4">
        {children}
      </div>
    </section>
  )
}
