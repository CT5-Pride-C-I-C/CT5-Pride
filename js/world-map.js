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

// Import world country paths
// Load from external file for better maintainability
const worldCountryPaths = {
    'United Kingdom': {
        path: 'M 468 142 L 478 140 L 485 145 L 482 152 L 479 159 L 475 162 L 470 160 L 465 155 L 463 148 Z M 460 148 L 465 150 L 468 155 L 465 160 L 460 158 L 458 152 Z',
        center: [473, 151]
    },
    'France': {
        path: 'M 445 175 L 465 172 L 475 178 L 478 185 L 475 195 L 470 200 L 460 202 L 450 200 L 445 190 L 440 182 Z',
        center: [460, 187]
    },
    'Germany': {
        path: 'M 475 155 L 490 152 L 495 158 L 498 165 L 495 175 L 488 180 L 480 178 L 475 170 L 472 162 Z',
        center: [485, 167]
    },
    'Spain': {
        path: 'M 420 195 L 445 192 L 450 200 L 448 210 L 445 218 L 435 222 L 425 220 L 418 212 L 415 202 Z',
        center: [432, 207]
    },
    'Italy': {
        path: 'M 475 195 L 485 192 L 488 200 L 485 210 L 482 220 L 478 235 L 475 245 L 470 240 L 468 225 L 470 210 L 472 200 Z',
        center: [477, 218]
    },
    'Netherlands': {
        path: 'M 465 150 L 475 148 L 478 152 L 475 158 L 470 160 L 465 158 L 462 154 Z',
        center: [470, 154]
    },
    'Belgium': {
        path: 'M 455 165 L 465 163 L 468 167 L 465 172 L 460 174 L 455 172 L 452 168 Z',
        center: [460, 168]
    },
    'Poland': {
        path: 'M 495 155 L 515 152 L 520 158 L 522 168 L 518 178 L 510 182 L 500 180 L 495 172 L 492 162 Z',
        center: [507, 167]
    },
    'Hungary': {
        path: 'M 495 178 L 510 175 L 515 182 L 512 190 L 508 195 L 500 192 L 495 187 L 492 182 Z',
        center: [504, 184]
    },
    'Russia': {
        path: 'M 520 120 L 750 115 L 760 125 L 755 140 L 750 155 L 745 170 L 740 185 L 730 195 L 720 200 L 700 198 L 680 195 L 660 192 L 640 190 L 620 188 L 600 185 L 580 182 L 560 180 L 540 178 L 520 175 L 515 165 L 512 150 L 515 135 Z',
        center: [635, 157]
    },
    'Iceland': {
        path: 'M 400 115 L 415 112 L 420 118 L 418 125 L 412 128 L 405 126 L 398 122 Z',
        center: [409, 120]
    },
    'Malta': {
        path: 'M 485 235 L 490 233 L 492 237 L 490 241 L 485 239 L 483 235 Z',
        center: [487, 237]
    },
    'United States': {
        path: 'M 80 160 L 280 155 L 285 165 L 290 180 L 285 195 L 280 210 L 275 225 L 270 240 L 260 250 L 245 255 L 225 258 L 200 260 L 175 258 L 150 255 L 125 252 L 100 248 L 85 240 L 78 225 L 75 210 L 78 195 L 80 180 Z M 50 200 L 75 195 L 80 205 L 75 215 L 50 210 Z',
        center: [182, 207]
    },
    'Canada': {
        path: 'M 60 80 L 300 75 L 310 85 L 315 100 L 310 115 L 305 130 L 300 145 L 290 155 L 280 160 L 260 158 L 240 155 L 220 152 L 200 150 L 180 148 L 160 145 L 140 142 L 120 140 L 100 138 L 80 135 L 65 130 L 55 120 L 50 105 L 55 90 Z',
        center: [182, 117]
    },
    'Brazil': {
        path: 'M 220 300 L 320 295 L 335 305 L 345 320 L 350 340 L 345 360 L 340 380 L 330 400 L 315 415 L 295 425 L 270 428 L 245 425 L 225 420 L 210 410 L 200 395 L 195 375 L 200 355 L 205 335 L 212 315 Z',
        center: [270, 365]
    },
    'Australia': {
        path: 'M 720 340 L 820 335 L 840 345 L 850 360 L 845 380 L 835 395 L 820 405 L 800 410 L 775 408 L 750 405 L 730 400 L 715 390 L 708 375 L 710 360 L 715 350 Z',
        center: [778, 375]
    },
    'South Africa': {
        path: 'M 480 370 L 520 368 L 525 375 L 528 385 L 525 395 L 520 405 L 512 410 L 500 408 L 488 405 L 480 398 L 475 388 L 477 378 Z',
        center: [502, 389]
    },
    'Nigeria': {
        path: 'M 445 285 L 470 282 L 475 290 L 478 300 L 475 310 L 468 318 L 458 320 L 448 318 L 442 310 L 440 300 L 442 290 Z',
        center: [459, 301]
    },
    'Saudi Arabia': {
        path: 'M 535 245 L 570 242 L 575 250 L 578 260 L 575 270 L 570 280 L 562 285 L 550 282 L 540 278 L 532 270 L 530 260 L 532 250 Z',
        center: [554, 264]
    },
    'India': {
        path: 'M 620 240 L 680 235 L 690 245 L 695 260 L 692 280 L 685 300 L 675 315 L 660 325 L 645 322 L 630 315 L 620 300 L 615 280 L 618 260 L 620 245 Z',
        center: [657, 280]
    },
    'China': {
        path: 'M 670 170 L 750 165 L 770 175 L 785 190 L 790 210 L 785 230 L 775 245 L 760 255 L 740 260 L 720 258 L 700 255 L 685 250 L 675 240 L 670 225 L 668 205 L 670 185 Z',
        center: [729, 215]
    },
    'Japan': {
        path: 'M 800 180 L 820 178 L 825 185 L 828 195 L 825 205 L 820 215 L 812 220 L 805 218 L 800 210 L 798 200 L 800 190 Z M 805 220 L 815 218 L 818 225 L 815 232 L 810 235 L 805 232 L 802 225 Z',
        center: [814, 205]
    }
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
        
        // Add ocean background first
        const ocean = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        ocean.setAttribute('x', '0');
        ocean.setAttribute('y', '0');
        ocean.setAttribute('width', '1000');
        ocean.setAttribute('height', '500');
        ocean.setAttribute('fill', '#e3f2fd');
        ocean.setAttribute('opacity', '0.3');
        this.svg.appendChild(ocean);

        // Add continents background
        const continents = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        continents.setAttribute('id', 'continents-background');
        
        // Simple continent shapes for context
        const northAmerica = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        northAmerica.setAttribute('d', 'M 50 70 L 320 65 L 325 300 L 45 305 Z');
        northAmerica.setAttribute('fill', '#f5f5f5');
        northAmerica.setAttribute('opacity', '0.5');
        continents.appendChild(northAmerica);

        const southAmerica = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        southAmerica.setAttribute('d', 'M 180 300 L 360 295 L 370 450 L 170 455 Z');
        southAmerica.setAttribute('fill', '#f5f5f5');
        southAmerica.setAttribute('opacity', '0.5');
        continents.appendChild(southAmerica);

        const europe = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        europe.setAttribute('d', 'M 390 110 L 540 105 L 545 200 L 385 205 Z');
        europe.setAttribute('fill', '#f5f5f5');
        europe.setAttribute('opacity', '0.5');
        continents.appendChild(europe);

        const asia = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        asia.setAttribute('d', 'M 540 100 L 850 95 L 855 320 L 535 325 Z');
        asia.setAttribute('fill', '#f5f5f5');
        asia.setAttribute('opacity', '0.5');
        continents.appendChild(asia);

        const africa = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        africa.setAttribute('d', 'M 430 200 L 580 195 L 590 420 L 420 425 Z');
        africa.setAttribute('fill', '#f5f5f5');
        africa.setAttribute('opacity', '0.5');
        continents.appendChild(africa);

        const oceania = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        oceania.setAttribute('d', 'M 700 330 L 880 325 L 885 430 L 695 435 Z');
        oceania.setAttribute('fill', '#f5f5f5');
        oceania.setAttribute('opacity', '0.5');
        continents.appendChild(oceania);

        this.svg.appendChild(continents);
        
        // Create country paths
        Object.entries(worldCountryPaths).forEach(([countryName, countryData]) => {
            if (worldMapData[countryName]) {
                const countryElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                countryElement.setAttribute('d', countryData.path);
                countryElement.setAttribute('id', `country-${countryName.replace(/\s+/g, '-')}`);
                countryElement.classList.add('country-path');
                countryElement.style.cursor = 'pointer';
                countryElement.style.stroke = '#333';
                countryElement.style.strokeWidth = '1.5';
                countryElement.style.transition = 'all 0.3s ease';
                countryElement.style.strokeLinejoin = 'round';
                countryElement.style.strokeLinecap = 'round';
                
                countryElement.addEventListener('click', () => this.showCountryInfo(countryName));
                countryElement.addEventListener('mouseenter', () => this.highlightCountry(countryElement));
                countryElement.addEventListener('mouseleave', () => this.unhighlightCountry(countryElement));
                
                this.svg.appendChild(countryElement);

                // Add country labels for better identification
                if (countryData.center) {
                    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    label.setAttribute('x', countryData.center[0]);
                    label.setAttribute('y', countryData.center[1]);
                    label.setAttribute('class', 'country-label');
                    label.setAttribute('id', `label-${countryName.replace(/\s+/g, '-')}`);
                    
                    // Shorten long country names for better display
                    let displayName = countryName;
                    if (countryName.length > 12) {
                        const shortNames = {
                            'United Kingdom': 'UK',
                            'United States': 'USA',
                            'Saudi Arabia': 'Saudi',
                            'South Africa': 'S. Africa'
                        };
                        displayName = shortNames[countryName] || countryName.substring(0, 8) + '...';
                    }
                    
                    label.textContent = displayName;
                    this.svg.appendChild(label);
                }
            }
        });
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
        element.style.filter = 'brightness(1.2) drop-shadow(0 2px 4px rgba(0,0,0,0.2))';
        element.style.fillOpacity = '1';
        element.style.transform = 'scale(1.02)';
        element.style.transformOrigin = 'center';
        element.style.zIndex = '10';
        
        // Also highlight the label
        const countryName = element.id.replace('country-', '').replace(/-/g, ' ');
        const label = document.getElementById(`label-${element.id.replace('country-', '')}`);
        if (label) {
            label.style.opacity = '1';
            label.style.fill = '#2196f3';
            label.style.fontWeight = '600';
        }
    }

    unhighlightCountry(element) {
        element.style.strokeWidth = '1.5';
        element.style.stroke = '#333';
        element.style.filter = 'none';
        element.style.fillOpacity = '0.8';
        element.style.transform = 'none';
        element.style.zIndex = 'auto';
        
        // Reset label style
        const label = document.getElementById(`label-${element.id.replace('country-', '')}`);
        if (label) {
            label.style.opacity = '0.8';
            label.style.fill = '#666';
            label.style.fontWeight = '500';
        }
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