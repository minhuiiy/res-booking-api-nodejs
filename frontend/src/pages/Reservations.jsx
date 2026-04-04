import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Check, X } from 'lucide-react';

export default function Reservations() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    const fetchReservations = async () => {
        try {
            const { data } = await api.get('/reservations');
            setReservations(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/reservations/${id}`, { status });
            fetchReservations();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    {user?.role === 'admin' ? 'Booking Management' : 'My Bookings'}
                </h1>
            </div>

            {loading ? (
                <div className="flex px-4 py-10 justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent flex rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                {user?.role === 'admin' && <th className="px-6 py-4">Customer</th>}
                                <th className="px-6 py-4">Table No.</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Guests</th>
                                <th className="px-6 py-4">Status</th>
                                {user?.role === 'admin' && <th className="px-6 py-4">Action</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {reservations.map(res => (
                                <tr key={res._id} className="hover:bg-gray-50">
                                    {user?.role === 'admin' && (
                                        <td className="px-6 py-4 font-medium text-gray-900 border-r">{res.user ? `${res.user.name}` : 'Unknown'}</td>
                                    )}
                                    <td className="px-6 py-4 font-bold">{res.table ? res.table.tableNumber : 'N/A'}</td>
                                    <td className="px-6 py-4">{new Date(res.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{res.time}</td>
                                    <td className="px-6 py-4">{res.guests} pax</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            res.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                            res.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {res.status.toUpperCase()}
                                        </span>
                                    </td>
                                    {user?.role === 'admin' && (
                                        <td className="px-6 py-4 flex gap-2">
                                            {res.status === 'pending' && (
                                                <>
                                                    <button onClick={() => updateStatus(res._id, 'confirmed')} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg">
                                                        <Check size={16}/>
                                                    </button>
                                                    <button onClick={() => updateStatus(res._id, 'cancelled')} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg">
                                                        <X size={16}/>
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {reservations.length === 0 && (
                                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-500">No reservations found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}