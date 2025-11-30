'use client';

import { FaCopyright, FaCode } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-item">
          <FaCopyright className="footer-icon" />
          <span>{currentYear} FloodCare. All rights reserved.</span>
        </div>
        <div className="footer-item">
          <FaCode className="footer-icon" />
          <span>Developed by <strong>Thenuwari Savindya</strong></span>
        </div>
      </div>
    </footer>
  );
}

