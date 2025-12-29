import React, { useState } from 'react';
import ComponentList from './components/ComponentList';
import AddComponentForm from './components/AddComponentForm';
import SubsystemManager from './components/SubsystemManager';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Satellite Components Database
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Component List</h2>
            <ComponentList refreshTrigger={refreshTrigger} />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Add Component</h2>
            <AddComponentForm onAddSuccess={handleAddSuccess} />
            
            <SubsystemManager />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
