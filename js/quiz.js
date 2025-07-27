// ==================== PRIDE QUIZ FUNCTIONALITY ====================

// Quiz questions data
const quizQuestions = [
    {
        id: 1,
        question: "In what year did the Stonewall Riots occur?",
        answers: [
            { text: "1967", correct: false },
            { text: "1969", correct: true },
            { text: "1971", correct: false },
            { text: "1973", correct: false }
        ],
        explanation: "The Stonewall Riots occurred in June 1969 at the Stonewall Inn in New York City. These riots are considered a pivotal moment in the modern LGBTQ+ rights movement."
    },
    {
        id: 2,
        question: "Which symbol is most widely recognised for LGBTQIA+ Pride?",
        answers: [
            { text: "Pink triangle", correct: false },
            { text: "Rainbow flag", correct: true },
            { text: "Lambda symbol", correct: false },
            { text: "Lavender rhinoceros", correct: false }
        ],
        explanation: "The rainbow flag, designed by Gilbert Baker in 1978, is the most widely recognised symbol of LGBTQ+ pride. Each colour represents different aspects of the community."
    },
    {
        id: 3,
        question: "Who was the first openly LGBTQ+ person elected to Parliament in the UK?",
        answers: [
            { text: "Peter Tatchell", correct: false },
            { text: "Chris Smith", correct: true },
            { text: "Ben Bradshaw", correct: false },
            { text: "Angela Eagle", correct: false }
        ],
        explanation: "Chris Smith became the first openly gay MP when he came out in 1984 while serving as MP for Islington South and Finsbury. He later became the first openly gay Cabinet minister."
    },
    {
        id: 4,
        question: "What does the 'T' in LGBTQIA+ stand for?",
        answers: [
            { text: "Two-spirit", correct: false },
            { text: "Transgender", correct: true },
            { text: "Transsexual", correct: false },
            { text: "Transition", correct: false }
        ],
        explanation: "The 'T' stands for Transgender, referring to people whose gender identity differs from the sex they were assigned at birth."
    },
    {
        id: 5,
        question: "In which decade was homosexuality partially decriminalized in England and Wales?",
        answers: [
            { text: "1950s", correct: false },
            { text: "1960s", correct: true },
            { text: "1970s", correct: false },
            { text: "1980s", correct: false }
        ],
        explanation: "The Sexual Offences Act 1967 partially decriminalized homosexual acts in private between two men over the age of 21 in England and Wales."
    },
    {
        id: 6,
        question: "What does the pink triangle symbolize in LGBTQ+ history?",
        answers: [
            { text: "Love and acceptance", correct: false },
            { text: "Persecution and remembrance", correct: true },
            { text: "Pride and celebration", correct: false },
            { text: "Unity and strength", correct: false }
        ],
        explanation: "The pink triangle was used by Nazis to identify and persecute gay men in concentration camps. It was later reclaimed by the LGBTQ+ community as a symbol of remembrance and resistance."
    },
    {
        id: 7,
        question: "Which of these is a traditional LGBTQIA+ identity from Native American cultures?",
        answers: [
            { text: "Hijra", correct: false },
            { text: "Fa'afafine", correct: false },
            { text: "Two-Spirit", correct: true },
            { text: "Kathoey", correct: false }
        ],
        explanation: "Two-Spirit is a modern umbrella term used by some Indigenous North Americans to describe traditional third-gender or gender-variant roles in their cultures."
    },
    {
        id: 8,
        question: "When is International Day Against Homophobia, Biphobia and Transphobia (IDAHOBIT) observed?",
        answers: [
            { text: "May 17", correct: true },
            { text: "June 28", correct: false },
            { text: "October 11", correct: false },
            { text: "November 20", correct: false }
        ],
        explanation: "IDAHOBIT is observed on May 17th each year, commemorating the day in 1990 when the World Health Organization removed homosexuality from its list of mental disorders."
    },
    {
        id: 9,
        question: "What do the colours of the Transgender Pride Flag represent?",
        answers: [
            { text: "Blue for boys, pink for girls, white for transition", correct: true },
            { text: "Blue for masculinity, pink for femininity, white for purity", correct: false },
            { text: "Blue for sadness, pink for love, white for hope", correct: false },
            { text: "Blue for sky, pink for sunset, white for clouds", correct: false }
        ],
        explanation: "The Trans Pride Flag has light blue for traditional boy colours, pink for traditional girl colours, and white for those who are transitioning, intersex, or consider themselves neutral or undefined gender."
    },
    {
        id: 10,
        question: "Which activist is known as the 'Mother of Pride'?",
        answers: [
            { text: "Sylvia Rivera", correct: false },
            { text: "Marsha P. Johnson", correct: false },
            { text: "Brenda Howard", correct: true },
            { text: "Harvey Milk", correct: false }
        ],
        explanation: "Brenda Howard is known as the 'Mother of Pride' for her work organizing the first Pride march and establishing the tradition of Pride Month in June."
    },
    {
        id: 11,
        question: "What does 'cisgender' mean?",
        answers: [
            { text: "A person attracted to the same gender", correct: false },
            { text: "A person whose gender identity matches their birth sex", correct: true },
            { text: "A person who doesn't identify with any gender", correct: false },
            { text: "A person who changes their gender presentation", correct: false }
        ],
        explanation: "Cisgender refers to people whose gender identity aligns with the sex they were assigned at birth. It's the opposite of transgender."
    },
    {
        id: 12,
        question: "Which UK city hosted the first official Pride parade in 1972?",
        answers: [
            { text: "Manchester", correct: false },
            { text: "London", correct: true },
            { text: "Brighton", correct: false },
            { text: "Birmingham", correct: false }
        ],
        explanation: "London hosted the UK's first official Pride parade in 1972, inspired by the first anniversary of the Stonewall Riots and growing international LGBTQ+ activism."
    }
];

// Quiz state
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let quizCompleted = false;

// DOM elements
let quizContent;
let progressFill;
let currentQuestionSpan;
let totalQuestionsSpan;
let prevBtn;
let nextBtn;
let quizResults;
let finalScoreSpan;
let scoreMessageEl;

// Initialize quiz when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeQuiz();
});

function initializeQuiz() {
    // Get DOM elements
    quizContent = document.getElementById('quiz-content');
    progressFill = document.getElementById('progress-fill');
    currentQuestionSpan = document.getElementById('current-question');
    totalQuestionsSpan = document.getElementById('total-questions');
    prevBtn = document.getElementById('prev-btn');
    nextBtn = document.getElementById('next-btn');
    quizResults = document.getElementById('quiz-results');
    finalScoreSpan = document.getElementById('final-score');
    scoreMessageEl = document.getElementById('score-message');

    // Set total questions
    if (totalQuestionsSpan) {
        totalQuestionsSpan.textContent = quizQuestions.length;
    }

    // Add event listeners
    if (prevBtn) prevBtn.addEventListener('click', previousQuestion);
    if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
    
    const shareBtn = document.getElementById('share-btn');
    const restartBtn = document.getElementById('restart-btn');
    if (shareBtn) shareBtn.addEventListener('click', shareScore);
    if (restartBtn) restartBtn.addEventListener('click', restartQuiz);

    // Initialize quiz
    resetQuiz();
    displayQuestion();
}

function resetQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    quizCompleted = false;
    
    if (quizResults) quizResults.style.display = 'none';
    if (quizContent) quizContent.parentElement.style.display = 'block';
}

function displayQuestion() {
    if (!quizContent) return;

    const question = quizQuestions[currentQuestionIndex];
    
    quizContent.innerHTML = `
        <div class="question">
            <h3>Question ${currentQuestionIndex + 1}</h3>
            <p>${question.question}</p>
            <div class="answers" id="answers-${question.id}">
                ${question.answers.map((answer, index) => `
                    <button class="answer-btn" data-index="${index}" onclick="selectAnswer(${index})">
                        ${answer.text}
                    </button>
                `).join('')}
            </div>
            <div class="explanation" id="explanation-${question.id}">
                <strong>Explanation:</strong> ${question.explanation}
            </div>
        </div>
    `;

    // Update progress
    updateProgress();
    updateNavigation();

    // Restore previous answer if exists
    if (userAnswers[currentQuestionIndex] !== undefined) {
        const answerBtns = document.querySelectorAll('.answer-btn');
        const userAnswer = userAnswers[currentQuestionIndex];
        
        answerBtns.forEach((btn, index) => {
            if (index === userAnswer.selectedIndex) {
                btn.classList.add('selected');
            }
            if (index === question.answers.findIndex(a => a.correct)) {
                btn.classList.add('correct');
            } else if (index === userAnswer.selectedIndex && !question.answers[index].correct) {
                btn.classList.add('incorrect');
            }
        });
        
        showExplanation();
    }
}

function selectAnswer(selectedIndex) {
    const question = quizQuestions[currentQuestionIndex];
    const answerBtns = document.querySelectorAll('.answer-btn');
    
    // Remove previous selections
    answerBtns.forEach(btn => {
        btn.classList.remove('selected', 'correct', 'incorrect');
    });
    
    // Mark selected answer
    answerBtns[selectedIndex].classList.add('selected');
    
    // Show correct/incorrect styling
    answerBtns.forEach((btn, index) => {
        if (index === selectedIndex) {
            if (question.answers[index].correct) {
                btn.classList.add('correct');
            } else {
                btn.classList.add('incorrect');
            }
        } else if (question.answers[index].correct) {
            btn.classList.add('correct');
        }
    });
    
    // Store answer
    userAnswers[currentQuestionIndex] = {
        selectedIndex: selectedIndex,
        isCorrect: question.answers[selectedIndex].correct
    };
    
    // Update score
    if (question.answers[selectedIndex].correct) {
        score = userAnswers.filter(answer => answer && answer.isCorrect).length;
    }
    
    // Show explanation
    showExplanation();
    
    // Enable next button
    if (nextBtn) {
        nextBtn.disabled = false;
        if (currentQuestionIndex === quizQuestions.length - 1) {
            nextBtn.textContent = 'Finish Quiz';
        }
    }
}

function showExplanation() {
    const explanation = document.querySelector('.explanation');
    if (explanation) {
        explanation.classList.add('show');
    }
}

function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
    if (progressFill) progressFill.style.width = `${progress}%`;
    if (currentQuestionSpan) currentQuestionSpan.textContent = currentQuestionIndex + 1;
}

function updateNavigation() {
    if (prevBtn) {
        prevBtn.disabled = currentQuestionIndex === 0;
    }
    
    if (nextBtn) {
        nextBtn.disabled = userAnswers[currentQuestionIndex] === undefined;
        if (currentQuestionIndex === quizQuestions.length - 1) {
            nextBtn.textContent = 'Finish Quiz';
        } else {
            nextBtn.textContent = 'Next';
        }
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

function nextQuestion() {
    if (currentQuestionIndex < quizQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    quizCompleted = true;
    
    // Hide quiz content
    if (quizContent) quizContent.parentElement.style.display = 'none';
    
    // Show results
    if (quizResults) quizResults.style.display = 'block';
    
    // Update score display
    const finalScore = userAnswers.filter(answer => answer && answer.isCorrect).length;
    if (finalScoreSpan) finalScoreSpan.textContent = finalScore;
    
    // Update score message
    const scoreMessage = getScoreMessage(finalScore);
    if (scoreMessageEl) scoreMessageEl.textContent = scoreMessage;
    
    // Scroll to results
    if (quizResults) {
        quizResults.scrollIntoView({ behavior: 'smooth' });
    }
}

function getScoreMessage(score) {
    const percentage = (score / quizQuestions.length) * 100;
    
    if (percentage === 100) {
        return "Outstanding! 🌟 You're a true Pride expert! Your knowledge of LGBTQIA+ history and culture is impressive.";
    } else if (percentage >= 80) {
        return "Excellent work! 🏳️‍🌈 You have great knowledge of LGBTQIA+ history and culture. Keep celebrating and learning!";
    } else if (percentage >= 60) {
        return "Good job! 💜 You know quite a bit about LGBTQIA+ topics. There's always more to learn and discover.";
    } else if (percentage >= 40) {
        return "Not bad! 🌈 You have some knowledge to build on. Check out the learning resources below to expand your understanding.";
    } else {
        return "Thanks for taking the quiz! 💖 Every step in learning about LGBTQIA+ history and culture is valuable. Explore the resources below to learn more.";
    }
}

function shareScore() {
    const score = userAnswers.filter(answer => answer && answer.isCorrect).length;
    const totalQuestions = quizQuestions.length;
    
    const shareText = `I just scored ${score}/${totalQuestions} on the CT5 Pride Knowledge Quiz! 🏳️‍🌈 Test your LGBTQIA+ knowledge too!`;
    const shareUrl = window.location.href.replace('pride-quiz.html', 'pride-quiz.html');
    
    if (navigator.share) {
        navigator.share({
            title: 'CT5 Pride Knowledge Quiz',
            text: shareText,
            url: shareUrl
        }).catch(err => {
            console.log('Error sharing:', err);
            fallbackShare(shareText, shareUrl);
        });
    } else {
        fallbackShare(shareText, shareUrl);
    }
}

function fallbackShare(text, url) {
    // Try to copy to clipboard
    const shareString = `${text}\n${url}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareString).then(() => {
            alert('Quiz result copied to clipboard! You can now paste it to share.');
        }).catch(() => {
            // Fallback to manual sharing options
            showShareOptions(text, url);
        });
    } else {
        showShareOptions(text, url);
    }
}

function showShareOptions(text, url) {
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);
    
    const shareLinks = [
        `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    ];
    
    const choice = confirm('Would you like to share on social media? Click OK for Twitter, Cancel to copy the link instead.');
    
    if (choice) {
        window.open(shareLinks[0], '_blank', 'width=600,height=400');
    } else {
        // Try to copy URL to clipboard
        const textArea = document.createElement('textarea');
        textArea.value = `${text}\n${url}`;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            alert('Quiz result copied to clipboard!');
        } catch (err) {
            alert(`Share this result:\n${text}\n${url}`);
        }
        
        document.body.removeChild(textArea);
    }
}

function restartQuiz() {
    resetQuiz();
    displayQuestion();
    
    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (!quizCompleted) {
        if (e.key === 'ArrowLeft' && !prevBtn.disabled) {
            previousQuestion();
        } else if (e.key === 'ArrowRight' && !nextBtn.disabled) {
            nextQuestion();
        } else if (e.key >= '1' && e.key <= '4') {
            const answerIndex = parseInt(e.key) - 1;
            const answerBtns = document.querySelectorAll('.answer-btn');
            if (answerBtns[answerIndex] && userAnswers[currentQuestionIndex] === undefined) {
                selectAnswer(answerIndex);
            }
        }
    }
});

// Add accessibility announcements
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Screen reader only styles
const srOnlyStyles = `
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
`;

// Add screen reader styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = srOnlyStyles;
document.head.appendChild(styleSheet); 