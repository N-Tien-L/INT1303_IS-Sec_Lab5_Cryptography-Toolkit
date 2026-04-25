import type { ReactNode } from 'react';
import { Tabs } from './Tabs';
import { Shield, Key, Hash } from 'lucide-react';

interface MainLayoutProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  activeAlgorithm: string;
  children: ReactNode;
}

const sections = [
  { id: 'symmetric', label: 'Symmetric', icon: <Key size={18} /> },
  { id: 'asymmetric', label: 'Asymmetric', icon: <Shield size={18} /> },
  { id: 'hash', label: 'Hash', icon: <Hash size={18} /> },
];

export function MainLayout({
  activeSection,
  onSectionChange,
  activeAlgorithm,
  children,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Cryptography Toolkit</h1>
            <p className="mt-1 text-sm text-gray-500">
              Secure encryption and hashing tools
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs
          tabs={sections}
          activeTab={activeSection}
          onTabChange={onSectionChange}
        />
        
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
            <span>Active:</span>
            <span className="font-medium text-gray-900">{activeAlgorithm}</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}