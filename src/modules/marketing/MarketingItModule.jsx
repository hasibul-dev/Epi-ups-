import React from 'react';
import { MarketingProvider } from './context/MarketingContext.jsx';
import DigitalMarketingModule from '../digital-marketing/DigitalMarketingModule.jsx';

export default function MarketingItModule() {
  return (
    <MarketingProvider>
      <main className="marketing-page-content w-full">
        <DigitalMarketingModule />
      </main>
    </MarketingProvider>
  );
}
