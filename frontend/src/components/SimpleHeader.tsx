'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import './SimpleHeader.css';

const SimpleHeader: React.FC = () => {
  return (
    <header className="simple-header">
      <div className="simple-header-container">
        <Link href="/" className="simple-header-logo-link">
          <Image
            src="/images/logo.png"
            alt="PAUL"
            width={95}
            height={44}
            className="simple-header-logo"
            priority
          />
        </Link>
      </div>
    </header>
  );
};

export default SimpleHeader;
