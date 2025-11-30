'use client';

import { useState, FormEvent } from 'react';
import { toast } from 'react-toastify';
import { FaUser, FaCalendarAlt, FaUsers, FaMapMarkerAlt, FaHome, FaSave, FaTimes, FaEdit, FaBox, FaPlus, FaTrash, FaIdCard, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { gnList, getDivisionalSecretariats, getGNNamesBySecretariat, type GNItem } from '@/lib/locations';

interface LostItem {
  name: string;
  quantity: number;
  price?: number;
}

interface LostItemRow {
  id: number;
  name: string;
  quantity: number;
  price: number;
  isOther: boolean;
}

const LOST_ITEM_OPTIONS = [
  'TV',
  'Sofa',
  'Cupboards',
  'kitchen items',
  'fridge',
  'washing machine',
  'Other'
];

interface FamilyMember {
  name: string;
  age: number;
  status: 'Safe' | 'Not Safe';
  nic?: string;
}

interface FamilyMemberRow {
  id: number;
  name: string;
  age: number;
  status: 'Safe' | 'Not Safe';
  nic: string;
}

interface Person {
  id?: number;
  name: string;
  age: number;
  nic?: string;
  number_of_members: number;
  address: string;
  house_state: string;
  location?: string;
  lost_items?: LostItem[];
  family_members?: FamilyMember[];
}

interface PersonFormProps {
  person?: Person;
  onSubmit: (person: Omit<Person, 'id'>) => Promise<void>;
  onCancel?: () => void;
}

export default function PersonForm({ person, onSubmit, onCancel }: PersonFormProps) {
  const [formData, setFormData] = useState<Omit<Person, 'id'>>({
    name: person?.name || '',
    age: person?.age || 0,
    nic: person?.nic || '',
    number_of_members: person?.number_of_members || 0,
    address: person?.address || '',
    house_state: person?.house_state || '',
    location: person?.location || '',
    lost_items: person?.lost_items || [],
    family_members: person?.family_members || [],
  });
  const [lostItemRows, setLostItemRows] = useState<LostItemRow[]>(() => {
    if (person?.lost_items && person.lost_items.length > 0) {
      return person.lost_items.map((item, index) => {
        const isOther = !LOST_ITEM_OPTIONS.slice(0, -1).includes(item.name);
        return {
          id: Date.now() + index,
          name: item.name,
          quantity: item.quantity,
          price: item.price || 0,
          isOther: isOther,
        };
      });
    }
    return [];
  });
  const [familyMemberRows, setFamilyMemberRows] = useState<FamilyMemberRow[]>(() => {
    if (person?.family_members && person.family_members.length > 0) {
      return person.family_members.map((member, index) => ({
        id: Date.now() + index + 1000,
        name: member.name,
        age: member.age,
        status: member.status,
        nic: member.nic || '',
      }));
    }
    return [];
  });
  const [nextRowId, setNextRowId] = useState(1);
  const [nextFamilyRowId, setNextFamilyRowId] = useState(2000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize divisional secretariat from existing location if editing
  const getDivisionalSecretariatFromLocation = (location: string): string => {
    if (!location) return '';
    const item = gnList.find(item => item.gnName === location);
    return item ? item.divisionalSecretariat : '';
  };
  
  const [divisionalSecretariat, setDivisionalSecretariat] = useState<string>(() => {
    if (person?.location) {
      return getDivisionalSecretariatFromLocation(person.location);
    }
    return '';
  });
  
  // Get available GN divisions based on selected divisional secretariat
  const availableGNDivisions = divisionalSecretariat 
    ? getGNNamesBySecretariat(divisionalSecretariat)
    : gnList.map(item => item.gnName).sort();

  const validateForm = (): boolean => {
    // Validate name
    if (!formData.name || formData.name.trim().length === 0) {
      toast.error('Name is required');
      return false;
    }
    if (formData.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return false;
    }
    if (formData.name.trim().length > 100) {
      toast.error('Name must be less than 100 characters');
      return false;
    }

    // Validate age
    if (!formData.age || formData.age < 1) {
      toast.error('Age must be at least 1');
      return false;
    }
    if (formData.age > 150) {
      toast.error('Age must be less than 150');
      return false;
    }

    // Validate NIC (optional, but if provided, must be valid format)
    if (formData.nic && formData.nic.trim().length > 0) {
      const nic = formData.nic.trim().toUpperCase();
      // Old format: 9 digits + V or X (e.g., 748353216V)
      // New format: 12 digits (e.g., 200513601364)
      const oldFormatRegex = /^\d{9}[VX]$/;
      const newFormatRegex = /^\d{12}$/;
      
      if (!oldFormatRegex.test(nic) && !newFormatRegex.test(nic)) {
        toast.error('NIC must be in format: 9 digits + V/X or 12 digits');
        return false;
      }
    }

    // Validate family members (optional, but if provided, validate them)
    const validFamilyMembers = familyMemberRows.filter(
      (row) => row.name.trim().length > 0 && row.age > 0
    );
    if (validFamilyMembers.length > 50) {
      toast.error('Number of family members cannot exceed 50');
      return false;
    }
    
    // Validate each family member if any are provided
    for (const member of validFamilyMembers) {
      if (member.name.trim().length < 2) {
        toast.error('Family member name must be at least 2 characters');
        return false;
      }
      if (member.age < 1 || member.age > 150) {
        toast.error('Family member age must be between 1 and 150');
        return false;
      }
      // Validate family member NIC (optional, but if provided, must be valid format)
      if (member.nic && member.nic.trim().length > 0) {
        const nic = member.nic.trim().toUpperCase();
        // Old format: 9 digits + V or X (e.g., 748353216V)
        // New format: 12 digits (e.g., 200513601364)
        const oldFormatRegex = /^\d{9}[VX]$/;
        const newFormatRegex = /^\d{12}$/;
        
        if (!oldFormatRegex.test(nic) && !newFormatRegex.test(nic)) {
          toast.error(`Family member "${member.name}" NIC must be in format: 9 digits + V/X or 12 digits`);
          return false;
        }
      }
    }

    // Validate address
    if (!formData.address || formData.address.trim().length === 0) {
      toast.error('Address is required');
      return false;
    }
    if (formData.address.trim().length < 10) {
      toast.error('Address must be at least 10 characters');
      return false;
    }
    if (formData.address.trim().length > 500) {
      toast.error('Address must be less than 500 characters');
      return false;
    }

    // Validate house state
    if (!formData.house_state || formData.house_state.trim().length === 0) {
      toast.error('House state is required');
      return false;
    }

    // Validate divisional secretariat
    if (!divisionalSecretariat || divisionalSecretariat.trim().length === 0) {
      toast.error('Divisional Secretariat is required');
      return false;
    }
    
    // Validate location
    if (!formData.location || formData.location.trim().length === 0) {
      toast.error('Grama Niladari Division is required');
      return false;
    }

    return true;
  };

  const handleAddLostItemRow = () => {
    const newRow: LostItemRow = {
      id: Date.now() + nextRowId,
      name: '',
      quantity: 1,
      price: 0,
      isOther: false,
    };
    setLostItemRows([...lostItemRows, newRow]);
    setNextRowId(nextRowId + 1);
  };

  const handleUpdateLostItemRow = (id: number, field: 'name' | 'quantity' | 'price' | 'isOther', value: string | number | boolean) => {
    setLostItemRows(
      lostItemRows.map((row) => {
        if (row.id === id) {
          if (field === 'name' && value === 'Other') {
            return { ...row, name: '', isOther: true };
          } else if (field === 'name' && value !== 'Other' && typeof value === 'string') {
            return { ...row, name: value, isOther: false };
          }
          return { ...row, [field]: value };
        }
        return row;
      })
    );
  };

  const handleRemoveLostItemRow = (id: number) => {
    setLostItemRows(lostItemRows.filter((row) => row.id !== id));
  };

  const handleAddFamilyMemberRow = () => {
    const newRow: FamilyMemberRow = {
      id: Date.now() + nextFamilyRowId,
      name: '',
      age: 0,
      status: 'Safe',
      nic: '',
    };
    setFamilyMemberRows([...familyMemberRows, newRow]);
    setNextFamilyRowId(nextFamilyRowId + 1);
  };

  const handleUpdateFamilyMemberRow = (id: number, field: 'name' | 'age' | 'status' | 'nic', value: string | number) => {
    setFamilyMemberRows(
      familyMemberRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const handleRemoveFamilyMemberRow = (id: number) => {
    setFamilyMemberRows(familyMemberRows.filter((row) => row.id !== id));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Collect lost items from rows (filter out empty rows)
    const lostItems: LostItem[] = lostItemRows
      .filter((row) => row.name.trim().length > 0 && row.quantity > 0)
      .map((row) => ({
        name: row.name.trim(),
        quantity: row.quantity,
        price: row.price > 0 ? row.price : undefined,
      }));

    // Collect family members from rows (filter out empty rows)
    const familyMembers: FamilyMember[] = familyMemberRows
      .filter((row) => row.name.trim().length > 0 && row.age > 0)
      .map((row) => ({
        name: row.name.trim(),
        age: row.age,
        status: row.status,
        nic: row.nic.trim() || undefined,
      }));

    // Auto-calculate number_of_members from family members
    // If no family members, default to 1 (the person themselves)
    const numberOfMembers = familyMembers.length > 0 ? familyMembers.length : 1;

    const submitData = {
      ...formData,
      number_of_members: numberOfMembers,
      lost_items: lostItems.length > 0 ? lostItems : undefined,
      family_members: familyMembers.length > 0 ? familyMembers : undefined,
    };

    setIsSubmitting(true);
    try {
      await onSubmit(submitData);
      toast.success(person ? 'Person updated successfully!' : 'Person registered successfully!');
      if (!person) {
        setFormData({
          name: '',
          age: 0,
          nic: '',
          number_of_members: 0,
          address: '',
          house_state: '',
          location: '',
          lost_items: [],
          family_members: [],
        });
        setDivisionalSecretariat('');
        setLostItemRows([]);
        setFamilyMemberRows([]);
        setNextRowId(1);
        setNextFamilyRowId(2000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save person. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="person-form">
      <div className="form-group">
        <label htmlFor="name">
          <FaUser className="label-icon" /> Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Enter full name"
        />
      </div>

      <div className="form-group form-row">
        <div className="form-group-inline">
          <label htmlFor="age">
            <FaCalendarAlt className="label-icon" /> Age *
          </label>
          <input
            type="number"
            id="age"
            value={formData.age || ''}
            onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
            required
            min="0"
            placeholder="Enter age"
          />
        </div>
        <div className="form-group-inline">
          <label htmlFor="nic">
            <FaIdCard className="label-icon" /> NIC
          </label>
          <input
            type="text"
            id="nic"
            value={formData.nic || ''}
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              setFormData({ ...formData, nic: value });
            }}
            placeholder="Enter NIC (Optional)"
            maxLength={12}
          />
        </div>
      </div>

      <div className="form-group family-members-section">
        <div className="family-members-header">
          <label>
            <FaUsers className="label-icon" /> Family Members
            {familyMemberRows.filter((row) => row.name.trim().length > 0 && row.age > 0).length > 0 && (
              <span className="member-count">
                ({familyMemberRows.filter((row) => row.name.trim().length > 0 && row.age > 0).length} member{familyMemberRows.filter((row) => row.name.trim().length > 0 && row.age > 0).length !== 1 ? 's' : ''})
              </span>
            )}
          </label>
          <button
            type="button"
            onClick={handleAddFamilyMemberRow}
            className="btn btn-secondary btn-add-item"
          >
            <FaPlus /> Add Family Member
          </button>
        </div>
        {familyMemberRows.length > 0 && (
          <div className="family-members-rows">
            {familyMemberRows.map((row) => (
              <div key={row.id} className="family-member-input-row">
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => handleUpdateFamilyMemberRow(row.id, 'name', e.target.value)}
                  placeholder="Name *"
                  className="family-member-name-input"
                />
                <input
                  type="number"
                  value={row.age || ''}
                  onChange={(e) => handleUpdateFamilyMemberRow(row.id, 'age', parseInt(e.target.value) || 0)}
                  min="1"
                  max="150"
                  placeholder="Age *"
                  className="family-member-age-input"
                />
                <select
                  value={row.status}
                  onChange={(e) => handleUpdateFamilyMemberRow(row.id, 'status', e.target.value as 'Safe' | 'Not Safe')}
                  className="family-member-status-input"
                >
                  <option value="Safe">Safe</option>
                  <option value="Not Safe">Not Safe</option>
                </select>
                <input
                  type="text"
                  value={row.nic}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    handleUpdateFamilyMemberRow(row.id, 'nic', value);
                  }}
                  placeholder="Enter NIC (Optional)"
                  maxLength={12}
                  className="family-member-nic-input"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFamilyMemberRow(row.id)}
                  className="btn btn-sm btn-delete"
                  title="Remove member"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="address">
          <FaMapMarkerAlt className="label-icon" /> Address *
        </label>
        <textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
          rows={3}
          placeholder="Enter full address"
        />
      </div>

      <div className="form-group form-row">
        <div className="form-group-inline">
          <label htmlFor="house_state">
            <FaHome className="label-icon" /> House State *
          </label>
          <select
            id="house_state"
            value={formData.house_state}
            onChange={(e) => setFormData({ ...formData, house_state: e.target.value })}
            required
          >
            <option value="">Select house state</option>
            <option value="Safe">Safe</option>
            <option value="Partially Damaged">Partially Damaged</option>
            <option value="Severely Damaged">Severely Damaged</option>
            <option value="Destroyed">Destroyed</option>
          </select>
        </div>
        <div className="form-group-inline">
          <label htmlFor="divisionalSecretariat">
            <FaMapMarkerAlt className="label-icon" /> Divisional Secretariat *
          </label>
          <select
            id="divisionalSecretariat"
            value={divisionalSecretariat}
            onChange={(e) => {
              const selectedSecretariat = e.target.value;
              setDivisionalSecretariat(selectedSecretariat);
              // Clear location when divisional secretariat changes
              setFormData({ ...formData, location: '' });
            }}
            required
          >
            <option value="">Select Divisional Secretariat</option>
            {getDivisionalSecretariats().map((secretariat) => (
              <option key={secretariat} value={secretariat}>
                {secretariat}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group-inline">
          <label htmlFor="location">
            <FaMapMarkerAlt className="label-icon" /> Grama Niladari Division *
          </label>
          <select
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          >
            <option value="">Select Grama Niladari Division</option>
            {availableGNDivisions.map((gnName) => (
              <option key={gnName} value={gnName}>
                {gnName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group lost-items-section">
        <div className="lost-items-header">
          <label>
            <FaBox className="label-icon" /> Lost Items
          </label>
          <button
            type="button"
            onClick={handleAddLostItemRow}
            className="btn btn-secondary btn-add-item"
          >
            <FaPlus /> Add Lost Item
          </button>
        </div>
        {lostItemRows.length > 0 && (
          <div className="lost-items-rows">
            <div className="lost-item-header-row">
              <span className="lost-item-label">Name</span>
              <span className="lost-item-label">Qty</span>
              <span className="lost-item-label">Price (LKR)</span>
              <span className="lost-item-label"></span>
            </div>
            {lostItemRows.map((row) => (
              <div key={row.id} className="lost-item-input-row">
                {row.isOther ? (
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => handleUpdateLostItemRow(row.id, 'name', e.target.value)}
                    placeholder="Enter item name"
                    className="lost-item-name-input"
                  />
                ) : (
                  <select
                    value={row.name}
                    onChange={(e) => handleUpdateLostItemRow(row.id, 'name', e.target.value)}
                    className="lost-item-name-input"
                  >
                    <option value="">Select item</option>
                    {LOST_ITEM_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  type="number"
                  value={row.quantity}
                  onChange={(e) => handleUpdateLostItemRow(row.id, 'quantity', parseInt(e.target.value) || 1)}
                  min="1"
                  placeholder="Qty"
                  className="lost-item-qty-input"
                />
                <input
                  type="number"
                  value={row.price}
                  onChange={(e) => handleUpdateLostItemRow(row.id, 'price', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  placeholder="Price (LKR)"
                  className="lost-item-price-input"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveLostItemRow(row.id)}
                  className="btn btn-sm btn-delete"
                  title="Remove row"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? (
            <>Saving...</>
          ) : person ? (
            <>
              <FaEdit /> Update
            </>
          ) : (
            <>
              <FaSave /> Submit
            </>
          )}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            <FaTimes /> Cancel
          </button>
        )}
      </div>
    </form>
  );
}

