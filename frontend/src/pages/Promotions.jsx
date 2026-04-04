import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Plus, Edit2, Trash2, TicketPercent, Calendar, CheckCircle, XCircle, Info, Sparkles } from 'lucide-react';

export default function Promotions() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        minOrderValue: 0,
        maxDiscountAmount: 0,
        startDate: '',
        endDate: '',
        isActive: true
    });

    // Validation Tool State
    const [checkCode, setCheckCode] = useState('');
    const [checkValue, setCheckValue] = useState(0);
    const [validationResult, setValidationResult] = useState(null);
    const [isValidating, setIsValidating] = useState(false);

    const fetchPromotions = async () => {
        try {
            const { data } = await api.get('/promotions');
            setPromotions(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/promotions/${editingId}`, formData);
            } else {
                await api.post('/promotions', formData);
            }
            setIsModalOpen(false);
            resetForm();
            fetchPromotions();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error saving promotion');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this promotion?')) {
            try {
                await api.delete(`/promotions/${id}`);
                fetchPromotions();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleCheckCode = async () => {
        if (!checkCode || checkValue <= 0) return;
        setIsValidating(true);
        try {
            const { data } = await api.post('/promotions/validate', {
                code: checkCode,
                orderValue: checkValue
            });
            setValidationResult({ success: true, ...data });
        } catch (error) {
            setValidationResult({ success: false, message: error.response?.data?.message || 'Invalid code' });
        } finally {
            setIsValidating(false);
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            discountType: 'percentage',
            discountValue: 0,
            minOrderValue: 0,
            maxDiscountAmount: 0,
            startDate: '',
            endDate: '',
            isActive: true
        });
        setEditingId(null);
    };

    const openEditModal = (promo) => {
        setFormData({
            code: promo.code,
            description: promo.description,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            minOrderValue: promo.minOrderValue,
            maxDiscountAmount: promo.maxDiscountAmount || 0,
            startDate: promo.startDate.split('T')[0],
            endDate: promo.endDate.split('T')[0],
            isActive: promo.isActive
        });
        setEditingId(promo._id);
        setIsModalOpen(true);
    };

    const isExpired = (endDate) => new Date(endDate) < new Date();

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
                        <TicketPercent className="text-primary" size={36} />
                        Promotions
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">Manage discount codes and special offers for your customers.</p>
                </div>
                {user?.role === 'admin' && (
                    <button 
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="btn-primary flex items-center justify-center gap-2 px-6 py-3 text-lg font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                    >
                        <Plus size={20} /> Create New Promo
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main List */}
                <div className="xl:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Sparkles className="text-yellow-500" size={24} />
                        Active & Upcoming Deals
                    </h2>
                    
                    {loading ? (
                        <div className="flex py-20 justify-center">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : promotions.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                            <TicketPercent size={64} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600">No promotions found</h3>
                            <p className="text-gray-400 mt-2">Start by creating your first discount code!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {promotions.map(promo => (
                                <div key={promo._id} className={`relative bg-white rounded-3xl p-6 shadow-sm border transition-all hover:shadow-xl hover:-translate-y-1 group ${!promo.isActive || isExpired(promo.endDate) ? 'opacity-75 grayscale-[0.5]' : 'border-gray-100'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${!promo.isActive ? 'bg-gray-100 text-gray-500' : isExpired(promo.endDate) ? 'bg-red-50 text-red-500' : 'bg-primary/10 text-primary'}`}>
                                            {!promo.isActive ? 'Inactive' : isExpired(promo.endDate) ? 'Expired' : 'Active'}
                                        </div>
                                        {user?.role === 'admin' && (
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditModal(promo)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl"><Edit2 size={18} /></button>
                                                <button onClick={() => handleDelete(promo._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={18} /></button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{promo.code}</h3>
                                            <p className="text-gray-500 text-sm line-clamp-2 mt-1">{promo.description || 'No description provided.'}</p>
                                        </div>

                                        <div className="flex items-center gap-4 py-3 border-y border-gray-50">
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-400 uppercase font-bold">Discount</p>
                                                <p className="text-xl font-bold text-primary">
                                                    {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `$${promo.discountValue.toLocaleString()}`}
                                                </p>
                                            </div>
                                            <div className="w-px h-8 bg-gray-100"></div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-400 uppercase font-bold">Min Order</p>
                                                <p className="text-xl font-bold text-gray-700">${promo.minOrderValue.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                                            <Calendar size={14} />
                                            <span>Valid: {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Glassmorphic overlay for inactive */}
                                    {!promo.isActive && <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] rounded-3xl pointer-events-none"></div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar Utilities */}
                <div className="space-y-8">
                    {/* Check Code Card */}
                    <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors"></div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 relative">
                            <CheckCircle size={24} className="text-primary" />
                            Verify Your Code
                        </h2>
                        
                        <div className="space-y-5 relative">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Promotion Code</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. SUMMER50" 
                                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-gray-500 font-bold uppercase transition-all"
                                    value={checkCode}
                                    onChange={e => setCheckCode(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Order Amount ($)</label>
                                <input 
                                    type="number" 
                                    placeholder="0" 
                                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white transition-all font-bold"
                                    value={checkValue}
                                    onChange={e => setCheckValue(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={handleCheckCode}
                                disabled={isValidating || !checkCode}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wide"
                            >
                                {isValidating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Check Validity'}
                            </button>

                            {validationResult && (
                                <div className={`mt-6 p-5 rounded-2xl animate-in slide-in-from-top-4 duration-300 ${validationResult.success ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                                    <div className="flex items-start gap-3">
                                        {validationResult.success ? <CheckCircle className="text-green-400 shrink-0 mt-0.5" /> : <XCircle className="text-red-400 shrink-0 mt-0.5" />}
                                        <div>
                                            <p className={`font-bold ${validationResult.success ? 'text-green-300' : 'text-red-300'}`}>
                                                {validationResult.success ? 'Success!' : 'Invalid Promo'}
                                            </p>
                                            <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                                                {validationResult.success 
                                                    ? `Congratulations! You've saved $${validationResult.finalDiscount.toLocaleString()}.` 
                                                    : validationResult.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 space-y-4">
                        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                            <Info size={20} />
                            Quick Guide
                        </h3>
                        <ul className="space-y-4 text-sm text-gray-600 font-medium">
                            <li className="flex gap-3"><span className="text-primary font-black">•</span> Codes are case-sensitive.</li>
                            <li className="flex gap-3"><span className="text-primary font-black">•</span> Only one promo can be applied per reservation.</li>
                            <li className="flex gap-3"><span className="text-primary font-black">•</span> Promotion discounts do not apply to taxes or service fees.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Admin Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 overflow-y-auto py-10">
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <TicketPercent size={28} />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                                {editingId ? 'Update Promotion' : 'Create New Promotion'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Promotion Code *</label>
                                    <input required placeholder="E.g. WELCOME2024" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 font-bold uppercase" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Description</label>
                                    <textarea rows="2" placeholder="Tell customers about this offer..." className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Discount Type</label>
                                    <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 font-bold" value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Discount Value *</label>
                                    <input type="number" required className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 font-bold" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Min Order Required</label>
                                    <input type="number" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 font-bold" value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Max Discount (For %)</label>
                                    <input type="number" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 font-bold" value={formData.maxDiscountAmount} onChange={e => setFormData({...formData, maxDiscountAmount: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Start Date *</label>
                                    <input type="date" required className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 font-bold" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">End Date *</label>
                                    <input type="date" required className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 font-bold" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 py-2">
                                <input 
                                    type="checkbox" 
                                    id="isActive" 
                                    checked={formData.isActive} 
                                    onChange={e => setFormData({...formData, isActive: e.target.checked})} 
                                    className="w-5 h-5 rounded-lg border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                />
                                <label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer">Active and available for customers</label>
                            </div>

                            <div className="pt-6 flex gap-4 justify-end">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-all">Cancel</button>
                                <button type="submit" className="bg-primary hover:bg-primary/90 text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95">
                                    {editingId ? 'Update Promotion' : 'Create Promotion'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
