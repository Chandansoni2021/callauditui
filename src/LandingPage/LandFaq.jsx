import React, { useState } from "react";

const LandFAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is a Call Audit Tool and how does it work?",
      answer: "A Call Audit Tool is a software solution that automatically transcribes, evaluates, and scores customer or sales calls. It uses AI to analyze speech patterns, sentiment, compliance checkpoints, and agent performance — helping you maintain quality and ensure regulatory standards.",
    },
    {
      question: "Can the tool handle bulk call audits?",
      answer: "Yes. Our platform is designed for scalability and can process and audit thousands of calls efficiently using automated parsing, batch scoring, and detailed reporting.",
    },
    {
      question: "How accurate is the AI-based call transcription and scoring?",
      answer: "Our AI models provide over 95% transcription accuracy and leverage advanced scoring algorithms customized to your quality standards, ensuring reliable and actionable results.",
    },
    {
      question: "Is the call audit process customizable for different industries or teams?",
      answer: "Absolutely. You can create and configure custom audit templates, scoring rubrics, and compliance rules to match your specific industry, team roles, and call types.",
    },
    {
      question: "What kind of reports and insights does the system provide?",
      answer: "The tool offers real-time dashboards, downloadable reports, trend analysis, compliance summaries, and agent performance metrics — all designed to help you make data-driven decisions and improve call quality continuously.",
    },
  ];

  return (
    <section id="faq" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-300 rounded-full opacity-20 blur-3xl -z-10 animate-pulse delay-300"></div>

      <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-center mb-12 relative z-10">
        Frequently Asked Questions
      </h2>

      <div className="max-w-3xl mx-auto space-y-6 text-gray-800">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-xl p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <h3
              className="font-bold text-xl text-gray-900 cursor-pointer flex justify-between items-center"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              {faq.question}
              <span
                className={`transition-transform duration-300 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </h3>
            <p
              className={`mt-2 text-gray-600 overflow-hidden transition-all duration-300 ${
                openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LandFAQ;