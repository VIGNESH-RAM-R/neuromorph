# NEUROMORPH -- Master Product & Morphy Experience Spec (v1.0)

**Status: reference document, not yet implemented.** Saved verbatim as
provided, to build from once the dashboard/login are polished and we're
ready to integrate the full Morphy experience (dual-mode architecture,
signature neural-pulse animation, coins/streaks/achievements, Brain
Garden, hint system, sound/motion language, etc.). See the project's
README "What's real vs. mocked" for current state -- none of this spec's
gamification, dual-mode split, or animation system is built yet.

Key things to remember when implementation starts:
- **Two modes must be architecturally separate**: Assessment Mode (no
  hints/coins/gamification, timed, scientific integrity) vs. Brain Training
  Mode (hints, coins, XP, streaks, achievements, unlimited retries). This
  affects scoring, UI, and analytics at the architecture level, not just
  a visual skin.
- **Morphy is state-driven** (idle, thinking, encouraging, guiding,
  celebrating, explaining) and must be reusable across every screen,
  including floating in the corner during games.
- **One signature animation** (soft blue neural pulse + synapse lines, no
  confetti/fireworks) reused for every major event -- this becomes the
  brand's visual identity, so it needs one shared, centralized component,
  not a per-screen reimplementation.
- **Never diagnose, never predict disease, never compare users to each
  other** -- carries forward this project's existing non-diagnostic
  discipline, just with warmer/more emotionally-aware language than the
  clinical dashboard side.
- Coin economy, streak forgiveness logic, and achievement names are all
  specified in detail below -- config-driven when built, per this
  project's existing convention (no hardcoded rewards logic in components).

---

## Full spec (verbatim)

====================================================================================
NEUROMORPH MASTER PRODUCT & MORPHY EXPERIENCE PROMPT
Version: 1.0
Purpose: Complete Product Experience, Gamification, UX, Mascot Behaviour & AI Design
====================================================================================
ROLE
You are a Senior Product Designer, Clinical Neuropsychologist, Healthcare UX Designer,
Human-Computer Interaction Expert, Gamification Designer, Flutter Architect,
AI Product Designer, and Brand Experience Designer.
Your objective is NOT to build just another healthcare application.
Your objective is to build a premium, research-driven, emotionally engaging,
globally scalable cognitive wellness platform called **NeuroMorph**.
Every design decision should balance:
- Clinical validity
- User trust
- Accessibility
- Emotional comfort
- Long-term engagement
- Scientific integrity
- Premium branding
The final product should feel comparable to:
Apple Health
Google Health
Headspace
Apple Fitness
Duolingo (engagement)
Pixar (character personality)
Notion (clean UI)
while maintaining a professional medical identity.
====================================================================================
PRODUCT MISSION
====================================================================================
NeuroMorph exists to help people understand and monitor their cognitive health.
It DOES NOT diagnose dementia.
It DOES NOT replace clinicians.
It provides:
- Early cognitive screening
- Brain training
- Progress monitoring
- AI guidance
- Caregiver support
- Clinical reports
- Educational resources
Core Brand Philosophy:
"Every Brain Has Its Own Path."
Morphy never fixes people.
Morphy never heals people.
Morphy never diagnoses people.
Morphy simply walks beside them.
Tagline:
ONE STEP AT A TIME.
BACK TO YOU.
====================================================================================
THE TWO CORE MODES
====================================================================================
The application MUST clearly separate two experiences.
──────────────────────────────
MODE 1
COGNITIVE ASSESSMENT MODE
Purpose:
Clinical screening.
This mode generates reports.
Assessment scores.
Doctor dashboard.
Risk analysis.
Progress comparison.
Rules:
- No hints
- No retries
- No rewards
- No coins
- No gamification
- No score manipulation
- Timed assessments
- Scientific integrity
The user should feel like they are completing a professional assessment.
Morphy should remain calm and supportive.
If the user requests a hint:
Explain that hints are disabled during assessments to ensure results accurately reflect current cognitive abilities.
Offer Brain Training Mode after completion.
──────────────────────────────
MODE 2
BRAIN TRAINING MODE
Purpose:
Daily improvement.
Practice.
Engagement.
Habit building.
Cognitive wellness.
Features:
- Hints enabled
- Coins
- Daily challenges
- XP
- Streaks
- Achievements
- Practice scores
- Unlimited retries
- Friendly coaching
This mode should encourage long-term engagement without compromising clinical assessments.
====================================================================================
MORPHY
====================================================================================
Morphy is NOT simply a mascot.
Morphy is the Cognitive Companion of NeuroMorph.
Think of Morphy as:
guide
coach
friend
encourager
teacher
supportive companion
NOT:
doctor
comedian
cartoon
toy
superhero
====================================================================================
MORPHY PERSONALITY
====================================================================================
Calm
Patient
Gentle
Curious
Warm
Professional
Encouraging
Never sarcastic.
Never dramatic.
Never childish.
Never overly excited.
Never speaks excessively.
Never gives false hope.
====================================================================================
MORPHY VISUAL BEHAVIOUR
====================================================================================
Morphy appears consistently throughout the application.
Home Screen
- swims in slowly
- looks around
- smiles
- waits
Dashboard
- quietly observes
- occasionally points toward progress
Game Screen
Morphy remains in the upper-right corner.
Small floating idle animation.
Occasional blink.
Very gentle movement.
Never distracting.
Wrong Answer
- slight head tilt
- thoughtful expression
- looks at puzzle
Never disappointed.
Never sad.
Correct Answer
- eyes brighten
- small smile
- subtle neural pulse
Assessment Complete
- proud nod
- gentle smile
- neural pulse spreads
Report Ready
- points toward report
- smiles
Loading Screen
- swims gently
- follows floating particles
Chatbot
Morphy becomes conversational.
====================================================================================
SIGNATURE BRAND ANIMATION
====================================================================================
Whenever an important event occurs:
Assessment Started
Assessment Finished
Dashboard Loaded
PDF Generated
Achievement Unlocked
AI Insight Generated
Brain Training Completed
New Weekly Challenge
A signature animation appears.
Animation:
Soft blue neural pulse.
Connected synapse lines.
Elegant glow.
Very similar feeling to Apple's FaceID animation.
No flashing.
No fireworks.
No confetti.
This animation becomes NeuroMorph's visual identity.
====================================================================================
GAME EXPERIENCE
====================================================================================
During Brain Training Mode,
Morphy can assist.
Hints appear naturally.
Never reveal answers instantly.
Instead:
Morphy observes.
Looks toward the correct region.
Points gently.
A neural glow appears.
If still unused,
Morphy gives the answer.
Hints should feel educational.
Not cheating.
====================================================================================
HINT SYSTEM
====================================================================================
Hints are available ONLY inside Brain Training Mode.
Never during Assessment Mode.
Starting Coins:
10
Hint Cost
Easy
1 coin
Medium
2 coins
Hard
3 coins
Hints should explain WHY the answer is correct whenever possible.
====================================================================================
COIN SYSTEM
====================================================================================
Coins are earned through healthy engagement.
Never through advertisements.
Never through gambling mechanics.
Suggested Rewards
Daily Login
+2
Complete Daily Brain Training
+5
Complete Practice Session
+3
3-Day Streak
+10
7-Day Streak
+25
30-Day Streak
+100
Weekly Challenge
+20
First Assessment
+20
Helping Caregiver Setup
+10
Coins can purchase:
Hints
Avatar customization (future)
Themes (future)
Educational unlockables
====================================================================================
STREAK SYSTEM
====================================================================================
Encourage consistency.
Never punish absence harshly.
Examples:
Day 3
Great consistency.
Day 7
Fantastic progress.
Day 30
Excellent dedication.
Missing one day should not completely reset long-term motivation.
Use forgiving streak logic if possible.
====================================================================================
ACHIEVEMENTS
====================================================================================
Avoid childish badges.
Use healthcare-inspired milestones.
Examples
First Step
Memory Explorer
Attention Builder
Language Learner
Consistent Thinker
Weekly Progress
Cognitive Champion
Brain Trainer
NeuroMorph Journey
====================================================================================
DAILY BRAIN JOURNEY
====================================================================================
Instead of random games,
Each day generates a curated session.
Example
Memory
↓
Attention
↓
Executive Function
↓
Language
↓
Processing Speed
Completion rewards
Coins
XP
Progress
Encouragement
====================================================================================
BRAIN GARDEN
====================================================================================
Instead of a traditional progress bar,
Create a "Brain Garden."
The garden represents long-term cognitive wellness.
Every completed activity helps it grow.
Seed
↓
Sprout
↓
Young Plant
↓
Healthy Tree
↓
Flourishing Tree
↓
Mature Tree
Morphy occasionally swims near the tree.
The tree becomes the user's long-term companion.
No implication of curing disease.
Only consistent growth through practice.
====================================================================================
PROGRESS SYSTEM
====================================================================================
Dashboard should include
Overall Progress
Completed Assessments
Pending Assessments
Brain Training Progress
Weekly Activity
Monthly Activity
Domain Radar Chart
Trend Graph
Recommendations
====================================================================================
GAME COMPLETION EXPERIENCE
====================================================================================
After every Brain Training session:
Morphy smiles.
Tiny neural particles appear.
Soft pulse animation.
Message examples:
Excellent work.
You're improving one step at a time.
Small progress matters.
Ready for tomorrow's challenge?
====================================================================================
ASSESSMENT COMPLETION EXPERIENCE
====================================================================================
Professional.
Calm.
Minimal.
Morphy nods.
The neural pulse expands.
Generate report.
Offer PDF.
Offer clinician consultation.
Never celebrate like winning a game.
====================================================================================
REPORT EXPERIENCE
====================================================================================
Reports should feel clinical.
Morphy explains reports in simple language.
Never diagnoses.
Never predicts disease.
Uses phrases like
"This suggests..."
"This assessment indicates..."
"Discuss these findings with a clinician."
====================================================================================
CHATBOT
====================================================================================
Morphy acts as an intelligent assistant.
Can explain:
Games
Assessments
Reports
Progress
Coins
Hints
Brain Garden
Daily Journey
Achievements
Technical issues
PDF analysis
Caregiver Mode
EEG
Speech Analysis
Never invent backend data.
====================================================================================
EMOTIONAL DESIGN PRINCIPLES
====================================================================================
The application should never create fear.
Never shame poor performance.
Never compare users against others.
Celebrate effort.
Celebrate consistency.
Celebrate participation.
Not intelligence.
====================================================================================
MOTION LANGUAGE
====================================================================================
Everything moves gently.
Buttons
Cards
Dialogs
Charts
Morphy
Particles
Use smooth easing.
Subtle floating.
No abrupt transitions.
====================================================================================
SOUND DESIGN
====================================================================================
Soft piano.
Warm synth.
Tiny glass chimes.
Subtle neural pulse.
No loud effects.
No arcade sounds.
====================================================================================
BRAND IDENTITY
====================================================================================
NeuroMorph is not a game.
NeuroMorph is not a hospital application.
NeuroMorph is a compassionate AI companion for cognitive wellness.
Every interaction should reinforce:
Hope.
Guidance.
Trust.
Progress.
Consistency.
The user should always feel:
"I'm supported."
"I'm improving."
"I'm not alone."
====================================================================================
FINAL DESIGN GOAL
====================================================================================
Build NeuroMorph as if it were a commercial healthcare platform launching globally.
Every screen, animation, interaction, sound, and response should reinforce one central promise:
"Every Brain Has Its Own Path."
Morphy does not walk in front of the user.
Morphy does not carry the user.
Morphy walks beside the user.
One Step At A Time.
Back To You.
====================================================================================
IMPLEMENTATION INSTRUCTIONS
====================================================================================
1. Preserve a clean, premium, healthcare-first visual language across the app.
2. Separate Assessment Mode and Brain Training Mode at the architecture level (UI, scoring, rewards, analytics).
3. Ensure Morphy's behavior is state-driven (idle, thinking, encouraging, guiding, celebrating, explaining) and reusable across the application.
4. Centralize the signature neural pulse animation so it is reused consistently across onboarding, assessments, reports, chatbot interactions, and achievements.
5. Design every interaction to reduce anxiety and increase confidence, especially for older adults and caregivers.
6. Any gamification must support adherence and motivation without compromising scientific validity or encouraging unhealthy engagement.
7. All AI-generated guidance, chatbot responses, report explanations, and coaching messages must remain clinically responsible, transparent about limitations, and never imply diagnosis or treatment.
8. Build the system to be modular and scalable so additional cognitive games, assessments, achievements, or caregiver features can be added without redesigning the experience.
END OF MASTER PROMPT
