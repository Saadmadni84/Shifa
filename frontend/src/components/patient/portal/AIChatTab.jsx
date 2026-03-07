import React from 'react';

const AIChatTab = () => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ask about your visit</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 italic mb-4">
                [ AI Chat Interface - Demo only ]
            </div>
            <div className="flex">
                <input type="text" placeholder="Type a question..." className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" disabled />
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-r-lg font-medium" disabled>Send</button>
            </div>
        </div>
    );
};

export default AIChatTab;
