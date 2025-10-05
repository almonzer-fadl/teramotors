// Top 30 car makes with their popular models
export const CAR_MAKES_MODELS = {
  "Toyota": [
    "Camry", "Corolla", "RAV4", "Highlander", "Prius", "Tacoma", "Tundra", "4Runner", "Sienna", "Avalon"
  ],
  "Honda": [
    "Civic", "Accord", "CR-V", "Pilot", "Odyssey", "Fit", "HR-V", "Passport", "Ridgeline", "Insight"
  ],
  "Ford": [
    "F-150", "Escape", "Explorer", "Mustang", "Edge", "Expedition", "Ranger", "Bronco", "Transit", "Focus"
  ],
  "Chevrolet": [
    "Silverado", "Equinox", "Malibu", "Traverse", "Tahoe", "Suburban", "Camaro", "Corvette", "Blazer", "Trax"
  ],
  "Nissan": [
    "Altima", "Sentra", "Rogue", "Murano", "Pathfinder", "Frontier", "Titan", "Maxima", "Versa", "Kicks"
  ],
  "BMW": [
    "3 Series", "5 Series", "X3", "X5", "7 Series", "X1", "X7", "2 Series", "4 Series", "i3"
  ],
  "Mercedes-Benz": [
    "C-Class", "E-Class", "S-Class", "GLC", "GLE", "GLS", "A-Class", "CLA", "G-Class", "Sprinter"
  ],
  "Audi": [
    "A4", "A6", "Q5", "Q7", "A3", "Q3", "A8", "TT", "e-tron", "R8"
  ],
  "Volkswagen": [
    "Jetta", "Passat", "Tiguan", "Atlas", "Golf", "Beetle", "Arteon", "ID.4", "Touareg", "CC"
  ],
  "Hyundai": [
    "Elantra", "Sonata", "Tucson", "Santa Fe", "Palisade", "Kona", "Veloster", "Genesis", "Accent", "Venue"
  ],
  "Kia": [
    "Forte", "Optima", "Sportage", "Sorento", "Telluride", "Soul", "Stinger", "Niro", "Cadenza", "Rio"
  ],
  "Mazda": [
    "CX-5", "CX-9", "Mazda3", "Mazda6", "CX-3", "MX-5 Miata", "CX-30", "Mazda2", "Tribute", "RX-8"
  ],
  "Subaru": [
    "Outback", "Forester", "Impreza", "Legacy", "Crosstrek", "Ascent", "WRX", "BRZ", "Tribeca", "Baja"
  ],
  "Lexus": [
    "ES", "RX", "GX", "LX", "IS", "GS", "LS", "NX", "CT", "RC"
  ],
  "Acura": [
    "MDX", "RDX", "TLX", "ILX", "NSX", "RLX", "TSX", "RSX", "Integra", "Legend"
  ],
  "Infiniti": [
    "Q50", "Q60", "QX50", "QX60", "QX80", "G37", "M35", "FX35", "JX35", "I30"
  ],
  "Volvo": [
    "XC90", "XC60", "S60", "S90", "V60", "V90", "XC40", "C30", "S40", "V40"
  ],
  "Jaguar": [
    "F-PACE", "XE", "XF", "XJ", "I-PACE", "F-TYPE", "E-PACE", "XK", "S-TYPE", "X-TYPE"
  ],
  "Land Rover": [
    "Range Rover", "Range Rover Sport", "Discovery", "Defender", "Evoque", "Velar", "LR2", "LR3", "LR4", "Freelander"
  ],
  "Porsche": [
    "911", "Cayenne", "Macan", "Panamera", "Boxster", "Cayman", "Taycan", "Carrera", "Turbo", "GT3"
  ],
  "Tesla": [
    "Model S", "Model 3", "Model X", "Model Y", "Roadster", "Cybertruck", "Semi", "Plaid", "Performance", "Long Range"
  ],
  "Jeep": [
    "Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Renegade", "Gladiator", "Commander", "Liberty", "Patriot", "Grand Wagoneer"
  ],
  "Ram": [
    "1500", "2500", "3500", "ProMaster", "ProMaster City", "Dakota", "Ram Van", "Ram Wagon", "Ram Truck", "Ram Chassis"
  ],
  "GMC": [
    "Sierra", "Yukon", "Acadia", "Terrain", "Canyon", "Savana", "Envoy", "Sonoma", "Jimmy", "Safari"
  ],
  "Cadillac": [
    "Escalade", "XT5", "XT6", "CT5", "CT6", "XTS", "ATS", "CTS", "SRX", "DeVille"
  ],
  "Buick": [
    "Enclave", "Encore", "Envision", "LaCrosse", "Regal", "Verano", "Lucerne", "Rendezvous", "Terraza", "Century"
  ],
  "Lincoln": [
    "Navigator", "Aviator", "Corsair", "Continental", "MKZ", "MKC", "MKT", "MKX", "Town Car", "LS"
  ],
  "Chrysler": [
    "Pacifica", "300", "Voyager", "Town & Country", "Sebring", "Crossfire", "PT Cruiser", "Aspen", "Concorde", "LHS"
  ],
  "Dodge": [
    "Charger", "Challenger", "Durango", "Journey", "Grand Caravan", "Dart", "Avenger", "Magnum", "Neon", "Intrepid"
  ],
  "Mitsubishi": [
    "Outlander", "Eclipse Cross", "Mirage", "Lancer", "Galant", "Endeavor", "Montero", "Diamante", "Expo", "Cordia"
  ]
};

export const CAR_MAKES = Object.keys(CAR_MAKES_MODELS);

export const getModelsForMake = (make: string): string[] => {
  return CAR_MAKES_MODELS[make as keyof typeof CAR_MAKES_MODELS] || [];
};

export const getAllMakesAndModels = () => {
  return Object.entries(CAR_MAKES_MODELS).flatMap(([make, models]) =>
    models.map(model => ({ make, model, label: `${make} ${model}` }))
  );
};
