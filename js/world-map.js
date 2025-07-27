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
        'criminal': '#d32f2f',
        'limited': '#f57c00',
        'legal': '#388e3c',
        'full-equality': '#1976d2'
    },
    rainbow: {
        0: '#8b0000',    // 0-20%
        20: '#ff4500',   // 21-40%
        40: '#ffa500',   // 41-60%
        60: '#32cd32',   // 61-80%
        80: '#006400'    // 81-100%
    }
};

// Simplified world map SVG paths (key countries)
const countryPaths = {
    'United Kingdom': 'M450,150 L470,150 L470,180 L450,180 Z',
    'France': 'M440,180 L470,180 L470,220 L440,220 Z',
    'Germany': 'M470,160 L500,160 L500,200 L470,200 Z',
    'Spain': 'M420,220 L450,220 L450,250 L420,250 Z',
    'Italy': 'M470,220 L490,220 L490,270 L470,270 Z',
    'Netherlands': 'M460,150 L480,150 L480,170 L460,170 Z',
    'Belgium': 'M450,170 L470,170 L470,185 L450,185 Z',
    'Poland': 'M500,160 L540,160 L540,200 L500,200 Z',
    'Russia': 'M540,100 L750,100 L750,200 L540,200 Z',
    'United States': 'M100,180 L280,180 L280,280 L100,280 Z',
    'Canada': 'M100,100 L300,100 L300,180 L100,180 Z',
    'Brazil': 'M250,300 L350,300 L350,420 L250,420 Z',
    'Australia': 'M750,350 L850,350 L850,420 L750,420 Z',
    'South Africa': 'M480,380 L530,380 L530,420 L480,420 Z',
    'Nigeria': 'M440,300 L480,300 L480,340 L440,340 Z',
    'Saudi Arabia': 'M540,250 L580,250 L580,290 L540,290 Z',
    'India': 'M650,250 L700,250 L700,320 L650,320 Z',
    'China': 'M700,180 L800,180 L800,250 L700,250 Z',
    'Japan': 'M820,200 L850,200 L850,240 L820,240 Z',
    'Iceland': 'M400,120 L430,120 L430,140 L400,140 Z',
    'Malta': 'M480,240 L490,240 L490,250 L480,250 Z',
    'Hungary': 'M500,200 L530,200 L530,220 L500,220 Z'
};

class WorldMap {
    constructor() {
        this.currentFilter = 'criminalization';
        this.svg = document.getElementById('world-map');
        this.countryInfo = document.getElementById('country-info');
        this.init();
    }

    init() {
        this.createMap();
        this.setupControls();
        this.updateColors();
    }

    createMap() {
        // Clear existing paths
        this.svg.innerHTML = '';
        
        // Create country paths
        Object.entries(countryPaths).forEach(([countryName, path]) => {
            if (worldMapData[countryName]) {
                const countryElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                countryElement.setAttribute('d', path);
                countryElement.setAttribute('id', `country-${countryName.replace(/\s+/g, '-')}`);
                countryElement.classList.add('country-path');
                countryElement.style.cursor = 'pointer';
                countryElement.style.stroke = '#333';
                countryElement.style.strokeWidth = '1';
                countryElement.style.transition = 'all 0.3s ease';
                
                countryElement.addEventListener('click', () => this.showCountryInfo(countryName));
                countryElement.addEventListener('mouseenter', () => this.highlightCountry(countryElement));
                countryElement.addEventListener('mouseleave', () => this.unhighlightCountry(countryElement));
                
                this.svg.appendChild(countryElement);
            }
        });

        // Add ocean background
        const ocean = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        ocean.setAttribute('x', '0');
        ocean.setAttribute('y', '0');
        ocean.setAttribute('width', '1000');
        ocean.setAttribute('height', '500');
        ocean.setAttribute('fill', '#e3f2fd');
        ocean.setAttribute('opacity', '0.3');
        this.svg.insertBefore(ocean, this.svg.firstChild);
    }

    setupControls() {
        const filterButtons = document.querySelectorAll('.map-filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.getAttribute('data-filter');
                this.updateColors();
                this.updateLegend();
            });
        });
    }

    updateColors() {
        Object.entries(worldMapData).forEach(([countryName, data]) => {
            const element = document.getElementById(`country-${countryName.replace(/\s+/g, '-')}`);
            if (element) {
                let color;
                
                if (this.currentFilter === 'criminalization') {
                    color = colorSchemes.criminalization[data.criminalizationStatus];
                } else if (this.currentFilter === 'rainbow') {
                    const score = data.rainbowScore;
                    if (score >= 81) color = colorSchemes.rainbow[80];
                    else if (score >= 61) color = colorSchemes.rainbow[60];
                    else if (score >= 41) color = colorSchemes.rainbow[40];
                    else if (score >= 21) color = colorSchemes.rainbow[20];
                    else color = colorSchemes.rainbow[0];
                } else { // both
                    // Blend colors based on both metrics
                    const crimColor = colorSchemes.criminalization[data.criminalizationStatus];
                    color = crimColor; // Simplified for now
                }
                
                element.setAttribute('fill', color);
            }
        });
    }

    updateLegend() {
        const crimLegend = document.getElementById('criminalization-legend');
        const rainbowLegend = document.getElementById('rainbow-legend');
        
        if (this.currentFilter === 'criminalization' || this.currentFilter === 'both') {
            crimLegend.style.display = 'block';
        } else {
            crimLegend.style.display = 'none';
        }
        
        if (this.currentFilter === 'rainbow' || this.currentFilter === 'both') {
            rainbowLegend.style.display = 'block';
        } else {
            rainbowLegend.style.display = 'none';
        }
    }

    highlightCountry(element) {
        element.style.strokeWidth = '3';
        element.style.stroke = '#2196f3';
        element.style.filter = 'brightness(1.2)';
    }

    unhighlightCountry(element) {
        element.style.strokeWidth = '1';
        element.style.stroke = '#333';
        element.style.filter = 'none';
    }

    showCountryInfo(countryName) {
        const data = worldMapData[countryName];
        if (!data) return;
        
        const countryNameEl = document.getElementById('country-name');
        const countryDetailsEl = document.getElementById('country-details');
        
        countryNameEl.textContent = data.name;
        
        let detailsHTML = `
            <p><strong>Description:</strong> ${data.description}</p>
            <div style="margin: 1rem 0;">
                <strong>Key Metrics:</strong>
                <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                    <li>Rainbow Map Score: <strong>${data.rainbowScore}%</strong></li>
                    <li>Legal Status: <strong>${this.formatStatus(data.criminalizationStatus)}</strong></li>
                    <li>Marriage Equality: <strong>${data.marriageEquality ? 'Yes' : 'No'}</strong></li>
                </ul>
            </div>
        `;
        
        if (data.categories) {
            detailsHTML += `
                <div style="margin-top: 1rem;">
                    <strong>Rainbow Map Categories:</strong>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem; margin-top: 0.5rem;">
            `;
            
            Object.entries(data.categories).forEach(([category, score]) => {
                const color = this.getScoreColor(score);
                detailsHTML += `
                    <div style="background: ${color}20; padding: 0.5rem; border-radius: 4px; border-left: 3px solid ${color};">
                        <div style="font-size: 0.85rem; font-weight: 500;">${category}</div>
                        <div style="font-size: 0.9rem; color: ${color}; font-weight: 600;">${score}%</div>
                    </div>
                `;
            });
            
            detailsHTML += '</div></div>';
        }
        
        countryDetailsEl.innerHTML = detailsHTML;
        this.countryInfo.style.display = 'block';
    }

    getScoreColor(score) {
        if (score >= 81) return '#006400';
        if (score >= 61) return '#32cd32';
        if (score >= 41) return '#ffa500';
        if (score >= 21) return '#ff4500';
        return '#8b0000';
    }

    formatStatus(status) {
        const statusMap = {
            'criminal': 'Criminalized',
            'limited': 'Limited Protection',
            'legal': 'Legal',
            'full-equality': 'Full Equality'
        };
        return statusMap[status] || status;
    }
}

// Initialize the map when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the lgbtq-history page
    if (document.getElementById('world-map')) {
        new WorldMap();
    }
}); 