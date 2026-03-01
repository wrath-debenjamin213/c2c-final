export const generateRoadmap = (formData) => {
    const { idea, timeline, category, budget, teamSize, creatorName } = formData;
    const lowerIdea = idea.toLowerCase();

    // Set initial team members to only the creator
    const membersArray = [creatorName || 'Builder'];

    // AI Text Generator Simulation
    const enrichTaskDetails = (task, ideaStr, budgetValue) => {
        const shortIdea = ideaStr.length > 35 ? ideaStr.substring(0, 35).trim() + '...' : ideaStr.trim();
        const lowerTitle = task.title.toLowerCase();

        let enrichedDetails = { ...task.details };

        // Inject personalization
        if (lowerTitle.includes('scope') || lowerTitle.includes('audience') || lowerTitle.includes('niche')) {
            enrichedDetails.whatThisMeans = `${enrichedDetails.whatThisMeans} Specifically tailored for "${shortIdea}".`;
            enrichedDetails.whyItMatters = [...enrichedDetails.whyItMatters, `Differentiates "${shortIdea}" from competitors`];
        } else if (lowerTitle.includes('design') || lowerTitle.includes('branding')) {
            enrichedDetails.whatYouNeedToDo = [...enrichedDetails.whatYouNeedToDo, `Gather mood boards relevant to "${shortIdea}"`];
            enrichedDetails.whyItMatters = [...enrichedDetails.whyItMatters, `A cohesive visual identity tailored to "${shortIdea}" dramatically improves user retention`];

            if (budgetValue) {
                enrichedDetails.whatYouNeedToDo = [...enrichedDetails.whatYouNeedToDo, `Allocate a portion of your $${budgetValue} budget to design assets.`];
            }
        } else if (lowerTitle.includes('repo') || lowerTitle.includes('scaffolding') || lowerTitle.includes('stack')) {
            enrichedDetails.whyItMatters = [...enrichedDetails.whyItMatters, `Technical debt is expensive. Building "${shortIdea}" right saves weeks later.`];
        } else if (lowerTitle.includes('deploy') || lowerTitle.includes('publish') || lowerTitle.includes('launch') || lowerTitle.includes('submission')) {
            enrichedDetails.whatYouNeedToDo = [...enrichedDetails.whatYouNeedToDo, `Verify all final details are optimized for "${shortIdea}"`];
            enrichedDetails.output = `${enrichedDetails.output} (Live result for "${shortIdea}")`;
        }

        return { ...task, details: enrichedDetails };
    };

    const totalWeeks = parseInt(timeline);
    let m1Weeks = Math.max(1, Math.floor(totalWeeks * 0.2));
    let m2Weeks = Math.max(1, Math.floor(totalWeeks * 0.5));
    let m3Weeks = totalWeeks - m1Weeks - m2Weeks;

    const createDetails = (what, whatEx, why, doList, out, outEx) => ({
        whatThisMeans: what, whatThisMeansExample: whatEx, whyItMatters: why, whatYouNeedToDo: doList, output: out, outputExample: outEx
    });

    let phases = [];

    switch (category) {
        case 'App / Software Development':
            phases = [
                {
                    title: 'Planning & Design',
                    tasks: [
                        { id: 't1', title: 'Define features & requirements', estimatedHours: 4, completed: false, cost: '$0', prereqs: 'None', details: createDetails('Outline the exact functionality needed.', ['User login', 'Data dashboard'], ['Prevents scope creep', 'Aligns the team'], ['Write PRD', 'List P0 features'], 'Requirements document.', 'A Notion page with 10 core user stories.') },
                        { id: 't2', title: 'Create UI/UX wireframes', estimatedHours: 6, completed: false, cost: '$0', prereqs: 't1', details: createDetails('Map out the visual journey of the user.', ['Figma mockups'], ['Improves user retention', 'Speeds up development'], ['Draw low-fi sketches'], 'Clickable prototype.', 'A Figma link.') }
                    ]
                },
                {
                    title: 'Technical Setup',
                    tasks: [
                        { id: 't3', title: 'Set up project structure / repo', estimatedHours: 2, completed: false, cost: '$0', prereqs: 't2', details: createDetails('Initialize the codebase.', ['React/Node.js setup'], ['A clean start prevents technical debt'], ['Run create app scripts', 'Setup ESLint'], 'A compiling blank app.', 'GitHub repo instantiated.') },
                        { id: 't4', title: 'Configure Database & Auth', estimatedHours: 4, completed: false, cost: '$0', prereqs: 't3', details: createDetails('Set up the data storage layer.', ['Firebase/Supabase'], ['Needed to store user accounts'], ['Configure OAuth', 'Set up tables'], 'Database schemas.', 'Users can sign up.') }
                    ]
                },
                {
                    title: 'Core Development',
                    tasks: [
                        { id: 't5', title: 'Develop frontend views', estimatedHours: 15, completed: false, cost: '$0', prereqs: 't4', details: createDetails('Build the user interface.', ['Dashboard page', 'Settings page'], ['This is what the user interacts with'], ['Write React components', 'Add styles'], 'A working UI.', 'Pages navigate correctly.') },
                        { id: 't6', title: 'Implement backend APIs', estimatedHours: 12, completed: false, cost: '$0', prereqs: 't4', details: createDetails('Connect logic to data.', ['REST/GraphQL endpoints'], ['Powers the UI features'], ['Write fetch logic', 'Handle state'], 'Working data flow.', 'App saves data to cloud.') }
                    ]
                },
                {
                    title: 'Testing & QA',
                    tasks: [
                        { id: 't7', title: 'Test all user flows', estimatedHours: 6, completed: false, cost: '$0', prereqs: 't6', details: createDetails('Ensure everything works as expected.', ['Integration tests', 'Manual QA'], ['Bad launches ruin reputation'], ['Click through all flows'], 'List of found issues.', 'A sprint board with bugs.') },
                        { id: 't8', title: 'Fix P0 bugs', estimatedHours: 8, completed: false, cost: '$0', prereqs: 't7', details: createDetails('Resolve blocker issues.', ['Crashing bugs'], ['Users abandon buggy apps'], ['Patch the tickets'], 'A stable application.', 'Zero P0 bugs remaining.') }
                    ]
                },
                {
                    title: 'Deployment',
                    tasks: [
                        { id: 't9', title: 'Deploy to production', estimatedHours: 4, completed: false, cost: '$20/mo', prereqs: 't8', details: createDetails('Push the app to the internet.', ['Vercel/AWS setup'], ['Allows users to access the app'], ['Configure DNS', 'Set environment variables'], 'Live URL.', 'https://my-app.com is accessible.') }
                    ]
                }
            ];
            break;

        case 'Startup / Business Idea':
            phases = [
                {
                    title: 'Problem & Market Definition',
                    tasks: [
                        { id: 't1', title: 'Define problem & target audience', estimatedHours: 4, completed: false, cost: '$0', prereqs: 'None', details: createDetails('Identify who has pain and what it is.', ['B2B Sales reps making cold calls'], ['Ensures you are solving a real issue'], ['Write problem statement', 'Define target persona'], 'A clear target persona.', 'Targeting dentists making >$1M/yr.') },
                        { id: 't2', title: 'Competitor analysis', estimatedHours: 6, completed: false, cost: '$0', prereqs: 't1', details: createDetails('Determine who else is solving this.', ['G2 Crowd reviews analysis'], ['Avoids building something already commoditized'], ['List 5 competitors', 'Identify weak points'], 'Competitor matrix.', 'A spreadsheet comparing features/pricing.') }
                    ]
                },
                {
                    title: 'Value Proposition',
                    tasks: [
                        { id: 't3', title: 'Create value proposition', estimatedHours: 3, completed: false, cost: '$0', prereqs: 't2', details: createDetails('Define why your solution is better.', ['"10x faster than X"'], ['Forms the basis of all marketing'], ['Draft 1-sentence pitch', 'Test with 5 users'], 'A refined pitch.', 'A landing page hero headline.') },
                        { id: 't4', title: 'Build Landing Page', estimatedHours: 8, completed: false, cost: '$0', prereqs: 't3', details: createDetails('Create a waitlist to test demand.', ['Carrd/Webflow site'], ['Cheapest way to validate'], ['Write copy', 'Add email form'], 'Live waitlist.', 'Collected 100 emails.') }
                    ]
                },
                {
                    title: 'MVP Scoping',
                    tasks: [
                        { id: 't5', title: 'Plan core MVP features', estimatedHours: 4, completed: false, cost: '$0', prereqs: 't4', details: createDetails('Decide what to build first.', ['Core value delivery mechanism only'], ['Saves money and time'], ['Cut non-essential features'], 'A lean feature list.', 'A list of 3 must-have features.') }
                    ]
                },
                {
                    title: 'MVP Construction',
                    tasks: [
                        { id: 't6', title: 'Build functional prototype', estimatedHours: 40, completed: false, cost: 'Varies', prereqs: 't5', details: createDetails('Construct the minimum viable product.', ['No-code Bubble app'], ['Gets something in users hands'], ['Execute development sprint'], 'Working prototype.', 'A functioning MVP app.') }
                    ]
                },
                {
                    title: 'Beta Testing',
                    tasks: [
                        { id: 't7', title: 'Get user feedback', estimatedHours: 10, completed: false, cost: '$0', prereqs: 't6', details: createDetails('Show the MVP to real people.', ['Zoom interviews'], ['Validates if the solution works'], ['Recruit 5 beta testers', 'Host feedback sessions'], 'Actionable insights.', 'A list of 3 major UI confusing points.') },
                        { id: 't8', title: 'Iterate based on feedback', estimatedHours: 15, completed: false, cost: '$0', prereqs: 't7', details: createDetails('Fix glaring issues before launch.', ['Changing confused UI elements'], ['Improves first impressions'], ['Push update patches'], 'Improved build.', 'Version 0.2 live.') }
                    ]
                },
                {
                    title: 'Launch & Promotion',
                    tasks: [
                        { id: 't9', title: 'Official Launch', estimatedHours: 8, completed: false, cost: '$0', prereqs: 't8', details: createDetails('Announce the product to the world.', ['Product Hunt launch'], ['Drives the first cohort of users'], ['Write launch emails', 'Post on social channels'], 'First 100 users.', 'Live on Product Hunt with 50 upvotes.') }
                    ]
                }
            ];
            break;

        case 'Content Creation (YouTube / Blog / Instagram)':
            phases = [
                {
                    title: 'Strategy & Research',
                    tasks: [
                        { id: 't1', title: 'Choose niche/topic', estimatedHours: 2, completed: false, cost: '$0', prereqs: 'None', details: createDetails('Select the focus of your content.', ['Tech reviews'], ['Builds a dedicated audience'], ['List passions', 'Check market size'], 'A defined niche.', '"SaaS tool reviews for founders"') },
                        { id: 't2', title: 'Keyword/Trend research', estimatedHours: 4, completed: false, cost: '$0', prereqs: 't1', details: createDetails('Find high-demand topics in the niche.', ['Keyword research'], ['Ensures people actually want to watch/read it'], ['Use VidIQ/Ahrefs', 'Look at competitors'], 'A list of 10 ideas.', 'Spreadsheet with 10 high-search-volume titles.') }
                    ]
                },
                {
                    title: 'Scripting & Planning',
                    tasks: [
                        { id: 't3', title: 'Create content calendar', estimatedHours: 2, completed: false, cost: '$0', prereqs: 't2', details: createDetails('Schedule when content goes out.', ['Notion calendar'], ['Ensures consistency'], ['Slot ideas into dates'], 'A 1-month schedule.', 'A calendar view showing 2 posts per week.') },
                        { id: 't4', title: 'Write script/outline', estimatedHours: 5, completed: false, cost: '$0', prereqs: 't3', details: createDetails('Structure the narrative.', ['Hook, Body, CTA'], ['Keeps viewers engaged'], ['Write bullet points'], 'A complete script.', '3-page Google Doc.') }
                    ]
                },
                {
                    title: 'Production',
                    tasks: [
                        { id: 't5', title: 'Record / Shoot content', estimatedHours: 8, completed: false, cost: '$0', prereqs: 't4', details: createDetails('Produce the raw material.', ['Shooting a-roll'], ['The core product'], ['Set up camera', 'Follow script'], 'Raw files/drafts.', 'Folders of raw footage.') }
                    ]
                },
                {
                    title: 'Post-Production',
                    tasks: [
                        { id: 't6', title: 'Edit content', estimatedHours: 10, completed: false, cost: '$0', prereqs: 't5', details: createDetails('Refine the raw material.', ['Cutting dead air', 'Adding graphics'], ['Keeps audience retained'], ['Cut footage on Premiere', 'Color grade'], 'Finalized assets.', 'Exported 10-minute MP4.') },
                        { id: 't7', title: 'Create Thumbnail/Cover art', estimatedHours: 2, completed: false, cost: '$0', prereqs: 't6', details: createDetails('Design the hook visual.', ['Photoshop creation'], ['Crucial for CTR'], ['Design 3 options'], 'Final Graphic.', 'High-contrast CTR thumbnail.') }
                    ]
                },
                {
                    title: 'Publishing & SEO',
                    tasks: [
                        { id: 't8', title: 'Upload and Metadata', estimatedHours: 2, completed: false, cost: '$0', prereqs: 't7', details: createDetails('Upload to the platform.', ['Adding titles/tags'], ['Gets it online and searchable'], ['Write descriptions', 'Add tags'], 'Live content.', 'Video is live on YouTube.') }
                    ]
                },
                {
                    title: 'Distribution',
                    tasks: [
                        { id: 't9', title: 'Promote to external channels', estimatedHours: 3, completed: false, cost: '$0', prereqs: 't8', details: createDetails('Drive traffic to the content.', ['Sharing on Twitter/Reddit'], ['Spikes the initial algorithm push'], ['Engage in communities', 'Send to newsletter'], 'Initial viewership.', '100 views in first 24 hours.') }
                    ]
                }
            ];
            break;

        case 'Hackathon / College Project':
            phases = [
                {
                    title: 'Ideation',
                    tasks: [
                        { id: 't1', title: 'Understand constraints', estimatedHours: 2, completed: false, cost: '$0', prereqs: 'None', details: createDetails('Grasp the requirements.', ['Reading the prompt'], ['Prevents building the wrong thing'], ['Highlight key constraints'], 'A clear goal.', 'Understanding we must use API X.') },
                        { id: 't2', title: 'Brainstorm & Lock Idea', estimatedHours: 3, completed: false, cost: '$0', prereqs: 't1', details: createDetails('Decide what to build.', ['A climate change tracker app'], ['Stops feature creep'], ['Pick the best idea'], 'A locked feature list.', '3 core features agreed upon.') }
                    ]
                },
                {
                    title: 'Architecture Strategy',
                    tasks: [
                        { id: 't3', title: 'Choose tech stack', estimatedHours: 1, completed: false, cost: '$0', prereqs: 't2', details: createDetails('Select the tools.', ['React + Firebase'], ['Allows work to begin'], ['Assess team skills', 'Pick fastest tools'], 'Tech decisions.', 'Using React and Tailwind.') },
                        { id: 't4', title: 'Divide responsibilities', estimatedHours: 1, completed: false, cost: '$0', prereqs: 't3', details: createDetails('Assign work.', ['Alice does UI, Bob does API'], ['Prevents stepping on toes'], ['Create Trello board'], 'A clear task list.', 'Everyone knows what to code.') }
                    ]
                },
                {
                    title: 'Rapid Construction',
                    tasks: [
                        { id: 't5', title: 'Build core value', estimatedHours: 12, completed: false, cost: '$0', prereqs: 't4', details: createDetails('Write the code fast.', ['Building the main functional loop'], ['The bulk of the project'], ['Code until it works'], 'A functional prototype.', 'The app does the main thing.') },
                        { id: 't6', title: 'Integrate components', estimatedHours: 6, completed: false, cost: '$0', prereqs: 't5', details: createDetails('Connect frontend to backend.', ['API wiring'], ['Makes it a real app'], ['Connect DB'], 'Integrated system.', 'App flows end-to-end.') }
                    ]
                },
                {
                    title: 'Quality Assurance',
                    tasks: [
                        { id: 't7', title: 'Testing & bug fixing', estimatedHours: 4, completed: false, cost: '$0', prereqs: 't6', details: createDetails('Ensure it does not crash.', ['Fixing API errors'], ['Judges hate crashes'], ['Click every button'], 'A stable build.', 'No fatal errors.') }
                    ]
                },
                {
                    title: 'Pitch Preparation',
                    tasks: [
                        { id: 't8', title: 'Create slide deck', estimatedHours: 4, completed: false, cost: '$0', prereqs: 't7', details: createDetails('Sell the project.', ['Making PPT slides'], ['A good presentation beats a good app'], ['Write a pitch script'], 'A pitch deck.', 'A 5-slide deck.') },
                        { id: 't9', title: 'Submit deliverable', estimatedHours: 1, completed: false, cost: '$0', prereqs: 't8', details: createDetails('Turn it in.', ['Devpost submission'], ['Required to win'], ['Write description', 'Upload video link'], 'Submitted project.', 'Confirmation email received.') }
                    ]
                }
            ];
            break;

        case 'Personal Goal':
            phases = [
                {
                    title: 'Goal Initialization',
                    tasks: [
                        { id: 't1', title: 'Define SMART goal', estimatedHours: 2, completed: false, cost: '$0', prereqs: 'None', details: createDetails('Be specific.', ['Lose 10 lbs by June'], ['Vague goals fail'], ['Use SMART framework'], 'A written goal.', '"Run a 5k in under 25 mins by August."') },
                        { id: 't2', title: 'Break into metrics', estimatedHours: 2, completed: false, cost: '$0', prereqs: 't1', details: createDetails('Make it trackable.', ['Run 1 mile without stopping'], ['Reduces overwhelm'], ['Define 3 checkpoints'], 'A milestone list.', 'Milestone 1: 1 mile under 9 mins.') }
                    ]
                },
                {
                    title: 'System Design',
                    tasks: [
                        { id: 't3', title: 'Design daily/weekly system', estimatedHours: 1, completed: false, cost: '$0', prereqs: 't2', details: createDetails('Determine daily actions.', ['Run 3x a week'], ['Habits drive results'], ['Block out calendar time'], 'A schedule.', 'M/W/F 6am running blocked.') },
                        { id: 't4', title: 'Setup tracking mechanics', estimatedHours: 1, completed: false, cost: '$0', prereqs: 't3', details: createDetails('Prepare to record data.', ['Install Strava'], ['What gets measured gets managed'], ['Create Notion DB'], 'A tracking system.', 'App installed and ready.') }
                    ]
                },
                {
                    title: 'Execution & Momentum',
                    tasks: [
                        { id: 't5', title: 'Execute week 1-2', estimatedHours: 10, completed: false, cost: '$0', prereqs: 't4', details: createDetails('Build the habit.', ['Doing the runs'], ['Hardest part is starting'], ['Follow the calendar'], 'Streak built.', '14 days consistent.') }
                    ]
                },
                {
                    title: 'Review & Adjustment',
                    tasks: [
                        { id: 't6', title: 'Assess progress vs target', estimatedHours: 2, completed: false, cost: '$0', prereqs: 't5', details: createDetails('See if you are on track.', ['Checking weight vs target'], ['Catches slips early'], ['15 min review'], 'A reflective insight.', 'Realized I missed Wednesday.') },
                        { id: 't7', title: 'Adjust strategy', estimatedHours: 1, completed: false, cost: '$0', prereqs: 't6', details: createDetails('Course correct.', ['Waking up earlier'], ['Strict plans break, flexible plans bend'], ['Modify blocks'], 'An updated schedule.', 'Moved Wednesday run to Thursday.') }
                    ]
                },
                {
                    title: 'Final Push',
                    tasks: [
                        { id: 't8', title: 'Achieve ultimate target', estimatedHours: 2, completed: false, cost: '$0', prereqs: 't7', details: createDetails('Hit the goal.', ['Running the actual 5k race'], ['The reward'], ['Execute the final push'], 'A completed goal.', 'Finished 5k in 24:30!') }
                    ]
                }
            ];
            break;

        default:
            phases = [
                {
                    title: 'Discovery',
                    tasks: [{ id: 't1', title: 'Define project scope', estimatedHours: 4, completed: false, cost: '$0', prereqs: 'None', details: createDetails('Outline the project.', ['Features'], ['Clarity'], ['Write PRD'], 'Scope document.', 'A 1-pager.') }]
                },
                {
                    title: 'Planning',
                    tasks: [{ id: 't2', title: 'Determine requirements', estimatedHours: 4, completed: false, cost: '$0', prereqs: 't1', details: createDetails('List all needs.', ['Data needs'], ['Prevents blockers'], ['Create list'], 'Need list.', 'Documented.') }]
                },
                {
                    title: 'Execution Phase 1',
                    tasks: [{ id: 't3', title: 'Execute part 1', estimatedHours: 10, completed: false, cost: '$0', prereqs: 't2', details: createDetails('Start working.', ['Building'], ['Progress'], ['Work hard'], 'Result.', 'Draft 1 completed.') }]
                },
                {
                    title: 'Execution Phase 2',
                    tasks: [{ id: 't4', title: 'Execute part 2', estimatedHours: 10, completed: false, cost: '$0', prereqs: 't3', details: createDetails('Continue working.', ['Building'], ['Progress'], ['Work hard'], 'Result.', 'Draft 2 completed.') }]
                },
                {
                    title: 'Finalization',
                    tasks: [{ id: 't5', title: 'Review & finalize', estimatedHours: 5, completed: false, cost: '$0', prereqs: 't4', details: createDetails('Test and Polish.', ['QA'], ['Quality'], ['Test'], 'Final.', 'Done.') }]
                }
            ];
            break;
    }

    // Distribute TotalWeeks and Assign Team Members dynamically
    let remainingWeeks = totalWeeks;
    let currentWeek = 1;
    let memberIndex = 0;

    const milestones = phases.map((phase, index) => {
        let durationWeeks;
        if (index === phases.length - 1) {
            durationWeeks = remainingWeeks; // Give remaining weeks to the last phase
        } else {
            // Allocate proportionally. E.g. for 5 weeks across 4 phases => 1, 1, 1, 2
            durationWeeks = Math.max(1, Math.floor(totalWeeks / phases.length));
        }
        remainingWeeks -= durationWeeks;

        // Safety against zero weeks if phase count > totalWeeks
        if (durationWeeks <= 0) {
            durationWeeks = 1;
        }

        const endWeek = currentWeek + durationWeeks - 1;
        const durationStr = durationWeeks === 1 ? `Week ${currentWeek}` : `Week ${currentWeek} - ${endWeek}`;

        const m = {
            id: `m${index + 1}`,
            title: phase.title,
            duration: durationStr,
            status: index === 0 ? 'active' : 'pending',
            progress: 0,
            tasks: phase.tasks.map(t => {
                const assignedRole = memberIndex % parseInt(teamSize) === 0 ? (creatorName || 'Builder') : `Role ${memberIndex % parseInt(teamSize) + 1}`;
                memberIndex++;
                return {
                    ...enrichTaskDetails(t, idea, budget),
                    assignee: assignedRole
                };
            })
        };

        currentWeek = endWeek + 1;
        return m;
    });

    return {
        id: Date.now().toString(),
        ideaName: idea,
        category,
        totalWeeks,
        teamMembers: membersArray,
        milestones
    };
};