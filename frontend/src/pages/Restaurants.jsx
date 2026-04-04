import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Plus, Edit2, Trash2, MapPin, Phone } from 'lucide-react';

export default function Restaurants() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', address: '', phone: '' });
    const [file, setFile] = useState(null);

    const fetchRestaurants = async () => {
        try {
            const { data } = await api.get('/restaurants');
            setRestaurants(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const uploadData = new FormData();
            uploadData.append('name', formData.name);
            uploadData.append('address', formData.address);
            uploadData.append('phone', formData.phone);
            if (file) uploadData.append('image', file);

            await api.post('/restaurants', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setIsModalOpen(false);
            setFormData({ name: '', address: '', phone: '' });
            setFile(null);
            fetchRestaurants();
        } catch (error) {
            console.error(error);
            alert('Error adding restaurant');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this restaurant?')) {
            try {
                await api.delete(`/restaurants/${id}`);
                fetchRestaurants();
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Restaurants</h1>
                    <p className="text-gray-500 mt-1">Manage your branches and locations.</p>
                </div>
                {user?.role === 'admin' && (
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2 shadow-primary/30"
                >
                    <Plus size={18} /> Add New
                </button>
                )}
            </div>
            
            {loading ? (
                <div className="flex px-4 py-10 justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent flex rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {restaurants.map(rest => (
                        <div key={rest._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                            <div className="h-48 rounded-xl overflow-hidden mb-4 bg-gray-100 relative">
                                {rest.image ? (
                                    <img src={`http://localhost:5000${rest.image}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{rest.name}</h3>
                            <div className="space-y-2 text-sm text-gray-500">
                                <div className="flex items-center gap-2 px-1">
                                    <MapPin size={16} className="text-primary/70 shrink-0" />
                                    <span className="truncate">{rest.address}</span>
                                </div>
                                <div className="flex items-center gap-2 px-1">
                                    <Phone size={16} className="text-primary/70 shrink-0" />
                                    <span>{rest.phone}</span>
                                </div>
                            </div>
                            {user?.role === 'admin' && (
                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-50">
                                <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(rest._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl relative animate-in zoom-in-95">
                        <h2 className="text-2xl font-bold mb-6">Add Restaurant</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input required className="input-field" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input required className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                                <input type="file" accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" onChange={e => setFile(e.target.files[0])} />
                            </div>
                            <div className="pt-4 flex gap-3 justify-end">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="btn-primary">Save Branch</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}