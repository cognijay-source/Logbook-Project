/**
 * Curated list of US airports commonly used in pilot logbooks.
 * Format: [ICAO, IATA, Name, City, State]
 * Covers Class B, Class C, and high-traffic GA fields.
 */
export type AirportEntry = {
  icao: string
  iata: string
  name: string
  city: string
  state: string
}

const RAW: [string, string, string, string, string][] = [
  // --- Class B ---
  ['KATL', 'ATL', 'Hartsfield-Jackson Atlanta Intl', 'Atlanta', 'GA'],
  ['KBOS', 'BOS', 'Boston Logan Intl', 'Boston', 'MA'],
  ['KBWI', 'BWI', 'Baltimore/Washington Intl', 'Baltimore', 'MD'],
  ['KCLE', 'CLE', 'Cleveland Hopkins Intl', 'Cleveland', 'OH'],
  ['KCLT', 'CLT', 'Charlotte Douglas Intl', 'Charlotte', 'NC'],
  ['KCVG', 'CVG', 'Cincinnati/Northern Kentucky Intl', 'Covington', 'KY'],
  ['KDAL', 'DAL', 'Dallas Love Field', 'Dallas', 'TX'],
  ['KDCA', 'DCA', 'Ronald Reagan Washington Natl', 'Arlington', 'VA'],
  ['KDEN', 'DEN', 'Denver Intl', 'Denver', 'CO'],
  ['KDFW', 'DFW', 'Dallas/Fort Worth Intl', 'Dallas-Fort Worth', 'TX'],
  ['KDTW', 'DTW', 'Detroit Metro Wayne County', 'Detroit', 'MI'],
  ['KEWR', 'EWR', 'Newark Liberty Intl', 'Newark', 'NJ'],
  ['KFLL', 'FLL', 'Fort Lauderdale-Hollywood Intl', 'Fort Lauderdale', 'FL'],
  ['KHNL', 'HNL', 'Daniel K. Inouye Intl', 'Honolulu', 'HI'],
  ['KHOU', 'HOU', 'William P. Hobby', 'Houston', 'TX'],
  ['KIAD', 'IAD', 'Washington Dulles Intl', 'Dulles', 'VA'],
  ['KIAH', 'IAH', 'George Bush Intercontinental', 'Houston', 'TX'],
  ['KJFK', 'JFK', 'John F. Kennedy Intl', 'New York', 'NY'],
  ['KLAS', 'LAS', 'Harry Reid Intl', 'Las Vegas', 'NV'],
  ['KLAX', 'LAX', 'Los Angeles Intl', 'Los Angeles', 'CA'],
  ['KLGA', 'LGA', 'LaGuardia', 'New York', 'NY'],
  ['KMCI', 'MCI', 'Kansas City Intl', 'Kansas City', 'MO'],
  ['KMCO', 'MCO', 'Orlando Intl', 'Orlando', 'FL'],
  ['KMDW', 'MDW', 'Chicago Midway Intl', 'Chicago', 'IL'],
  ['KMEM', 'MEM', 'Memphis Intl', 'Memphis', 'TN'],
  ['KMIA', 'MIA', 'Miami Intl', 'Miami', 'FL'],
  ['KMKE', 'MKE', 'General Mitchell Intl', 'Milwaukee', 'WI'],
  ['KMSP', 'MSP', 'Minneapolis-Saint Paul Intl', 'Minneapolis', 'MN'],
  ['KMSY', 'MSY', 'Louis Armstrong New Orleans Intl', 'New Orleans', 'LA'],
  ['KORD', 'ORD', "O'Hare Intl", 'Chicago', 'IL'],
  ['KPBI', 'PBI', 'Palm Beach Intl', 'West Palm Beach', 'FL'],
  ['KPDX', 'PDX', 'Portland Intl', 'Portland', 'OR'],
  ['KPHL', 'PHL', 'Philadelphia Intl', 'Philadelphia', 'PA'],
  ['KPHX', 'PHX', 'Phoenix Sky Harbor Intl', 'Phoenix', 'AZ'],
  ['KPIT', 'PIT', 'Pittsburgh Intl', 'Pittsburgh', 'PA'],
  ['KRDU', 'RDU', 'Raleigh-Durham Intl', 'Raleigh', 'NC'],
  ['KSAN', 'SAN', 'San Diego Intl', 'San Diego', 'CA'],
  ['KSAT', 'SAT', 'San Antonio Intl', 'San Antonio', 'TX'],
  ['KSDF', 'SDF', 'Louisville Muhammad Ali Intl', 'Louisville', 'KY'],
  ['KSEA', 'SEA', 'Seattle-Tacoma Intl', 'Seattle', 'WA'],
  ['KSFO', 'SFO', 'San Francisco Intl', 'San Francisco', 'CA'],
  ['KSJC', 'SJC', 'San Jose Mineta Intl', 'San Jose', 'CA'],
  ['KSLC', 'SLC', 'Salt Lake City Intl', 'Salt Lake City', 'UT'],
  ['KSMF', 'SMF', 'Sacramento Intl', 'Sacramento', 'CA'],
  ['KSNA', 'SNA', 'John Wayne', 'Santa Ana', 'CA'],
  ['KSTL', 'STL', 'St. Louis Lambert Intl', 'St. Louis', 'MO'],
  ['KTEB', 'TEB', 'Teterboro', 'Teterboro', 'NJ'],
  ['KTPA', 'TPA', 'Tampa Intl', 'Tampa', 'FL'],

  // --- Class C / High-traffic GA ---
  ['KABC', 'ABC', 'Abilene Regional', 'Abilene', 'TX'],
  ['KACT', 'ACT', 'Waco Regional', 'Waco', 'TX'],
  ['KADS', 'ADS', 'Addison', 'Addison', 'TX'],
  ['KAFP', 'AFP', 'Anson County', 'Wadesboro', 'NC'],
  ['KAGS', 'AGS', 'Augusta Regional', 'Augusta', 'GA'],
  ['KALB', 'ALB', 'Albany Intl', 'Albany', 'NY'],
  ['KAPA', 'APA', 'Centennial', 'Englewood', 'CO'],
  ['KAUS', 'AUS', 'Austin-Bergstrom Intl', 'Austin', 'TX'],
  ['KBDL', 'BDL', 'Bradley Intl', 'Windsor Locks', 'CT'],
  ['KBED', 'BED', 'Laurence G. Hanscom Field', 'Bedford', 'MA'],
  ['KBFI', 'BFI', 'Boeing Field', 'Seattle', 'WA'],
  ['KBJC', 'BJC', 'Rocky Mountain Metropolitan', 'Broomfield', 'CO'],
  ['KBNA', 'BNA', 'Nashville Intl', 'Nashville', 'TN'],
  ['KBUF', 'BUF', 'Buffalo Niagara Intl', 'Buffalo', 'NY'],
  ['KBUR', 'BUR', 'Hollywood Burbank', 'Burbank', 'CA'],
  ['KCGF', 'CGF', 'Cuyahoga County', 'Cleveland', 'OH'],
  ['KCHA', 'CHA', 'Chattanooga Metropolitan', 'Chattanooga', 'TN'],
  ['KCHS', 'CHS', 'Charleston Intl', 'Charleston', 'SC'],
  ['KCKB', 'CKB', 'North Central West Virginia', 'Clarksburg', 'WV'],
  ['KCMA', 'CMA', 'Camarillo', 'Camarillo', 'CA'],
  ['KCMH', 'CMH', 'John Glenn Columbus Intl', 'Columbus', 'OH'],
  ['KCNO', 'CNO', 'Chino', 'Chino', 'CA'],
  ['KCOS', 'COS', 'Colorado Springs', 'Colorado Springs', 'CO'],
  ['KCRQ', 'CRQ', 'McClellan-Palomar', 'Carlsbad', 'CA'],
  ['KCRW', 'CRW', 'Yeager', 'Charleston', 'WV'],
  ['KDAB', 'DAB', 'Daytona Beach Intl', 'Daytona Beach', 'FL'],
  ['KDVT', 'DVT', 'Phoenix Deer Valley', 'Phoenix', 'AZ'],
  ['KELP', 'ELP', 'El Paso Intl', 'El Paso', 'TX'],
  ['KFFZ', 'FFZ', 'Falcon Field', 'Mesa', 'AZ'],
  ['KFPR', 'FPR', 'Treasure Coast Intl', 'Fort Pierce', 'FL'],
  ['KFRG', 'FRG', 'Republic', 'Farmingdale', 'NY'],
  ['KFTW', 'FTW', 'Fort Worth Meacham Intl', 'Fort Worth', 'TX'],
  ['KFXE', 'FXE', 'Fort Lauderdale Executive', 'Fort Lauderdale', 'FL'],
  ['KGSO', 'GSO', 'Piedmont Triad Intl', 'Greensboro', 'NC'],
  ['KGSP', 'GSP', 'Greenville-Spartanburg Intl', 'Greer', 'SC'],
  ['KHEF', 'HEF', 'Manassas Regional', 'Manassas', 'VA'],
  ['KHPN', 'HPN', 'Westchester County', 'White Plains', 'NY'],
  ['KHWD', 'HWD', 'Hayward Executive', 'Hayward', 'CA'],
  ['KICT', 'ICT', 'Wichita Eisenhower Natl', 'Wichita', 'KS'],
  ['KIND', 'IND', 'Indianapolis Intl', 'Indianapolis', 'IN'],
  ['KISP', 'ISP', 'Long Island MacArthur', 'Ronkonkoma', 'NY'],
  ['KJAX', 'JAX', 'Jacksonville Intl', 'Jacksonville', 'FL'],
  ['KJYO', 'JYO', 'Leesburg Executive', 'Leesburg', 'VA'],
  ['KLAL', 'LAL', 'Lakeland Linder Intl', 'Lakeland', 'FL'],
  ['KLGB', 'LGB', 'Long Beach', 'Long Beach', 'CA'],
  ['KLNK', 'LNK', 'Lincoln', 'Lincoln', 'NE'],
  ['KLIT', 'LIT', 'Bill and Hillary Clinton Natl', 'Little Rock', 'AR'],
  ['KLUK', 'LUK', 'Cincinnati Lunken', 'Cincinnati', 'OH'],
  ['KMGM', 'MGM', 'Montgomery Regional', 'Montgomery', 'AL'],
  ['KMHT', 'MHT', 'Manchester-Boston Regional', 'Manchester', 'NH'],
  ['KMMH', 'MMH', 'Mammoth Yosemite', 'Mammoth Lakes', 'CA'],
  ['KMOB', 'MOB', 'Mobile Regional', 'Mobile', 'AL'],
  ['KMYF', 'MYF', 'Montgomery-Gibbs Executive', 'San Diego', 'CA'],
  ['KOAK', 'OAK', 'Oakland Intl', 'Oakland', 'CA'],
  ['KOKC', 'OKC', 'Will Rogers World', 'Oklahoma City', 'OK'],
  ['KOMA', 'OMA', 'Eppley Airfield', 'Omaha', 'NE'],
  ['KONT', 'ONT', 'Ontario Intl', 'Ontario', 'CA'],
  ['KOSH', 'OSH', 'Wittman Regional', 'Oshkosh', 'WI'],
  ['KPAE', 'PAE', 'Snohomish County', 'Everett', 'WA'],
  ['KPAO', 'PAO', 'Palo Alto', 'Palo Alto', 'CA'],
  ['KPDK', 'PDK', 'DeKalb-Peachtree', 'Atlanta', 'GA'],
  ['KPGD', 'PGD', 'Punta Gorda', 'Punta Gorda', 'FL'],
  ['KPIE', 'PIE', 'St. Pete-Clearwater Intl', 'St. Petersburg', 'FL'],
  ['KPMP', 'PMP', 'Pompano Beach Airpark', 'Pompano Beach', 'FL'],
  ['KPNE', 'PNE', 'Northeast Philadelphia', 'Philadelphia', 'PA'],
  ['KPNS', 'PNS', 'Pensacola Intl', 'Pensacola', 'FL'],
  ['KPRC', 'PRC', 'Prescott Regional', 'Prescott', 'AZ'],
  ['KPVD', 'PVD', 'T.F. Green Intl', 'Providence', 'RI'],
  ['KPWK', 'PWK', 'Chicago Executive', 'Wheeling', 'IL'],
  ['KRNO', 'RNO', 'Reno-Tahoe Intl', 'Reno', 'NV'],
  ['KROC', 'ROC', 'Greater Rochester Intl', 'Rochester', 'NY'],
  ['KRSW', 'RSW', 'Southwest Florida Intl', 'Fort Myers', 'FL'],
  ['KSAV', 'SAV', 'Savannah/Hilton Head Intl', 'Savannah', 'GA'],
  ['KSBA', 'SBA', 'Santa Barbara Municipal', 'Santa Barbara', 'CA'],
  ['KSDL', 'SDL', 'Scottsdale', 'Scottsdale', 'AZ'],
  ['KSEE', 'SEE', 'Gillespie Field', 'El Cajon', 'CA'],
  ['KSGR', 'SGR', 'Sugar Land Regional', 'Sugar Land', 'TX'],
  ['KSMO', 'SMO', 'Santa Monica Municipal', 'Santa Monica', 'CA'],
  ['KSRQ', 'SRQ', 'Sarasota-Bradenton Intl', 'Sarasota', 'FL'],
  ['KSWF', 'SWF', 'New York Stewart Intl', 'Newburgh', 'NY'],
  ['KSYR', 'SYR', 'Syracuse Hancock Intl', 'Syracuse', 'NY'],
  ['KTMB', 'TMB', 'Miami Executive', 'Miami', 'FL'],
  ['KTOL', 'TOL', 'Toledo Express', 'Toledo', 'OH'],
  ['KTUL', 'TUL', 'Tulsa Intl', 'Tulsa', 'OK'],
  ['KTUS', 'TUS', 'Tucson Intl', 'Tucson', 'AZ'],
  ['KVGT', 'VGT', 'North Las Vegas', 'Las Vegas', 'NV'],
  ['KVNY', 'VNY', 'Van Nuys', 'Van Nuys', 'CA'],
]

export const AIRPORTS: AirportEntry[] = RAW.map(([icao, iata, name, city, state]) => ({
  icao,
  iata,
  name,
  city,
  state,
}))

/** Search airports by ICAO, IATA, name, or city. Returns top N matches. */
export function searchAirports(query: string, limit = 8): AirportEntry[] {
  if (!query || query.length < 1) return []
  const q = query.toUpperCase()
  const scored: { airport: AirportEntry; score: number }[] = []

  for (const a of AIRPORTS) {
    let score = 0
    // Exact ICAO match
    if (a.icao === q) score = 100
    else if (a.iata === q) score = 90
    // Starts with (ICAO or IATA)
    else if (a.icao.startsWith(q)) score = 80
    else if (a.iata.startsWith(q)) score = 70
    // City or name starts with
    else if (a.city.toUpperCase().startsWith(q)) score = 50
    else if (a.name.toUpperCase().includes(q)) score = 30
    // City contains
    else if (a.city.toUpperCase().includes(q)) score = 20

    if (score > 0) scored.push({ airport: a, score })
  }

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((s) => s.airport)
}
