import React from "react";
import HelpForm from "../components/HelpForm";

const Help = () => {
    return (
        <section className="min-h-screen bg-slate-50">

            <div className="max-w-5xl mx-auto px-4 sm:px-6">

                {/* PAGE HEADER */}
                <div className="text-center pt-6 sm:pt-8 mb-8">

                    <span
                        className="
                            inline-flex
                            items-center
                            gap-2
                            px-3
                            py-1.5
                            rounded-full
                            bg-amber-50
                            border
                            border-amber-100
                            text-xs
                            font-bold
                            uppercase
                            tracking-wider
                            text-amber-600
                        "
                    >
                        <span className="material-symbols-outlined text-sm">
                            support_agent
                        </span>

                        Support Center
                    </span>

                    <h1
                        className="
                            mt-4
                            text-3xl
                            sm:text-4xl
                            lg:text-5xl
                            font-bold
                            tracking-tight
                            text-slate-900
                        "
                    >
                        How can we help?
                    </h1>

                    <p
                        className="
                            mt-4
                            max-w-2xl
                            mx-auto
                            text-sm
                            sm:text-base
                            leading-7
                            text-slate-500
                        "
                    >
                        Have a legal question or need assistance?
                        Tell us about your concern and our team will
                        help guide you in the right direction.
                    </p>

                </div>

                {/* HELP FORM */}
                <HelpForm />

            </div>

        </section>
    );
};

export default Help;