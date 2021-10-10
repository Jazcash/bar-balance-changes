import { PreparsedUnitDef, UnitDefValueType } from "./types";

export const buffComparators = {
    higherIsBetter: (prev: number, curr: number) => curr > prev,
    lowerIsBetter: (prev: number, curr: number) => curr < prev,
    trueIsBetter: (prev: boolean, curr: boolean) => curr === true,
    falseIsBetter: (prev: boolean, curr: boolean) => curr === false,
};

export const unitDefProps: PreparsedUnitDef = {
    // https://springrts.com/wiki/Gamedev:UnitDefs
    acceleration: { friendlyName: "Acceleration", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    autoheal: { friendlyName: "AutoHeal", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    brakerate: { friendlyName: "Brake Rate", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    builder: { friendlyName: "Builder", type: UnitDefValueType.BOOLEAN, buffComparator: buffComparators.trueIsBetter, isBalanceChange: true },
    buildcostenergy: { friendlyName: "Energy Build Cost", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.lowerIsBetter, isBalanceChange: true },
    buildcostmetal: { friendlyName: "Metal Build Cost", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.lowerIsBetter, isBalanceChange: true },
    builddistance: { friendlyName: "Build Distance", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    buildpic: { friendlyName: "Build Pic", type: UnitDefValueType.STRING, isBalanceChange: false },
    buildtime: { friendlyName: "Build Time", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.lowerIsBetter, isBalanceChange: true },
    cancapture: { friendlyName: "Can Capture", type: UnitDefValueType.BOOLEAN, buffComparator: buffComparators.trueIsBetter, isBalanceChange: true },
    cancloak: { friendlyName: "Can Cloak", type: UnitDefValueType.BOOLEAN, buffComparator: buffComparators.trueIsBetter, isBalanceChange: true },
    canmanualfire: { friendlyName: "Can Fire Manually", type: UnitDefValueType.BOOLEAN, buffComparator: buffComparators.trueIsBetter, isBalanceChange: true },
    canmove: { friendlyName: "Can Move", type: UnitDefValueType.BOOLEAN, buffComparator: buffComparators.trueIsBetter, isBalanceChange: true },
    capturespeed: { friendlyName: "Capture Speed", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    category: { friendlyName: "Unit Categories", type: UnitDefValueType.STRING_ARRAY, isBalanceChange: true },
    cloakcost: { friendlyName: "Cloak Cost", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.lowerIsBetter, isBalanceChange: true },
    cloakcostmoving: { friendlyName: "Moving Cloak Cost", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.lowerIsBetter, isBalanceChange: true },
    collisionvolumeoffsets: { friendlyName: "Collision Volume Offsets", type: UnitDefValueType.NUMBER_ARRAY, isBalanceChange: false },
    collisionvolumescales: { friendlyName: "Collision Volume Scales", type: UnitDefValueType.NUMBER_ARRAY, isBalanceChange: false },
    collisionvolumetype: { friendlyName: "Collision Volume Type", type: UnitDefValueType.STRING, isBalanceChange: false },
    corpse: { friendlyName: "Corpse Type", type: UnitDefValueType.STRING, isBalanceChange: false },
    description: { friendlyName: "Description", type: UnitDefValueType.STRING, isBalanceChange: false },
    energymake: { friendlyName: "Energy Generation", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    energystorage: { friendlyName: "Energy Storage", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    explodeas: { friendlyName: "Explosion Type", type: UnitDefValueType.STRING },
    footprintx: { friendlyName: "Footprint X", type: UnitDefValueType.NUMBER, isBalanceChange: false },
    footprintz: { friendlyName: "Footprint Z", type: UnitDefValueType.NUMBER, isBalanceChange: false },
    hidedamage: { friendlyName: "Hide Damage", type: UnitDefValueType.BOOLEAN, isBalanceChange: true },
    holdsteady: { friendlyName: "Hold Steady", type: UnitDefValueType.BOOLEAN, isBalanceChange: true },
    icontype: { friendlyName: "Icon Type", type: UnitDefValueType.STRING, isBalanceChange: false },
    idleautoheal: { friendlyName: "Idle AutoHeal", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    idletime: { friendlyName: "Idle Time", type: UnitDefValueType.NUMBER, isBalanceChange: true },
    losemitheight: { friendlyName: "LOS Height", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    mass: { friendlyName: "Mass", type: UnitDefValueType.NUMBER, isBalanceChange: true },
    maxdamage: { friendlyName: "Base HP", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    maxslope: { friendlyName: "Max Slope", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    maxvelocity: { friendlyName: "Max Velocity", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    maxwaterdepth: { friendlyName: "Max Water Depth", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    metalmake: { friendlyName: "Metal Genegeration", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    metalstorage: { friendlyName: "Metal Storage", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    mincloakdistance: { friendlyName: "Min Cloak Distance", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.lowerIsBetter, isBalanceChange: true },
    movementclass: { friendlyName: "Movement Class", type: UnitDefValueType.STRING, isBalanceChange: true },
    name: { friendlyName: "Name", type: UnitDefValueType.STRING, isBalanceChange: false },
    nochasecategory: { friendlyName: "Name", type: UnitDefValueType.STRING },
    objectname: { friendlyName: "Object Name", type: UnitDefValueType.STRING, isBalanceChange: false },
    pushresistant: { friendlyName: "Push Resistant", type: UnitDefValueType.BOOLEAN, isBalanceChange: true },
    radardistance: { friendlyName: "Radar Distance", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    radaremitheight: { friendlyName: "Radar LOS Height", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    reclaimable: { friendlyName: "Reclaimable", type: UnitDefValueType.BOOLEAN, isBalanceChange: true },
    resurrectable: { friendlyName: "Resurrectable", type: UnitDefValueType.BOOLEAN, isBalanceChange: true },
    releaseheld: { friendlyName: "Safely Drops Units", type: UnitDefValueType.BOOLEAN, buffComparator: buffComparators.trueIsBetter, isBalanceChange: true },
    script: { friendlyName: "Script", type: UnitDefValueType.STRING, isBalanceChange: false },
    seismicsignature: { friendlyName: "Seismic Signature", type: UnitDefValueType.NUMBER, isBalanceChange: true },
    selfdestructas: { friendlyName: "Self D Type", type: UnitDefValueType.STRING },
    selfdestructcountdown: { friendlyName: "Self D Time", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.lowerIsBetter, isBalanceChange: true },
    showplayername: { friendlyName: "Show Player Name", type: UnitDefValueType.STRING },
    sightdistance: { friendlyName: "Sight Distance", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    stealth: { friendlyName: "Stealth", type: UnitDefValueType.BOOLEAN, buffComparator: buffComparators.trueIsBetter, isBalanceChange: true },
    sonardistance: { friendlyName: "Sonar Distance", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    terraformspeed: { friendlyName: "Terraform Speed", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    trackoffset: { friendlyName: "Track Offset", type: UnitDefValueType.NUMBER, isBalanceChange: false },
    trackstrength: { friendlyName: "Track Strength", type: UnitDefValueType.NUMBER, isBalanceChange: false },
    tracktype: { friendlyName: "Track Type", type: UnitDefValueType.STRING, isBalanceChange: false },
    trackwidth: { friendlyName: "Track Width", type: UnitDefValueType.NUMBER, isBalanceChange: false },
    turninplaceanglelimit: { friendlyName: "Turn in Place Angle Limit", type: UnitDefValueType.NUMBER, isBalanceChange: true },
    turninplacespeedlimit: { friendlyName: "Turn in Place Speed Limit", type: UnitDefValueType.NUMBER, isBalanceChange: true },
    turnrate: { friendlyName: "Turn Rate", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    upright: { friendlyName: "Upright", type: UnitDefValueType.BOOLEAN, isBalanceChange: true },
    workertime: { friendlyName: "Build Power", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    buildoptions: { friendlyName: "Build Options", type: UnitDefValueType.STRING_ARRAY, isLuaTable: true, isBalanceChange: true },
    buildinggrounddecaltype: { friendlyName: "Building Ground Decal Type", type: UnitDefValueType.STRING, isBalanceChange: false },
    buildinggrounddecalsizex: { friendlyName: "Building Ground Decal Type", type: UnitDefValueType.STRING, isBalanceChange: false },
    buildinggrounddecalsizey: { friendlyName: "Building Ground Decal Type", type: UnitDefValueType.STRING, isBalanceChange: false },
    yardmap: { friendlyName: "Yardmap", type: UnitDefValueType.STRING, isBalanceChange: false },

    // Custom params
    customparams: { friendlyName: "Custom Params", type: UnitDefValueType.ANY_MAP },
    paralyzemultiplier: { friendlyName: "Paralyze Multiplier", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.lowerIsBetter, isBalanceChange: true },
    expl_light_color: { friendlyName: "Explosion Light Color", type: UnitDefValueType.STRING, isBalanceChange: false },
    expl_light_mult: { friendlyName: "Explosion Light Multiplier", type: UnitDefValueType.NUMBER, isBalanceChange: false },
    expl_light_radius_mult: { friendlyName: "Explosion Light Radius Multiplier", type: UnitDefValueType.NUMBER, isBalanceChange: false },
    expl_light_life_mult: { friendlyName: "Explosion Light Life Multiplier", type: UnitDefValueType.NUMBER, isBalanceChange: false },
    light_color: { friendlyName: "Light Color", type: UnitDefValueType.STRING, isBalanceChange: false },
    light_skip: { friendlyName: "Light Skip", type: UnitDefValueType.BOOLEAN, isBalanceChange: false },
    normaltex: { friendlyName: "Normal Texture", type: UnitDefValueType.STRING, isBalanceChange: false },
    model_author: { friendlyName: "Model Author", type: UnitDefValueType.STRING, isBalanceChange: false },
    subfolder: { friendlyName: "Subfolder", type: UnitDefValueType.STRING, isBalanceChange: false },
    longdescription: { friendlyName: "Long Description", type: UnitDefValueType.STRING, isBalanceChange: false },
    area_mex_def: { friendlyName: "Arex Mex Def", type: UnitDefValueType.STRING, isBalanceChange: false },
    model: { friendlyName: "Model", type: UnitDefValueType.STRING, isBalanceChange: false },
    smoketrail: { friendlyName: "Smoke Trail", type: UnitDefValueType.BOOLEAN, isBalanceChange: false },
    light_mult: { friendlyName: "Light Mult", type: UnitDefValueType.NUMBER, isBalanceChange: false },
    light_life_mult: { friendlyName: "Light Mult", type: UnitDefValueType.NUMBER, isBalanceChange: false },
    light_radius_mult: { friendlyName: "Light Radius Mult", type: UnitDefValueType.NUMBER, isBalanceChange: false },
    expl_light_heat_radius_mult: { isBalanceChange: false },
    expl_light_heat_strength_mult: { isBalanceChange: false },
    expl_light_heat_radius: { isBalanceChange: false },
    expl_light_radius: { isBalanceChange: false },
    texture1: { isBalanceChange: false },
    texture2: { isBalanceChange: false },
    texture3: { isBalanceChange: false },
    texture4: { isBalanceChange: false },
    
    // https://springrts.com/wiki/Gamedev:FeatureDefs
    featuredefs: { friendlyName: "Features", type: UnitDefValueType.UNITDEF_OBJECT, isBalanceChange: true },
    blocking: { friendlyName: "Blocking", type: UnitDefValueType.BOOLEAN, isBalanceChange: true },
    damage: { friendlyName: "Damage", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    energy: { friendlyName: "Energy", type: UnitDefValueType.NUMBER, isBalanceChange: true },
    featuredead: { friendlyName: "Dead Feature Type", type: UnitDefValueType.STRING },
    featurereclamate: { friendlyName: "Feature Reclamate", type: UnitDefValueType.STRING, isBalanceChange: false },
    height: { friendlyName: "Height", type: UnitDefValueType.NUMBER, isBalanceChange: true },
    hitdensity: { friendlyName: "Hit Density", type: UnitDefValueType.NUMBER, isBalanceChange: true },
    metal: { friendlyName: "Metal", type: UnitDefValueType.NUMBER, isBalanceChange: true },
    object: { friendlyName: "Object", type: UnitDefValueType.STRING, isBalanceChange: false },
    seqnamereclamate: { friendlyName: "Seqname Reclamate", type: UnitDefValueType.STRING, isBalanceChange: false },
    world: { friendlyName: "World", type: UnitDefValueType.STRING, isBalanceChange: false },
    
    // https://springrts.com/wiki/Gamedev:WeaponDefs
    weapondefs: { friendlyName: "Weapons", type: UnitDefValueType.UNITDEF_OBJECT },
    areaofeffect: { friendlyName: "Area of Effect", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    avoidfeature: { friendlyName: "Avoid Features", type: UnitDefValueType.BOOLEAN, isBalanceChange: true },
    avoidfriendly: { friendlyName: "Avoid Friendlies", type: UnitDefValueType.BOOLEAN, isBalanceChange: true },
    avoidground: { friendlyName: "Avoid Ground", type: UnitDefValueType.BOOLEAN, isBalanceChange: true },
    beamtime: { friendlyName: "Beam Time", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    bouncerebound: { friendlyName: "Bounce Rebound", type: UnitDefValueType.NUMBER, isBalanceChange: true },
    burnblow: { friendlyName: "Self Explode", type: UnitDefValueType.BOOLEAN, buffComparator: buffComparators.trueIsBetter, isBalanceChange: true },
    cegtag: { friendlyName: "CEG Tag", type: UnitDefValueType.STRING, isBalanceChange: false },
    commandfire: { friendlyName: "Command Fire", type: UnitDefValueType.BOOLEAN, isBalanceChange: true },
    corethickness: { friendlyName: "Core Thickness", type: UnitDefValueType.NUMBER, isBalanceChange: false  },
    craterareaofeffect: { friendlyName: "Crater Area of Effect", type: UnitDefValueType.NUMBER, isBalanceChange: true },
    craterboost: { friendlyName: "Crater Boost", type: UnitDefValueType.NUMBER, isBalanceChange: false },
    cratermult: { friendlyName: "Crater Mult", type: UnitDefValueType.NUMBER, isBalanceChange: false },
    cylindertargeting: { friendlyName: "Cylinder Targeting", type: UnitDefValueType.NUMBER, isBalanceChange: false  },
    edgeeffectiveness: { friendlyName: "Edge Effectiveness", type: UnitDefValueType.NUMBER, isBalanceChange: true },
    energypershot: { friendlyName: "Energy Per Shot", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.lowerIsBetter, isBalanceChange: true },
    explosiongenerator: { friendlyName: "Explosion Generator", type: UnitDefValueType.STRING, isBalanceChange: false },
    firestarter: { friendlyName: "Fire Starter", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.trueIsBetter, isBalanceChange: true },
    firesubmersed: { friendlyName: "Fire Submersed", type: UnitDefValueType.BOOLEAN, isBalanceChange: true },
    flighttime: { friendlyName: "Flight Time", type: UnitDefValueType.NUMBER, isBalanceChange: true },
    groundbounce: { friendlyName: "Ground Bounce", type: UnitDefValueType.BOOLEAN, buffComparator: buffComparators.trueIsBetter, isBalanceChange: true },
    impactonly: { friendlyName: "Impact Only", type: UnitDefValueType.NUMBER, isBalanceChange: true },
    impulseboost: { friendlyName: "Impulse Boost", type: UnitDefValueType.NUMBER, isBalanceChange: true },
    impulsefactor: { friendlyName: "Impulse Factor", type: UnitDefValueType.NUMBER, isBalanceChange: true },
    laserflaresize: { friendlyName: "Laser Flare Size", type: UnitDefValueType.NUMBER, isBalanceChange: false  },
    noexplode: { friendlyName: "Explode on Impact", type: UnitDefValueType.BOOLEAN, isBalanceChange: true },
    noselfdamage: { friendlyName: "No Self Damage", type: UnitDefValueType.BOOLEAN, buffComparator: buffComparators.trueIsBetter, isBalanceChange: true },
    range: { friendlyName: "Range", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    reloadtime: { friendlyName: "Reload Time", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.lowerIsBetter, isBalanceChange: true },
    rgbcolor: { friendlyName: "RGB Color", type: UnitDefValueType.NUMBER_ARRAY, isBalanceChange: false },
    sfxtypes: { friendlyName: "Sound Types", type: UnitDefValueType.UNITDEF_OBJECT, isBalanceChange: false },
    size: { friendlyName: "Size", type: UnitDefValueType.NUMBER, isBalanceChange: false  },
    smokeperiod: { friendlyName: "Smoke Period", type: UnitDefValueType.NUMBER, isBalanceChange: false },
    smoketime: { friendlyName: "Smoke Shit", type: UnitDefValueType.NUMBER, isBalanceChange: false },
    smokesize: { friendlyName: "Smoke Shit", type: UnitDefValueType.NUMBER, isBalanceChange: false },
    smokecolor: { friendlyName: "Smoke Shit", type: UnitDefValueType.NUMBER, isBalanceChange: false },
    castshadow: { friendlyName: "Smoke Shit", type: UnitDefValueType.NUMBER, isBalanceChange: false },
    smoketrailcastshadow: { friendlyName: "Smoke Shit", type: UnitDefValueType.NUMBER, isBalanceChange: false },
    sounds: { friendlyName: "Sounds", type: UnitDefValueType.UNITDEF_OBJECT, isBalanceChange: false },
    soundhit: { friendlyName: "Sound Hit", type: UnitDefValueType.STRING, isBalanceChange: false },
    soundhitdry: { friendlyName: "Sound Hit Dry", type: UnitDefValueType.STRING, isBalanceChange: false },
    soundhitwet: { friendlyName: "Sound Hit Wet", type: UnitDefValueType.STRING, isBalanceChange: false },
    soundstartvolume: { friendlyName: "Sound Start Volume", type: UnitDefValueType.STRING, isBalanceChange: false },
    soundhitvolume: { friendlyName: "Sound Hit Volume", type: UnitDefValueType.STRING, isBalanceChange: false },
    soundstart: { friendlyName: "Sound Start", type: UnitDefValueType.STRING, isBalanceChange: false },
    soundtrigger: { friendlyName: "Sound Trigger", type: UnitDefValueType.BOOLEAN, isBalanceChange: false },
    sprayangle: { friendlyName: "Spray Angle", type: UnitDefValueType.NUMBER },
    targetmoveerror: { friendlyName: "Target Move Error", type: UnitDefValueType.NUMBER, isBalanceChange: true, buffComparator: buffComparators.lowerIsBetter },
    thickness: { friendlyName: "Thickness", type: UnitDefValueType.NUMBER },
    tolerance: { friendlyName: "Tolerance", type: UnitDefValueType.NUMBER, isBalanceChange: true },
    turret: { friendlyName: "Turret", type: UnitDefValueType.BOOLEAN, isBalanceChange: true },
    waterweapon: { friendlyName: "Water Weapon", type: UnitDefValueType.BOOLEAN, buffComparator: buffComparators.trueIsBetter, isBalanceChange: true },
    weapontimer: { friendlyName: "Weapon Timer", type: UnitDefValueType.NUMBER, isBalanceChange: true },
    weapontype: { friendlyName: "Weapon Type", type: UnitDefValueType.STRING },
    weaponvelocity: { friendlyName: "Weapon Velocity", type: UnitDefValueType.NUMBER, buffComparator: buffComparators.higherIsBetter, isBalanceChange: true },
    alpha: { friendlyName: "Alpha", type: UnitDefValueType.NUMBER, isBalanceChange: false },
    energyuse: { friendlyName: "Energy Use", type: UnitDefValueType.NUMBER },
    force: { friendlyName: "Force", type: UnitDefValueType.NUMBER },
    intercepttype: { friendlyName: "Intercept Type", type: UnitDefValueType.NUMBER },
    power: { friendlyName: "Power", type: UnitDefValueType.NUMBER, isBalanceChange: true, buffComparator: buffComparators.higherIsBetter },
    powerregen: { friendlyName: "Power Regen", type: UnitDefValueType.NUMBER, isBalanceChange: true, buffComparator: buffComparators.higherIsBetter },
    powerregenenergy: { friendlyName: "Power Regen Energy", type: UnitDefValueType.NUMBER, isBalanceChange: true, buffComparator: buffComparators.lowerIsBetter },
    radius: { friendlyName: "Radius", type: UnitDefValueType.NUMBER, isBalanceChange: true, buffComparator: buffComparators.higherIsBetter },
    rechargedelay: { friendlyName: "Recharge Delay", type: UnitDefValueType.NUMBER, isBalanceChange: true, buffComparator: buffComparators.lowerIsBetter },
    repulser: { friendlyName: "Repulser", type: UnitDefValueType.NUMBER },
    smart: { friendlyName: "Smart", type: UnitDefValueType.BOOLEAN },
    startingpower: { friendlyName: "Starting Power", type: UnitDefValueType.NUMBER, isBalanceChange: true, buffComparator: buffComparators.higherIsBetter },
    visible: { friendlyName: "Visible", type: UnitDefValueType.BOOLEAN },
    visiblehitframes: { friendlyName: "Visible Hit Frames", type: UnitDefValueType.NUMBER },
    badcolor: { friendlyName: "Bad Color", type: UnitDefValueType.NUMBER_ARRAY, isBalanceChange: false },
    goodcolor: { friendlyName: "Good Color", type: UnitDefValueType.NUMBER_ARRAY, isBalanceChange: false },
    colormap: { isBalanceChange: false },
    sizedecay: { isBalanceChange: false },
    sizegrowth: { isBalanceChange: false },
    alphadecay: { isBalanceChange: false },
    separation: { isBalanceChange: false },
    nogap: { isBalanceChange: false },
    stages: { isBalanceChange: false },
    flamegfxtime: { isBalanceChange: false },
    hardstop: { isBalanceChange: false },
    falloffrate: { isBalanceChange: false },
    loddistance: { isBalanceChange: false },
    rgbcolor2: { isBalanceChange: false },
    def: { isBalanceChange: false },
    slaveto: { isBalanceChange: false },
};