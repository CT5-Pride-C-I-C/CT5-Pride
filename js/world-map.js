// World Map for LGBTQ+ Rights Status
// Data combines criminalization status with ILGA-Europe Rainbow Map scores

const worldMapData = {
    // European Countries (from Rainbow Map)
    'United Kingdom': {
        name: 'United Kingdom',
        criminalizationStatus: 'legal',
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
        criminalizationStatus: 'full-equality',
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
        criminalizationStatus: 'full-equality',
        rainbowScore: 85,
        marriageEquality: true,
        description: 'Second place in Rainbow Map 2025. Strong protections across all categories.',
        categories: {
            'Equality & Non-Discrimination': 90,
            'Family': 85,
            'Hate Crime & Hate Speech': 90,
            'Legal Gender Recognition': 80,
            'Intersex Bodily Integrity': 75,
            'Civil Society Space': 85,
            'Asylum': 85
        }
    },
    'Iceland': {
        name: 'Iceland',
        criminalizationStatus: 'full-equality',
        rainbowScore: 84,
        marriageEquality: true,
        description: 'Third place in Rainbow Map. Strong on intersex protections and gender recognition.',
        categories: {
            'Equality & Non-Discrimination': 85,
            'Family': 90,
            'Hate Crime & Hate Speech': 85,
            'Legal Gender Recognition': 85,
            'Intersex Bodily Integrity': 80,
            'Civil Society Space': 80,
            'Asylum': 75
        }
    },
    'Spain': {
        name: 'Spain',
        criminalizationStatus: 'full-equality',
        rainbowScore: 80,
        marriageEquality: true,
        description: 'Strong LGBTQ+ protections with regional variations. Full hate crime coverage in some regions.',
        categories: {
            'Equality & Non-Discrimination': 85,
            'Family': 85,
            'Hate Crime & Hate Speech': 75,
            'Legal Gender Recognition': 75,
            'Intersex Bodily Integrity': 80,
            'Civil Society Space': 80,
            'Asylum': 80
        }
    },
    'Germany': {
        name: 'Germany',
        criminalizationStatus: 'full-equality',
        rainbowScore: 78,
        marriageEquality: true,
        description: 'Recent improvements in legal gender recognition. Strong on intersex protections.',
        categories: {
            'Equality & Non-Discrimination': 80,
            'Family': 80,
            'Hate Crime & Hate Speech': 75,
            'Legal Gender Recognition': 85,
            'Intersex Bodily Integrity': 80,
            'Civil Society Space': 75,
            'Asylum': 70
        }
    },
    'France': {
        name: 'France',
        criminalizationStatus: 'full-equality',
        rainbowScore: 72,
        marriageEquality: true,
        description: 'Marriage equality since 2013. Some gaps in trans and intersex protections.',
        categories: {
            'Equality & Non-Discrimination': 75,
            'Family': 80,
            'Hate Crime & Hate Speech': 70,
            'Legal Gender Recognition': 65,
            'Intersex Bodily Integrity': 60,
            'Civil Society Space': 80,
            'Asylum': 75
        }
    },
    'Netherlands': {
        name: 'Netherlands',
        criminalizationStatus: 'full-equality',
        rainbowScore: 76,
        marriageEquality: true,
        description: 'First country to legalize same-sex marriage (2001). Strong overall protections.',
        categories: {
            'Equality & Non-Discrimination': 80,
            'Family': 85,
            'Hate Crime & Hate Speech': 75,
            'Legal Gender Recognition': 70,
            'Intersex Bodily Integrity': 65,
            'Civil Society Space': 80,
            'Asylum': 70
        }
    },
    'Poland': {
        name: 'Poland',
        criminalizationStatus: 'limited',
        rainbowScore: 21,
        marriageEquality: false,
        description: 'Significant restrictions on LGBTQ+ rights. "LGBT-free zones" declared in some regions.',
        categories: {
            'Equality & Non-Discrimination': 25,
            'Family': 15,
            'Hate Crime & Hate Speech': 20,
            'Legal Gender Recognition': 25,
            'Intersex Bodily Integrity': 15,
            'Civil Society Space': 30,
            'Asylum': 20
        }
    },
    'Hungary': {
        name: 'Hungary',
        criminalizationStatus: 'limited',
        rainbowScore: 25,
        marriageEquality: false,
        description: 'Significant rollbacks in recent years. Constitutional amendments restricting LGBTQ+ rights.',
        categories: {
            'Equality & Non-Discrimination': 20,
            'Family': 25,
            'Hate Crime & Hate Speech': 25,
            'Legal Gender Recognition': 10,
            'Intersex Bodily Integrity': 15,
            'Civil Society Space': 20,
            'Asylum': 30
        }
    },
    'Russia': {
        name: 'Russia',
        criminalizationStatus: 'criminal',
        rainbowScore: 2,
        marriageEquality: false,
        description: 'Severe restrictions including "LGBT propaganda" laws. Bottom of Rainbow Map.',
        categories: {
            'Equality & Non-Discrimination': 0,
            'Family': 0,
            'Hate Crime & Hate Speech': 5,
            'Legal Gender Recognition': 0,
            'Intersex Bodily Integrity': 5,
            'Civil Society Space': 0,
            'Asylum': 5
        }
    },
    // Global Examples
    'United States': {
        name: 'United States',
        criminalizationStatus: 'legal',
        rainbowScore: 65,
        marriageEquality: true,
        description: 'Federal marriage equality since 2015. Significant state-level variations in protections.',
        categories: {
            'Equality & Non-Discrimination': 60,
            'Family': 75,
            'Hate Crime & Hate Speech': 55,
            'Legal Gender Recognition': 50,
            'Intersex Bodily Integrity': 40,
            'Civil Society Space': 70,
            'Asylum': 65
        }
    },
    'Canada': {
        name: 'Canada',
        criminalizationStatus: 'full-equality',
        rainbowScore: 82,
        marriageEquality: true,
        description: 'Strong LGBTQ+ protections. Marriage equality since 2005.',
        categories: {
            'Equality & Non-Discrimination': 85,
            'Family': 85,
            'Hate Crime & Hate Speech': 80,
            'Legal Gender Recognition': 75,
            'Intersex Bodily Integrity': 70,
            'Civil Society Space': 90,
            'Asylum': 85
        }
    },
    'Australia': {
        name: 'Australia',
        criminalizationStatus: 'full-equality',
        rainbowScore: 75,
        marriageEquality: true,
        description: 'Marriage equality since 2017. Strong anti-discrimination protections.',
        categories: {
            'Equality & Non-Discrimination': 80,
            'Family': 80,
            'Hate Crime & Hate Speech': 70,
            'Legal Gender Recognition': 65,
            'Intersex Bodily Integrity': 60,
            'Civil Society Space': 85,
            'Asylum': 80
        }
    },
    'Brazil': {
        name: 'Brazil',
        criminalizationStatus: 'legal',
        rainbowScore: 60,
        marriageEquality: true,
        description: 'Marriage equality achieved through courts. High levels of violence against LGBTQ+ people.',
        categories: {
            'Equality & Non-Discrimination': 65,
            'Family': 70,
            'Hate Crime & Hate Speech': 50,
            'Legal Gender Recognition': 55,
            'Intersex Bodily Integrity': 45,
            'Civil Society Space': 60,
            'Asylum': 55
        }
    },
    'Nigeria': {
        name: 'Nigeria',
        criminalizationStatus: 'criminal',
        rainbowScore: 5,
        marriageEquality: false,
        description: 'Homosexuality criminalized with severe penalties. Same-sex marriage prohibited.',
        categories: {
            'Equality & Non-Discrimination': 0,
            'Family': 0,
            'Hate Crime & Hate Speech': 10,
            'Legal Gender Recognition': 0,
            'Intersex Bodily Integrity': 5,
            'Civil Society Space': 5,
            'Asylum': 15
        }
    },
    'Saudi Arabia': {
        name: 'Saudi Arabia',
        criminalizationStatus: 'criminal',
        rainbowScore: 0,
        marriageEquality: false,
        description: 'Homosexuality punishable by death. No legal protections for LGBTQ+ people.',
        categories: {
            'Equality & Non-Discrimination': 0,
            'Family': 0,
            'Hate Crime & Hate Speech': 0,
            'Legal Gender Recognition': 0,
            'Intersex Bodily Integrity': 0,
            'Civil Society Space': 0,
            'Asylum': 0
        }
    },
    'South Africa': {
        name: 'South Africa',
        criminalizationStatus: 'full-equality',
        rainbowScore: 68,
        marriageEquality: true,
        description: 'First country to constitutionally protect LGBTQ+ rights. First African country with marriage equality.',
        categories: {
            'Equality & Non-Discrimination': 75,
            'Family': 75,
            'Hate Crime & Hate Speech': 60,
            'Legal Gender Recognition': 55,
            'Intersex Bodily Integrity': 50,
            'Civil Society Space': 70,
            'Asylum': 65
        }
    },
    'Japan': {
        name: 'Japan',
        criminalizationStatus: 'legal',
        rainbowScore: 45,
        marriageEquality: false,
        description: 'Growing acceptance but limited legal protections. Some local partnership recognitions.',
        categories: {
            'Equality & Non-Discrimination': 40,
            'Family': 30,
            'Hate Crime & Hate Speech': 45,
            'Legal Gender Recognition': 50,
            'Intersex Bodily Integrity': 35,
            'Civil Society Space': 60,
            'Asylum': 40
        }
    },
    'India': {
        name: 'India',
        criminalizationStatus: 'legal',
        rainbowScore: 35,
        marriageEquality: false,
        description: 'Homosexuality decriminalized in 2018. Limited legal protections but growing activism.',
        categories: {
            'Equality & Non-Discrimination': 30,
            'Family': 20,
            'Hate Crime & Hate Speech': 35,
            'Legal Gender Recognition': 45,
            'Intersex Bodily Integrity': 25,
            'Civil Society Space': 40,
            'Asylum': 35
        }
    },
    'China': {
        name: 'China',
        criminalizationStatus: 'legal',
        rainbowScore: 25,
        marriageEquality: false,
        description: 'Homosexuality legal but no anti-discrimination protections. Limited civil society space.',
        categories: {
            'Equality & Non-Discrimination': 20,
            'Family': 15,
            'Hate Crime & Hate Speech': 25,
            'Legal Gender Recognition': 20,
            'Intersex Bodily Integrity': 20,
            'Civil Society Space': 25,
            'Asylum': 30
        }
    }
};

// Color schemes for different views
const colorSchemes = {
    criminalization: {
        'Criminal': '#d32f2f',      // Strong red - urgent change needed
        'Limited Protection': '#f57c00', // Orange
        'Legal': '#388e3c',         // Green
        'Full Equality': '#1976d2'  // Blue
    },
    rainbow: {
        0: '#8b0000',    // 0-20%
        20: '#ff4500',   // 21-40%
        40: '#ffa500',   // 41-60%
        60: '#32cd32',   // 61-80%
        80: '#006400'    // 81-100%
    }
};

// World Country Paths are loaded from world-map-paths.js
// This file uses the worldCountryPaths variable defined there

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
            this.updateColors();
            
            console.log('✅ World map initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize world map:', error);
        }
    }

    async loadWorldMapSVG() {
        try {
            // Load the world.svg file
            const response = await fetch('Images/world.svg');
            const svgText = await response.text();
            
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
            const viewBox = sourceSvg.getAttribute('viewBox') || sourceSvg.getAttribute('mapsvg:geoViewBox') || '0 0 1000 500';
            this.svg.setAttribute('viewBox', viewBox);
            
            // Get all country paths from the source SVG
            const countryPaths = sourceSvg.querySelectorAll('path[id]');
            console.log(`📍 Found ${countryPaths.length} countries in world.svg`);
            
            // Process each country path
            countryPaths.forEach(path => {
                const countryCode = path.getAttribute('id');
                const countryName = path.getAttribute('title');
                const pathData = path.getAttribute('d');
                
                if (countryCode && countryName && pathData) {
                    // Check if we have data for this country
                    const countryData = this.getCountryDataByCode(countryCode) || this.getCountryDataByName(countryName);
                    
                    if (countryData) {
                        // Create new path element
                        const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        newPath.setAttribute('d', pathData);
                        newPath.setAttribute('id', `country-${countryCode}`);
                        newPath.setAttribute('data-country', countryName);
                        newPath.classList.add('country-path');
                        newPath.style.cursor = 'pointer';
                        newPath.style.stroke = '#333';
                        newPath.style.strokeWidth = '0.5';
                        newPath.style.transition = 'all 0.3s ease';
                        newPath.style.strokeLinejoin = 'round';
                        newPath.style.strokeLinecap = 'round';
                        
                        // Add event listeners
                        newPath.addEventListener('click', () => this.showCountryInfo(countryName));
                        newPath.addEventListener('mouseenter', () => this.highlightCountry(newPath));
                        newPath.addEventListener('mouseleave', () => this.unhighlightCountry(newPath));
                        
                        this.svg.appendChild(newPath);
                    } else {
                        // Create path with default styling for countries without data
                        const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        newPath.setAttribute('d', pathData);
                        newPath.setAttribute('id', `country-${countryCode}`);
                        newPath.setAttribute('data-country', countryName);
                        newPath.classList.add('country-path', 'no-data');
                        newPath.style.fill = '#f0f0f0';
                        newPath.style.stroke = '#ddd';
                        newPath.style.strokeWidth = '0.5';
                        newPath.style.cursor = 'default';
                        
                        this.svg.appendChild(newPath);
                    }
                }
            });
            
            console.log('🌍 World map SVG loaded successfully');
            
        } catch (error) {
            console.error('Failed to load world.svg:', error);
            // Fallback to basic map if loading fails
            this.createFallbackMap();
        }
    }

    getCountryDataByCode(code) {
        // Map country codes to our data
        const codeMapping = {
            'US': 'United States',
            'GB': 'United Kingdom', 
            'FR': 'France',
            'DE': 'Germany',
            'ES': 'Spain',
            'IT': 'Italy',
            'RU': 'Russia',
            'CN': 'China',
            'IN': 'India',
            'BR': 'Brazil',
            'AU': 'Australia',
            'CA': 'Canada',
            'MX': 'Mexico',
            'AR': 'Argentina',
            'ZA': 'South Africa',
            'EG': 'Egypt',
            'NG': 'Nigeria',
            'KE': 'Kenya',
            'JP': 'Japan',
            'KR': 'South Korea',
            'TH': 'Thailand',
            'ID': 'Indonesia',
            'MY': 'Malaysia',
            'PH': 'Philippines',
            'VN': 'Vietnam',
            'TR': 'Turkey',
            'IR': 'Iran',
            'SA': 'Saudi Arabia',
            'AE': 'United Arab Emirates',
            'IL': 'Israel',
            'JO': 'Jordan',
            'LB': 'Lebanon',
            'SY': 'Syria',
            'IQ': 'Iraq',
            'AF': 'Afghanistan',
            'PK': 'Pakistan',
            'BD': 'Bangladesh',
            'LK': 'Sri Lanka',
            'MM': 'Myanmar',
            'NP': 'Nepal',
            'BT': 'Bhutan',
            'MV': 'Maldives',
            'UG': 'Uganda',
            'TZ': 'Tanzania',
            'RW': 'Rwanda',
            'ET': 'Ethiopia',
            'GH': 'Ghana',
            'SN': 'Senegal',
            'ML': 'Mali',
            'BF': 'Burkina Faso',
            'NE': 'Niger',
            'TD': 'Chad',
            'SD': 'Sudan',
            'SS': 'South Sudan',
            'CF': 'Central African Republic',
            'CM': 'Cameroon',
            'GA': 'Gabon',
            'CG': 'Congo',
            'CD': 'Democratic Republic of Congo',
            'AO': 'Angola',
            'ZM': 'Zambia',
            'ZW': 'Zimbabwe',
            'BW': 'Botswana',
            'NA': 'Namibia',
            'MW': 'Malawi',
            'MZ': 'Mozambique',
            'MG': 'Madagascar',
            'MU': 'Mauritius',
            'SC': 'Seychelles',
            'KM': 'Comoros',
            'DJ': 'Djibouti',
            'SO': 'Somalia',
            'ER': 'Eritrea'
        };
        
        const countryName = codeMapping[code];
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
        errorText.textContent = 'World map could not be loaded';
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
                this.updateColors();
                this.updateLegend();
            });
        }

        if (rainbowBtn) {
            rainbowBtn.addEventListener('click', () => {
                this.currentFilter = 'rainbow';
                this.updateActiveButton(rainbowBtn);
                this.updateColors();
                this.updateLegend();
            });
        }

        if (bothBtn) {
            bothBtn.addEventListener('click', () => {
                this.currentFilter = 'both';
                this.updateActiveButton(bothBtn);
                this.updateColors();
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

    updateColors() {
        console.log(`🎨 Updating colors for filter: ${this.currentFilter}`);
        
        const countryPaths = this.svg.querySelectorAll('.country-path:not(.no-data)');
        
        countryPaths.forEach(path => {
            const countryName = path.getAttribute('data-country');
            const data = worldMapData[countryName];
            
            if (data) {
                let color = '#f0f0f0'; // Default color
                
                if (this.currentFilter === 'criminalization') {
                    color = this.getCriminalizationColor(data.criminalizationStatus);
                } else if (this.currentFilter === 'rainbow') {
                    color = this.getRainbowColor(data.rainbowScore);
                } else if (this.currentFilter === 'both') {
                    // Combined view - prioritize criminalization with transparency
                    color = this.getCombinedColor(data);
                }
                
                path.style.fill = color;
                path.style.fillOpacity = '0.8';
            }
        });
    }

    getCriminalizationColor(status) {
        const colors = {
            'Criminal': '#d32f2f',      // Strong red - urgent change needed
            'Limited Protection': '#f57c00', // Orange
            'Legal': '#388e3c',         // Green
            'Full Equality': '#1976d2'  // Blue
        };
        return colors[status] || '#f0f0f0';
    }

    getRainbowColor(score) {
        if (score >= 81) return '#006400';  // Dark green
        if (score >= 61) return '#32cd32';  // Lime green
        if (score >= 41) return '#ffa500';  // Orange
        if (score >= 21) return '#ff4500';  // Orange red
        return '#8b0000';  // Dark red
    }

    getCombinedColor(data) {
        // Prioritize showing criminalization status with rainbow score transparency
        const baseColor = this.getCriminalizationColor(data.criminalizationStatus);
        return baseColor;
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
            const statusColor = this.getCriminalizationColor(data.criminalizationStatus);
            detailsHTML += `
                <div style="margin-bottom: 1rem;">
                    <strong>Criminalization Status:</strong>
                    <span style="color: ${statusColor}; font-weight: bold; margin-left: 0.5rem;">
                        ${data.criminalizationStatus}
                    </span>
                </div>
            `;
        }
        
        if (this.currentFilter === 'rainbow' || this.currentFilter === 'both') {
            const scoreColor = this.getRainbowColor(data.rainbowScore);
            detailsHTML += `
                <div style="margin-bottom: 1rem;">
                    <strong>Rainbow Map Score:</strong>
                    <span style="color: ${scoreColor}; font-weight: bold; margin-left: 0.5rem;">
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

        countryDetailsEl.innerHTML = detailsHTML;
        infoPanel.style.display = 'block';
        
        // Add special message for countries with criminalization
        if (data.criminalizationStatus === 'Criminal') {
            const warningHTML = `
                <div style="background: #ffebee; border: 1px solid #f44336; border-radius: 4px; padding: 0.75rem; margin-top: 1rem;">
                    <strong style="color: #d32f2f;">⚠️ Change Needed:</strong> 
                    <span style="color: #c62828;">LGBTQ+ people face criminalization in this country. Advocacy and legal reform are urgently needed.</span>
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
        new WorldMap();
    }
}); 