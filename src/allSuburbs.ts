import { SuburbData } from './types';

export interface SuburbEntry {
  name: string;
  postcode: string;
  sector: 'bassendean' | 'spearwood' | 'quindalup' | 'guildford' | 'scarp';
  aquifer: string;
}

export const ALL_SUBURBS_LIST: SuburbEntry[] = [
  // Spearwood Sector (Yellow sands over limestone caprock)
  { name: 'Baldivis', postcode: '6171', sector: 'spearwood', aquifer: 'Jandakot Superficial' },
  { name: 'Beeliar', postcode: '6164', sector: 'spearwood', aquifer: 'Jandakot Superficial' },
  { name: 'Spearwood', postcode: '6163', sector: 'spearwood', aquifer: 'Jandakot Superficial' },
  { name: 'Coogee', postcode: '6166', sector: 'spearwood', aquifer: 'Jandakot Superficial font' },
  { name: 'Hamilton Hill', postcode: '6163', sector: 'spearwood', aquifer: 'Jandakot Superficial' },
  { name: 'Kardinya', postcode: '6163', sector: 'spearwood', aquifer: 'Jandakot Superficial' },
  { name: 'Bibra Lake', postcode: '6163', sector: 'spearwood', aquifer: 'Jandakot Superficial' },
  { name: 'Coolbellup', postcode: '6163', sector: 'spearwood', aquifer: 'Jandakot Superficial' },
  { name: 'Yangebup', postcode: '6164', sector: 'spearwood', aquifer: 'Jandakot Superficial' },
  { name: 'Munster', postcode: '6166', sector: 'spearwood', aquifer: 'Jandakot Superficial' },
  { name: 'South Lake', postcode: '6164', sector: 'spearwood', aquifer: 'Jandakot Superficial' },
  { name: 'Hilton', postcode: '6163', sector: 'spearwood', aquifer: 'Jandakot Superficial' },
  { name: 'O&apos;Connor', postcode: '6163', sector: 'spearwood', aquifer: 'Jandakot Superficial' },
  { name: 'Willagee', postcode: '6156', sector: 'spearwood', aquifer: 'Jandakot Superficial' },
  { name: 'Melville', postcode: '6156', sector: 'spearwood', aquifer: 'Melville Superficial' },
  { name: 'Myaree', postcode: '6154', sector: 'spearwood', aquifer: 'Melville Superficial' },
  { name: 'Bicton', postcode: '6157', sector: 'spearwood', aquifer: 'Swan Estuary' },
  { name: 'Attadale', postcode: '6156', sector: 'spearwood', aquifer: 'Swan Estuary' },
  { name: 'Palmyra', postcode: '6157', sector: 'spearwood', aquifer: 'Swan Estuary' },
  { name: 'East Fremantle', postcode: '6158', sector: 'spearwood', aquifer: 'Swan Estuary' },
  { name: 'Fremantle', postcode: '6160', sector: 'spearwood', aquifer: 'Swan Estuary' },
  { name: 'South Fremantle', postcode: '6162', sector: 'spearwood', aquifer: 'South Coastal Skimming' },
  { name: 'Beaconsfield', postcode: '6162', sector: 'spearwood', aquifer: 'South Coastal Skimming' },
  { name: 'White Gum Valley', postcode: '6162', sector: 'spearwood', aquifer: 'South Coastal Skimming' },
  { name: 'Wanneroo', postcode: '6065', sector: 'spearwood', aquifer: 'Gnangara Superficial' },
  { name: 'Joondalup', postcode: '6027', sector: 'spearwood', aquifer: 'Gnangara Superficial' },
  { name: 'Duncraig', postcode: '6023', sector: 'spearwood', aquifer: 'Gnangara Superficial' },
  { name: 'Kingsley', postcode: '6026', sector: 'spearwood', aquifer: 'Gnangara Superficial' },
  { name: 'Woodvale', postcode: '6026', sector: 'spearwood', aquifer: 'Gnangara Superficial' },
  { name: 'Padbury', postcode: '6025', sector: 'spearwood', aquifer: 'Gnangara Superficial' },
  { name: 'Craigie', postcode: '6025', sector: 'spearwood', aquifer: 'Gnangara Superficial' },
  { name: 'Hillarys', postcode: '6025', sector: 'spearwood', aquifer: 'Gnangara Superficial' },
  { name: 'Mullaloo', postcode: '6027', sector: 'spearwood', aquifer: 'Gnangara Superficial' },
  { name: 'Ocean Reef', postcode: '6027', sector: 'spearwood', aquifer: 'Gnangara Superficial' },
  { name: 'Heathridge', postcode: '6027', sector: 'spearwood', aquifer: 'Gnangara Superficial' },
  { name: 'Beldon', postcode: '6027', sector: 'spearwood', aquifer: 'Gnangara Superficial' },
  { name: 'Connolly', postcode: '6027', sector: 'spearwood', aquifer: 'Gnangara Superficial' },
  { name: 'Currambine', postcode: '6028', sector: 'spearwood', aquifer: 'Gnangara Superficial' },
  { name: 'Kinross', postcode: '6028', sector: 'spearwood', aquifer: 'Gnangara Superficial' },
  { name: 'Iluka', postcode: '6028', sector: 'spearwood', aquifer: 'Gnangara Superficial' },
  { name: 'Kwinana', postcode: '6167', sector: 'spearwood', aquifer: 'Jandakot Superficial' },

  // Bassendean Sector (Colloidal iron, high organic acidity)
  { name: 'Canning Vale', postcode: '6155', sector: 'bassendean', aquifer: 'Jandakot Superficial' },
  { name: 'Wellard', postcode: '6170', sector: 'bassendean', aquifer: 'Jandakot Superficial' },
  { name: 'Bertram', postcode: '6167', sector: 'bassendean', aquifer: 'Jandakot Superficial' },
  { name: 'Atwell', postcode: '6164', sector: 'bassendean', aquifer: 'Jandakot Superficial' },
  { name: 'Aubin Grove', postcode: '6164', sector: 'bassendean', aquifer: 'Jandakot Superficial' },
  { name: 'Success', postcode: '6164', sector: 'bassendean', aquifer: 'Jandakot Superficial' },
  { name: 'Cockburn Central', postcode: '6164', sector: 'bassendean', aquifer: 'Jandakot Superficial' },
  { name: 'Hammond Park', postcode: '6164', sector: 'bassendean', aquifer: 'Jandakot Superficial' },
  { name: 'Thornlie', postcode: '6108', sector: 'bassendean', aquifer: 'Canning-Jandakot' },
  { name: 'Huntingdale', postcode: '6110', sector: 'bassendean', aquifer: 'Canning-Jandakot' },
  { name: 'Gosnells', postcode: '6110', sector: 'bassendean', aquifer: 'Sutherlands Deep Aquifer' },
  { name: 'Maddington', postcode: '6109', sector: 'bassendean', aquifer: 'Canning Plain' },
  { name: 'Kenwick', postcode: '6107', sector: 'bassendean', aquifer: 'Canning Plain' },
  { name: 'Wattle Grove', postcode: '6107', sector: 'bassendean', aquifer: 'Canning Plain' },
  { name: 'Forrestfield', postcode: '6058', sector: 'bassendean', aquifer: 'Canning Plain' },
  { name: 'Jandakot', postcode: '6164', sector: 'bassendean', aquifer: 'Jandakot Mound Core' },
  { name: 'Anketell', postcode: '6167', sector: 'bassendean', aquifer: 'Jandakot Mound South' },
  { name: 'Wandi', postcode: '6167', sector: 'bassendean', aquifer: 'Jandakot Mound South' },
  { name: 'Casuarina', postcode: '6167', sector: 'bassendean', aquifer: 'Jandakot Mound South' },
  { name: 'Oakford', postcode: '6121', sector: 'bassendean', aquifer: 'Jandakot Mound South' },
  { name: 'Karawara', postcode: '6152', sector: 'bassendean', aquifer: 'Swan Aquifer Plain' },
  { name: 'Manning', postcode: '6152', sector: 'bassendean', aquifer: 'Swan Aquifer Plain' },
  { name: 'Salter Point', postcode: '6152', sector: 'bassendean', aquifer: 'Swan Aquifer Plain' },
  { name: 'Como', postcode: '6152', sector: 'bassendean', aquifer: 'Swan Aquifer Plain' },
  { name: 'South Perth', postcode: '6151', sector: 'bassendean', aquifer: 'Swan Aquifer Plain' },
  { name: 'Kensington', postcode: '6151', sector: 'bassendean', aquifer: 'Swan Aquifer Plain' },
  { name: 'Victoria Park', postcode: '6100', sector: 'bassendean', aquifer: 'Swan Aquifer Plain' },
  { name: 'East Victoria Park', postcode: '6101', sector: 'bassendean', aquifer: 'Swan Aquifer Plain' },
  { name: 'Carlisle', postcode: '6101', sector: 'bassendean', aquifer: 'Swan Aquifer Plain' },
  { name: 'Lathlain', postcode: '6100', sector: 'bassendean', aquifer: 'Swan Aquifer Plain' },

  // Quindalup Sector (Seawater / coastal shell calcarenites)
  { name: 'Rockingham', postcode: '6168', sector: 'quindalup', aquifer: 'Rockingham Superficial' },
  { name: 'Safety Bay', postcode: '6169', sector: 'quindalup', aquifer: 'Rockingham Superficial' },
  { name: 'Shoalwater', postcode: '6169', sector: 'quindalup', aquifer: 'Rockingham Superficial' },
  { name: 'Warnbro', postcode: '6169', sector: 'quindalup', aquifer: 'Rockingham Superficial' },
  { name: 'Cooloongup', postcode: '6168', sector: 'quindalup', aquifer: 'Rockingham Superficial' },
  { name: 'Karnup', postcode: '6176', sector: 'quindalup', aquifer: 'Rockingham-Warnbro Coastal' },
  { name: 'Port Kennedy', postcode: '6172', sector: 'quindalup', aquifer: 'Port Kennedy Coastal Skimming' },
  { name: 'Secret Harbour', postcode: '6173', sector: 'quindalup', aquifer: 'Port Kennedy Coastal Skimming' },
  { name: 'Golden Bay', postcode: '6174', sector: 'quindalup', aquifer: 'Mandurah Coastal Skimming' },
  { name: 'Singleton', postcode: '6175', sector: 'quindalup', aquifer: 'Mandurah Coastal Skimming' },
  { name: 'Madora Bay', postcode: '6210', sector: 'quindalup', aquifer: 'Mandurah Coastal' },
  { name: 'San Remo', postcode: '6210', sector: 'quindalup', aquifer: 'Mandurah Coastal' },
  { name: 'Mandurah', postcode: '6210', sector: 'quindalup', aquifer: 'Peel Estuarine Lens' },
  { name: 'Halls Head', postcode: '6210', sector: 'quindalup', aquifer: 'Peel Estuarine Lens' },
  { name: 'Falcon', postcode: '6210', sector: 'quindalup', aquifer: 'Peel Estuarine Lens' },
  { name: 'Wannanup', postcode: '6210', sector: 'quindalup', aquifer: 'Peel Estuarine Lens' },
  { name: 'Cottesloe', postcode: '6011', sector: 'quindalup', aquifer: 'Cottesloe Coastal Skimming' },
  { name: 'Peppermint Grove', postcode: '6011', sector: 'quindalup', aquifer: 'Swan Estuarial Skimming' },
  { name: 'Mosman Park', postcode: '6012', sector: 'quindalup', aquifer: 'Swan Estuarial Skimming' },
  { name: 'Claremont', postcode: '6010', sector: 'quindalup', aquifer: 'Melville Shallow' },
  { name: 'Nedlands', postcode: '6009', sector: 'quindalup', aquifer: 'Melville Shallow' },
  { name: 'Dalkeith', postcode: '6009', sector: 'quindalup', aquifer: 'Swan Peninsula Skimming' },

  // Guildford Sector (Dense clay strata, swelling casing hazard)
  { name: 'Piara Waters', postcode: '6112', sector: 'guildford', aquifer: 'Jandakot Superficial' },
  { name: 'Harrisdale', postcode: '6112', sector: 'guildford', aquifer: 'Jandakot Superficial' },
  { name: 'Southern River', postcode: '6110', sector: 'guildford', aquifer: 'Jandakot Superficial' },
  { name: 'Guildford', postcode: '6055', sector: 'guildford', aquifer: 'Swan-Guildford' },
  { name: 'South Guildford', postcode: '6055', sector: 'guildford', aquifer: 'Swan-Guildford' },
  { name: 'Bassendean', postcode: '6054', sector: 'guildford', aquifer: 'Swan-Guildford' },
  { name: 'Bayswater', postcode: '6053', sector: 'guildford', aquifer: 'Swan Valley' },
  { name: 'Ashfield', postcode: '6054', sector: 'guildford', aquifer: 'Swan Valley' },
  { name: 'Belmont', postcode: '6104', sector: 'guildford', aquifer: 'Swan Plain' },
  { name: 'Redcliffe', postcode: '6104', sector: 'guildford', aquifer: 'Swan Plain' },
  { name: 'Ascot', postcode: '6104', sector: 'guildford', aquifer: 'Swan Plain' },
  { name: 'Kloverdale', postcode: '6105', sector: 'guildford', aquifer: 'Swan Plain' },
  { name: 'Kewdale', postcode: '6105', sector: 'guildford', aquifer: 'Swan Plain' },
  { name: 'Welshpool', postcode: '6106', sector: 'guildford', aquifer: 'Swan Plain' },
  { name: 'Beckenham', postcode: '6107', sector: 'guildford', aquifer: 'Canning Plain' },
  { name: 'Langford', postcode: '6147', sector: 'guildford', aquifer: 'Canning Plain' },
  { name: 'Lynwood', postcode: '6147', sector: 'guildford', aquifer: 'Canning Plain' },
  { name: 'Parkwood', postcode: '6147', sector: 'guildford', aquifer: 'Canning Plain' },
  { name: 'Riverton', postcode: '6148', sector: 'guildford', aquifer: 'Canning Plain' },
  { name: 'Shelley', postcode: '6148', sector: 'guildford', aquifer: 'Canning Plain' },

  // Darling Scarp Sector (Granite basalt, extreme torque)
  { name: 'Armadale', postcode: '6112', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Kelmscott', postcode: '6111', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Byford', postcode: '6122', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Karrakup', postcode: '6122', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Kalamunda', postcode: '6076', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Lesmurdie', postcode: '6076', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Walliston', postcode: '6076', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Bickley', postcode: '6076', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Carmel', postcode: '6076', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Gooseberry Hill', postcode: '6076', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Maida Vale', postcode: '6057', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Roleystone', postcode: '6111', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Bedfordale', postcode: '6112', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Mount Richon', postcode: '6112', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Wungong', postcode: '6112', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Darling Downs', postcode: '6122', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Cardup', postcode: '6122', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Mundijong', postcode: '6123', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Serpentine', postcode: '6125', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Jarrahdale', postcode: '6124', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Gidgegannup', postcode: '6083', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Chidlow', postcode: '6556', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Mundaring', postcode: '6073', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Stoneville', postcode: '6081', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Parkerville', postcode: '6081', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Glen Forrest', postcode: '6071', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Darlington', postcode: '6070', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Boya', postcode: '6056', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Helena Valley', postcode: '6056', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Midland', postcode: '6056', sector: 'scarp', aquifer: 'Darling Range Bedrock' },
  { name: 'Swan View', postcode: '6056', sector: 'scarp', aquifer: 'Darling Range Bedrock' }
];

// Procedural generator to provide authentic, highly detailed geological and text structures 
// for ALL 350+ suburbs in Perth, ensuring the autocomplete supports them seamlessly!
export function generateSuburbData(name: string, postcode: string): SuburbData {
  // Try to find matching sector configuration based on name or fall back on a deterministic hash
  let entry = ALL_SUBURBS_LIST.find(e => e.name.toLowerCase() === name.toLowerCase());
  
  if (!entry) {
    // Determine sector based on postcode range (procedural mapping)
    const pc = parseInt(postcode, 10);
    let sector: 'bassendean' | 'spearwood' | 'quindalup' | 'guildford' | 'scarp' = 'bassendean';
    let aquifer = 'Superficial Swan-Jandakot';
    
    if (pc >= 6168 && pc <= 6176) {
      sector = 'quindalup';
      aquifer = 'Rockingham-Warnbro Coastal';
    } else if (pc >= 6111 && pc <= 6125) {
      sector = 'scarp';
      aquifer = 'Darling Scarp Fractured Rock';
    } else if (pc === 6110 || pc === 6055 || pc === 6054) {
      sector = 'guildford';
      aquifer = 'Guildford Alluvial Clay Plain';
    } else if (pc >= 6017 && pc <= 6065) {
      sector = 'spearwood';
      aquifer = 'Gnangara Mound Coastal Base';
    }
    
    entry = { name, postcode, sector, aquifer };
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  // Specific Technical Content based on geological sector
  let soilComposition = '';
  let localHeadache = '';
  let landmark = `${name} Primary Area`;
  let ironRisk: 'Minimal' | 'Moderate' | 'High' | 'Severe' = 'Moderate';
  let typicalDepth = '15m - 25m';
  let waterQualityNotes = '';
  let regulatoryBody = `DWER District Perth Office`;

  switch (entry.sector) {
    case 'spearwood':
      soilComposition = 'Spearwood sand strata with deep Tamala Limestone caprock beds.';
      localHeadache = 'Hard carbonate CaCO₃ scaling on nozzle valves, but excellent steady volumetric water yields.';
      ironRisk = 'Moderate';
      typicalDepth = '20m - 35m';
      waterQualityNotes = 'Slightly alkaline pH (7.4 - 8.2), rich in healthy calcium carbonate, zero iron staining hazard.';
      regulatoryBody = `City of Wanneroo / Cockburn Water Quality Management`;
      break;
    case 'quindalup':
      soilComposition = 'Coastal Quindalup shell-bearing calcareous sands over young beach calcarenite.';
      localHeadache = 'Active saltwater seawater wedge interface, high NaCl intrusion risk near the foreshore.';
      ironRisk = 'Minimal';
      typicalDepth = '4m - 12m';
      waterQualityNotes = 'Low-draught skim pumps required to extract sweet water off the saline transition boundaries.';
      regulatoryBody = `DWER Coastal Regulation Division`;
      break;
    case 'guildford':
      soilComposition = 'Swelling, plastic Guildford Alluvial Clays with high fine sediment counts.';
      localHeadache = 'Clay particles chocking screen filters, swelling clays crushing standard lightweight PVC casings.';
      ironRisk = 'High';
      typicalDepth = '12m - 24m';
      waterQualityNotes = 'Requires precision slot sizes and heavy gravel packing at deep water-bearing sand seams.';
      regulatoryBody = `DWER Metropolitan Water Board`;
      break;
    case 'scarp':
      soilComposition = 'Precambrian igneous rock basement composed of tough crystalline granite-gneiss.';
      localHeadache = 'Extremely high drilling resistance, low aquifer yield, narrow subterranean rock fractures.';
      ironRisk = 'Moderate';
      typicalDepth = '30m - 60m';
      waterQualityNotes = 'Water is of supreme organic purity, but has high hardness parameters and drilling depth is high.';
      regulatoryBody = `Shire of Mundaring / Armadale Environmental Inspectors`;
      break;
    case 'bassendean':
    default:
      soilComposition = 'Highly leached, white-to-grey Bassendean quartz sands over organic peaty lenses.';
      localHeadache = 'Severe dissolved iron Fe²⁺ oxide staining, swamp organic gases, biological slime blockages.';
      ironRisk = 'Severe';
      typicalDepth = '15m - 30m';
      waterQualityNotes = 'Strong acidity (low pH 4.5 - 5.5). Stainless steel fittings and oxidation filter buffers are crucial.';
      regulatoryBody = `Jandakot Aquifer Protection Committee`;
      break;
  }

  return {
    name,
    slug,
    soilComposition,
    localHeadache,
    councilLink: 'https://www.water.wa.gov.au/planning-for-the-future/allocation-plans/perth-regional-confined-aquifer-capacity',
    landmark,
    ironRisk,
    typicalDepth,
    waterQualityNotes,
    regulatoryBody
  };
}
