import { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { AESForm } from './components/forms/AESForm';
import { DESForm } from './components/forms/DESForm';
import { TripleDESForm } from './components/forms/TripleDESForm';
import { RSAForm } from './components/forms/RSAForm';
import { HashForm } from './components/forms/HashForm';

type Algorithm = 'AES' | 'DES' | '3DES' | 'RSA' | 'MD5' | 'SHA-256';

interface Section {
  id: string;
  algorithms: { id: Algorithm; label: string }[];
}

const sections: Section[] = [
  { id: 'symmetric', algorithms: [{ id: 'AES', label: 'AES' }, { id: 'DES', label: 'DES' }, { id: '3DES', label: '3DES' }] },
  { id: 'asymmetric', algorithms: [{ id: 'RSA', label: 'RSA' }] },
  { id: 'hash', algorithms: [{ id: 'MD5', label: 'MD5' }, { id: 'SHA-256', label: 'SHA-256' }] },
];

function App() {
  const [activeSection, setActiveSection] = useState('symmetric');
  const [activeAlgorithm, setActiveAlgorithm] = useState<Algorithm>('AES');

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    const section = sections.find((s) => s.id === sectionId);
    if (section && section.algorithms.length > 0) {
      setActiveAlgorithm(section.algorithms[0].id);
    }
  };

  const renderAlgorithm = () => {
    switch (activeAlgorithm) {
      case 'AES':
        return <AESForm />;
      case 'DES':
        return <DESForm />;
      case '3DES':
        return <TripleDESForm />;
      case 'RSA':
        return <RSAForm />;
      case 'MD5':
      case 'SHA-256':
        return <HashForm
            algorithm={activeAlgorithm}
          />;
      default:
        return <AESForm />;
    }
  };

  const currentSection = sections.find((s) => s.id === activeSection);

  return (
    <MainLayout
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
      activeAlgorithm={activeAlgorithm}
    >
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {currentSection?.algorithms.map((algo) => (
            <button
              key={algo.id}
              onClick={() => setActiveAlgorithm(algo.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeAlgorithm === algo.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {algo.label}
            </button>
          ))}
        </div>
      </div>
      {renderAlgorithm()}
    </MainLayout>
  );
}

export default App;