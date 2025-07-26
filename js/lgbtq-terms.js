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
        term: "Bicurious",
        category: "sexual-orientation",
        definition: "An individual who identifies as gay or straight while showing some curiosity for a relationship or sexual activity with a person of the sex they do not favor. (Related terms: heteroflexible, homoflexible)",
        example: "A straight person who is bicurious might be curious about exploring relationships with people of the same gender."
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
        term: "Closet",
        category: "general",
        definition: "Used as slang for the state of not publicising one's sexual orientation or gender identity, keeping it private, living an outwardly heterosexual life while identifying as LGBTQ+, or not being forthcoming about one's identity. At times, being in the closet also means not wanting to admit one's sexual identity to oneself.",
        example: "Someone might say 'I'm in the closet' to describe keeping their LGBTQ+ identity private from family, friends, or colleagues."
    },
    {
        term: "Cruising",
        category: "general",
        definition: "To search (as in public places) for a sexual partner.",
        example: "Cruising typically involves visiting specific locations where people look for casual sexual encounters.",
        mature: true
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
        term: "Fluid",
        category: "gender-identity",
        definition: "A sexual or gender identity that exists beyond a binary system of either gay or straight, man or woman. People with a fluid identity may resist using labels or choosing boxes to define themselves. Also used by people whose sexual or gender identity is not fixed on one point of a continuum.",
        example: "A person with a fluid identity might feel more masculine on some days and more feminine on others, or may reject gender and sexual orientation labels entirely."
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
        term: "Gender Transition",
        category: "general",
        definition: "The social, psychological &/or medical process of transitioning from one gender to another. Gender transition is an individualized process and does not involve the same steps for everyone. Transition may include telling one's social support network; legally changing one's name or sex; therapeutic treatment with hormones; and possibly, though in not all instances, surgery.",
        example: "A person's gender transition might involve coming out to friends and family, changing their name legally, starting hormone therapy, or undergoing gender-affirming surgeries."
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
        term: "He-She",
        category: "general",
        definition: "A often seen as derogatory term used to describe often refer to a transgender/ transsexual, intersex, or gender non-conforming people often used by when someone refuses to acknowledge the person's gender.",
        example: "This term is considered offensive and should not be used, as it denies a person's true gender identity.",
        mature: true
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
        term: "LGBTQIA2S+",
        category: "general",
        definition: "An acronym for Lesbian, Gay, Bisexual, Transgender, Queer and/or Questioning, Intersex, Asexual, Two-Spirit, and the countless affirmative ways in which people choose to self-identify.",
        example: "The LGBTQIA2S+ acronym is an expanded version that includes more identities, with the '+' symbol representing the countless other ways people choose to self-identify."
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
        term: "Outing",
        category: "general",
        definition: "When someone discloses information about another's sexual orientation or gender identity without their knowledge and/or consent. If you need support following an outing experience please see our help & support section.",
        example: "Outing someone can have serious consequences for their safety, relationships, and mental health, and should never be done without explicit consent."
    },
    {
        term: "Pan",
        category: "sexual-orientation",
        definition: "Refers to a person whose attraction towards others doesn't regard sex or gender. Stonewall includes pan within its umbrella term 'bi'.",
        example: "A pan person might be attracted to people regardless of their gender identity."
    },
    {
        term: "Questioning",
        category: "sexual-orientation",
        definition: "The process of examining one's sexual orientation and/or gender identity. Can be used as an adjective.",
        example: "Someone who is questioning their sexual orientation might be exploring their attraction patterns and trying to understand their sexuality."
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
        definition: "The process of examining one's sexual orientation and/or gender identity. Can be used as an adjective.",
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
        term: "Gay Polyamorous",
        category: "romantic-orientation",
        definition: "Also known as gay poly or poly gay, refers to individuals who identify as both gay (or homosexual) and polyamorous. This means they are attracted to people of the same gender and also have a philosophy or practice of engaging in romantic relationships with multiple partners, with the consent of all involved.",
        example: "A gay polyamorous person might be a man romantically attracted to other men who also practices polyamory, having multiple romantic relationships with other men simultaneously."
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
        term: "Sapiosexual",
        category: "sexual-orientation",
        definition: "A person who is emotionally, romantically, sexually, affectionately, or relationally attracted to intelligence and its use.",
        example: "A sapiosexual person might be primarily attracted to someone's intellectual capacity, wit, or how they use their intelligence in conversation and problem-solving."
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
    },
    {
        term: "Polyamorous",
        category: "sexual-orientation",
        definition: "Also known as Poly, refers to the practice or desire to have multiple romantic relationships simultaneously, with the informed consent and knowledge of all partners involved. It's a form of consensual non-monogamy where emotional and romantic intimacy can be shared with multiple people. Polyamory is distinct from other forms of non-monogamy, like open relationships or swinging, because it emphasizes emotional connections and often involves multiple partners who are aware of and agree to the arrangement.",
        example: "A polyamorous person might have multiple committed romantic relationships with different people, all of whom are aware of and consent to the arrangement."
    },
    {
        term: "Gay Polyamorous",
        category: "sexual-orientation",
        definition: "Also known as gay poly or poly gay, refers to individuals who identify as both gay (or homosexual) and polyamorous. This means they are attracted to people of the same gender and also have a philosophy or practice of engaging in romantic or sexual relationships with multiple partners, with the consent of all involved.",
        example: "A gay polyamorous person might be a man attracted to other men who also practices polyamory, having multiple romantic relationships with other men simultaneously."
    },
    {
        term: "Bears",
        category: "community-tribes",
        definition: "30+, broad/heavier build (drinks beer), usually hairy, often with facial hair. Likely habitats: RVT",
        example: "Bears are often characterized by their larger, more masculine appearance and are a well-established community within LGBTQ+ culture."
    },
    {
        term: "Cubs",
        category: "community-tribes",
        definition: "Late 20s-30s, younger bears, usually hairy, often with facial hair. Likely habitats: RVT, Brüt, Eagle",
        example: "Cubs are essentially younger versions of bears, often in their late twenties to thirties with similar physical characteristics."
    },
    {
        term: "Chubs",
        category: "community-tribes",
        definition: "Heavier to overweight, often less hairy or none, or a hairless bear",
        example: "Chubs are characterized by their larger body size and may have less body hair compared to traditional bears."
    },
    {
        term: "Drag Queens",
        category: "community-tribes",
        definition: "Big buxom or svelte, smooth as a baby's, very possibly waxed, facial hair no longer a barrier. Likely habitats: Halfway to Heaven, Molly Moggs, Two Brewers, and on stages everywhere",
        example: "Drag queens are performers who dress in feminine clothing and makeup for entertainment, often performing in clubs and venues."
    },
    {
        term: "Circuit Gays",
        category: "community-tribes",
        definition: "Also known as Gym bunnies: Late 20s-30s, athletic to muscular build, less likely to be hairy, possibly waxed. Likely habitats: Fire, RVT, Ministry of Sound",
        example: "Circuit gays are often associated with the party circuit scene and typically maintain a fit, athletic appearance."
    },
    {
        term: "Jocks",
        category: "community-tribes",
        definition: "Late 20s-30s, muscular build and gym obsessed, less likely to be hairy, possibly waxed. Likely habitats: Fire, RVT, Ministry of Sound",
        example: "Jocks are characterized by their athletic, muscular physique and dedication to fitness and gym culture."
    },
    {
        term: "Muscle Bears",
        category: "community-tribes",
        definition: "30+, broad/heavier build (drinks protein shakes), usually hairy, may be trimmed or sculpted to reflect their body shape, often with facial hair. Likely habitats: RVT, Brüt, Eagle",
        example: "Muscle bears combine the larger build of traditional bears with a more muscular, fitness-focused physique."
    },
    {
        term: "Otters",
        category: "community-tribes",
        definition: "Late 20s to 30s, leaner, usually hairy, often with facial hair. Skinny bears. Likely habitats: RVT, Duke of Wellington",
        example: "Otters are essentially leaner versions of bears, maintaining the hairiness but with a slimmer build."
    },
    {
        term: "Pups",
        category: "community-tribes",
        definition: "Late 20s-30s, lean to muscular, can be hairy, puppy genre on the fetish scene becoming increasingly popular. Likely habitats: RVT, Brüt, Eagle",
        example: "Pups are part of a growing subculture that incorporates elements of puppy play into their identity and social interactions."
    },
    {
        term: "Spunk Monkey",
        category: "community-tribes",
        definition: "Late 30s. Laid back but easily excited around men. Into long bouts of energetic, bouncy 'Tiggerish' sex. Likely habitats: Camberwell",
        example: "This term describes a specific personality type within the community, characterized by high energy and enthusiasm.",
        mature: true
    },
    {
        term: "Twinks",
        category: "community-tribes",
        definition: "Late teens-early 20s, boyish features, thinner to slim build, usually smooth, may have highlights. Likely habitats: GAY, QBar, Heaven",
        example: "Twinks are typically young men with a slim, boyish appearance and smooth skin."
    },
    {
        term: "Twunks",
        category: "community-tribes",
        definition: "Older twinks, not quite jocks, easily confused. Late teens-early 20s, boyish features, thinner to slim build, usually smooth, may have highlights. Likely habitats: GAY, Heaven",
        example: "Twunks are essentially older twinks who maintain their boyish features but may have slightly more muscle definition."
    },
    {
        term: "Twas",
        category: "community-tribes",
        definition: "Former twinks and Twunks",
        example: "Twas refers to those who were once identified as twinks or twunks but have aged out of those categories."
    },
    {
        term: "Boy (Boi)",
        category: "community-tribes",
        definition: "Huge in the 1990s, a young gay man with bleach blond hair often wearing a boy T-shirt and cap. As sexy-tragic then as it is now, there are rumblings the word is being reclaimed and re-imagined by today's queer community.",
        example: "The 'boy' aesthetic was particularly popular in the 1990s and is seeing a resurgence in contemporary queer culture."
    },
    {
        term: "Wolves",
        category: "community-tribes",
        definition: "Late 30s to 40s, lean to semi-muscular, usually hairy, often with facial hair. Likely habitats: RVT, Brüt",
        example: "Wolves are typically older men with a lean to muscular build and natural body hair."
    },
    {
        term: "Everyone Else",
        category: "community-tribes",
        definition: "And everyone else",
        example: "This category acknowledges that not everyone fits into specific tribal categories and celebrates the diversity of the community."
    },
    {
        term: "Drag King",
        category: "general",
        definition: "A female-bodied individual who dresses in masculine or male-designated clothing. A Drag King's cross-dressing is usually on a part-time basis and many work as entertainers at LGBTQ or straight nightclubs.",
        example: "Drag Kings often perform in nightclubs, creating masculine personas through clothing, makeup, and performance."
    },
    {
        term: "Drag Queen",
        category: "general",
        definition: "A male-bodied individual who wears female-designated or feminine clothing. Drag Queens usually cross-dress on a part-time basis and often perform in nightclubs by singing, dancing, or lip-synching.",
        example: "Drag Queens are performers who create feminine personas through elaborate costumes, makeup, and entertainment acts."
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
    
    // Sensitive content toggle
    const sensitiveToggle = document.getElementById('sensitiveToggle');
    if (sensitiveToggle) {
        sensitiveToggle.addEventListener('change', function() {
            filterTerms();
            
            // Show/hide sensitive filter button
            const sensitiveFilterBtn = document.querySelector('.sensitive-filter');
            if (sensitiveFilterBtn) {
                sensitiveFilterBtn.style.display = this.checked ? 'inline-flex' : 'none';
            }
        });
    }
}

// Filter and search terms
function filterTerms() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const sensitiveToggle = document.getElementById('sensitiveToggle');
    const showSensitiveContent = sensitiveToggle ? sensitiveToggle.checked : false;
    
    filteredTerms = lgbtqTerms.filter(term => {
        // Check if term matches current filter
        let matchesFilter = currentFilter === 'all' || term.category === currentFilter;
        
        // Handle sensitive filter
        if (currentFilter === 'sensitive') {
            matchesFilter = term.mature === true;
        }
        
        // Check if term matches search
        const matchesSearch = searchTerm === '' || 
            term.term.toLowerCase().includes(searchTerm) ||
            term.definition.toLowerCase().includes(searchTerm) ||
            term.example.toLowerCase().includes(searchTerm);
        
        // Check sensitive content filter
        const matchesSensitiveFilter = !term.mature || showSensitiveContent;
        
        return matchesFilter && matchesSearch && matchesSensitiveFilter;
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
        <div class="term-card ${term.mature ? 'sensitive' : ''}" data-term-index="${index}">
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
        'community-tribes': 'Community Tribes',
        'general': 'General Terms',
        'sensitive': 'Sensitive Content'
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