import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Plus, Edit2, Trash2, MapPin, Phone, Heart } from 'lucide-react';

export default function Restaurants() {
    const [restaurants, setRestaurants] = useState([]);
    const [myFavs, setMyFavs] = useState([]); 
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', address: '', phone: '' });
    const [file, setFile] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Tách riêng ra để nếu 1 cái lỗi cái kia vẫn chạy
            const resRest = await api.get('/restaurants');
            setRestaurants(resRest.data || []);

            try {
                const resFav = await api.get('/favorites');
                if (resFav.data && resFav.data.data) {
                    const favIds = resFav.data.data
                        .filter(f => f.restaurant)
                        .map(f => f.restaurant._id || f.restaurant); 
                    setMyFavs(favIds);
                }
            } catch (favErr) {
                console.log("Chưa có danh sách yêu thích hoặc lỗi lấy fav");
                setMyFavs([]);
            }
        } catch (error) {
            console.error("Lỗi tải nhà hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleFavorite = async (restaurantId) => {
        try {
            if (myFavs.includes(restaurantId)) {
                await api.delete(`/favorites/${restaurantId}`);
            } else {
                await api.post('/favorites', { restaurantId });
            }
            await fetchData(); 
        } catch (error) {
            console.error("Lỗi thao tác yêu thích:", error);
        }
    };

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
            fetchData();
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Xóa nhà hàng này?')) {
            try {
                await api.delete(`/restaurants/${id}`);
                fetchData();
            } catch (error) { console.error(error); }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Restaurants</h1>
                    <p className="text-gray-500 mt-1">Khám phá và đặt bàn tại các nhà hàng xịn nhất.</p>
                </div>
                {user?.role === 'admin' && (
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Add New
                </button>
                )}
            </div>
            
            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {restaurants.map(rest => (
                        <div key={rest._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative group transition-all hover:shadow-md">
                            
                            {user?.role !== 'admin' && (
                                <button 
                                    onClick={() => handleFavorite(rest._id)}
                                    className="absolute top-6 right-6 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all hover:scale-110 active:scale-95"
                                >
                                    <Heart 
                                        size={20} 
                                        className={myFavs.includes(rest._id) ? "text-red-500" : "text-gray-400"} 
                                        fill={myFavs.includes(rest._id) ? "currentColor" : "none"} 
                                    />
                                </button>
                            )}

                            <div className="h-48 rounded-xl overflow-hidden mb-4 bg-gray-100">
                                <img 
                                    src={rest.image ? `http://localhost:5000${rest.image}` : 'https://via.placeholder.com/400x300?text=No+Image'} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" 
                                />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{rest.name}</h3>
                            <div className="space-y-2 text-sm text-gray-500">
                                <div className="flex items-center gap-2 text-gray-600"><MapPin size={16} className="text-primary"/> <span>{rest.address}</span></div>
                                <div className="flex items-center gap-2 text-gray-600"><Phone size={16} className="text-primary"/> <span>{rest.phone}</span></div>
                            </div>

                            {user?.role === 'admin' && (
                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                                <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                                <button onClick={() => handleDelete(rest._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                            </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl relative animate-in zoom-in-95">
                        <h2 className="text-2xl font-bold mb-6">Add Restaurant</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input required placeholder="Name" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            <input required placeholder="Address" className="input-field" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                            <input required placeholder="Phone" className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
                            <div className="pt-4 flex gap-3 justify-end">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600">Cancel</button>
                                <button type="submit" className="btn-primary">Save Branch</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}