import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { equipmentAPI } from '../api/equipment';
import MaintenanceHistory from '../components/MaintenanceHistory';

const EquipmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEquipmentDetail();
    }, [id]);

    const fetchEquipmentDetail = async () => {
        try {
            setLoading(true);
            const result = await equipmentAPI.getById(id);
            setData(result);
        } catch (error) {
            console.error('Failed to fetch equipment:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    if (!data) {
        return <div className="text-center py-12">Equipment not found</div>;
    }

    const { equipment, openRequestCount } = data;

    return (
        <div>
            <button
                onClick={() => navigate('/equipment')}
                className="mb-4 text-blue-600 hover:text-blue-700 flex items-center"
            >
                ← Back to Equipment List
            </button>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">{equipment.name}</h1>
                    <span
                        className={`px-3 py-1 text-sm font-semibold rounded-full ${
                            equipment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            equipment.status === 'DAMAGED' ? 'bg-orange-100 text-orange-800' :
                            equipment.status === 'UNDER_MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                            equipment.status === 'SCRAP' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                        }`}
                    >
                        {equipment.status}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Serial Number</h3>
                        <p className="text-lg text-gray-900">{equipment.serialNumber}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
                        <p className="text-lg text-gray-900">{equipment.category}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Department</h3>
                        <p className="text-lg text-gray-900">{equipment.department}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                        <p className="text-lg text-gray-900">{equipment.location}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Owner</h3>
                        <p className="text-lg text-gray-900">{equipment.ownerEmployeeName || '-'}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Maintenance Team</h3>
                        <p className="text-lg text-gray-900">
                            {equipment.defaultMaintenanceTeamId?.name || 'Not assigned'}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Purchase Date</h3>
                        <p className="text-lg text-gray-900">
                            {new Date(equipment.purchaseDate).toLocaleDateString()}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Warranty Until</h3>
                        <p className="text-lg text-gray-900">
                            {equipment.warrantyUntil
                                ? new Date(equipment.warrantyUntil).toLocaleDateString()
                                : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Smart Maintenance Button */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Maintenance Requests</h2>

                <button
                    onClick={() => navigate(`/kanban?equipmentId=${id}`)}
                    className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <span>📋</span>
                    <span>Maintenance ({openRequestCount})</span>
                </button>

                <p className="mt-2 text-sm text-gray-600">
                    {openRequestCount === 0
                        ? 'No open maintenance requests for this equipment'
                        : `${openRequestCount} open maintenance request${openRequestCount > 1 ? 's' : ''}`}
                </p>
            </div>

            {/* Notes Section */}
            {equipment.notes && equipment.notes.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Audit Notes</h2>
                    <div className="space-y-3">
                        {equipment.notes.map((note, index) => (
                            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                                <p className="text-sm text-gray-900">{note.text}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(note.createdAt).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Maintenance History Timeline */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
                <MaintenanceHistory equipmentId={id} />
            </div>
        </div>
    );
};

export default EquipmentDetail;
