'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import AdminPersonList from '@/components/AdminPersonList';
import { checkAuth, logout } from '@/lib/auth';
import { FaHome, FaSignOutAlt, FaChartBar, FaSpinner } from 'react-icons/fa';

interface Person {
  id: number;
  name: string;
  age: number;
  number_of_members: number;
  address: string;
  house_state: string;
  created_at: string;
  updated_at: string;
}

export default function AdminDashboard() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = async () => {
    const isAuth = await checkAuth();
    if (!isAuth) {
      router.push('/admin/login');
    } else {
      setAuthenticated(true);
      fetchPeople();
    }
    setCheckingAuth(false);
  };

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/people');
      if (response.ok) {
        const data = await response.json();
        setPeople(data);
      } else {
        console.error('Failed to fetch people');
      }
    } catch (error) {
      console.error('Error fetching people:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    router.push('/admin/login');
  };


  if (checkingAuth) {
    return (
      <div className="container container-dashboard">
        <div className="loading">
          <FaSpinner className="spinner-icon" /> Verifying authentication...
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="container container-dashboard">
      <header className="header">
        <div className="header-content">
          <div>
            <div className="header-icon">
              <FaChartBar size={32} />
            </div>
            <h1>Admin Dashboard</h1>
            <p className="subtitle">Manage flood data records</p>
            <p className="district-mention">Specially for Anuradhapura District People</p>
          </div>
          <div className="header-actions">
            <a href="/" className="btn btn-header-primary">
              <FaHome /> Home
            </a>
            <button onClick={handleLogout} className="btn btn-header-primary">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="list-section">
          {loading ? (
            <div className="loading">
              <FaSpinner className="spinner-icon" /> Loading...
            </div>
          ) : (
            <AdminPersonList
              people={people}
              onRefresh={fetchPeople}
            />
          )}
        </section>
      </main>
    </div>
  );
}

