import { useState, useEffect } from 'react';
import { requestAPI } from '../api/requests';
import { UserIcon, TeamIcon } from './Icons';

const AssignTechnicianModal = ({ isOpen, onClose, request, onSuccess }) => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchTechnicians();
        }
    }, [isOpen]);

    const fetchTechnicians = async () => {
        try {
            setLoading(true);
            const data = await requestAPI.getAvailableTechnicians();
            setTechnicians(data);
        } catch (err) {
            console.error('Failed to fetch technicians:', err);
            setError('Failed to load technicians');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (technicianId) => {
        try {
            setAssigning(true);
            setError('');
            await requestAPI.assignTechnician(request._id, technicianId);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign technician');
        } finally {
            setAssigning(false);
        }
    };

    const filteredTechnicians = technicians.filter(tech =>
        tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Assign Technician
                </h2>

                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                        <span className="font-semibold">Request:</span> {request.subject}
                    </p>
                    <p className="text-sm text-gray-600">
                        Equipment: {request.equipmentId?.name || 'N/A'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {/* Search */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading technicians...</div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {filteredTechnicians.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No technicians found
                            </div>
                        ) : (
                            filteredTechnicians.map((tech) => (
                                <div
                                    key={tech._id}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <UserIcon className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{tech.name}</h3>
                                            <p className="text-sm text-gray-600">{tech.email}</p>
                                            {tech.teams && tech.teams.length > 0 && (
                                                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                                    <TeamIcon className="w-3 h-3" />
                                                    {tech.teams.map(t => t.name).join(', ')}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${tech.availability === 'Available'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {tech.availability}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {tech.activeRequestsCount} active {tech.activeRequestsCount === 1 ? 'request' : 'requests'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAssign(tech._id)}
                                        disabled={assigning}
                                        className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {assigning ? 'Assigning...' : 'Assign'}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignTechnicianModal;
