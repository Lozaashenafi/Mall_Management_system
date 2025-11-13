import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

const faqs = [
  {
    id: 1,
    question: "How do I reset my password?",
    answer:
      "You can reset your password by clicking the 'Forgot Password' link on the login page.",
    category: "Account",
    status: "published",
    views: 245,
  },
  {
    id: 2,
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers.",
    category: "Billing",
    status: "published",
    views: 189,
  },
  {
    id: 3,
    question: "How long does shipping take?",
    answer:
      "Standard shipping takes 3-5 business days, while express shipping takes 1-2 business days.",
    category: "Shipping",
    status: "draft",
    views: 0,
  },
  {
    id: 4,
    question: "Can I cancel my order?",
    answer: "Yes, you can cancel your order within 24 hours of placing it.",
    category: "Orders",
    status: "published",
    views: 156,
  },
  {
    id: 5,
    question: "Do you offer international shipping?",
    answer: "Yes, we ship to over 50 countries worldwide.",
    category: "Shipping",
    status: "review",
    views: 0,
  },
];

export default function FAQsManage() {
  return (
    <div className="space-y-6 p-6 bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">FAQ Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage frequently asked questions and help content
          </p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-md shadow-md transition">
          <Plus className="h-5 w-5" />
          Add FAQ
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search FAQs..."
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-indigo-400 transition"
          />
        </div>
        <button className="flex items-center gap-2 border border-gray-300 rounded-md px-4 py-2 text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 shadow-sm transition">
          <Filter className="h-5 w-5" />
          Filter
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-3">
        {[
          {
            icon: <HelpCircle className="h-9 w-9 text-indigo-600" />,
            label: "Total FAQs",
            value: faqs.length,
          },
          {
            icon: <ChevronDown className="h-9 w-9 text-green-600" />,
            label: "Published",
            value: faqs.filter((faq) => faq.status === "published").length,
          },
          {
            icon: <HelpCircle className="h-9 w-9 text-orange-600" />,
            label: "Total Views",
            value: faqs.reduce((sum, faq) => sum + faq.views, 0),
          },
        ].map(({ icon, label, value }, idx) => (
          <div
            key={idx}
            className="flex items-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm
                       dark:bg-gray-800 dark:border-gray-700 transition"
          >
            {icon}
            <div className="ml-5">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {label}
              </p>
              <p className="text-3xl font-extrabold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Preview & Management */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* FAQ Preview */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 rounded-lg p-6 dark:border-gray-700 shadow-sm transition">
          <h2 className="text-lg font-semibold mb-4">FAQ Preview</h2>
          <div className="space-y-3">
            {faqs
              .filter((faq) => faq.status === "published")
              .map((faq) => (
                <details
                  key={faq.id}
                  className="border-b border-gray-200 pb-3 dark:border-gray-700"
                >
                  <summary className="cursor-pointer font-semibold text-gray-900 dark:text-gray-100">
                    {faq.question}
                  </summary>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    {faq.answer}
                  </p>
                </details>
              ))}
          </div>
        </section>

        {/* FAQ Management Table */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 rounded-lg p-6 dark:border-gray-700 shadow-sm overflow-x-auto transition">
          <h2 className="text-lg font-semibold mb-4">FAQ Management</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="p-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Question
                </th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Category
                </th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Status
                </th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Views
                </th>
                <th className="p-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((faq) => (
                <tr
                  key={faq.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="p-3 max-w-[200px] truncate">{faq.question}</td>
                  <td className="p-3">{faq.category}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        faq.status === "published"
                          ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200"
                          : faq.status === "draft"
                          ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {faq.status}
                    </span>
                  </td>
                  <td className="p-3">{faq.views}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        aria-label="Edit FAQ"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        aria-label="Delete FAQ"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
