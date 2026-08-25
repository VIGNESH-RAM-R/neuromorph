/**
 * Spot the Difference — configuration
 *
 * Ported verbatim from the updated source prototype
 * (spot_the_difference.html, replacing the earlier
 * spot_the_difference_fixed.html this module was originally built from):
 * the LEVELS array below — every difference's pixel coordinate on the left
 * picture (x, y), its separate pixel coordinate on the right/modified
 * picture (bx, by), each difference's click-tolerance radius (r), every
 * picture's natural width/height, and every level's star rating — is
 * copied verbatim from that prototype's logic. These values are the
 * puzzle's actual answer key (what counts as "finding" a difference), so
 * only the *presentation* of this module was redesigned, never this data.
 *
 * Each level now has 5 rounds (picture pairs) instead of 2, and — this is
 * the important part — every difference now carries its own coordinate
 * *per picture* (x/y for the left "base" picture, bx/by for the right
 * "modified" picture) rather than one (x, y) pair reused for both. The two
 * pictures in a pair are independently drawn scenes, not one photo with a
 * single edit, so the exact same feature can land at a slightly different
 * pixel position in each picture. Reusing the left picture's coordinate
 * when hit-testing a tap on the right picture (what the previous data
 * shape forced) is what caused correct taps on the right/modified picture
 * to be misjudged as misses. See engines/spotDifferenceEngine.js and
 * hooks/useSpotDifferenceEngine.js for the corresponding hit-test fix.
 *
 * Domain: Visual Attention (selective/sustained visual search, detail
 * discrimination). Untimed, no-penalty, relaxed-pacing task by design — a
 * deliberate contrast to the timed CPT-style modules elsewhere in the app.
 */

import easy1Base from '../assets/spotdifference/easy1_base.png';
import easy1Mod from '../assets/spotdifference/easy1_mod.png';
import easy2Base from '../assets/spotdifference/easy2_base.png';
import easy2Mod from '../assets/spotdifference/easy2_mod.png';
import easy3Base from '../assets/spotdifference/easy3_base.png';
import easy3Mod from '../assets/spotdifference/easy3_mod.png';
import easy4Base from '../assets/spotdifference/easy4_base.png';
import easy4Mod from '../assets/spotdifference/easy4_mod.png';
import easy5Base from '../assets/spotdifference/easy5_base.png';
import easy5Mod from '../assets/spotdifference/easy5_mod.png';
import medium1Base from '../assets/spotdifference/medium1_base.png';
import medium1Mod from '../assets/spotdifference/medium1_mod.png';
import medium2Base from '../assets/spotdifference/medium2_base.png';
import medium2Mod from '../assets/spotdifference/medium2_mod.png';
import medium3Base from '../assets/spotdifference/medium3_base.png';
import medium3Mod from '../assets/spotdifference/medium3_mod.png';
import medium4Base from '../assets/spotdifference/medium4_base.png';
import medium4Mod from '../assets/spotdifference/medium4_mod.png';
import medium5Base from '../assets/spotdifference/medium5_base.png';
import medium5Mod from '../assets/spotdifference/medium5_mod.png';
import hard1Base from '../assets/spotdifference/hard1_base.png';
import hard1Mod from '../assets/spotdifference/hard1_mod.png';
import hard2Base from '../assets/spotdifference/hard2_base.png';
import hard2Mod from '../assets/spotdifference/hard2_mod.png';
import hard3Base from '../assets/spotdifference/hard3_base.png';
import hard3Mod from '../assets/spotdifference/hard3_mod.png';
import hard4Base from '../assets/spotdifference/hard4_base.png';
import hard4Mod from '../assets/spotdifference/hard4_mod.png';
import hard5Base from '../assets/spotdifference/hard5_base.png';
import hard5Mod from '../assets/spotdifference/hard5_mod.png';

export const SPOT_DIFFERENCE_VERSION = 'spot-difference-v1.1';
export const SPOT_DIFFERENCE_PROTOCOL_VERSION = 'SPOT_DIFFERENCE_V1';
export const SPOT_DIFFERENCE_STORAGE_KEY = 'neuromorph_spot_difference_assessments';

/** Maps each round's `img` key (from LEVELS below) to its imported
 * base/modified image pair — kept separate from LEVELS so the coordinate
 * data above reads identically to the source prototype. */
export const SPOT_DIFFERENCE_IMAGES = {
  easy1: { base: easy1Base, mod: easy1Mod },
  easy2: { base: easy2Base, mod: easy2Mod },
  easy3: { base: easy3Base, mod: easy3Mod },
  easy4: { base: easy4Base, mod: easy4Mod },
  easy5: { base: easy5Base, mod: easy5Mod },
  medium1: { base: medium1Base, mod: medium1Mod },
  medium2: { base: medium2Base, mod: medium2Mod },
  medium3: { base: medium3Base, mod: medium3Mod },
  medium4: { base: medium4Base, mod: medium4Mod },
  medium5: { base: medium5Base, mod: medium5Mod },
  hard1: { base: hard1Base, mod: hard1Mod },
  hard2: { base: hard2Base, mod: hard2Mod },
  hard3: { base: hard3Base, mod: hard3Mod },
  hard4: { base: hard4Base, mod: hard4Mod },
  hard5: { base: hard5Base, mod: hard5Mod },
};

/** Verbatim from the updated prototype's `LEVELS` array. */
export const SPOT_DIFFERENCE_LEVELS = [
  {
    id: 'easy',
    label: 'Easy',
    badge: 'Level 1 of 3',
    stars: 1,
    tagline: 'Big, clear differences. A gentle place to start.',
    intro:
      'Look at the two pictures side by side. A few things about them are not the same — a color, a small object, or a little detail. Take your time and tap each spot where they differ.',
    hint:
      'Look for things like: a color that changed, a small accessory that disappeared, something new that was added, or a hand or pose that changed.',
    rounds: [
      {
        img: 'easy1',
        w: 436,
        h: 662,
        diffs: [
          { x: 355, y: 178, r: 32, bx: 341, by: 180 },
          { x: 67, y: 432, r: 34, bx: 68, by: 433 },
          { x: 208, y: 262, r: 34, bx: 200, by: 264 },
          { x: 108, y: 584, r: 42, bx: 113, by: 583 },
        ],
      },
      {
        img: 'easy2',
        w: 695,
        h: 372,
        diffs: [
          { x: 345, y: 161, r: 26, bx: 345, by: 157 },
          { x: 370, y: 188, r: 24, bx: 370, by: 186 },
          { x: 400, y: 235, r: 30, bx: 399, by: 233 },
        ],
      },
      {
        img: 'easy3',
        w: 540,
        h: 234,
        diffs: [
          { x: 392, y: 36, r: 40, bx: 392, by: 37 },
          { x: 164, y: 107, r: 32, bx: 164, by: 106 },
          { x: 254, y: 144, r: 36, bx: 254, by: 143 },
        ],
      },
      {
        img: 'easy4',
        w: 640,
        h: 338,
        diffs: [
          { x: 150, y: 211, r: 75, bx: 150, by: 212 },
          { x: 410, y: 235, r: 55, bx: 410, by: 237 },
          { x: 566, y: 161, r: 72, bx: 566, by: 162 },
        ],
      },
      {
        img: 'easy5',
        w: 388,
        h: 385,
        diffs: [
          { x: 57, y: 52, r: 30, bx: 57, by: 53 },
          { x: 241, y: 63, r: 16, bx: 241, by: 63 },
          { x: 328, y: 140, r: 28, bx: 328, by: 140 },
          { x: 35, y: 225, r: 24, bx: 35, by: 225 },
        ],
      },
    ],
  },
  {
    id: 'medium',
    label: 'Medium',
    badge: 'Level 2 of 3',
    stars: 2,
    tagline: 'A few more differences, and a little more detail.',
    intro:
      'Nicely done! This next picture has a few more differences to find. They may be a bit smaller or less obvious than before — look closely at clothing, numbers, and small objects.',
    hint:
      'Look for things like: a color that changed, a number that changed, something added or missing, a different count of something, or something facing a different direction.',
    rounds: [
      {
        img: 'medium1',
        w: 780,
        h: 552,
        diffs: [
          { x: 203, y: 32, r: 28, bx: 204, by: 22 },
          { x: 338, y: 245, r: 28, bx: 338, by: 253 },
          { x: 435, y: 345, r: 35, bx: 435, by: 362 },
          { x: 595, y: 210, r: 26, bx: 595, by: 218 },
          { x: 195, y: 395, r: 35, bx: 194, by: 415 },
        ],
      },
      {
        img: 'medium2',
        w: 675,
        h: 441,
        diffs: [
          { x: 329, y: 128, r: 41, bx: 329, by: 129 },
          { x: 41, y: 295, r: 45, bx: 41, by: 296 },
          { x: 625, y: 188, r: 38, bx: 625, by: 189 },
          { x: 446, y: 256, r: 45, bx: 446, by: 257 },
          { x: 65, y: 388, r: 26, bx: 65, by: 389 },
        ],
      },
      {
        img: 'medium3',
        w: 700,
        h: 538,
        diffs: [
          { x: 237, y: 110, r: 59, bx: 237, by: 108 },
          { x: 116, y: 328, r: 49, bx: 116, by: 326 },
          { x: 451, y: 231, r: 36, bx: 451, by: 230 },
          { x: 454, y: 389, r: 45, bx: 454, by: 388 },
          { x: 635, y: 49, r: 47, bx: 636, by: 47 },
          { x: 518, y: 501, r: 53, bx: 518, by: 500 },
          { x: 454, y: 147, r: 30, bx: 456, by: 159 },
          { x: 376, y: 501, r: 42, bx: 376, by: 501 },
        ],
      },
      {
        img: 'medium4',
        w: 487,
        h: 1139,
        diffs: [
          { x: 409, y: 67, r: 82, bx: 409, by: 68 },
          { x: 323, y: 278, r: 49, bx: 323, by: 278 },
          { x: 164, y: 470, r: 60, bx: 164, by: 470 },
          { x: 230, y: 730, r: 55, bx: 230, by: 730 },
          { x: 321, y: 496, r: 57, bx: 321, by: 496 },
        ],
      },
      {
        img: 'medium5',
        w: 410,
        h: 271,
        diffs: [
          { x: 67, y: 85, r: 20, bx: 65, by: 84 },
          { x: 100, y: 143, r: 26, bx: 100, by: 141 },
          { x: 265, y: 205, r: 20, bx: 248, by: 204 },
          { x: 25, y: 245, r: 20, bx: 23, by: 248 },
          { x: 288, y: 245, r: 20, bx: 288, by: 244 },
        ],
      },
    ],
  },
  {
    id: 'hard',
    label: 'Hard',
    badge: 'Level 3 of 3',
    stars: 3,
    tagline: 'The most detailed pictures, for a bigger challenge.',
    intro:
      'This is the most detailed level. Some differences are quite small, so look carefully at every part of the picture — furniture, animals, and little details in the background.',
    hint:
      'Look for things like: a color that changed, something turned on or gave off a visible effect, an object that appears or disappears, something facing a different direction, something that moved position, or a different count or size of something.',
    rounds: [
      {
        img: 'hard1',
        w: 850,
        h: 538,
        diffs: [
          { x: 105, y: 44, r: 48, bx: 105, by: 51 },
          { x: 420, y: 71, r: 60, bx: 420, by: 83 },
          { x: 184, y: 154, r: 56, bx: 184, by: 181 },
          { x: 334, y: 14, r: 42, bx: 334, by: 17 },
          { x: 399, y: 235, r: 57, bx: 399, by: 280 },
          { x: 428, y: 412, r: 44, bx: 428, by: 486 },
          { x: 646, y: 44, r: 50, bx: 646, by: 56 },
          { x: 794, y: 33, r: 43, bx: 794, by: 47 },
          { x: 85, y: 220, r: 43, bx: 85, by: 254 },
          { x: 200, y: 373, r: 59, bx: 200, by: 440 },
          { x: 724, y: 418, r: 47, bx: 724, by: 485 },
          { x: 680, y: 182, r: 47, bx: 680, by: 216 },
          { x: 285, y: 166, r: 20, bx: 289, by: 195 },
        ],
      },
      {
        img: 'hard2',
        w: 560,
        h: 490,
        diffs: [
          { x: 478, y: 60, r: 46, bx: 477, by: 49 },
          { x: 45, y: 215, r: 55, bx: 44, by: 201 },
          { x: 395, y: 155, r: 28, bx: 395, by: 143 },
          { x: 120, y: 108, r: 48, bx: 119, by: 94 },
          { x: 375, y: 190, r: 42, bx: 375, by: 178 },
          { x: 240, y: 172, r: 40, bx: 240, by: 159 },
          { x: 320, y: 320, r: 52, bx: 320, by: 308 },
          { x: 228, y: 412, r: 48, bx: 228, by: 400 },
          { x: 472, y: 325, r: 40, bx: 472, by: 313 },
          { x: 500, y: 445, r: 40, bx: 500, by: 433 },
          { x: 280, y: 78, r: 21, bx: 270, by: 64 },
          { x: 130, y: 325, r: 20, bx: 130, by: 310 },
        ],
      },
      {
        img: 'hard3',
        w: 1006,
        h: 637,
        diffs: [
          { x: 274, y: 258, r: 38, bx: 269, by: 253 },
          { x: 36, y: 114, r: 43, bx: 33, by: 111 },
          { x: 122, y: 152, r: 46, bx: 117, by: 159 },
          { x: 495, y: 167, r: 46, bx: 500, by: 144 },
          { x: 691, y: 81, r: 56, bx: 688, by: 81 },
          { x: 445, y: 346, r: 38, bx: 447, by: 341 },
          { x: 554, y: 222, r: 46, bx: 554, by: 215 },
          { x: 533, y: 346, r: 46, bx: 536, by: 326 },
          { x: 856, y: 76, r: 46, bx: 856, by: 73 },
          { x: 945, y: 68, r: 35, bx: 945, by: 48 },
          { x: 297, y: 336, r: 38, bx: 297, by: 329 },
          { x: 950, y: 278, r: 73, bx: 953, by: 265 },
          { x: 211, y: 508, r: 66, bx: 216, by: 473 },
          { x: 511, y: 518, r: 79, bx: 508, by: 488 },
          { x: 716, y: 503, r: 68, bx: 701, by: 475 },
          { x: 871, y: 508, r: 68, bx: 866, by: 483 },
          { x: 727, y: 339, r: 73, bx: 721, by: 301 },
          { x: 114, y: 382, r: 46, bx: 109, by: 354 },
          { x: 79, y: 442, r: 46, bx: 79, by: 407 },
        ],
      },
      {
        img: 'hard4',
        w: 574,
        h: 383,
        diffs: [
          { x: 43, y: 67, r: 16, bx: 40, by: 70 },
          { x: 85, y: 76, r: 15, bx: 87, by: 76 },
          { x: 122, y: 63, r: 16, bx: 119, by: 68 },
          { x: 194, y: 65, r: 19, bx: 184, by: 80 },
          { x: 82, y: 139, r: 22, bx: 93, by: 124 },
          { x: 27, y: 200, r: 20, bx: 26, by: 202 },
          { x: 143, y: 214, r: 24, bx: 138, by: 214 },
          { x: 284, y: 153, r: 13, bx: 289, by: 156 },
          { x: 536, y: 47, r: 21, bx: 537, by: 43 },
          { x: 532, y: 102, r: 15, bx: 537, by: 108 },
          { x: 535, y: 154, r: 12, bx: 533, by: 154 },
          { x: 544, y: 217, r: 17, bx: 542, by: 210 },
          { x: 524, y: 288, r: 31, bx: 524, by: 295 },
          { x: 413, y: 185, r: 15, bx: 414, by: 182 },
          { x: 461, y: 176, r: 24, bx: 455, by: 191 },
          { x: 407, y: 232, r: 27, bx: 406, by: 249 },
          { x: 431, y: 344, r: 22, bx: 427, by: 351 },
        ],
      },
      {
        img: 'hard5',
        w: 573,
        h: 347,
        diffs: [
          { x: 46, y: 65, r: 16, bx: 48, by: 56 },
          { x: 220, y: 35, r: 17, bx: 222, by: 35 },
          { x: 222, y: 105, r: 26, bx: 226, by: 110 },
          { x: 283, y: 85, r: 17, bx: 283, by: 100 },
          { x: 251, y: 178, r: 17, bx: 238, by: 161 },
          { x: 362, y: 155, r: 12, bx: 362, by: 145 },
          { x: 395, y: 155, r: 12, bx: 390, by: 143 },
          { x: 165, y: 192, r: 14, bx: 173, by: 186 },
          { x: 545, y: 80, r: 18, bx: 550, by: 65 },
          { x: 544, y: 262, r: 18, bx: 545, by: 236 },
          { x: 339, y: 276, r: 22, bx: 356, by: 263 },
          { x: 62, y: 293, r: 25, bx: 59, by: 296 },
        ],
      },
    ],
  },
];

/** Total number of levels a full session must complete to produce a
 * "COMPLETED" (rather than partial) stored assessment. */
export const SPOT_DIFFERENCE_TOTAL_LEVELS = SPOT_DIFFERENCE_LEVELS.length;
