// components/ResultDisplay.js
export default function ResultDisplay({ analysis }) {
    return (
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Analysis Results</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(analysis, null, 2)}
          </pre>
        </div>
      </div>
    );
  }
  