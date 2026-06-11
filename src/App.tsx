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
  UserCheck,
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
import HomeBentoPage from './components/HomeBentoPage';
import MediaAdmin from './components/MediaAdmin';
import AuthorityBentoCards from './components/AuthorityBentoCards';
import mediaOverridesPreset from './media_overrides.json';
import { getSuburbNarrative } from './masterSuburbNarratives';
import { SUBURB_GEOLOGICAL_DATA } from './suburbGeologicalData';
import { db, auth, logInWithGoogle, handleFirestoreError, OperationType } from './firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import SoilProfileDiagram from './components/SoilProfileDiagram';

export const INDEX_SUBURBS = [
  "Rockingham", "Baldivis", "Piara Waters", "Canning Vale", "Wellard",
  "Bertram", "Atwell", "Aubin Grove", "Success", "Beeliar",
  "Coogee", "Cockburn Central", "Hammond Park", "Harrisdale", "Southern River",
  "Armadale", "Kelmscott", "Kwinana", "Spearwood", "Byford"
];

const getSoilTypeAndDepthFromSuburbApp = (suburbName: string) => {
  const depth = getDepthRange(suburbName);
  const midDepth = Math.round((depth.min + depth.max) / 2);
  
  const matchedEntry = ALL_SUBURBS_LIST.find(s => s.name.toLowerCase() === suburbName.toLowerCase());
  let soilType: 'Limestone' | 'Clay' | 'Sand' = 'Sand';
  
  if (matchedEntry) {
    switch (matchedEntry.sector) {
      case 'spearwood': 
      case 'quindalup':
        soilType = 'Limestone';
        break;
      case 'guildford': 
        soilType = 'Clay';
        break;
      case 'bassendean':
      case 'scarp':
      default:
        soilType = 'Sand';
        break;
    }
  } else {
    if (suburbName.includes('Guildford') || suburbName.includes('Valley') || suburbName.includes('Canning')) {
      soilType = 'Clay';
    } else if (suburbName.includes('Rockingham') || suburbName.includes('Beach') || suburbName.includes('Ocean')) {
      soilType = 'Limestone';
    } else {
      soilType = 'Sand';
    }
  }
  return { soilType, waterDepth: midDepth || 15 };
};

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

const getLandmarks = (suburb: { name: string; landmark?: string }) => {
  const landmark = suburb.landmark || '';
  let landmark1 = '';
  let landmark2 = '';
  if (landmark.includes('/')) {
    const parts = landmark.split('/');
    landmark1 = (parts[0] || '').trim();
    landmark2 = (parts[1] || '').trim();
  } else if (landmark.includes('&')) {
    const parts = landmark.split('&');
    landmark1 = (parts[0] || '').trim();
    landmark2 = (parts[1] || '').trim();
  } else if (landmark.includes('and')) {
    const parts = landmark.split(/\band\b/i);
    landmark1 = (parts[0] || '').trim();
    landmark2 = (parts[1] || '').trim();
  } else {
    landmark1 = landmark || `${suburb.name} Hub`;
    landmark2 = `${suburb.name} Community Precinct`;
  }
  return { landmark1, landmark2 };
};

const getNearbySuburbs = (suburbName: string) => {
  const filtered = SUBURBS_DATA.filter(s => s.name.toLowerCase() !== suburbName.toLowerCase());
  const index = SUBURBS_DATA.findIndex(s => s.name.toLowerCase() === suburbName.toLowerCase());
  const startIndex = index >= 0 ? index % (filtered.length - 3) : 0;
  return filtered.slice(startIndex, startIndex + 4).map(s => s.name);
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
      // First, check if it's in SUBURBS_DATA statically
      const staticMatch = SUBURBS_DATA.find(s => s.slug === slugInput);
      if (staticMatch) return slugInput;
      
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
      if ((urlEmail || '').trim().toLowerCase() === 'gabrieljrussell@gmail.com') {
        safeStorage.setItem('perth_borewater_admin_email', (urlEmail || '').trim());
        return (urlEmail || '').trim();
      }
    }
    return safeStorage.getItem('perth_borewater_admin_email');
  });

  const isAdmin = React.useMemo(() => {
    return (adminEmail || '').trim().toLowerCase() === 'gabrieljrussell@gmail.com';
  }, [adminEmail]);

  const [showAdminLogin, setShowAdminLogin] = React.useState(false);
  const [adminLoginInput, setAdminLoginInput] = React.useState('');
  const [adminLoginError, setAdminLoginError] = React.useState('');

  // Auto-trigger admin modal when query params `admin` or `login` exist for secret admin access
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (!isAdmin && (urlParams.has('login') || urlParams.has('admin'))) {
      setAdminLoginInput('');
      setShowAdminLogin(true);
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

  const { landmark1, landmark2 } = React.useMemo(() => getLandmarks(selectedSuburb), [selectedSuburb]);

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
  const [pumpPhoto, setPumpPhoto] = React.useState('https://assets.perthborewater.com.au/Water_bore_diagnostic_repair_202606090937.jpeg');
  const [reticPhoto, setReticPhoto] = React.useState('https://assets.perthborewater.com.au/Smart_reticulation.jpeg');
  const [mineralPhoto, setMineralPhoto] = React.useState('https://assets.perthborewater.com.au/Water_bore_stain_removal_system.jpeg');
  const [benefitsPhoto, setBenefitsPhoto] = React.useState('https://images.unsplash.com/photo-1542060748-10c28b629f6f?auto=format&fit=crop&w=800&q=80');
  const [benefitsVideo, setBenefitsVideo] = React.useState('');
  const [isHeroDragging, setIsHeroDragging] = React.useState(false);
  const [isGeologyDragging, setIsGeologyDragging] = React.useState(false);
  const [isPumpDragging, setIsPumpDragging] = React.useState(false);
  const [isReticDragging, setIsReticDragging] = React.useState(false);
  const [isMineralDragging, setIsMineralDragging] = React.useState(false);
  const [isBenefitsDragging, setIsBenefitsDragging] = React.useState(false);
  const [showHeroUrlInput, setShowHeroUrlInput] = React.useState(false);
  const [heroUrlVal, setHeroUrlVal] = React.useState('');
  const [showGeologyUrlInput, setShowGeologyUrlInput] = React.useState(false);
  const [geologyUrlVal, setGeologyUrlVal] = React.useState('');
  const [showPumpUrlInput, setShowPumpUrlInput] = React.useState(false);
  const [pumpUrlVal, setPumpUrlVal] = React.useState('');
  const [showReticUrlInput, setShowReticUrlInput] = React.useState(false);
  const [reticUrlVal, setReticUrlVal] = React.useState('');
  const [showMineralUrlInput, setShowMineralUrlInput] = React.useState(false);
  const [mineralUrlVal, setMineralUrlVal] = React.useState('');
  const [showBenefitsUrlInput, setShowBenefitsUrlInput] = React.useState(false);
  const [benefitsUrlVal, setBenefitsUrlVal] = React.useState('');
  const [backgroundPhoto, setBackgroundPhoto] = React.useState('');
  const [showBgUrlInput, setShowBgUrlInput] = React.useState(false);
  const [bgUrlVal, setBgUrlVal] = React.useState('');

  // Media Overrides persistent local map (statically reads from media_overrides.json)
  const [mediaOverrides, setMediaOverrides] = React.useState<Record<string, { video?: string; photo?: string; geology?: string; background?: string; pump?: string; drilling?: string; benefits?: string; retic?: string; mineral?: string }>>(() => {
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
        benefits: activeData.benefits || '',
        retic: activeData.retic || '',
        mineral: activeData.mineral || '',
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
        if (data && typeof data.email === 'string' && data.email.trim().toLowerCase() === 'gabrieljrussell@gmail.com') {
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
                  benefits: docData.benefits || undefined,
                  retic: docData.retic || undefined,
                  mineral: docData.mineral || undefined,
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
        setAdminEmail(user.email || '');
        safeStorage.setItem('perth_borewater_admin_email', user.email || '');
      }
    });

    return () => unsubscribe();
  }, []);

  const [isEditorMode, setIsEditorMode] = React.useState(false);
  const [llmNarratives, setLlmNarratives] = React.useState<Record<string, string>>({});
  const [loadingNarrative, setLoadingNarrative] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = React.useState(false);

  // States for the fast global search shortcut
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = React.useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = React.useState('');
  const [globalHighlightedIndex, setGlobalHighlightedIndex] = React.useState(0);

  // Setup keyboard listeners, ref & selection for Header global search bar
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle search modal with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(prev => !prev);
      }
      // Close with Escape key
      if (e.key === 'Escape') {
        setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (isGlobalSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isGlobalSearchOpen]);

  const globalSearchTrimmed = globalSearchQuery.trim().toLowerCase();
  const filteredGlobalSuburbs = React.useMemo(() => {
    if (!globalSearchTrimmed) return [];
    const indexSuburbLowerSet = new Set(INDEX_SUBURBS.map(s => s.toLowerCase()));
    return ALL_SUBURBS_LIST.filter(sub => {
      const matchQuery = sub.name.toLowerCase().includes(globalSearchTrimmed) || 
                          sub.postcode.includes(globalSearchTrimmed);
      const isIndexSuburb = indexSuburbLowerSet.has(sub.name.toLowerCase());
      return matchQuery && isIndexSuburb;
    }).slice(0, 10);
  }, [globalSearchTrimmed]);

  React.useEffect(() => {
    setGlobalHighlightedIndex(0);
  }, [globalSearchQuery]);

  const handleGlobalSelectSuburb = (subName: string) => {
    const subSlug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    handleSuburbChange(subSlug);
    setIsGlobalSearchOpen(false);
    setGlobalSearchQuery('');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setGlobalHighlightedIndex(prev => 
        filteredGlobalSuburbs.length > 0 
          ? (prev + 1) % filteredGlobalSuburbs.length 
          : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setGlobalHighlightedIndex(prev => 
        filteredGlobalSuburbs.length > 0 
          ? (prev - 1 + filteredGlobalSuburbs.length) % filteredGlobalSuburbs.length 
          : 0
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredGlobalSuburbs.length > 0 && filteredGlobalSuburbs[globalHighlightedIndex]) {
        handleGlobalSelectSuburb(filteredGlobalSuburbs[globalHighlightedIndex].name);
      }
    }
  };

  React.useEffect(() => {
    // Disabled dynamic AI synthesis to respect non-synthesized verified ground truths.
    setLoadingNarrative(false);
  }, [selectedSuburbSlug]);

  // Hidden file inputs refs
  const videoInputRef = React.useRef<HTMLInputElement>(null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const geologyInputRef = React.useRef<HTMLInputElement>(null);
  const pumpInputRef = React.useRef<HTMLInputElement>(null);
  const reticInputRef = React.useRef<HTMLInputElement>(null);
  const mineralInputRef = React.useRef<HTMLInputElement>(null);
  const heroInputRef = React.useRef<HTMLInputElement>(null);
  const benefitsInputRef = React.useRef<HTMLInputElement>(null);

  const saveMediaOverride = (type: 'video' | 'photo' | 'geology' | 'pump' | 'benefits' | 'retic' | 'mineral', value: string) => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'photo' | 'geology' | 'pump' | 'benefits' | 'retic' | 'mineral' | 'hero-auto') => {
    const file = e.target.files?.[0];
    if (!file || !selectedSuburbSlug) return;

    let targetType: 'video' | 'photo' | 'geology' | 'pump' | 'benefits' | 'retic' | 'mineral' = type === 'hero-auto' ? 'photo' : type;
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
    } else if (targetType === 'retic') {
      setReticPhoto(objectUrl);
    } else if (targetType === 'mineral') {
      setMineralPhoto(objectUrl);
    } else if (targetType === 'benefits') {
      const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4');
      if (isVideo) {
        setBenefitsVideo(objectUrl);
        setBenefitsPhoto('');
      } else {
        setBenefitsPhoto(objectUrl);
        setBenefitsVideo('');
      }
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

  const handleDrop = (e: React.DragEvent, type: 'hero' | 'geology' | 'pump' | 'benefits' | 'retic' | 'mineral', setDragState: (val: boolean) => void) => {
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
    } else if (type === 'retic') {
      const objectUrl = URL.createObjectURL(file);
      setReticPhoto(objectUrl);
      setMediaOverrides(prev => ({
        ...prev,
        [selectedSuburbSlug]: {
          ...prev[selectedSuburbSlug],
          retic: objectUrl
        }
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        saveMediaOverride('retic', reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (type === 'mineral') {
      const objectUrl = URL.createObjectURL(file);
      setMineralPhoto(objectUrl);
      setMediaOverrides(prev => ({
        ...prev,
        [selectedSuburbSlug]: {
          ...prev[selectedSuburbSlug],
          mineral: objectUrl
        }
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        saveMediaOverride('mineral', reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (type === 'benefits') {
      const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4');
      const objectUrl = URL.createObjectURL(file);
      if (isVideo) {
        setBenefitsVideo(objectUrl);
        setBenefitsPhoto('');
      } else {
        setBenefitsPhoto(objectUrl);
        setBenefitsVideo('');
      }
      setMediaOverrides(prev => ({
        ...prev,
        [selectedSuburbSlug]: {
          ...prev[selectedSuburbSlug],
          benefits: objectUrl
        }
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        saveMediaOverride('benefits', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (url: string, type: 'hero' | 'geology' | 'background' | 'pump' | 'benefits' | 'retic' | 'mineral') => {
    if (!selectedSuburbSlug) return;
    const cleanUrl = (url || '').trim();
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
    } else if (type === 'retic') {
      if (!cleanUrl) return;
      setMediaOverrides(prev => {
        const current = prev[selectedSuburbSlug] || {};
        const updated = {
          ...prev,
          [selectedSuburbSlug]: {
            ...current,
            retic: cleanUrl
          }
        };

        // Persist to server filesystem
        persistToServer(updated);

        return updated;
      });
      setReticPhoto(cleanUrl);
    } else if (type === 'mineral') {
      if (!cleanUrl) return;
      setMediaOverrides(prev => {
        const current = prev[selectedSuburbSlug] || {};
        const updated = {
          ...prev,
          [selectedSuburbSlug]: {
            ...current,
            mineral: cleanUrl
          }
        };

        // Persist to server filesystem
        persistToServer(updated);

        return updated;
      });
      setMineralPhoto(cleanUrl);
    } else if (type === 'benefits') {
      if (!cleanUrl) return;
      setMediaOverrides(prev => {
        const current = prev[selectedSuburbSlug] || {};
        const updated = {
          ...prev,
          [selectedSuburbSlug]: {
            ...current,
            benefits: cleanUrl
          }
        };

        // Persist to server filesystem
        persistToServer(updated);

        return updated;
      });

      const isVideo = cleanUrl.endsWith('.mp4') || 
                      cleanUrl.toLowerCase().includes('.mp4') || 
                      cleanUrl.includes('.mp4?') || 
                      cleanUrl.includes('/video/') ||
                      cleanUrl.includes('youtube.com') ||
                      cleanUrl.includes('youtu.be') ||
                      cleanUrl.includes('vimeo.com');
      if (isVideo) {
        setBenefitsVideo(cleanUrl);
        setBenefitsPhoto('');
      } else {
        setBenefitsPhoto(cleanUrl);
        setBenefitsVideo('');
      }
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
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // SEO Tab Title and Local JSON-LD updates on selection change
  React.useEffect(() => {
    if (selectedSuburb) {
      const pc = getPostcode(selectedSuburb.name);
      
      // Focus viewport back to top on any SPA transition change
      window.scrollTo({ top: 0, behavior: 'instant' });
      
      // Update HTML Title tag
      document.title = selectedSuburbSlug 
        ? `Bore Drilling ${selectedSuburb.name} | Expert Water Bore Services & Repairs`
        : `Perth BoreWater Operations | Aquifer Intelligence Command Center`;
      
      // Update HTML Meta Description tag using the dynamic Meta Description requirement
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      const metaDescription = selectedSuburbSlug
        ? `Professional water bore drilling and expert casing services in ${selectedSuburb.name} (${pc}). Safe aquifer access, waterwise filtration, and pump repairs near ${selectedSuburb.landmark || selectedSuburb.name}.`
        : "Perth's premier residential and commercial water bore drilling, pump repairs, reticulation servicing, and downhole geological diagnostics.";
      metaDesc.setAttribute('content', metaDescription);
      
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
        "image": "https://assets.perthborewater.com.au/BoreWaterLogo.webp",
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
    const hasReticOverride = local?.retic && isRealUrl(local.retic);
    const hasMineralOverride = local?.mineral && isRealUrl(local.mineral);
    const hasBgOverride = local?.background && isRealUrl(local.background);
    const hasBenefitsOverride = local?.benefits && isRealUrl(local.benefits);

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
    if (hasReticOverride) {
      setReticPhoto(local.retic);
    }
    if (hasMineralOverride) {
      setMineralPhoto(local.mineral);
    }
    if (hasBenefitsOverride) {
      const isVideo = local.benefits!.endsWith('.mp4') || 
                      local.benefits!.toLowerCase().includes('.mp4') || 
                      local.benefits!.includes('.mp4?') || 
                      local.benefits!.includes('/video/') ||
                      local.benefits!.includes('youtube.com') ||
                      local.benefits!.includes('youtu.be') ||
                      local.benefits!.includes('vimeo.com');
      if (isVideo) {
        setBenefitsVideo(local.benefits!);
        setBenefitsPhoto('');
      } else {
        setBenefitsPhoto(local.benefits!);
        setBenefitsVideo('');
      }
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
    const testReticUrl = slug === 'rockingham'
      ? 'https://perthborewater.com.au/serve-image.php?file=Rockingham-retic.jpg'
      : `https://perthborewater.com.au/serve-image.php?file=${slug}-retic.jpg`;
    const testMineralUrl = slug === 'rockingham'
      ? 'https://perthborewater.com.au/serve-image.php?file=Rockingham-mineral.jpg'
      : `https://perthborewater.com.au/serve-image.php?file=${slug}-mineral.jpg`;
    const testBenefitsUrl = slug === 'rockingham'
      ? 'https://perthborewater.com.au/serve-image.php?file=Rockingham-benefits.jpg'
      : `https://perthborewater.com.au/serve-image.php?file=${slug}-benefits.jpg`;
    const defaultPhoto = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS9LmvO7mawncwLdjxtZvYiFRtsNcXYv_94qu6ByOeZpKC_DpMT1BJh3SXGLDVzfp5kjvH8bFJ8fJq13Qla3cr3Juvr5x7i4kUiFrptGWMgqmmnp5pRo0yizIO0ewmhP1XbQ3vWAEMy79_7G-w0Vc-wCpkIa41CKErQiDCDpPLaQfzT6mBNEUxQaR0V3QVZpmvH6qS-jNTOj4neyC5lLBhzen03c3hh2BkaFw5KDY7pjGJxBOayRdNd4npeabUG0S9eGZ2YYMrmr2W';
    const defaultGeology = 'https://lh3.googleusercontent.com/aida-public/AB6AXu-DHHe-WJTQQyXAhmDCvZ3pj2owtlLrn6z8LZbSV3KdCgClcKXE0BgdV1EhIrz7isw9dK0LmhjQMobpttsB_38b6uOnBtxYrJVJBGwZORnzWy5G4CHTW-05sM8mfnx7ifyNJ08BncfKxqxkwKL5vUAKsPQpYTiIC_jkDaHrQgJnwM3jyznCnIssiuuw3UWpV35yhBP4t8sF3Y5m-vasGbP9KF4x4R7bAbXrdWRLpqHdFjNqvo6NvoDBaMvZTBdBtEMir-Gu59V2RNl';
    const defaultPump = 'https://assets.perthborewater.com.au/Water_bore_diagnostic_repair_202606090937.jpeg';
    const defaultRetic = 'https://assets.perthborewater.com.au/Smart_reticulation.jpeg';
    const defaultMineral = 'https://assets.perthborewater.com.au/Water_bore_stain_removal_system.jpeg';

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

    if (!hasReticOverride) {
      const tempRetic = new Image();
      tempRetic.src = testReticUrl;
      tempRetic.onload = () => {
        setReticPhoto(testReticUrl);
      };
      tempRetic.onerror = () => {
        setReticPhoto(defaultRetic);
      };
    }

    if (!hasMineralOverride) {
      const tempMineral = new Image();
      tempMineral.src = testMineralUrl;
      tempMineral.onload = () => {
        setMineralPhoto(testMineralUrl);
      };
      tempMineral.onerror = () => {
        setMineralPhoto(defaultMineral);
      };
    }

    if (!hasBenefitsOverride) {
      const tempBenefits = new Image();
      tempBenefits.src = testBenefitsUrl;
      tempBenefits.onload = () => {
        setBenefitsPhoto(testBenefitsUrl);
        setBenefitsVideo('');
      };
      tempBenefits.onerror = () => {
        setBenefitsPhoto('https://images.unsplash.com/photo-1542060748-10c28b629f6f?auto=format&fit=crop&w=1200&q=80');
        setBenefitsVideo('');
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
    const hasReticOverride = local?.retic && isRealUrl(local.retic);
    const hasMineralOverride = local?.mineral && isRealUrl(local.mineral);
    const hasBgOverride = local?.background && isRealUrl(local.background);
    const hasBenefitsOverride = local?.benefits && isRealUrl(local.benefits);

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

    if (hasReticOverride) {
      setReticUrlVal(local.retic!);
    } else {
      setReticUrlVal('');
    }

    if (hasMineralOverride) {
      setMineralUrlVal(local.mineral!);
    } else {
      setMineralUrlVal('');
    }

    if (hasBgOverride) {
      setBgUrlVal(local.background!);
    } else {
      setBgUrlVal('');
    }

    if (hasBenefitsOverride) {
      setBenefitsUrlVal(local.benefits!);
    } else {
      setBenefitsUrlVal('');
    }
  }, [selectedSuburbSlug, mediaOverrides, isRealUrl]);

  // Modal states for interactive booking/quotes
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Check My Suburb's Water Yield");
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [modalSuburb, setModalSuburb] = useState('');
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
    setModalSuburb(selectedSuburbSlug ? selectedSuburb.name : '');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !modalSuburb) return;

    setFormLoading(true);
    const receiptCode = 'AD-' + Math.floor(100000 + Math.random() * 900000);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName,
          phone,
          email: emailAddress || '',
          suburb: modalSuburb,
          serviceType: modalTitle,
          notes: additionalNotes || '',
          urgency: modalTitle.toLowerCase().includes('diagnostic') || modalTitle.toLowerCase().includes('emergency') ? 'emergency' : 'standard',
          ticketId: receiptCode,
          source: `Modal Intake Form: ${modalTitle}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        setReceiptNumber(data.ticketId || receiptCode);
        console.log(`[Lead Entry API] Lead processed on server successfully. Response:`, data);
        if (data.emailStatus) {
          console.log(`[Lead Entry API] Resend dispatch status: ${data.emailStatus}`);
        }
      } else {
        const errText = await response.text();
        console.error('Server rejected lead intake:', errText);
        setReceiptNumber(receiptCode);
      }
    } catch (err) {
      console.error('Network failure submitting lead:', err);
      setReceiptNumber(receiptCode);
    } finally {
      setFormLoading(false);
      setFormSubmitted(true);
    }
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
              className="absolute top-4 right-4 text-slate-450 hover:text-slate-800 font-mono text-base transition-colors p-1"
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
            
            <p className="text-[11px] text-slate-505 mb-5 leading-relaxed font-sans">
              Authenticate via standard Google Sign-In to unlock cloud-synced changes, or enter your email to access local offline mode controls.
            </p>

            <button
              type="button"
              onClick={async () => {
                try {
                  const user = await logInWithGoogle();
                  if (user && user.email?.toLowerCase() === 'gabrieljrussell@gmail.com') {
                    setAdminEmail(user.email || '');
                    safeStorage.setItem('perth_borewater_admin_email', user.email || '');
                    setShowAdminLogin(false);
                    setAdminLoginError('');
                    console.log("Admin successfully logged in with Google Firebase Auth.");
                  } else {
                    setAdminLoginError('Google Sign-In succeeded, but you are not the registered administrator.');
                  }
                } catch (err: any) {
                  setAdminLoginError(`Authentication failed: ${err.message || err}`);
                }
              }}
              className="w-full flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs uppercase tracking-wider py-3 rounded-xl font-bold transition-all shadow-md cursor-pointer mb-5 hover:shadow-lg active:scale-98"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign In with Google
            </button>
            
            {isAdmin && (
              <div className="my-5 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-2.5 animate-fade-in text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Active Configuration</span>
                  <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest font-black">Authorized</span>
                </div>
                <p className="text-[10.5px] text-slate-500 leading-normal font-sans">
                  Keep your local code file updated! Tap below to download the compiled media overrides dictionary directly as <strong className="font-mono text-[9.5px] bg-slate-150 px-1 py-0.5 rounded text-slate-700">media_overrides.json</strong>.
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

            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">OR USE OFFLINE CONTROL</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const trimmedLogin = (adminLoginInput || '').trim();
              if (trimmedLogin.toLowerCase() === 'gabrieljrussell@gmail.com') {
                safeStorage.setItem('perth_borewater_admin_email', trimmedLogin);
                setAdminEmail(trimmedLogin);
                setAdminLoginError('');
                setShowAdminLogin(false);
              } else {
                setAdminLoginError('Access Denied. Contact Gabrieljrussell@gmail.com.');
              }
            }} className="space-y-4 font-sans">
              <div>
                <label className="block text-[8.5px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">
                  ADMINISTRATIVE EMAIL
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    autoComplete="off"
                    value={adminLoginInput}
                    onChange={(e) => setAdminLoginInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250/70 rounded-xl pl-4 pr-10 py-3 text-xs text-slate-950 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-550/30 focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                  />
                  <Mail className="w-4 h-4 text-slate-450 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                    className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold font-mono tracking-wider hover:bg-rose-100 transition-all uppercase"
                  >
                    Revoke Mode
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl font-bold transition-all shadow-md cursor-pointer hover:shadow-lg active:scale-98"
                >
                  Authorize admin
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
      <input
        type="file"
        ref={reticInputRef}
        onChange={(e) => handleFileChange(e, 'retic')}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={mineralInputRef}
        onChange={(e) => handleFileChange(e, 'mineral')}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={benefitsInputRef}
        onChange={(e) => handleFileChange(e, 'benefits')}
        accept="video/mp4,video/*,image/*"
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
            onClick={() => handleSuburbChange('')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm overflow-hidden p-0.5 transition-transform group-hover:scale-105 duration-350">
              <img src="https://assets.perthborewater.com.au/BoreWaterLogo.webp" alt="Perth BoreWater Logo" width="36" height="36" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <span className="text-lg font-display font-black tracking-tight text-[#0F2C59] transition-colors">
              Perth<span className="text-[#1D4ED8] font-bold ml-0.5">BoreWater</span>
            </span>
          </div>

          {/* Centered Simplified Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 font-sans">
            <button 
              onClick={() => handleSuburbChange('')}
              className="text-[#0F2C59] hover:text-[#1D4ED8] text-sm font-semibold tracking-wide cursor-pointer focus:outline-none"
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
                      handleOpenModal('Book Site Audit');
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
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Mobile/Tablet Search Circle Button */}
            <button 
              onClick={() => setIsGlobalSearchOpen(true)}
              className="lg:hidden p-2.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-105 transition-all border border-blue-200/30 flex items-center justify-center cursor-pointer focus:outline-none"
              title="Search Suburb"
            >
              <Search className="w-4 h-4 text-[#007AFF] font-bold" />
            </button>
            
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
              <button 
                onClick={() => setIsGlobalSearchOpen(true)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 hover:text-[#007AFF] text-slate-600 transition-all flex items-center justify-center cursor-pointer focus:outline-none hover:scale-105 duration-150"
                title="Search Suburbs (⌘K)"
              >
                <Search className="w-4 h-4 text-[#007AFF]" />
              </button>

              <a 
                href="tel:0863704982" 
                className="bg-[#E2E8F0]/40 hover:bg-[#E2E8F0]/65 text-slate-800 font-sans font-extrabold text-[11px] uppercase tracking-wider px-5 py-2.5 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all border border-slate-300/40 hover:scale-[1.02] active:scale-[0.98] duration-300 flex items-center gap-2 cursor-pointer h-[38px]"
                id="header-phone-pill"
              >
                <Phone className="w-3.5 h-3.5 text-[#007AFF]" />
                <span className="font-extrabold font-sans">(08) 6370 4982</span>
              </a>

              <button 
                onClick={() => handleOpenModal('Book Site Audit')}
                className="bg-[#007AFF] hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(0,122,255,0.45),inset_0_1.5px_0_rgba(255,255,255,0.3)] text-white font-sans text-[11px] uppercase tracking-wider px-5 py-2.5 rounded-full font-black hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-[0_0_15px_rgba(0,122,255,0.3)] border border-blue-500/20 duration-300 flex items-center gap-1.5 h-[38px]"
              >
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                </span>
                <span>Book Site Audit</span>
              </button>
            </div>

            {/* Mobile/Tablet Call Now (08) button */}
            <div className="lg:hidden flex items-center">
              <a 
                href="tel:0863704982" 
                className="p-2.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all border border-emerald-200/40 flex items-center justify-center cursor-pointer"
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
                  handleSuburbChange('');
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
                    handleOpenModal('Book Site Audit');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-[#007AFF] hover:bg-blue-600 text-white font-sans text-xs uppercase tracking-wider py-3.5 rounded-full font-black text-center shadow-[0_0_15px_rgba(0,122,255,0.25)] transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                  </span>
                  Book Site Audit
                </button>
              </div>

            </div>
          </div>
        )}
      </header>

      {selectedSuburbSlug ? (
        <>
          {/* Quick Emergency Support Indicator banner & Breadcrumb */}
          <div className="max-w-7xl mx-auto px-4 pt-6 space-y-4">
            
            {/* Breadcrumb Navigation block */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleSuburbChange('')} 
                className="flex items-center gap-2 text-xs font-mono font-bold text-[#007AFF] hover:text-[#007AFF]/95 bg-[#007AFF]/10 hover:bg-[#007AFF]/15 border border-[#007AFF]/20 px-4 py-2 rounded-xl transition-all cursor-pointer font-sans"
              >
                <span>←</span> Back to Perth Directory
              </button>
              <span className="text-slate-350 font-mono text-xs">/</span>
              <span className="text-slate-500 font-mono text-[11px] font-bold uppercase tracking-wider">{selectedSuburb.name} Subsurface Blueprint</span>
            </div>

            {/* Emergency & Repair Dispatch Hotline Banner */}
            <div className="bg-red-500/[0.04] border border-red-500/20 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row justify-between items-center gap-4 text-left shadow-xs relative overflow-hidden backdrop-blur-xs">
              <div className="absolute right-[-10px] bottom-[-20px] text-red-500/5 font-extrabold text-[7rem] pointer-events-none select-none font-sans font-black">
                +
              </div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-650 shrink-0">
                  <Wrench className="w-6 h-6 text-red-605 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-black text-red-650 uppercase tracking-widest leading-none">
                      Emergency &amp; Repair Dispatch
                    </span>
                  </div>
                  <h4 className="font-display font-black text-slate-900 text-sm mt-1 sm:text-base">Need Urgent Pump, Motor, or Electrical Support?</h4>
                  <p className="text-xs text-slate-500 leading-normal max-w-2xl font-sans">
                    We stand as local mechanics of Perth&apos;s groundwater networks. Quick diagnostic kits, capacitor swaps, and re-wires available today around {selectedSuburb.name}.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 w-full md:w-auto relative z-10 font-sans">
                <a 
                  href="tel:0863704982" 
                  className="w-full md:w-auto text-center bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-xs uppercase px-5 py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-red-500/20 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Phone className="w-4 h-4 shrink-0 animate-pulse" />
                  <span>Emergency Repair: (08) 6370 4982</span>
                </a>
              </div>
            </div>
          </div>

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
          className="bg-white/80 backdrop-blur-2xl border border-white/40 rounded-3xl p-6 sm:p-10 max-w-7xl w-full mx-auto relative z-10 shadow-2xl flex flex-col justify-between"
        >
          
          {/* Top image/video: Active Upload Component */}
          <div 
            onClick={() => isAdmin && heroInputRef.current?.click()}
            onDragOver={(e) => isAdmin && handleDragOver(e, setIsHeroDragging)}
            onDragLeave={(e) => isAdmin && handleDragLeave(e, setIsHeroDragging)}
            onDrop={(e) => isAdmin && handleDrop(e, 'hero', setIsHeroDragging)}
            className={`w-full max-w-2xl mx-auto aspect-video rounded-3xl overflow-hidden relative mb-8 border bg-[#0a0a0a] shadow-inner transition-all duration-300 ${
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
                  muted 
                  loop 
                  playsInline 
                  preload="none"
                  poster={heroPhoto || undefined}
                  className="w-full h-full object-contain mx-auto bg-[#0a0a0a]"
                  onError={() => {
                    console.warn("Video failed to play or media event warning.");
                  }}
                />
              )
            ) : (
              <img 
                src={heroPhoto || undefined} 
                alt={`Bore drilling services in ${selectedSuburb.name} - Perth Bore Water`} 
                className="w-full h-full object-contain mx-auto bg-[#0a0a0a]"
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
              Professional Bore Drilling &amp; Maintenance in {selectedSuburb.name}
            </h1>

            {/* Geological statement */}
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              We specialize in providing water bore drilling &amp; upkeep near <strong className="text-slate-900 font-bold">{landmark1}</strong> and the neighboring <strong className="text-slate-900 font-bold">{landmark2}</strong> fields. Access the Superficial Aquifer at <span className="text-[#007AFF] font-bold">{getDepthRange(selectedSuburb.name).text}</span> depth. Sustainable irrigation engineered for <strong className="text-slate-900 font-bold">{getSoilData(selectedSuburb.name).name}</strong> {getSoilData(selectedSuburb.name).type}.
            </p>

            {/* Social Trust Ribbon (Proof-Hybrid Update) */}
            <div className="inline-flex items-center gap-2 bg-[#0B1221] text-slate-200 text-xs px-4.5 py-2 rounded-full shadow-md border border-slate-800 font-sans tracking-wide">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>
                Trusted by <strong className="text-white">45+ {selectedSuburb.name} families</strong> near <strong className="text-[#38BDF8]">{landmark1}</strong>
              </span>
            </div>

            {/* High-Gloss Action Call-to-actions (Waterwise checking primary CTA & emergency repair secondary CTA) */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center w-full max-w-2xl mx-auto font-sans">
              <button
                onClick={() => handleOpenModal("Check My Suburb's Water Yield")}
                className="flex-grow bg-[#007AFF] hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(0,122,255,0.4)] text-white px-6 py-3.5 rounded-full font-black uppercase text-[11px] tracking-wider border border-blue-500/20 shadow-[0_0_10px_rgba(0,122,255,0.2)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-center duration-300"
              >
                Check My Suburb&apos;s Water Yield →
              </button>
              
              <button
                onClick={() => handleOpenModal('My Bore is Broken – Request Emergency Repair')}
                className="flex-grow bg-red-600 hover:bg-red-700 text-white px-6 py-3.5 rounded-full font-black uppercase text-[11px] tracking-wider shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 border border-red-500/15 duration-300"
              >
                <Wrench className="w-3.5 h-3.5 text-white shrink-0 animate-bounce" />
                <span>My Bore is Broken – Request Emergency Repair</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Bento Grid - Formulated to display exactly what is featured in the screenshot */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full z-10" id="bento-grid-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch justify-center">
          
          {/* Card 1: Technical Analysis Bento Box */}
          <div id="bore-atlas-blueprint" className="col-span-1 md:col-span-2 lg:col-span-6 bg-white border border-slate-200/60 rounded-3xl p-8 hover:shadow-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-left flex flex-col justify-start min-h-[350px]">
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
                  LOCAL GEOLOGY TYPE
                </span>
                <span className="text-slate-800 font-semibold font-sans text-sm mt-0.5 block">
                  {selectedSuburb.soilComposition}
                </span>
                <span className="text-slate-605 font-medium font-sans text-xs mt-1 block leading-relaxed">
                  {getConsultantSpeak(selectedSuburb.name).profile}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#007AFF] font-bold uppercase block">
                  COMMON HYDROLOGIC ISSUE
                </span>
                <span className="text-[#007AFF] font-extrabold text-xs font-sans mt-0.5 block uppercase">
                  {selectedSuburb.localHeadache}
                </span>
                <span className="text-slate-705 font-sans text-xs mt-1 block font-medium leading-relaxed">
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

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-mono text-[10px] text-slate-500 space-y-1">
                <span className="text-slate-400 block font-bold">HOLE CALIBER REPORT</span>
                <p className="text-slate-705 font-medium font-sans">
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

          {/* Card 2: Drill Depth with Interactive SoilProfileDiagram */}
          <div className="col-span-1 md:col-span-2 lg:col-span-6 h-full flex flex-col" id="geological-cross-section-diagram-card">
            <SoilProfileDiagram 
              soilType={getSoilTypeAndDepthFromSuburbApp(selectedSuburb.name).soilType} 
              waterDepth={getSoilTypeAndDepthFromSuburbApp(selectedSuburb.name).waterDepth} 
            />
          </div>

          {/* Card 3: Watering Days Card */}
          <div className="col-span-1 md:col-span-1 lg:col-span-6 bg-white border border-slate-200/60 rounded-3xl p-6 hover:shadow-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col items-start justify-between min-h-[220px] text-left">
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

          {/* Card 5: Staining Risk & Mineral Concentration Gauge */}
          <div className="col-span-1 md:col-span-1 lg:col-span-6 bg-white border border-slate-200/60 rounded-3xl p-6 hover:shadow-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between min-h-[220px] text-left">
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
                  selectedSuburb.ironRisk === 'Moderate' ? 'bg-yellow-105 text-yellow-850' :
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
              
              <p className="text-[10.5px] text-slate-500 italic leading-snug">
                {getIronRiskExplanation(selectedSuburb.name)}
                <span className="block mt-1.5 font-semibold text-slate-700 not-italic">
                  Managing {selectedSuburb.soilComposition} aquifers to counter {selectedSuburb.localHeadache}.
                </span>
              </p>
            </div>
          </div>

          {/* Card 4: Geological Evidence layout - Split Grid Layout */}
          <div 
            onClick={() => isAdmin && geologyInputRef.current?.click()}
            onDragOver={(e) => isAdmin && handleDragOver(e, setIsGeologyDragging)}
            onDragLeave={(e) => isAdmin && handleDragLeave(e, setIsGeologyDragging)}
            onDrop={(e) => isAdmin && handleDrop(e, 'geology', setIsGeologyDragging)}
            className={`col-span-1 md:col-span-2 lg:col-span-12 rounded-3xl relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.06)] border transition-all duration-300 text-left ${
              isAdmin 
                ? 'cursor-pointer group hover:border-amber-500/50 border-slate-800 bg-slate-950/95' 
                : 'border-slate-800 bg-slate-950/95'
            } ${
              isGeologyDragging && isAdmin
                ? 'border-amber-500 ring-4 ring-amber-500/50 scale-[1.01] bg-amber-955' 
                : ''
            }`}
          >
            {/* Drag and Drop visual feedback */}
            {isGeologyDragging && isAdmin ? (
              <div className="absolute inset-0 bg-amber-955/90 backdrop-blur-xs flex flex-col items-center justify-center text-center z-45 p-4 transition-all animate-fade-in font-sans">
                <Upload className="w-12 h-12 text-amber-400 mb-2 animate-bounce" />
                <p className="text-white font-display font-black text-base">Drop rockingham-geology.jpg here</p>
                <p className="text-amber-405 text-xs font-mono tracking-wider uppercase">Accepts JPG/PNG image</p>
              </div>
            ) : isAdmin ? (
              <div className="absolute top-4 right-4 z-40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    geologyInputRef.current?.click();
                  }}
                  className="bg-black/85 hover:bg-amber-600 border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow-md transition-all active:scale-95 animate-fade-in cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Image</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowGeologyUrlInput(true);
                  }}
                  className="bg-black/85 hover:bg-yellow-600 border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow-md transition-all active:scale-95 animate-fade-in cursor-pointer"
                >
                  <Link className="w-3 h-3 text-yellow-500" />
                  <span>URL link</span>
                </button>
              </div>
            ) : null}

            {/* Inline URL Input overlay screen */}
            {showGeologyUrlInput && (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="absolute inset-0 bg-slate-950/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 z-45 animate-fade-in"
              >
                <div className="w-full max-w-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-sans font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Link className="w-3.5 h-3.5 text-amber-400" />
                      Geology Image URL
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowGeologyUrlInput(false)}
                      className="text-slate-400 hover:text-white text-xs font-mono bg-white/10 hover:bg-white/20 px-2 py-1 rounded"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/geology.jpg"
                      value={geologyUrlVal}
                      onChange={(e) => setGeologyUrlVal(e.target.value)}
                      className="bg-white/10 border border-white/20 text-white rounded-xl px-3.5 py-2 text-xs flex-grow outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handleUrlSubmit(geologyUrlVal, 'geology');
                        setShowGeologyUrlInput(false);
                      }}
                      className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Split layout: Text on one side, Image on the other */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 md:p-10 relative z-10 w-full items-stretch">
              
              {/* Left Column: text and overlays */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="text-[9px] font-mono font-black text-amber-400 uppercase tracking-widest block">
                    CORE SPECTROSCOPY EVIDENCE
                  </span>
                  <h4 className="text-white font-display font-black text-xl md:text-2xl tracking-tight leading-tight">
                    Geological Strata Profile
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    Real evidence tracking borehole core samples to verify drill compaction, water layers, and secure water quality. Our core spectroscopy reports outline the physical composition of aquifer access pathways in {selectedSuburb.name}.
                  </p>
                </div>

                {/* Scientific Spectroscopy Overlays for Geological authenticity */}
                <div className="flex flex-col gap-3 pointer-events-none bg-slate-900/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 text-[10px] sm:text-[11px] font-mono text-slate-300 w-full">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-extrabold tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    AQUIFER DIAGNOSTIC ACTIVE
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-left border-t border-white/10 pt-3">
                    <div className="text-slate-400">AQUIFER LAYER:</div> 
                    <div className="text-white font-bold">{selectedSuburb.soilComposition}</div>
                    
                    <div className="text-slate-400">DIAGNOSTIC TARGET:</div> 
                    <div className="text-white font-bold">{getDepthRange(selectedSuburb.name).text}</div>
                    
                    <div className="text-slate-400">ESTIMATED STRETCH:</div> 
                    <div className="text-white font-bold">~{selectedSuburb.typicalDepth}</div>
                    
                    <div className="text-slate-400">STAINING INDEX:</div> 
                    <div className="text-white font-bold uppercase">{selectedSuburb.ironRisk} RISK</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Contained Image with perfectly clean aspect-ratio and custom alignment */}
              <div className="lg:col-span-7 flex flex-col justify-center w-full min-h-[280px] sm:min-h-[350px] lg:min-h-[385px]">
                <div className="w-full h-full relative rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/10 shadow-inner flex items-center justify-center">
                  <img 
                    src={geologyPhoto || undefined} 
                    alt={`Geological core spectroscopy and depth evidence in ${selectedSuburb.name} - Perth Bore Water`} 
                    className="w-full h-full object-contain mx-auto opacity-95 animate-fade-in max-h-[385px]"
                    referrerPolicy="no-referrer"
                    key={geologyPhoto || 'geology'}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3.5 pointer-events-none flex justify-between items-center text-[9px] font-mono text-slate-400">
                    <span>IMAGE SPECIMEN FILER</span>
                    <span>100% SCALE DISPLAY</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Card 6: Aquifer Health Check & Maintenance Checklist */}
          <div className="col-span-1 md:col-span-2 lg:col-span-12 bg-white border border-slate-200/60 rounded-3xl p-7 sm:p-8 hover:shadow-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between text-left shrink-0" id="maintenance-checklist-card">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <ShieldCheck className="w-6 h-6 text-amber-600" />
                </div>
                <span className="font-mono text-[9px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-100">
                  HEALTH CHECKLIST
                </span>
              </div>
              
              <div className="space-y-3.5">
                <h3 className="font-display font-black text-slate-900 text-base">Bore Common Failures &amp; Upkeep</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Most water bores do not require fully new drill layouts — they are restored through routine capacitor, relay, and valve maintenance. Before booking a costly full rebuild, review our checklist:
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold text-slate-600 font-sans pt-1">
                  <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/55 shadow-xs">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                     <span>Testing Start Capacitors &amp; Relays</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/55 shadow-xs">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                     <span>Solenoid Valve Resistance Checks</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/55 shadow-xs">
                     <span className="w-2 h-2 rounded-full bg-[#007AFF] shrink-0" />
                     <span>Iron Stain Prevention Treatments</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/55 shadow-xs">
                     <span className="w-2 h-2 rounded-full bg-[#007AFF] shrink-0" />
                     <span>Motor Insulation Megger Tests</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 text-[10.5px] text-slate-500 italic font-sans flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
              <span>💡 Maintaining the health of your existing pump &amp; capacitors saves homeowners thousands on average.</span>
              <span className="font-mono text-[9px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">PREVENTATIVE OPTIMIZATION</span>
            </div>
          </div>

          {/* TIER 1: THE FORENSIC REPAIR (Emergency) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white border border-slate-200/60 rounded-3xl p-6.5 hover:shadow-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between min-h-[480px] text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-rose-500 text-white font-mono font-bold text-[8px] px-3.5 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              EMERGENCY DISPATCH
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[9px] font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-100 uppercase tracking-wider">
                  Tier I: Forensic
                </span>
              </div>
              <h4 className="font-display font-black text-slate-900 text-lg leading-tight animate-fade-in-up">Bore Diagnostics & Recovery</h4>
              
              {/* Technical Pump Image Showcase */}
              <div 
                onClick={() => isAdmin && pumpInputRef.current?.click()}
                onDragOver={(e) => isAdmin && handleDragOver(e, setIsPumpDragging)}
                onDragLeave={(e) => isAdmin && handleDragLeave(e, setIsPumpDragging)}
                onDrop={(e) => isAdmin && handleDrop(e, 'pump', setIsPumpDragging)}
                className={`mt-4 w-full h-36 rounded-2xl overflow-hidden border relative flex-shrink-0 transition-all duration-300 ${
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
                    <p className="text-rose-405 text-[8px] font-mono tracking-wider uppercase">Accepts JPG/PNG image</p>
                  </div>
                ) : (
                  <>
                    <img 
                      src={pumpPhoto || undefined} 
                      alt={`Bore drilling services in ${selectedSuburb.name} - Perth Bore Water`} 
                      className="w-full h-full object-cover transition-all animate-fade-in"
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
                          className="bg-black/85 hover:bg-rose-600 border border-white/20 px-2 py-1 rounded text-[8.5px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow-md transition-all active:scale-95 whitespace-nowrap"
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
                        const trimmedVal = (pumpUrlVal || '').trim();
                        if (trimmedVal) {
                          handleUrlSubmit(trimmedVal, 'pump');
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

              <p className="text-xs text-slate-500 mt-4 leading-relaxed border-b border-slate-100 pb-2.5">
                High-priority dispatch focusing on mechanical, electrical, and flow faults downhole.
              </p>

              {/* Response Times */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 text-red-705 rounded text-[8.5px] font-mono font-bold uppercase tracking-wider animate-pulse">
                  <span className="w-1 h-1 rounded-full bg-red-650 shrink-0"></span>
                  24-48 HR Dispatch
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-705 rounded text-[8.5px] font-mono font-bold uppercase tracking-wider">
                  ⚡ Same-Day Faults
                </span>
              </div>
              
              <ul className="mt-4 space-y-2 text-[11px] text-slate-650 font-medium font-sans">
                <li className="flex items-center gap-1.5">
                  <span className="text-rose-500 font-bold text-xs select-none">✓</span>
                  <span>Submersible pump diagnosis &amp; complete borehole recovery</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-rose-500 font-bold text-xs select-none">✓</span>
                  <span>Fused motor diagnostics &amp; insulation testing</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-[8px] font-mono text-slate-400 font-bold uppercase tracking-widest">CALLOUT ESTIMATE</span>
                <span className="text-[11px] font-bold text-rose-600 font-mono">PRIORITY SPEED</span>
              </div>
              <button 
                onClick={() => handleOpenModal('Book Site Audit')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10.5px] font-bold px-4 py-2 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm border border-emerald-500/20 text-center font-sans tracking-wide duration-300 hover:shadow-emerald-500/20 shrink-0"
              >
                Book Site Audit
              </button>
            </div>
          </div>

          {/* TIER 2: THE SYSTEM OPTIMIZER (Maintenance) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white border-2 border-[#007AFF] rounded-3xl p-6 hover:shadow-xl transition-all shadow-[0_8px_30px_rgba(0,122,255,0.03)] flex flex-col justify-between min-h-[480px] text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#007AFF] text-white font-mono font-bold text-[8px] px-3.5 py-1 rounded-bl-xl uppercase tracking-wider">
              SYSTEM ECO-RATING
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100 uppercase tracking-wider">
                  Tier II: Optimization
                </span>
              </div>
              <h4 className="font-display font-black text-slate-900 text-lg leading-tight animate-fade-in-up">Reticulation & Flow Optimization</h4>
              
              {/* Technical Retic Image Showcase */}
              <div 
                onClick={() => isAdmin && reticInputRef.current?.click()}
                onDragOver={(e) => isAdmin && handleDragOver(e, setIsReticDragging)}
                onDragLeave={(e) => isAdmin && handleDragLeave(e, setIsReticDragging)}
                onDrop={(e) => isAdmin && handleDrop(e, 'retic', setIsReticDragging)}
                className={`mt-4 w-full h-36 rounded-2xl overflow-hidden border relative flex-shrink-0 transition-all duration-300 ${
                  isAdmin 
                    ? 'cursor-pointer group hover:border-[#007AFF]/50 border-slate-200/60 bg-slate-900' 
                    : 'border-slate-100 bg-slate-50'
                } ${
                  isReticDragging && isAdmin
                    ? 'border-[#007AFF] ring-4 ring-[#007AFF]/30 scale-[1.01] bg-blue-950/10' 
                    : ''
                }`}
              >
                {isReticDragging && isAdmin ? (
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none p-3 text-center">
                    <Upload className="w-8 h-8 text-[#007AFF] mb-1 animate-bounce" />
                    <p className="text-white font-display font-black text-xs">Drop reticulation image here</p>
                    <p className="text-blue-250 text-[8px] font-mono tracking-wider uppercase">Accepts JPG/PNG image</p>
                  </div>
                ) : (
                  <>
                    <img 
                      src={reticPhoto || undefined} 
                      alt={`Reticulation system optimization in ${selectedSuburb.name} - Perth Bore Water`} 
                      className="w-full h-full object-cover transition-all animate-fade-in"
                      referrerPolicy="no-referrer"
                      key={reticPhoto || 'retic'}
                      onError={(e) => {
                        e.currentTarget.src = "https://assets.perthborewater.com.au/Smart_reticulation.jpeg";
                      }}
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-900/85 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[8.5px] text-white font-mono uppercase tracking-widest font-bold">
                      FLOW OPTIMIZER
                    </div>
                    
                    {isAdmin && (
                      <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            reticInputRef.current?.click();
                          }}
                          className="bg-black/85 hover:bg-[#007AFF] border border-white/20 px-2 py-1 rounded text-[8.5px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow-md transition-all active:scale-95 whitespace-nowrap"
                        >
                          <Upload className="w-2.5 h-2.5" />
                          <span>Upload</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowReticUrlInput(!showReticUrlInput);
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
              {showReticUrlInput && isAdmin && (
                <div className="mt-2.5 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 animate-fade-in text-left">
                  <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <span>RETICULATION ASSET URL:</span>
                  </p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={reticUrlVal}
                      onChange={(e) => setReticUrlVal(e.target.value)}
                      placeholder="https://example.com/asset-retic.jpg"
                      className="flex-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-[11px] font-sans text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const trimmedVal = (reticUrlVal || '').trim();
                        if (trimmedVal) {
                          handleUrlSubmit(trimmedVal, 'retic');
                          setShowReticUrlInput(false);
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-500 mt-4 leading-relaxed border-b border-slate-100 pb-2.5">
                Precision flow balancing and wireless automation retrofitting for modern water conservation.
              </p>
              
              <ul className="mt-4 space-y-2 text-[11px] text-slate-650 font-medium font-sans">
                <li className="flex items-center gap-1.5">
                  <span className="text-[#007AFF] font-bold text-xs select-none">✓</span>
                  <span>Smart Controller retrofitting (Hydrawise / WiFi weather schedules)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-[#007AFF] font-bold text-xs select-none">✓</span>
                  <span>Blocked sprinkler remediation &amp; nozzle calibration</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-[#007AFF] font-bold text-xs select-none">✓</span>
                  <span>Water-wise system audits to maximize zone drawing performance</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-[8px] font-mono text-slate-400 font-bold uppercase tracking-widest">SAVINGS RATING</span>
                <span className="text-[11px] font-bold text-blue-600 font-mono font-sans">WATER-WISE APPR.</span>
              </div>
              <button 
                onClick={() => handleOpenModal('Improve My System Efficiency')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10.5px] font-bold px-4 py-2 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm border border-emerald-500/20 text-center font-sans tracking-wide duration-300 hover:shadow-emerald-500/20 shrink-0"
              >
                Improve Efficiency
              </button>
            </div>
          </div>

          {/* TIER 3: THE STAIN SCIENTIST (Remediation) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white border border-slate-200/60 rounded-3xl p-6 hover:shadow-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between min-h-[480px] text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-white font-mono font-bold text-[8px] px-3.5 py-1 rounded-bl-xl uppercase tracking-wider">
              CHEMISTRY DEPOT
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[9px] font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-100 uppercase tracking-wider">
                  Tier III: Remediation
                </span>
              </div>
              <h4 className="font-display font-black text-slate-900 text-lg leading-tight animate-fade-in-up">Mineral & Iron Oxide Management</h4>
              
              {/* Technical Mineral Image Showcase */}
              <div 
                onClick={() => isAdmin && mineralInputRef.current?.click()}
                onDragOver={(e) => isAdmin && handleDragOver(e, setIsMineralDragging)}
                onDragLeave={(e) => isAdmin && handleDragLeave(e, setIsMineralDragging)}
                onDrop={(e) => isAdmin && handleDrop(e, 'mineral', setIsMineralDragging)}
                className={`mt-4 w-full h-36 rounded-2xl overflow-hidden border relative flex-shrink-0 transition-all duration-300 ${
                  isAdmin 
                    ? 'cursor-pointer group hover:border-amber-500/50 border-slate-200/60 bg-slate-900' 
                    : 'border-slate-100 bg-slate-50'
                } ${
                  isMineralDragging && isAdmin
                    ? 'border-amber-500 ring-4 ring-amber-500/30 scale-[1.01] bg-amber-950/10' 
                    : ''
                }`}
              >
                {isMineralDragging && isAdmin ? (
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none p-3 text-center">
                    <Upload className="w-8 h-8 text-amber-500 mb-1 animate-bounce" />
                    <p className="text-white font-display font-black text-xs">Drop mineral treatment image here</p>
                    <p className="text-amber-205 text-[8px] font-mono tracking-wider uppercase">Accepts JPG/PNG image</p>
                  </div>
                ) : (
                  <>
                    <img 
                      src={mineralPhoto || undefined} 
                      alt={`Mineral stain mitigation in ${selectedSuburb.name} - Perth Bore Water`} 
                      className="w-full h-full object-cover transition-all animate-fade-in"
                      referrerPolicy="no-referrer"
                      key={mineralPhoto || 'mineral'}
                      onError={(e) => {
                        e.currentTarget.src = "https://assets.perthborewater.com.au/Water_bore_stain_removal_system.jpeg";
                      }}
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-900/85 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[8.5px] text-white font-mono uppercase tracking-widest font-bold">
                      MINERAL FILTER
                    </div>
                    
                    {isAdmin && (
                      <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            mineralInputRef.current?.click();
                          }}
                          className="bg-black/85 hover:bg-amber-600 border border-white/20 px-2 py-1 rounded text-[8.5px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow-md transition-all active:scale-95 whitespace-nowrap"
                        >
                          <Upload className="w-2.5 h-2.5" />
                          <span>Upload</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMineralUrlInput(!showMineralUrlInput);
                          }}
                          className="bg-black/85 hover:bg-amber-600 border border-white/25 px-1.5 py-1 rounded text-[8.5px] font-bold text-white uppercase tracking-wider flex items-center gap-0.5 shadow-md transition-all active:scale-95"
                        >
                          <span>URL</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* URL Input Box inside Card */}
              {showMineralUrlInput && isAdmin && (
                <div className="mt-2.5 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 animate-fade-in text-left">
                  <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <span>MINERAL ASSET URL:</span>
                  </p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={mineralUrlVal}
                      onChange={(e) => setMineralUrlVal(e.target.value)}
                      placeholder="https://example.com/asset-mineral.jpg"
                      className="flex-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-[11px] font-sans text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const trimmedVal = (mineralUrlVal || '').trim();
                        if (trimmedVal) {
                          handleUrlSubmit(trimmedVal, 'mineral');
                          setShowMineralUrlInput(false);
                        }
                      }}
                      className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-500 mt-4 leading-relaxed border-b border-slate-100 pb-2.5">
                Mitigate mineral oxidation staining and treat aquifer chemical hazards before they impact surface brickwork.
              </p>
              
              <ul className="mt-4 space-y-2 text-[11px] text-slate-650 font-medium font-sans">
                <li className="flex items-center gap-1.5">
                  <span className="text-amber-500 font-bold text-xs select-none">✓</span>
                  <span>Chemical bio-friendly iron-stain removal on masonry &amp; concrete</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-amber-500 font-bold text-xs select-none">✓</span>
                  <span>Automated 'Stain-Stopper' inline filtration &amp; chemical dosing</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-amber-500 font-bold text-xs select-none">✓</span>
                  <span>Precision downhole chemical washing &amp; descaling</span>
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
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10.5px] font-bold px-4 py-2 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm border border-emerald-500/20 text-center font-sans tracking-wide duration-300 hover:shadow-emerald-500/20 shrink-0"
              >
                Book Water Test
              </button>
            </div>
          </div>

        </div>

        {/* Brand New: Local Geological Analysis & Neighborhood Expertise */}
        {(() => {
          const profile = SUBURB_GEOLOGICAL_DATA[selectedSuburbSlug];
          if (!profile) return null;
          return (
            <section className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white border border-slate-200/80 rounded-[2rem] p-7 sm:p-9 shadow-xs text-left mt-8 w-full" id="local-geo-analysis-section">
              <div className="md:col-span-8 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#007AFF] animate-pulse" />
                  <span className="text-xs font-mono font-bold text-[#007AFF] uppercase tracking-wider block">
                    Local Geological Analysis Division
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight leading-tight">
                  {profile.headline}
                </h2>
                <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans pt-1">
                  <p>{profile.insightParagraph1}</p>
                  <p>{profile.insightParagraph2}</p>
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col justify-between bg-slate-50 border border-slate-150 rounded-2xl p-6 relative overflow-hidden min-h-[220px]">
                <div className="space-y-3.5 relative z-10">
                  <span className="text-slate-400 font-mono text-[9px] font-bold uppercase tracking-widest block">
                    Neighborhood Expertise
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                    {profile.trustSignal}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/50 flex items-center justify-between font-mono text-[9px] text-slate-400 font-bold uppercase tracking-widest relative z-10">
                  <span>✦ EXPERT LED</span>
                  <span className="text-[#007AFF]">VERIFIED BLUEPRINT</span>
                </div>
                <div className="absolute right-[-15px] bottom-[-25px] text-[#007AFF]/[0.02] font-black text-[10rem] pointer-events-none select-none font-sans leading-none">
                  ✓
                </div>
              </div>
            </section>
          );
        })()}

        {/* Brand New: Hyper-Local Hydrology Narrative Section */}
        <section className="bg-white border border-slate-200/60 rounded-3xl p-8 hover:shadow-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-left mt-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left side content */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
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
                  
                  {/* Trust Signals: Local Knowledge block */}
                  <div className="bg-slate-50 border border-slate-200/60 p-4.5 rounded-2xl space-y-1.5 mt-4">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-600 uppercase block flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Expertise &amp; Local Knowledge
                    </span>
                    <p className="text-xs text-slate-755 leading-relaxed font-sans font-medium">
                      We specialize in navigating <strong className="text-slate-900 font-bold">{selectedSuburb.name}</strong>&apos;s unique <strong className="text-slate-900 font-extrabold">{selectedSuburb.soilComposition}</strong> layers to prevent <strong className="text-slate-900 font-extrabold">{selectedSuburb.localHeadache}</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust approval indicator */}
              <div className="flex items-center gap-3 bg-slate-50 p-4 border border-slate-100 rounded-2xl w-fit mt-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20 text-amber-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block font-bold">REGIONAL APPROVAL</span>
                  <span className="text-xs text-slate-800 font-extrabold font-mono uppercase">WA BORE LIC #2241</span>
                </div>
              </div>
            </div>

            {/* Right side content: Humanized Driller Photo */}
            <div className="lg:col-span-4 flex flex-col justify-center">
              <div className="relative group overflow-hidden rounded-2xl border border-slate-200 shadow-xs aspect-[4/3] bg-white flex-shrink-0 h-full min-h-[260px]">
                <img 
                  src="/serve-image.php?file=Water_bore_technician_homeowner_%E2%80%A6_202606091214.jpeg&w=400&q=80" 
                  alt={`Water bore technician smiling and shaking hands with an appreciative homeowner in ${selectedSuburb.name}`} 
                  width={400}
                  height={300}
                  loading="lazy"
                  className="w-full h-full object-contain transition-all group-hover:scale-[1.02]"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.className = "w-full h-full object-cover transition-all group-hover:scale-102";
                    e.currentTarget.src = "https://assets.perthborewater.com.au/Water_bore_technician_homeowner_%E2%80%A6_202606091214.jpeg";
                  }}
                />
                
                {/* Image caption badge */}
                <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-xs p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/25 text-emerald-400 shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block font-bold">YOUR LOCAL PARTNER</span>
                    <span className="text-[10px] text-white font-bold leading-tight block">Friendly, high-yield certified service</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Brand New: Benefits & Project Results Section */}
        <section className="bg-white border border-slate-200/60 rounded-3xl p-8 hover:shadow-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-left mt-8 w-full">
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold tracking-widest text-[#007AFF] uppercase bg-[#007AFF]/10 border border-[#007AFF]/15 px-3 py-1 rounded-full">
                  VERIFIED BENEFITS &amp; WATERWISE RESULTS
                </span>
                <h3 className="font-display font-black text-2xl text-slate-900 leading-tight">
                  Water Bore Engineering Results &amp; Household Benefits in {selectedSuburb.name}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-3xl font-sans font-medium">
                  Our customized casing, premium slot specifications, and downhole flow velocity designs translate directly to long-term cost savings, massive irrigation volume, and pristine water flow.
                </p>
              </div>
            </div>

            {/* Interactive Media Container matching pumpPhoto styling and options */}
            <div className="relative group/benefits rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 hover:border-slate-350 transition-all shadow-lg aspect-video md:max-h-[480px] w-full flex items-center justify-center">
              
              {/* Optional Admin Hover Shield Overlay */}
              {isAdmin && (
                <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
                  <span className="text-[9px] font-mono font-semibold bg-amber-500 text-white px-2.5 py-1 rounded-md shadow-sm select-none">
                    ADMIN MEDIA OVERLAY
                  </span>
                  <button
                    onClick={() => setShowBenefitsUrlInput(!showBenefitsUrlInput)}
                    className="p-1 px-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-amber-400 hover:text-amber-300 font-mono text-[9px] font-black rounded-lg shadow transition-colors cursor-pointer"
                  >
                    {showBenefitsUrlInput ? 'HIDE URL' : 'EDIT URL'}
                  </button>
                </div>
              )}

              {/* URL Input Box overlay when requested by Admin */}
              {isAdmin && showBenefitsUrlInput && (
                <div className="absolute inset-x-0 bottom-0 bg-slate-950/95 backdrop-blur-md p-5 border-t border-slate-800/80 z-25 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black text-slate-300 uppercase tracking-widest">
                      Custom URL Asset Proxy Setup
                    </span>
                    <button 
                      onClick={() => setShowBenefitsUrlInput(false)}
                      className="text-slate-500 hover:text-white transition-colors font-semibold text-xs cursor-pointer"
                    >
                      ✕ CLOSE
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={benefitsUrlVal}
                      onChange={(e) => setBenefitsUrlVal(e.target.value)}
                      placeholder="https://example.com/household-benefits-results.jpg"
                      className="flex-grow bg-slate-900 border border-slate-800 text-slate-200 text-xs px-4 py-2.5 rounded-xl font-mono tracking-wide focus:outline-none focus:border-[#007AFF]"
                    />
                    <button
                      onClick={() => {
                        const trimmed = (benefitsUrlVal || '').trim();
                        if (trimmed) handleUrlSubmit(trimmed, 'benefits');
                        setShowBenefitsUrlInput(false);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10.5px] font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      APPLY
                    </button>
                  </div>
                </div>
              )}

              {/* Admin Double Click / Drag-and-Drop Trigger Container */}
              <div 
                className={`absolute inset-0 z-15 transition-all duration-300 flex items-center justify-center ${
                  isAdmin 
                    ? 'cursor-pointer hover:bg-black/40 group-hover/benefits:opacity-100' 
                    : 'pointer-events-none'
                } ${isBenefitsDragging ? 'bg-emerald-600/30 border-2 border-dashed border-emerald-500' : ''}`}
                onClick={() => isAdmin && benefitsInputRef.current?.click()}
                onDragOver={(e) => isAdmin && handleDragOver(e, setIsBenefitsDragging)}
                onDragLeave={(e) => isAdmin && handleDragLeave(e, setIsBenefitsDragging)}
                onDrop={(e) => isAdmin && handleDrop(e, 'benefits', setIsBenefitsDragging)}
              >
                {isAdmin && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/benefits:opacity-100 bg-slate-950/55 backdrop-blur-xs transition-opacity duration-200 p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/20 flex items-center justify-center text-[#007AFF] mb-2.5">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-white font-display font-black text-xs">Drop or click to update Benefits Media</p>
                    <p className="text-[10px] text-slate-300 font-mono mt-0.5 animate-pulse">Supports direct MP4 video, or JPG / PNG image</p>
                  </div>
                )}
              </div>

              {/* Actual image or video rendering */}
              {benefitsVideo && isRealUrl(benefitsVideo) ? (
                <video
                  src={benefitsVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="none"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const t = e.target as HTMLVideoElement;
                    t.style.display = 'none';
                  }}
                />
              ) : (
                <img
                  src={benefitsPhoto || 'https://images.unsplash.com/photo-1542060748-10c28b629f6f?auto=format&fit=crop&w=1200&q=80'}
                  alt={`Water Bore Engineering Benefits in ${selectedSuburb.name}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/benefits:scale-101"
                />
              )}

            </div>

            {/* List of high-value local outcomes/benefits in 4-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-50 border border-slate-200/50 hover:bg-slate-100/40 transition-colors p-4.5 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-mono font-bold tracking-wider text-[#007AFF] uppercase block">SAVINGS REPORT</span>
                  <span className="text-sm font-black text-slate-900 mt-1 block">Untapped Irrigation Value</span>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2.5 font-sans font-medium">
                    Save up to 90% on scheme-metered water bills by switching to a continuous groundwater supply for your reticulation system and pool topping.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/50 hover:bg-slate-100/40 transition-colors p-4.5 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-mono font-bold tracking-wider text-emerald-600 uppercase block">OUTLAW PROT</span>
                  <span className="text-sm font-black text-slate-900 mt-1 block">Exempt Restriction Watering</span>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2.5 font-sans font-medium">
                    Garden bore owners enjoy an extra designated watering pattern under current WA Department of Water protocols, securing healthy landscapes during heat waves.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/50 hover:bg-slate-100/40 transition-colors p-4.5 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-mono font-bold tracking-wider text-purple-600 uppercase block">WATER QUALITY</span>
                  <span className="text-sm font-black text-slate-900 mt-1 block">Bore Waterwise Certification</span>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2.5 font-sans font-medium">
                    Custom designed downhole micro-slot casing, double-wrap screens, and geological sands filtering keeps iron-staining risks and abrasive silica strictly at bay.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/50 hover:bg-slate-100/40 transition-colors p-4.5 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-mono font-bold tracking-wider text-amber-600 uppercase block">ASSETS LIFE</span>
                  <span className="text-sm font-black text-slate-900 mt-1 block">Investment Property Equity</span>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2.5 font-sans font-medium">
                    A certified, reliable garden bore adds critical capital value to your Western Australian home asset list, and protects landscaping equity permanently.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Nearby Suburbs Footer Section for SEO Clustering */}
        <section className="bg-slate-50 border border-slate-200/60 rounded-3xl p-8 hover:shadow-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-left mt-8 w-full">
          <div className="space-y-4 font-sans">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#007AFF] rounded-full animate-pulse" />
              <p className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">
                NEARBY SERVICE AREAS &amp; LOCAL SEO CLUSTERS
              </p>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-display font-black text-slate-900 tracking-tight">
                Water Bore Drilling &amp; Reticulation Diagnostics near {selectedSuburb.name}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We provide complete Waterwise certified drilling, pump repairs, and downhole flow diagnostics across Western Australia. Explore specific groundwater depth tables and specific soil profiles for neighboring suburbs:
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {getNearbySuburbs(selectedSuburb.name).map((subName) => {
                const subSlug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                return (
                  <button
                    key={subName}
                    onClick={() => handleSuburbChange(subSlug)}
                    className="flex items-center justify-between bg-white border border-slate-200/80 hover:border-[#007AFF]/30 hover:shadow-xs px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#007AFF] transition-all cursor-pointer text-left font-sans duration-200 group"
                  >
                    <span>{subName} Bores</span>
                    <span className="text-[#007AFF]/60 group-hover:text-[#007AFF] font-bold text-xs transition-colors">→</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

      </main>
        </>
      ) : (
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full z-10 relative">
          <HomeBentoPage 
            onSelectSuburb={handleSuburbChange} 
            onOpenModal={handleOpenModal} 
          />
        </main>
      )}

      {/* 4. Deep Dark Charcoal Navy Footer */}
      <footer className="bg-[#0F172A] text-white py-14 px-4 sm:px-8 border-t border-slate-800 w-full mt-auto">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            
            {/* Logo and compliance data on Left */}
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden bg-white/10 p-0.5">
                  <img src="https://assets.perthborewater.com.au/BoreWaterLogo.webp" alt="Perth BoreWater Logo" width="32" height="32" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
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
            <h2 className="text-sm font-display font-bold text-slate-350 mb-4 uppercase tracking-widest text-[11px] font-mono font-black">
              Authority Sitemap (Perth Subsurface Aquifer Directory)
            </h2>
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

      {/* 6. Gorgeous Command-Palette Style Global Search Modal Overlay */}
      {isGlobalSearchOpen && (
        <div 
          className="fixed inset-0 z-55 flex items-start justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in"
          onClick={() => {
            setIsGlobalSearchOpen(false);
          }}
        >
          <div 
            className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden mt-16 sm:mt-24 transition-all animate-[fadeInUp_0.3s_ease-out_forwards]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Header area */}
            <div className="relative flex items-center border-b border-slate-100 p-4">
              <span className="text-slate-400 pl-1.5 pr-3 select-none">
                <Search className="w-5 h-5 text-slate-400" />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={globalSearchQuery}
                placeholder="Search South Corridor index suburbs (e.g. Baldivis, Rockingham, Kwinana...)"
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full bg-transparent border-none text-slate-800 placeholder-slate-400 text-sm focus:outline-none pr-8 py-1.5"
              />
              <button 
                onClick={() => {
                  setIsGlobalSearchOpen(false);
                  setGlobalSearchQuery('');
                }}
                className="absolute right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results pane */}
            <div className="max-h-[380px] overflow-y-auto p-2 font-sans space-y-1">
              {!globalSearchQuery ? (
                <div className="py-8 px-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Search className="w-4.5 h-4.5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 font-sans tracking-tight">Search South Corridor Hub</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Enter any of our twenty index suburbs or postcodes to view specific casing configurations, local water table depths, iron risk levels, and regulatory guidance.
                  </p>
                  
                  {/* Quick-select recommendations */}
                  <div className="pt-4">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2 font-semibold">Index Suburbs</span>
                    <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
                      {INDEX_SUBURBS.map(sub => (
                        <button
                          key={sub}
                          onClick={() => handleGlobalSelectSuburb(sub)}
                          className="bg-slate-50 hover:bg-[#007AFF]/10 hover:text-[#007AFF] text-[11px] font-semibold text-slate-655 px-2.5 py-1 rounded-lg border border-slate-200/50 hover:border-blue-500/10 cursor-pointer transition-all duration-150 animate-none"
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : filteredGlobalSuburbs.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100/50 flex items-center justify-center mx-auto text-amber-500">
                    <AlertCircle className="w-4.5 h-4.5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 font-sans tracking-tight">No Suburb Found</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                    No results matched &ldquo;<strong className="text-slate-800 font-bold">{globalSearchQuery}</strong>&rdquo;. Please check the spelling or search for another Perth region.
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5 mb-1 select-none">
                    Matching Suburbs ({filteredGlobalSuburbs.length})
                  </div>
                  {filteredGlobalSuburbs.map((sub, idx) => {
                    const isHighlighted = idx === globalHighlightedIndex;
                    return (
                      <div
                        key={sub.name}
                        onClick={() => handleGlobalSelectSuburb(sub.name)}
                        onMouseEnter={() => setGlobalHighlightedIndex(idx)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                          isHighlighted 
                            ? 'bg-[#007AFF]/5 border border-transparent shadow-[inset_0_0_0_1px_rgba(0,122,255,0.15)] shadow-sm' 
                            : 'border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            isHighlighted ? 'bg-[#007AFF]/10 text-[#007AFF]' : 'bg-slate-50 border border-slate-200/40 text-slate-400'
                          }`}>
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold font-sans text-slate-805">{sub.name}</span>
                              <span className="text-[10px] font-mono font-bold text-slate-400 font-semibold">Postcode {sub.postcode}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-sans mt-0.5 block leading-tight">
                              Geological Sector: <strong className="text-slate-600 capitalize font-semibold">{sub.sector}</strong> • Aquifer: {sub.aquifer}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 font-sans">
                          {isHighlighted ? (
                            <span className="text-[10px] font-semibold text-[#007AFF]/90 flex items-center gap-0.5 animate-pulse">
                              <span>Jump directly</span>
                              <ChevronRight className="w-3 h-3 text-[#007AFF]" />
                            </span>
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Sticky Search Footer hint */}
            <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-mono text-slate-400 uppercase tracking-wider">
              <span>Use <kbd className="bg-white border border-slate-200 shadow-sm px-1.5 py-0.5 rounded text-[8px]">↑↓</kbd> keys, <kbd className="bg-white border border-slate-200 shadow-sm px-1.5 py-0.5 rounded text-[8px]">Enter</kbd> to select</span>
              <span>Press <kbd className="bg-white border border-slate-200 shadow-sm px-1.5 py-0.5 rounded text-[8px]">Esc</kbd> to clear</span>
            </div>
          </div>
        </div>
      )}

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
                      Our dispatch system has sent this ticket to <strong className="text-slate-800">support@perthborewater.com.au</strong> for {modalSuburb}.
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
                  <p className="text-[11px] text-slate-405 font-medium">
                    An on-call bore engineer will phone you at <strong className="text-slate-800">{phone}</strong> to discuss your site checklist and booking details.
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Copy dispatched to: support@perthborewater.com.au
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
                      Your Suburb *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 text-slate-405">
                        <MapPin className="w-4 h-4 text-[#007AFF]" />
                      </span>
                      <select 
                        required 
                        value={modalSuburb}
                        onChange={(e) => setModalSuburb(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#007AFF] focus:bg-white rounded-xl pl-10 pr-10 py-3 text-xs text-slate-800 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select your Suburb</option>
                        {INDEX_SUBURBS.slice().sort().map((subName) => (
                          <option key={subName} value={subName}>
                            {subName}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 top-5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-[#007AFF] w-0 h-0" />
                    </div>
                  </div>

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
                      ) : modalTitle.toLowerCase().includes('yield') ? (
                        <span>CHECK WATER YIELD →</span>
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
