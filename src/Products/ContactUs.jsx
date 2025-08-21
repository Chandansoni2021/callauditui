import React from "react";

const ContactUs = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 space-y-16 mt-20 mr-0 mb-4 ml-64">
      {/* Contact Address Area */}
      <section className="bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center pb-12">
            <div className="text-4xl font-bold uppercase text-gray-900">
              Contact Us
            </div>
            <div className="flex items-center justify-center mt-4">
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <p className="mx-4 text-sm font-bold uppercase text-gray-900">
                Quick Contact
              </p>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            </div>
            <div className="mt-4 text-gray-500">
              Fixyman is proud to be the name that nearly 1 million homeowners
              have trusted since 1996 for home improvement and repair, providing
              virtually any home repair.
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Single Contact Address Box 1 */}
            <div className="bg-gray-900 text-white py-20 px-8 text-center">
              <div className="mb-4">
                {/* Replace with your clock icon or SVG */}
                <span className="text-6xl">🕒</span>
              </div>
              <h3 className="text-xl font-semibold">Lorem Ipsum</h3>
              <h2 className="text-2xl font-bold text-white-500 mt-2">
                Lorem Ipsum is simply dummy
              </h2>
            </div>
            {/* Single Contact Address Box 2 (Main Branch) */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 py-16 px-8 text-center">
              <h3 className="text-lg font-bold uppercase text-gray-900 mb-6">
                Lorem Ipsum
              </h3>
              <ul className="space-y-6 text-left mx-auto max-w-xs">
                <li>
                  <h4 className="text-xl font-semibold border-b-2 border-white-600 pb-1">
                    Address:
                  </h4>
                  <p className="mt-2 text-gray-900">
                    Lorem Ipsum, 40C, Lorem Ipsum dummy,
                    <br /> Lorem Ipsum, Ch 98054
                  </p>
                </li>
                <li>
                  <h4 className="text-xl font-semibold border-b-2 border-white-600 pb-1">
                    Ph & Fax:
                  </h4>
                  <p className="mt-2 text-gray-900">
                    +123 456 789 <br /> test@info.com
                  </p>
                </li>
                <li>
                  <h4 className="text-xl font-semibold border-b-2 border-white-600 pb-1">
                    Office Hrs:
                  </h4>
                  <p className="mt-2 text-gray-900">
                    Mon-Fri: 9:30am - 6:30pm
                    <br /> Sat-Sun: Closed
                  </p>
                </li>
              </ul>
            </div>
            {/* Single Contact Address Box 3 */}
            <div className="bg-gray-900 text-white py-20 px-8 text-center">
              <div className="mb-4">
                {/* Replace with your question icon or SVG */}
                <span className="text-6xl">❓</span>
              </div>
              <h3 className="text-xl font-semibold">Lorem Ipsum</h3>
              <h2 className="text-2xl font-bold text-white-500 mt-2">
                Lorem Ipsum is simply dummy
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Area */}
      <section className="bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center mb-12">
            <div className="w-full md:w-1/2">
              <div className="text-left">
                <div className="text-3xl font-bold">Send Your Message</div>
                <div className="flex items-center mt-2">
                  <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                  <p className="mx-4 text-sm font-bold uppercase text-gray-900">
                    Contact Form
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2 text-right">
              <p className="text-gray-500">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </p>
            </div>
          </div>
          <div className="p-8">
            <form
              id="contact-form"
              name="contact_form"
              action="inc/sendmail.php"
              method="post"
            >
              <div className="flex flex-wrap -mx-4">
                <div className="w-full md:w-1/2 px-4">
                  <div className="flex flex-wrap -mx-2">
                    <div className="w-1/2 px-2 mb-4">
                      <input
                        type="text"
                        name="form_name"
                        placeholder="Name"
                        required
                        className="w-full border border-gray-300 p-3"
                      />
                    </div>
                    <div className="w-1/2 px-2 mb-4">
                      <input
                        type="text"
                        name="form_phone"
                        placeholder="Phone"
                        className="w-full border border-gray-300 p-3"
                      />
                    </div>
                    <div className="w-1/2 px-2 mb-4">
                      <input
                        type="email"
                        name="form_email"
                        placeholder="Email"
                        required
                        className="w-full border border-gray-300 p-3"
                      />
                    </div>
                    <div className="w-1/2 px-2 mb-4">
                      <input
                        type="text"
                        name="form_Companyname"
                        placeholder="Company name"
                        className="w-full border border-gray-300 p-3"
                      />
                    </div>
                    <div className="w-full px-2 mb-4">
                      <input
                        type="text"
                        name="form_Reasonforcontacting"
                        placeholder="Reason for contacting"
                        className="w-full border border-gray-300 p-3"
                      />
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 px-4 mb-4">
                  <textarea
                    name="form_message"
                    placeholder="Your Message..."
                    required
                    className="w-full border border-gray-300 p-3 h-40"
                  ></textarea>
                  <div className="mt-4">
                    <button
                      type="submit"
                      className="cursor-pointer w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white-900 font-semibold p-3 hover:bg-gray-900 hover:text-white transition-colors"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
