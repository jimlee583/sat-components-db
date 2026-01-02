import React, { useEffect, useState } from 'react';
import api from '../api';

const ComponentList = ({ refreshTrigger }) => {
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [subsystems, setSubsystems] = useState([]);

    useEffect(() => {
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

    const handleEditClick = (component) => {
        setEditingId(component.id);
        setEditFormData({
            name: component.name,
            wbs: component.wbs,
            mass_kg: component.mass_kg,
            cost_usd: component.cost_usd,
            quantity: component.quantity,
            parent_id: component.parent_id,
            subsystem_id: component.subsystem_id
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({
            ...editFormData,
            [name]: value
        });
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditFormData({});
    };

    const handleEditSave = async (id) => {
        try {
            const payload = {
                name: editFormData.name,
                wbs: editFormData.wbs || null,
                mass_kg: parseFloat(editFormData.mass_kg),
                cost_usd: parseFloat(editFormData.cost_usd),
                quantity: parseInt(editFormData.quantity, 10),
                parent_id: (editFormData.parent_id === '' || editFormData.parent_id === null) ? null : parseInt(editFormData.parent_id, 10),
                subsystem_id: (editFormData.subsystem_id === '' || editFormData.subsystem_id === null) ? null : parseInt(editFormData.subsystem_id, 10),
            };

            await api.patch(`/components/${id}`, payload);
            
            // Update local state with the new values
            setComponents(prev => prev.map(c => c.id === id ? { ...c, ...payload } : c));
            setEditingId(null);
            setEditFormData({});
            
        } catch (err) {
            console.error("Error updating component:", err);
            alert("Failed to update component. " + (err.response?.data?.detail || ""));
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
                        <th scope="col" className="px-6 py-3">WBS</th>
                        <th scope="col" className="px-6 py-3">Mass (kg)</th>
                        <th scope="col" className="px-6 py-3">Cost ($)</th>
                        <th scope="col" className="px-6 py-3">Qty</th>
                        <th scope="col" className="px-6 py-3">Parent ID</th>
                        <th scope="col" className="px-6 py-3">Subsystem</th>
                        <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {components.length === 0 ? (
                        <tr>
                            <td colSpan="9" className="px-6 py-4 text-center">No components found.</td>
                        </tr>
                    ) : (
                        components.map((comp) => {
                            const isEditing = editingId === comp.id;
                            return (
                                <tr key={comp.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{comp.id}</td>
                                    
                                    {isEditing ? (
                                        <>
                                            <td className="px-6 py-4">
                                                <input 
                                                    type="text" 
                                                    name="name" 
                                                    value={editFormData.name} 
                                                    onChange={handleEditChange} 
                                                    className="border rounded p-1 w-full dark:bg-gray-700 dark:text-white dark:border-gray-600" 
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input 
                                                    type="text" 
                                                    name="wbs" 
                                                    value={editFormData.wbs || ''} 
                                                    onChange={handleEditChange} 
                                                    className="border rounded p-1 w-24 dark:bg-gray-700 dark:text-white dark:border-gray-600" 
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input 
                                                    type="number" 
                                                    step="0.000001" 
                                                    name="mass_kg" 
                                                    value={editFormData.mass_kg} 
                                                    onChange={handleEditChange} 
                                                    className="border rounded p-1 w-24 dark:bg-gray-700 dark:text-white dark:border-gray-600" 
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input 
                                                    type="number" 
                                                    step="0.01" 
                                                    name="cost_usd" 
                                                    value={editFormData.cost_usd} 
                                                    onChange={handleEditChange} 
                                                    className="border rounded p-1 w-24 dark:bg-gray-700 dark:text-white dark:border-gray-600" 
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input 
                                                    type="number" 
                                                    name="quantity" 
                                                    value={editFormData.quantity} 
                                                    onChange={handleEditChange} 
                                                    className="border rounded p-1 w-20 dark:bg-gray-700 dark:text-white dark:border-gray-600" 
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input 
                                                    type="number" 
                                                    name="parent_id" 
                                                    value={editFormData.parent_id || ''} 
                                                    onChange={handleEditChange} 
                                                    className="border rounded p-1 w-20 dark:bg-gray-700 dark:text-white dark:border-gray-600" 
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    name="subsystem_id"
                                                    value={editFormData.subsystem_id || ''}
                                                    onChange={handleEditChange}
                                                    className="border rounded p-1 w-32 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                >
                                                    <option value="">None</option>
                                                    {subsystems.map(s => (
                                                        <option key={s.id} value={s.id}>
                                                            {s.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 space-x-2">
                                                <button 
                                                    onClick={() => handleEditSave(comp.id)} 
                                                    className="font-medium text-green-600 dark:text-green-500 hover:underline bg-transparent border-0 cursor-pointer"
                                                >
                                                    Save
                                                </button>
                                                <button 
                                                    onClick={handleEditCancel} 
                                                    className="font-medium text-gray-600 dark:text-gray-400 hover:underline bg-transparent border-0 cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4">{comp.name}</td>
                                            <td className="px-6 py-4">{comp.wbs || '-'}</td>
                                            <td className="px-6 py-4">{comp.mass_kg}</td>
                                            <td className="px-6 py-4">{comp.cost_usd}</td>
                                            <td className="px-6 py-4">{comp.quantity}</td>
                                            <td className="px-6 py-4">{comp.parent_id || '-'}</td>
                                            <td className="px-6 py-4">{comp.subsystem ? comp.subsystem.name : '-'}</td>
                                            <td className="px-6 py-4 space-x-2">
                                                <button
                                                    onClick={() => handleEditClick(comp)}
                                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline bg-transparent border-0 cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(comp.id)}
                                                    className="font-medium text-red-600 dark:text-red-500 hover:underline bg-transparent border-0 cursor-pointer"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ComponentList;
