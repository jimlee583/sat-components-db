import React, { useEffect, useState } from 'react';
import api from '../api';

const ComponentList = ({ refreshTrigger }) => {
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchComponents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/components');
            setComponents(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching components:", err);
            setError("Failed to fetch components.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this component?")) {
            return;
        }

        try {
            await api.delete(`/components/${id}`);
            // Optimistic update or refetch
            setComponents(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error("Error deleting component:", err);
            alert("Failed to delete component. " + (err.response?.data?.detail || ""));
        }
    };

    useEffect(() => {
        fetchComponents();
    }, [refreshTrigger]);

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">ID</th>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Mass (kg)</th>
                        <th scope="col" className="px-6 py-3">Cost ($)</th>
                        <th scope="col" className="px-6 py-3">Qty</th>
                        <th scope="col" className="px-6 py-3">Parent ID</th>
                        <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {components.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="px-6 py-4 text-center">No components found.</td>
                        </tr>
                    ) : (
                        components.map((comp) => (
                            <tr key={comp.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{comp.id}</td>
                                <td className="px-6 py-4">{comp.name}</td>
                                <td className="px-6 py-4">{comp.mass_kg}</td>
                                <td className="px-6 py-4">{comp.cost_usd}</td>
                                <td className="px-6 py-4">{comp.quantity}</td>
                                <td className="px-6 py-4">{comp.parent_id || '-'}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleDelete(comp.id)}
                                        className="font-medium text-red-600 dark:text-red-500 hover:underline bg-transparent border-0 p-0 cursor-pointer"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ComponentList;
