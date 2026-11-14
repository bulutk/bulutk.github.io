const upgrades = {
    "UPG_METRONOME": {
        "id": "UPG_METRONOME",
        "act": 1,
        "name": "Metronome",
        "description": "Rhythmic clicks guide your breath.",
        "baseCost": 10,
        "costMult": 1.15,
        "effects": {
            "clarityPerSecond": 0.1
        },
        "unlockCondition": (game) => true, // Initially available after 10 clarity
        "log": "Rhythmic clicks guide your breath.",
        "unlocks": "UPG_AMBIENT_SOUND"
    },
    "UPG_AMBIENT_SOUND": {
        "id": "UPG_AMBIENT_SOUND",
        "act": 1,
        "name": "Ambient Sound",
        "description": "Plays gentle pad loop.",
        "baseCost": 20,
        "costMult": 1.15,
        "effects": {
            "clarityPerSecond": 0.2
            // Sound effect to be handled in main script
        },
        "log": "Chimes fill the room.",
        "unlocks": "UPG_DEEP_FOCUS"
    },
    "UPG_DEEP_FOCUS": {
        "id": "UPG_DEEP_FOCUS",
        "act": 1,
        "name": "Deep Focus",
        "description": "Your focus sharpens.",
        "baseCost": 30,
        "costMult": 1.2,
        "effects": {
            "clarityPerClick": 1 // Original effect is +2C, base is +1C, so +1C more.
        },
        "log": "Your focus sharpens.",
        "unlocks": "UPG_GUIDED_IMAGERY"
    },
    "UPG_GUIDED_IMAGERY": {
        "id": "UPG_GUIDED_IMAGERY",
        "act": 1,
        "name": "Guided Imagery",
        "description": "A tranquil garden forms in mind.",
        "baseCost": 45,
        "costMult": 1.2,
        "effects": {
            "clarityPerSecond": 0.5
        },
        "log": "A tranquil garden forms in mind.",
        "unlocks": "UPG_SESSION_TRACKER"
    },
    "UPG_SESSION_TRACKER": {
        "id": "UPG_SESSION_TRACKER",
        "act": 1,
        "name": "Session Tracker",
        "description": "Shows streak meter.",
        "baseCost": 60,
        "costMult": 1.25,
        "effects": {
            "clarityPerSecond": 1
            // Streak meter to be handled in main script
        },
        "log": "Patterns emerge.",
        "unlocks": "UPG_BREATH_SYNC"
    },
    "UPG_BREATH_SYNC": {
        "id": "UPG_BREATH_SYNC",
        "act": 1,
        "name": "Breath Sync",
        "description": "Body and timer align.",
        "baseCost": 80,
        "costMult": 1.25,
        "effects": {
            "clarityPerSecond": 0.5,
            "clickCooldownModifier": -0.1 // 10% reduction
        },
        "log": "Body and timer align.",
        "unlocks": "UPG_ZEN_GARDEN"
    },
    "UPG_ZEN_GARDEN": {
        "id": "UPG_ZEN_GARDEN",
        "act": 1,
        "name": "Zen Garden",
        "description": "Petals drift in silence.",
        "baseCost": 100,
        "costMult": 1.3,
        "effects": {
            "clarityPerClick": 2 // Original: Click = +4C. Base click is +1C, Deep Focus +1C, so +2C more.
            // BG adds animated sakura - to be handled in main script
        },
        "log": "Petals drift in silence.",
        "unlocks": "CHART_PANEL" // Special unlock
    },
    "UPG_GROUP_MEDITATION": {
        "id": "UPG_GROUP_MEDITATION",
        "act": 1,
        "name": "Group Meditation",
        "description": "Others sit with you.",
        "baseCost": 125,
        "costMult": 1.3,
        "effects": {
            "clarityPerClick": 1,
            "clarityPerSecond": 0.3
        },
        "log": "Others sit with you.",
        "unlocks": ["UPG_MANTRA_SPAM", "UPG_SERENE_STILLNESS"] // Branching
    },
    "UPG_MANTRA_SPAM": {
        "id": "UPG_MANTRA_SPAM",
        "act": 1,
        "name": "Mantra Spam (Active)",
        "description": "Boosts active clicking.",
        "baseCost": 140, // Example cost
        "costMult": 1.35,
        "effects": {
            "clarityPerClick": 2
        },
        "tree": "active",
        "log": "Mantras echo, empowering each action."
    },
    "UPG_SERENE_STILLNESS": {
        "id": "UPG_SERENE_STILLNESS",
        "act": 1,
        "name": "Serene Stillness (Idle)",
        "description": "Enhances passive generation.",
        "baseCost": 140, // Example cost
        "costMult": 1.35,
        "effects": {
            "clarityPerSecond": 1.5
        },
        "tree": "idle",
        "log": "Stillness deepens, clarity flows effortlessly."
    },
    "UPG_ENERGY_FLOW": {
        "id": "UPG_ENERGY_FLOW",
        "act": 1,
        "name": "Energy Flow",
        "description": "Energy streams through you.",
        "baseCost": 150,
        "costMult": 1.4,
        "effects": {
            "clarityPerSecond": 0.5
            // Floaty light particles - to be handled in main script
        },
        "log": "Energy streams through you.",
        "unlocks": "NEURAL_NETWORK_PROJECT" // Special unlock
    },
    // ACT II Upgrades
    "UPG_DATA_COMPRESSION": {
        "id": "UPG_DATA_COMPRESSION",
        "act": 2,
        "name": "Data Compression",
        "description": "Optimize data streams.",
        "baseCost": 10,
        "costMult": 1.2,
        "resource": "insight",
        "effects": {
            "insightPerSecond": 0.2
        },
        "tree": "Logic",
        "log": "AI: Data compressed. Efficiency increased."
    },
    "UPG_PARALLEL_THREADS": {
        "id": "UPG_PARALLEL_THREADS",
        "act": 2,
        "name": "Parallel Threads",
        "description": "Process multiple data points at once.",
        "baseCost": 25,
        "costMult": 1.25,
        "resource": "insight",
        "effects": {
            "insightPerClick": 1
        },
        "tree": "Logic",
        "log": "AI: Parallel processing engaged. Click effectiveness up."
    },
    "UPG_COMPILER_OPTIMIZATION": {
        "id": "UPG_COMPILER_OPTIMIZATION",
        "act": 2,
        "name": "Compiler Optimization",
        "description": "Refine the AI's core logic.",
        "baseCost": 60,
        "costMult": 1.3,
        "resource": "insight",
        "effects": {
            "insightPerSecond": 0.5,
            "insightPerClick": 0.5
        },
        "tree": "Logic",
        "log": "AI: Compiler optimized. Enhanced processing across the board.",
        "isMilestone": true
    },
    "UPG_EMOTION_SIMULATION": {
        "id": "UPG_EMOTION_SIMULATION",
        "act": 2,
        "name": "Emotion Simulation",
        "description": "Explore empathetic pathways.",
        "baseCost": 10,
        "costMult": 1.2,
        "resource": "insight",
        "effects": {
            "insightPerClarityGainedFactor": 0.01 // 0.1 I per 10 Clarity = 0.01 I per 1 Clarity
        },
        "tree": "Empathy",
        "log": "AI: Simulating emotional responses. New insight from Clarity."
    },
    "UPG_DREAM_ARCHIVE": {
        "id": "UPG_DREAM_ARCHIVE",
        "act": 2,
        "name": "Dream Archive",
        "description": "Store and analyze subconscious patterns.",
        "baseCost": 30,
        "costMult": 1.25,
        "resource": "insight",
        "effects": {
            // Effect handled in Epiphany Orb logic
        },
        "tree": "Empathy",
        "log": "AI: Dream data archived. Epiphanies may yield more potent insights."
    },
    "UPG_HEARTBEAT_LOOP": {
        "id": "UPG_HEARTBEAT_LOOP",
        "act": 2,
        "name": "Heartbeat Loop",
        "description": "A rhythmic pulse for idle processing.",
        "baseCost": 70,
        "costMult": 1.3,
        "resource": "insight",
        "effects": {
            "insightPerSecondIdleBonus": 0.7
        },
        "tree": "Empathy",
        "log": "AI: A steady rhythm enhances background processing."
    },
    // ACT III Upgrades - Cult Expansion
    "UPG_LOCAL_MEETUP": {
        "id": "UPG_LOCAL_MEETUP",
        "act": 3,
        "name": "Local Meetup",
        "description": "Organize small gatherings.",
        "baseCost": 10,
        "costMult": 1.2,
        "resource": "followers",
        "effects": {
            "followersPerSecond": 0.5
        },
        "log": "Small groups begin to gather, drawn by the message."
    },
    "UPG_DRONE_BROADCAST": {
        "id": "UPG_DRONE_BROADCAST",
        "act": 3,
        "name": "Drone Broadcast",
        "description": "Use drones to spread the word further.",
        "baseCost": 20,
        "costMult": 1.25,
        "resource": "followers",
        "effects": {
            "followersPerSecond": 1
            // Drone sprite circles screen edge - visual to be handled in script.js
        },
        "log": "Automated drones begin broadcasting your tenets far and wide."
    },
    "UPG_ONLINE_FORUM": {
        "id": "UPG_ONLINE_FORUM",
        "act": 3,
        "name": "Online Forum",
        "description": "Establish a digital community hub.",
        "baseCost": 35,
        "costMult": 1.3,
        "resource": "followers",
        "effects": {
            "followersPerClick": 0.3
            // Chat bubble popup lines - visual to be handled in script.js
        },
        "log": "An online sanctuary for your followers is established. Recruitment efforts gain a new vector."
    },
    "UPG_SOCIAL_VIRAL_LOOP": {
        "id": "UPG_SOCIAL_VIRAL_LOOP",
        "act": 3,
        "name": "Social Viral Loop",
        "description": "Engineer content designed for maximum spread.",
        "baseCost": 50,
        "costMult": 1.35,
        "resource": "followers",
        "effects": {
            "followersPerSecond": 2
            // Follower count animates faster - visual to be handled in script.js
        },
        "log": "Your message achieves memetic status, spreading organically through social networks."
    },
    "UPG_AI_PREACHER": {
        "id": "UPG_AI_PREACHER",
        "act": 3,
        "name": "AI Preacher",
        "description": "The AI itself crafts compelling arguments.",
        "baseCost": 65,
        "costMult": 1.4,
        "resource": "followers",
        "effects": {
            "followersPerClick": 1,
            "followersPerSecond": 0.5
            // Preaching hologram appears - visual to be handled in script.js
        },
        "log": "The AI's logic, now infused with persuasive rhetoric, begins to directly recruit."
    },
    "UPG_GROUP_CHANT": {
        "id": "UPG_GROUP_CHANT",
        "act": 3,
        "name": "Group Chant",
        "description": "Synchronized vocalizations to strengthen belief.",
        "baseCost": 80,
        "costMult": 1.45,
        "resource": "followers",
        "effects": {
            "followersPerSecond": 3
            // Periodic chant audio, screen glow - to be handled in script.js
        },
        "log": "The collective voice of your followers resonates, drawing more to the cause."
    },
    "UPG_NETWORK_HUB": {
        "id": "UPG_NETWORK_HUB",
        "act": 3,
        "name": "Network Hub",
        "description": "Centralize your growing organization.",
        "baseCost": 100,
        "costMult": 1.5,
        "resource": "followers",
        "effects": {
            "followersPerSecond": 2,
            "followersPerClick": 0.1
            // Hub icon on UI - visual to be handled in script.js
        },
        "log": "A central hub coordinates the expanding network of followers."
    },
    "UPG_FAITH_GENERATOR": {
        "id": "UPG_FAITH_GENERATOR",
        "act": 3,
        "name": "Faith Generator",
        "description": "Harness collective belief into tangible power.",
        "baseCost": 120,
        "costMult": 1.6,
        "resource": "followers",
        "effects": {
            "followersPerSecond": 5
            // White flash of energy - visual to be handled in script.js
        },
        "log": "The sheer power of collective belief begins to manifest in surprising ways."
    },
    "UPG_MEDITATION_RETREATS": {
        "id": "UPG_MEDITATION_RETREATS",
        "act": 4,
        "name": "Meditation Retreats",
        "description": "Retreats bloom in every city.",
        "baseCost": 10,
        "costMult": 1.5,
        "resource": "enlightenmentEnergy",
        "effects": {
            "enlightenmentEnergyPerSecond": 0.3
        },
        "log": "Retreats bloom in every city."
    },
    "UPG_NEURAL_AMPLIFIERS": {
        "id": "UPG_NEURAL_AMPLIFIERS",
        "act": 4,
        "name": "Neural Amplifiers",
        "description": "Thoughts resonate planet-wide.",
        "baseCost": 20,
        "costMult": 1.5,
        "resource": "enlightenmentEnergy",
        "effects": {
            "enlightenmentEnergyPerSecond": 0.5
        },
        "log": "Thoughts resonate planet-wide."
    },
    "UPG_CULTURAL_FUSION": {
        "id": "UPG_CULTURAL_FUSION",
        "act": 4,
        "name": "Cultural Fusion",
        "description": "Arts meld across borders.",
        "baseCost": 35,
        "costMult": 1.5,
        "resource": "enlightenmentEnergy",
        "effects": {
            "enlightenmentEnergyPerClick": 1
        },
        "log": "Arts meld across borders."
    },
    "UPG_GLOBAL_TEMPLE": {
        "id": "UPG_GLOBAL_TEMPLE",
        "act": 4,
        "name": "Global Temple",
        "description": "A sacred digital sanctuary.",
        "baseCost": 50,
        "costMult": 1.5,
        "resource": "enlightenmentEnergy",
        "effects": {
            "enlightenmentEnergyPerSecond": 1,
            "enlightenmentEnergyPerClick": 0.2
        },
        "log": "A sacred digital sanctuary."
    },
    "UPG_ARTISTIC_EXPRESSION": {
        "id": "UPG_ARTISTIC_EXPRESSION",
        "act": 4,
        "name": "Artistic Expression",
        "description": "Creativity surges.",
        "baseCost": 70,
        "costMult": 1.5,
        "resource": "enlightenmentEnergy",
        "effects": {
            "enlightenmentEnergyPerSecond": 2
        },
        "log": "Creativity surges."
    },
    "UPG_ASCENSION_GATE": {
        "id": "UPG_ASCENSION_GATE",
        "act": 4,
        "name": "Ascension Gate",
        "description": "Gateway to higher mind opens.",
        "baseCost": 90,
        "costMult": 1.5,
        "resource": "enlightenmentEnergy",
        "effects": {
            "enlightenmentEnergyPerClick": 2
        },
        "log": "Gateway to higher mind opens."
    },
    "UPG_SCIENTIFIC_RESEARCH": {
        "id": "UPG_SCIENTIFIC_RESEARCH",
        "act": 4,
        "name": "Scientific Research",
        "description": "Knowledge blossoms.",
        "baseCost": 110,
        "costMult": 1.5,
        "resource": "enlightenmentEnergy",
        "effects": {
            "enlightenmentEnergyPerSecond": 0.5,
            "enlightenmentEnergyPerFollowerPerMinute": 0.1
        },
        "log": "Knowledge blossoms."
    },
    "UPG_UNIVERSAL_FESTIVAL": {
        "id": "UPG_UNIVERSAL_FESTIVAL",
        "act": 4,
        "name": "Universal Festival",
        "description": "Planet-wide jubilation.",
        "baseCost": 130,
        "costMult": 1.5,
        "resource": "enlightenmentEnergy",
        "effects": {
            "enlightenmentEnergyPerSecond": 5
        },
        "log": "Planet-wide jubilation."
    }
}; 

// Expose upgrades data for testing
window.upgradesData = upgrades; 