import React from 'react';
import { Award, Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';

const SkillsForm = ({ skills, onChange }) => {
  const addSkill = () => {
    const newSkill = {
      id: Date.now().toString(),
      name: '',
      level: 'Intermediate',
      category: 'Technical'
    };
    onChange([...skills, newSkill]);
  };

  const updateSkill = (id, field, value) => {
    onChange(
      skills.map(skill =>
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    );
  };

  const removeSkill = (id) => {
    onChange(skills.filter(skill => skill.id !== id));
  };

  // Move skill up/down
  const moveSkill = (index, direction) => {
    const newArray = [...skills];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newArray.length) {
      [newArray[index], newArray[targetIndex]] = [newArray[targetIndex], newArray[index]];
      onChange(newArray);
    }
  };

  // Drag and drop handlers
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
      const newArray = [...skills];
      const draggedItem = newArray[dragIndex];
      newArray.splice(dragIndex, 1);
      newArray.splice(dropIndex, 0, draggedItem);
      onChange(newArray);
    }
  };

  const skillsByCategory = {
    Technical: skills.filter(skill => skill.category === 'Technical'),
    'Soft Skills': skills.filter(skill => skill.category === 'Soft Skills'),
    Language: skills.filter(skill => skill.category === 'Language')
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Award className="w-5 h-5 mr-2 text-blue-600" />
          Skills
        </h3>
        <button
          onClick={addSkill}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Skill
        </button>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No skills added yet. Click "Add Skill" to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            💡 <strong>Tip:</strong> Drag and drop skills to reorder them, or use the arrow buttons. 
            Order them by importance or proficiency level.
          </div>
          
          {skills.map((skill, index) => (
            <div 
              key={skill.id} 
              className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200 relative group"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              {/* Drag Handle and Controls */}
              <div className="flex flex-col items-center space-y-1">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" title="Drag to reorder" />
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => moveSkill(index, 'up')}
                    disabled={index === 0}
                    className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-100'}`}
                    title="Move up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveSkill(index, 'down')}
                    disabled={index === skills.length - 1}
                    className={`p-1 rounded ${index === skills.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-100'}`}
                    title="Move down"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  value={skill.name || ''}
                  onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter skill name (e.g., JavaScript, Communication, English)"
                />
              </div>
              <div className="w-32">
                <select
                  value={skill.level || 'Intermediate'}
                  onChange={(e) => updateSkill(skill.id, 'level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <div className="w-32">
                <select
                  value={skill.category || 'Technical'}
                  onChange={(e) => updateSkill(skill.id, 'category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Technical">Technical</option>
                  <option value="Soft Skills">Soft Skills</option>
                  <option value="Language">Language</option>
                </select>
              </div>
              <button
                onClick={() => removeSkill(skill.id)}
                className="text-red-500 hover:text-red-700 transition-colors p-1"
                title="Remove skill"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Skills by Category Display */}
      {skills.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-3">Skills Preview by Category:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <div key={category}>
                <h5 className="font-semibold text-gray-700 mb-2">{category}</h5>
                {categorySkills.length > 0 ? (
                  <ul className="space-y-1">
                    {categorySkills.map((skill) => (
                      <li key={skill.id} className="text-sm text-gray-600">
                        {skill.name} - {skill.level}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic">No skills in this category</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsForm;