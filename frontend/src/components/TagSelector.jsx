import React, { useState, useEffect } from 'react';
import { tagService } from '../services/api';

const TagSelector = ({ selectedTagIds, onChange }) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await tagService.getTags();
      setAvailableTags(response.data);
    } catch (err) {
      console.error('Error fetching tags', err);
    }
  };

  const handleToggleTag = (tagId) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await tagService.createTag(newTagName.trim());
      const newTag = response.data;
      setAvailableTags([...availableTags, newTag]);
      onChange([...selectedTagIds, newTag.id]);
      setNewTagName('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create tag');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tag-selector mt-1">
      <label className="form-label">Tags</label>
      <div className="contact-tags" style={{ marginBottom: '1rem' }}>
        {availableTags.map(tag => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <span 
              key={tag.id} 
              className="tag"
              style={{ 
                cursor: 'pointer', 
                backgroundColor: isSelected ? '#0288d1' : '#e1f5fe',
                color: isSelected ? '#ffffff' : '#0288d1',
                border: '1px solid #0288d1'
              }}
              onClick={() => handleToggleTag(tag.id)}
            >
              {tag.name} {isSelected && '✓'}
            </span>
          );
        })}
        {availableTags.length === 0 && <span className="contact-detail">No tags available. Create one below.</span>}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="New tag name" 
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          style={{ maxWidth: '200px' }}
        />
        <button 
          className="btn btn-secondary" 
          onClick={handleCreateTag}
          disabled={loading || !newTagName.trim()}
          type="button"
        >
          {loading ? 'Creating...' : 'Add Tag'}
        </button>
      </div>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
};

export default TagSelector;
