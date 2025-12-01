'use client';

import { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown, FaTimes, FaHome, FaUser, FaCalendarAlt, FaUsers, FaMapMarkerAlt, FaInbox, FaBox, FaCheckCircle, FaTimesCircle, FaIdCard, FaEye, FaWindowClose, FaShieldAlt, FaExclamationTriangle, FaExclamationCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { gnList, getDivisionalSecretariats, getGNNamesBySecretariat } from '@/lib/locations';
import SearchableSelect from './SearchableSelect';

interface LostItem {
  name: string;
  quantity: number;
  price?: number;
}

interface FamilyMember {
  name: string;
  age: number;
  status: 'Safe' | 'Not Safe';
  nic?: string;
}

interface Person {
  id: number;
  name: string;
  age: number;
  nic?: string;
  number_of_members: number;
  address: string;
  house_state: string;
  location?: string;
  lost_items?: LostItem[] | string | null;
  family_members?: FamilyMember[] | string | null;
  created_at: string;
  updated_at: string;
}

interface AdminPersonListProps {
  people: Person[];
  onRefresh: () => void;
}

type SortField = 'name' | 'age' | 'house_state' | 'created_at';
type SortDirection = 'asc' | 'desc';

export default function AdminPersonList({ people, onRefresh }: AdminPersonListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [divisionalSecretariatFilter, setDivisionalSecretariatFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const filteredAndSortedPeople = useMemo(() => {
    let filtered = [...people];

    // Apply search filter
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter(
            (person) =>
              person.name.toLowerCase().includes(term) ||
              person.address.toLowerCase().includes(term) ||
              person.house_state.toLowerCase().includes(term) ||
              (person.location && person.location.toLowerCase().includes(term)) ||
              (person.nic && person.nic.toLowerCase().includes(term))
          );
        }

    // Apply divisional secretariat filter
    if (divisionalSecretariatFilter !== 'all') {
      const gnNamesInSecretariat = getGNNamesBySecretariat(divisionalSecretariatFilter);
      filtered = filtered.filter(
        (person) => person.location && gnNamesInSecretariat.includes(person.location)
      );
    }
    
    // Apply location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(
        (person) => person.location && person.location.toLowerCase() === locationFilter.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'name') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      } else if (sortField === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [people, searchTerm, locationFilter, divisionalSecretariatFilter, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedPeople.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPeople = filteredAndSortedPeople.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, locationFilter, divisionalSecretariatFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };


  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <FaSort className="sort-icon" />;
    }
    return sortDirection === 'asc' ? <FaSortUp className="sort-icon" /> : <FaSortDown className="sort-icon" />;
  };

  const getHouseStateClass = (houseState: string): string => {
    if (!houseState) return 'state-default';
    const state = houseState.toLowerCase().trim();
    if (state === 'safe') return 'state-safe';
    if (state === 'partially damaged') return 'state-partially-damaged';
    if (state === 'severely damaged') return 'state-severely-damaged';
    if (state === 'destroyed') return 'state-destroyed';
    return 'state-default';
  };

  const getHouseStateIcon = (houseState: string) => {
    if (!houseState) return null;
    const state = houseState.toLowerCase().trim();
    if (state === 'safe') return <FaShieldAlt />;
    if (state === 'partially damaged') return <FaExclamationTriangle />;
    if (state === 'severely damaged') return <FaExclamationCircle />;
    if (state === 'destroyed') return <FaTimesCircle />;
    return null;
  };

  const getDivisionalSecretariatFromLocation = (location: string): string => {
    if (!location) return '';
    const item = gnList.find(item => item.gnName === location);
    return item ? item.divisionalSecretariat : '';
  };

  const divisionalSecretariats = getDivisionalSecretariats();
  const allGNDivisions = gnList.map(item => item.gnName);
  const locations = ['all', ...allGNDivisions];

  return (
    <div className="admin-list">
      <div className="list-header">
        <h2>Registered People ({filteredAndSortedPeople.length} of {people.length})</h2>
        {totalPages > 1 && (
          <div className="pagination-info">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedPeople.length)} of {filteredAndSortedPeople.length}
          </div>
        )}
      </div>

      <div className="filters-section">
        <div className="filter-row filter-row-full">
          <div className="filter-group search-group">
            <label htmlFor="search">
              <FaSearch className="label-icon" /> Search
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, NIC, address, house state, or Grama Niladari Division..."
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="divisionalSecretariatFilter">
              <FaFilter className="label-icon" /> Divisional Secretariat
            </label>
            <SearchableSelect
              id="divisionalSecretariatFilter"
              value={divisionalSecretariatFilter}
              onChange={(value) => {
                setDivisionalSecretariatFilter(value);
                // Clear location filter when divisional secretariat changes
                setLocationFilter('all');
              }}
              options={['all', ...divisionalSecretariats]}
              placeholder="All Secretariats"
              getDisplayValue={(val) => val === 'all' ? 'All Secretariats' : val}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="locationFilter">
              <FaFilter className="label-icon" /> Grama Niladari Division
            </label>
            <SearchableSelect
              id="locationFilter"
              value={locationFilter}
              onChange={(value) => setLocationFilter(value)}
              options={[
                'all',
                ...(divisionalSecretariatFilter === 'all' 
                  ? allGNDivisions 
                  : getGNNamesBySecretariat(divisionalSecretariatFilter)
                )
              ]}
              placeholder={divisionalSecretariatFilter === 'all' ? 'All Divisions' : 'All Divisions in Selected Secretariat'}
              getDisplayValue={(val) => {
                if (val === 'all') {
                  return divisionalSecretariatFilter === 'all' ? 'All Divisions' : 'All Divisions in Selected Secretariat';
                }
                return val;
              }}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="sortField">
              <FaSort className="label-icon" /> Sort By
            </label>
            <SearchableSelect
              id="sortField"
              value={sortField}
              onChange={(value) => setSortField(value as SortField)}
              options={['created_at', 'name', 'age', 'house_state']}
              placeholder="Sort By"
              hideSearch={true}
              getDisplayValue={(val) => {
                const labels: Record<string, string> = {
                  'created_at': 'Date Added',
                  'name': 'Name',
                  'age': 'Age',
                  'house_state': 'House State'
                };
                return labels[val] || val;
              }}
            />
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setDivisionalSecretariatFilter('all');
              setLocationFilter('all');
              setSortField('created_at');
              setSortDirection('desc');
              setCurrentPage(1);
            }}
            className="btn btn-secondary"
          >
            <FaTimes /> Clear Filters
          </button>
        </div>
      </div>

      {filteredAndSortedPeople.length === 0 ? (
        <div className="empty-state">
          <FaInbox size={48} className="empty-icon" />
          <p>No records found matching your filters.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable">
                  <FaUser className="th-icon" /> Name {getSortIcon('name')}
                </th>
                <th onClick={() => handleSort('age')} className="sortable">
                  <FaCalendarAlt className="th-icon" /> Age {getSortIcon('age')}
                </th>
                <th>
                  <FaIdCard className="th-icon" /> NIC
                </th>
                <th onClick={() => handleSort('house_state')} className="sortable">
                  <FaHome className="th-icon" /> House State {getSortIcon('house_state')}
                </th>
                <th onClick={() => handleSort('created_at')} className="sortable">
                  Date Added {getSortIcon('created_at')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPeople.map((person) => {
                // Parse lost_items if it's a string
                let lostItems: LostItem[] = [];
                if (person.lost_items) {
                  try {
                    lostItems = typeof person.lost_items === 'string' 
                      ? JSON.parse(person.lost_items) 
                      : person.lost_items;
                  } catch (e) {
                    lostItems = [];
                  }
                }
                
                // Parse family_members if it's a string
                let familyMembers: FamilyMember[] = [];
                if (person.family_members) {
                  try {
                    familyMembers = typeof person.family_members === 'string' 
                      ? JSON.parse(person.family_members) 
                      : person.family_members;
                  } catch (e) {
                    familyMembers = [];
                  }
                }
                
                return (
                  <tr key={person.id}>
                    <td>{person.name}</td>
                    <td>{person.age}</td>
                    <td>{person.nic || '-'}</td>
                    <td>
                      <span className={`state-badge ${getHouseStateClass(person.house_state)}`}>
                        {getHouseStateIcon(person.house_state)}
                        {person.house_state || '-'}
                      </span>
                    </td>
                    <td>{new Date(person.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => setSelectedPerson(person)}
                        className="btn btn-primary btn-sm"
                      >
                        <FaEye /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <FaChevronLeft /> Previous
          </button>
          
          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 2 && page <= currentPage + 2)
              ) {
                return (
                  <button
                    key={page}
                    className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === currentPage - 3 ||
                page === currentPage + 3
              ) {
                return <span key={page} className="pagination-ellipsis">...</span>;
              }
              return null;
            })}
          </div>

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next <FaChevronRight />
          </button>
        </div>
      )}

      {/* View Details Modal */}
      {selectedPerson && (
        <div className="modal-overlay" onClick={() => setSelectedPerson(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Person Details</h2>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedPerson(null)}
                aria-label="Close"
              >
                <FaWindowClose />
              </button>
            </div>
            <div className="modal-body">
              {(() => {
                // Parse lost_items if it's a string
                let lostItems: LostItem[] = [];
                if (selectedPerson.lost_items) {
                  try {
                    lostItems = typeof selectedPerson.lost_items === 'string' 
                      ? JSON.parse(selectedPerson.lost_items) 
                      : selectedPerson.lost_items;
                  } catch (e) {
                    lostItems = [];
                  }
                }
                
                // Parse family_members if it's a string
                let familyMembers: FamilyMember[] = [];
                if (selectedPerson.family_members) {
                  try {
                    familyMembers = typeof selectedPerson.family_members === 'string' 
                      ? JSON.parse(selectedPerson.family_members) 
                      : selectedPerson.family_members;
                  } catch (e) {
                    familyMembers = [];
                  }
                }

                return (
                  <div className="person-details">
                    <div className="detail-section">
                      <h3><FaUser /> Basic Information</h3>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>Name:</label>
                          <span>{selectedPerson.name}</span>
                        </div>
                        <div className="detail-item">
                          <label>Age:</label>
                          <span>{selectedPerson.age}</span>
                        </div>
                        <div className="detail-item">
                          <label>NIC:</label>
                          <span>{selectedPerson.nic || '-'}</span>
                        </div>
                        <div className="detail-item">
                          <label>Number of Members:</label>
                          <span>{selectedPerson.number_of_members}</span>
                        </div>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h3><FaMapMarkerAlt /> Location Information</h3>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>Address:</label>
                          <span>{selectedPerson.address}</span>
                        </div>
                        <div className="detail-item">
                          <label>House State:</label>
                          <span className={`state-badge ${getHouseStateClass(selectedPerson.house_state)}`}>
                            {getHouseStateIcon(selectedPerson.house_state)}
                            {selectedPerson.house_state || '-'}
                          </span>
                        </div>
                        <div className="detail-item">
                          <label>Divisional Secretariat:</label>
                          <span>{getDivisionalSecretariatFromLocation(selectedPerson.location || '') || '-'}</span>
                        </div>
                        <div className="detail-item">
                          <label>Grama Niladari Division:</label>
                          <span>{selectedPerson.location || '-'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h3><FaUsers /> Family Members</h3>
                      {familyMembers && familyMembers.length > 0 ? (
                        <div className="family-members-display">
                          {familyMembers.map((member, idx) => (
                            <div key={idx} className="family-member-badge">
                              <div className="family-member-info">
                                <span className="family-member-name">{member.name}</span>
                                <span className="family-member-age">Age: {member.age}</span>
                              </div>
                              <div className="family-member-meta">
                                <span className={`family-member-status ${member.status === 'Safe' ? 'status-safe' : 'status-not-safe'}`}>
                                  {member.status === 'Safe' ? <FaCheckCircle /> : <FaTimesCircle />}
                                  {member.status}
                                </span>
                                {member.nic && (
                                  <span className="family-member-nic">
                                    <FaIdCard /> {member.nic}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-data">No family members registered</p>
                      )}
                    </div>

                    <div className="detail-section">
                      <h3><FaBox /> Damaged and Lost Items</h3>
                      {lostItems && lostItems.length > 0 ? (
                        <div className="lost-items-display">
                          {lostItems.map((item, idx) => (
                            <div key={idx} className="lost-item-badge">
                              <span className="lost-item-name">{item.name}</span>
                              <div className="lost-item-meta">
                                <span className="lost-item-qty-badge">x{item.quantity}</span>
                                {item.price && item.price > 0 && (
                                  <span className="lost-item-price-badge">LKR {item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-data">No lost items registered</p>
                      )}
                    </div>

                    <div className="detail-section">
                      <h3><FaCalendarAlt /> Timestamps</h3>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>Date Added:</label>
                          <span>{new Date(selectedPerson.created_at).toLocaleString()}</span>
                        </div>
                        {selectedPerson.updated_at && (
                          <div className="detail-item">
                            <label>Last Updated:</label>
                            <span>{new Date(selectedPerson.updated_at).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedPerson(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

