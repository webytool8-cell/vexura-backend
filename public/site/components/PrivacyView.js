function PrivacyView() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-[2px] p-8 md:p-12">
                <h1 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-3">Privacy Policy</h1>
                <p className="text-sm text-[var(--text-dim)] mb-8">Last updated: February 28, 2026</p>

                <div className="space-y-8 text-sm text-[var(--text-muted)] leading-relaxed">
                    <section>
                        <h2 className="text-lg font-mono font-bold text-[var(--text-main)] mb-2 uppercase">1. Information We Collect</h2>
                        <p>
                            We may collect account information (such as email, username, and auth identifiers), usage analytics,
                            and technical diagnostics needed to operate and secure VEXURA.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-mono font-bold text-[var(--text-main)] mb-2 uppercase">2. How We Use Information</h2>
                        <p>
                            We use collected information to deliver product functionality, improve model quality, prevent abuse,
                            and communicate essential account or service notices.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-mono font-bold text-[var(--text-main)] mb-2 uppercase">3. Data Sharing</h2>
                        <p>
                            We do not sell personal information. We may share limited data with trusted service providers for hosting,
                            analytics, authentication, and infrastructure support under contractual confidentiality obligations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-mono font-bold text-[var(--text-main)] mb-2 uppercase">4. Retention & Security</h2>
                        <p>
                            We retain data only as needed for business and legal purposes and apply reasonable administrative,
                            technical, and organizational safeguards to protect your information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-mono font-bold text-[var(--text-main)] mb-2 uppercase">5. Your Choices</h2>
                        <p>
                            You may request account updates or deletion, subject to legal and operational limits.
                            For privacy requests, contact us at
                            <a href="mailto:hello@vexura.io" className="text-[var(--accent)] hover:underline ml-1">hello@vexura.io</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-mono font-bold text-[var(--text-main)] mb-2 uppercase">6. International Users</h2>
                        <p>
                            If you access VEXURA outside your home jurisdiction, you acknowledge that your information may be processed
                            in regions where our infrastructure and providers operate.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
