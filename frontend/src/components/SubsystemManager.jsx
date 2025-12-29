import React, { useState, useEffect } from 'react';
import api from '../api';

const SubsystemManager = () => {
    const [subsystems, setSubsystems] = useState([]);
    const [name, setName] = useState('');
    const [error, setError] = useState(null);

    const fetchSubsystems = async () => {
        try {
            const res = await api.get('/subsystems');
            setSubsystems(res.data);
            setError(null);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchSubsystems();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/subsystems', { name });
            setName('');
            fetchSubsystems();
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to add subsystem");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete subsystem?")) return;
        try {
            await api.delete(`/subsystems/${id}`);
            fetchSubsystems();
        } catch (err) {
             setError(err.response?.data?.detail || "Failed to delete subsystem");
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Manage Subsystems</h3>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            
            <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="New Subsystem Name"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
                    required
                />
                <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    Add
                </button>
            </form>

            <ul className="space-y-2">
                {subsystems.map(sub => (
                    <li key={sub.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        <span className="text-gray-900 dark:text-white">{sub.name}</span>
                        <button
                            onClick={() => handleDelete(sub.id)}
                            className="text-red-600 hover:text-red-800"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SubsystemManager;


