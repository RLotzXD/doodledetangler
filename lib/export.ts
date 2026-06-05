import { Idea, Tweet } from './types';

export function generateIdeasPrompt(
  ideas: Idea[],
  briefText: string,
  notesText: string
): string {
  const selectedIdeas = ideas.filter((i) => i.selected);
  const ideasText = selectedIdeas
    .map(
      (idea, idx) =>
        `Idea ${idx + 1}: ${idea.headline}
Subheader: ${idea.subheader}
Insight: ${idea.insight}
Mechanic: ${idea.mechanic}
User Journey: ${idea.userJourney}
Why it works: ${idea.reasoning} (Score: ${idea.score}/10)`
    )
    .join('\n\n');

  const summaryReasons = selectedIdeas
    .map((idea) => `- ${idea.headline}: ${idea.reasoning}`)
    .join('\n');

  return `You are an expert deck builder. Create a presentation deck based on these ideas.

CLIENT BRIEF:
${briefText || 'No specific brief provided.'}

MEETING NOTES:
${notesText || 'No notes provided.'}

SELECTED IDEAS:
${ideasText}

DECK STRUCTURE:
1. Title Slide: Introduce the presentation and the main brief/objective
2. Summary Slide: Overview of all ${selectedIdeas.length} ideas with why they work:
${summaryReasons}
3. Individual Idea Slides: Create one slide per idea with:
   - Headline
   - Subheader (as a compelling statement)
   - Insight (the problem/opportunity)
   - Mechanic (how it works)
   - User journey (how customers experience it)
4. Closing Slide: Call-to-action or recommendation

DESIGN PRINCIPLES:
- Keep it simple and clear
- One idea per slide (after summary)
- Use visual hierarchy to guide attention
- Minimize text, maximize clarity
- Make content scannable

Create a presentation that is professional, clear, and persuasive.`;
}

export function generateTweetsPrompt(
  tweets: Tweet[],
  briefText: string,
  notesText: string
): string {
  const selectedTweets = tweets.filter((t) => t.selected);
  const tweetsText = selectedTweets
    .map((tweet, idx) => `${idx + 1}. ${tweet.text}`)
    .join('\n');

  return `You are an expert deck builder. Create a presentation deck based on these selling points.

CLIENT BRIEF:
${briefText || 'No specific brief provided.'}

MEETING NOTES:
${notesText || 'No notes provided.'}

SELLING POINTS (One-liners):
${tweetsText}

DECK STRUCTURE:
1. Title Slide: Introduce the presentation and the main brief/objective
2. Summary Slide: Overview of all ${selectedTweets.length} selling points that will be presented
3. Individual Point Slides: Create one slide per point with:
   - The selling point as the main message
   - Supporting context and why it matters
   - Clear visual presentation
4. Closing Slide: Call-to-action or recommendation

DESIGN PRINCIPLES:
- Keep it simple and clear
- One point per slide (after summary)
- Use visual hierarchy to guide attention
- Minimize text, maximize clarity
- Make content scannable
- Each point should be compelling and easy to understand

Create a presentation that is professional, clear, and persuasive.`;
}
