import React from 'react';
import { Link } from 'react-router-dom';
import CVListPage from './CVListPage';

const CV = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">CV Management</h1>
        <Link
          to="/editor"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create New CV
        </Link>
      </div>
      <CVListPage />
    </div>
  );
};

export default CV;
