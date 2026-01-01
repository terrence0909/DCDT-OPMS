
import React, { useState } from 'react';
import { MOCK_USERS } from '../constants';
import { User, UserRole } from '../types';
import { UserPlus, MoreVertical, Shield, Mail, Edit2, Trash2, Search } from 'lucide-react';
import Modal from '../components/Common/Modal';
import Badge from '../components/Common/Badge';

const UsersPage: React.FC = () => {
  const [users] = useState<User[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">User Management</h1>
          <p className="text-secondary">Control system access, roles, and department permissions.</p>
        </div>
        <button 
          onClick={() => setIsAddUserModalOpen(true)}
          className="bg-primary text-white px-4 py-2 text-sm font-semibold rounded-sm hover:bg-[#0f2744] flex items-center gap-2"
        >
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      <div className="bg-white border border-border rounded-sm p-4 flex flex-wrap gap-4 items-center shadow-sm">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={16} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-light border border-border rounded-sm text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-secondary">
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-success"></span> {users.length} Users</span>
          <span className="flex items-center gap-2 border-l border-border pl-4"><Shield size={14} className="text-primary" /> {users.filter(u => u.role === UserRole.ADMIN).length} Admins</span>
        </div>
      </div>

      <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-light/50 border-b border-border text-secondary font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-3">User Information</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">System Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-light/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-dark">{user.name}</p>
                        <p className="text-[11px] text-secondary flex items-center gap-1"><Mail size={10} /> {user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-secondary">{user.department}</td>
                  <td className="px-6 py-4">
                    <Badge variant={user.role === UserRole.ADMIN ? 'primary' : user.role === UserRole.MANAGER ? 'success' : 'neutral'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase text-success">
                      <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                      {user.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 hover:bg-light rounded text-secondary hover:text-primary transition-colors"><Edit2 size={16} /></button>
                      <button className="p-1.5 hover:bg-alert/10 rounded text-secondary hover:text-alert transition-colors"><Trash2 size={16} /></button>
                      <button className="p-1.5 hover:bg-light rounded text-secondary"><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} title="Register New System User">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsAddUserModalOpen(false); }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase mb-1">First Name</label>
              <input type="text" required className="w-full p-2 border border-border rounded-sm text-sm" placeholder="e.g. Sipho" />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase mb-1">Last Name</label>
              <input type="text" required className="w-full p-2 border border-border rounded-sm text-sm" placeholder="e.g. Zulu" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-secondary uppercase mb-1">Gov Email Address</label>
            <input type="email" required className="w-full p-2 border border-border rounded-sm text-sm" placeholder="name@dcdt.gov.za" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase mb-1">Role</label>
              <select className="w-full p-2 border border-border rounded-sm text-sm">
                <option>{UserRole.OFFICER}</option>
                <option>{UserRole.MANAGER}</option>
                <option>{UserRole.ADMIN}</option>
                <option>{UserRole.VIEWER}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase mb-1">Department</label>
              <select className="w-full p-2 border border-border rounded-sm text-sm">
                <option>ICT Policy</option>
                <option>Broadband</option>
                <option>Digital Economy</option>
                <option>Governance</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 py-2">
            <input type="checkbox" id="sendInvite" className="rounded border-border text-primary focus:ring-primary" defaultChecked />
            <label htmlFor="sendInvite" className="text-xs font-medium text-secondary">Send secure activation link via email</label>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="flex-1 px-4 py-2 border border-border text-dark text-sm font-semibold rounded-sm hover:bg-light">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-sm hover:bg-[#0f2744]">Create Account</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
