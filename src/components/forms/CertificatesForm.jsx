import React from 'react';
import { AlignCenterVertical as Certificate, Plus, Trash2, Calendar, GripVertical, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';

const CertificatesForm = ({ certificates, onChange }) => {
  const addCertificate = () => {
    const newCertificate = {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      url: ''
    };
    onChange([...certificates, newCertificate]);
  };

  const updateCertificate = (id, field, value) => {
    onChange(
      certificates.map(cert =>
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    );
  };

  const removeCertificate = (id) => {
    onChange(certificates.filter(cert => cert.id !== id));
  };

  const moveCertificate = (index, direction) => {
    const newArray = [...certificates];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newArray.length) {
      [newArray[index], newArray[targetIndex]] = [newArray[targetIndex], newArray[index]];
      onChange(newArray);
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex !== dropIndex) {
      const newArray = [...certificates];
      const draggedItem = newArray[dragIndex];
      newArray.splice(dragIndex, 1);
      newArray.splice(dropIndex, 0, draggedItem);
      onChange(newArray);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Certificate className="w-5 h-5 mr-2 text-blue-600" />
          Certificates & Certifications
        </h3>
        <button
          onClick={addCertificate}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Certificate
        </button>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Certificate className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No certificates added yet. Click "Add Certificate" to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            💡 <strong>Tip:</strong> List your most recent and relevant certifications first.
          </div>
          
          {certificates.map((cert, index) => (
            <div 
              key={cert.id} 
              className="p-6 border border-gray-200 rounded-lg bg-gray-50 relative group"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              {/* Drag Handle and Controls */}
              <div className="absolute left-2 top-6 flex flex-col items-center space-y-1">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" title="Drag to reorder" />
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => moveCertificate(index, 'up')}
                    disabled={index === 0}
                    className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-100'}`}
                    title="Move up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveCertificate(index, 'down')}
                    disabled={index === certificates.length - 1}
                    className={`p-1 rounded ${index === certificates.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-100'}`}
                    title="Move down"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="ml-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-md font-medium text-gray-800">Certificate #{index + 1}</h4>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Position {index + 1}
                    </span>
                  </div>
                  <button
                    onClick={() => removeCertificate(cert.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Certificate Name *
                    </label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => updateCertificate(cert.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="AWS Certified Solutions Architect"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issuing Organization *
                    </label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => updateCertificate(cert.id, 'issuer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Amazon Web Services"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Issue Date *
                    </label>
                    <input
                      type="month"
                      value={cert.issueDate}
                      onChange={(e) => updateCertificate(cert.id, 'issueDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="month"
                      value={cert.expiryDate}
                      onChange={(e) => updateCertificate(cert.id, 'expiryDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty if it doesn't expire</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Credential ID
                    </label>
                    <input
                      type="text"
                      value={cert.credentialId}
                      onChange={(e) => updateCertificate(cert.id, 'credentialId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ABC123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <ExternalLink className="w-4 h-4 inline mr-1" />
                      Certificate URL
                    </label>
                    <input
                      type="url"
                      value={cert.url}
                      onChange={(e) => updateCertificate(cert.id, 'url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://verify.certificate.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificatesForm;