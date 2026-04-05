import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Heart, Store, MapPin, Phone } from 'lucide-react';

export default function Favorites() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFavorites = async () => {
        try {
            const res = await api.get('/favorites');
            // Backend của anh trả về: { success: true, data: [ { restaurant: {...} }, ... ] }
            // Nên mình phải lấy res.data.data
            if (res.data && res.data.data) {
                setFavorites(res.data.data);
            } else {
                setFavorites([]);
            }
        } catch (err) {
            console.error("Lỗi lấy danh sách yêu thích:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-gray-900">
                <Heart className="text-red-500" fill="currentColor" size={32} /> 
                My Favorite Restaurants
            </h1>
            
            {favorites.length === 0 ? (
                <div className="bg-white p-16 rounded-3xl text-center shadow-sm border border-dashed border-gray-200">
                    <Store className="mx-auto text-gray-200 mb-4" size={64} />
                    <p className="text-xl text-gray-400 font-medium">Anh chưa có nhà hàng yêu thích nào đâu ạ!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {favorites.map((fav) => (
                        <div key={fav._id} className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                            <div className="h-52 overflow-hidden relative bg-gray-100">
                                {fav.restaurant?.image ? (
                                    <img 
                                        src={`http://localhost:5000${fav.restaurant.image}`} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 italic">No Image</div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-lg">
                                    <Heart size={18} className="text-red-500" fill="currentColor" />
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-xl text-gray-900 mb-2 truncate">
                                    {fav.restaurant?.name || "Unknown Restaurant"}
                                </h3>
                                <p className="text-gray-500 text-sm flex items-center gap-2 mb-2">
                                    <MapPin size={16} className="text-red-400 shrink-0" /> 
                                    <span className="truncate">{fav.restaurant?.address || "No address provided"}</span>
                                </p>
                                <p className="text-gray-500 text-sm flex items-center gap-2 mb-4">
                                    <Phone size={16} className="text-primary shrink-0" /> 
                                    <span>{fav.restaurant?.phone || "No phone"}</span>
                                </p>
                                <button className="w-full py-3 bg-gray-50 text-gray-600 rounded-xl font-semibold hover:bg-primary hover:text-white transition-colors">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}