// LGBTQ+ Terms Dictionary
// Data sourced from Stonewall's LGBTQ+ terms resource: https://www.stonewall.org.uk/resources/list-lgbtq-terms

const lgbtqTerms = [
    {
        term: "Abro (sexual and romantic)",
        category: "sexual-orientation",
        definition: "A word used to describe people who have a fluid sexual and/or romantic orientation which changes over time, or the course of their life. They may use different terms to describe themselves over time.",
        example: "Someone might identify as abro if their attraction shifts between different genders throughout their life."
    },
    {
        term: "Ace",
        category: "sexual-orientation",
        definition: "An umbrella term used specifically to describe a lack of, varying, or occasional experiences of sexual attraction. This encompasses asexual people as well as those who identify as demisexual and grey-sexual.",
        example: "Ace people might also use terms such as gay, bi, lesbian, straight and queer in conjunction with asexual to describe the direction of their romantic or sexual attraction."
    },
    {
        term: "Ace and aro spectrum",
        category: "general",
        definition: "Umbrella terms used to describe the wide group of people who experience a lack of, varying, or occasional experiences of romantic and/or sexual attraction, including a lack of attraction.",
        example: "People may use terms such as asexual, ace, aromantic, aro, demi, grey, and abro to describe their experiences."
    },
    {
        term: "Allo (sexual and romantic)",
        category: "sexual-orientation",
        definition: "Allo people experience sexual and romantic attraction, and do not identify as on the ace or aro spectrum. Allo is to ace and aro spectrum identities, as straight is to LGB+ spectrum identities.",
        example: "It is important to use words that equalise experience, otherwise the opposite to ace and aro becomes 'normal' which is stigmatising."
    },
    {
        term: "Aro",
        category: "romantic-orientation",
        definition: "An umbrella term used specifically to describe a lack of, varying, or occasional experiences of romantic attraction. This encompasses aromantic people as well as those who identify as demiromantic and grey-romantic.",
        example: "Aro people who experience sexual attraction might also use terms such as gay, bi, lesbian, straight and queer to describe the direction of their attraction."
    },
    {
        term: "Aromantic",
        category: "romantic-orientation",
        definition: "A person who experiences little to no romantic attraction. Aromantic people may or may not experience sexual attraction.",
        example: "An aromantic person might experience sexual attraction but not romantic feelings, or they might experience neither."
    },
    {
        term: "Asexual",
        category: "sexual-orientation",
        definition: "A person who does not experience sexual attraction. Some asexual people experience romantic attraction, while others do not.",
        example: "An asexual person might be romantically attracted to people of the same gender, different genders, or no one at all."
    },
    {
        term: "Ally",
        category: "general",
        definition: "A straight and/or cis person who supports members of the LGBTQ+ community. Members of the LGBTQ+ community can also be allies to one another.",
        example: "An ally might attend Pride events, speak out against discrimination, or support LGBTQ+ rights and causes."
    },
    {
        term: "Bi",
        category: "sexual-orientation",
        definition: "Refers to someone who is attracted to more than one gender. Bi people may describe themselves using one or more of a wide variety of terms, including bisexual, pan and queer.",
        example: "A bi person might be attracted to men, women, and non-binary people, though the specific nature of their attraction can vary."
    },
    {
        term: "Biphobia",
        category: "general",
        definition: "Prejudice or negative attitudes, beliefs or views about bi people. This can include the fear or dislike of someone who is, or is perceived to be, bi.",
        example: "Biphobia might manifest as assuming bi people are confused, promiscuous, or unable to be monogamous."
    },
    {
        term: "Butch",
        category: "general",
        definition: "A term predominantly used to describe masculine lesbians.",
        example: "A butch lesbian might present in a traditionally masculine way through clothing, hairstyles, or mannerisms."
    },
    {
        term: "Cisgender or Cis",
        category: "gender-identity",
        definition: "Someone whose gender is the same as the sex they were assigned at birth. For example, a cis(gender) woman is someone who was assigned female at birth and continues to live and identify as a woman.",
        example: "A cis man is someone who was assigned male at birth and identifies as a man."
    },
    {
        term: "Coming out",
        category: "general",
        definition: "'Coming out' is when a person first tells someone/others about their sexual orientation and/or gender identity.",
        example: "Coming out is a personal and ongoing process that can happen multiple times throughout a person's life."
    },
    {
        term: "Deadnaming",
        category: "general",
        definition: "Calling someone by their birth name after they have changed their name. This term is often associated with trans people who have changed their name as part of their transition.",
        example: "Using someone's old name instead of their chosen name, even after they've asked you not to."
    },
    {
        term: "Demi (sexual and romantic)",
        category: "sexual-orientation",
        definition: "An umbrella term used to describe people who may only feel sexually or romantically attracted to people with whom they have formed an emotional bond.",
        example: "A demisexual person might only experience sexual attraction after developing a strong emotional connection with someone."
    },
    {
        term: "Femme",
        category: "general",
        definition: "A term predominantly used to describe feminine lesbians. It is also sometimes used more generally to describe feminine LGBTQ+ people.",
        example: "A femme lesbian might present in a traditionally feminine way through clothing, makeup, or mannerisms."
    },
    {
        term: "Gay",
        category: "sexual-orientation",
        definition: "Refers to a man who is attracted to men. Some non-binary people also identify with this term. Gay is also a generic term for lesbian and gay sexuality.",
        example: "Some women define themselves as gay rather than lesbian."
    },
    {
        term: "Gender",
        category: "gender-identity",
        definition: "A person's innate sense of being a man, woman, non-binary or another gender. Gendered norms, roles and behaviours exist, which are typically associated with being a woman, man, girl or boy.",
        example: "Gender is different from biological sex and can vary across cultures and societies."
    },
    {
        term: "Gender dysphoria",
        category: "gender-identity",
        definition: "A term used to describe the discomfort or distress that a person experiences when there is a mismatch between their sex assigned at birth and their gender identity.",
        example: "A trans person might experience gender dysphoria when their body doesn't match their internal sense of gender."
    },
    {
        term: "Gender expression",
        category: "gender-identity",
        definition: "How a person expresses their gender outwardly. This could be through cues such as clothing, haircuts and behaviour.",
        example: "Someone might express their gender through the clothes they wear, their hairstyle, or how they carry themselves."
    },
    {
        term: "Gender identity",
        category: "gender-identity",
        definition: "A person's innate sense of their own gender, whether male, female or something else, which may or may not correspond to the sex assigned at birth.",
        example: "A person's gender identity is their internal understanding of who they are, regardless of how they present to the world."
    },
    {
        term: "Gender incongruence",
        category: "gender-identity",
        definition: "A term used to describe the mismatch between a person's gender and the sex they were assigned at birth. This is also the clinical diagnosis used by the NHS for someone who is trans.",
        example: "This term is often used in medical contexts to describe the experience of being transgender."
    },
    {
        term: "Gender non-conforming",
        category: "gender-identity",
        definition: "A person whose gender expression doesn't align with societal expectations of gender. Both cis and trans people can be gender non-conforming.",
        example: "A cis man who wears makeup or a cis woman who has short hair might be considered gender non-conforming."
    },
    {
        term: "Genderqueer",
        category: "gender-identity",
        definition: "A term for people whose gender identity doesn't sit comfortably with 'man' or 'woman'. It is also used by people who reject binary gender roles and/or normative gender expression.",
        example: "Genderqueer is often used in a similar way to non-binary."
    },
    {
        term: "Gender reassignment",
        category: "gender-identity",
        definition: "'Gender reassignment' is the phrase used in the Equality Act 2010 to describe the characteristic under which trans people are protected from discrimination in the workplace and wider society.",
        example: "This legal term refers to the process of transitioning, which can involve medical, social, and legal changes."
    },
    {
        term: "Gender Recognition Certificate (GRC)",
        category: "gender-identity",
        definition: "This enables trans people to be legally recognised in their affirmed gender and to be issued with a new birth certificate, if they choose. You currently have to be over 18 to apply.",
        example: "A GRC allows a trans person to be legally recognised as their true gender for official purposes."
    },
    {
        term: "Grey (sexual and romantic)",
        category: "sexual-orientation",
        definition: "Also known as grey-A, this is an umbrella term which describes people who experience attraction occasionally, rarely, or only under certain conditions.",
        example: "A grey-asexual person might experience sexual attraction very rarely or only in specific circumstances."
    },
    {
        term: "Heterosexual/straight",
        category: "sexual-orientation",
        definition: "Refers to a man who is attracted to women or to a woman who is attracted to men.",
        example: "A straight man is attracted to women, and a straight woman is attracted to men."
    },
    {
        term: "Homosexual",
        category: "sexual-orientation",
        definition: "A term to describe someone who is attracted to someone of the same sex or gender. The term 'gay' is now more generally used.",
        example: "This term is less commonly used today, with 'gay' and 'lesbian' being preferred."
    },
    {
        term: "Homophobia",
        category: "general",
        definition: "Prejudice or negative attitudes, beliefs or views about gay people. This can include the fear or dislike of someone because they are, or are perceived to be, gay.",
        example: "Homophobia can manifest as discrimination, violence, or negative stereotypes about gay people."
    },
    {
        term: "Intersex",
        category: "gender-identity",
        definition: "A term used to describe a person who has biological attributes of both male and female sexes or whose biological attributes do not fit with societal or medical assumptions about what constitutes male or female.",
        example: "Intersex people may identify as male, female, non-binary or otherwise."
    },
    {
        term: "Lesbian",
        category: "sexual-orientation",
        definition: "'Lesbian' refers to a woman who is attracted to women. Some non-binary people may also identify with this term.",
        example: "A lesbian woman is romantically and/or sexually attracted to other women."
    },
    {
        term: "Lesbophobia",
        category: "general",
        definition: "Prejudice or negative attitudes, beliefs or views about lesbians. This can include the fear or dislike of someone because they are or are perceived to be a lesbian.",
        example: "Lesbophobia might include negative stereotypes or discrimination against lesbian women."
    },
    {
        term: "LGBTQ+",
        category: "general",
        definition: "An acronym commonly used to describe people who are lesbian, gay, bi, trans, queer, questioning and ace. Other commonly used acronyms include LGBT, LGBTQ, and LGBTI.",
        example: "The '+' symbol represents the many other identities that are part of the community."
    },
    {
        term: "Non-binary",
        category: "gender-identity",
        definition: "A term for people whose gender doesn't sit comfortably with 'man' or 'woman'. Non-binary identities are varied and can include people who identify with some aspects of binary identities, while others reject them entirely.",
        example: "A non-binary person might identify as neither male nor female, or as both, or as something else entirely."
    },
    {
        term: "Orientation",
        category: "general",
        definition: "A term describing a person's attraction to other people. This attraction may be sexual (sexual orientation) and/or romantic (romantic orientation).",
        example: "Orientations include, but are not limited to, lesbian, gay, bi, ace and straight."
    },
    {
        term: "Outed",
        category: "general",
        definition: "When an LGBTQ+ person's sexual orientation or gender identity is disclosed to someone else without their consent.",
        example: "Being outed can be very distressing and can put people at risk of discrimination or harm."
    },
    {
        term: "Pan",
        category: "sexual-orientation",
        definition: "Refers to a person whose attraction towards others doesn't regard sex or gender. Stonewall includes pan within its umbrella term 'bi'.",
        example: "A pan person might be attracted to people regardless of their gender identity."
    },
    {
        term: "Passing",
        category: "gender-identity",
        definition: "When a trans person is perceived to be the gender with which they identify, based on their appearance.",
        example: "A trans woman who is perceived as a woman by others is said to be 'passing'."
    },
    {
        term: "Platonic partnerships",
        category: "romantic-orientation",
        definition: "People who are on the ace and/or aro spectrum may have platonic partnerships. These are relationships where there is a high level of mutual commitment which can include shared life decisions, shared living arrangements, and co-parenting of children.",
        example: "These partnerships can include more than two people and may involve deep emotional bonds without romantic or sexual attraction."
    },
    {
        term: "Pronoun",
        category: "general",
        definition: "Pronouns are words we use to refer to people's gender in conversation - for example, 'he', 'she' or 'they'.",
        example: "Some people use they/them pronouns, while others might use he/him, she/her, or other pronouns."
    },
    {
        term: "Queer",
        category: "general",
        definition: "A term used by those wanting to reject specific labels of sexual orientation and/or gender identity. It can also be a way of rejecting the perceived norms of the LGBTQ+ community.",
        example: "The term was historically used as a slur, but many people have reclaimed and now embrace it."
    },
    {
        term: "Questioning",
        category: "general",
        definition: "The process of exploring your own sexual orientation and/or gender identity.",
        example: "Someone who is questioning might be unsure about their sexuality or gender and is actively exploring these aspects of themselves."
    },
    {
        term: "QTIPOC",
        category: "general",
        definition: "An acronym that stands for Queer, Transgender and Intersex People of Colour.",
        example: "This term highlights the specific experiences and challenges faced by LGBTQ+ people who are also people of colour."
    },
    {
        term: "Romantic orientation",
        category: "romantic-orientation",
        definition: "A person's romantic attraction to other people, or lack thereof. Along with sexual orientation, this forms a person's orientation identity.",
        example: "Someone might be asexual but still experience romantic attraction to people of the same gender."
    },
    {
        term: "Sex",
        category: "general",
        definition: "The categories of male and female, which are assigned to a person on the basis of their primary sex characteristics (genitalia) and reproductive functions. 'Sex' also refers to sexual activity and intercourse.",
        example: "Sex is different from gender - sex refers to biological characteristics, while gender refers to social and cultural roles."
    },
    {
        term: "Sexual orientation",
        category: "sexual-orientation",
        definition: "A person's sexual attraction to other people, or lack thereof. Along with romantic orientation, this forms a person's orientation identity.",
        example: "Sexual orientation describes who you are sexually attracted to, while romantic orientation describes who you are romantically attracted to."
    },
    {
        term: "Spectrum",
        category: "general",
        definition: "A term used to cover a variety of identities that have a root commonality or shared experience.",
        example: "The LGBTQ+ spectrum includes many different identities that share the experience of being outside the heterosexual, cisgender norm."
    },
    {
        term: "Trans",
        category: "gender-identity",
        definition: "A term to describe people whose gender is not the same as, or does not sit comfortably with, the sex they were assigned at birth.",
        example: "Stonewall uses 'trans' as an umbrella term including transgender, transsexual, genderqueer, genderfluid, non-binary, agender, trans man, trans woman, trans masculine and trans feminine."
    },
    {
        term: "Transgender man",
        category: "gender-identity",
        definition: "A term used to describe a man who was assigned female at birth. This may be shortened to trans man, or FTM, an abbreviation for female-to-male.",
        example: "A trans man is a man who was assigned female at birth but identifies and lives as a man."
    },
    {
        term: "Transgender woman",
        category: "gender-identity",
        definition: "A term used to describe a woman who was assigned male at birth. This may be shortened to trans woman, or MTF, an abbreviation for male-to-female.",
        example: "A trans woman is a woman who was assigned male at birth but identifies and lives as a woman."
    },
    {
        term: "Transitioning",
        category: "gender-identity",
        definition: "The steps a trans person takes to live in their gender. Each person's transition will involve different things. For some this involves medical intervention, such as hormone therapy and surgeries, but not all trans people want or are able to have this.",
        example: "Transitioning might involve telling friends and family, using different pronouns, dressing differently and changing official documents."
    },
    {
        term: "Transphobia",
        category: "general",
        definition: "Prejudice or negative attitudes, beliefs or views about trans people. This can include the fear or dislike of someone based on the fact they are, or are perceived to be trans.",
        example: "Transphobia can manifest as discrimination, violence, or negative stereotypes about trans people."
    },
    {
        term: "Transsexual",
        category: "gender-identity",
        definition: "This was more commonly used in the past as a more medical term to refer to someone whose gender is not the same as, or does not sit comfortably with, the sex they were assigned at birth.",
        example: "This term is still used by some today, although many people prefer the term trans or transgender."
    },
    {
        term: "Undetectable",
        category: "general",
        definition: "HIV medication (antiretroviral treatment, or ART) works by reducing the amount of the virus in the blood to undetectable levels. This means the levels of HIV are so low that the virus cannot be passed on.",
        example: "This is called having an undetectable viral load or being undetectable."
    }
];

// DOM elements
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const termsGrid = document.getElementById('termsGrid');
const resultsCount = document.getElementById('resultsCount');

// State
let currentFilter = 'all';
let filteredTerms = [...lgbtqTerms];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    renderTerms();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', function() {
        filterTerms();
    });

    // Clear search button
    const clearSearchBtn = document.getElementById('clearSearch');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            searchInput.value = '';
            filterTerms();
            this.style.display = 'none';
        });
        
        // Show/hide clear button based on search input
        searchInput.addEventListener('input', function() {
            clearSearchBtn.style.display = this.value.trim() ? 'block' : 'none';
        });
    }

    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update filter
            currentFilter = this.dataset.filter;
            filterTerms();
        });
    });
}

// Filter and search terms
function filterTerms() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    filteredTerms = lgbtqTerms.filter(term => {
        // Check if term matches current filter
        const matchesFilter = currentFilter === 'all' || term.category === currentFilter;
        
        // Check if term matches search
        const matchesSearch = searchTerm === '' || 
            term.term.toLowerCase().includes(searchTerm) ||
            term.definition.toLowerCase().includes(searchTerm) ||
            term.example.toLowerCase().includes(searchTerm);
        
        return matchesFilter && matchesSearch;
    });
    
    renderTerms();
    updateResultsCount();
}

// Render terms
function renderTerms() {
    if (filteredTerms.length === 0) {
        termsGrid.innerHTML = `
            <div class="no-results">
                <h3>No terms found</h3>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        `;
        return;
    }
    
    termsGrid.innerHTML = filteredTerms.map((term, index) => `
        <div class="term-card" data-term-index="${index}">
            <div class="term-header">
                <h3 class="term-title">${term.term}</h3>
                <span class="term-category">${getCategoryLabel(term.category)}</span>
                <button class="term-toggle" aria-label="Toggle term details">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                </button>
            </div>
            <div class="term-content">
                <div class="term-definition">${term.definition}</div>
                ${term.example ? `<div class="term-example">${term.example}</div>` : ''}
            </div>
            <div class="term-hint">Click to expand and learn more</div>
        </div>
    `).join('');
    
    // Add click event listeners to term cards
    const termCards = document.querySelectorAll('.term-card');
    termCards.forEach(card => {
        const toggleBtn = card.querySelector('.term-toggle');
        const content = card.querySelector('.term-content');
        const hint = card.querySelector('.term-hint');
        
        const toggleCard = () => {
            const isExpanded = card.classList.contains('expanded');
            
            if (isExpanded) {
                card.classList.remove('expanded');
                toggleBtn.classList.remove('expanded');
                content.classList.remove('expanded');
                hint.textContent = 'Click to expand and learn more';
            } else {
                card.classList.add('expanded');
                toggleBtn.classList.add('expanded');
                content.classList.add('expanded');
                hint.textContent = 'Click to collapse';
            }
        };
        
        // Click on card or toggle button
        card.addEventListener('click', (e) => {
            if (e.target !== toggleBtn && !toggleBtn.contains(e.target)) {
                toggleCard();
            }
        });
        
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCard();
        });
    });
}

// Update results count
function updateResultsCount() {
    const totalTerms = lgbtqTerms.length;
    const filteredCount = filteredTerms.length;
    
    if (currentFilter === 'all' && searchInput.value.trim() === '') {
        resultsCount.textContent = `Showing all ${totalTerms} terms`;
    } else if (filteredCount === 0) {
        resultsCount.textContent = 'No terms found';
    } else {
        resultsCount.textContent = `Showing ${filteredCount} of ${totalTerms} terms`;
    }
}

// Get category label
function getCategoryLabel(category) {
    const labels = {
        'sexual-orientation': 'Sexual Orientation',
        'gender-identity': 'Gender Identity',
        'romantic-orientation': 'Romantic Orientation',
        'general': 'General Terms'
    };
    return labels[category] || category;
}

// Add keyboard navigation for accessibility
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        searchInput.blur();
        // Close any expanded term cards
        const expandedCards = document.querySelectorAll('.term-card.expanded');
        expandedCards.forEach(card => {
            const toggleBtn = card.querySelector('.term-toggle');
            const content = card.querySelector('.term-content');
            const hint = card.querySelector('.term-hint');
            
            card.classList.remove('expanded');
            toggleBtn.classList.remove('expanded');
            content.classList.remove('expanded');
            hint.textContent = 'Click to expand and learn more';
        });
    }
});

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add search suggestions (optional enhancement)
searchInput.addEventListener('focus', function() {
    if (this.value.trim() === '') {
        this.placeholder = 'Try searching for "asexual", "transgender", "ally"...';
    }
});

searchInput.addEventListener('blur', function() {
    this.placeholder = 'Search for terms, definitions, or keywords...';
});

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}); 