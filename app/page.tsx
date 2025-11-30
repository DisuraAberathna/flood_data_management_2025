'use client';

import { useState } from 'react';
import PersonForm from '@/components/PersonForm';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { FaUserShield, FaWater } from 'react-icons/fa';

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

export default function Home() {
  const handleSubmit = async (personData: Omit<Person, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personData),
      });

      if (response.ok) {
        // Success toast is handled in PersonForm component
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to register person');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  return (
    <div className="container container-home">
      <header className="header">
        <div className="header-icon">
          <FaWater size={32} />
        </div>
        <h1>FloodCare</h1>
        <p className="subtitle">Register isolated people from floods</p>
        <div className="admin-link">
          <Link href="/admin/login" className="admin-link-btn">
            <FaUserShield /> Admin Login
          </Link>
        </div>
      </header>

      <main className="main-content">
        <section className="form-section">
          <h2>Register Person</h2>
          <PersonForm onSubmit={handleSubmit} />
        </section>
      </main>
    </div>
  );
}

