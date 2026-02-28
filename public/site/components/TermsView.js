function TermsView() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-[2px] p-8 md:p-12">
                <h1 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-3">Terms of Service</h1>
                <p className="text-sm text-[var(--text-dim)] mb-8">Last updated: February 28, 2026</p>

                <div className="space-y-8 text-sm text-[var(--text-muted)] leading-relaxed">
                    <section>
                        <h2 className="text-lg font-mono font-bold text-[var(--text-main)] mb-2 uppercase">1. Acceptance of Terms</h2>
                        <p>
                            By using VEXURA, you agree to these Terms of Service. If you do not agree, do not use the service.
                            You must be at least 13 years old (or the age of digital consent in your region) to create an account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-mono font-bold text-[var(--text-main)] mb-2 uppercase">2. Service Description</h2>
                        <p>
                            VEXURA provides AI-assisted vector creation and marketplace downloads. We may update, suspend,
                            or discontinue features at any time to maintain reliability, security, or compliance.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-mono font-bold text-[var(--text-main)] mb-2 uppercase">3. Accounts & Access</h2>
                        <p>
                            You are responsible for your account activity, credential security, and any actions performed using your account.
                            Do not attempt unauthorized access, abuse, scraping, reverse engineering, or interference with platform operations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-mono font-bold text-[var(--text-main)] mb-2 uppercase">4. Content & License</h2>
                        <p>
                            Assets marked as free on the marketplace are available for commercial and personal use unless otherwise noted.
                            You may not resell or redistribute raw marketplace assets as a standalone competing asset library.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-mono font-bold text-[var(--text-main)] mb-2 uppercase">5. Prohibited Uses</h2>
                        <p>
                            You may not use VEXURA to generate or distribute unlawful, infringing, deceptive, or harmful content,
                            including malware, hate content, or privacy-violating material.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-mono font-bold text-[var(--text-main)] mb-2 uppercase">6. Disclaimer & Liability</h2>
                        <p>
                            VEXURA is provided “as is” without warranties of uninterrupted availability. To the fullest extent permitted by law,
                            VEXURA is not liable for indirect, incidental, or consequential damages related to service use.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-mono font-bold text-[var(--text-main)] mb-2 uppercase">7. Contact</h2>
                        <p>
                            Questions about these terms can be sent to
                            <a href="mailto:hello@vexura.io" className="text-[var(--accent)] hover:underline ml-1">hello@vexura.io</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
