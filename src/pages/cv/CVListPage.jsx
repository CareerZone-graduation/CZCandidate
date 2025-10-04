import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCvs, deleteCv } from '../../services/api';

const CVListPage = () => {
  const [cvs, setCvs] = useState([]);

  useEffect(() => {
    const fetchCvs = async () => {
      try {
        const cvsFromApi = await getCvs();
        setCvs(cvsFromApi);
      } catch (error) {
        console.error("Failed to fetch CVs", error);
      }
    };
    fetchCvs();
  }, []);

  const handleDelete = async (cvId) => {
    try {
      await deleteCv(cvId);
      setCvs(cvs.filter(cv => cv._id !== cvId));
    } catch (error) {
      console.error("Failed to delete CV", error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Created CVs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cvs.map((cv) => (
          <div key={cv._id} className="p-4 border rounded-lg shadow-sm">
            <h3 className="font-bold">{cv.title || 'Untitled CV'}</h3>
            <div className="mt-4">
              <Link to={`/editor/${cv._id}`} className="text-blue-500 hover:underline mr-4">Edit</Link>
              <Link to={`/render/${cv._id}`} className="text-green-500 hover:underline mr-4">View</Link>
              <button onClick={() => handleDelete(cv._id)} className="text-red-500 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CVListPage;