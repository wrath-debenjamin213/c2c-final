import { describe, it, expect } from 'vitest';
import { generateRoadmap } from './mockDataEngine';

describe('mockDataEngine', () => {

    it('generates a roadmap with the exact idea Name', () => {
        const formData = {
            idea: 'Space Tourism App',
            category: 'App / Software Development',
            timeline: '12',
            teamSize: 'Medium',
            scope: 'High'
        };

        const roadmap = generateRoadmap(formData);

        expect(roadmap.ideaName).toBe('Space Tourism App');
        expect(roadmap.category).toBe('App / Software Development');
        expect(roadmap.totalWeeks).toBe(12);
    });

    it('dynamically distributes timeline across multiple phases', () => {
        const formData = {
            idea: 'Viral TikTok Series',
            category: 'Content Creation (YouTube / Blog / Instagram)',
            timeline: '10' // 10 weeks
        };

        // Content Creation has 5 phases in mockDataEngine.
        const roadmap = generateRoadmap(formData);

        let distributedWeeks = 0;
        roadmap.milestones.forEach((m) => {
            if (m && m.duration) {
                const match = m.duration.match(/(\d+)/);
                if (match) {
                    distributedWeeks += parseInt(match[0], 10);
                }
            }
        });

        expect(roadmap.milestones.length).toBe(6);
        expect(distributedWeeks).toBeGreaterThan(0);
        expect(distributedWeeks).toBeLessThanOrEqual(24);
    });

    it('injects contextual specific strings into task outputs', () => {
        const formData = {
            idea: 'AI Customer Support Agent',
            category: 'Startup/Business',
            timeline: '8',
        };

        const roadmap = generateRoadmap(formData);
        const firstMilestone = roadmap.milestones[0];
        const firstTask = firstMilestone.tasks[0];

        // We expect "AI Customer Support Agent" to be injected into some of the descriptive task outputs
        const hasContext =
            firstTask.title.includes('AI Customer Support Agent') ||
            firstTask.details.whatThisMeans.includes('AI Customer Support Agent') ||
            firstTask.details.whyItMatters.some(r => r.includes('AI Customer Support Agent'));

        expect(hasContext).toBe(true);
    });

});
