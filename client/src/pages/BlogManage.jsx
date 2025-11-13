import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
} from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "Getting Started with React",
    author: "John Doe",
    status: "published",
    category: "Tutorial",
    date: "2024-01-15",
    views: 1250,
  },
  {
    id: 2,
    title: "Advanced TypeScript Tips",
    author: "Sarah Wilson",
    status: "draft",
    category: "Development",
    date: "2024-01-14",
    views: 0,
  },
  {
    id: 3,
    title: "UI/UX Design Principles",
    author: "Mike Johnson",
    status: "published",
    category: "Design",
    date: "2024-01-13",
    views: 890,
  },
  {
    id: 4,
    title: "Building Scalable Applications",
    author: "Emily Chen",
    status: "review",
    category: "Architecture",
    date: "2024-01-12",
    views: 0,
  },
  {
    id: 5,
    title: "Modern CSS Techniques",
    author: "David Brown",
    status: "published",
    category: "CSS",
    date: "2024-01-11",
    views: 675,
  },
];

export default function BlogManage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Blog Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Create and manage blog posts and articles
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">
          <Plus className="h-4 w-4" />
          New Post
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search posts..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md  focus:outline-none focus:ring-2 focus:ring-indigo-500  bg-white text-black dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div
          className="flex items-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm 
                        dark:bg-gray-800 dark:border-gray-700"
        >
          <FileText className="h-8 w-8 text-indigo-500" />
          <div className="ml-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Posts
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {blogPosts.length}
            </p>
          </div>
        </div>
        <div
          className="flex items-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm 
                        dark:bg-gray-800 dark:border-gray-700"
        >
          <Calendar className="h-8 w-8 text-green-500" />
          <div className="ml-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Published
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {blogPosts.filter((p) => p.status === "published").length}
            </p>
          </div>
        </div>
        <div
          className="flex items-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm 
                        dark:bg-gray-800 dark:border-gray-700"
        >
          <Eye className="h-8 w-8 text-orange-500" />
          <div className="ml-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Views
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {blogPosts.reduce((sum, post) => sum + post.views, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto 
                      dark:bg-gray-800 dark:border-gray-700"
      >
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 border-b text-sm font-medium text-gray-600 dark:text-gray-300">
                Title
              </th>
              <th className="px-4 py-3 border-b text-sm font-medium text-gray-600 dark:text-gray-300">
                Author
              </th>
              <th className="px-4 py-3 border-b text-sm font-medium text-gray-600 dark:text-gray-300">
                Category
              </th>
              <th className="px-4 py-3 border-b text-sm font-medium text-gray-600 dark:text-gray-300">
                Status
              </th>
              <th className="px-4 py-3 border-b text-sm font-medium text-gray-600 dark:text-gray-300">
                Date
              </th>
              <th className="px-4 py-3 border-b text-sm font-medium text-gray-600 dark:text-gray-300">
                Views
              </th>
              <th className="px-4 py-3 border-b text-sm font-medium text-gray-600 dark:text-gray-300 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {blogPosts.map((post) => (
              <tr
                key={post.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-4 py-3 border-b font-medium text-gray-900 dark:text-gray-100">
                  {post.title}
                </td>
                <td className="px-4 py-3 border-b text-gray-700 dark:text-gray-300">
                  {post.author}
                </td>
                <td className="px-4 py-3 border-b text-gray-700 dark:text-gray-300">
                  {post.category}
                </td>
                <td className="px-4 py-3 border-b">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${
                        post.status === "published"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : post.status === "draft"
                          ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-4 py-3 border-b text-gray-700 dark:text-gray-300">
                  {post.date}
                </td>
                <td className="px-4 py-3 border-b text-gray-700 dark:text-gray-300">
                  {post.views}
                </td>
                <td className="px-4 py-3 border-b text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-md dark:hover:bg-gray-600">
                      <Eye className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-md dark:hover:bg-gray-600">
                      <Edit className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-md dark:hover:bg-gray-600">
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
