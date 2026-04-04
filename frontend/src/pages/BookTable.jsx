import { useState, useEffect } from 'react';
import api from '../utils/api';
import { CalendarRange, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BookTable() {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTable, setSelectedTable] = useState(null);
    const [formData, setFormData] = useState({ date: '', time: '', guests: 1 });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const { data } = await api.get('/tables');
                setTables(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchTables();
    }, []);

    const handleBook = async (e) => {
        e.preventDefault();
        try {
            await api.post('/reservations', {
                table: selectedTable._id,
                date: formData.date,
                time: formData.time,
                guests: formData.guests
            });
            alert('Booking submitted successfully!');
            setSelectedTable(null);
            navigate('/reservations');
        } catch (err) {
            alert('Error booking table');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Book a Table</h1>
                <p className="text-gray-500 mt-1">Select an available table for your upcoming meal.</p>
            </div>

            {loading ? (
                <div className="flex px-4 py-10 justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent flex rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {tables.map(table => (
                        <div key={table._id} onClick={() => setSelectedTable(table)} 
                             className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${selectedTable?._id === table._id ? 'border-primary bg-primary/5 scale-105 shadow-md' : 'border-gray-100 bg-white hover:border-primary/50'}`}>
                            <h3 className="text-4xl font-black text-center mb-2">{table.tableNumber}</h3>
                            <p className="text-center text-gray-500 flex items-center justify-center gap-1"><Users size={16}/> {table.capacity} pax</p>
                            <span className="block text-center mt-4 text-xs font-bold uppercase tracking-wider text-green-500 bg-green-50 rounded-full py-1">Available</span>
                        </div>
                    ))}
                </div>
            )}

            {selectedTable && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
                        <h2 className="text-2xl font-bold mb-6">Confirm Booking (Table {selectedTable.tableNumber})</h2>
                        <form onSubmit={handleBook} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" required className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <input type="time" required className="input-field" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                                <input type="number" min="1" max={selectedTable.capacity} required className="input-field" value={formData.guests} onChange={e => setFormData({...formData, guests: e.target.value})} />
                            </div>
                            <div className="pt-4 flex gap-3 justify-end">
                                <button type="button" onClick={() => setSelectedTable(null)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="btn-primary">Place Booking</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}