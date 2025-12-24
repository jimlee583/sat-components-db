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
                    </tr>
                </thead>
                <tbody>
                    {components.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="px-6 py-4 text-center">No components found.</td>
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
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ComponentList;

