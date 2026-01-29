import React, { useState } from 'react';
import ComponentList from './components/ComponentList';
import AddComponentForm from './components/AddComponentForm';
import SubsystemManager from './components/SubsystemManager';
import ManagementPanel from './components/ManagementPanel';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showManagementPanel, setShowManagementPanel] = useState(false);

  const handleAddSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Satellite Components Database
          </h1>
          <button
            onClick={() => setShowManagementPanel(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            + Manage
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Component List</h2>
          <ComponentList refreshTrigger={refreshTrigger} />
        </div>

        <ManagementPanel
          isOpen={showManagementPanel}
          onClose={() => setShowManagementPanel(false)}
        >
          <AddComponentForm onAddSuccess={handleAddSuccess} />
          <SubsystemManager />
        </ManagementPanel>
      </div>
    </div>
  );
}

export default App;
