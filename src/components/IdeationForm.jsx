import React, { useState } from 'react';
import { Rocket, Clock, Users, Target, Folder, DollarSign } from 'lucide-react';

const categoryTimelines = {
    'App / Software Development': 4,
    'Startup / Business Idea': 8,
    'Content Creation (YouTube / Blog / Instagram)': 4,
    'Hackathon / College Project': 4,
    'Personal Goal': 4
};

const IdeationForm = ({ onSubmit, isGenerating }) => {
    const [formData, setFormData] = useState({
        idea: '',
        category: 'App / Software Development',
        timeline: '4',
        teamSize: 1,
        scope: 'Medium',
        budget: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'category') {
            setFormData({
                ...formData,
                category: value,
                timeline: categoryTimelines[value] ? categoryTimelines[value].toString() : '4',
                // Reset budget if changing away from Startup
                budget: value !== 'Startup / Business Idea' ? '' : formData.budget
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (isGenerating) {
        return (
            <div className="glass-panel flex-col items-center justify-center fade-in" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center', minHeight: '400px' }}>
                <div className="animate-float" style={{ marginBottom: '2rem' }}>
                    <div className="animate-glow" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                        <Rocket size={40} color="white" />
                    </div>
                </div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Building your execution plan...</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto' }}>
                    Our AI is currently acting as your Chief Technical Officer. We are analyzing your resources, estimating timelines, and generating concrete technical milestones.
                </p>
                <div style={{ marginTop: '2.5rem', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <div className="loading-dot" style={{ animationDelay: '0s' }}></div>
                    <div className="loading-dot" style={{ animationDelay: '0.2s' }}></div>
                    <div className="loading-dot" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div className="flex items-center gap-4" style={{ marginBottom: '2rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--accent-gradient)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Rocket size={24} color="white" />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Transform your idea</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Input the details below to generate a structured execution roadmap.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-col gap-6">
                <div>
                    <label className="input-label" htmlFor="idea">What is your executable idea?</label>
                    <textarea
                        id="idea"
                        name="idea"
                        className="input-base"
                        rows="4"
                        placeholder="e.g. Build a mobile app for tracking daily water intake..."
                        value={formData.idea}
                        onChange={handleChange}
                        required
                        style={{ resize: 'vertical' }}
                    ></textarea>
                </div>

                <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <label className="input-label flex items-center gap-2" htmlFor="category">
                            <Folder size={16} /> Idea Category
                        </label>
                        <select
                            id="category"
                            name="category"
                            className="input-base"
                            value={formData.category}
                            onChange={handleChange}
                            style={{ appearance: 'none' }}
                            required
                        >
                            <option value="App / Software Development">App / Software Development</option>
                            <option value="Startup / Business Idea">Startup / Business Idea</option>
                            <option value="Content Creation (YouTube / Blog / Instagram)">Content Creation (YouTube / Blog / Instagram)</option>
                            <option value="Hackathon / College Project">Hackathon / College Project</option>
                            <option value="Personal Goal">Personal Goal</option>
                        </select>
                    </div>

                    <div style={{ flex: '1 1 200px' }}>
                        <label className="input-label flex items-center gap-2" htmlFor="timeline">
                            <Clock size={16} /> Estimated Timeline (Weeks)
                        </label>
                        <input
                            type="number"
                            id="timeline"
                            name="timeline"
                            className="input-base"
                            min="1"
                            max="52"
                            value={formData.timeline}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ flex: '1 1 200px' }}>
                        <label className="input-label flex items-center gap-2" htmlFor="teamSize">
                            <Users size={16} /> Team Size
                        </label>
                        <input
                            type="number"
                            id="teamSize"
                            name="teamSize"
                            className="input-base"
                            min="1"
                            max="20"
                            value={formData.teamSize}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ flex: '1 1 200px' }}>
                        <label className="input-label flex items-center gap-2" htmlFor="scope">
                            <Target size={16} /> Scope / Effort
                        </label>
                        <select
                            id="scope"
                            name="scope"
                            className="input-base"
                            value={formData.scope}
                            onChange={handleChange}
                            style={{ appearance: 'none' }}
                            required
                        >
                            <option value="Low">Low - MVP focus</option>
                            <option value="Medium">Medium - Standard product</option>
                            <option value="High">High - Comprehensive solution</option>
                        </select>
                    </div>

                    {formData.category === 'Startup / Business Idea' && (
                        <div style={{ flex: '1 1 200px' }}>
                            <label className="input-label flex items-center gap-2" htmlFor="budget">
                                <DollarSign size={16} /> Operating Budget ($)
                            </label>
                            <input
                                type="number"
                                id="budget"
                                name="budget"
                                className="input-base"
                                min="0"
                                placeholder="e.g. 5000"
                                value={formData.budget}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center" style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--panel-border)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        Our AI will parse this into a milestone-based roadmap.
                    </p>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem', opacity: isGenerating ? 0.7 : 1, cursor: isGenerating ? 'not-allowed' : 'pointer' }} disabled={isGenerating}>
                        {isGenerating ? 'Generating AI Roadmap...' : 'Generate Roadmap'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default IdeationForm;
