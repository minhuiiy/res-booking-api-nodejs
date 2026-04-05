import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Edit2, Trash2, Mail, Shield } from 'lucide-react';

export default function Users() {
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'user' });
    const [file, setFile] = useState(null);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsersList(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const uploadData = new FormData();
            uploadData.append('name', formData.name);
            uploadData.append('email', formData.email);
            uploadData.append('role', formData.role);
            if (file) uploadData.append('avatar', file);

            if (editId) {
                await api.put(`/users/${editId}`, uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Not adding logic for create via admin right now as the user primarily needed Edit and Delete 
                // and register is already separate.
            }
            
            setIsModalOpen(false);
            setEditId(null);
            setFormData({ name: '', email: '', role: 'user' });
            setFile(null);
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert('Error updating user');
        }
    };

    const handleDelete = async (id) => {
        if (id === user._id) {
            return alert('You cannot delete yourself.');
        }
        if (window.confirm('Delete this user?')) {
            try {
                await api.delete(`/users/${id}`);
                fetchUsers();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleEdit = (u) => {
        setFormData({
            name: u.name,
            email: u.email,
            role: u.role
        });
        setEditId(u._id);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Users</h1>
                    <p className="text-gray-500 mt-1">Manage platform users and their roles.</p>
                </div>
            </div>
            
            {loading ? (
                <div className="flex px-4 py-10 justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent flex rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="p-4 border-b font-medium text-gray-500">User</th>
                                <th className="p-4 border-b font-medium text-gray-500">Email</th>
                                <th className="p-4 border-b font-medium text-gray-500">Role</th>
                                <th className="p-4 border-b font-medium text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersList.map((u) => (
                                <tr key={u._id} className="border-b hover:bg-gray-50 transition-colors last:border-b-0">
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                                            {u.avatar ? (
                                                <img src={`http://localhost:5000${u.avatar}`} className="w-full h-full object-cover" alt="avatar" />
                                            ) : (
                                                <span className="text-gray-500 font-bold">{u.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <span className="font-semibold text-gray-900">{u.name}</span>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Mail size={16} className="text-gray-400" />
                                            {u.email}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Shield size={16} className={u.role === 'admin' ? 'text-green-500' : 'text-blue-500'} />
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-lg capitalize ${u.role === 'admin' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {u.role}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        {user?.role === 'admin' && (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(u)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(u._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {usersList.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit User Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl relative animate-in zoom-in-95">
                        <h2 className="text-2xl font-bold mb-6">Edit User</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" required className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar (Optional)</label>
                                <input type="file" accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" onChange={e => setFile(e.target.files[0])} />
                            </div>
                            <div className="pt-4 flex gap-3 justify-end">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
