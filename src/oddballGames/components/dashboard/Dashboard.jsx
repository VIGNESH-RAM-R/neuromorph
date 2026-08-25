import { useMemo, useState } from 'react';
import { loadAssessments as loadOddballAssessments } from '../../utils/oddballStorage';
import { loadAssessments as loadSequenceAssessments } from '../../utils/sequenceStorage';
import { loadAssessments as loadPointClickAssessments } from '../../utils/pointClickStorage';
import { loadAssessments as loadImagePairsAssessments } from '../../utils/imagePairsStorage';
import { loadAssessments as loadWhackMoleAssessments } from '../../utils/whackMoleStorage';
import { loadAssessments as loadSpotDifferenceAssessments } from '../../utils/spotDifferenceStorage';
import DashboardHeader from './DashboardHeader';
import SummaryCard from './SummaryCard';
import DomainCard from './DomainCard';
import DomainDetail from './DomainDetail';
import dashboardBackground from '../../assets/circuit-network-bg.webp';
import brainChipCutout from '../../assets/brain-chip-cutout.webp';
import iconClipboard from '../../assets/icons/icon-clipboard.webp';
import iconCalendar from '../../assets/icons/icon-calendar.webp';
import iconMemoryBrain from '../../assets/icons/icon-memory-brain.webp';
import iconAttentionEye from '../../assets/icons/icon-attention-eye.webp';
import iconReactionSpeedometer from '../../assets/icons/icon-reaction-speedometer.webp';
import badgeMemory from '../../assets/badges/badge-memory.webp';
import badgeAttention from '../../assets/badges/badge-attention.webp';
import badgeReaction from '../../assets/badges/badge-reaction.webp';

/**
 * Dashboard domains are organized the way the assessment battery itself is
 * organized — by cognitive domain (Memory, Attention, Reaction) — with
 * exactly two game slots per domain. A slot with no `launchKey` is not
 * built yet and renders as a "Coming soon" placeholder instead of a working
 * launch button.
 *
 * The dashboard itself only shows the 3 domain cards. Opening one reveals
 * that domain's own screen, which is where its 2 games actually appear.
 */
const DOMAIN_GROUPS = [
  {
    key: 'memory',
    name: 'Memory',
    description: 'Measures working memory, recall, and visual memory.',
    accent: 'memory',
    icon: <img src={badgeMemory} alt="" className="dash-domain-icon-img" />,
    illustration: <img src={iconMemoryBrain} alt="" className="dash-domain-illustration-img" />,
    games: [
      {
        key: 'sequence',
        module: 'Sequence Memory',
        description:
          'Measures working memory and sequential recall through a watch-remember-repeat color sequence task.',
        available: true,
        launchKey: 'sequence',
      },
      {
        key: 'imagepairs',
        module: 'Image Pairs',
        description:
          'Measures visual recognition, spatial memory, short-term visual memory, attention and response efficiency through a find-the-matching-pair card task.',
        available: true,
        launchKey: 'imagepairs',
      },
    ],
  },
  {
    key: 'attention',
    name: 'Attention',
    description: 'Measures sustained and selective visual attention.',
    accent: 'attention',
    icon: <img src={badgeAttention} alt="" className="dash-domain-icon-img" />,
    illustration: <img src={iconAttentionEye} alt="" className="dash-domain-illustration-img" />,
    games: [
      {
        key: 'oddball',
        module: 'Visual Oddball',
        description:
          'Measures sustained and selective attention, target detection, processing speed and response inhibition.',
        available: true,
        launchKey: 'oddball',
      },
      {
        key: 'spot-the-difference',
        module: 'Spot the Difference',
        description:
          'Measures visual attention and detail discrimination by finding every difference between two nearly-identical pictures, across three levels of difficulty.',
        available: true,
        launchKey: 'spotdifference',
      },
    ],
  },
  {
    key: 'reaction',
    name: 'Reaction',
    description: 'Measures response speed and reaction-time consistency.',
    accent: 'reaction',
    icon: <img src={badgeReaction} alt="" className="dash-domain-icon-img" />,
    illustration: <img src={iconReactionSpeedometer} alt="" className="dash-domain-illustration-img" />,
    games: [
      {
        key: 'point-click',
        module: 'Point & Click',
        description:
          'Measures visual search, target detection, and response speed by finding and tapping a changing target object.',
        available: true,
        launchKey: 'pointclick',
      },
      {
        key: 'whackmole',
        module: 'Whack the Mole',
        description:
          'Measures visual attention, sustained attention, simple reaction speed, response accuracy and reaction-time consistency through a one-target-at-a-time detection task.',
        available: true,
        launchKey: 'whackmole',
      },
    ],
  },
];

/** Temporary placeholder until the main NEUROMORPH application's real
 * authentication/account system is wired in — see the `user` prop below. */
const DEFAULT_USER = { name: 'Guest' };

export default function Dashboard({
  user = DEFAULT_USER,
  initialDomain = null,
  onLaunchOddball,
  onLaunchSequenceMemory,
  onLaunchPointClick,
  onLaunchImagePairs,
  onLaunchWhackMole,
  onLaunchSpotDifference,
}) {
  const [selectedDomainKey, setSelectedDomainKey] = useState(initialDomain);
  const selectedDomain = DOMAIN_GROUPS.find((group) => group.key === selectedDomainKey) || null;

  const firstName = (user?.name || 'there').trim().split(/\s+/)[0];

  const oddballAssessments = useMemo(() => loadOddballAssessments(), []);
  const sequenceAssessments = useMemo(() => loadSequenceAssessments(), []);
  const pointClickAssessments = useMemo(() => loadPointClickAssessments(), []);
  const imagePairsAssessments = useMemo(() => loadImagePairsAssessments(), []);
  const whackMoleAssessments = useMemo(() => loadWhackMoleAssessments(), []);
  const spotDifferenceAssessments = useMemo(() => loadSpotDifferenceAssessments(), []);

  const totalCompleted =
    oddballAssessments.length +
    sequenceAssessments.length +
    pointClickAssessments.length +
    imagePairsAssessments.length +
    whackMoleAssessments.length +
    spotDifferenceAssessments.length;
  const lastTimestamp = useMemo(() => {
    const timestamps = [
      ...oddballAssessments,
      ...sequenceAssessments,
      ...pointClickAssessments,
      ...imagePairsAssessments,
      ...whackMoleAssessments,
      ...spotDifferenceAssessments,
    ].map((a) => a.timestamp);
    return timestamps.length ? Math.max(...timestamps) : null;
  }, [
    oddballAssessments,
    sequenceAssessments,
    pointClickAssessments,
    imagePairsAssessments,
    whackMoleAssessments,
    spotDifferenceAssessments,
  ]);

  const launchHandlers = {
    oddball: onLaunchOddball,
    sequence: onLaunchSequenceMemory,
    pointclick: onLaunchPointClick,
    imagepairs: onLaunchImagePairs,
    whackmole: onLaunchWhackMole,
    spotdifference: onLaunchSpotDifference,
  };

  return (
    <div className="dashboard dash-dark" style={{ backgroundImage: `url(${dashboardBackground})` }}>
      {/* Fixed dark scrim over the full-bleed background image above, so
          text and cards stay readable no matter which part of the page is
          scrolled into view. */}
      <div className="dash-bg-overlay" aria-hidden="true" />

      <DashboardHeader user={user} />

      <main className="dash-main">
        <section className="dash-hero">
          <img src={brainChipCutout} alt="" className="dash-hero-visual" aria-hidden="true" />

          <div className="dash-hero-content">
            <p className="dash-greeting">Welcome back, {firstName}! &#128075;</p>
            <h1 className="dash-title">Cognitive Dashboard</h1>
            <p className="dash-lead">
              Complete short digital assessments across cognitive domains to build a longitudinal
              profile over time.
            </p>

            <div className="dash-summary-cards">
              <SummaryCard
                icon={<img src={iconClipboard} alt="" className="dash-summary-icon-img" />}
                label="COMPLETED ASSESSMENTS"
                value={totalCompleted}
                hint="Keep going!"
              />
              <SummaryCard
                icon={<img src={iconCalendar} alt="" className="dash-summary-icon-img" />}
                label="LAST ASSESSMENT"
                value={lastTimestamp ? new Date(lastTimestamp).toLocaleDateString() : '—'}
                hint="Keep your streak alive!"
              />
            </div>
          </div>
        </section>

        {!selectedDomain && (
          <section className="dash-domains">
            <div className="dash-domain-grid">
              {DOMAIN_GROUPS.map((group) => (
                <DomainCard
                  key={group.key}
                  accent={group.accent}
                  icon={group.icon}
                  illustration={group.illustration}
                  name={group.name}
                  description={group.description}
                  onOpen={() => setSelectedDomainKey(group.key)}
                />
              ))}
            </div>
          </section>
        )}

        {selectedDomain && (
          <DomainDetail
            domain={selectedDomain}
            launchHandlers={launchHandlers}
            onBack={() => setSelectedDomainKey(null)}
          />
        )}
      </main>
    </div>
  );
}
