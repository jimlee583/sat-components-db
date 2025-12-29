import React, { useState } from 'react';
import api from '../api';

const AddComponentForm = ({ onAddSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        mass_kg: 0,
        cost_usd: 0,
        quantity: 1,
        parent_id: '',
        subsystem_id: '',
    });
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [subsystems, setSubsystems] = useState([]);

    React.useEffect(() => {
        const fetchSubsystems = async () => {
            try {
                const response = await api.get('/subsystems');
                setSubsystems(response.data);
            } catch (err) {
                console.error("Error fetching subsystems:", err);
            }
        };
        fetchSubsystems();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        const payload = {
            ...formData,
            mass_kg: parseFloat(formData.mass_kg),
            cost_usd: parseFloat(formData.cost_usd),
            quantity: parseInt(formData.quantity, 10),
            parent_id: formData.parent_id ? parseInt(formData.parent_id, 10) : null,
            subsystem_id: formData.subsystem_id ? parseInt(formData.subsystem_id, 10) : null,
        };

        try {
            await api.post('/components', payload);
            setFormData({
                name: '',
                mass_kg: 0,
                cost_usd: 0,
                quantity: 1,
                parent_id: '',
                subsystem_id: '',
            });
            if (onAddSuccess) onAddSuccess();
        } catch (err) {
            console.error("Error adding component:", err);
            setError(err.response?.data?.detail || "Failed to add component.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Add New Component</h3>
            {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="mass_kg" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mass (kg)</label>
                        <input
                            type="number"
                            step="0.000001"
                            name="mass_kg"
                            id="mass_kg"
                            required
                            min="0"
                            value={formData.mass_kg}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label htmlFor="cost_usd" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cost ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            name="cost_usd"
                            id="cost_usd"
                            required
                            min="0"
                            value={formData.cost_usd}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                        <input
                            type="number"
                            name="quantity"
                            id="quantity"
                            required
                            min="1"
                            value={formData.quantity}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Parent ID (Optional)</label>
                        <input
                            type="number"
                            name="parent_id"
                            id="parent_id"
                            value={formData.parent_id}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label htmlFor="subsystem_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subsystem (Optional)</label>
                        <select
                            name="subsystem_id"
                            id="subsystem_id"
                            value={formData.subsystem_id}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                        >
                            <option value="">None</option>
                            {subsystems.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {submitting ? 'Adding...' : 'Add Component'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddComponentForm;

