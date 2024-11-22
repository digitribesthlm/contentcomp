import DashboardLayout from '../../components/DashboardLayout';

export default function ContentOptimization() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Content Optimization
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Optimize Existing Content Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Optimize Existing Content
            </h2>
            <p className="text-gray-600 mb-4">
              Enhance your existing pages with optimized content suggestions and improvements.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Select Page to Optimize
                </label>
                <select className="border rounded-md p-2">
                  <option value="">Choose a page...</option>
                </select>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Analyze Page
              </button>
            </div>
          </div>

          {/* Create New Content Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Create New Content
            </h2>
            <p className="text-gray-600 mb-4">
              Generate ideas and outlines for new content based on keyword research and competitor analysis.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Topic or Keyword
                </label>
                <input 
                  type="text" 
                  placeholder="Enter main topic or keyword"
                  className="border rounded-md p-2"
                />
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Generate Content Ideas
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
