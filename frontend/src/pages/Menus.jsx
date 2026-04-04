import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2 } from 'lucide-react';

export default function Menus() {
    const [menus, setMenus] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({ category: '', name: '', price: '', description: '' });
    const [catName, setCatName] = useState('');
    const [file, setFile] = useState(null);

    const fetchData = async () => {
        try {
            const [menusRes, catRes] = await Promise.all([
                api.get('/menu-items'),
                api.get('/categories')
            ]);
            setMenus(menusRes.data);
            setCategories(catRes.data);
            if(catRes.data.length > 0 && !formData.category) {
                setFormData(prev => ({...prev, category: catRes.data[0]._id}));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await api.post('/categories', { name: catName });
            setCatName('');
            setIsCatModalOpen(false);
            fetchData();
        } catch(e) { alert('Error adding category'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!formData.category) return alert("Please create a Category first");
        try {
            const uploadData = new FormData();
            uploadData.append('category', formData.category);
            uploadData.append('name', formData.name);
            uploadData.append('price', formData.price);
            uploadData.append('description', formData.description);
            if (file) uploadData.append('image', file);

            await api.post('/menu-items', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setIsModalOpen(false);
            setFormData({ ...formData, name: '', price: '', description: '' });
            setFile(null);
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Error adding menu item');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this menu item?')) {
            try {
                await api.delete(`/menu-items/${id}`);
                fetchData();
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Food Menu List</h1>
                    <p className="text-gray-500 mt-1">Manage categories and food items.</p>
                </div>
                {user?.role === 'admin' && (
                <div className="flex gap-2">
                    <button onClick={() => setIsCatModalOpen(true)} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg flex items-center gap-2 font-medium">
                        <Plus size={18} /> Category
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 shadow-primary/30">
                        <Plus size={18} /> Menu Item
                    </button>
                </div>
                )}
            </div>
            
            {loading ? (
                <div className="flex px-4 py-10 justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent flex rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
                    {menus.map(menu => (
                        <div key={menu._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 group">
                            <div className="h-40 rounded-xl overflow-hidden mb-4 bg-gray-100 relative">
                                {menu.image ? (
                                    <img src={`http://localhost:5000${menu.image}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                )}
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg font-bold text-primary">
                                    ${menu.price}
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 truncate">{menu.name}</h3>
                            <p className="text-sm text-gray-500 truncate mt-1">{menu.description || 'No description'}</p>
                            
                            {user?.role === 'admin' && (
                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-50">
                                <button onClick={() => handleDelete(menu._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            )}
                        </div>
                    ))}
                    {menus.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500">No menu items found. Please create a category and add some items.</div>
                    )}
                </div>
            )}

            {/* Menu Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6">Add Menu Item</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select required className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                    <option value="" disabled>Select Category</option>
                                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div><label className="block text-sm">Name</label><input required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                            <div><label className="block text-sm">Price</label><input type="number" required className="input-field" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
                            <div><label className="block text-sm">Description</label><input className="input-field" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                            <div><label className="block text-sm">Image</label><input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} /></div>
                            
                            <div className="pt-4 flex gap-3 justify-end">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="btn-primary">Save Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {isCatModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6">New Category</h2>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <div><label className="block text-sm">Category Name</label><input required className="input-field" value={catName} onChange={e => setCatName(e.target.value)} /></div>
                            <div className="pt-4 flex gap-3 justify-end">
                                <button type="button" onClick={() => setIsCatModalOpen(false)} className="px-5 py-2 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}