import React, { useState } from 'react';
import { 
  MapPin, 
  Layers, 
  Droplet, 
  Calendar, 
  Image as ImageIcon,
  CheckCircle2,
  X,
  Phone,
  ShieldCheck,
  User,
  Mail,
  Loader2,
  Search,
  Shield,
  Info,
  Edit3,
  Upload,
  ChevronRight,
  Check,
  AlertCircle,
  Sparkles,
  Database,
  Wrench,
  Video,
  Menu,
  ChevronDown,
  Link,
  Download
} from 'lucide-react';
import { SUBURBS_DATA, GENERAL_REVIEWS } from './data';
import { ALL_SUBURBS_LIST, generateSuburbData } from './allSuburbs';
import HomeCommandCenter from './components/HomeCommandCenter';
import MediaAdmin from './components/MediaAdmin';
import AuthorityBentoCards from './components/AuthorityBentoCards';
import mediaOverridesPreset from './media_overrides.json';
import { getSuburbNarrative } from './masterSuburbNarratives';
import { db, auth, logInWithGoogle, handleFirestoreError, OperationType } from './firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Static helper mappings for deep tech metrics
const getSoilData = (suburbName: string) => {
  const entry = ALL_SUBURBS_LIST.find(s => s.name.toLowerCase() === suburbName.toLowerCase());
  if (entry) {
    switch (entry.sector) {
      case 'spearwood': return { name: 'Spearwood Caprock', type: '(Yellow Sands over Limestone)' };
      case 'quindalup': return { name: 'Quindalup Dunes', type: '(Calcareous Sands)' };
      case 'guildford': return { name: 'Guildford Alluvial Plain', type: '(Dense Swelling Clays)' };
      case 'scarp': return { name: 'Darling Scarp Outcrops', type: '(Granite & Laterite Rock)' };
      case 'bassendean':
      default:
        return { name: 'Bassendean Matrix', type: '(Acidic Sandy Clay)' };
    }
  }
  return { name: 'Western Plain Beds', type: '(Coastal Sandy Aquifer)' };
};

const getPostcode = (suburbName: string) => {
  const found = ALL_SUBURBS_LIST.find(s => s.name.toLowerCase() === suburbName.toLowerCase());
  if (found) return found.postcode;
  
  switch (suburbName) {
    case 'Rockingham': return '6168';
    case 'Baldivis': return '6171';
    case 'Piara Waters': return '6112';
    case 'Canning Vale': return '6155';
    case 'Wellard': return '6170';
    case 'Bertram': return '6167';
    case 'Atwell': return '6164';
    case 'Aubin Grove': return '6164';
    case 'Success': return '6164';
    case 'Beeliar': return '6164';
    case 'Coogee': return '6166';
    case 'Cockburn Central': return '6164';
    case 'Hammond Park': return '6164';
    case 'Harrisdale': return '6112';
    case 'Southern River': return '6110';
    case 'Armadale': return '6112';
    case 'Kelmscott': return '6111';
    case 'Kwinana': return '6167';
    case 'Spearwood': return '6163';
    case 'Byford': return '6122';
    default: return '6168';
  }
};

const getDepthRange = (suburbName: string) => {
  const entry = ALL_SUBURBS_LIST.find(s => s.name.toLowerCase() === suburbName.toLowerCase());
  if (entry) {
    switch (entry.sector) {
      case 'quindalup': return { text: '2m - 12m', min: 2, max: 12 };
      case 'scarp': return { text: '30m - 60m', min: 30, max: 60 };
      case 'guildford': return { text: '12m - 24m', min: 12, max: 24 };
      case 'spearwood': return { text: '20m - 35m', min: 20, max: 35 };
      case 'bassendean':
      default:
        return { text: '15m - 30m', min: 15, max: 30 };
    }
  }
  
  switch (suburbName) {
    case 'Rockingham': return { text: '2m - 5m', min: 2, max: 5 };
    case 'Baldivis': return { text: '18m - 32m', min: 18, max: 32 };
    case 'Piara Waters': return { text: '14m - 24m', min: 14, max: 24 };
    case 'Canning Vale': return { text: '16m - 28m', min: 16, max: 28 };
    case 'Wellard': return { text: '18m - 35m', min: 18, max: 35 };
    case 'Bertram': return { text: '15m - 28m', min: 15, max: 28 };
    case 'Atwell': return { text: '12m - 22m', min: 12, max: 22 };
    case 'Aubin Grove': return { text: '14m - 26m', min: 14, max: 26 };
    case 'Success': return { text: '15m - 27m', min: 15, max: 27 };
    case 'Beeliar': return { text: '22m - 40m', min: 22, max: 40 };
    case 'Coogee': return { text: '8m - 18m', min: 8, max: 18 };
    case 'Cockburn Central': return { text: '16m - 30m', min: 16, max: 30 };
    case 'Hammond Park': return { text: '18m - 34m', min: 18, max: 34 };
    case 'Harrisdale': return { text: '15m - 26m', min: 15, max: 26 };
    case 'Southern River': return { text: '12m - 25m', min: 12, max: 25 };
    case 'Armadale': return { text: '30m - 50m', min: 30, max: 50 };
    case 'Kelmscott': return { text: '25m - 45m', min: 25, max: 45 };
    case 'Kwinana': return { text: '18m - 30m', min: 18, max: 30 };
    case 'Spearwood': return { text: '20m - 38m', min: 20, max: 38 };
    case 'Byford': return { text: '28m - 50m', min: 28, max: 50 };
    default: return { text: '2m - 5m', min: 2, max: 5 };
  }
};

const getSoilExplanation = (suburbName: string) => {
  switch (suburbName) {
    case 'Rockingham':
      return 'Rockingham features Quindalup Dunes. These sands are excellent for high-yield drilling but require specialized PVC casing to prevent saltwater seepage.';
    case 'Baldivis':
      return 'Baldivis hosts Spearwood and Bassendean Sands over clay. These formations yield plentiful water but contain variable clay pockets requiring premium slotted screen placement to prevent silting.';
    case 'Piara Waters':
      return 'Piara Waters sits on Southern River Sands over dense clay. These ground profiles present severe iron staining risk and hard coffee rock obstructions that require heavy-duty rotary-hammer drilling.';
    case 'Canning Vale':
      return 'Canning Vale lies in Bassendean Sands with thick peaty clay bands. The resulting aquifer water is highly acidic with heavy dissolved iron, needing corrosion-resistant thermoplastic pumps and specialized filters.';
    case 'Wellard':
      return 'Wellard features Bassendean Sands flanked by deep wetland sediment beds. Water in this corridor has high levels of dissolved organic matter, often resulting in acidic pH and rotten-egg organic odors.';
    case 'Bertram':
      return 'Bertram is dominated by the deep, free-draining Bassendean Sands. Tapping the aquifer here yields excellent water volume but is highly prone to staining limestone walls and paths if left untreated.';
    case 'Atwell':
      return 'Atwell sits directly over high shallow water tables nested inside Bassendean Sands. This promotes fast, high-volume irrigation drawing, but carries heavy risk of jelly-like iron bacteria blockages.';
    case 'Aubin Grove':
      return 'Aubin Grove features fine-grained Bassendean sand layers bordering local wetlands. Bores must be carefully positioned with slow-running submersibles to avoid drawing up fine sediment and organic silt.';
    case 'Success':
      return 'Success sits on Bassendean coastal sands with rich water-bearing properties. Tapping the aquifer is quick and easy, though it is prone to local iron oxides and minor sulfurous reactions if screens are placed too deep.';
    case 'Beeliar':
      return 'Beeliar features yellow Spearwood sands underlaid by rocky limestone deposits. This stratum offers high, reliable water yields but exhibits elevated alkalinity which can cause calcium nozzle scaling.';
    case 'Coogee':
      return 'Coogee sits on white coastal sands directly over hollowed limestone caves. High salinity risk means bores must remain shallow and low-draught to selectively skim sweet freshwater from the saltwater wedge.';
    case 'Cockburn Central':
      return 'Cockburn Central features flat sandy coastal plains of the Bassendean matrix. The aquifer here suffers from poor phosphorus retention and high natural acidity, necessitating stainless-steel-trimmed pumps.';
    case 'Hammond Park':
      return 'Hammond Park lies on whitish grey Bassendean sands over deep clay blankets. Tapping the groundwater is straightforward, but corrosive acidic water can compromise standard brass fittings quite quickly.';
    case 'Harrisdale':
      return 'Harrisdale consists of Bassendean sands transitioning into Southern River swamp sediments. This promotes heavy iron staining on fences and paths, combined with mild organic humic coloration.';
    case 'Southern River':
      return 'Southern River comprises coarse sands overlapping Guildford clay belts. Flow rates can vary widely depending on whether the bore penetrates the clay, requiring precise acoustic zone profiling.';
    case 'Armadale':
      return 'Armadale rests on the Darling Scarp outcrop of granite and hard laterite clay. Drilling is incredibly tough, demanding diamond-head rotary rigs to tap narrow, high-purity fractured rock fissures.';
    case 'Kelmscott':
      return 'Kelmscott is positioned on Darling Scarp slopes underlaid by dense plastic Guildford clay. This highly variable stratum has patchy water pockets that require screen backwashing to clear fine sediment.';
    case 'Kwinana':
      return 'Kwinana contains transitioning Spearwood yellow sands and coarse Bassendean matrices. This yields reliable, high-volume water, but contains hard calcium carbonate, demanding clean nozzles to avoid strain.';
    case 'Spearwood':
      return 'Spearwood rests on yellow, free-draining sands backed by heavy limestone caprock. This delivers outstanding, secure water yields that are virtually stain-free, though scaling hard carbonate is present.';
    case 'Byford':
      return 'Byford sits on heavy Guildford clay belts and fractured granite Scarp edges. Hard swelling clays can pinch standard casing, which is why schedule 12 thick-wall columns are used to preserve operational lifecycle.';
    default:
      return 'This region features coastal sandy aquifers. It is highly suitable for premium bore installation and garden reticulation feed with standard filtration layers.';
  }
};

const getLocalNarrative = (suburbName: string) => {
  switch (suburbName) {
    case 'Rockingham':
      return 'Homeowners in Postcode 6168 choose Perth BoreWater to bypass the unique salinity and limestone anomalies around the Shoalwater and Penguin Island corridors. Our specialized Class 1 Class-Licensed drillers install thick-walled, salt-tolerant PVC casing systems designed specifically to avoid seawater intrusion at the 2m-5m shallow water table interface. By opting for our premium coastal rig set, local residences secure lifetime iron-stain protection and a highly stable flow rate for their lawns and garden borders.';
    case 'Baldivis':
      return 'Baldivis property owners face highly variable underground conditions ranging from deep yellow sand to dense peat bands that clog off-the-shelf pump filters. Our engineering team utilizes sonic strata testing to pinpoint the optimal high-yielding water pocket between 18m and 32m depth. Tapping this precise level avoids the heavy silting problems common in standard builds, providing a lifetime of reliable garden irrigation.';
    case 'Piara Waters':
      return 'Piara Waters presents severe drilling challenges due to subterranean iron oxide concentrations and tough layers of underlying coffee rock. Standard bores in this zone frequently suffer from quick screen clogging and severe orange stains on limestone paving. By deploying high-torque percussion rigs and our restorer-grade chemical neutralizing casings, we ensure your reticulation runs clear and entirely rust-free.';
    case 'Canning Vale':
      return 'Groundwater in Canning Vale is characterized by high natural soil acidity due to old wetland clays and dense organic layers. This corrosive chemistry rapidly attacks brass impellers and typical metal parts, leading to high maintenance costs. Perth BoreWater installs thermoplastic-jacketed submersibles and acid-neutralizing filters, ensuring your bore runs continuously and cleanly year-round.';
    case 'Wellard':
      return 'Wellard properties are subject to swampy organic sediment layers, which often result in distinctive sulfur gases and hydrogen sulfide odors. Our specialized downhole aeration exhausts and high-flow slotted filters scrub organic particles during drawing to deliver completely odorless water. Tapping the aquifer below 20 meters ensures access to stable, high-output, crisp groundwater.';
    case 'Bertram':
      return 'In Bertram, the deep grey sand dunes absorb fertilizers rapidly, creating chemical shifts in the shallow water table that accelerate iron precipitation. Perth BoreWater tackles this localized problem with specialized multi-phase screens and precision packing to shield the pump intake. This extra layer of security completely saves Bertram homeowners from unsightly rust staining on fences and walls.';
    case 'Atwell':
      return 'Homeowners in Atwell benefit from a remarkably high and easily accessible water table, though it carries a high vulnerability to biological iron-slime bacteria. These bacteria quickly choke garden drippers and sprayers with a thick paste if left unaddressed. We utilize anti-bacterial coated screens and dual-wash bore heads so that your irrigation system remains clean and operating at maximum pressure.';
    case 'Aubin Grove':
      return 'Aubin Grove sits on a delicate sand-to-silt transition matrix that can easily scour standard impellers with abrasive fine quartz particles. Our Class-1 driller setups utilize micro-slotted casing wraps combined with coarse gravel pack surrounds to filter out fine particles downhole. This protects the submersible pump core, delivering a smooth flow to your garden with zero sand residue.';
    case 'Success':
      return 'Groundwater drawing in Success requires precise depth control to avoid capturing localized toxic sulfur deposits located near old swamp basins. Tapping at the precise sweet-spot of 15m to 27m gives local residences a safe, high-yielding resource with minimal metallic residue. Our installations are designed around Cockburn Central hydro-rosters to provide complete peace of mind.';
    case 'Beeliar':
      return 'Beeliar gardens sit atop rich yellow Spearwood sands backed by sharp limestone caprock shelves that demand high-efficiency pressure rigs. While water abundance is high, the limestone bedrock infuses the aquifer with heavy calcium carbonate, causing sprinkler nozzle scaling. We install scale-preventative screen alloys that ensure your retic lines remain perfectly pressurized and mineral-neutral.';
    case 'Coogee':
      return 'Coogee coastal zones require precise engineering because drawing too close to the seaside dynamically pulls the marine salt wedge inland. Our shallow-skimming bore builds draw selectively off the top freshwater lens, preserving water sweetness. This keeps your beachside garden lush without introducing damaging sodium levels into your soil bed.';
    case 'Cockburn Central':
      return 'Cockburn Central is prone to high mineral runoffs and acidic ground pockets that can erode standard alloy submersibles. Perth BoreWater uses advanced composite sheaths and premium polymer connections to build a completely corrosion-proof borehole. This protects your system against premature decay while giving you a cheap, reliable utility source.';
    case 'Hammond Park':
      return 'Hammond Park residents face deep sandy strata over clay blankets that can stall water recharge times if the slotting density is inadequate. Our custom double-wound casing expands the fluid intake surface area by over 140%, optimizing low-pressure flow. We bypass the local acidity issues by utilizing corrosion-proof thermoplastic pumps.';
    case 'Harrisdale':
      return 'Harrisdale properties are severely affected by iron oxides that leave deep red staining on brickwork, limestone retaining walls, and dark metal fences. Standard bores are inefficient at managing this, but our Restorer system utilizes specialized filter matrices to neutralize dissolved iron before it reaches the surface. This keeps your expensive outdoor stone and paints pristine.';
    case 'Southern River':
      return 'Southern River features a tricky overlapping layer of coarse sand and sticky Guildford clay, which can act as a barrier to groundwater flow. Homeowners choose us because our acoustic sensors map these sub-strata boundaries to locate the perfect high-yielding sand veins. This guarantees an excellent bore volume even in historically low-yield zones.';
    case 'Armadale':
      return 'Armadale’s proximity to the granite Scarp cliffs means drilling is incredibly tough and standard light-duty equipment often breaks downhole. Perth BoreWater uses heavy-duty rotary-hammer drills to easily penetate hard igneous rock layers and tap into pure, deep, filtered spring water. This ensures local hilltop properties access excellent, pristine water with zero sand silting.';
    case 'Kelmscott':
      return 'Kelmscott bores are vulnerable to fine sediment suspension due to the dense plastic Guildford clay that shifts during heavy rains. We address this local issue by installing custom gravel-packed jackets around our Class-1 certified screens. This delivers a sand-free, high-pressure output designed to withstand localized underground pressure shifts.';
    case 'Kwinana':
      return 'Kwinana properties sit over robust sand plain corridors but face hard water deposits that can quickly seize garden solenoid valves. Our local bore technicians apply anti-mineral screen linings and precise depth placement to avoid heavy carbonate layers. This maintains system health and extends the lifetime of your home retic grid.';
    case 'Spearwood':
      return 'Spearwood gardens sit over highly productive sand beds, but hard limestone caprock requires precision drilling to access the deep, high-flow aquifer. While water is plentiful, the heavy calcium presence can choke irrigation nozzles over time. Tapping this water with our custom-vented submersibles ensures steady, high-pressure delivery with reduced carbonate deposit risks.';
    case 'Byford':
      return 'Byford’s heavy clay base can expand and contract under climatic conditions, collapsing or warping standard light-gauge bore pipe. Perth BoreWater installs heavy-walled Schedule 12 casing columns to provide structural resistance against soil shift. This guarantees Byford estates a durable, long-term water source despite tricky geological clay layers.';
    default: {
      const subData = SUBURBS_DATA.find(s => s.name.toLowerCase() === suburbName.toLowerCase()) || 
                      (() => {
                        const matchedEntry = ALL_SUBURBS_LIST.find(s => s.name.toLowerCase() === suburbName.toLowerCase());
                        return matchedEntry ? generateSuburbData(matchedEntry.name, matchedEntry.postcode) : null;
                      })();
      if (subData) {
        const pc = getPostcode(suburbName);
        const sector = subData.soilComposition;
        const depths = subData.typicalDepth;
        const headache = subData.localHeadache;
        const landmark = subData.landmark || 'the local district';
        const notes = subData.waterQualityNotes;
        const iron = subData.ironRisk;

        return `For properties located in the vicinity of ${landmark} within ${suburbName} (Postcode ${pc}), specialized domestic water bores must navigate a distinctive subsurface profile. The local geological matrix is characterized primarily by ${sector}, which directly governs drawing yield and dictates specific rotary drilling torques. Standard off-the-shelf well systems are highly vulnerable to the regional technical headache: "${headache}". This requires custom drilling techniques and correct screen slot sizing to ensure stable well-screen integrity downhole.

Our engineering team recommends tapping into the local aquifer, typically mapped at depths of ${depths}. To protect drawing machinery and provide lifetime sustainability, we deploy AS-certified, thick-walled casing, precise slot spacing, and gravel packing tailored to ${suburbName}'s unique under-ground pressure vectors. Water quality assessments in this sector indicate ${notes} with a ${iron} risk of dissolved iron staining. By integrating specialized filtration and corrosion-resistant thermoplastic submersible pumps, Perth BoreWater guarantees that your bore is built to WA licensing standards, securing a cheap, high-capacity, and maintenance-free irrigation supply.`;
      }
      return 'Perth BoreWater provides customized local bore engineering across all Perth suburbs, matching each unique postcodes soil profile. Our team uses premium AS-certified components and specialized slot configurations to ensure a reliable, lifetime groundwater supply. Your home garden receives optimal irrigation volume while remaining entirely compliant with state water protocols.';
    }
  }
};

const getIronRiskLabel = (suburbName: string) => {
  if (suburbName === 'Rockingham') return 'Moderate';
  const sub = SUBURBS_DATA.find(s => s.name === suburbName);
  return sub ? sub.ironRisk : 'Moderate';
};

const getIronRiskExplanation = (suburbName: string) => {
  if (suburbName === 'Rockingham') return 'Iron Oxide potential. Low levels of dissolved iron can oxidize upon air contact, posing a moderate risk to light-colored stone.';
  const sub = SUBURBS_DATA.find(s => s.name === suburbName);
  if (!sub) return 'Dissolved minerals present. Regular monitoring suggested.';
  
  switch (sub.ironRisk) {
    case 'Severe':
      return 'Exceptional rust-staining hazard. Acidic water with extreme dissolved iron levels that will turn retaining walls deep orange; heavy Restorer-grade filtration is mandatory.';
    case 'High':
      return 'Significant dissolved iron content. Regular contact with raw air will leave visible orange stain patterns on garden paths, limestone, and fences; Restorer system strongly recommended.';
    case 'Moderate':
      return 'Moderate concentration. Iron oxide stains are possible on light concrete over time; standard preventative measures or seasonal filter checks are recommended.';
    case 'Minimal':
      return 'Low dissolved minerals. Water is exceptionally clear of iron, posing minimal staining risk to walls. Excellent for straight reticulation feeds.';
    default:
      return 'Standard mineral levels. Safe for general irrigation purposes with low staining potential.';
  }
};

export const getConsultantSpeak = (suburbName: string) => {
  const sub = SUBURBS_DATA.find(s => s.name === suburbName) || SUBURBS_DATA[0];
  const soil = sub.soilComposition;
  const headache = sub.localHeadache;
  const depth = getDepthRange(suburbName).text;
  
  let profile = '';
  let priority = '';
  let mitigation = '';

  if (soil.toLowerCase().includes('spearwood')) {
    profile = 'High-Porosity Spearwood Sands and Caprock Limestone interfacings';
    priority = 'Limestone caprock penetration and optimal shallow aquifer skimming';
    mitigation = 'Anti-scaling nozzle deployment and shallow drag-control to curb chemical carbonate buildup';
  } else if (soil.toLowerCase().includes('bassendean')) {
    profile = 'Acidic Bassendean Sand Matrix with High Permeability & Organic Slimes';
    priority = 'Dissolved iron stabilization, oxidation mitigation & biological control';
    mitigation = 'Polymer/thermoplastic-jacketed submersibles and Restorer-tier oxidation filtration blocks';
  } else if (soil.toLowerCase().includes('southern river')) {
    profile = 'Southern River Coarse Sands transitioning to Thin Clay Boundary Beds';
    priority = 'Silt screening, acoustic stratum mapping, and heavy iron-rust isolation';
    mitigation = 'Precision slot-casing and micro-gravel shroud packing at deep aquifer fissures';
  } else if (soil.toLowerCase().includes('guildford') || soil.toLowerCase().includes('clay')) {
    profile = 'High-Coefficient Swelling Guildford Clays & Dense Transitional Silts';
    priority = 'Structural casing protection and optimized low-yield water table recovery';
    mitigation = 'Schedule 12 heavy-walled casing columns and expanded multi-phase slit filtration';
  } else if (soil.toLowerCase().includes('scarp') || soil.toLowerCase().includes('granite') || soil.toLowerCase().includes('rocky')) {
    profile = 'Darling Scarp Fault-Fissure Igneous Crystalline Granite Basin';
    priority = 'High-torque rotary drilling and deep water-bearing fissure intercepts';
    mitigation = 'Heavy percussion hammer-drill rigs and down-hole stainless steel particle traps';
  } else {
    profile = 'Superficial Perth Sand Plain and Unconsolidated Coastal Aquifers';
    priority = 'Iron-staining protection, optimal draw schedules, and silting safety';
    mitigation = 'Class-1 licensed bore construction with custom slot density configurations';
  }

  if (headache.toLowerCase().includes('salinity') || headache.toLowerCase().includes('saltwater')) {
    priority += ' & Marine Salt Wedge Control';
    mitigation += ' and low-draught skim pumping to maintain the freshwater head layer';
  }

  return {
    profile,
    priority,
    mitigation,
    consultantPrompt: `HYDROGEOLOGICAL BLUEPRINT: \nSUBSTRATE PROFILE: ${profile}. \nOPERATIONAL PRIORITY: ${priority}. \nMITIGATION STRATEGY: ${mitigation}. \nRECOMMENDED HOLE CALIBER: 100mm AS-certified column, targeted casing depth ${depth}.`
  };
};

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    const videoId = match[2];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&enablejsapi=1`;
  }
  return null;
}

function getVimeoEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
  const match = url.match(regExp);
  if (match && match[1]) {
    const videoId = match[1];
    return `https://player.vimeo.com/video/${videoId}?autoplay=1&loop=1&muted=1&background=1`;
  }
  return null;
}

const safeStorage = {
  getItem: (key: string): string => {
    try {
      return localStorage.getItem(key) || '';
    } catch {
      return '';
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // safe fallback
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // safe fallback
    }
  }
};

export default function App() {
  // Custom router state from URL paths
  const getPathInfo = () => {
    const path = window.location.pathname;
    const match = path.match(/\/(suburbs|bore-drilling)\/([^/]+)/);
    if (match) {
      const slugInput = match[2].toLowerCase();
      // Resolve from 350+ master list so it works for all of WA
      const listMatch = ALL_SUBURBS_LIST.find(s => s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slugInput);
      if (listMatch) return slugInput;
    }
    return ''; // Empty slug represents Home Page (The Command Center)
  };

  const [selectedSuburbSlug, setSelectedSuburbSlug] = React.useState(getPathInfo());
  
  // Admin Mode State (supports URL parameter auto-login, e.g., ?admin=Gabrieljrussell@gmail.com)
  const [adminEmail, setAdminEmail] = React.useState<string>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlEmail = urlParams.get('admin');
    if (urlEmail) {
      if (urlEmail.trim().toLowerCase() === 'gabrieljrussell@gmail.com') {
        safeStorage.setItem('perth_borewater_admin_email', urlEmail.trim());
        return urlEmail.trim();
      }
    }
    return safeStorage.getItem('perth_borewater_admin_email');
  });

  const isAdmin = React.useMemo(() => {
    return adminEmail.trim().toLowerCase() === 'gabrieljrussell@gmail.com';
  }, [adminEmail]);

  const [showAdminLogin, setShowAdminLogin] = React.useState(false);
  const [adminLoginInput, setAdminLoginInput] = React.useState('');
  const [adminLoginError, setAdminLoginError] = React.useState('');

  // Auto-trigger admin modal when query params `admin` or `login` exist for secret admin access
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (!isAdmin && (urlParams.has('login') || urlParams.has('admin'))) {
      const adminVal = urlParams.get('admin') || '';
      if (adminVal.toLowerCase() !== 'gabrieljrussell@gmail.com') {
        setAdminLoginInput(adminVal);
        setShowAdminLogin(true);
      }
    }
  }, [isAdmin]);
  
  // Resolve Selected Suburb details dynamically
  const selectedSuburb = React.useMemo(() => {
    if (!selectedSuburbSlug) {
      return generateSuburbData('Rockingham', '6168');
    }
    const staticMatch = SUBURBS_DATA.find(s => s.slug === selectedSuburbSlug);
    if (staticMatch) return staticMatch;
    
    const listMatch = ALL_SUBURBS_LIST.find(s => s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === selectedSuburbSlug);
    if (listMatch) {
      return generateSuburbData(listMatch.name, listMatch.postcode);
    }
    return generateSuburbData('Rockingham', '6168');
  }, [selectedSuburbSlug]);

  // Reusable check for a real custom URL (not empty, not the placeholder URL)
  const isRealUrl = React.useCallback((url?: string) => {
    if (!url) return false;
    const trimmed = url.trim();
    if (!trimmed) return false;
    if (trimmed === 'https://perthborewater.com.au/serve-image.php?file=') return false;
    return true;
  }, []);

  const [heroPhoto, setHeroPhoto] = React.useState('https://lh3.googleusercontent.com/aida-public/AB6AXuAS9LmvO7mawncwLdjxtZvYiFRtsNcXYv_94qu6ByOeZpKC_DpMT1BJh3SXGLDVzfp5kjvH8bFJ8fJq13Qla3cr3Juvr5x7i4kUiFrptGWMgqmmnp5pRo0yizIO0ewmhP1XbQ3vWAEMy79_7G-w0Vc-wCpkIa41CKErQiDCDpPLaQfzT6mBNEUxQaR0V3QVZpmvH6qS-jNTOj4neyC5lLBhzen03c3hh2BkaFw5KDY7pjGJxBOayRdNd4npeabUG0S9eGZ2YYMrmr2W');
  const [heroVideo, setHeroVideo] = React.useState('');
  const [geologyPhoto, setGeologyPhoto] = React.useState('https://lh3.googleusercontent.com/aida-public/AB6AXu-DHHe-WJTQQyXAhmDCvZ3pj2owtlLrn6z8LZbSV3KdCgClcKXE0BgdV1EhIrz7isw9dK0LmhjQMobpttsB_38b6uOnBtxYrJVJBGwZORnzWy5G4CHTW-05sM8mfnx7ifyNJ08BncfKxqxkwKL5vUAKsPQpYTiIC_jkDaHrQgJnwM3jyznCnIssiuuw3UWpV35yhBP4t8sF3Y5m-vasGbP9KF4x4R7bAbXrdWRLpqHdFjNqvo6NvoDBaMvZTBdBtEMir-Gu59V2RNl');
  const [pumpPhoto, setPumpPhoto] = React.useState('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80');
  const [isHeroDragging, setIsHeroDragging] = React.useState(false);
  const [isGeologyDragging, setIsGeologyDragging] = React.useState(false);
  const [isPumpDragging, setIsPumpDragging] = React.useState(false);
  const [showHeroUrlInput, setShowHeroUrlInput] = React.useState(false);
  const [heroUrlVal, setHeroUrlVal] = React.useState('');
  const [showGeologyUrlInput, setShowGeologyUrlInput] = React.useState(false);
  const [geologyUrlVal, setGeologyUrlVal] = React.useState('');
  const [showPumpUrlInput, setShowPumpUrlInput] = React.useState(false);
  const [pumpUrlVal, setPumpUrlVal] = React.useState('');
  const [backgroundPhoto, setBackgroundPhoto] = React.useState('');
  const [showBgUrlInput, setShowBgUrlInput] = React.useState(false);
  const [bgUrlVal, setBgUrlVal] = React.useState('');

  // Media Overrides persistent local map (statically reads from media_overrides.json)
  const [mediaOverrides, setMediaOverrides] = React.useState<Record<string, { video?: string; photo?: string; geology?: string; background?: string; pump?: string; drilling?: string }>>(() => {
    return (mediaOverridesPreset as any) || {};
  });

  const persistToServer = (overridesList: any) => {
    // 1. Save to local server filesystem as backup
    fetch("/api/persist-media-overrides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(overridesList)
    })
    .then(res => {
      if (!res.ok) throw new Error("Persistence API failed");
      return res.json();
    })
    .then(() => {
      console.log("Successfully persisted media overrides locally to server.");
    })
    .catch(err => {
      console.error("Failed to persist media overrides locally to server:", err);
    });

    // 2. Point-write directly to Cloud Firestore to preserve cloud state if user has active session
    if (auth.currentUser && selectedSuburbSlug && overridesList[selectedSuburbSlug]) {
      const activeData = overridesList[selectedSuburbSlug];
      const docRef = doc(db, 'media_overrides', selectedSuburbSlug);
      setDoc(docRef, {
        video: activeData.video || '',
        photo: activeData.photo || '',
        geology: activeData.geology || '',
        pump: activeData.pump || '',
        background: activeData.background || '',
        updatedAt: new Date().toISOString()
      })
      .then(() => {
        console.log(`Successfully persisted ${selectedSuburbSlug} overrides to Cloud Firestore.`);
      })
      .catch(err => {
        console.error("Failed to save media overrides to Firestore client-side:", err);
        handleFirestoreError(err, OperationType.WRITE, `media_overrides/${selectedSuburbSlug}`);
      });
    }
  };

  React.useEffect(() => {
    // 1. Fetch automatic user info from headers (auto-logins gabrieljrussell@gmail.com without click)
    fetch("/api/user-info")
      .then(res => res.json())
      .then(data => {
        if (data.email && data.email.trim().toLowerCase() === 'gabrieljrussell@gmail.com') {
          console.log("Auto-authenticated Gabrieljrussell as Admin.");
          setAdminEmail(data.email.trim());
          safeStorage.setItem('perth_borewater_admin_email', data.email.trim());
        }
      })
      .catch(err => {
        console.warn("Could not retrieve automatic user-info session:", err);
      });

    // 2. Fetch persistent media overrides from server filesystem, then override with Firestore for latest state
    fetch("/api/persistent-media-overrides")
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("Local filesystem API inactive");
      })
      .then(data => {
        if (data && typeof data === 'object') {
          setMediaOverrides(prev => ({
            ...prev,
            ...data
          }));
        }
      })
      .catch(err => {
        console.warn("Express local filesystem API not available. Utilizing static JSON presets or falling back:", err.message);
      })
      .finally(() => {
        // ALWAYS fetch live Firestore updates, completely independent of the filesystem API status!
        getDocs(collection(db, 'media_overrides'))
          .then(querySnapshot => {
            if (querySnapshot) {
              const fsOverrides: any = {};
              querySnapshot.forEach((doc) => {
                const docData = doc.data();
                fsOverrides[doc.id] = {
                  video: docData.video || undefined,
                  photo: docData.photo || undefined,
                  geology: docData.geology || undefined,
                  pump: docData.pump || undefined,
                  background: docData.background || undefined,
                };
              });
              if (Object.keys(fsOverrides).length > 0) {
                setMediaOverrides(prev => ({
                  ...prev,
                  ...fsOverrides
                }));
                console.log("Successfully retrieved and merged active overrides from Cloud Firestore.");
              }
            }
          })
          .catch(err => {
            console.error("Could not fetch active overrides from Cloud Firestore:", err);
          });
      });

    // 3. Keep standard Firebase Auth state changes synchronized
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email?.toLowerCase() === 'gabrieljrussell@gmail.com') {
        console.log("Firebase Auth modern sign-in session successfully active:", user.email);
        setAdminEmail(user.email);
        safeStorage.setItem('perth_borewater_admin_email', user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  const [isEditorMode, setIsEditorMode] = React.useState(false);
  const [llmNarratives, setLlmNarratives] = React.useState<Record<string, string>>({});
  const [loadingNarrative, setLoadingNarrative] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = React.useState(false);

  React.useEffect(() => {
    // Disabled dynamic AI synthesis to respect non-synthesized verified ground truths.
    setLoadingNarrative(false);
  }, [selectedSuburbSlug]);

  // Hidden file inputs refs
  const videoInputRef = React.useRef<HTMLInputElement>(null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const geologyInputRef = React.useRef<HTMLInputElement>(null);
  const pumpInputRef = React.useRef<HTMLInputElement>(null);
  const heroInputRef = React.useRef<HTMLInputElement>(null);

  const saveMediaOverride = (type: 'video' | 'photo' | 'geology' | 'pump', value: string) => {
    if (!selectedSuburbSlug) return;
    setMediaOverrides(prev => {
      const current = prev[selectedSuburbSlug] || {};
      const nextItem = { ...current, [type]: value };
      
      if (type === 'video') {
        delete nextItem.photo;
      } else if (type === 'photo') {
        delete nextItem.video;
      }

      const next = {
        ...prev,
        [selectedSuburbSlug]: nextItem
      };
      
      // Persist directly to server filesystem (media_overrides.json)
      persistToServer(next);

      return next;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'photo' | 'geology' | 'pump' | 'hero-auto') => {
    const file = e.target.files?.[0];
    if (!file || !selectedSuburbSlug) return;

    let targetType: 'video' | 'photo' | 'geology' | 'pump' = type === 'hero-auto' ? 'photo' : type;
    if (type === 'hero-auto') {
      const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4');
      targetType = isVideo ? 'video' : 'photo';
    }

    const objectUrl = URL.createObjectURL(file);

    // Dynamic state updates for instant response
    if (targetType === 'video') {
      setHeroVideo(objectUrl);
      setHeroPhoto('');
    } else if (targetType === 'photo') {
      setHeroPhoto(objectUrl);
      setHeroVideo('');
    } else if (targetType === 'geology') {
      setGeologyPhoto(objectUrl);
    } else if (targetType === 'pump') {
      setPumpPhoto(objectUrl);
    }

    // Update local react state instantly for seamless rendering
    setMediaOverrides(prev => {
      const current = prev[selectedSuburbSlug] || {};
      const nextItem = { ...current, [targetType]: objectUrl };
      if (targetType === 'video') {
        delete nextItem.photo;
      } else if (targetType === 'photo') {
        delete nextItem.video;
      }
      return {
        ...prev,
        [selectedSuburbSlug]: nextItem
      };
    });

    // Async convert file to Base64 to persist across page refreshes
    const reader = new FileReader();
    reader.onloadend = () => {
      saveMediaOverride(targetType, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent, setDragState: (val: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(true);
  };

  const handleDragLeave = (e: React.DragEvent, setDragState: (val: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(false);
  };

  const handleDrop = (e: React.DragEvent, type: 'hero' | 'geology' | 'pump', setDragState: (val: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(false);

    const file = e.dataTransfer.files?.[0];
    if (!file || !selectedSuburbSlug) return;

    if (type === 'hero') {
      const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4');
      const targetType = isVideo ? 'video' : 'photo';
      const objectUrl = URL.createObjectURL(file);

      if (targetType === 'video') {
        setHeroVideo(objectUrl);
        setHeroPhoto('');
      } else {
        setHeroPhoto(objectUrl);
        setHeroVideo('');
      }

      setMediaOverrides(prev => {
        const current = prev[selectedSuburbSlug] || {};
        const nextItem = { ...current, [targetType]: objectUrl };
        if (targetType === 'video') {
          delete nextItem.photo;
        } else {
          delete nextItem.video;
        }
        return {
          ...prev,
          [selectedSuburbSlug]: nextItem
        };
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        saveMediaOverride(targetType, reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (type === 'geology') {
      const objectUrl = URL.createObjectURL(file);
      setGeologyPhoto(objectUrl);
      setMediaOverrides(prev => ({
        ...prev,
        [selectedSuburbSlug]: {
          ...prev[selectedSuburbSlug],
          geology: objectUrl
        }
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        saveMediaOverride('geology', reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (type === 'pump') {
      const objectUrl = URL.createObjectURL(file);
      setPumpPhoto(objectUrl);
      setMediaOverrides(prev => ({
        ...prev,
        [selectedSuburbSlug]: {
          ...prev[selectedSuburbSlug],
          pump: objectUrl
        }
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        saveMediaOverride('pump', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (url: string, type: 'hero' | 'geology' | 'background' | 'pump') => {
    if (!selectedSuburbSlug) return;
    const cleanUrl = url.trim();
    if (type === 'hero') {
      if (!cleanUrl) return;
      const isVideo = cleanUrl.endsWith('.mp4') || 
                      cleanUrl.toLowerCase().includes('.mp4') || 
                      cleanUrl.includes('.mp4?') || 
                      cleanUrl.includes('/video/') ||
                      cleanUrl.includes('youtube.com') ||
                      cleanUrl.includes('youtu.be') ||
                      cleanUrl.includes('vimeo.com');
      const targetType = isVideo ? 'video' : 'photo';
      
      setMediaOverrides(prev => {
        const current = prev[selectedSuburbSlug] || {};
        const updated = {
          ...prev,
          [selectedSuburbSlug]: {
            ...current,
            video: targetType === 'video' ? cleanUrl : undefined,
            photo: targetType === 'photo' ? cleanUrl : undefined
          }
        };

        // Persist to server filesystem
        persistToServer(updated);

        return updated;
      });

      if (targetType === 'video') {
        setHeroVideo(cleanUrl);
        // keep photo as thumbnail fallback if possible
      } else {
        setHeroPhoto(cleanUrl);
        setHeroVideo('');
      }
    } else if (type === 'background') {
      setMediaOverrides(prev => {
        const current = prev[selectedSuburbSlug] || {};
        const updated = {
          ...prev,
          [selectedSuburbSlug]: {
            ...current,
            background: cleanUrl || undefined
          }
        };

        // Persist to server filesystem
        persistToServer(updated);

        return updated;
      });
      setBackgroundPhoto(cleanUrl);
    } else if (type === 'pump') {
      if (!cleanUrl) return;
      setMediaOverrides(prev => {
        const current = prev[selectedSuburbSlug] || {};
        const updated = {
          ...prev,
          [selectedSuburbSlug]: {
            ...current,
            pump: cleanUrl
          }
        };

        // Persist to server filesystem
        persistToServer(updated);

        return updated;
      });
      setPumpPhoto(cleanUrl);
    } else {
      if (!cleanUrl) return;
      setMediaOverrides(prev => {
        const current = prev[selectedSuburbSlug] || {};
        const updated = {
          ...prev,
          [selectedSuburbSlug]: {
            ...current,
            geology: cleanUrl
          }
        };

        // Persist to server filesystem
        persistToServer(updated);

        return updated;
      });
      setGeologyPhoto(cleanUrl);
    }
  };

  React.useEffect(() => {
    const handleRouteChange = () => {
      setSelectedSuburbSlug(getPathInfo());
      setFormSubmitted(false);
    };
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('app-route-change', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('app-route-change', handleRouteChange);
    };
  }, []);

  const handleSuburbChange = (slug: string) => {
    setSelectedSuburbSlug(slug);
    setFormSubmitted(false);
    // Push clean, sovereign SEO URL paths
    const customPath = slug ? `/bore-drilling/${slug}` : '/';
    window.history.pushState(null, '', customPath);
    window.dispatchEvent(new Event('app-route-change'));
  };

  // SEO Tab Title and Local JSON-LD updates on selection change
  React.useEffect(() => {
    if (selectedSuburb) {
      const pc = getPostcode(selectedSuburb.name);
      
      // Update HTML Title tag to showcase scientific authority
      document.title = selectedSuburbSlug 
        ? `Soil & Water Table Analysis for ${selectedSuburb.name} (${pc}) | Perth BoreWater`
        : `Perth BoreWater Operations | Aquifer Intelligence Command Center`;
      
      // Upsert JSON-LD Schema
      let schemaScript = document.getElementById('suburb-jsonld-schema');
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.setAttribute('type', 'application/ld+json');
        schemaScript.setAttribute('id', 'suburb-jsonld-schema');
        document.head.appendChild(schemaScript);
      }
      schemaScript.innerHTML = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": selectedSuburbSlug 
          ? `Perth BoreWater Operations - ${selectedSuburb.name} Division` 
          : "Perth BoreWater Operations",
        "image": "https://assets.perthborewater.com.au/BoreWaterLogo.png",
        "@id": selectedSuburbSlug 
          ? `https://perthborewater.com.au/bore-drilling/${selectedSuburbSlug}`
          : "https://perthborewater.com.au/",
        "url": selectedSuburbSlug 
          ? `https://perthborewater.com.au/bore-drilling/${selectedSuburbSlug}`
          : "https://perthborewater.com.au/",
        "telephone": "(08) 6370 4982",
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": selectedSuburb.landmark || "Groundwater Headquarters",
          "addressLocality": selectedSuburb.name,
          "addressRegion": "WA",
          "postalCode": pc,
          "addressCountry": "AU"
        },
        "areaServed": {
          "@type": "AdministrativeArea",
          "name": `${selectedSuburb.name} ${pc}`
        },
        "knowsAbout": [
          "Groundwater extraction",
          "Bore repair",
          "Reticulation drilling",
          "Soil analysis",
          "Technical hydrology compliance"
        ]
      }, null, 2);
    }
  }, [selectedSuburb, selectedSuburbSlug]);

  // Media Integrity Check with integrated user-level overrides
  React.useEffect(() => {
    if (!selectedSuburbSlug) return;

    // Resolve persistent overrides first if they exist and are valid user-customized URLs
    const local = mediaOverrides[selectedSuburbSlug];
    const hasPhotoOverride = local?.photo && isRealUrl(local.photo);
    const hasVideoOverride = local?.video && isRealUrl(local.video);
    const hasGeologyOverride = local?.geology && isRealUrl(local.geology);
    const hasPumpOverride = local?.pump && isRealUrl(local.pump);
    const hasBgOverride = local?.background && isRealUrl(local.background);

    if (hasPhotoOverride) {
      setHeroPhoto(local.photo);
    }
    if (hasVideoOverride) {
      setHeroVideo(local.video);
    }
    if (hasGeologyOverride) {
      setGeologyPhoto(local.geology);
    }
    if (hasPumpOverride) {
      setPumpPhoto(local.pump);
    }
    if (hasBgOverride) {
      setBackgroundPhoto(local.background);
    } else {
      setBackgroundPhoto('');
    }

    const slug = selectedSuburbSlug;
    const testVideoUrl = slug === 'rockingham'
      ? 'https://perthborewater.com.au/serve-image.php?file=Rockingham.mp4'
      : `https://perthborewater.com.au/serve-image.php?file=${slug}-hero.mp4`;
    const testPhotoUrl = `https://perthborewater.com.au/serve-image.php?file=${slug}-photo.jpg`;
    const testGeologyUrl = slug === 'rockingham'
      ? 'https://perthborewater.com.au/serve-image.php?file=Rockingham-geology.jpg'
      : `https://perthborewater.com.au/serve-image.php?file=${slug}-geology.jpg`;
    const testPumpUrl = slug === 'rockingham'
      ? 'https://perthborewater.com.au/serve-image.php?file=Rockingham-pump.jpg'
      : `https://perthborewater.com.au/serve-image.php?file=${slug}-pump.jpg`;
    const defaultPhoto = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS9LmvO7mawncwLdjxtZvYiFRtsNcXYv_94qu6ByOeZpKC_DpMT1BJh3SXGLDVzfp5kjvH8bFJ8fJq13Qla3cr3Juvr5x7i4kUiFrptGWMgqmmnp5pRo0yizIO0ewmhP1XbQ3vWAEMy79_7G-w0Vc-wCpkIa41CKErQiDCDpPLaQfzT6mBNEUxQaR0V3QVZpmvH6qS-jNTOj4neyC5lLBhzen03c3hh2BkaFw5KDY7pjGJxBOayRdNd4npeabUG0S9eGZ2YYMrmr2W';
    const defaultGeology = 'https://lh3.googleusercontent.com/aida-public/AB6AXu-DHHe-WJTQQyXAhmDCvZ3pj2owtlLrn6z8LZbSV3KdCgClcKXE0BgdV1EhIrz7isw9dK0LmhjQMobpttsB_38b6uOnBtxYrJVJBGwZORnzWy5G4CHTW-05sM8mfnx7ifyNJ08BncfKxqxkwKL5vUAKsPQpYTiIC_jkDaHrQgJnwM3jyznCnIssiuuw3UWpV35yhBP4t8sF3Y5m-vasGbP9KF4x4R7bAbXrdWRLpqHdFjNqvo6NvoDBaMvZTBdBtEMir-Gu59V2RNl';
    const defaultPump = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';

    if (!hasPhotoOverride) {
      const tempImg = new Image();
      tempImg.src = testPhotoUrl;
      tempImg.onload = () => {
        setHeroPhoto(testPhotoUrl);
      };
      tempImg.onerror = () => {
        setHeroPhoto(defaultPhoto);
      };
    }

    if (!hasVideoOverride && !hasPhotoOverride) {
      setHeroVideo(testVideoUrl);
    } else if (hasPhotoOverride) {
      setHeroVideo('');
    }

    if (!hasGeologyOverride) {
      const tempGeol = new Image();
      tempGeol.src = testGeologyUrl;
      tempGeol.onload = () => {
        setGeologyPhoto(testGeologyUrl);
      };
      tempGeol.onerror = () => {
        setGeologyPhoto(defaultGeology);
      };
    }

    if (!hasPumpOverride) {
      const tempPump = new Image();
      tempPump.src = testPumpUrl;
      tempPump.onload = () => {
        setPumpPhoto(testPumpUrl);
      };
      tempPump.onerror = () => {
        setPumpPhoto(defaultPump);
      };
    }
  }, [selectedSuburbSlug, mediaOverrides, isRealUrl]);

  // Synchronize admin input textboxes with saved overrides so edits are shown properly
  React.useEffect(() => {
    if (!selectedSuburbSlug) return;
    const local = mediaOverrides[selectedSuburbSlug];
    const hasPhotoOverride = local?.photo && isRealUrl(local.photo);
    const hasVideoOverride = local?.video && isRealUrl(local.video);
    const hasGeologyOverride = local?.geology && isRealUrl(local.geology);
    const hasPumpOverride = local?.pump && isRealUrl(local.pump);
    const hasBgOverride = local?.background && isRealUrl(local.background);

    if (hasVideoOverride) {
      setHeroUrlVal(local.video!);
    } else if (hasPhotoOverride) {
      setHeroUrlVal(local.photo!);
    } else {
      setHeroUrlVal('');
    }

    if (hasGeologyOverride) {
      setGeologyUrlVal(local.geology!);
    } else {
      setGeologyUrlVal('');
    }

    if (hasPumpOverride) {
      setPumpUrlVal(local.pump!);
    } else {
      setPumpUrlVal('');
    }

    if (hasBgOverride) {
      setBgUrlVal(local.background!);
    } else {
      setBgUrlVal('');
    }
  }, [selectedSuburbSlug, mediaOverrides, isRealUrl]);

  // Modal states for interactive booking/quotes
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Secure Your Drill Date');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');

  const handleOpenModal = (title: string) => {
    setModalTitle(title);
    setIsModalOpen(true);
    setFormSubmitted(false);
    setFullName('');
    setPhone('');
    setEmailAddress('');
    setAdditionalNotes('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    setFormLoading(true);
    setTimeout(() => {
      setFormLoading(false);
      setFormSubmitted(true);
      setReceiptNumber('AD-' + Math.floor(100000 + Math.random() * 900000));
    }, 1000);
  };

  return (
    <div className={`min-h-screen bg-slate-50 text-[#1E293B] font-sans flex flex-col antialiased ${isAdmin ? 'pt-28 md:pt-32' : 'pt-22 md:pt-24'}`}>
      
      {/* 0. Top Admin Session Sticky Banner */}
      {isAdmin && (
        <div className="bg-[#0B1221] border-b border-[#007AFF]/35 text-white font-mono text-[10px] sm:text-xs py-2.5 px-4 text-center fixed top-0 left-0 right-0 z-55 flex items-center justify-center gap-4 shadow-md">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            <span>Admin Active: <strong className="text-[#38BDF8] font-bold uppercase font-sans">Gabrieljrussell@gmail.com</strong></span>
          </div>

          <button 
            type="button"
            onClick={() => setIsEditorMode(!isEditorMode)}
            className={`font-sans font-bold text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-lg transition-all border duration-200 cursor-pointer ${
              isEditorMode 
                ? 'bg-amber-600 text-white border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:bg-amber-500 animate-pulse' 
                : 'bg-[#007AFF] text-white border-blue-500 hover:bg-[#0060DF] shadow-[0_0_12px_rgba(0,122,255,0.2)]'
            }`}
          >
            {isEditorMode ? '✦ Close Media Panel' : '🔧 Open Media Admin'}
          </button>

          <button 
            onClick={() => {
              safeStorage.removeItem('perth_borewater_admin_email');
              setAdminEmail('');
              setIsEditorMode(false);
            }}
            className="underline underline-offset-2 hover:text-slate-200 transition-colors cursor-pointer font-bold uppercase tracking-wider text-[10px]"
          >
            Sign Out
          </button>
        </div>
      )}

       {/* Admin Login Dialog / Modal Overlay */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in pointer-events-auto">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-sm w-full shadow-2xl relative text-left">
            <button
              onClick={() => setShowAdminLogin(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 font-mono text-base transition-colors p-1 cursor-pointer"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5.5 h-5.5 text-emerald-600" />
              <h3 className="text-base font-display font-extrabold text-slate-900 leading-tight">
                Admin Console Authorization
              </h3>
            </div>
            
            <p className="text-[11px] text-slate-500 mb-5 leading-relaxed font-sans">
              Verify your registered administrator email address below to authorize this session and manage live bore geotechnical media assets.
            </p>
            
            {isAdmin && (
              <div className="mb-5 p-4 bg-[#E0F2FE]/45 border border-[#BAE6FD]/40 rounded-2xl space-y-2 animate-fade-in text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Active Configuration</span>
                  <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest font-black">Authorized</span>
                </div>
                <p className="text-[10.5px] text-slate-600 leading-normal font-sans">
                  Keep your local code file updated! Tap below to download the compiled media overrides dictionary directly as <strong className="font-mono text-[9.5px] bg-sky-100 px-1 py-0.5 rounded text-sky-805">media_overrides.json</strong>.
                </p>
                <a
                  href="/api/download-media-overrides"
                  download="media_overrides.json"
                  className="w-full flex items-center justify-center gap-2 bg-[#007AFF] hover:bg-[#0051C3] text-white font-mono font-bold text-[10px] uppercase tracking-widest py-2.5 rounded-xl transition-all shadow-sm cursor-pointer hover:shadow-md active:scale-98 text-center"
                >
                  <Download className="w-4 h-4" />
                  Download media_overrides.json
                </a>
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault();
              if (adminLoginInput.trim().toLowerCase() === 'gabrieljrussell@gmail.com') {
                safeStorage.setItem('perth_borewater_admin_email', adminLoginInput.trim());
                setAdminEmail(adminLoginInput.trim());
                setAdminLoginError('');
                setShowAdminLogin(false);
              } else {
                setAdminLoginError('Access Denied. Contact Gabrieljrussell@gmail.com.');
              }
            }} className="space-y-4 font-sans">
              <div>
                <label className="block text-[8.5px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  ADMINISTRATIVE EMAIL REGISTER
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="gabrieljrussell@gmail.com"
                    value={adminLoginInput}
                    onChange={(e) => setAdminLoginInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-xs text-slate-950 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-555/30 focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {adminLoginError && (
                <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-xl flex items-start gap-1.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-rose-700 leading-relaxed font-mono">
                    {adminLoginError}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      safeStorage.removeItem('perth_borewater_admin_email');
                      setAdminEmail('');
                      setShowAdminLogin(false);
                    }}
                    className="px-4 py-2.5 bg-rose-50 text-rose-750 hover:text-rose-800 rounded-xl text-xs font-bold font-mono tracking-wider hover:bg-rose-100 transition-all uppercase cursor-pointer"
                  >
                    Revoke Mode
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl font-bold transition-all shadow-md cursor-pointer hover:shadow-lg active:scale-98"
                >
                  Authorize Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden file inputs for Active Upload Zones */}
      <input
        type="file"
        ref={heroInputRef}
        onChange={(e) => handleFileChange(e, 'hero-auto')}
        accept="video/mp4,video/*,image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={geologyInputRef}
        onChange={(e) => handleFileChange(e, 'geology')}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={pumpInputRef}
        onChange={(e) => handleFileChange(e, 'pump')}
        accept="image/*"
        className="hidden"
      />

      {isAdmin && isEditorMode ? (
        <MediaAdmin 
          mediaOverrides={mediaOverrides}
          onSaveOverrides={(updated) => {
            setMediaOverrides(updated);
            persistToServer(updated);
          }}
          onClose={() => setIsEditorMode(false)}
        />
      ) : (
        <>
          {/* 1. High-Gloss Floating Navigation Bar (Backdrop filter blur(16px)) */}
          <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-[16px] border-b border-slate-200/50 px-4 sm:px-8 py-4.5 transition-all w-full shadow-[0_10px_35px_-5px_rgba(0,0,0,0.05),0_0_15px_rgba(16,185,129,0.02)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Brand Logo - Clean bold uppercase typography and custom SVG icon */}
          <div 
            onClick={() => handleSuburbChange('rockingham')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm overflow-hidden p-0.5 transition-transform group-hover:scale-105 duration-300">
              <img src="https://assets.perthborewater.com.au/BoreWaterLogo.png" alt="Perth BoreWater Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <span className="text-lg font-display font-black tracking-tight text-[#0F2C59] transition-colors">
              Perth<span className="text-[#007AFF] font-medium ml-0.5">BoreWater</span>
            </span>
          </div>

          {/* Centered Simplified Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 font-sans">
            <button 
              onClick={() => handleSuburbChange('rockingham')}
              className="text-[#0F2C59] hover:text-[#007AFF] text-sm font-semibold tracking-wide cursor-pointer focus:outline-none"
            >
              Home
            </button>
            
            {/* Services Dropdown */}
            <div 
              className="relative py-2 group"
              onMouseEnter={() => setIsServicesDropdownOpen(true)}
              onMouseLeave={() => setIsServicesDropdownOpen(false)}
            >
              <button 
                onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                className="text-[#0F2C59] hover:text-[#007AFF] transition-colors text-sm font-semibold tracking-wide cursor-pointer focus:outline-none flex items-center gap-1"
              >
                <span>Services</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:translate-y-0.5 transition-transform" />
              </button>
              
              {isServicesDropdownOpen && (
                <div className="absolute top-10 left-0 w-64 bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl p-2.5 z-50 flex flex-col animate-fade-in-up">
                  <div className="px-3.5 py-1.5 mb-1.5 border-b border-slate-100 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Precision Capabilities
                  </div>
                  <button 
                    onClick={() => {
                      handleOpenModal('Specialist Drilling Services');
                      setIsServicesDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#007AFF] hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    ✦ Bore Water Drilling
                  </button>
                  <button 
                    onClick={() => {
                      handleOpenModal('Request Immediate Diagnostic Report');
                      setIsServicesDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-rose-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    ✦ Forensic Repairs (Emergency)
                  </button>
                  <button 
                    onClick={() => {
                      handleOpenModal('Improve My System Efficiency');
                      setIsServicesDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    ✦ System Optimization
                  </button>
                  <button 
                    onClick={() => {
                      handleOpenModal('Book a Water Quality Test');
                      setIsServicesDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-amber-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    ✦ Stain Management &amp; Chemistry
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                const element = document.getElementById('suburb-directory-sitemap');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                } else {
                  handleOpenModal('Suburb Index Directory');
                }
              }}
              className="text-[#0F2C59] hover:text-[#007AFF] transition-colors text-sm font-semibold tracking-wide cursor-pointer focus:outline-none"
            >
              Suburb Index
            </button>

            <button 
              onClick={() => {
                const element = document.getElementById('bore-atlas-blueprint');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                } else {
                  handleOpenModal('Geological Survey Data');
                }
              }}
              className="text-[#0F2C59] hover:text-[#007AFF] transition-colors text-sm font-semibold tracking-wide cursor-pointer focus:outline-none"
            >
              Resources
            </button>
          </nav>

          {/* Flashpoint Layout Right Side */}
          <div className="flex items-center gap-4">
            
            {/* Desktop right: Admin Session Portal */}
            {isAdmin && (
              <div 
                onClick={() => {
                  setIsEditorMode(!isEditorMode);
                }}
                className={`hidden lg:flex items-center gap-1.5 border rounded-full py-1.5 px-3.5 text-[11px] font-mono font-bold cursor-pointer transition-all shadow-sm ${
                  isEditorMode 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20' 
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 hover:bg-emerald-500/20'
                }`}
                title={isEditorMode ? "Close Media Admin Panel" : "Open Media Admin Panel"}
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${isEditorMode ? 'text-amber-500 animate-pulse' : 'text-emerald-600'}`} />
                <span>{isEditorMode ? 'Close Media Panel' : 'Admin Active'}</span>
              </div>
            )}

            {/* Desktop right: Semi-transparent silver phone pill + Emerald Green button */}
            <div className="hidden lg:flex items-center gap-3">
              <a 
                href="tel:0863704982" 
                className="bg-[#E2E8F0]/40 hover:bg-[#E2E8F0]/65 text-slate-800 font-sans font-extrabold text-[11px] uppercase tracking-wider px-5 py-2.5 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all border border-slate-300/40 hover:scale-[1.02] active:scale-[0.98] duration-300 flex items-center gap-2 cursor-pointer h-[38px]"
                id="header-phone-pill"
              >
                <Phone className="w-3.5 h-3.5 text-[#007AFF]" />
                <span className="font-extrabold font-sans">(08) 6370 4982</span>
              </a>

              <button 
                onClick={() => handleOpenModal('Request Immediate Diagnostic Report')}
                className="bg-emerald-600 hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.45),inset_0_1.5px_0_rgba(255,255,255,0.3)] text-white font-sans text-[11px] uppercase tracking-wider px-5 py-2.5 rounded-full font-black hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-500/20 duration-300 flex items-center gap-1.5 h-[38px]"
              >
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                </span>
                <span>Request Diagnostic</span>
              </button>
            </div>

            {/* Mobile/Tablet Call Now (08) button */}
            <div className="lg:hidden flex items-center">
              <a 
                href="tel:0863704982" 
                className="p-2.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all border border-emerald-200/40 flex items-center justify-center"
                title="Call Now"
              >
                <Phone className="w-4 h-4 shrink-0 text-emerald-600" />
              </a>
            </div>

            {/* Minimalist Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#0F2C59] hover:bg-[#0F2C59]/5 active:bg-[#0F2C59]/10 transition-all cursor-pointer focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Minimalist Mobile/Tablet Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-4 border-t border-slate-200/40 space-y-4 animate-fade-in-up">
            <div className="grid grid-cols-1 gap-2 font-sans px-1">
              
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleSuburbChange('rockingham');
                }}
                className="w-full text-left py-2 px-4 font-semibold text-slate-700 hover:text-[#007AFF] hover:bg-slate-50 rounded-xl text-sm"
              >
                Home
              </button>

              <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                  Our Services
                </div>
                <div className="flex flex-col gap-1.5">
                  <button 
                    onClick={() => {
                      handleOpenModal('Specialist Drilling Services');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left text-xs font-semibold text-slate-700 hover:text-[#007AFF] py-1.5 px-1 class-focus"
                  >
                    ✦ Bore Water Drilling
                  </button>
                  <button 
                    onClick={() => {
                      handleOpenModal('Request Immediate Diagnostic Report');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left text-xs font-semibold text-rose-600 hover:text-rose-700 py-1.5 px-1 class-focus"
                  >
                    ✦ Forensic Repairs (Emergency)
                  </button>
                  <button 
                    onClick={() => {
                      handleOpenModal('Improve My System Efficiency');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left text-xs font-semibold text-blue-600 hover:text-blue-700 py-1.5 px-1 class-focus"
                  >
                    ✦ System Optimization
                  </button>
                  <button 
                    onClick={() => {
                      handleOpenModal('Book a Water Quality Test');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left text-xs font-semibold text-amber-600 hover:text-amber-700 py-1.5 px-1 class-focus"
                  >
                    ✦ Stain Management &amp; Chemistry
                  </button>
                </div>
              </div>

              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  const element = document.getElementById('suburb-directory-sitemap');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full text-left py-2.5 px-4 font-semibold text-slate-700 hover:text-[#007AFF] hover:bg-slate-50 rounded-xl text-sm"
              >
                Suburb Index
              </button>

              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  const element = document.getElementById('bore-atlas-blueprint');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full text-left py-2.5 px-4 font-semibold text-slate-700 hover:text-[#007AFF] hover:bg-slate-50 rounded-xl text-sm"
              >
                Resources
              </button>

              {isAdmin && (
                <div className="px-1 pt-1 border-t border-slate-100/50 mt-2">
                  <button 
                    onClick={() => {
                      setIsEditorMode(!isEditorMode);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl text-left font-semibold text-xs transition-all flex items-center gap-2 bg-emerald-50 text-emerald-700"
                  >
                    <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{isEditorMode ? 'Close Media Panel' : 'Admin Mode (Active)'}</span>
                  </button>
                </div>
              )}

              <div className="pt-2 px-1">
                <button 
                  onClick={() => {
                    handleOpenModal('Request Immediate Diagnostic Report');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs uppercase tracking-wider py-3.5 rounded-full font-black text-center shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                  </span>
                  Request Diagnostic
                </button>
              </div>

            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Background blur container with embedded central frosted card */}
      <section className="relative w-full py-8 sm:py-12 md:py-16 px-4 flex items-center justify-center overflow-hidden">
        
        {/* Seaside Drone Blurred Background (matches layout perfectly) */}
        <div 
          onClick={() => {
            if (isAdmin) {
              setBgUrlVal(backgroundPhoto || heroPhoto);
              setShowBgUrlInput(true);
            }
          }}
          className={`absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-700 ${isAdmin ? 'cursor-pointer hover:brightness-105 active:scale-[0.99] group/bg shadow-inner' : ''}`} 
          style={{ 
            backgroundImage: `url('${backgroundPhoto || heroPhoto}')`,
            filter: 'blur(7px) brightness(0.92)',
            transform: 'scale(1.05)',
            zIndex: 0
          }}
          title={isAdmin ? "Click to change background image URL" : undefined}
        />

        {/* Crisp edit action badge in the corner of the background section */}
        {isAdmin && (
          <div className="absolute top-4 right-4 z-20 pointer-events-auto">
            <button
              type="button"
              onClick={() => {
                setBgUrlVal(backgroundPhoto || heroPhoto);
                setShowBgUrlInput(true);
              }}
              className="bg-black/75 hover:bg-[#007AFF] text-white border border-white/20 text-[10px] font-mono font-bold py-1.5 px-3 rounded-full flex items-center gap-1.5 transition-all duration-300 shadow-lg"
            >
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              <span>Edit Backdrop URL</span>
            </button>
          </div>
        )}

        {/* Backdrop URL input dialog (perfect absolute centered modal over the backdrop) */}
        {showBgUrlInput && (
          <div 
            onClick={() => setShowBgUrlInput(false)}
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-md z-30 flex items-center justify-center p-4 animate-fade-in"
          >
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-sans font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Link className="text-emerald-400 w-3.5 h-3.5 animate-pulse" />
                  Backdrop Image URL
                </span>
                <button
                  type="button"
                  onClick={() => setShowBgUrlInput(false)}
                  className="text-slate-400 hover:text-white text-xs font-mono bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-slate-350 text-[11px] mb-4 leading-relaxed">
                Provide an image link to replace the background panorama for {selectedSuburb.name}.
              </p>

              <div className="space-y-3">
                <input
                  type="url"
                  placeholder="https://example.com/custom-backdrop.jpg"
                  value={bgUrlVal}
                  onChange={(e) => setBgUrlVal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
                
                <div className="flex justify-end gap-2 text-[10px] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleUrlSubmit('', 'background');
                      setBackgroundPhoto('');
                      setShowBgUrlInput(false);
                    }}
                    className="px-2.5 py-1.5 text-slate-400 hover:text-white font-semibold transition-colors"
                  >
                    Reset Default
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleUrlSubmit(bgUrlVal, 'background');
                      setShowBgUrlInput(false);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded transition-all"
                  >
                    Save Backdrop
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating frosted glass central card */}
        <div 
          onClick={(e) => e.stopPropagation()}
          className="bg-white/80 backdrop-blur-2xl border border-white/40 rounded-3xl p-6 sm:p-10 max-w-4xl w-full mx-auto relative z-10 shadow-2xl flex flex-col justify-between"
        >
          
          {/* Top image/video: Active Upload Component */}
          <div 
            onClick={() => isAdmin && heroInputRef.current?.click()}
            onDragOver={(e) => isAdmin && handleDragOver(e, setIsHeroDragging)}
            onDragLeave={(e) => isAdmin && handleDragLeave(e, setIsHeroDragging)}
            onDrop={(e) => isAdmin && handleDrop(e, 'hero', setIsHeroDragging)}
            className={`w-full h-[220px] sm:h-[320px] rounded-2xl overflow-hidden relative mb-8 border bg-slate-900 shadow-md transition-all duration-300 ${
              isAdmin 
                ? 'cursor-pointer group hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20' 
                : 'border-white/40'
            } ${
              isHeroDragging && isAdmin
                ? 'border-emerald-500 ring-4 ring-emerald-500/50 scale-[1.01] bg-emerald-950/40' 
                : ''
            }`}
          >
            {/* Show visual drag and drop active highlight state */}
            {isHeroDragging && isAdmin ? (
              <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-xs flex flex-col items-center justify-center text-center z-20 p-4 transition-all animate-pulse">
                <Upload className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
                <p className="text-white font-display font-black text-lg">Drop rockingham-hero file here</p>
                <p className="text-emerald-400 text-xs font-mono font-bold uppercase mt-1">Accepts Video (MP4) or Image</p>
              </div>
            ) : isAdmin ? (
              <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    heroInputRef.current?.click();
                  }}
                  className="bg-black/85 hover:bg-emerald-600 border border-white/20 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow-md transition-all active:scale-95"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Local</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHeroUrlInput(true);
                  }}
                  className="bg-black/85 hover:bg-blue-600 border border-white/20 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow-md transition-all active:scale-95"
                >
                  <Link className="w-3 h-3 text-blue-400" />
                  <span>Enter URL</span>
                </button>
              </div>
            ) : null}

            {/* URL Input overlay screen */}
            {showHeroUrlInput && (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 z-45 animate-fade-in"
              >
                <div className="w-full max-w-sm space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-sans font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Link className="w-4 h-4 text-emerald-400" />
                      Hero Asset URL
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowHeroUrlInput(false)}
                      className="text-slate-400 hover:text-white text-xs font-mono bg-white/10 hover:bg-white/20 px-2 py-1 rounded"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-slate-350 text-[11px]">
                    Paste an image or video (.mp4) link for {selectedSuburb.name}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/bore-drill.jpg"
                      value={heroUrlVal}
                      onChange={(e) => setHeroUrlVal(e.target.value)}
                      className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-1.8 text-xs flex-grow outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handleUrlSubmit(heroUrlVal, 'hero');
                        setShowHeroUrlInput(false);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-1.8 rounded-lg transition-all"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}

            {heroVideo ? (
              getYouTubeEmbedUrl(heroVideo) ? (
                <iframe
                  key={heroVideo}
                  src={getYouTubeEmbedUrl(heroVideo)!}
                  className="w-full h-full absolute inset-0 border-0 pointer-events-none"
                  style={{ minWidth: '100%', minHeight: '100%', transform: 'scale(1.15)' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title="Hero YouTube Video"
                />
              ) : getVimeoEmbedUrl(heroVideo) ? (
                <iframe
                  key={heroVideo}
                  src={getVimeoEmbedUrl(heroVideo)!}
                  className="w-full h-full absolute inset-0 border-0 pointer-events-none"
                  style={{ minWidth: '100%', minHeight: '100%', transform: 'scale(1.15)' }}
                  allow="autoplay; fullscreen"
                  title="Hero Vimeo Video"
                />
              ) : (
                <video 
                  key={heroVideo}
                  src={heroVideo || undefined}
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  poster={heroPhoto || undefined}
                  className="w-full h-full object-cover"
                  onError={() => {
                    console.warn("Video failed to play or media event warning.");
                  }}
                />
              )
            ) : (
              <img 
                src={heroPhoto || undefined} 
                alt={`${selectedSuburb.name} precision bore drilling`} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
            {/* Custom bottom alignment accent (progress bar styled 32% filled) */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-400/30 font-mono z-10">
              <div className="h-full bg-emerald-500 rounded-r-lg shadow-[0_0_6px_#10B981]" style={{ width: '32%' }} />
            </div>
          </div>

          <div className="space-y-6 text-center">
            
            {/* Location indicator pill (Fully functional dynamic select selector) */}
            <div className="relative inline-flex items-center gap-1.5 px-4.5 py-2.2 bg-[#007AFF]/10 border border-[#007AFF]/15 text-[#007AFF] font-mono text-[11px] font-bold rounded-full uppercase tracking-wider mx-auto shadow-sm cursor-pointer hover:bg-[#007AFF]/15 transition-all">
              <MapPin className="w-3.5 h-3.5 text-[#007AFF] shrink-0" />
              <select
                id="suburb-selector"
                value={selectedSuburbSlug}
                onChange={(e) => handleSuburbChange(e.target.value)}
                className="bg-transparent text-[#007AFF] font-mono text-[11px] font-bold uppercase tracking-wider outline-none cursor-pointer appearance-none pr-5 relative z-10 font-sans border-none p-0 focus:outline-none focus:ring-0 active:outline-none"
                style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
              >
                {SUBURBS_DATA.map((sub) => (
                  <option key={sub.slug} value={sub.slug} className="bg-white text-slate-800 capitalize font-sans text-xs">
                    {sub.name} • Postcode {getPostcode(sub.name)}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-[#007AFF] pointer-events-none select-none">▼</span>
            </div>

            {/* Display Header */}
            <h1 className="text-3xl sm:text-4.5xl md:text-5xl font-display font-black text-[#0F172A] tracking-tight leading-tight">
              Perth's Precision Bore Drilling for {selectedSuburb.name}.
            </h1>

            {/* Geological statement */}
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Access the Superficial Aquifer at <span className="text-[#007AFF] font-bold">{getDepthRange(selectedSuburb.name).text}</span> depth. Sustainable irrigation engineered for <strong className="text-slate-900 font-bold">{getSoilData(selectedSuburb.name).name}</strong> {getSoilData(selectedSuburb.name).type}.
            </p>

            {/* High-Gloss Emerald Action Call-to-action button */}
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => handleOpenModal('Secure My Drill Date')}
                className="bg-emerald-600 hover:bg-emerald-500 hover:shadow-[0_0_25px_rgba(16,185,129,0.55),inset_0_1.5px_0_rgba(255,255,255,0.3)] text-white px-8 py-4 rounded-full font-black uppercase text-xs tracking-wider border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3),inset_0_1.5px_0_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer inline-flex items-center gap-2 duration-300"
              >
                <span>Secure My Drill Date</span>
                <span>→</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Bento Grid - Formulated to display exactly what is featured in the screenshot */}
      <main className="flex-grow max-w-[1400px] mx-auto px-4 sm:px-8 py-8 w-full z-10" id="bento-grid-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch justify-center">
          
          {/* LEFT PARTION COLUMN (Contains Soil info, Geological evidence, and Staining risk cards) */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-start">
            
            {/* Card 1: Technical Analysis Bento Box */}
            <div id="bore-atlas-blueprint" className="bg-white border border-slate-200/60 rounded-3xl p-8 hover:shadow-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-left flex flex-col justify-start min-h-[350px]">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-[#007AFF]/10 flex items-center justify-center border border-[#007AFF]/10 shadow-xs">
                  <Layers className="w-6 h-6 text-[#007AFF]" />
                </div>
                <span className="font-mono text-[10px] font-bold text-[#007AFF] px-3.5 py-1 bg-[#007AFF]/10 rounded-full uppercase tracking-wider border border-[#007AFF]/15">
                  TECHNICAL BLUEPRINT
                </span>
              </div>
              
              <div className="mt-6 space-y-4 font-mono text-xs">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase block">
                    SUBSTRATE PROFILE
                  </span>
                  <span className="text-slate-800 font-semibold font-sans text-sm mt-0.5 block">
                    {getConsultantSpeak(selectedSuburb.name).profile}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#007AFF] font-bold uppercase block">
                    OPERATIONAL PRIORITY
                  </span>
                  <span className="text-slate-705 font-sans text-xs mt-0.5 block font-medium leading-relaxed">
                    {getConsultantSpeak(selectedSuburb.name).priority}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono tracking-widest text-amber-600 font-bold uppercase block">
                    MITIGATION STRATEGY
                  </span>
                  <span className="text-slate-705 font-sans text-xs mt-0.5 block leading-relaxed font-medium">
                    {getConsultantSpeak(selectedSuburb.name).mitigation}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#007AFF] font-bold uppercase block mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
                    BORE DRILLING SIMULATION
                  </span>
                  <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-105 relative shadow-sm">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      src={
                        mediaOverrides[selectedSuburb.slug]?.drilling || 
                        (mediaOverrides[selectedSuburb.slug]?.pump && mediaOverrides[selectedSuburb.slug]?.pump.endsWith('.mp4') ? mediaOverrides[selectedSuburb.slug]?.pump : undefined) || 
                        "https://assets.mixkit.co/videos/preview/mixkit-mechanical-drilling-machine-working-on-a-site-41584-large.mp4"
                      }
                      key={`${selectedSuburb.slug}-drilling`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Live overlay markers */}
                    <div className="absolute top-2.5 left-2.5 pointer-events-none flex items-center gap-1 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded text-[8px] font-mono text-white/95 uppercase tracking-widest leading-none border border-white/5">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span>{selectedSuburb.name} Feed</span>
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 pointer-events-none flex items-center gap-1 bg-[#0F172A]/85 backdrop-blur-xs px-2 py-0.5 rounded text-[7.5px] font-mono text-[#38BDF8] border border-blue-500/10 uppercase tracking-tight">
                      <span>RATED AQUIFER DEPTH: </span>
                      <strong className="text-white font-bold">{getDepthRange(selectedSuburb.name).text}</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-mono text-[10px] text-slate-500 space-y-1">
                  <span className="text-slate-400 block font-bold">HOLE CALIBER REPORT</span>
                  <p className="text-slate-700 font-medium font-sans">
                    100mm AS-certified high-flow casing column, targeted aquifer zone <strong className="text-[#007AFF]">{getDepthRange(selectedSuburb.name).text}</strong>.
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-semibold font-sans">
                  {selectedSuburb.name} Geotechnical Model
                </span>
                <span className="text-[#007AFF] font-bold uppercase font-mono">
                  ACTIVE SPEC
                </span>
              </div>
            </div>

            {/* Split row for Geological Evidence & Staining Risk cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Card 6: Geological Evidence image/gradient block - Active Upload Component */}
              <div 
                onClick={() => isAdmin && geologyInputRef.current?.click()}
                onDragOver={(e) => isAdmin && handleDragOver(e, setIsGeologyDragging)}
                onDragLeave={(e) => isAdmin && handleDragLeave(e, setIsGeologyDragging)}
                onDrop={(e) => isAdmin && handleDrop(e, 'geology', setIsGeologyDragging)}
                className={`rounded-3xl relative overflow-hidden h-[200px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-end p-6 border transition-all duration-300 text-left ${
                  isAdmin 
                    ? 'cursor-pointer group hover:border-amber-500/50 border-slate-800 bg-slate-900' 
                    : 'border-slate-200/60 bg-slate-950/95'
                } ${
                  isGeologyDragging && isAdmin
                    ? 'border-amber-500 ring-4 ring-amber-500/50 scale-[1.01] bg-amber-950/40' 
                    : ''
                }`}
              >
                {/* Drag and Drop visual feedback */}
                {isGeologyDragging && isAdmin ? (
                  <div className="absolute inset-0 bg-amber-950/90 backdrop-blur-xs flex flex-col items-center justify-center text-center z-20 p-4 transition-all">
                    <Upload className="w-10 h-10 text-amber-400 mb-1 animate-bounce" />
                    <p className="text-white font-display font-black text-sm">Drop rockingham-geology.jpg here</p>
                    <p className="text-amber-405 text-[10px] font-mono tracking-wider uppercase">Accepts JPG/PNG image</p>
                  </div>
                ) : isAdmin ? (
                  <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        geologyInputRef.current?.click();
                      }}
                      className="bg-black/85 hover:bg-amber-600 border border-white/20 px-2 py-1 rounded text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow-md transition-all active:scale-95 animate-fade-in"
                    >
                      <Upload className="w-2.5 h-2.5" />
                      <span>Upload</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowGeologyUrlInput(true);
                      }}
                      className="bg-black/85 hover:bg-yellow-600 border border-white/20 px-2 py-1 rounded text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow-md transition-all active:scale-95 animate-fade-in"
                    >
                      <Link className="w-2.5 h-2.5 text-yellow-500" />
                      <span>URL</span>
                    </button>
                  </div>
                ) : null}

                {/* Inline URL Input overlay screen */}
                {showGeologyUrlInput && (
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="absolute inset-0 bg-slate-950/95 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-45 animate-fade-in"
                  >
                    <div className="w-full space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-sans font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                          <Link className="w-3 h-3 text-amber-400" />
                          Geology Image URL
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowGeologyUrlInput(false)}
                          className="text-slate-400 hover:text-white text-[10px] font-mono bg-white/10 hover:bg-white/20 px-1.5 py-0.5 rounded"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          type="url"
                          placeholder="https://example.com/geology.jpg"
                          value={geologyUrlVal}
                          onChange={(e) => setGeologyUrlVal(e.target.value)}
                          className="bg-white/10 border border-white/20 text-white rounded px-2 py-1 text-xs flex-grow outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            handleUrlSubmit(geologyUrlVal, 'geology');
                            setShowGeologyUrlInput(false);
                          }}
                          className="bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-semibold px-2.5 py-1 rounded transition-all"
                        >
                          OK
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rock Core spectroscopy image */}
                <img 
                  src={geologyPhoto || undefined} 
                  alt="Geological sands" 
                  className="absolute inset-0 w-full h-full object-cover opacity-75 animate-fade-in"
                  referrerPolicy="no-referrer"
                  key={geologyPhoto || 'geology'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent animate-fade-in" />
                
                <div className="relative z-10 space-y-1">
                  <span className="text-[8px] font-mono font-bold text-[#FFD700] uppercase tracking-wider block">CORE SPECTROSCOPY</span>
                  <h4 className="text-white font-display font-extrabold text-base tracking-tight">
                    Geological Evidence
                  </h4>
                </div>
              </div>

              {/* Card 7: Staining Risk & Mineral Concentration Gauge */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 hover:shadow-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between h-[200px] text-left">
                <div>
                  <h4 className="font-display font-black text-slate-900 text-base leading-tight">Staining Risk</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-sans">
                    Aquifer mineral profiling
                  </p>
                </div>
                
                {/* The Risk Gauge */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[9px] font-mono font-bold">
                    <span className="text-slate-400">MINERAL CONC.</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] uppercase font-bold ${
                      selectedSuburb.name === 'Rockingham' ? 'bg-amber-100 text-amber-700' :
                      selectedSuburb.ironRisk === 'Severe' ? 'bg-red-100 text-red-700' :
                      selectedSuburb.ironRisk === 'High' ? 'bg-orange-100 text-orange-700' :
                      selectedSuburb.ironRisk === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {getIronRiskLabel(selectedSuburb.name)}
                    </span>
                  </div>
                  
                  {/* Visual gauge bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        selectedSuburb.name === 'Rockingham' ? 'bg-amber-500 w-[45%]' :
                        selectedSuburb.ironRisk === 'Severe' ? 'bg-red-500 w-[95%]' :
                        selectedSuburb.ironRisk === 'High' ? 'bg-orange-500 w-[75%]' :
                        selectedSuburb.ironRisk === 'Moderate' ? 'bg-yellow-500 w-[45%]' :
                        'bg-blue-500 w-[15%]'
                      }`}
                    />
                  </div>
                  
                  <p className="text-[10px] text-slate-500 italic leading-snug line-clamp-3">
                    {getIronRiskExplanation(selectedSuburb.name)}
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT PARTITION COLUMN (Contains Passive Metrics Grid and the 3 Technical Tiers Service Stack) */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-start">
            
            {/* Top row: Passive Suburb Metrics (Drill Depth & Watering Schedule) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Card 3: Drill Depth with Vertical Depth Meter Gauge */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 hover:shadow-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col items-start justify-between min-h-[220px] text-left">
                <div className="flex justify-between items-start w-full">
                  <div className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center border border-yellow-300 shadow-sm" />
                  <span className="font-mono text-[9px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-100 uppercase tracking-wide">
                    Stratum Ok
                  </span>
                </div>
                
                <div className="mt-4 w-full">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    DRILL DEPTH
                  </span>
                  <p className="text-2xl font-display font-black text-[#0F172A] mt-0.5">
                    {getDepthRange(selectedSuburb.name).text}
                  </p>
                </div>

                {/* Vertical depth gauge block */}
                <div className="flex items-center gap-3 w-full pt-3 mt-3 border-t border-slate-100 h-[100px] select-none">
                  <div className="flex flex-col text-[8px] font-mono font-extrabold text-slate-400 justify-between h-full pr-1 select-none leading-none">
                    <span>0m</span>
                    <span>15m</span>
                    <span>30m</span>
                    <span>45m</span>
                    <span>60m</span>
                  </div>
                  <div className="relative flex-1 h-full bg-slate-50 border border-slate-200/85 rounded-lg p-0.5 overflow-hidden flex flex-col justify-end">
                    {/* Highlighted aquifer band segment representing the target depth */}
                    <div 
                      className="absolute bg-gradient-to-t from-[#007AFF] to-blue-400 rounded-md opacity-80 flex items-center justify-center text-[7px] text-white font-mono font-bold font-sans transition-all duration-700"
                      style={{
                        bottom: `${Math.max(5, (60 - getDepthRange(selectedSuburb.name).max) * 1.55)}%`,
                        height: `${Math.max(15, (getDepthRange(selectedSuburb.name).max - getDepthRange(selectedSuburb.name).min) * 1.55)}%`,
                        left: '2px',
                        right: '2px',
                        minHeight: '14px'
                      }}
                    >
                      <span className="animate-pulse tracking-wide text-[7px] uppercase font-bold">Aquifer</span>
                    </div>
                    {/* Visual ground layer labels */}
                    <div className="absolute top-0 left-0 right-0 h-[25%] border-b border-dashed border-slate-200 pointer-events-none text-[6.5px] font-mono text-slate-400 pl-1 pt-0.5">Sands</div>
                    <div className="absolute top-[25%] left-0 right-0 h-[35%] border-b border-dashed border-slate-200 pointer-events-none text-[6.5px] font-mono text-slate-400 pl-1 pt-0.5">Limestone</div>
                    <div className="absolute top-[60%] left-0 right-0 h-[40%] pointer-events-none text-[6.5px] font-mono text-slate-400 pl-1 pt-0.5">Basalt</div>
                  </div>
                </div>
              </div>

              {/* Card 5: Watering Days Card */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 hover:shadow-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col items-start justify-between min-h-[220px] text-left">
                <div className="flex justify-between items-start w-full">
                  <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 flex items-center justify-center border border-[#007AFF]/25 shadow-xs shrink-0">
                    <Calendar className="w-5 h-5 text-[#007AFF]" />
                  </div>
                  <span className="font-mono text-[9px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100 uppercase tracking-wide">
                    ROSTER SCHEDULE
                  </span>
                </div>
                
                <div className="mt-4 w-full">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    WATERING DAYS
                  </span>
                  <p className="text-2xl font-display font-black text-slate-900 mt-0.5">
                    Mon &amp; Fri
                  </p>
                  <p className="text-[10px] text-slate-500 font-sans mt-1 leading-relaxed">
                    Postcode {getPostcode(selectedSuburb.name)} schedule strictly enforced by DWER.
                  </p>
                </div>

                <div className="w-full pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-450 font-bold">
                  <span>SCHEME LIMIT</span>
                  <span className="text-[#007AFF]">2 STATIONS</span>
                </div>
              </div>

            </div>

            {/* The Three Distinct Technical Tiers (The Premium Service Stack) */}
            <div className="space-y-6">
              
              {/* TIER 1: THE FORENSIC REPAIR (Emergency) */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 hover:shadow-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between min-h-[210px] text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-rose-500 text-white font-mono font-bold text-[8px] px-3.5 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  EMERGENCY DISPATCH
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[9px] font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-100 uppercase tracking-wider">
                      Tier I: Forensic
                    </span>
                  </div>
                  <h4 className="font-display font-black text-slate-900 text-lg leading-tight">Bore Diagnostics & Recovery</h4>
                  
                  {/* Technical Pump Image Showcase */}
                  <div 
                    onClick={() => isAdmin && pumpInputRef.current?.click()}
                    onDragOver={(e) => isAdmin && handleDragOver(e, setIsPumpDragging)}
                    onDragLeave={(e) => isAdmin && handleDragLeave(e, setIsPumpDragging)}
                    onDrop={(e) => isAdmin && handleDrop(e, 'pump', setIsPumpDragging)}
                    className={`mt-3.5 w-full h-36 rounded-2xl overflow-hidden border relative flex-shrink-0 transition-all duration-300 ${
                      isAdmin 
                        ? 'cursor-pointer group hover:border-rose-500/50 border-slate-200/60 bg-slate-900' 
                        : 'border-slate-100 bg-slate-50'
                    } ${
                      isPumpDragging && isAdmin
                        ? 'border-rose-500 ring-4 ring-rose-500/30 scale-[1.01] bg-rose-950/10' 
                        : ''
                    }`}
                  >
                    {isPumpDragging && isAdmin ? (
                      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none p-3 text-center">
                        <Upload className="w-8 h-8 text-rose-500 mb-1 animate-bounce" />
                        <p className="text-white font-display font-black text-xs">Drop pump image here</p>
                        <p className="text-rose-400 text-[8px] font-mono tracking-wider uppercase">Accepts JPG/PNG image</p>
                      </div>
                    ) : (
                      <>
                        <img 
                          src={pumpPhoto || undefined} 
                          alt="Bore Diagnostics Technical Pump" 
                          className="w-full h-full object-cover transition-all"
                          referrerPolicy="no-referrer"
                          key={pumpPhoto || 'pump'}
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80";
                          }}
                        />
                        <div className="absolute bottom-2 left-2 bg-slate-900/85 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[8.5px] text-white font-mono uppercase tracking-widest font-bold">
                          DIAGNOSTICS RIG
                        </div>
                        
                        {isAdmin && (
                          <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                pumpInputRef.current?.click();
                              }}
                              className="bg-black/85 hover:bg-rose-600 border border-white/20 px-2 py-1 rounded text-[8.5px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow-md transition-all active:scale-95"
                            >
                              <Upload className="w-2.5 h-2.5" />
                              <span>Upload</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowPumpUrlInput(!showPumpUrlInput);
                              }}
                              className="bg-black/85 hover:bg-[#007AFF] border border-white/25 px-1.5 py-1 rounded text-[8.5px] font-bold text-white uppercase tracking-wider flex items-center gap-0.5 shadow-md transition-all active:scale-95"
                            >
                              <span>URL</span>
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* URL Input Box inside Card */}
                  {showPumpUrlInput && isAdmin && (
                    <div className="mt-2.5 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 animate-fade-in text-left">
                      <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <span>PUMP SPECIFICATION ASSET URL:</span>
                      </p>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={pumpUrlVal}
                          onChange={(e) => setPumpUrlVal(e.target.value)}
                          placeholder="https://example.com/asset-pump.jpg"
                          className="flex-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-[11px] font-sans text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (pumpUrlVal.trim()) {
                              handleUrlSubmit(pumpUrlVal.trim(), 'pump');
                              setShowPumpUrlInput(false);
                            }
                          }}
                          className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-slate-500 mt-3.5 leading-relaxed border-b border-slate-100 pb-2.5">
                    High-priority dispatch focusing on mechanical, electrical, and flow faults downhole.
                  </p>
                  
                  <ul className="mt-3.5 space-y-2 text-[11px] text-slate-600 font-medium font-sans">
                    <li className="flex items-center gap-1.5">
                      <span className="text-rose-500 font-bold text-xs select-none">✓</span>
                      <span>Submersible pump diagnostics &amp; advanced deep borehole recovery</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-rose-500 font-bold text-xs select-none">✓</span>
                      <span>Fused motor replacements &amp; insulation resistance diagnostics</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-rose-500 font-bold text-xs select-none">✓</span>
                      <span>Solenoid circuit tracking &amp; underground cable fault location</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-slate-400 font-bold uppercase tracking-widest">CALLOUT ESTIMATE</span>
                    <span className="text-[11px] font-bold text-rose-600 font-mono">PRIORITY SPEED</span>
                  </div>
                  <button 
                    onClick={() => handleOpenModal('Request Immediate Diagnostic Report')}
                    className="bg-emerald-600 hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.45),inset_0_1.5px_0_rgba(255,255,255,0.3)] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-500/20 text-center font-sans tracking-wide duration-300"
                  >
                    Request Immediate Diagnostic Report
                  </button>
                </div>
              </div>

              {/* TIER 2: THE SYSTEM OPTIMIZER (Maintenance) */}
              <div className="bg-white border-2 border-[#007AFF] rounded-3xl p-6.5 hover:shadow-xl transition-all shadow-[0_8px_30px_rgba(0,122,255,0.03)] flex flex-col justify-between min-h-[210px] text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#007AFF] text-white font-mono font-bold text-[8px] px-3.5 py-1 rounded-bl-xl uppercase tracking-wider">
                  SYSTEM ECO-RATING
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100 uppercase tracking-wider">
                      Tier II: Optimization
                    </span>
                  </div>
                  <h4 className="font-display font-black text-slate-900 text-lg leading-tight">Reticulation & Flow Optimization</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed border-b border-slate-100 pb-2.5">
                    Precision flow balancing and wireless automation retrofitting for modern water conservation.
                  </p>
                  
                  <ul className="mt-3.5 space-y-2 text-[11px] text-slate-600 font-medium font-sans">
                    <li className="flex items-center gap-1.5">
                      <span className="text-[#007AFF] font-bold text-xs select-none">✓</span>
                      <span>Smart Controller retrofitting (Hydrawise / WiFi predictive weather schedules)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-[#007AFF] font-bold text-xs select-none">✓</span>
                      <span>Blocked sprinkler remediation &amp; customizable high-efficiency nozzle calibration</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-[#007AFF] font-bold text-xs select-none">✓</span>
                      <span>Water-wise system audits to maximize zone-by-zone drawing performance</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-slate-400 font-bold uppercase tracking-widest">SAVINGS RATING</span>
                    <span className="text-[11px] font-bold text-blue-600 font-mono">WATER-WISE APPR.</span>
                  </div>
                  <button 
                    onClick={() => handleOpenModal('Improve My System Efficiency')}
                    className="bg-emerald-600 hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.45),inset_0_1.5px_0_rgba(255,255,255,0.3)] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-500/20 text-center font-sans tracking-wide duration-300"
                  >
                    Improve My System Efficiency
                  </button>
                </div>
              </div>

              {/* TIER 3: THE STAIN SCIENTIST (Remediation) */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 hover:shadow-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between min-h-[210px] text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-500 text-white font-mono font-bold text-[8px] px-3.5 py-1 rounded-bl-xl uppercase tracking-wider">
                  CHEMISTRY DEPOT
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[9px] font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-100 uppercase tracking-wider">
                      Tier III: Remediation
                    </span>
                  </div>
                  <h4 className="font-display font-black text-slate-900 text-lg leading-tight">Mineral & Iron Oxide Management</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed border-b border-slate-100 pb-2.5">
                    Mitigate mineral oxidation staining and treat aquifer chemical hazards before they impact surface brickwork.
                  </p>
                  
                  <ul className="mt-3.5 space-y-2 text-[11px] text-slate-600 font-medium font-sans">
                    <li className="flex items-center gap-1.5">
                      <span className="text-amber-500 font-bold text-xs select-none">✓</span>
                      <span>Chemical bio-friendly iron-stain removal on masonry &amp; concrete</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-amber-500 font-bold text-xs select-none">✓</span>
                      <span>Automated 'Stain-Stopper' inline filtration systems and chemical dosing</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-amber-500 font-bold text-xs select-none">✓</span>
                      <span>Precision downhole chemical washing &amp; scale descaling</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-slate-400 font-bold uppercase tracking-widest">MINERAL EXPOSURE</span>
                    <span className="text-[11px] font-bold text-amber-600 font-mono">SPEC ACCURATE</span>
                  </div>
                  <button 
                    onClick={() => handleOpenModal('Book a Water Quality Test')}
                    className="bg-emerald-600 hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.45),inset_0_1.5px_0_rgba(255,255,255,0.3)] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-500/20 text-center font-sans tracking-wide duration-300"
                  >
                    Book a Water Quality Test
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Brand New: Hyper-Local Hydrology Narrative Section */}
        <section className="bg-white border border-slate-200/60 rounded-3xl p-8 hover:shadow-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-left mt-8 w-full">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="space-y-3 max-w-3xl">
              <span className="text-[9px] font-mono font-bold tracking-widest text-[#007AFF] uppercase bg-[#007AFF]/10 border border-[#007AFF]/15 px-3 py-1 rounded-full">
                POSTCODE {getPostcode(selectedSuburb.name)} HYDROLOGY REPORT
              </span>
              <h3 className="font-display font-black text-2xl text-slate-900 leading-tight">
                Why {selectedSuburb.name} Homeowners Choose Us
              </h3>
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#007AFF] uppercase block">
                  Regional Water Outlook
                </span>
                <p className="text-sm text-slate-650 leading-relaxed font-sans whitespace-pre-line">
                  {getSuburbNarrative(selectedSuburb.name)}
                </p>
              </div>
            </div>
            {/* Trust approval indicator */}
            <div className="flex items-center gap-3 bg-slate-50 p-4 border border-slate-100 rounded-2xl shrink-0">
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20 text-amber-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block font-bold">REGIONAL APPROVAL</span>
                <span className="text-xs text-slate-800 font-extrabold font-mono uppercase">WA BORE LIC #2241</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 4. Deep Dark Charcoal Navy Footer */}
      <footer className="bg-[#0F172A] text-white py-14 px-4 sm:px-8 border-t border-slate-800 w-full mt-auto">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            
            {/* Logo and compliance data on Left */}
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden bg-white/10 p-0.5">
                  <img src="https://assets.perthborewater.com.au/BoreWaterLogo.png" alt="Perth BoreWater Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <span className="text-lg font-display font-extrabold tracking-tight text-white">
                  Perth<span className="text-[#38BDF8] font-medium ml-1">BoreWater</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                © 2026 Perth BoreWater. Precision Bore Engineering.<br />
                Central Operations: (08) 6370 4982 | ABN: 16 015 205 459
              </p>
            </div>

            {/* Core Footer Navigation Links on Right */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 font-semibold text-xs text-slate-350">
              <button 
                onClick={() => handleOpenModal('Water Compliance Standards')} 
                className="hover:text-white transition-colors cursor-pointer"
              >
                Compliance
              </button>
              <button 
                onClick={() => handleOpenModal('Health & Safety Protocols')} 
                className="hover:text-white transition-colors cursor-pointer"
              >
                Safety Standards
              </button>
              <button 
                onClick={() => handleOpenModal('Hydrogeological Reports')} 
                className="hover:text-white transition-colors cursor-pointer"
              >
                Hydrogeology Reports
              </button>
              <button 
                onClick={() => handleOpenModal('Customer Operations Support')} 
                className="hover:text-white transition-colors cursor-pointer"
              >
                Contact Support
              </button>
              {isAdmin && (
                <button 
                  onClick={() => {
                    setIsEditorMode(!isEditorMode);
                  }} 
                  className="transition-colors cursor-pointer flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold"
                >
                  <Shield className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>{isEditorMode ? 'Close Media Panel' : 'Open Media Admin'}</span>
                </button>
              )}
            </div>

          </div>

          {/* 5. Navigation Authority Sitemap targeting Google web crawlers */}
          <div id="suburb-directory-sitemap" className="border-t border-slate-800 pt-8 text-left">
            <h4 className="text-sm font-display font-bold text-slate-400 mb-4 uppercase tracking-widest text-[11px] font-mono font-black">
              Authority Sitemap (Perth Subsurface Aquifer Directory)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-2">
              {SUBURBS_DATA.map((sub) => (
                <a
                  key={sub.slug}
                  href={`/bore-drilling/${sub.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSuburbChange(sub.slug);
                  }}
                  className={`text-xs ${selectedSuburbSlug === sub.slug ? 'text-[#38BDF8] font-bold' : 'text-slate-400 hover:text-[#38BDF8]'} transition-colors leading-relaxed font-sans block`}
                >
                  {sub.name} Bore Analysis ({getPostcode(sub.name)})
                </a>
              ))}
            </div>
          </div>

        </div>
      </footer>

      {/* 5. Highly Elegant, Floating Interactive Booking & Quote Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in-up">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden relative">
            
            {/* Header portion */}
            <div className="bg-slate-50 px-6 py-5 flex items-center justify-between border-b border-slate-100">
              <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase tracking-wide">
                {modalTitle}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 px-2.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors font-black cursor-pointer text-xs flex items-center"
                title="Close modal"
              >
                <X className="w-4 h-4 shrink-0" />
              </button>
            </div>

            {/* Body Form portion */}
            <div className="p-6">
              {formSubmitted ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-slate-900 font-display font-black text-xl">Request Lodged Securely</h4>
                    <p className="text-xs text-slate-500">
                      Our Rockingham priority dispatch has reserved this slot.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1 inline-block">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                      Reservation Ticket
                    </span>
                    <strong className="text-[#007AFF] font-mono text-base font-bold tracking-wider uppercase block">
                      {receiptNumber}
                    </strong>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    An on-call bore engineer will phone you at <strong className="text-slate-800">{phone}</strong> within 30 minutes.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-mono font-bold uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer mt-4"
                  >
                    Return to Blueprint
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase tracking-wider">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 text-slate-405">
                        <User className="w-4 h-4" />
                      </span>
                      <input 
                        required 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. David Anderson"
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#007AFF] focus:bg-white rounded-xl pl-10 pr-4 py-3 text-xs text-slate-800 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase tracking-wider">
                      Phone Number (For dispatch)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 text-slate-405">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input 
                        required 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 0400 123 456"
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#007AFF] focus:bg-white rounded-xl pl-10 pr-4 py-3 text-xs text-slate-800 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase tracking-wider">
                      Email Address (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 text-slate-455">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input 
                        type="email" 
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="default@example.com"
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#007AFF] focus:bg-white rounded-xl pl-10 pr-4 py-3 text-xs text-slate-800 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-slate-440 uppercase tracking-wider">
                      Site Requirements & Location Notes
                    </label>
                    <textarea 
                      rows={2}
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Specify street address, pump burn out notes, or retic zone details..."
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#007AFF] focus:bg-white rounded-xl p-3 text-xs text-slate-850 outline-none transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 flex items-center justify-between gap-4 font-mono">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-[#007AFF]" />
                      <span>Class 1 Driller Certified</span>
                    </div>

                    <button 
                      type="submit"
                      disabled={formLoading}
                      className="bg-emerald-600 hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.45),inset_0_1.5px_0_rgba(255,255,255,0.3)] text-white font-sans font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-500/20 duration-300"
                    >
                      {formLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>SENDING...</span>
                        </>
                      ) : (
                        <span>SUBMIT REQUEST</span>
                      )}
                    </button>
                  </div>

                </form>
              )}
            </div>

          </div>
        </div>
      )}
        </>
      )}

    </div>
  );
}
