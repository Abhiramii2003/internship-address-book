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
    <div className="tag-selector">
      <div className="contact-tags" style={{ marginBottom: '1.25rem' }}>
        {availableTags.map(tag => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <span 
              key={tag.id} 
              className={`tag selectable ${isSelected ? 'selected' : ''}`}
              onClick={() => handleToggleTag(tag.id)}
            >
              {tag.name} {isSelected && (
                <svg style={{display: 'inline', marginLeft: '0.25rem', verticalAlign: 'text-bottom'}} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </span>
          );
        })}
        {availableTags.length === 0 && <span style={{fontSize: '0.875rem', color: 'var(--color-text-muted)'}}>No tags available. Create one below.</span>}
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
          {loading ? (
            <>
              <div className="spinner" style={{width: '12px', height: '12px', borderWidth: '2px', marginRight: '4px'}}></div>
              Adding...
            </>
          ) : 'Add Tag'}
        </button>
      </div>
      {error && <div className="form-error" style={{marginTop: '0.5rem'}}>{error}</div>}
    </div>
  );
};

export default TagSelector;
