// The REAL 100-item Question Bank, converted from the source spreadsheet
// (100_QB.xlsx: Frontal 25 / Temporal 35 / Parietal 25 / Occipital 15,
// each item MMSE/MoCA/SLUMS/SAGE/AD8/IQCODE/DSRS-inspired but deliberately
// reworded to avoid duplicating any single real instrument's exact wording
// or parameters -- see the source file's own "Inspired By"/"Notes" columns).
//
// Every item's `id` is the original spreadsheet ID lowercased (q001-q100)
// for 1:1 traceability back to the source, and `construct` carries over
// the spreadsheet's "Construct Measured" column so a reviewer can always
// see what each item is meant to test.
//
// CONVERSION NOTES (read before editing):
// The source items are written as VERBAL/OBSERVED clinical items (spoken
// answers, drawings, physically performed actions) for an in-person,
// clinician-administered session. This app is self-administered with no
// one watching, so every item was rewritten as a 4-choice multiple-choice
// question testing the SAME construct -- exact-match text/typing is
// avoided everywhere else in this assessment for the same reason (see
// NamingTask/CubeCopyTask). Three categories needed a real adaptation
// rather than a direct rewrite, and are flagged inline with `adapted: true`:
//   1. Caregiver/informant items (q025, q056-q060, q083-q085) ask a family
//      member to RATE the patient subjectively -- there's no objectively
//      "correct" choice for a rating, so a fake correctIndex would be
//      fabricated. Replaced with an objectively-answerable item testing
//      the same construct area instead of a forced fake answer.
//   2. Live-context orientation items (q032-q036, q048-q050, q072-q073)
//      ask for TODAY's actual date/season/year or THIS location's actual
//      name -- answering those correctly depends on live date/location
//      data this static config doesn't have. Replaced with items that
//      test the orientation CONCEPT itself rather than requiring live
//      context. (A real per-patient date/location-aware version is a
//      legitimate future upgrade -- `new Date()` is available if the team
//      wants to build that; not done here to avoid adding dynamic-answer
//      machinery for a supplementary content block.)
//   3. Drawing/copying/physical-action items (clock drawing, cube/shape
//      copying, matchstick puzzles, line bisection, photo-pointing) can't
//      become a 4-choice text question without losing the point of the
//      task -- several of these (Clock Drawing, Cube Copy) already exist
//      as full dedicated lobar tasks elsewhere in this assessment, so
//      here they're converted into a conceptual-understanding question
//      about the same construct instead of a duplicate, degraded version
//      of the real task.
export const QUESTION_BANK = [
  // ================= FRONTAL (25) =================
  { id: 'q001', lobeTag: 'frontal', construct: 'Working memory / serial subtraction', prompt: 'What is 90 minus 8?', choices: ['80', '82', '84', '88'], correctIndex: 1 },
  { id: 'q002', lobeTag: 'frontal', construct: 'Working memory / reverse spelling', prompt: 'Spelled backward, which of these correctly spells the word GRAIN?', choices: ['NIARG', 'GRIAN', 'NIRAG', 'GRANI'], correctIndex: 0 },
  { id: 'q003', lobeTag: 'frontal', construct: 'Executive function / multi-step instruction', prompt: "You're asked to: 1) pick up a card with your right hand, 2) turn it over, 3) place it face-down on the table. Which hand should you use?", choices: ['Left hand', 'Right hand', 'Either hand', 'Both hands'], correctIndex: 1 },
  { id: 'q004', lobeTag: 'frontal', construct: 'Language comprehension / action', prompt: "If a card told you to 'TAP THE TABLE TWICE,' how many times should you tap?", choices: ['Once', 'Twice', 'Three times', 'Four times'], correctIndex: 1 },
  { id: 'q005', lobeTag: 'frontal', construct: 'Calculation', prompt: 'You have 45 dollars and spend 17 dollars. How much do you have left?', choices: ['$26', '$28', '$30', '$32'], correctIndex: 1 },
  { id: 'q006', lobeTag: 'frontal', construct: 'Language / semantic prediction', prompt: "Complete this sentence with the word that makes sense: 'She opened the umbrella because it started to ___.'", choices: ['snow', 'rain', 'shine', 'thunder'], correctIndex: 1 },
  { id: 'q007', lobeTag: 'frontal', construct: 'Attention / sustained counting', prompt: 'Counting backward by twos starting at 20 (20, 18, 16, 14...), which of these numbers would NOT appear in the sequence?', choices: ['18', '16', '15', '14'], correctIndex: 2 },
  { id: 'q008', lobeTag: 'frontal', construct: 'Working memory / written calculation', prompt: 'What is 27 plus 15?', choices: ['40', '41', '42', '44'], correctIndex: 2 },
  { id: 'q009', lobeTag: 'frontal', construct: 'Working memory / serial subtraction', prompt: 'What is 75 minus 6?', choices: ['67', '68', '69', '70'], correctIndex: 2 },
  { id: 'q010', lobeTag: 'frontal', construct: 'Attention / digit span forward', prompt: 'Which sequence below matches exactly, in the same order: 6-1-8-3?', choices: ['6-1-8-3', '6-8-1-3', '1-6-8-3', '6-1-3-8'], correctIndex: 0 },
  { id: 'q011', lobeTag: 'frontal', construct: 'Attention / digit span backward', prompt: 'Which sequence shows 7-2-5 in REVERSE order?', choices: ['5-2-7', '7-5-2', '2-7-5', '5-7-2'], correctIndex: 0 },
  { id: 'q012', lobeTag: 'frontal', construct: 'Sustained attention / vigilance', prompt: "If you tap every time you hear the letter K, and someone says: M, K, T, K, R, K -- how many times should you tap?", choices: ['2', '3', '4', '5'], correctIndex: 1 },
  { id: 'q013', lobeTag: 'frontal', construct: 'Abstract reasoning', prompt: 'In what way are a train and a bicycle alike?', choices: ['Modes of transportation', 'Types of food', 'Musical instruments', 'Sports equipment'], correctIndex: 0 },
  { id: 'q014', lobeTag: 'frontal', construct: 'Abstract reasoning', prompt: 'How are a clock and a ruler alike?', choices: ['Tools used to measure something', 'Types of jewelry', 'Kitchen utensils', 'Articles of clothing'], correctIndex: 0 },
  { id: 'q015', lobeTag: 'frontal', construct: 'Verbal fluency (letter)', prompt: 'Which of these words does NOT begin with the letter T?', choices: ['Table', 'Tiger', 'Window', 'Truck'], correctIndex: 2 },
  { id: 'q016', lobeTag: 'frontal', construct: 'Verbal fluency (category)', prompt: 'Which of these is NOT typically found in a kitchen?', choices: ['Spatula', 'Whisk', 'Toothbrush', 'Colander'], correctIndex: 2 },
  { id: 'q017', lobeTag: 'frontal', construct: 'Executive sequencing / set-shifting', prompt: 'What comes next in this alternating sequence: 1, A, 2, B, 3, ?', choices: ['B', 'C', 'D', '4'], correctIndex: 1 },
  { id: 'q018', lobeTag: 'frontal', construct: 'Executive planning / practical reasoning', prompt: 'Using $1, $5, and $10 bills, which combination adds up to exactly $16?', choices: ['One $10 + one $5 + one $1', 'One $10 + one $5', 'Three $5 bills', 'One $10 + one $1'], correctIndex: 0 },
  { id: 'q019', lobeTag: 'frontal', construct: 'Sequencing / working memory', prompt: 'Naming the months backward starting from December, which month comes second (right after December)?', choices: ['January', 'November', 'October', 'February'], correctIndex: 1 },
  { id: 'q020', lobeTag: 'frontal', construct: 'Cognitive flexibility / inhibition', prompt: "Counting from 1 to 10 and saying 'skip' instead of any even number, what would you say instead of the number 4?", choices: ['4', 'Skip', 'Four', 'Nothing'], correctIndex: 1 },
  { id: 'q021', lobeTag: 'frontal', construct: 'Calculation / practical reasoning', prompt: 'You have 80 dollars. You buy groceries for 25 dollars and a book for 12 dollars. How much do you have left?', choices: ['$41', '$43', '$45', '$47'], correctIndex: 1 },
  { id: 'q022', lobeTag: 'frontal', construct: 'Verbal fluency (category)', prompt: 'Which of these is NOT a job or occupation?', choices: ['Teacher', 'Electrician', 'Broccoli', 'Plumber'], correctIndex: 2 },
  { id: 'q023', lobeTag: 'frontal', construct: 'Nonverbal problem solving', adapted: true, prompt: 'In matchstick-rearrangement puzzles, reducing the number of shapes by moving sticks usually means you should:', choices: ['Remove or merge shared lines to combine spaces', 'Add as many new matchsticks as possible', 'Only move matchsticks along the outer edge', 'Make every shape bigger'], correctIndex: 0 },
  { id: 'q024', lobeTag: 'frontal', construct: 'Practical numeracy', prompt: 'How many 25-cent coins make up 3 dollars?', choices: ['10', '11', '12', '13'], correctIndex: 2 },
  { id: 'q025', lobeTag: 'frontal', construct: 'Executive planning', adapted: true, prompt: 'When planning a trip, which of these should typically happen FIRST?', choices: ['Decide on a destination', 'Pack your bags', 'Buy souvenirs', 'Check out of the hotel'], correctIndex: 0 },

  // ================= TEMPORAL (35) =================
  { id: 'q026', lobeTag: 'temporal', construct: 'Registration (immediate memory)', prompt: 'Remember these three words: LADDER, ORANGE, WINDOW. Which of the following was one of them?', choices: ['LADDER', 'MARKET', 'VALLEY', 'RIBBON'], correctIndex: 0 },
  { id: 'q027', lobeTag: 'temporal', construct: 'Immediate recall', prompt: 'The three words were LADDER, ORANGE, and WINDOW. Which of these is NOT one of them?', choices: ['ORANGE', 'WINDOW', 'LADDER', 'GARDEN'], correctIndex: 3 },
  { id: 'q028', lobeTag: 'temporal', construct: 'Delayed recall', adapted: true, prompt: 'Remember these three words: LADDER, ORANGE, WINDOW. Now picture counting backward from 5 to 1, then answer: which word was NOT on the list?', choices: ['ORANGE', 'LADDER', 'WINDOW', 'HARBOR'], correctIndex: 3 },
  { id: 'q029', lobeTag: 'temporal', construct: 'Confrontation naming', prompt: 'What is the name of a tool with teeth used to arrange hair?', choices: ['Comb', 'Brush', 'Razor', 'Scissors'], correctIndex: 0 },
  { id: 'q030', lobeTag: 'temporal', construct: 'Confrontation naming', prompt: 'What do you call small metal objects used to lock or unlock a door?', choices: ['Keys', 'Coins', 'Buttons', 'Screws'], correctIndex: 0 },
  { id: 'q031', lobeTag: 'temporal', construct: 'Repetition (language)', prompt: "Which sentence exactly matches: 'Neither here nor there will settle it.'?", choices: ['Neither here nor there will settle it.', 'Neither here or there will settle it.', 'Neither there nor here will settle it.', 'Neither here nor there will fix it.'], correctIndex: 0 },
  { id: 'q032', lobeTag: 'temporal', construct: 'Orientation to time (concept)', adapted: true, prompt: "If someone doesn't know what day of the week it is, that reflects a problem with:", choices: ['Orientation to time', 'Orientation to person', 'Long-term memory', 'Visual perception'], correctIndex: 0 },
  { id: 'q033', lobeTag: 'temporal', construct: 'Orientation to time (concept)', adapted: true, prompt: "Being able to state today's date without checking a calendar or phone reflects:", choices: ['Orientation to time', 'Language ability', 'Motor coordination', 'Visual memory'], correctIndex: 0 },
  { id: 'q034', lobeTag: 'temporal', construct: 'Orientation to time (concept)', adapted: true, prompt: 'Knowing what season it currently is (spring, summer, fall, or winter) is a test of:', choices: ['Orientation to time', 'Calculation ability', 'Facial recognition', 'Fine motor control'], correctIndex: 0 },
  { id: 'q035', lobeTag: 'temporal', construct: 'Orientation to place (concept)', adapted: true, prompt: "Being able to say what building or place you're currently in is a test of:", choices: ['Orientation to place', 'Orientation to time', 'Verbal fluency', 'Calculation'], correctIndex: 0 },
  { id: 'q036', lobeTag: 'temporal', construct: 'Orientation to place (concept)', adapted: true, prompt: "Knowing what city or town you're in, without being told, reflects:", choices: ['Orientation to place', 'Short-term memory', 'Abstract reasoning', 'Attention span'], correctIndex: 0 },
  { id: 'q037', lobeTag: 'temporal', construct: 'Written expression', adapted: true, prompt: 'Which of the following is a complete sentence (has both a subject and a verb)?', choices: ['The dog ran quickly.', 'Running in the park.', 'Under the old oak tree.', 'Very tired today.'], correctIndex: 0 },
  { id: 'q038', lobeTag: 'temporal', construct: 'Registration (word-list learning)', prompt: 'Remember these five words: BRIDGE, CANDLE, TIGER, PILLOW, GARDEN. Which of the following was one of them?', choices: ['CANDLE', 'MARKET', 'VALLEY', 'RIBBON'], correctIndex: 0 },
  { id: 'q039', lobeTag: 'temporal', construct: 'Registration (second learning trial)', prompt: 'The five words were BRIDGE, CANDLE, TIGER, PILLOW, and GARDEN. Which of these was NOT one of them?', choices: ['TIGER', 'PILLOW', 'GARDEN', 'HARBOR'], correctIndex: 3 },
  { id: 'q040', lobeTag: 'temporal', construct: 'Delayed recall (uncued)', adapted: true, prompt: 'Remember these five words: BRIDGE, CANDLE, TIGER, PILLOW, GARDEN. Now picture naming the capital of France, then answer: which word was on the list?', choices: ['BRIDGE', 'MARKET', 'VALLEY', 'RIBBON'], correctIndex: 0 },
  { id: 'q041', lobeTag: 'temporal', construct: 'Delayed recall (category-cued)', prompt: 'One of these was a piece of furniture: BRIDGE, CANDLE, TIGER, PILLOW, GARDEN. Which one?', choices: ['BRIDGE', 'CANDLE', 'PILLOW', 'GARDEN'], correctIndex: 2 },
  { id: 'q042', lobeTag: 'temporal', construct: 'Delayed recall (recognition-cued)', prompt: 'Which of these three was the piece of furniture from the list: PILLOW, CHAIR, or TABLE?', choices: ['PILLOW', 'CHAIR', 'TABLE', 'None of these'], correctIndex: 0 },
  { id: 'q043', lobeTag: 'temporal', construct: 'Confrontation naming (visual)', prompt: 'Which animal has a long trunk and large ears?', choices: ['Elephant', 'Rhinoceros', 'Hippopotamus', 'Giraffe'], correctIndex: 0 },
  { id: 'q044', lobeTag: 'temporal', construct: 'Confrontation naming (visual)', prompt: 'Which animal is known for hopping and carrying its young in a pouch?', choices: ['Kangaroo', 'Rabbit', 'Frog', 'Squirrel'], correctIndex: 0 },
  { id: 'q045', lobeTag: 'temporal', construct: 'Confrontation naming (visual)', prompt: 'Which animal has humps on its back and lives in the desert?', choices: ['Camel', 'Horse', 'Llama', 'Goat'], correctIndex: 0 },
  { id: 'q046', lobeTag: 'temporal', construct: 'Repetition (language)', prompt: "Which sentence exactly matches: 'The dog chased the ball across the yard before dinner.'?", choices: ['The dog chased the ball across the yard before dinner.', 'The dog chased the ball across the yard after dinner.', 'The cat chased the ball across the yard before dinner.', 'The dog chased the ball around the yard before dinner.'], correctIndex: 0 },
  { id: 'q047', lobeTag: 'temporal', construct: 'Repetition (language)', prompt: "Which sentence exactly matches: 'The chef prepared the meal just before the guests arrived.'?", choices: ['The chef prepared the meal just before the guests arrived.', 'The chef prepared the meal just after the guests arrived.', 'The chef prepared the food just before the guests arrived.', 'The waiter prepared the meal just before the guests arrived.'], correctIndex: 0 },
  { id: 'q048', lobeTag: 'temporal', construct: 'Orientation to time (concept)', adapted: true, prompt: 'Which of these would someone with good time orientation know without checking a calendar?', choices: ['The current year', "A stranger's birthday", "Tomorrow's weather", 'The password to their phone'], correctIndex: 0 },
  { id: 'q049', lobeTag: 'temporal', construct: 'Orientation to time (concept)', adapted: true, prompt: "Which piece of information tests 'orientation to time' the same way as knowing the current month?", choices: ["Knowing today's date", 'Knowing your shoe size', "Knowing a friend's address", 'Knowing your favorite color'], correctIndex: 0 },
  { id: 'q050', lobeTag: 'temporal', construct: 'Orientation to place (concept)', adapted: true, prompt: "Which of these questions tests 'orientation to place'?", choices: ['What state or region are you in right now?', 'What is 7 plus 5?', 'What animal is this?', 'Repeat this sentence back to me.'], correctIndex: 0 },
  { id: 'q051', lobeTag: 'temporal', construct: 'Registration (informant/self)', prompt: 'Remember these five items: BOOK, SHOE, LAMP, RIVER, COIN. Which of the following was one of them?', choices: ['LAMP', 'CHAIR', 'BASKET', 'MIRROR'], correctIndex: 0 },
  { id: 'q052', lobeTag: 'temporal', construct: 'Delayed recall', prompt: 'The five items were BOOK, SHOE, LAMP, RIVER, and COIN. Which of these was NOT one of them?', choices: ['SHOE', 'RIVER', 'COIN', 'PENCIL'], correctIndex: 3 },
  { id: 'q053', lobeTag: 'temporal', construct: 'Narrative/episodic memory', prompt: "In this short story: 'Maria was a schoolteacher who loved painting. She married Tom, a chef, and they moved to Denver. After ten years, she returned to painting.' What was Maria's job?", choices: ['Schoolteacher', 'Chef', 'Painter', 'Nurse'], correctIndex: 0 },
  { id: 'q054', lobeTag: 'temporal', construct: 'Narrative/episodic memory', prompt: 'In the same story, what city did Maria and Tom move to?', choices: ['Denver', 'Chicago', 'Dallas', 'Seattle'], correctIndex: 0 },
  { id: 'q055', lobeTag: 'temporal', construct: 'Narrative/episodic memory', prompt: 'According to the story, when did Maria return to painting?', choices: ['After ten years', 'Immediately', 'After one year', 'She never returned to it'], correctIndex: 0 },
  { id: 'q056', lobeTag: 'temporal', construct: 'Everyday memory (concept)', adapted: true, prompt: "If someone repeats the same question or story several times in one conversation without noticing, that's most closely tied to:", choices: ['Short-term memory', 'Physical strength', 'Vision', 'Balance'], correctIndex: 0 },
  { id: 'q057', lobeTag: 'temporal', construct: 'Orientation (concept)', adapted: true, prompt: "Which of these is an example of 'orientation to time'?", choices: ["Knowing today's date", 'Recognizing a photo', 'Remembering a shopping list', 'Knowing your home address'], correctIndex: 0 },
  { id: 'q058', lobeTag: 'temporal', construct: 'Everyday memory (concept)', adapted: true, prompt: "Which of these best describes 'recall'?", choices: ['Bringing information back to mind without cues', 'Seeing something for the first time', 'Making a decision quickly', 'Counting objects'], correctIndex: 0 },
  { id: 'q059', lobeTag: 'temporal', construct: 'Everyday memory (concept)', adapted: true, prompt: 'Which of these is an example of remembering a NAME?', choices: ["Recalling that your neighbor is named Sarah", 'Recalling how to tie your shoes', 'Recalling what color the sky is', 'Recalling how to add two numbers'], correctIndex: 0 },
  { id: 'q060', lobeTag: 'temporal', construct: 'Person recognition (concept)', adapted: true, prompt: 'Which brain-related skill lets you recognize a familiar face?', choices: ['Facial/person recognition', 'Muscle coordination', 'Sense of smell', 'Sense of taste'], correctIndex: 0 },

  // ================= PARIETAL (25) =================
  { id: 'q061', lobeTag: 'parietal', construct: 'Constructional praxis (copying)', adapted: true, prompt: 'When copying a drawing of two overlapping hexagons, the key thing to get right is:', choices: ['Where the two shapes overlap/intersect', 'The color of the shapes', 'How fast you draw them', 'Which hand you use'], correctIndex: 0 },
  { id: 'q062', lobeTag: 'parietal', construct: 'Executive command with laterality', prompt: "You're asked to pick up paper with your LEFT hand, fold it in half, and place it on your lap. Which hand should you use?", choices: ['Left hand', 'Right hand', 'Either hand', 'Both hands'], correctIndex: 0 },
  { id: 'q063', lobeTag: 'parietal', construct: 'Language + spatial action', prompt: "If a card told you to 'POINT TO THE CEILING,' what would you do?", choices: ['Point upward, toward the ceiling', 'Point at the floor', 'Point at the door', 'Sit down'], correctIndex: 0 },
  { id: 'q064', lobeTag: 'parietal', construct: 'Visuoconstruction (clock drawing)', prompt: "On an analog clock showing 'twenty past six,' where would the minute hand point?", choices: ['Toward the 4', 'Toward the 6', 'Toward the 12', 'Toward the 8'], correctIndex: 0 },
  { id: 'q065', lobeTag: 'parietal', construct: 'Visuoconstruction (3D copy)', adapted: true, prompt: 'When copying a drawing of a 3D cube, which is most important to preserve?', choices: ['The angles and parallel edges', 'The color used', 'How long it takes', 'The size of the paper'], correctIndex: 0 },
  { id: 'q066', lobeTag: 'parietal', construct: 'Visuoconstruction (wireframe copy)', adapted: true, prompt: 'When copying a line drawing of a table exactly, you should focus most on:', choices: ['Matching the lines and angles precisely', 'Adding your own creative details', 'Using a ruler for every line', 'Copying it as quickly as possible'], correctIndex: 0 },
  { id: 'q067', lobeTag: 'parietal', construct: 'Visuospatial-executive sequencing', prompt: 'What comes next in this sequence: 1, 2, 3, 4, 5, ?', choices: ['6', '7', '5', '4'], correctIndex: 0 },
  { id: 'q068', lobeTag: 'parietal', construct: 'Visuoperception (embedded figures)', adapted: true, prompt: 'In a puzzle where a pencil shape is hidden among cluttered lines, what makes it hard to find?', choices: ['Overlapping distractor lines breaking up its outline', 'The pencil being drawn in a bright color', 'The pencil being unusually large', 'The picture having too much empty space'], correctIndex: 0 },
  { id: 'q069', lobeTag: 'parietal', construct: 'Visuoperception (embedded figures)', adapted: true, prompt: 'In that same kind of puzzle, if asked to find a hidden cup, what should you look for?', choices: ['A cup-shaped outline within the clutter', 'A random straight line', 'The letter C', 'A price tag'], correctIndex: 0 },
  { id: 'q070', lobeTag: 'parietal', construct: 'Visual scanning / spatial attention', prompt: 'Which of these shapes is a square?', choices: ['A shape with 4 equal sides and 4 right angles', 'A shape with 3 sides', 'A round shape with no corners', 'A shape with 5 sides'], correctIndex: 0 },
  { id: 'q071', lobeTag: 'parietal', construct: 'Spatial-numeric reasoning', prompt: 'Which combination of $1, $5, and $10 bills adds up to exactly $14?', choices: ['One $10 + four $1 ($14)', 'One $10 + one $5 ($15)', 'Two $5 + one $1 ($11)', 'One $5 + four $1 ($9)'], correctIndex: 0 },
  { id: 'q072', lobeTag: 'parietal', construct: 'Orientation to place (concept)', adapted: true, prompt: "Knowing what floor or level of a building you're on is an example of:", choices: ['Orientation to place', 'Orientation to person', 'Numeracy', 'Language fluency'], correctIndex: 0 },
  { id: 'q073', lobeTag: 'parietal', construct: 'Orientation to place (concept)', adapted: true, prompt: "Recognizing the name of the building you're currently in tests:", choices: ['Orientation to place', 'Working memory', 'Visuospatial construction', 'Category fluency'], correctIndex: 0 },
  { id: 'q074', lobeTag: 'parietal', construct: 'Constructional praxis', adapted: true, prompt: 'When copying a staircase-shaped drawing, what matters most?', choices: ['Keeping each step the same size and evenly spaced', 'Using a different color for each step', 'Drawing it upside down', 'Adding extra steps not shown'], correctIndex: 0 },
  { id: 'q075', lobeTag: 'parietal', construct: 'Visuospatial judgment', prompt: 'If a horizontal line is 10 inches long, where is its exact center?', choices: ['5 inches from either end', '2 inches from the left end', 'At the very left end', 'At the very right end'], correctIndex: 0 },
  { id: 'q076', lobeTag: 'parietal', construct: 'Visuospatial size judgment', prompt: 'If a circle has a 2-inch diameter, a square has 4-inch sides, and a star fits inside a 1-inch box, which shape is largest?', choices: ['The square', 'The circle', 'The star', 'They are all the same size'], correctIndex: 0 },
  { id: 'q077', lobeTag: 'parietal', construct: 'Visuomotor / following instructions', prompt: "If you're asked to place an X inside a square, where should the X go?", choices: ["Inside the square's boundary", 'Outside the square', 'On top of a different shape', 'In a corner of the page, unrelated to the square'], correctIndex: 0 },
  { id: 'q078', lobeTag: 'parietal', construct: 'Visuoconstruction (clock drawing)', prompt: "On an analog clock showing 'twenty to four,' where would the minute hand point?", choices: ['Toward the 8', 'Toward the 4', 'Toward the 12', 'Toward the 2'], correctIndex: 0 },
  { id: 'q079', lobeTag: 'parietal', construct: 'Nonverbal problem solving', adapted: true, prompt: 'In matchstick puzzles, moving a stick to remove a triangle while keeping squares intact usually means:', choices: ['Repositioning a shared edge to remove the diagonal', 'Removing a matchstick entirely', 'Adding two new matchsticks', 'Bending a matchstick'], correctIndex: 0 },
  { id: 'q080', lobeTag: 'parietal', construct: 'Visuoconstruction (3D copy)', adapted: true, prompt: 'When copying a drawing of a rectangular box, which detail matters most?', choices: ['Keeping opposite edges parallel', 'The thickness of the pencil lines', 'Drawing it in under 5 seconds', 'Using a different shape entirely'], correctIndex: 0 },
  { id: 'q081', lobeTag: 'parietal', construct: 'Visuospatial-executive sequencing', prompt: 'What comes next in this alternating sequence: 1, A, 2, B, 3, C, 4, ?', choices: ['D', 'E', '5', 'C'], correctIndex: 0 },
  { id: 'q082', lobeTag: 'parietal', construct: 'Applied numeracy (change-making)', prompt: 'If an item costs 12 dollars and 75 cents, how much change would you get back from a 20-dollar bill?', choices: ['$7.25', '$7.75', '$6.25', '$8.25'], correctIndex: 0 },
  { id: 'q083', lobeTag: 'parietal', construct: 'Spatial orientation (concept)', adapted: true, prompt: 'Getting confused about your location, even somewhere familiar, points to a problem with:', choices: ['Spatial orientation', 'Hearing', 'Taste', 'Appetite'], correctIndex: 0 },
  { id: 'q084', lobeTag: 'parietal', construct: 'Mobility / wayfinding (concept)', adapted: true, prompt: 'Finding your way to a nearby familiar place relies mostly on:', choices: ['Spatial memory and wayfinding', 'Reading ability', 'Color vision', 'Sense of touch'], correctIndex: 0 },
  { id: 'q085', lobeTag: 'parietal', construct: 'Wayfinding (concept)', adapted: true, prompt: "Which of these is the best example of 'wayfinding'?", choices: ['Navigating to a familiar store without directions', 'Remembering a grocery list', 'Solving a math problem', 'Naming an object'], correctIndex: 0 },

  // ================= OCCIPITAL (15) =================
  { id: 'q086', lobeTag: 'occipital', construct: 'Visuoperception (embedded figures)', adapted: true, prompt: 'In a cluttered line drawing, what feature would help you spot a hidden pair of glasses?', choices: ['Two connected circular or oval shapes', 'A single straight line', 'A star shape', 'A triangular outline'], correctIndex: 0 },
  { id: 'q087', lobeTag: 'occipital', construct: 'Visuoperception (embedded figures)', adapted: true, prompt: 'What shape would help you spot a hidden umbrella in a cluttered drawing?', choices: ['A curved canopy shape above a straight handle', 'A perfect square', 'Two parallel lines only', 'A five-pointed star'], correctIndex: 0 },
  { id: 'q088', lobeTag: 'occipital', construct: 'Visual object recognition', prompt: 'Which animal is known for its very long neck?', choices: ['Giraffe', 'Zebra', 'Elephant', 'Rhinoceros'], correctIndex: 0 },
  { id: 'q089', lobeTag: 'occipital', construct: 'Visual object recognition', prompt: 'Which bird is known for being active at night and having large forward-facing eyes?', choices: ['Owl', 'Sparrow', 'Peacock', 'Flamingo'], correctIndex: 0 },
  { id: 'q090', lobeTag: 'occipital', construct: 'Visual scanning / selective attention', prompt: 'Look at this row of symbols: ★ ● ★ ▲ ★ ■. How many stars (★) are there?', choices: ['3', '2', '4', '1'], correctIndex: 0 },
  { id: 'q091', lobeTag: 'occipital', construct: 'Visual discrimination / selective attention', prompt: 'In this row of letters: P L P K P R, how many times does the letter P appear?', choices: ['3', '2', '4', '1'], correctIndex: 0 },
  { id: 'q092', lobeTag: 'occipital', construct: 'Visual perception (partial/degraded stimuli)', adapted: true, prompt: "If you're shown only the curved handle and spout of an object, it's most likely a:", choices: ['Teapot or kettle', 'Bicycle', 'Chair', 'Book'], correctIndex: 0 },
  { id: 'q093', lobeTag: 'occipital', construct: 'Visuoperception (embedded figures)', adapted: true, prompt: 'What feature would help you find a hidden watch in a cluttered drawing?', choices: ['A round face with a strap on either side', 'A single straight line', 'A tall rectangle', 'A five-pointed star'], correctIndex: 0 },
  { id: 'q094', lobeTag: 'occipital', construct: 'Visual object recognition', prompt: 'Which bird is known for its large, colorful tail feathers it can fan out?', choices: ['Peacock', 'Sparrow', 'Owl', 'Pigeon'], correctIndex: 0 },
  { id: 'q095', lobeTag: 'occipital', construct: 'Visual scanning / selective attention', prompt: 'In this row of digits: 3 8 5 8 2 8, how many times does the number 8 appear?', choices: ['3', '2', '4', '1'], correctIndex: 0 },
  { id: 'q096', lobeTag: 'occipital', construct: 'Visuospatial size/shape judgment', prompt: 'Which of these shapes has exactly three sides?', choices: ['Triangle', 'Square', 'Circle', 'Star'], correctIndex: 0 },
  { id: 'q097', lobeTag: 'occipital', construct: 'Visual object naming', prompt: 'What do you call a circular decoration made of leaves or flowers, often hung on a door?', choices: ['A wreath', 'A garland', 'A bouquet', 'A basket'], correctIndex: 0 },
  { id: 'q098', lobeTag: 'occipital', construct: 'Visual-detail recognition', adapted: true, prompt: 'Which of these is a facial feature, not a clothing item?', choices: ['Glasses resting on the nose', 'A scarf around the neck', 'A hat on the head', 'A jacket on the shoulders'], correctIndex: 0 },
  { id: 'q099', lobeTag: 'occipital', construct: 'Visual discrimination', prompt: 'Which of these is different from the other three: Circle, Circle, Circle, Square?', choices: ['Square', 'First Circle', 'Second Circle', 'Third Circle'], correctIndex: 0 },
  { id: 'q100', lobeTag: 'occipital', construct: 'Visual memory / perception hybrid', adapted: true, prompt: 'Imagine looking at a picture of a red apple for five seconds, then looking away. From memory, what color was the apple?', choices: ['Red', 'Blue', 'Green', 'Yellow'], correctIndex: 0 },
];

// Confirmed split, adapted for the real bank's 4-domain structure (no
// "general" bucket in the source spreadsheet, unlike the earlier
// placeholder): 2 questions guaranteed per lobe (8 total) + 2 more drawn
// from whatever's left across any lobe = 10.
export const QB_LOBE_TAGS = ['frontal', 'temporal', 'parietal', 'occipital'];
export const QB_SELECTION_RULES = { perLobeCount: 2, extraCount: 2 };
