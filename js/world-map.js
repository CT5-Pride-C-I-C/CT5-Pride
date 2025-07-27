// World Map for LGBTQ+ Rights Status
// Data combines criminalization status with ILGA-Europe Rainbow Map scores

const worldMapData = {
    // European Countries (from Rainbow Map)
    'United Kingdom': {
        name: 'United Kingdom',
        criminalizationStatus: 'Legal',
        rainbowScore: 67,
        marriageEquality: true,
        description: 'Legal same-sex activity since 1967. Marriage equality achieved 2013-2014. Recent concerns over trans rights policies.',
        categories: {
            'Equality & Non-Discrimination': 75,
            'Family': 80,
            'Hate Crime & Hate Speech': 60,
            'Legal Gender Recognition': 45,
            'Intersex Bodily Integrity': 35,
            'Civil Society Space': 85,
            'Asylum': 70
        }
    },
    'Malta': {
        name: 'Malta',
        criminalizationStatus: 'Full Equality',
        rainbowScore: 89,
        marriageEquality: true,
        description: 'Leading European country for LGBTQ+ rights. Top of Rainbow Map for 10 consecutive years.',
        categories: {
            'Equality & Non-Discrimination': 95,
            'Family': 90,
            'Hate Crime & Hate Speech': 85,
            'Legal Gender Recognition': 95,
            'Intersex Bodily Integrity': 85,
            'Civil Society Space': 95,
            'Asylum': 90
        }
    },
    'Belgium': {
        name: 'Belgium',
        criminalizationStatus: 'Full Equality',
        rainbowScore: 85,
        marriageEquality: true,
        description: 'Second place in Rainbow Map 2025. Strong protections across all categories.'
    },
    'Netherlands': {
        name: 'Netherlands',
        criminalizationStatus: 'Full Equality',
        rainbowScore: 83,
        marriageEquality: true,
        description: 'First country to legalize same-sex marriage in 2001. Strong LGBTQ+ protections.'
    },
    'Norway': {
        name: 'Norway',
        criminalizationStatus: 'Full Equality',
        rainbowScore: 78,
        marriageEquality: true,
        description: 'Progressive Nordic country with comprehensive LGBTQ+ rights.'
    },
    'France': {
        name: 'France',
        criminalizationStatus: 'Legal',
        rainbowScore: 72,
        marriageEquality: true,
        description: 'Marriage equality since 2013. Some regional variations in enforcement.'
    },
    'Germany': {
        name: 'Germany',
        criminalizationStatus: 'Legal',
        rainbowScore: 71,
        marriageEquality: true,
        description: 'Marriage equality since 2017. Strong anti-discrimination laws.'
    },
    'Spain': {
        name: 'Spain',
        criminalizationStatus: 'Legal',
        rainbowScore: 69,
        marriageEquality: true,
        description: 'Early adopter of marriage equality (2005). Generally progressive policies.'
    },
    'Italy': {
        name: 'Italy',
        criminalizationStatus: 'Legal',
        rainbowScore: 35,
        marriageEquality: false,
        description: 'Civil unions but not marriage. Conservative social attitudes persist.'
    },
    'Poland': {
        name: 'Poland',
        criminalizationStatus: 'Limited Protection',
        rainbowScore: 13,
        marriageEquality: false,
        description: 'Recent backsliding on LGBTQ+ rights. LGBTQ+-free zones declared in some regions.'
    },
    'Hungary': {
        name: 'Hungary',
        criminalizationStatus: 'Limited Protection',
        rainbowScore: 12,
        marriageEquality: false,
        description: 'Severe restrictions under Orbán government. Constitutional ban on same-sex adoption.'
    },
    'Russia': {
        name: 'Russia',
        criminalizationStatus: 'Criminal',
        rainbowScore: 7,
        marriageEquality: false,
        description: 'LGBTQ+ "propaganda" law, extremist organization designation. Severe persecution.'
    },
    
    // Middle East & North Africa (mostly criminal status)
    'Saudi Arabia': {
        name: 'Saudi Arabia',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Death penalty for same-sex relations. Extremely repressive laws.'
    },
    'Iran': {
        name: 'Iran',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Death penalty for same-sex relations. State-forced gender transitions.'
    },
    'Afghanistan': {
        name: 'Afghanistan',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Taliban rule: Public stoning and flogging for LGBTQ+ people.'
    },
    'Yemen': {
        name: 'Yemen',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Death penalty prescribed. Ongoing conflict compounds persecution.'
    },
    'Syria': {
        name: 'Syria',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Criminalized with up to 3 years imprisonment.'
    },
    'Iraq': {
        name: 'Iraq',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Recent criminalization under new laws. Increased persecution.'
    },
    'Lebanon': {
        name: 'Lebanon',
        criminalizationStatus: 'Criminal',
        rainbowScore: 8,
        marriageEquality: false,
        description: 'Article 534 criminalizes same-sex relations, but some judicial leniency.'
    },
    'Egypt': {
        name: 'Egypt',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Uses "debauchery" laws to prosecute LGBTQ+ people. Regular crackdowns.'
    },
    'Morocco': {
        name: 'Morocco',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Article 489 criminalizes same-sex relations with up to 3 years prison.'
    },
    'Algeria': {
        name: 'Algeria',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Up to 2 years imprisonment for same-sex relations.'
    },
    'Tunisia': {
        name: 'Tunisia',
        criminalizationStatus: 'Criminal',
        rainbowScore: 6,
        marriageEquality: false,
        description: 'Article 230 criminalizes same-sex relations. Some reform discussions.'
    },
    'Libya': {
        name: 'Libya',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Sharia law applies. LGBTQ+ people face severe persecution.'
    },
    
    // Sub-Saharan Africa (mixed but many criminal)
    'Nigeria': {
        name: 'Nigeria',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Federal law criminalizes same-sex relations. Death penalty in northern states under Sharia.'
    },
    'Uganda': {
        name: 'Uganda',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Anti-Homosexuality Act 2023: Life imprisonment, death penalty in some cases.'
    },
    'Ghana': {
        name: 'Ghana',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Colonial-era laws criminalize same-sex relations with up to 3 years prison.'
    },
    'Kenya': {
        name: 'Kenya',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Penal code criminalizes same-sex relations with up to 14 years prison.'
    },
    'Tanzania': {
        name: 'Tanzania',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Life imprisonment for same-sex relations. Severe government crackdowns.'
    },
    'Zambia': {
        name: 'Zambia',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: '15 years to life imprisonment for same-sex relations.'
    },
    'Zimbabwe': {
        name: 'Zimbabwe',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Up to 10 years imprisonment. Constitutional ban on same-sex marriage.'
    },
    'Cameroon': {
        name: 'Cameroon',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Up to 5 years imprisonment. One of the most repressive African countries.'
    },
    'Ethiopia': {
        name: 'Ethiopia',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Criminal code prohibits same-sex relations with up to 15 years prison.'
    },
    'South Africa': {
        name: 'South Africa',
        criminalizationStatus: 'Full Equality',
        rainbowScore: 65,
        marriageEquality: true,
        description: 'Most progressive African country. Constitution protects LGBTQ+ rights, marriage equality since 2006.'
    },
    'Botswana': {
        name: 'Botswana',
        criminalizationStatus: 'Legal',
        rainbowScore: 25,
        marriageEquality: false,
        description: 'Decriminalized in 2019 after court ruling. Still facing social challenges.'
    },
    'Angola': {
        name: 'Angola',
        criminalizationStatus: 'Legal',
        rainbowScore: 15,
        marriageEquality: false,
        description: 'Decriminalized in 2019. New constitution includes anti-discrimination protections.'
    },
    'Mozambique': {
        name: 'Mozambique',
        criminalizationStatus: 'Legal',
        rainbowScore: 10,
        marriageEquality: false,
        description: 'Decriminalized in 2015. Limited additional protections.'
    },
    'Seychelles': {
        name: 'Seychelles',
        criminalizationStatus: 'Legal',
        rainbowScore: 20,
        marriageEquality: false,
        description: 'Decriminalized in 2016. Small island progress.'
    },
    
    // Asia (mostly criminal or limited)
    'China': {
        name: 'China',
        criminalizationStatus: 'Limited Protection',
        rainbowScore: 15,
        marriageEquality: false,
        description: 'Not criminalized but no legal protections. Censorship of LGBTQ+ content.'
    },
    'India': {
        name: 'India',
        criminalizationStatus: 'Legal',
        rainbowScore: 25,
        marriageEquality: false,
        description: 'Decriminalized in 2018 by Supreme Court. Ongoing legal battles for marriage rights.'
    },
    'Indonesia': {
        name: 'Indonesia',
        criminalizationStatus: 'Limited Protection',
        rainbowScore: 10,
        marriageEquality: false,
        description: 'Not federally criminalized but some provinces have Sharia law criminalizing LGBTQ+ people.'
    },
    'Malaysia': {
        name: 'Malaysia',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Federal and state Sharia laws criminalize same-sex relations. Regular persecution.'
    },
    'Singapore': {
        name: 'Singapore',
        criminalizationStatus: 'Legal',
        rainbowScore: 30,
        marriageEquality: false,
        description: 'Decriminalized in 2022 but constitutional amendment prevents marriage equality.'
    },
    'Thailand': {
        name: 'Thailand',
        criminalizationStatus: 'Legal',
        rainbowScore: 55,
        marriageEquality: true,
        description: 'Marriage equality passed in 2024. Relatively progressive for the region.'
    },
    'Philippines': {
        name: 'Philippines',
        criminalizationStatus: 'Legal',
        rainbowScore: 20,
        marriageEquality: false,
        description: 'Not criminalized nationally. SOGIE Act provides some anti-discrimination protections.'
    },
    'Vietnam': {
        name: 'Vietnam',
        criminalizationStatus: 'Legal',
        rainbowScore: 15,
        marriageEquality: false,
        description: 'Not criminalized. Same-sex marriage recognition removed but not prohibited.'
    },
    'Japan': {
        name: 'Japan',
        criminalizationStatus: 'Legal',
        rainbowScore: 45,
        marriageEquality: false,
        description: 'Some municipal partnerships. Growing support but no national marriage equality.'
    },
    'South Korea': {
        name: 'South Korea',
        criminalizationStatus: 'Legal',
        rainbowScore: 12,
        marriageEquality: false,
        description: 'Military still criminalizes same-sex relations. Conservative social attitudes.'
    },
    'Pakistan': {
        name: 'Pakistan',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Sharia law criminalizes same-sex relations. Severe societal persecution.'
    },
    'Bangladesh': {
        name: 'Bangladesh',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Colonial-era Section 377 criminalizes same-sex relations.'
    },
    'Myanmar': {
        name: 'Myanmar',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Section 377 criminalizes same-sex relations with up to 10 years prison.'
    },
    'Sri Lanka': {
        name: 'Sri Lanka',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Section 365A criminalizes same-sex relations between men.'
    },
    
    // Americas (generally more progressive)
    'United States': {
        name: 'United States',
        criminalizationStatus: 'Legal',
        rainbowScore: 76,
        marriageEquality: true,
        description: 'Marriage equality since 2015. State-level variations in protections.'
    },
    'Canada': {
        name: 'Canada',
        criminalizationStatus: 'Full Equality',
        rainbowScore: 85,
        marriageEquality: true,
        description: 'Marriage equality since 2005. Comprehensive anti-discrimination laws.'
    },
    'Brazil': {
        name: 'Brazil',
        criminalizationStatus: 'Legal',
        rainbowScore: 60,
        marriageEquality: true,
        description: 'Marriage equality since 2013. High levels of anti-LGBTQ+ violence.'
    },
    'Argentina': {
        name: 'Argentina',
        criminalizationStatus: 'Full Equality',
        rainbowScore: 80,
        marriageEquality: true,
        description: 'First Latin American country with marriage equality (2010). Progressive gender identity laws.'
    },
    'Uruguay': {
        name: 'Uruguay',
        criminalizationStatus: 'Full Equality',
        rainbowScore: 78,
        marriageEquality: true,
        description: 'Marriage equality since 2013. Comprehensive LGBTQ+ rights framework.'
    },
    'Chile': {
        name: 'Chile',
        criminalizationStatus: 'Legal',
        rainbowScore: 65,
        marriageEquality: true,
        description: 'Marriage equality achieved in 2022. Growing acceptance.'
    },
    'Colombia': {
        name: 'Colombia',
        criminalizationStatus: 'Legal',
        rainbowScore: 70,
        marriageEquality: true,
        description: 'Marriage equality since 2016. Constitutional protections.'
    },
    'Ecuador': {
        name: 'Ecuador',
        criminalizationStatus: 'Legal',
        rainbowScore: 45,
        marriageEquality: true,
        description: 'Marriage equality since 2019 via Constitutional Court decision.'
    },
    'Costa Rica': {
        name: 'Costa Rica',
        criminalizationStatus: 'Legal',
        rainbowScore: 55,
        marriageEquality: true,
        description: 'Marriage equality since 2020. Most progressive Central American country.'
    },
    'Mexico': {
        name: 'Mexico',
        criminalizationStatus: 'Legal',
        rainbowScore: 50,
        marriageEquality: true,
        description: 'Nationwide marriage equality since 2022. State-level variations in implementation.'
    },
    'Peru': {
        name: 'Peru',
        criminalizationStatus: 'Legal',
        rainbowScore: 25,
        marriageEquality: false,
        description: 'Civil unions recognised but not marriage. Conservative constitutional provisions.'
    },
    'Venezuela': {
        name: 'Venezuela',
        criminalizationStatus: 'Legal',
        rainbowScore: 15,
        marriageEquality: false,
        description: 'Not criminalized but limited protections. Economic crisis affects all rights.'
    },
    'Bolivia': {
        name: 'Bolivia',
        criminalizationStatus: 'Legal',
        rainbowScore: 20,
        marriageEquality: false,
        description: 'Anti-discrimination laws but constitutional prohibition on same-sex marriage.'
    },
    'Paraguay': {
        name: 'Paraguay',
        criminalizationStatus: 'Legal',
        rainbowScore: 10,
        marriageEquality: false,
        description: 'Not criminalized but constitutional prohibition on same-sex marriage.'
    },
    'Nicaragua': {
        name: 'Nicaragua',
        criminalizationStatus: 'Legal',
        rainbowScore: 15,
        marriageEquality: false,
        description: 'Not criminalized but limited protections. Authoritarian restrictions.'
    },
    'Honduras': {
        name: 'Honduras',
        criminalizationStatus: 'Legal',
        rainbowScore: 12,
        marriageEquality: false,
        description: 'High levels of anti-LGBTQ+ violence. Constitutional prohibition on same-sex marriage.'
    },
    'Guatemala': {
        name: 'Guatemala',
        criminalizationStatus: 'Legal',
        rainbowScore: 8,
        marriageEquality: false,
        description: 'Not criminalized but severe social persecution. Constitutional prohibition on same-sex marriage.'
    },
    'El Salvador': {
        name: 'El Salvador',
        criminalizationStatus: 'Legal',
        rainbowScore: 10,
        marriageEquality: false,
        description: 'Not criminalized but limited protections.'
    },
    'Panama': {
        name: 'Panama',
        criminalizationStatus: 'Legal',
        rainbowScore: 20,
        marriageEquality: false,
        description: 'Anti-discrimination protections but no marriage equality.'
    },
    'Belize': {
        name: 'Belize',
        criminalizationStatus: 'Legal',
        rainbowScore: 25,
        marriageEquality: false,
        description: 'Decriminalized in 2016 by Supreme Court ruling.'
    },
    'Guyana': {
        name: 'Guyana',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Colonial-era laws still criminalize same-sex relations.'
    },
    'Suriname': {
        name: 'Suriname',
        criminalizationStatus: 'Legal',
        rainbowScore: 15,
        marriageEquality: false,
        description: 'Decriminalized in 2022. Limited additional protections.'
    },
    'Jamaica': {
        name: 'Jamaica',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Colonial-era buggery law still enforced. High levels of societal persecution.'
    },
    'Trinidad and Tobago': {
        name: 'Trinidad and Tobago',
        criminalizationStatus: 'Legal',
        rainbowScore: 20,
        marriageEquality: false,
        description: 'Decriminalized in 2018 by High Court ruling.'
    },
    'Barbados': {
        name: 'Barbados',
        criminalizationStatus: 'Legal',
        rainbowScore: 25,
        marriageEquality: false,
        description: 'Decriminalized in 2022. Growing acceptance.'
    },
    'Cuba': {
        name: 'Cuba',
        criminalizationStatus: 'Legal',
        rainbowScore: 40,
        marriageEquality: true,
        description: 'Marriage equality approved in 2022 referendum after government advocacy.'
    },
    'Dominican Republic': {
        name: 'Dominican Republic',
        criminalizationStatus: 'Legal',
        rainbowScore: 15,
        marriageEquality: false,
        description: 'Not criminalized but constitutional prohibition on same-sex marriage.'
    },
    'Haiti': {
        name: 'Haiti',
        criminalizationStatus: 'Legal',
        rainbowScore: 8,
        marriageEquality: false,
        description: 'Not criminalized but severe social persecution and limited state capacity.'
    },
    
    // Oceania
    'Australia': {
        name: 'Australia',
        criminalizationStatus: 'Full Equality',
        rainbowScore: 78,
        marriageEquality: true,
        description: 'Marriage equality since 2017 after postal survey. Comprehensive anti-discrimination laws.'
    },
    'New Zealand': {
        name: 'New Zealand',
        criminalizationStatus: 'Full Equality',
        rainbowScore: 82,
        marriageEquality: true,
        description: 'Marriage equality since 2013. Very progressive legal framework.'
    },
    'Fiji': {
        name: 'Fiji',
        criminalizationStatus: 'Legal',
        rainbowScore: 30,
        marriageEquality: false,
        description: 'Constitution prohibits discrimination based on sexual orientation.'
    },
    'Papua New Guinea': {
        name: 'Papua New Guinea',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Colonial-era laws criminalize same-sex relations.'
    },
    'Samoa': {
        name: 'Samoa',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Recent criminalization of same-sex relations between men.'
    },
    'Tonga': {
        name: 'Tonga',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Sodomy laws with up to 10 years imprisonment.'
    },
    'Solomon Islands': {
        name: 'Solomon Islands',
        criminalizationStatus: 'Criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Colonial-era laws criminalize same-sex relations between men.'
    },
    'Vanuatu': {
        name: 'Vanuatu',
        criminalizationStatus: 'Legal',
        rainbowScore: 10,
        marriageEquality: false,
        description: 'Not criminalized but limited legal protections.'
    }
};

// Colour schemes for different views
const colourSchemes = {
    criminalization: {
        'Criminal': '#d32f2f',           // Strong red - urgent change needed
        'Limited Protection': '#f57c00', // Orange
        'Legal': '#388e3c',              // Green  
        'Full Equality': '#1976d2'       // Blue
    },
    rainbow: {
        0: '#8b0000',    // 0-20% Dark red
        20: '#ff4500',   // 21-40% Orange red
        40: '#ffa500',   // 41-60% Orange
        60: '#32cd32',   // 61-80% Lime green
        80: '#006400'    // 81-100% Dark green
    }
};

class WorldMap {
    constructor() {
        this.svg = document.getElementById('world-map');
        this.currentFilter = 'criminalization'; // Default to criminalization view
        this.mapContainer = document.getElementById('world-map-container');
        
        if (!this.svg) {
            console.error('World map SVG element not found');
            return;
        }
        
        this.init();
    }

    async init() {
        console.log('🗺️ Initializing World Map with accurate country shapes...');
        
        try {
            // Load the accurate world map SVG
            await this.loadWorldMapSVG();
            this.setupControls();
            this.updateColours();
            
            console.log('✅ World map initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize world map:', error);
            this.createFallbackMap();
        }
    }

    async loadWorldMapSVG() {
        try {
            // Load the world.svg file
            console.log('🔄 Loading world.svg from Images/world.svg...');
            const response = await fetch('./Images/world.svg');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch world.svg: ${response.status} ${response.statusText}`);
            }
            
            const svgText = await response.text();
            console.log('📝 SVG text loaded, length:', svgText.length);
            
            // Create a temporary container to parse the SVG
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = svgText;
            const sourceSvg = tempDiv.querySelector('svg');
            
            if (!sourceSvg) {
                throw new Error('No SVG found in world.svg file');
            }
            
            // Clear the current SVG and copy content from world.svg
            this.svg.innerHTML = '';
            
            // Copy the viewBox from the source SVG
            const viewBox = sourceSvg.getAttribute('viewBox') || '0 0 1000 500';
            this.svg.setAttribute('viewBox', viewBox);
            console.log('📐 Set viewBox:', viewBox);
            
            // Get all country paths from the source SVG
            const countryPaths = sourceSvg.querySelectorAll('path[id]');
            console.log(`📍 Found ${countryPaths.length} countries in world.svg`);
            
            let mappedCountries = 0;
            
            // Process each country path
            countryPaths.forEach(path => {
                const countryCode = path.getAttribute('id');
                const countryName = path.getAttribute('title') || path.getAttribute('data-name') || this.getCountryNameFromCode(countryCode);
                const pathData = path.getAttribute('d');
                
                if (countryCode && pathData) {
                    // Check if we have data for this country
                    const countryData = this.getCountryDataByName(countryName) || this.getCountryDataByCode(countryCode);
                    
                    if (countryData) {
                        // Create new path element with data
                        const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        newPath.setAttribute('d', pathData);
                        newPath.setAttribute('id', `country-${countryCode}`);
                        newPath.setAttribute('data-country', countryData.name);
                        newPath.classList.add('country-path');
                        newPath.style.cursor = 'pointer';
                        newPath.style.stroke = '#333';
                        newPath.style.strokeWidth = '0.5';
                        newPath.style.transition = 'all 0.3s ease';
                        newPath.style.strokeLinejoin = 'round';
                        newPath.style.strokeLinecap = 'round';
                        
                        // Add event listeners
                        newPath.addEventListener('click', () => this.showCountryInfo(countryData.name));
                        newPath.addEventListener('mouseenter', () => this.highlightCountry(newPath));
                        newPath.addEventListener('mouseleave', () => this.unhighlightCountry(newPath));
                        
                        this.svg.appendChild(newPath);
                        mappedCountries++;
                    } else {
                        // Create path with default styling for countries without data
                        const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        newPath.setAttribute('d', pathData);
                        newPath.setAttribute('id', `country-${countryCode}`);
                        newPath.setAttribute('data-country', countryName || countryCode);
                        newPath.classList.add('country-path', 'no-data');
                        newPath.style.fill = '#f5f5f5';
                        newPath.style.stroke = '#ddd';
                        newPath.style.strokeWidth = '0.5';
                        newPath.style.cursor = 'default';
                        
                        this.svg.appendChild(newPath);
                    }
                }
            });
            
            console.log(`🌍 World map SVG loaded successfully. Mapped ${mappedCountries} countries with data.`);
            
        } catch (error) {
            console.error('Failed to load world.svg:', error);
            throw error;
        }
    }

    getCountryNameFromCode(code) {
        const codeMapping = {
            'US': 'United States',
            'GB': 'United Kingdom',
            'FR': 'France',
            'DE': 'Germany',
            'ES': 'Spain',
            'IT': 'Italy',
            'NL': 'Netherlands',
            'BE': 'Belgium',
            'MT': 'Malta',
            'NO': 'Norway',
            'PL': 'Poland',
            'HU': 'Hungary',
            'RU': 'Russia',
            'SA': 'Saudi Arabia',
            'IR': 'Iran',
            'AF': 'Afghanistan',
            'YE': 'Yemen',
            'SY': 'Syria',
            'IQ': 'Iraq',
            'LB': 'Lebanon',
            'EG': 'Egypt',
            'MA': 'Morocco',
            'DZ': 'Algeria',
            'TN': 'Tunisia',
            'LY': 'Libya',
            'NG': 'Nigeria',
            'UG': 'Uganda',
            'GH': 'Ghana',
            'KE': 'Kenya',
            'TZ': 'Tanzania',
            'ZM': 'Zambia',
            'ZW': 'Zimbabwe',
            'CM': 'Cameroon',
            'ET': 'Ethiopia',
            'ZA': 'South Africa',
            'BW': 'Botswana',
            'AO': 'Angola',
            'MZ': 'Mozambique',
            'SC': 'Seychelles',
            'CN': 'China',
            'IN': 'India',
            'ID': 'Indonesia',
            'MY': 'Malaysia',
            'SG': 'Singapore',
            'TH': 'Thailand',
            'PH': 'Philippines',
            'VN': 'Vietnam',
            'JP': 'Japan',
            'KR': 'South Korea',
            'PK': 'Pakistan',
            'BD': 'Bangladesh',
            'MM': 'Myanmar',
            'LK': 'Sri Lanka',
            'CA': 'Canada',
            'BR': 'Brazil',
            'AR': 'Argentina',
            'UY': 'Uruguay',
            'CL': 'Chile',
            'CO': 'Colombia',
            'EC': 'Ecuador',
            'CR': 'Costa Rica',
            'MX': 'Mexico',
            'PE': 'Peru',
            'VE': 'Venezuela',
            'BO': 'Bolivia',
            'PY': 'Paraguay',
            'NI': 'Nicaragua',
            'HN': 'Honduras',
            'GT': 'Guatemala',
            'SV': 'El Salvador',
            'PA': 'Panama',
            'BZ': 'Belize',
            'GY': 'Guyana',
            'SR': 'Suriname',
            'JM': 'Jamaica',
            'TT': 'Trinidad and Tobago',
            'BB': 'Barbados',
            'CU': 'Cuba',
            'DO': 'Dominican Republic',
            'HT': 'Haiti',
            'AU': 'Australia',
            'NZ': 'New Zealand',
            'FJ': 'Fiji',
            'PG': 'Papua New Guinea',
            'WS': 'Samoa',
            'TO': 'Tonga',
            'SB': 'Solomon Islands',
            'VU': 'Vanuatu'
        };
        
        return codeMapping[code] || null;
    }

    getCountryDataByCode(code) {
        const countryName = this.getCountryNameFromCode(code);
        return countryName ? worldMapData[countryName] : null;
    }

    getCountryDataByName(name) {
        return worldMapData[name] || null;
    }

    createFallbackMap() {
        console.log('Creating fallback map...');
        this.svg.innerHTML = '';
        
        // Add a simple world outline
        const worldOutline = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        worldOutline.setAttribute('x', '10');
        worldOutline.setAttribute('y', '10');
        worldOutline.setAttribute('width', '980');
        worldOutline.setAttribute('height', '480');
        worldOutline.setAttribute('fill', '#f0f8ff');
        worldOutline.setAttribute('stroke', '#333');
        worldOutline.setAttribute('stroke-width', '2');
        worldOutline.setAttribute('rx', '10');
        this.svg.appendChild(worldOutline);
        
        // Add error message
        const errorText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        errorText.setAttribute('x', '500');
        errorText.setAttribute('y', '250');
        errorText.setAttribute('text-anchor', 'middle');
        errorText.setAttribute('font-family', 'Arial, sans-serif');
        errorText.setAttribute('font-size', '18');
        errorText.setAttribute('fill', '#666');
        errorText.textContent = 'World map could not be loaded. Please try refreshing the page.';
        this.svg.appendChild(errorText);
    }

    setupControls() {
        // Set default filter to criminalization
        const criminalizationBtn = document.getElementById('show-criminalization');
        const rainbowBtn = document.getElementById('show-rainbow-scores');
        const bothBtn = document.getElementById('show-both');

        if (criminalizationBtn) {
            criminalizationBtn.classList.add('active');
            criminalizationBtn.addEventListener('click', () => {
                this.currentFilter = 'criminalization';
                this.updateActiveButton(criminalizationBtn);
                this.updateColours();
                this.updateLegend();
            });
        }

        if (rainbowBtn) {
            rainbowBtn.addEventListener('click', () => {
                this.currentFilter = 'rainbow';
                this.updateActiveButton(rainbowBtn);
                this.updateColours();
                this.updateLegend();
            });
        }

        if (bothBtn) {
            bothBtn.addEventListener('click', () => {
                this.currentFilter = 'both';
                this.updateActiveButton(bothBtn);
                this.updateColours();
                this.updateLegend();
            });
        }

        // Set initial legend
        this.updateLegend();
    }

    updateActiveButton(activeBtn) {
        document.querySelectorAll('.map-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    updateColours() {
        console.log(`🎨 Updating colours for filter: ${this.currentFilter}`);
        
        const countryPaths = this.svg.querySelectorAll('.country-path:not(.no-data)');
        console.log(`🔍 Found ${countryPaths.length} country paths to colour`);
        
        let colouredCountries = 0;
        
        countryPaths.forEach(path => {
            const countryName = path.getAttribute('data-country');
            const data = worldMapData[countryName];
            
            if (data) {
                let colour = '#f0f0f0'; // Default colour
                
                if (this.currentFilter === 'criminalization') {
                    colour = this.getCriminalizationColour(data.criminalizationStatus);
                } else if (this.currentFilter === 'rainbow') {
                    colour = this.getRainbowColour(data.rainbowScore);
                } else if (this.currentFilter === 'both') {
                    // Combined view - prioritise criminalisation with rainbow transparency
                    colour = this.getCombinedColour(data);
                }
                
                path.style.fill = colour;
                path.style.fillOpacity = '0.8';
                colouredCountries++;
                
                // Add special highlighting for criminal countries in default view
                if (this.currentFilter === 'criminalization' && data.criminalizationStatus === 'Criminal') {
                    path.style.fillOpacity = '0.9';
                    path.style.strokeWidth = '1';
                }
            }
        });
        
        console.log(`✅ Successfully coloured ${colouredCountries} countries`);
    }

    getCriminalizationColour(status) {
        const colours = {
            'Criminal': '#d32f2f',           // Strong red - urgent change needed
            'Limited Protection': '#f57c00', // Orange
            'Legal': '#388e3c',              // Green
            'Full Equality': '#1976d2'       // Blue
        };
        return colours[status] || '#f0f0f0';
    }

    getRainbowColour(score) {
        if (score >= 81) return '#006400';  // Dark green
        if (score >= 61) return '#32cd32';  // Lime green
        if (score >= 41) return '#ffa500';  // Orange
        if (score >= 21) return '#ff4500';  // Orange red
        return '#8b0000';  // Dark red
    }

    getCombinedColour(data) {
        // Prioritise showing criminalisation status
        return this.getCriminalizationColour(data.criminalizationStatus);
    }

    updateLegend() {
        const criminalizationLegend = document.getElementById('criminalization-legend');
        const rainbowLegend = document.getElementById('rainbow-legend');
        
        if (criminalizationLegend && rainbowLegend) {
            if (this.currentFilter === 'criminalization' || this.currentFilter === 'both') {
                criminalizationLegend.style.display = 'block';
                rainbowLegend.style.display = 'none';
            } else if (this.currentFilter === 'rainbow') {
                criminalizationLegend.style.display = 'none';
                rainbowLegend.style.display = 'block';
            }
        }
    }

    highlightCountry(element) {
        element.style.strokeWidth = '2';
        element.style.stroke = '#2196f3';
        element.style.filter = 'brightness(1.1) drop-shadow(2px 2px 4px rgba(0,0,0,0.3))';
        element.style.fillOpacity = '1';
        element.style.transform = 'scale(1.01)';
        element.style.transformOrigin = 'center';
    }

    unhighlightCountry(element) {
        element.style.strokeWidth = '0.5';
        element.style.stroke = '#333';
        element.style.filter = 'none';
        element.style.fillOpacity = '0.8';
        element.style.transform = 'scale(1)';
    }

    showCountryInfo(countryName) {
        const data = worldMapData[countryName];
        const infoPanel = document.getElementById('country-info');
        const countryNameEl = document.getElementById('country-name');
        const countryDetailsEl = document.getElementById('country-details');

        if (!data || !infoPanel) return;

        countryNameEl.textContent = countryName;
        
        let detailsHTML = '';
        
        if (this.currentFilter === 'criminalization' || this.currentFilter === 'both') {
            const statusColour = this.getCriminalizationColour(data.criminalizationStatus);
            detailsHTML += `
                <div style="margin-bottom: 1rem;">
                    <strong>Criminalisation Status:</strong>
                    <span style="color: ${statusColour}; font-weight: bold; margin-left: 0.5rem;">
                        ${data.criminalizationStatus}
                    </span>
                </div>
            `;
        }
        
        if (this.currentFilter === 'rainbow' || this.currentFilter === 'both') {
            const scoreColour = this.getRainbowColour(data.rainbowScore);
            detailsHTML += `
                <div style="margin-bottom: 1rem;">
                    <strong>Rainbow Map Score:</strong>
                    <span style="color: ${scoreColour}; font-weight: bold; margin-left: 0.5rem;">
                        ${data.rainbowScore}%
                    </span>
                </div>
            `;
            
            if (data.categories) {
                detailsHTML += '<div><strong>Category Scores:</strong><ul style="margin: 0.5rem 0; padding-left: 1.5rem;">';
                Object.entries(data.categories).forEach(([category, score]) => {
                    detailsHTML += `<li>${category}: ${score}%</li>`;
                });
                detailsHTML += '</ul></div>';
            }
        }

        if (data.description) {
            detailsHTML += `<div style="margin-top: 1rem; font-style: italic; color: var(--text-light);">${data.description}</div>`;
        }

        countryDetailsEl.innerHTML = detailsHTML;
        infoPanel.style.display = 'block';
        
        // Add special message for countries with criminalization
        if (data.criminalizationStatus === 'Criminal') {
            const warningHTML = `
                <div style="background: #ffebee; border: 1px solid #f44336; border-radius: 4px; padding: 0.75rem; margin-top: 1rem;">
                                    <strong style="color: #d32f2f;">⚠️ Change Needed:</strong> 
                <span style="color: #c62828;">LGBTQ+ people face criminalisation in this country. Advocacy and legal reform are urgently needed.</span>
                </div>
            `;
            countryDetailsEl.innerHTML += warningHTML;
        }
    }
}

// Initialize the map when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Content Loaded - initializing accurate world map...');
    
    const mapElement = document.getElementById('world-map');
    if (mapElement) {
        console.log('🗺️ Initializing WorldMap with accurate country shapes...');
        const worldMap = new WorldMap();
        
        // Handle anchor navigation for world map
        const handleAnchorNavigation = () => {
            if (window.location.hash === '#world-map-container') {
                console.log('🎯 World map anchor detected - preventing default and handling manually...');
                
                // Prevent the default browser anchor behavior
                const container = document.getElementById('world-map-container');
                if (container) {
                    // Wait for the map to fully load and initialize
                    const waitForMapReady = () => {
                        // Check if the map has been properly initialized by looking for country paths
                        const countryPaths = mapElement.querySelectorAll('.country-path');
                        if (countryPaths.length > 0) {
                            console.log('✅ World map fully loaded with', countryPaths.length, 'countries');
                            
                            // Get the header height and account for sticky positioning
                            const header = document.querySelector('header');
                            const headerHeight = header ? header.offsetHeight : 0;
                            
                            // Calculate the correct scroll position with extra padding
                            const elementTop = container.offsetTop - headerHeight - 100;
                            
                            // Use a more reliable scrolling method
                            setTimeout(() => {
                                window.scrollTo({
                                    top: elementTop,
                                    behavior: 'smooth'
                                });
                                
                                // Add a temporary highlight to make it clear where the user landed
                                container.style.boxShadow = '0 0 20px rgba(33, 150, 243, 0.3)';
                                setTimeout(() => {
                                    container.style.boxShadow = '';
                                }, 2000);
                            }, 100);
                        } else {
                            // If map isn't ready yet, wait a bit more
                            console.log('⏳ World map still loading, waiting...');
                            setTimeout(waitForMapReady, 200);
                        }
                    };
                    
                    // Start checking for map readiness after a short delay
                    setTimeout(waitForMapReady, 500);
                }
            }
        };
        
        // Prevent default anchor behavior on page load
        if (window.location.hash === '#world-map-container') {
            console.log('🎯 Preventing default anchor behavior on page load...');
            
            // Temporarily remove the hash to prevent default behavior
            const currentHash = window.location.hash;
            history.replaceState(null, null, window.location.pathname);
            
            // Handle the navigation manually after a delay
            setTimeout(() => {
                // Restore the hash
                history.replaceState(null, null, currentHash);
                // Handle the navigation
                handleAnchorNavigation();
            }, 200);
        }
        
        // Also handle anchor navigation when hash changes (for back/forward navigation)
        window.addEventListener('hashchange', (e) => {
            if (window.location.hash === '#world-map-container') {
                console.log('🎯 Hash change detected - handling world map navigation...');
                // Prevent default behavior
                e.preventDefault();
                handleAnchorNavigation();
            }
        });
    } else {
        console.log('❌ No world map element found on this page');
    }
}); 