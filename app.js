// ===== State Management =====
const state = {
    currentTab: 'bmi',
    calorieTab: 'body',
    gender: null,
    activity: null,
    scheduleGoal: 'general',
    scheduleIntensity: 'medium',
    lang: 'th',
    user: null,
    dailyScans: 0,
    lastScanDate: null,
    analysisTimeframe: 7,
    historyLog: [],
    customCalorieTarget: null
};

// ===== DOM Ready =====
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTabs();
    initScrollEffects();
    renderSchedule('general');
    loadUserSession();
    
    // Load language settings on startup
    const savedLang = localStorage.getItem('fitlife_lang') || 'th';
    switchLanguage(savedLang);
});

// ===== Navigation =====
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');

            const section = link.dataset.section;
            if (section) {
                switchTab(section);
            }
        });
    });
}

// ===== Tab Switching =====
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
}

function switchTab(tabName) {
    state.currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.section === tabName);
    });

    // Show/hide sections
    document.querySelectorAll('.tool-section').forEach(section => {
        section.classList.remove('active');
    });
    const targetSection = document.getElementById(`section-${tabName}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Scroll to section tabs
    const sectionTabs = document.getElementById('sectionTabs');
    if (sectionTabs) {
        const offset = sectionTabs.offsetTop - 64;
        window.scrollTo({ top: offset, behavior: 'smooth' });
    }
}

// ===== Calorie Sub Tabs =====
function switchCalorieTab(tabName) {
    state.calorieTab = tabName;

    document.querySelectorAll('.sub-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.subtab === tabName);
    });

    document.querySelectorAll('.sub-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const target = document.getElementById(`calorie-tab-${tabName}`);
    if (target) target.classList.add('active');
}

// ===== Gender Selection =====
function selectGender(gender) {
    state.gender = gender;
    document.querySelectorAll('.gender-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`gender-${gender}`).classList.add('active');
}

// ===== Activity Selection =====
function selectActivity(activity) {
    state.activity = activity;
    document.querySelectorAll('.activity-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`activity-${activity}`).classList.add('active');
}

// ===== Scroll Effects =====
function initScrollEffects() {
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Navbar scroll effect
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top button
        if (scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
}

// ===== Toast =====
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== FAQ Toggle (Pricing Page) =====
function toggleFaq(btn) {
    const answer = btn.nextElementSibling;
    const isOpen = btn.classList.contains('open');
    
    // Close all other FAQs
    document.querySelectorAll('.faq-question.open').forEach(openBtn => {
        openBtn.classList.remove('open');
        openBtn.nextElementSibling.classList.remove('show');
    });
    
    // Toggle this one
    if (!isOpen) {
        btn.classList.add('open');
        answer.classList.add('show');
    }
}

// ===== BMI Calculator =====
function calculateBMI() {
    const weight = parseFloat(document.getElementById('bmi-weight').value);
    const height = parseFloat(document.getElementById('bmi-height').value);

    // Validation
    if (!weight || weight <= 0) {
        showToast('⚠️ กรุณากรอกน้ำหนัก');
        return;
    }
    if (!height || height <= 0) {
        showToast('⚠️ กรุณากรอกส่วนสูง');
        return;
    }

    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    const bmiRounded = Math.round(bmi * 10) / 10;

    // Show result
    document.getElementById('bmi-placeholder').classList.add('hidden');
    document.getElementById('bmi-result').classList.remove('hidden');

    // Animate BMI number
    animateNumber('bmi-number', bmiRounded, 1);

    // Update gauge pointer
    const gaugePercent = getGaugePercent(bmi);
    setTimeout(() => {
        document.getElementById('bmi-gauge-pointer').style.left = `${gaugePercent}%`;
    }, 100);

    // Update status
    const status = getBMIStatus(bmi);
    const badge = document.getElementById('bmi-badge');
    badge.textContent = status.label;
    badge.className = `status-badge ${status.class}`;

    // Update message
    document.getElementById('bmi-message').textContent = status.message;

    // Highlight table row
    document.querySelectorAll('.bmi-table tbody tr').forEach(row => {
        row.classList.remove('highlight-row');
    });
    const highlightRow = document.querySelector(`.${status.rowClass}`);
    if (highlightRow) highlightRow.classList.add('highlight-row');
}

function getGaugePercent(bmi) {
    if (bmi < 15) return 2;
    if (bmi > 40) return 98;
    // Map BMI 15-40 to 0-100%
    return ((bmi - 15) / (40 - 15)) * 100;
}

function getBMIStatus(bmi) {
    const lang = state.lang || 'th';
    if (bmi < 18.5) {
        return {
            label: lang === 'th' ? 'น้ำหนักต่ำกว่าเกณฑ์' : 'Underweight',
            class: 'underweight',
            rowClass: 'range-underweight',
            message: lang === 'th' ? 'คุณมีน้ำหนักต่ำกว่าเกณฑ์ ควรเพิ่มปริมาณอาหารและออกกำลังกายเสริมสร้างกล้ามเนื้อ' : 'You are underweight. You should increase food intake and exercise to build muscle.'
        };
    } else if (bmi < 23) {
        return {
            label: lang === 'th' ? 'น้ำหนักปกติ ✅' : 'Normal Weight ✅',
            class: 'normal',
            rowClass: 'range-normal',
            message: lang === 'th' ? 'สุขภาพดี! น้ำหนักอยู่ในเกณฑ์ปกติ รักษาไลฟ์สไตล์ที่ดีต่อไป 💪' : 'Healthy! Weight is in the normal range. Maintain your good lifestyle 💪'
        };
    } else if (bmi < 25) {
        return {
            label: lang === 'th' ? 'น้ำหนักเกิน' : 'Overweight',
            class: 'overweight',
            rowClass: 'range-overweight',
            message: lang === 'th' ? 'น้ำหนักเริ่มเกินเกณฑ์ ควรปรับอาหารและเพิ่มการออกกำลังกาย' : 'Slightly overweight. You should adjust your diet and increase exercise.'
        };
    } else if (bmi < 30) {
        return {
            label: lang === 'th' ? 'อ้วนระดับ 1' : 'Obese Class 1',
            class: 'obese',
            rowClass: 'range-obese1',
            message: lang === 'th' ? 'ควรปรึกษาแพทย์หรือผู้เชี่ยวชาญด้านโภชนาการ เพื่อวางแผนลดน้ำหนัก' : 'Obese class 1. Consult a doctor or nutritionist to plan weight loss.'
        };
    } else {
        return {
            label: lang === 'th' ? 'อ้วนระดับ 2' : 'Obese Class 2',
            class: 'obese',
            rowClass: 'range-obese2',
            message: lang === 'th' ? 'ควรปรึกษาแพทย์เพื่อวางแผนดูแลสุขภาพอย่างเร่งด่วน' : 'Obese class 2. Consult a doctor immediately to manage your health.'
        };
    }
}

// ===== Calorie Calculator =====
function calculateCalories() {
    let bmr;

    if (state.calorieTab === 'body') {
        // Mifflin-St Jeor Equation
        const weight = parseFloat(document.getElementById('cal-weight').value);
        const height = parseFloat(document.getElementById('cal-height').value);
        const age = parseFloat(document.getElementById('cal-age').value);

        if (!weight || weight <= 0) { showToast('⚠️ กรุณากรอกน้ำหนัก'); return; }
        if (!height || height <= 0) { showToast('⚠️ กรุณากรอกส่วนสูง'); return; }
        if (!age || age <= 0) { showToast('⚠️ กรุณากรอกอายุ'); return; }
        if (!state.gender) { showToast('⚠️ กรุณาเลือกเพศ'); return; }

        if (state.gender === 'male') {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }
    } else {
        // Katch-McArdle Equation
        const weight = parseFloat(document.getElementById('cal-weight-fat').value);
        const fatPercent = parseFloat(document.getElementById('cal-fat-percent').value);

        if (!weight || weight <= 0) { showToast('⚠️ กรุณากรอกน้ำหนัก'); return; }
        if (!fatPercent || fatPercent <= 0 || fatPercent > 70) { showToast('⚠️ กรุณากรอก % ไขมันที่ถูกต้อง'); return; }

        const lbm = weight * (1 - fatPercent / 100);
        bmr = 370 + (21.6 * lbm);
    }

    if (!state.activity) { showToast('⚠️ กรุณาเลือกกิจกรรมในชีวิตประจำวัน'); return; }

    // Activity multipliers
    const multipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        very: 1.725,
        extra: 1.9
    };

    const tdee = Math.round(bmr * multipliers[state.activity]);
    const bmrRounded = Math.round(bmr);

    // Show result
    document.getElementById('cal-placeholder').classList.add('hidden');
    document.getElementById('cal-result').classList.remove('hidden');

    // Animate values
    animateNumber('cal-bmr-value', bmrRounded, 0);
    animateNumber('cal-tdee-value', tdee, 0);

    // Goals
    const loseCalories = Math.round(tdee - 500);
    const gainCalories = Math.round(tdee + 500);

    animateNumber('cal-lose', loseCalories, 0);
    animateNumber('cal-maintain', tdee, 0);
    animateNumber('cal-gain', gainCalories, 0);

    // Macros (based on TDEE for maintenance)
    const proteinCal = tdee * 0.30;
    const carbsCal = tdee * 0.40;
    const fatCal = tdee * 0.30;

    const proteinGrams = Math.round(proteinCal / 4);
    const carbsGrams = Math.round(carbsCal / 4);
    const fatGrams = Math.round(fatCal / 9);

    setTimeout(() => {
        document.getElementById('macro-protein').textContent = `${proteinGrams}g`;
        document.getElementById('macro-carbs').textContent = `${carbsGrams}g`;
        document.getElementById('macro-fat').textContent = `${fatGrams}g`;
    }, 300);
}

// ===== Number Animation =====
function animateNumber(elementId, target, decimals) {
    const element = document.getElementById(elementId);
    const duration = 800;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = start + (target - start) * eased;

        element.textContent = current.toFixed(decimals);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toFixed(decimals);
        }
    }

    requestAnimationFrame(update);
}

// ===== Schedule Data =====
const scheduleData = {
    general: [
        {
            day: 'วันจันทร์',
            type: 'cardio',
            typeLabel: 'คาร์ดิโอ',
            exercises: [
                { icon: '🏃', name: 'วิ่งเหยาะ (Jogging)', duration: '30 นาที' },
                { icon: '🚴', name: 'ปั่นจักรยาน', duration: '20 นาที' },
                { icon: '🧘', name: 'ยืดกล้ามเนื้อ (Cooldown)', duration: '10 นาที' }
            ]
        },
        {
            day: 'วันอังคาร',
            type: 'strength',
            typeLabel: 'เวทเทรนนิ่ง',
            exercises: [
                { icon: '🏋️', name: 'Bench Press', duration: '4 x 10' },
                { icon: '💪', name: 'Dumbbell Rows', duration: '3 x 12' },
                { icon: '🦵', name: 'Shoulder Press', duration: '3 x 10' },
                { icon: '🔥', name: 'Bicep Curls', duration: '3 x 12' }
            ]
        },
        {
            day: 'วันพุธ',
            type: 'flexibility',
            typeLabel: 'ยืดหยุ่น',
            exercises: [
                { icon: '🧘', name: 'โยคะเบื้องต้น', duration: '30 นาที' },
                { icon: '🤸', name: 'Stretching', duration: '15 นาที' },
                { icon: '🫁', name: 'หายใจลึก & ผ่อนคลาย', duration: '10 นาที' }
            ]
        },
        {
            day: 'วันพฤหัสบดี',
            type: 'strength',
            typeLabel: 'เวทเทรนนิ่ง',
            exercises: [
                { icon: '🦵', name: 'Squats', duration: '4 x 10' },
                { icon: '🏋️', name: 'Deadlift', duration: '3 x 8' },
                { icon: '💪', name: 'Lunges', duration: '3 x 12/ข้าง' },
                { icon: '🔥', name: 'Leg Press', duration: '3 x 12' }
            ]
        },
        {
            day: 'วันศุกร์',
            type: 'cardio',
            typeLabel: 'คาร์ดิโอ',
            exercises: [
                { icon: '🏊', name: 'ว่ายน้ำ หรือ เดินเร็ว', duration: '30 นาที' },
                { icon: '🚶', name: 'Interval Training', duration: '20 นาที' },
                { icon: '🧘', name: 'ยืดกล้ามเนื้อ', duration: '10 นาที' }
            ]
        },
        {
            day: 'วันเสาร์',
            type: 'strength',
            typeLabel: 'เวทเทรนนิ่ง',
            exercises: [
                { icon: '🏋️', name: 'Full Body Circuit', duration: '40 นาที' },
                { icon: '💪', name: 'Core Training', duration: '15 นาที' },
                { icon: '🧘', name: 'Cooldown & Stretch', duration: '10 นาที' }
            ]
        },
        {
            day: 'วันอาทิตย์',
            type: 'rest',
            typeLabel: 'พักผ่อน',
            exercises: []
        }
    ],
    'weight-loss': [
        {
            day: 'วันจันทร์',
            type: 'cardio',
            typeLabel: 'คาร์ดิโอ',
            exercises: [
                { icon: '🏃', name: 'HIIT (High Intensity)', duration: '25 นาที' },
                { icon: '🚴', name: 'ปั่นจักรยาน', duration: '20 นาที' },
                { icon: '🧘', name: 'ยืดกล้ามเนื้อ', duration: '10 นาที' }
            ]
        },
        {
            day: 'วันอังคาร',
            type: 'strength',
            typeLabel: 'เวทเทรนนิ่ง',
            exercises: [
                { icon: '🏋️', name: 'Circuit Training (Upper)', duration: '30 นาที' },
                { icon: '🔥', name: 'Burpees', duration: '3 x 15' },
                { icon: '💪', name: 'Mountain Climbers', duration: '3 x 30 วิ' }
            ]
        },
        {
            day: 'วันพุธ',
            type: 'cardio',
            typeLabel: 'คาร์ดิโอ',
            exercises: [
                { icon: '🏃', name: 'วิ่ง Interval', duration: '30 นาที' },
                { icon: '🤸', name: 'Jump Rope', duration: '15 นาที' },
                { icon: '🧘', name: 'Stretching', duration: '10 นาที' }
            ]
        },
        {
            day: 'วันพฤหัสบดี',
            type: 'strength',
            typeLabel: 'เวทเทรนนิ่ง',
            exercises: [
                { icon: '🦵', name: 'Circuit Training (Lower)', duration: '30 นาที' },
                { icon: '🔥', name: 'Box Jumps', duration: '3 x 12' },
                { icon: '💪', name: 'Plank Variations', duration: '3 x 45 วิ' }
            ]
        },
        {
            day: 'วันศุกร์',
            type: 'cardio',
            typeLabel: 'คาร์ดิโอ',
            exercises: [
                { icon: '🏊', name: 'ว่ายน้ำ หรือ เดินเร็ว', duration: '40 นาที' },
                { icon: '🚶', name: 'Active Recovery Walk', duration: '20 นาที' }
            ]
        },
        {
            day: 'วันเสาร์',
            type: 'flexibility',
            typeLabel: 'ยืดหยุ่น',
            exercises: [
                { icon: '🧘', name: 'โยคะ', duration: '45 นาที' },
                { icon: '🤸', name: 'Foam Rolling', duration: '15 นาที' }
            ]
        },
        {
            day: 'วันอาทิตย์',
            type: 'rest',
            typeLabel: 'พักผ่อน',
            exercises: []
        }
    ],
    muscle: [
        {
            day: 'วันจันทร์',
            type: 'strength',
            typeLabel: 'อก & ไหล่',
            exercises: [
                { icon: '🏋️', name: 'Bench Press', duration: '4 x 8' },
                { icon: '💪', name: 'Incline Dumbbell Press', duration: '4 x 10' },
                { icon: '🔥', name: 'Overhead Press', duration: '4 x 8' },
                { icon: '💪', name: 'Lateral Raises', duration: '3 x 15' }
            ]
        },
        {
            day: 'วันอังคาร',
            type: 'strength',
            typeLabel: 'หลัง & แขน',
            exercises: [
                { icon: '🏋️', name: 'Deadlift', duration: '4 x 6' },
                { icon: '💪', name: 'Pull-ups / Lat Pulldown', duration: '4 x 10' },
                { icon: '🔥', name: 'Barbell Rows', duration: '4 x 8' },
                { icon: '💪', name: 'Bicep Curls', duration: '3 x 12' }
            ]
        },
        {
            day: 'วันพุธ',
            type: 'rest',
            typeLabel: 'พักผ่อน',
            exercises: []
        },
        {
            day: 'วันพฤหัสบดี',
            type: 'strength',
            typeLabel: 'ขา & ก้น',
            exercises: [
                { icon: '🦵', name: 'Squats', duration: '5 x 5' },
                { icon: '🏋️', name: 'Romanian Deadlift', duration: '4 x 8' },
                { icon: '💪', name: 'Leg Press', duration: '4 x 12' },
                { icon: '🔥', name: 'Calf Raises', duration: '4 x 15' }
            ]
        },
        {
            day: 'วันศุกร์',
            type: 'strength',
            typeLabel: 'อก & แขน',
            exercises: [
                { icon: '🏋️', name: 'Incline Bench Press', duration: '4 x 8' },
                { icon: '💪', name: 'Cable Flyes', duration: '3 x 12' },
                { icon: '🔥', name: 'Tricep Dips', duration: '3 x 12' },
                { icon: '💪', name: 'Hammer Curls', duration: '3 x 12' }
            ]
        },
        {
            day: 'วันเสาร์',
            type: 'cardio',
            typeLabel: 'คาร์ดิโอเบาๆ',
            exercises: [
                { icon: '🏃', name: 'เดินเร็ว / วิ่งเหยาะ', duration: '30 นาที' },
                { icon: '🧘', name: 'Stretching & Recovery', duration: '20 นาที' }
            ]
        },
        {
            day: 'วันอาทิตย์',
            type: 'rest',
            typeLabel: 'พักผ่อน',
            exercises: []
        }
    ]
};

// ===== Schedule Rendering =====
function selectScheduleGoal(goal) {
    const isVip = state.subExpiry && Date.now() < state.subExpiry;
    if ((goal === 'weight-loss' || goal === 'muscle') && !isVip) {
        showToast('⚠️ สิทธิพิเศษสำหรับพรีเมียม! กรุณาอัปเกรดเพื่อดูตารางนี้');
        openTopupModal();
        return;
    }
    
    state.scheduleGoal = goal;

    document.querySelectorAll('.goal-select-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.goal === goal);
    });

    renderSchedule();
}

function selectScheduleIntensity(intensity) {
    state.scheduleIntensity = intensity;

    document.querySelectorAll('.intensity-select-btn').forEach(btn => {
        const isActive = btn.dataset.intensity === intensity;
        btn.classList.toggle('active', isActive);
        if (isActive) {
            btn.style.background = 'var(--gradient-primary)';
            btn.style.color = 'white';
            btn.style.fontWeight = '700';
        } else {
            btn.style.background = 'transparent';
            btn.style.color = 'var(--text-secondary)';
            btn.style.fontWeight = '600';
        }
    });

    renderSchedule();
}

function getAdjustedSchedule(goal, intensity) {
    const baseData = scheduleData[goal] || scheduleData.general;
    
    // Deep clone the base data
    return JSON.parse(JSON.stringify(baseData)).map(day => {
        if (day.type === 'rest') {
            return day;
        }
        
        day.exercises = day.exercises.map(ex => {
            let adjustedDuration = ex.duration;
            
            if (intensity === 'light') {
                if (ex.duration.includes('นาที')) {
                    const mins = parseInt(ex.duration);
                    adjustedDuration = `${Math.max(10, Math.round(mins * 0.7 / 5) * 5)} นาที`;
                } else if (ex.duration.includes('x')) {
                    const parts = ex.duration.split('x');
                    if (parts.length === 2) {
                        const sets = Math.max(2, parseInt(parts[0]) - 1);
                        const reps = Math.max(6, parseInt(parts[1]) - 2);
                        adjustedDuration = `${sets} x ${reps}`;
                    }
                } else if (ex.duration.includes('วิ')) {
                    const secs = parseInt(ex.duration);
                    adjustedDuration = `${Math.max(15, Math.round(secs * 0.7 / 5) * 5)} วิ`;
                }
            } else if (intensity === 'heavy') {
                if (ex.duration.includes('นาที')) {
                    const mins = parseInt(ex.duration);
                    adjustedDuration = `${Math.round(mins * 1.4 / 5) * 5} นาที`;
                } else if (ex.duration.includes('x')) {
                    const parts = ex.duration.split('x');
                    if (parts.length === 2) {
                        const sets = parseInt(parts[0]) + 1;
                        const reps = parseInt(parts[1]) + 2;
                        adjustedDuration = `${sets} x ${reps}`;
                    }
                } else if (ex.duration.includes('วิ')) {
                    const secs = parseInt(ex.duration);
                    adjustedDuration = `${Math.round(secs * 1.5 / 5) * 5} วิ`;
                }
            }
            
            ex.duration = adjustedDuration;
            return ex;
        });
        
        return day;
    });
}

function renderSchedule() {
    const grid = document.getElementById('schedule-grid');
    const goal = state.scheduleGoal || 'general';
    const intensity = state.scheduleIntensity || 'medium';
    const data = getAdjustedSchedule(goal, intensity);

    grid.innerHTML = '';
    const lang = state.lang || 'th';

    data.forEach((day, index) => {
        const card = document.createElement('div');
        card.className = `schedule-card ${day.type === 'rest' ? 'rest-day' : ''}`;
        card.style.animationDelay = `${index * 0.08}s`;

        let bodyContent = '';

        const translatedDay = translateDayName(day.day, lang);
        const translatedTypeLabel = translateTypeLabel(day.typeLabel, lang);

        if (day.type === 'rest') {
            bodyContent = lang === 'th' ? `
                <div class="rest-message">
                    <span class="rest-emoji">😴</span>
                    <p>วันพักผ่อน<br>ให้ร่างกายฟื้นตัว</p>
                </div>
            ` : `
                <div class="rest-message">
                    <span class="rest-emoji">😴</span>
                    <p>Rest Day<br>Let body recover</p>
                </div>
            `;
        } else {
            const exerciseItems = day.exercises.map(ex => {
                const translatedExName = translateExerciseName(ex.name, lang);
                const translatedExDuration = translateDuration(ex.duration, lang);
                return `
                <li class="exercise-item">
                    <span class="exercise-icon">${ex.icon}</span>
                    <div class="exercise-detail">
                        <span class="exercise-name">${translatedExName}</span>
                        <span class="exercise-duration">${translatedExDuration}</span>
                    </div>
                </li>
                `;
            }).join('');

            bodyContent = `<ul class="exercise-list">${exerciseItems}</ul>`;
        }

        card.innerHTML = `
            <div class="schedule-card-header">
                <span class="day-name">${translatedDay}</span>
                <span class="day-type ${day.type}">${translatedTypeLabel}</span>
            </div>
            <div class="schedule-card-body">
                ${bodyContent}
            </div>
        `;

        grid.appendChild(card);
    });
}


// ===== Food Scanner =====
const foodDatabase = [
    { name: 'ข้าวกะเพราหมูสับ', cal: 580, protein: 25, carbs: 60, fat: 20, fiber: 2, sugar: 4, sodium: 1200, icon: '🍛', unit: 'จาน' },
    { name: 'ข้าวผัดหมู', cal: 550, protein: 20, carbs: 65, fat: 18, fiber: 2, sugar: 5, sodium: 800, icon: '🍛', unit: 'จาน' },
    { name: 'ก๋วยเตี๋ยวหมูน้ำใส', cal: 350, protein: 18, carbs: 45, fat: 10, fiber: 1, sugar: 4, sodium: 1500, icon: '🍜', unit: 'ชาม' },
    { name: 'ส้มตำไทย', cal: 120, protein: 3, carbs: 20, fat: 2, fiber: 4, sugar: 12, sodium: 1100, icon: '🥗', unit: 'จาน' },
    { name: 'ข้าวเหนียวหมูปิ้ง', cal: 450, protein: 15, carbs: 50, fat: 15, fiber: 1, sugar: 8, sodium: 600, icon: '🍢', unit: 'ชุด' },
    { name: 'ไก่ย่าง', cal: 220, protein: 25, carbs: 0, fat: 12, fiber: 0, sugar: 2, sodium: 400, icon: '🍗', unit: 'ไม้' },
    { name: 'ผัดไทยกุ้งสด', cal: 520, protein: 18, carbs: 65, fat: 15, fiber: 3, sugar: 15, sodium: 900, icon: '🍝', unit: 'จาน' },
    { name: 'ข้าวไข่เจียว', cal: 450, protein: 15, carbs: 40, fat: 25, fiber: 1, sugar: 2, sodium: 500, icon: '🍳', unit: 'จาน' },
    { name: 'ข้าวหมูแดง', cal: 540, protein: 22, carbs: 70, fat: 16, fiber: 2, sugar: 18, sodium: 850, icon: '🍛', unit: 'จาน' },
    { name: 'ยำวุ้นเส้น', cal: 250, protein: 12, carbs: 35, fat: 5, fiber: 2, sugar: 10, sodium: 1200, icon: '🥗', unit: 'จาน' }
];

let currentSelectedFood = null;
let currentPortion = 1;
let dailyFoodLog = [];

document.addEventListener('DOMContentLoaded', () => {
    // Add event listener for food file input
    const foodFileInput = document.getElementById('food-file-input');
    if (foodFileInput) {
        foodFileInput.addEventListener('change', handleFoodImageUpload);
    }
});

function triggerFoodInput(source) {
    const input = document.getElementById('food-file-input');
    if (source === 'camera') {
        input.setAttribute('capture', 'environment');
    } else {
        input.removeAttribute('capture');
    }
    input.click();
}

function handleFoodImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    state.uploadedFileName = file.name; // Save the file name to state for food image validation

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('food-preview-img').src = e.target.result;
        document.getElementById('upload-placeholder').classList.add('hidden');
        document.getElementById('upload-preview').classList.remove('hidden');
        
        // Show manual input and analyze button
        document.getElementById('food-search-section').classList.add('hidden');
        document.getElementById('food-name-input-section').classList.remove('hidden');
        document.getElementById('food-portion-group').classList.remove('hidden');
        document.getElementById('btn-analyze-food').classList.remove('hidden');
        
        currentSelectedFood = null; // Reset
        currentPortion = 1;
        document.getElementById('food-portion').value = 1;
        document.getElementById('manual-food-name').value = '';
    };
    reader.readAsDataURL(file);
}

function removeFoodImage() {
    document.getElementById('food-file-input').value = '';
    document.getElementById('food-preview-img').src = '';
    document.getElementById('upload-preview').classList.add('hidden');
    document.getElementById('upload-placeholder').classList.remove('hidden');
    
    document.getElementById('food-search-section').classList.remove('hidden');
    document.getElementById('food-name-input-section').classList.add('hidden');
    
    state.uploadedFileName = null; // Clear the saved filename

    // Hide portion and analyze button if no food is selected manually
    if (!currentSelectedFood) {
        document.getElementById('food-portion-group').classList.add('hidden');
        document.getElementById('btn-analyze-food').classList.add('hidden');
    }
    // Reset inline confirm state
    document.getElementById('btn-initial-analyze').classList.remove('hidden');
    document.getElementById('inline-confirm-wrapper').classList.add('hidden');
}

function searchFood(query) {
    const resultsContainer = document.getElementById('food-search-results');
    
    if (!query || query.length < 2) {
        resultsContainer.classList.add('hidden');
        return;
    }

    const lowercaseQuery = query.toLowerCase();
    const results = foodDatabase.filter(food => 
        food.name.toLowerCase().includes(lowercaseQuery)
    );

    if (results.length > 0) {
        resultsContainer.innerHTML = results.map(food => `
            <div class="food-search-item" onclick='selectFood(${JSON.stringify(food)})'>
                <span class="fsi-name">${food.icon} ${food.name}</span>
                <span class="fsi-cal">${food.cal} แคล</span>
            </div>
        `).join('');
        resultsContainer.classList.remove('hidden');
    } else {
        resultsContainer.innerHTML = `
            <div class="food-search-item" style="color: var(--text-muted); cursor: default;">
                ไม่พบข้อมูลอาหาร
            </div>
        `;
        resultsContainer.classList.remove('hidden');
    }
}

function selectFood(food) {
    currentSelectedFood = food;
    document.getElementById('food-search-input').value = food.name;
    document.getElementById('food-search-results').classList.add('hidden');
    
    // Show portion control and analyze button
    document.getElementById('food-portion-group').classList.remove('hidden');
    document.getElementById('btn-analyze-food').classList.remove('hidden');
    
    // Reset inline confirm state
    document.getElementById('btn-initial-analyze').classList.remove('hidden');
    document.getElementById('inline-confirm-wrapper').classList.add('hidden');
    
    // Reset portion to 1
    currentPortion = 1;
    document.getElementById('food-portion').value = currentPortion;
    
    // Auto-analyze
    analyzeFoodResult();
}

function adjustPortion(amount) {
    let newPortion = currentPortion + amount;
    if (newPortion < 0.5) newPortion = 0.5;
    if (newPortion > 10) newPortion = 10;
    
    currentPortion = newPortion;
    document.getElementById('food-portion').value = currentPortion;
    
    if (currentSelectedFood) {
        analyzeFoodResult();
    }
}

function updateFoodPortion() {
    let val = parseFloat(document.getElementById('food-portion').value);
    if (isNaN(val) || val < 0.5) val = 0.5;
    if (val > 10) val = 10;
    
    currentPortion = val;
    document.getElementById('food-portion').value = currentPortion;
    
    if (currentSelectedFood) {
        analyzeFoodResult();
    }
}

// Helper to analyze image content client-side using average saturation and brightness
function analyzeImageContent(imgElement) {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 30;
        canvas.height = 30;
        ctx.drawImage(imgElement, 0, 0, 30, 30);
        const imgData = ctx.getImageData(0, 0, 30, 30).data;
        
        let totalSaturation = 0;
        let totalBrightness = 0;
        let count = 0;
        
        for (let i = 0; i < imgData.length; i += 4) {
            const r = imgData[i];
            const g = imgData[i+1];
            const b = imgData[i+2];
            
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const l = (max + min) / 2;
            let s = 0;
            if (max !== min) {
                const d = max - min;
                s = l > 127 ? d / (510 - max - min) : d / (max + min);
            }
            
            totalSaturation += s;
            totalBrightness += l;
            count++;
        }
        
        const avgSaturation = (totalSaturation / count) * 100; // 0 to 100
        const avgBrightness = (totalBrightness / count) / 2.55; // 0 to 100
        
        console.log("Image Pixel Analysis:", { avgSaturation, avgBrightness });
        
        // If saturation is extremely low (grayscale/monochromatic: like keyboard, paper, metal, dark office, gray tables), reject
        // Also if too dark or too bright (black screens, white walls)
        if (avgSaturation < 12 || avgBrightness < 10 || avgBrightness > 95) {
            return false; // Not food
        }
        return true; // Has color, likely food or natural image
    } catch (e) {
        console.error("Image analysis error", e);
        return true; // Fallback
    }
}

function analyzeFoodResult() {
    // 1. Check if user is logged in
    if (!state.user) {
        showToast('⚠️ กรุณาเข้าสู่ระบบก่อนใช้งานวิเคราะห์อาหาร');
        openLoginModal();
        return;
    }

    // 2. Check Free Tier limit (10 scans per WEEK)
    const isVip = state.subExpiry && Date.now() < state.subExpiry;
    if (!isVip) {
        const currentWeek = getISOWeekKey();
        if (state.lastScanDate !== currentWeek) {
            state.dailyScans = 0;
            state.lastScanDate = currentWeek;
            saveUserScans();
        }
        if (state.dailyScans >= 10) {
            showToast('⚠️ สิทธิ์วิเคราะห์อาหารฟรีสัปดาห์นี้ครบ 10 ครั้งแล้ว กรุณาอัปเกรดพรีเมียม');
            openTopupModal();
            return;
        }
    }

    // 3. Resolve what is being analyzed
    let foodToAnalyze = currentSelectedFood;
    let manualName = "";

    if (!foodToAnalyze) {
        manualName = document.getElementById('manual-food-name').value.trim();
        if (!manualName) {
            showToast('⚠️ กรุณาระบุชื่ออาหาร');
            return;
        }

        // Try to match in DB first
        const match = foodDatabase.find(f => f.name.toLowerCase().includes(manualName.toLowerCase()));
        if (match) {
            foodToAnalyze = match;
        }
    }

    // 4. If it's an image upload or manual entry, check if it is NOT food
    if (state.uploadedFileName || (!foodToAnalyze && manualName)) {
        const checkText = ((!foodToAnalyze && manualName) ? manualName : "") + " " + (state.uploadedFileName ? state.uploadedFileName : "");
        const checkTextLower = checkText.toLowerCase().trim();

        // Blacklist of explicit non-food keywords
        const nonFoodKeywords = ['หิน', 'ปากกา', 'ดินสอ', 'โต๊ะ', 'เก้าอี้', 'โทรศัพท์', 'คอมพิวเตอร์', 'พัดลม', 'ของเล่น', 'หนังสือ', 'สมุด', 'ขวดเปล่า', 'แก้วเปล่า', 'เสื้อ', 'กางเกง', 'รองเท้า', 'กระเป๋า', 'คีย์บอร์ด', 'เมาส์', 'ทีวี', 'พลาสติก', 'เหล็ก', 'ไม้', 'รถ', 'บ้าน', 'คน', 'สัตว์', 'หมา', 'แมว', 'pen', 'pencil', 'table', 'chair', 'phone', 'computer', 'book', 'bottle', 'cup', 'shirt', 'pants', 'shoes', 'bag', 'keyboard', 'mouse', 'tv', 'car', 'house', 'dog', 'cat', 'fan', 'bulb', 'carpet', 'socks', 'paper', 'scissors', 'coin', 'glass', 'stone', 'dirt', 'wood', 'plastic', 'screen', 'monitor', 'laptop', 'workspace', 'desk'];
        const hasNonFood = nonFoodKeywords.some(keyword => checkTextLower.includes(keyword));

        // Whitelist of common food keywords/prefixes/suffixes/ingredients
        const foodKeywords = [
            'ข้าว', 'แกง', 'ผัด', 'ต้ม', 'ตุ๋น', 'นึ่ง', 'ย่าง', 'เผา', 'ทอด', 'อบ', 'หมก', 'คั่ว', 'น้ำ', 'แห้ง',
            'ไก่', 'หมู', 'เนื้อ', 'ปลา', 'กุ้ง', 'ปู', 'หมึก', 'หอย', 'ไข่', 'เป็ด', 'ผัก', 'ผลไม้',
            'นม', 'ชา', 'กาแฟ', 'น้ำหวาน', 'เบียร์', 'เหล้า', 'ไวน์', 'น้ำอัดลม',
            'ส้มตำ', 'ลาบ', 'น้ำตก', 'ซุป', 'สลัด', 'ขนม', 'เบเกอรี่', 'เค้ก', 'คุกกี้', 'ขนมปัง',
            'เบอร์เกอร์', 'พิซซ่า', 'สเต็ก', 'พาสต้า', 'สปาเก็ตตี้', 'มักกะโรนี', 'ก๋วยเตี๋ยว', 'บะหมี่', 'ราเมน', 'ซูชิ',
            'ต้มยำ', 'กะเพรา', 'คะน้า', 'พริก', 'เกลือ', 'กระเทียม', 'หอม', 'ชีส', 'เนย', 'ช็อกโกแลต',
            'พะโล้', 'พะแนง', 'มัสมั่น', 'แกงส้ม', 'แกงจืด', 'ต้มจืด', 'ฉู่ฉี่', 'น้ำพริก', 'แจ่ว',
            'บัวลอย', 'ทองหยิบ', 'ทองหยอด', 'ฝอยทอง', 'ไอศกรีม', 'ไอติม', 'หวานเย็น', 'เฉาก๊วย',
            'กุ้งเผา', 'ปูดอง', 'หอยนางรม', 'ปลาหมึก', 'หมูกะทะ', 'ชาบู', 'สุกี้', 'จิ้มจุ่ม',
            'rice', 'chicken', 'pork', 'beef', 'fish', 'shrimp', 'crab', 'egg', 'duck', 'vegetable', 'fruit',
            'milk', 'tea', 'coffee', 'juice', 'soda', 'beer', 'wine', 'soup', 'salad', 'bread', 'cake', 'cookie',
            'burger', 'pizza', 'steak', 'pasta', 'spaghetti', 'noodle', 'ramen', 'sushi', 'curry', 'fry', 'fried',
            'chocolate', 'cheese', 'butter', 'ice cream'
        ];
        const hasFoodKeyword = foodKeywords.some(keyword => checkTextLower.includes(keyword));

        // 1. If explicit non-food keyword in filename or manual entry text, reject quietly
        if (hasNonFood) {
            return;
        }

        // 2. If it is an image, check the HSL pixels
        if (state.uploadedFileName) {
            const imgElement = document.getElementById('food-preview-img');
            if (imgElement && imgElement.src) {
                const isFoodImage = analyzeImageContent(imgElement);
                if (!isFoodImage) {
                    return; // Reject quietly (not food image content)
                }
            }
        }

        // 3. If it has no food keywords and isn't generic camera naming, reject quietly
        if (!hasFoodKeyword && !checkTextLower.includes("img_") && !checkTextLower.includes("dsc_") && !checkTextLower.includes("screenshot") && !checkTextLower.includes("image") && !checkTextLower.includes("photo") && !checkTextLower.includes("pic") && !checkTextLower.includes("upload")) {
            return; // Reject quietly
        }
    }

    // 6. If not matched in DB and passed food check, generate mock food data
    if (!foodToAnalyze) {
        foodToAnalyze = {
            name: manualName,
            cal: 400 + Math.floor(Math.random() * 300),
            protein: 10 + Math.floor(Math.random() * 20),
            carbs: 40 + Math.floor(Math.random() * 40),
            fat: 10 + Math.floor(Math.random() * 20),
            fiber: 1 + Math.floor(Math.random() * 5),
            sugar: 2 + Math.floor(Math.random() * 15),
            sodium: 500 + Math.floor(Math.random() * 1000),
            icon: '🍽️',
            unit: 'จาน'
        };
    }
    currentSelectedFood = foodToAnalyze; // Save it for adding to log

    // 7. Increment daily scan (if not VIP)
    if (!isVip) {
        state.dailyScans++;
        saveUserScans();
        showToast(`✅ วิเคราะห์อาหารสำเร็จ (ใช้สิทธิ์ไปแล้ว ${state.dailyScans}/10)`);
    } else {
        showToast(`🌟 วิเคราะห์สำเร็จด้วยสิทธิ์พรีเมียม!`);
    }

    const multiplier = currentPortion;
    const cal = Math.round(foodToAnalyze.cal * multiplier);
    const p = Math.round(foodToAnalyze.protein * multiplier);
    const c = Math.round(foodToAnalyze.carbs * multiplier);
    const f = Math.round(foodToAnalyze.fat * multiplier);
    const fiber = Math.round(foodToAnalyze.fiber * multiplier);
    const sugar = Math.round(foodToAnalyze.sugar * multiplier);
    const sodium = Math.round(foodToAnalyze.sodium * multiplier);

    // Show Result UI
    document.getElementById('food-placeholder').classList.add('hidden');
    document.getElementById('food-result').classList.remove('hidden');

    // Update Text
    document.getElementById('detected-food-icon').textContent = foodToAnalyze.icon;
    document.getElementById('detected-food-name').textContent = foodToAnalyze.name;
    document.getElementById('detected-food-portion').textContent = `${currentPortion} ${foodToAnalyze.unit}`;
    
    // Animate Calories
    animateNumber('food-cal-value', cal, 0);
    
    // Update Ring
    setTimeout(() => {
        // Max cal for ring reference = 1000
        let ringPct = (cal / 1000) * 100;
        if (ringPct > 100) ringPct = 100;
        const dashOffset = 377 - (377 * ringPct / 100);
        document.getElementById('cal-ring-fill').style.strokeDashoffset = dashOffset;
    }, 100);

    // Update Macros
    document.getElementById('food-protein-val').textContent = `${p}g`;
    document.getElementById('food-carbs-val').textContent = `${c}g`;
    document.getElementById('food-fat-val').textContent = `${f}g`;
    document.getElementById('food-fiber-val').textContent = `${fiber}g`;
    
    document.getElementById('food-sugar-val').textContent = `${sugar}g`;
    document.getElementById('food-sodium-val').textContent = `${sodium}mg`;
    document.getElementById('food-serving-val').textContent = `${currentPortion} ${currentSelectedFood.unit}`;

    // Animate Macro Bars
    setTimeout(() => {
        // Max values for 100% bar width reference
        document.getElementById('food-protein-bar').style.width = `${Math.min((p / 60) * 100, 100)}%`;
        document.getElementById('food-carbs-bar').style.width = `${Math.min((c / 100) * 100, 100)}%`;
        document.getElementById('food-fat-bar').style.width = `${Math.min((f / 40) * 100, 100)}%`;
        document.getElementById('food-fiber-bar').style.width = `${Math.min((fiber / 15) * 100, 100)}%`;
    }, 100);
}

function addToFoodLog() {
    if (!currentSelectedFood) return;

    const logEntry = {
        ...currentSelectedFood,
        portion: currentPortion,
        totalCal: Math.round(currentSelectedFood.cal * currentPortion),
        totalP: Math.round(currentSelectedFood.protein * currentPortion),
        totalC: Math.round(currentSelectedFood.carbs * currentPortion),
        totalF: Math.round(currentSelectedFood.fat * currentPortion)
    };

    dailyFoodLog.push(logEntry);
    updateDailyLogUI();
    const lang = state.lang || 'th';
    const displayName = (lang === 'th' || !foodNameTranslations[logEntry.name]) ? logEntry.name : foodNameTranslations[logEntry.name];
    showToast(lang === 'th' ? `✅ เพิ่ม ${displayName} ลงบันทึกแล้ว` : `✅ Added ${displayName} to log`);
}

function updateDailyLogUI() {
    const logList = document.getElementById('daily-log-list');
    const totalDiv = document.getElementById('daily-total');
    const lang = state.lang || 'th';
    
    if (dailyFoodLog.length === 0) {
        logList.innerHTML = lang === 'th' ? '<div class="daily-log-empty">ยังไม่มีรายการอาหาร</div>' : '<div class="daily-log-empty">No logged food items</div>';
        totalDiv.classList.add('hidden');
        updateHistoryWithTodayCalories();
        return;
    }

    logList.innerHTML = dailyFoodLog.map(item => {
        const name = (lang === 'th' || !foodNameTranslations[item.name]) ? item.name : foodNameTranslations[item.name];
        const unit = translateFoodUnit(item.unit, lang);
        return `
        <div class="log-item">
            <div class="log-info">
                <span>${item.icon}</span>
                <div>
                    <div class="log-name">${name}</div>
                    <div class="log-portion">${item.portion} ${unit}</div>
                </div>
            </div>
            <div class="log-cal">${item.totalCal} ${lang === 'th' ? 'แคล' : 'kcal'}</div>
        </div>
        `;
    }).join('');

    // Calculate totals
    const totalCal = dailyFoodLog.reduce((sum, item) => sum + item.totalCal, 0);
    const totalP = dailyFoodLog.reduce((sum, item) => sum + item.totalP, 0);
    const totalC = dailyFoodLog.reduce((sum, item) => sum + item.totalC, 0);
    const totalF = dailyFoodLog.reduce((sum, item) => sum + item.totalF, 0);

    document.getElementById('daily-total-cal').textContent = lang === 'th' ? `${totalCal} แคล` : `${totalCal} kcal`;
    document.getElementById('daily-total-protein').textContent = `P: ${totalP}g`;
    document.getElementById('daily-total-carbs').textContent = `C: ${totalC}g`;
    document.getElementById('daily-total-fat').textContent = `F: ${totalF}g`;

    totalDiv.classList.remove('hidden');
    updateHistoryWithTodayCalories();
}

// ===== Authentication & Token System Logic =====
let pendingPackage = null;
let claimTimerInterval = null;

function openLoginModal() {
    closeAllModals();
    const modal = document.getElementById('loginModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
}

function openProfileModal() {
    if (!state.user) {
        openLoginModal();
        return;
    }
    closeAllModals();
    
    // Update profile display
    document.getElementById('profile-username-display').textContent = state.user;
    document.getElementById('profileTokenCount').textContent = state.tokens;
    
    // Check claim status
    updateClaimSectionUI();
    updateSubscriptionUI();
    
    const modal = document.getElementById('profileModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
}

function openTopupModal() {
    closeAllModals();
    const modal = document.getElementById('topupModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('show');
        modal.style.display = 'none';
    });
}

function loadUserSession() {
    const savedUser = localStorage.getItem('fitlife_user');
    const savedScans = localStorage.getItem('fitlife_daily_scans');
    const savedScanDate = localStorage.getItem('fitlife_last_scan_date');
    
    if (savedUser) {
        state.user = savedUser;
        state.dailyScans = parseInt(savedScans) || 0;
        state.lastScanDate = savedScanDate || null;
        
        // Load subscription
        const userSubExpiryKey = `fitlife_user_sub_expiry_${savedUser.toLowerCase()}`;
        const userSubTypeKey = `fitlife_user_sub_type_${savedUser.toLowerCase()}`;
        state.subExpiry = parseInt(localStorage.getItem(userSubExpiryKey)) || null;
        state.subType = localStorage.getItem(userSubTypeKey) || null;
        
        // Load avatar
        const userAvatarKey = `fitlife_user_avatar_${savedUser.toLowerCase()}`;
        state.avatar = localStorage.getItem(userAvatarKey) || null;
        
        // Load custom calorie target
        const userCustomTargetKey = `fitlife_user_custom_target_${savedUser.toLowerCase()}`;
        state.customCalorieTarget = parseInt(localStorage.getItem(userCustomTargetKey)) || null;
        const customTargetInput = document.getElementById('custom-calorie-target');
        if (customTargetInput) {
            customTargetInput.value = state.customCalorieTarget || '';
        }
        
        // Load history log
        const userHistoryKey = `fitlife_user_history_${savedUser.toLowerCase()}`;
        try {
            state.historyLog = JSON.parse(localStorage.getItem(userHistoryKey)) || [];
        } catch (e) {
            state.historyLog = [];
        }
        
        // Show profile badge & hide login button
        document.getElementById('btnLoginNav').classList.add('hidden');
        document.getElementById('userProfileBadge').classList.remove('hidden');
        document.getElementById('navUsername').textContent = state.user;
        
        updateUserStatusUI();
        updateSubscriptionUI();
        updateAvatarUI();
        renderAnalysisDashboard();
    } else {
        // Show login button & hide profile badge
        document.getElementById('btnLoginNav').classList.remove('hidden');
        document.getElementById('userProfileBadge').classList.add('hidden');
        renderAnalysisDashboard();
    }
}

function loginUser() {
    const usernameInput = document.getElementById('login-username');
    const username = usernameInput.value.trim();
    
    if (!username) {
        showToast('⚠️ กรุณาระบุชื่อผู้ใช้งาน');
        return;
    }
    
    state.user = username;
    
    // Get existing user data from localStorage
    const userScansKey = `fitlife_user_scans_${username.toLowerCase()}`;
    const userScanDateKey = `fitlife_user_scan_date_${username.toLowerCase()}`;
    const userSubExpiryKey = `fitlife_user_sub_expiry_${username.toLowerCase()}`;
    const userSubTypeKey = `fitlife_user_sub_type_${username.toLowerCase()}`;
    const userAvatarKey = `fitlife_user_avatar_${username.toLowerCase()}`;
    const userHistoryKey = `fitlife_user_history_${username.toLowerCase()}`;
    const userCustomTargetKey = `fitlife_user_custom_target_${username.toLowerCase()}`;
    
    const existingScans = localStorage.getItem(userScansKey);
    const existingScanDate = localStorage.getItem(userScanDateKey);
    const existingSubExpiry = localStorage.getItem(userSubExpiryKey);
    const existingSubType = localStorage.getItem(userSubTypeKey);
    const existingAvatar = localStorage.getItem(userAvatarKey);
    
    if (existingScans !== null) {
        state.dailyScans = parseInt(existingScans);
        state.lastScanDate = existingScanDate || null;
        state.subExpiry = existingSubExpiry ? parseInt(existingSubExpiry) : null;
        state.subType = existingSubType || null;
        state.avatar = existingAvatar || null;
        const existingCustomTarget = localStorage.getItem(userCustomTargetKey);
        state.customCalorieTarget = existingCustomTarget ? parseInt(existingCustomTarget) : null;
        const customTargetInput = document.getElementById('custom-calorie-target');
        if (customTargetInput) {
            customTargetInput.value = state.customCalorieTarget || '';
        }
        try {
            state.historyLog = JSON.parse(localStorage.getItem(userHistoryKey)) || [];
        } catch (e) {
            state.historyLog = [];
        }
    } else {
        state.dailyScans = 0;
        state.lastScanDate = null;
        state.subExpiry = null;
        state.subType = null;
        state.avatar = null;
        state.historyLog = [];
        state.customCalorieTarget = null;
        const customTargetInput = document.getElementById('custom-calorie-target');
        if (customTargetInput) {
            customTargetInput.value = '';
        }
    }
    
    // Save to active session
    localStorage.setItem('fitlife_user', state.user);
    saveUserScans();
    if (state.subExpiry) {
        localStorage.setItem('fitlife_sub_expiry', state.subExpiry);
        localStorage.setItem('fitlife_sub_type', state.subType);
    } else {
        localStorage.removeItem('fitlife_sub_expiry');
        localStorage.removeItem('fitlife_sub_type');
    }
    
    // Update UI
    document.getElementById('btnLoginNav').classList.add('hidden');
    document.getElementById('userProfileBadge').classList.remove('hidden');
    document.getElementById('navUsername').textContent = state.user;
    
    updateUserStatusUI();
    updateSubscriptionUI();
    updateAvatarUI();
    renderAnalysisDashboard();
    closeModal('loginModal');
    showToast(`🚀 ยินดีต้อนรับคุณ ${state.user}!`);
    usernameInput.value = '';
}

function logoutUser() {
    // Save scans and subscription before logging out
    if (state.user) {
        saveUserScans();
        const userSubExpiryKey = `fitlife_user_sub_expiry_${state.user.toLowerCase()}`;
        const userSubTypeKey = `fitlife_user_sub_type_${state.user.toLowerCase()}`;
        if (state.subExpiry) {
            localStorage.setItem(userSubExpiryKey, state.subExpiry);
            localStorage.setItem(userSubTypeKey, state.subType);
        } else {
            localStorage.removeItem(userSubExpiryKey);
            localStorage.removeItem(userSubTypeKey);
        }
    }
    
    // Clear active session
    state.user = null;
    state.dailyScans = 0;
    state.lastScanDate = null;
    state.subExpiry = null;
    state.subType = null;
    state.avatar = null;
    state.historyLog = [];
    state.customCalorieTarget = null;
    const customTargetInput = document.getElementById('custom-calorie-target');
    if (customTargetInput) {
        customTargetInput.value = '';
    }
    
    localStorage.removeItem('fitlife_user');
    localStorage.removeItem('fitlife_daily_scans');
    localStorage.removeItem('fitlife_last_scan_date');
    localStorage.removeItem('fitlife_sub_expiry');
    localStorage.removeItem('fitlife_sub_type');
    
    // Update UI
    document.getElementById('btnLoginNav').classList.remove('hidden');
    document.getElementById('userProfileBadge').classList.add('hidden');
    
    updateAvatarUI();
    renderAnalysisDashboard();
    closeModal('profileModal');
    showToast('🚪 ออกจากระบบสำเร็จแล้ว');
}

function updateTokenUI() {
    document.getElementById('navTokenCount').textContent = state.tokens;
    const profileTokens = document.getElementById('profileTokenCount');
    if (profileTokens) {
        profileTokens.textContent = state.tokens;
    }
    
    // Persist in session and user profile
    localStorage.setItem('fitlife_tokens', state.tokens);
    if (state.user) {
        const userKey = `fitlife_user_tokens_${state.user.toLowerCase()}`;
        localStorage.setItem(userKey, state.tokens);
    }
}

function saveUserScans() {
    localStorage.setItem('fitlife_daily_scans', state.dailyScans);
    if (state.lastScanDate) {
        localStorage.setItem('fitlife_last_scan_date', state.lastScanDate);
    }
    if (state.user) {
        const userScansKey = `fitlife_user_scans_${state.user.toLowerCase()}`;
        const userScanDateKey = `fitlife_user_scan_date_${state.user.toLowerCase()}`;
        localStorage.setItem(userScansKey, state.dailyScans);
        if (state.lastScanDate) {
            localStorage.setItem(userScanDateKey, state.lastScanDate);
        }
    }
    updateUserStatusUI();
}

function updateUserStatusUI() {
    const isVip = state.subExpiry && Date.now() < state.subExpiry;
    
    const navScanCount = document.getElementById('navUserStatus');
    if (navScanCount) {
        if (isVip) {
            navScanCount.textContent = '🌟 VIP';
            navScanCount.style.background = 'var(--accent-warning)';
            navScanCount.style.color = '#111';
        } else {
            navScanCount.textContent = 'FREE';
            navScanCount.style.background = 'var(--border-color)';
            navScanCount.style.color = 'inherit';
        }
    }
    
    const profileTokens = document.getElementById('profileDailyScansCount');
    if (profileTokens) {
        if (isVip) {
            profileTokens.textContent = 'ไม่จำกัด';
        } else {
            const currentWeek = getISOWeekKey();
            if (state.lastScanDate !== currentWeek) {
                state.dailyScans = 0;
                state.lastScanDate = currentWeek;
            }
            const remainingScans = Math.max(0, 10 - state.dailyScans);
            profileTokens.textContent = remainingScans;
        }
    }
}

// Helper: get ISO year-week string e.g. "2025-W25"
function getISOWeekKey() {
    const now = new Date();
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

let pendingSubscription = null;

function selectPackage(tokens, price) {
    pendingPackage = { tokens, price };
    pendingSubscription = null;
    
    // Update payment details
    document.getElementById('pay-price-value').textContent = price;
    document.getElementById('pay-tokens-value').textContent = tokens;
    
    closeModal('topupModal');
    
    const modal = document.getElementById('paymentModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
}

function selectSubscription(days, price, name) {
    pendingSubscription = { days, price, name };
    pendingPackage = null;
    
    // Update payment details
    document.getElementById('pay-price-value').textContent = price;
    document.getElementById('pay-tokens-value').textContent = `สิทธิ์พรีเมี่ยม (${name})`;
    
    closeModal('topupModal');
    
    const modal = document.getElementById('paymentModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
}

function confirmMockPayment() {
    if (pendingSubscription) {
        const now = Date.now();
        let currentExpiry = state.subExpiry || now;
        if (currentExpiry < now) currentExpiry = now;
        
        state.subExpiry = currentExpiry + pendingSubscription.days * 24 * 60 * 60 * 1000;
        state.subType = pendingSubscription.name;
        
        saveUserSubscription();
        updateSubscriptionUI();
        updateUserStatusUI();
        
        showToast(`💳 ชำระเงินสำเร็จ! สมัครสมาชิกพรีเมี่ยม (${pendingSubscription.name}) สำเร็จแล้ว`);
        pendingSubscription = null;
    }
    
    closeModal('paymentModal');
}

function saveUserSubscription() {
    if (state.user) {
        const userSubExpiryKey = `fitlife_user_sub_expiry_${state.user.toLowerCase()}`;
        const userSubTypeKey = `fitlife_user_sub_type_${state.user.toLowerCase()}`;
        if (state.subExpiry) {
            localStorage.setItem(userSubExpiryKey, state.subExpiry);
            localStorage.setItem(userSubTypeKey, state.subType);
        } else {
            localStorage.removeItem(userSubExpiryKey);
            localStorage.removeItem(userSubTypeKey);
        }
    }
}

function updateSubscriptionUI() {
    const vipContainer = document.getElementById('profileVipContainer');
    const vipExpiry = document.getElementById('profileVipExpiry');
    const freeContainer = document.getElementById('profileFreeStatusContainer');
    
    if (vipContainer && vipExpiry) {
        if (state.subExpiry && Date.now() < state.subExpiry) {
            vipContainer.classList.remove('hidden');
            if (freeContainer) freeContainer.classList.add('hidden');
            
            const remaining = state.subExpiry - Date.now();
            const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
            const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
            const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
            
            vipExpiry.innerHTML = `หมดอายุใน: <strong>${days} วัน ${hours} ชั่วโมง ${minutes} นาที</strong><br><small>แพ็กเกจ: ${state.subType}</small>`;
        } else {
            vipContainer.classList.add('hidden');
            if (freeContainer) freeContainer.classList.remove('hidden');
        }
    }
}

// Legacy inline confirmation functions removed as they are no longer used by the new UI.

// ===== Profile Avatar Upload & Sync =====
function triggerProfileAvatarInput() {
    const input = document.getElementById('profile-avatar-input');
    if (input) input.click();
}

function handleProfileAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        state.avatar = e.target.result;
        
        // Save to user profile in localStorage
        if (state.user) {
            const userAvatarKey = `fitlife_user_avatar_${state.user.toLowerCase()}`;
            localStorage.setItem(userAvatarKey, state.avatar);
        }
        
        updateAvatarUI();
        
        const lang = state.lang || 'th';
        showToast(lang === 'th' ? '📸 อัปโหลดรูปโปรไฟล์สำเร็จ!' : '📸 Profile photo uploaded successfully!');
    };
    reader.readAsDataURL(file);
}

function updateAvatarUI() {
    const navPlaceholder = document.getElementById('navAvatarPlaceholder');
    const navImg = document.getElementById('navAvatarImg');
    const profilePlaceholder = document.getElementById('profileAvatarPlaceholder');
    const profileImg = document.getElementById('profileAvatarImg');
    
    if (state.avatar) {
        if (navPlaceholder) navPlaceholder.classList.add('hidden');
        if (navImg) {
            navImg.src = state.avatar;
            navImg.classList.remove('hidden');
        }
        if (profilePlaceholder) profilePlaceholder.classList.add('hidden');
        if (profileImg) {
            profileImg.src = state.avatar;
            profileImg.classList.remove('hidden');
        }
    } else {
        if (navPlaceholder) navPlaceholder.classList.remove('hidden');
        if (navImg) {
            navImg.src = '';
            navImg.classList.add('hidden');
        }
        if (profilePlaceholder) profilePlaceholder.classList.remove('hidden');
        if (profileImg) {
            profileImg.src = '';
            profileImg.classList.add('hidden');
        }
    }
}

// ===== Localization Translations & Switcher =====
const translations = {
    th: {
        "nav-bmi": "⚖️ BMI",
        "nav-calories": "🔥 แคลอรี่",
        "nav-schedule": "📅 ตาราง",
        "nav-food": "📸 วิเคราะห์อาหาร",
        "btnLoginNav": "🔑 เข้าสู่ระบบ",
        "hero-title-text": "เครื่องมือสุขภาพ <span class=\"gradient-text\">ครบจบในที่เดียว</span>",
        "hero-subtitle-text": "คำนวณ BMI, แคลอรี่ต่อวัน, วิเคราะห์สารอาหารจากรูปถ่าย และวางแผนตารางออกกำลังกาย",
        "tab-bmi-label": "คำนวณ BMI",
        "tab-calories-label": "คำนวณแคลอรี่",
        "tab-schedule-label": "ตารางออกกำลังกาย",
        "tab-food-label": "วิเคราะห์อาหาร",
        "bmi-section-title": "คำนวณดัชนีมวลกาย (BMI)",
        "bmi-section-desc": "กรอกข้อมูลน้ำหนักและส่วนสูงเพื่อคำนวณค่า BMI ของคุณ",
        "bmi-form-header": "📝 กรอกข้อมูล",
        "bmi-label-weight": "น้ำหนัก (กก.)",
        "bmi-label-height": "ส่วนสูง (ซม.)",
        "btn-initial-bmi": "⚖️ คำนวณ BMI",
        "bmi-result-header": "📊 ผลลัพธ์ BMI",
        "bmi-placeholder-text": "กรอกข้อมูลและกดคำนวณ<br>เพื่อดูผลลัพธ์ BMI ของคุณ",
        "bmi-gauge-underweight": "ผอม",
        "bmi-gauge-normal": "ปกติ",
        "bmi-gauge-overweight": "น้ำหนักเกิน",
        "bmi-gauge-obese": "อ้วน",
        "bmi-table-header": "📋 ตาราง BMI",
        "bmi-table-th-bmi": "BMI",
        "bmi-table-th-status": "สถานะ",
        "bmi-range-underweight": "น้ำหนักต่ำกว่าเกณฑ์",
        "bmi-range-normal": "น้ำหนักปกติ ✅",
        "bmi-range-overweight": "น้ำหนักเกิน",
        "bmi-range-obese1": "อ้วนระดับ 1",
        "bmi-range-obese2": "อ้วนระดับ 2",
        "cal-section-title": "คำนวณแคลอรี่ที่ต้องการต่อวัน",
        "cal-section-desc": "คำนวณอัตราการเผาผลาญพื้นฐาน (BMR) และแคลอรี่ที่ต้องการในแต่ละวัน (TDEE)",
        "cal-form-header": "📝 กรอกข้อมูลของคุณ",
        "subtab-body": "สัดส่วน",
        "subtab-fat": "% ไขมัน",
        "cal-label-weight": "น้ำหนัก (กก.)",
        "cal-label-height": "ส่วนสูง (ซม.)",
        "cal-label-age": "อายุ (ปี)",
        "cal-label-gender": "เพศ",
        "gender-male-text": "👨 ชาย",
        "gender-female-text": "👩 หญิง",
        "cal-label-weight-fat": "น้ำหนัก (กก.)",
        "cal-label-fat-percent": "% ไขมัน",
        "cal-label-activity": "กิจกรรมในชีวิตประจำวัน",
        "activity-sedentary-title": "Sedentary",
        "activity-sedentary-desc": "ไม่ออกกำลังกาย นั่งทำงานทั้งวัน",
        "activity-light-title": "Lightly Active",
        "activity-light-desc": "ออกกำลังกายเบาๆ 1-3 วัน/สัปดาห์",
        "activity-moderate-title": "Moderately Active",
        "activity-moderate-desc": "ออกกำลังกายปานกลาง 3-5 วัน/สัปดาห์",
        "activity-very-title": "Very Active",
        "activity-very-desc": "ออกกำลังกายหนัก 6-7 วัน/สัปดาห์",
        "activity-extra-title": "Extra Active",
        "activity-extra-desc": "ออกกำลังกายหนักมาก หรือฝึกแบบนักกีฬา",
        "btn-initial-calorie": "🔥 คำนวณแคลอรี่",
        "cal-result-header": "📊 ผลลัพธ์แคลอรี่",
        "cal-placeholder-text": "กรอกข้อมูลและกดคำนวณ<br>เพื่อดูแคลอรี่ที่ต้องการต่อวัน",
        "cal-bmr-label": "BMR (พื้นฐาน)",
        "cal-tdee-label": "TDEE (ทั้งวัน)",
        "cal-unit-day": "แคลอรี่/วัน",
        "cal-goals-title": "🎯 เป้าหมายแคลอรี่",
        "cal-goal-lose-label": "ลดน้ำหนัก",
        "cal-goal-lose-desc": "-500 แคล",
        "cal-goal-maintain-label": "รักษาน้ำหนัก",
        "cal-goal-maintain-desc": "TDEE",
        "cal-goal-gain-label": "เพิ่มน้ำหนัก",
        "cal-goal-gain-desc": "+500 แคล",
        "cal-goals-unit": "แคล/วัน",
        "cal-macro-title": "🥗 สัดส่วนสารอาหาร (สำหรับรักษาน้ำหนัก)",
        "cal-macro-protein": "โปรตีน",
        "cal-macro-carbs": "คาร์โบไฮเดรต",
        "cal-macro-fat": "ไขมัน",
        "schedule-section-title": "ตารางออกกำลังกายประจำสัปดาห์",
        "schedule-section-desc": "วางแผนการออกกำลังกายของคุณ เลือกเป้าหมายเพื่อดูตารางที่เหมาะสม",
        "goal-general-text": "💪 ทั่วไป",
        "goal-weight-loss-text": "📉 ลดน้ำหนัก",
        "goal-muscle-text": "🏋️ เพิ่มกล้ามเนื้อ",
        "intensity-light-text": "🟢 เบา (Light)",
        "intensity-medium-text": "🟡 กลาง (Medium)",
        "intensity-heavy-text": "🔴 หนัก (Heavy)",
        "legend-cardio": "คาร์ดิโอ",
        "legend-strength": "เวทเทรนนิ่ง",
        "legend-flexibility": "ยืดหยุ่น / โยคะ",
        "legend-rest": "พักผ่อน",
        "food-section-title": "📸 วิเคราะห์สารอาหารจากรูปถ่าย",
        "food-section-desc": "ถ่ายรูปหรืออัปโหลดภาพอาหาร แล้วระบบจะวิเคราะห์สารอาหารให้คุณทันที",
        "food-upload-header": "📷 อัปโหลดหรือถ่ายรูปอาหาร",
        "upload-text": "คลิกเพื่อถ่ายรูปหรืออัปโหลดภาพอาหาร",
        "upload-hint": "รองรับ JPG, PNG, WebP",
        "btn-camera-text": "📷 ถ่ายรูป",
        "btn-gallery-text": "🖼️ เลือกจากแกลเลอรี่",
        "food-label-manual-name": "ระบุชื่ออาหารในภาพ",
        "manual-food-name-placeholder": "เช่น ข้าวกะเพราหมูสับ",
        "food-divider-text": "หรือค้นหาจากฐานข้อมูล",
        "food-search-placeholder": "🔍 พิมพ์ชื่ออาหาร เช่น ข้าวผัด, ส้มตำ...",
        "food-label-portion": "จำนวน (เสิร์ฟ)",
        "btn-initial-analyze": "🔬 วิเคราะห์สารอาหาร",
        "food-result-header": "🥗 ผลวิเคราะห์สารอาหาร",
        "food-placeholder-text": "อัปโหลดรูปอาหารหรือค้นหาเมนู<br>เพื่อดูข้อมูลสารอาหาร",
        "food-macro-protein-label": "โปรตีน",
        "food-macro-carbs-label": "คาร์โบไฮเดรต",
        "food-macro-fat-label": "ไขมัน",
        "food-macro-fiber-label": "ไฟเบอร์",
        "food-extra-sugar": "น้ำตาล",
        "food-extra-sodium": "โซเดียม",
        "food-extra-serving": "ขนาด",
        "food-daily-log-title": "📝 บันทึกอาหารวันนี้",
        "btn-add-log-text": "➕ เพิ่มลงบันทึกประจำวัน",
        "login-modal-title": "🔑 เข้าสู่ระบบ",
        "login-label-username": "ชื่อผู้ใช้งาน",
        "login-username-placeholder": "ระบุชื่อผู้ใช้ใดก็ได้เพื่อเข้าระบบ",
        "login-btn-submit": "🚀 เข้าสู่ระบบ",
        "profile-modal-title": "👤 ข้อมูลผู้ใช้งาน & โทเค่น",
        "avatar-overlay-text": "แก้ไข",
        "profile-token-title": "สิทธิ์ใช้งานฟรีวันนี้",
        "profile-vip-badge": "🌟 PREMIUM ACCOUNT (ใช้งานฟรีไม่จำกัด)",
        "profile-claim-title": "🎁 สมัครสมาชิกพรีเมียม",
        "profile-claim-desc": "อัปเกรดเพื่อรับสิทธิ์ใช้งานไม่จำกัด และดูตารางออกกำลังกายแบบพิเศษ",
        "btn-claim-tokens": "🌟 อัปเกรดพรีเมียม",
        "profile-countdown-prefix": "⏳ หมดอายุใน: ",
        "profile-btn-topup": "🌟 อัปเกรดพรีเมียม",
        "profile-btn-logout": "🚪 ออกจากระบบ",
        "topup-modal-title": "🌟 อัปเกรดสมาชิกพรีเมียม",
        "topup-desc-single": "🌟 แพ็กเกจพรีเมียม (ใช้งานฟรีไม่จำกัด)",
        "topup-desc-sub": "🌟 แพ็กเกจพรีเมียม (ใช้งานฟรีไม่จำกัด)",
        "payment-modal-title": "📱 สแกนจ่ายเงินจำลอง",
        "pay-amount-label": "ยอดที่ต้องชำระ",
        "btn-confirm-payment": "✅ ยืนยันการชำระเงินสำเร็จ (Mock)",
        "nav-analysis": "ภาพรวม",
        "tab-analysis-label": "วิเคราะห์ภาพรวม",
        "analysis-section-title": "วิเคราะห์ภาพรวมย้อนหลัง",
        "analysis-section-desc": "ติดตามข้อมูลพลังงานแคลอรี่และพฤติกรรมสุขภาพของคุณในระยะยาว",
        "btn-mock-history": "⚙️ จำลองประวัติย้อนหลัง (Mock History)",
        "lbl-analysis-avg-cal": "เฉลี่ยแคลอรี่ต่อวัน",
        "lbl-analysis-goal-rate": "อัตราทำได้ตามเป้าหมาย",
        "lbl-analysis-weight-est": "คาดการณ์น้ำหนักที่เปลี่ยน",
        "lbl-analysis-chart-title": "📊 กราฟสรุปแคลอรี่ที่ได้รับต่อวัน",
        "lbl-analysis-insight-title": "💡 วิเคราะห์และคำแนะนำภาพรวม",
        "lbl-analysis-avg-unit": "แคล/วัน",
        "lbl-analysis-weight-unit": "กก.",
        "lbl-custom-target": "เป้าหมาย: ",
        "custom-calorie-target": "เช่น 2000"
    },
    en: {
        "nav-bmi": "⚖️ BMI",
        "nav-calories": "🔥 Calories",
        "nav-schedule": "📅 Schedule",
        "nav-food": "📸 Food Scanner",
        "btnLoginNav": "🔑 Login",
        "hero-title-text": "Health Tools <span class=\"gradient-text\">All in One Place</span>",
        "hero-subtitle-text": "Calculate BMI, daily calories, analyze food nutrients from photos, and plan workout schedules.",
        "tab-bmi-label": "BMI Calculator",
        "tab-calories-label": "Calorie Calculator",
        "tab-schedule-label": "Workout Schedule",
        "tab-food-label": "Food Scanner",
        "bmi-section-title": "Body Mass Index (BMI) Calculator",
        "bmi-section-desc": "Enter your weight and height to calculate your BMI.",
        "bmi-form-header": "📝 Enter Info",
        "bmi-label-weight": "Weight (kg)",
        "bmi-label-height": "Height (cm)",
        "btn-initial-bmi": "⚖️ Calculate BMI",
        "bmi-result-header": "📊 BMI Result",
        "bmi-placeholder-text": "Enter your info and click calculate<br>to see your BMI results",
        "bmi-gauge-underweight": "Underweight",
        "bmi-gauge-normal": "Normal",
        "bmi-gauge-overweight": "Overweight",
        "bmi-gauge-obese": "Obese",
        "bmi-table-header": "📋 BMI Table",
        "bmi-table-th-bmi": "BMI",
        "bmi-table-th-status": "Status",
        "bmi-range-underweight": "Underweight",
        "bmi-range-normal": "Normal ✅",
        "bmi-range-overweight": "Overweight",
        "bmi-range-obese1": "Obese Class 1",
        "bmi-range-obese2": "Obese Class 2",
        "cal-section-title": "Daily Calorie Calculator",
        "cal-section-desc": "Calculate your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE)",
        "cal-form-header": "📝 Enter Your Information",
        "subtab-body": "Specs",
        "subtab-fat": "% Fat",
        "cal-label-weight": "Weight (kg)",
        "cal-label-height": "Height (cm)",
        "cal-label-age": "Age (yrs)",
        "cal-label-gender": "Gender",
        "gender-male-text": "👨 Male",
        "gender-female-text": "👩 Female",
        "cal-label-weight-fat": "Weight (kg)",
        "cal-label-fat-percent": "% Body Fat",
        "cal-label-activity": "Daily Activity Level",
        "activity-sedentary-title": "Sedentary",
        "activity-sedentary-desc": "No exercise, sit all day",
        "activity-light-title": "Lightly Active",
        "activity-light-desc": "Light exercise 1-3 days/week",
        "activity-moderate-title": "Moderately Active",
        "activity-moderate-desc": "Moderate exercise 3-5 days/week",
        "activity-very-title": "Very Active",
        "activity-very-desc": "Heavy exercise 6-7 days/week",
        "activity-extra-title": "Extra Active",
        "activity-extra-desc": "Very heavy exercise / athlete",
        "btn-initial-calorie": "🔥 Calculate Calories",
        "cal-result-header": "📊 Calorie Result",
        "cal-placeholder-text": "Enter your info and click calculate<br>to see your daily calories needed",
        "cal-bmr-label": "BMR (Basal)",
        "cal-tdee-label": "TDEE (Total)",
        "cal-unit-day": "kcal/day",
        "cal-goals-title": "🎯 Calorie Targets",
        "cal-goal-lose-label": "Lose Weight",
        "cal-goal-lose-desc": "-500 kcal",
        "cal-goal-maintain-label": "Maintain Weight",
        "cal-goal-maintain-desc": "TDEE",
        "cal-goal-gain-label": "Gain Weight",
        "cal-goal-gain-desc": "+500 kcal",
        "cal-goals-unit": "kcal/day",
        "cal-macro-title": "🥗 Macronutrient Split (For Maintenance)",
        "cal-macro-protein": "Protein",
        "cal-macro-carbs": "Carbs",
        "cal-macro-fat": "Fat",
        "schedule-section-title": "Weekly Workout Schedule",
        "schedule-section-desc": "Plan your workouts. Select your goal to see the matching schedule.",
        "goal-general-text": "💪 General",
        "goal-weight-loss-text": "📉 Weight Loss",
        "goal-muscle-text": "🏋️ Build Muscle",
        "intensity-light-text": "🟢 Light",
        "intensity-medium-text": "🟡 Medium",
        "intensity-heavy-text": "🔴 Heavy",
        "legend-cardio": "Cardio",
        "legend-strength": "Strength",
        "legend-flexibility": "Flexibility / Yoga",
        "legend-rest": "Rest",
        "food-section-title": "📸 Nutritional Analysis from Photo",
        "food-section-desc": "Take a photo or upload a food image, and the system will analyze it instantly.",
        "food-upload-header": "📷 Upload or Take Food Photo",
        "upload-text": "Click to take photo or upload food image",
        "upload-hint": "Supports JPG, PNG, WebP",
        "btn-camera-text": "📷 Take Photo",
        "btn-gallery-text": "🖼️ Select from Gallery",
        "food-label-manual-name": "Specify food name in image",
        "manual-food-name-placeholder": "e.g. Basil Fried Rice with Minced Pork",
        "food-divider-text": "Or search database",
        "food-search-placeholder": "🔍 Type food name e.g. Fried Rice, Som Tum...",
        "food-label-portion": "Portion (servings)",
        "btn-initial-analyze": "🔬 Analyze Nutrition",
        "food-result-header": "🥗 Nutritional Analysis Result",
        "food-placeholder-text": "Upload a photo or search for a menu<br>to view nutritional facts",
        "food-macro-protein-label": "Protein",
        "food-macro-carbs-label": "Carbs",
        "food-macro-fat-label": "Fat",
        "food-macro-fiber-label": "Fiber",
        "food-extra-sugar": "Sugar",
        "food-extra-sodium": "Sodium",
        "food-extra-serving": "Serving Size",
        "food-daily-log-title": "📝 Daily Food Log",
        "btn-add-log-text": "➕ Add to Daily Log",
        "login-modal-title": "🔑 Login",
        "login-label-username": "Username",
        "login-username-placeholder": "Enter any username to login",
        "login-btn-submit": "🚀 Login",
        "profile-modal-title": "👤 User Info & Tokens",
        "avatar-overlay-text": "Edit",
        "profile-token-title": "Daily Free Scans",
        "profile-vip-badge": "🌟 PREMIUM ACCOUNT (Unlimited Free Access)",
        "profile-claim-title": "🎁 Premium Subscription",
        "profile-claim-desc": "Upgrade to get unlimited access and special workout schedules.",
        "btn-claim-tokens": "🌟 Upgrade to Premium",
        "profile-countdown-prefix": "⏳ Expires in: ",
        "profile-btn-topup": "🌟 Upgrade to Premium",
        "profile-btn-logout": "🚪 Logout",
        "topup-modal-title": "🌟 Upgrade to Premium",
        "topup-desc-single": "🌟 Premium Packages (Unlimited Free Use)",
        "topup-desc-sub": "🌟 Premium Packages (Unlimited Free Use)",
        "payment-modal-title": "📱 Mock QR Payment",
        "pay-amount-label": "Amount to Pay",
        "btn-confirm-payment": "✅ Confirm Payment Success (Mock)",
        "nav-analysis": "Analysis",
        "tab-analysis-label": "Overall Analysis",
        "analysis-section-title": "Overall Health Analysis",
        "analysis-section-desc": "Track your calorie intake history and weight trends over time.",
        "btn-mock-history": "⚙️ Mock History Generator",
        "lbl-analysis-avg-cal": "Avg Daily Calories",
        "lbl-analysis-goal-rate": "Goal Success Rate",
        "lbl-analysis-weight-est": "Est. Weight Change",
        "lbl-analysis-chart-title": "📊 Daily Calorie Intake History",
        "lbl-analysis-insight-title": "💡 Health Insights & Recommendations",
        "lbl-analysis-avg-unit": "kcal/day",
        "lbl-analysis-weight-unit": "kg",
        "lbl-custom-target": "Target: ",
        "custom-calorie-target": "e.g. 2000"
    }
};

const dayTranslations = {
    'วันจันทร์': { th: 'วันจันทร์', en: 'Monday' },
    'วันอังคาร': { th: 'วันอังคาร', en: 'Tuesday' },
    'วันพุธ': { th: 'วันพุธ', en: 'Wednesday' },
    'วันพฤหัสบดี': { th: 'วันพฤหัสบดี', en: 'Thursday' },
    'วันศุกร์': { th: 'วันศุกร์', en: 'Friday' },
    'วันเสาร์': { th: 'วันเสาร์', en: 'Saturday' },
    'วันอาทิตย์': { th: 'วันอาทิตย์', en: 'Sunday' }
};

const typeLabelTranslations = {
    'คาร์ดิโอ': { th: 'คาร์ดิโอ', en: 'Cardio' },
    'เวทเทรนนิ่ง': { th: 'เวทเทรนนิ่ง', en: 'Strength' },
    'ยืดหยุ่น': { th: 'ยืดหยุ่น', en: 'Flexibility' },
    'อก & ไหล่': { th: 'อก & ไหล่', en: 'Chest & Shoulders' },
    'หลัง & แขน': { th: 'หลัง & แขน', en: 'Back & Arms' },
    'ขา & ก้น': { th: 'ขา & ก้น', en: 'Legs & Glutes' },
    'อก & แขน': { th: 'อก & แขน', en: 'Chest & Arms' },
    'คาร์ดิโอเบาๆ': { th: 'คาร์ดิโอเบาๆ', en: 'Light Cardio' },
    'พักผ่อน': { th: 'พักผ่อน', en: 'Rest' }
};

const exerciseNameTranslations = {
    'วิ่งเหยาะ (Jogging)': { th: 'วิ่งเหยาะ (Jogging)', en: 'Jogging' },
    'ปั่นจักรยาน': { th: 'ปั่นจักรยาน', en: 'Cycling' },
    'ยืดกล้ามเนื้อ (Cooldown)': { th: 'ยืดกล้ามเนื้อ (Cooldown)', en: 'Stretch (Cooldown)' },
    'โยคะเบื้องต้น': { th: 'โยคะเบื้องต้น', en: 'Intro to Yoga' },
    'ยืดกล้ามเนื้อ': { th: 'ยืดกล้ามเนื้อ', en: 'Stretching' },
    'ว่ายน้ำ หรือ เดินเร็ว': { th: 'ว่ายน้ำ หรือ เดินเร็ว', en: 'Swimming or Brisk Walk' },
    'หายใจลึก & ผ่อนคลาย': { th: 'หายใจลึก & ผ่อนคลาย', en: 'Deep Breathing & Relax' },
    'วิ่งเหยาะ': { th: 'วิ่งเหยาะ', en: 'Jogging' },
    'เดินเร็ว / วิ่งเหยาะ': { th: 'เดินเร็ว / วิ่งเหยาะ', en: 'Brisk Walk / Jogging' },
    'โยคะ': { th: 'โยคะ', en: 'Yoga' }
};

const foodNameTranslations = {
    'ข้าวกะเพราหมูสับ': 'Basil Fried Rice with Pork',
    'ข้าวผัดหมู': 'Pork Fried Rice',
    'ก๋วยเตี๋ยวหมูน้ำใส': 'Pork Noodle Soup',
    'ส้มตำไทย': 'Thai Papaya Salad (Som Tum)',
    'ข้าวเหนียวหมูปิ้ง': 'Grilled Pork with Sticky Rice',
    'ไก่ย่าง': 'Grilled Chicken',
    'ผัดไทยกุ้งสด': 'Pad Thai with Fresh Shrimp',
    'ข้าวไข่เจียว': 'Thai Omelet on Rice',
    'ข้าวหมูแดง': 'Red BBQ Pork Rice',
    'ยำวุ้นเส้น': 'Spicy Glass Noodle Salad'
};

function translateDayName(day, lang) {
    return dayTranslations[day] ? dayTranslations[day][lang] : day;
}

function translateTypeLabel(label, lang) {
    return typeLabelTranslations[label] ? typeLabelTranslations[label][lang] : label;
}

function translateExerciseName(name, lang) {
    if (lang === 'th') return name;
    if (exerciseNameTranslations[name]) return exerciseNameTranslations[name].en;
    
    const muscleMap = {
        'Bench Press': 'Bench Press',
        'Dumbbell Rows': 'Dumbbell Rows',
        'Shoulder Press': 'Shoulder Press',
        'Bicep Curls': 'Bicep Curls',
        'Stretching': 'Stretching',
        'Squats': 'Squats',
        'Deadlift': 'Deadlift',
        'Lunges': 'Lunges',
        'Leg Press': 'Leg Press',
        'Interval Training': 'Interval Training',
        'Full Body Circuit': 'Full Body Circuit',
        'Core Training': 'Core Training',
        'Cooldown & Stretch': 'Cooldown & Stretch',
        'HIIT (High Intensity)': 'HIIT (High Intensity)',
        'Circuit Training (Upper)': 'Circuit Training (Upper)',
        'Burpees': 'Burpees',
        'Mountain Climbers': 'Mountain Climbers',
        'วิ่ง Interval': 'Interval Running',
        'Jump Rope': 'Jump Rope',
        'Circuit Training (Lower)': 'Circuit Training (Lower)',
        'Box Jumps': 'Box Jumps',
        'Plank Variations': 'Plank Variations',
        'Active Recovery Walk': 'Active Recovery Walk',
        'Foam Rolling': 'Foam Rolling',
        'Incline Dumbbell Press': 'Incline Dumbbell Press',
        'Overhead Press': 'Overhead Press',
        'Lateral Raises': 'Lateral Raises',
        'Pull-ups / Lat Pulldown': 'Pull-ups / Lat Pulldown',
        'Barbell Rows': 'Barbell Rows',
        'Romanian Deadlift': 'Romanian Deadlift',
        'Calf Raises': 'Calf Raises',
        'Incline Bench Press': 'Incline Bench Press',
        'Cable Flyes': 'Cable Flyes',
        'Tricep Dips': 'Tricep Dips',
        'Hammer Curls': 'Hammer Curls',
        'Stretching & Recovery': 'Stretching & Recovery'
    };
    return muscleMap[name] || name;
}

function translateDuration(dur, lang) {
    if (lang === 'th') return dur;
    return dur
        .replace('นาที', ' mins')
        .replace('วิ', ' secs')
        .replace('ข้าง', '/side');
}

function translateFoodUnit(unit, lang) {
    if (lang === 'th') return unit;
    const unitMap = {
        'จาน': 'plate(s)',
        'ชาม': 'bowl(s)',
        'ชุด': 'set(s)',
        'ไม้': 'skewer(s)'
    };
    return unitMap[unit] || unit;
}

function switchLanguage(lang) {
    state.lang = lang;
    localStorage.setItem('fitlife_lang', lang);

    const btnTh = document.getElementById('lang-th');
    const btnEn = document.getElementById('lang-en');
    if (btnTh && btnEn) {
        if (lang === 'th') {
            btnTh.className = 'btn-lang active';
            btnTh.style.background = 'var(--gradient-primary)';
            btnTh.style.color = 'white';
            btnEn.className = 'btn-lang';
            btnEn.style.background = 'transparent';
            btnEn.style.color = 'var(--text-secondary)';
        } else {
            btnTh.className = 'btn-lang';
            btnTh.style.background = 'transparent';
            btnTh.style.color = 'var(--text-secondary)';
            btnEn.className = 'btn-lang active';
            btnEn.style.background = 'var(--gradient-primary)';
            btnEn.style.color = 'white';
        }
    }

    const dict = translations[lang];
    if (dict) {
        const mappings = {
            "nav-bmi": { selector: "#nav-bmi", prop: "innerHTML", prefix: "<span class=\"nav-icon\">⚖️</span> " },
            "nav-calories": { selector: "#nav-calories", prop: "innerHTML", prefix: "<span class=\"nav-icon\">🔥</span> " },
            "nav-schedule": { selector: "#nav-schedule", prop: "innerHTML", prefix: "<span class=\"nav-icon\">📅</span> " },
            "nav-food": { selector: "#nav-food", prop: "innerHTML", prefix: "<span class=\"nav-icon\">📸</span> " },
            "btnLoginNav": { selector: "#btnLoginNav", prop: "innerHTML", prefix: "<span>🔑</span> " },
            
            "hero-title-text": { selector: "#hero-title-text", prop: "innerHTML" },
            "hero-subtitle-text": { selector: "#hero-subtitle-text", prop: "textContent" },
            
            "tab-bmi-label": { selector: "#tab-bmi-label", prop: "textContent" },
            "tab-calories-label": { selector: "#tab-calories-label", prop: "textContent" },
            "tab-schedule-label": { selector: "#tab-schedule-label", prop: "textContent" },
            "tab-food-label": { selector: "#tab-food-label", prop: "textContent" },
            
            "bmi-section-title": { selector: "#section-bmi .section-title", prop: "textContent" },
            "bmi-section-desc": { selector: "#section-bmi .section-desc", prop: "textContent" },
            "bmi-form-header": { selector: "#section-bmi .form-card h3", prop: "textContent" },
            "bmi-label-weight": { selector: "label[for=\"bmi-weight\"]", prop: "textContent" },
            "bmi-label-height": { selector: "label[for=\"bmi-height\"]", prop: "textContent" },
            "btn-initial-bmi": { selector: "#btn-initial-bmi", prop: "innerHTML", prefix: "<span class=\"btn-icon\">⚖️</span> " },
            "bmi-result-header": { selector: "#bmi-result-card h3", prop: "textContent" },
            "bmi-placeholder-text": { selector: "#bmi-placeholder p", prop: "innerHTML" },
            "bmi-gauge-underweight": { selector: "#bmi-result-card .gauge-labels span:nth-child(1)", prop: "textContent" },
            "bmi-gauge-normal": { selector: "#bmi-result-card .gauge-labels span:nth-child(2)", prop: "textContent" },
            "bmi-gauge-overweight": { selector: "#bmi-result-card .gauge-labels span:nth-child(3)", prop: "textContent" },
            "bmi-gauge-obese": { selector: "#bmi-result-card .gauge-labels span:nth-child(4)", prop: "textContent" },
            "bmi-table-header": { selector: "#bmi-result-card .bmi-table h4", prop: "textContent" },
            "bmi-table-th-bmi": { selector: "#bmi-result-card table th:nth-child(1)", prop: "textContent" },
            "bmi-table-th-status": { selector: "#bmi-result-card table th:nth-child(2)", prop: "textContent" },
            "bmi-range-underweight": { selector: "#bmi-result-card table tbody tr:nth-child(1) td:nth-child(2)", prop: "textContent" },
            "bmi-range-normal": { selector: "#bmi-result-card table tbody tr:nth-child(2) td:nth-child(2)", prop: "textContent" },
            "bmi-range-overweight": { selector: "#bmi-result-card table tbody tr:nth-child(3) td:nth-child(2)", prop: "textContent" },
            "bmi-range-obese1": { selector: "#bmi-result-card table tbody tr:nth-child(4) td:nth-child(2)", prop: "textContent" },
            "bmi-range-obese2": { selector: "#bmi-result-card table tbody tr:nth-child(5) td:nth-child(2)", prop: "textContent" },

            "cal-section-title": { selector: "#section-calories .section-title", prop: "textContent" },
            "cal-section-desc": { selector: "#section-calories .section-desc", prop: "textContent" },
            "cal-form-header": { selector: "#section-calories .form-card h3", prop: "textContent" },
            "subtab-body": { selector: "#subtab-body", prop: "textContent" },
            "subtab-fat": { selector: "#subtab-fat", prop: "textContent" },
            "cal-label-weight": { selector: "label[for=\"cal-weight\"]", prop: "textContent" },
            "cal-label-height": { selector: "label[for=\"cal-height\"]", prop: "textContent" },
            "cal-label-age": { selector: "label[for=\"cal-age\"]", prop: "textContent" },
            "cal-label-gender": { selector: "#calorie-tab-body .form-group:nth-of-type(4) label", prop: "textContent" },
            "gender-male-text": { selector: "#gender-male", prop: "innerHTML", prefix: "<span class=\"gender-icon\">👨</span> " },
            "gender-female-text": { selector: "#gender-female", prop: "innerHTML", prefix: "<span class=\"gender-icon\">👩</span> " },
            "cal-label-weight-fat": { selector: "label[for=\"cal-weight-fat\"]", prop: "textContent" },
            "cal-label-fat-percent": { selector: "label[for=\"cal-fat-percent\"]", prop: "textContent" },
            "cal-label-activity": { selector: ".activity-group label", prop: "textContent" },
            "activity-sedentary-title": { selector: "#activity-sedentary strong", prop: "textContent" },
            "activity-sedentary-desc": { selector: "#activity-sedentary p", prop: "textContent" },
            "activity-light-title": { selector: "#activity-light strong", prop: "textContent" },
            "activity-light-desc": { selector: "#activity-light p", prop: "textContent" },
            "activity-moderate-title": { selector: "#activity-moderate strong", prop: "textContent" },
            "activity-moderate-desc": { selector: "#activity-moderate p", prop: "textContent" },
            "activity-very-title": { selector: "#activity-very strong", prop: "textContent" },
            "activity-very-desc": { selector: "#activity-very p", prop: "textContent" },
            "activity-extra-title": { selector: "#activity-extra strong", prop: "textContent" },
            "activity-extra-desc": { selector: "#activity-extra p", prop: "textContent" },
            "btn-initial-calorie": { selector: "#btn-initial-calorie", prop: "innerHTML", prefix: "<span class=\"btn-icon\">🔥</span> " },
            "cal-result-header": { selector: "#calorie-result-card h3", prop: "textContent" },
            "cal-placeholder-text": { selector: "#cal-placeholder p", prop: "innerHTML" },
            "cal-bmr-label": { selector: "#calorie-result-card .cal-bmr-box .cal-label", prop: "textContent" },
            "cal-tdee-label": { selector: "#calorie-result-card .cal-tdee-box .cal-label", prop: "textContent" },
            "cal-goals-title": { selector: "#calorie-result-card .cal-goals h4", prop: "textContent" },
            "cal-goal-lose-label": { selector: "#calorie-result-card .goal-lose .goal-label", prop: "textContent" },
            "cal-goal-lose-desc": { selector: "#calorie-result-card .goal-lose .goal-desc", prop: "textContent" },
            "cal-goal-maintain-label": { selector: "#calorie-result-card .goal-maintain .goal-label", prop: "textContent" },
            "cal-goal-maintain-desc": { selector: "#calorie-result-card .goal-maintain .goal-desc", prop: "textContent" },
            "cal-goal-gain-label": { selector: "#calorie-result-card .goal-gain .goal-label", prop: "textContent" },
            "cal-goal-gain-desc": { selector: "#calorie-result-card .goal-gain .goal-desc", prop: "textContent" },
            "cal-macro-title": { selector: "#calorie-result-card .cal-macro h4", prop: "textContent" },
            "cal-macro-protein": { selector: "#calorie-result-card .macro-item:nth-child(1) .macro-name", prop: "textContent" },
            "cal-macro-carbs": { selector: "#calorie-result-card .macro-item:nth-child(2) .macro-name", prop: "textContent" },
            "cal-macro-fat": { selector: "#calorie-result-card .macro-item:nth-child(3) .macro-name", prop: "textContent" },

            "schedule-section-title": { selector: "#section-schedule .section-title", prop: "textContent" },
            "schedule-section-desc": { selector: "#section-schedule .section-desc", prop: "textContent" },
            "goal-general-text": { selector: "#goal-general", prop: "innerHTML", prefix: "<span>💪</span> " },
            "goal-weight-loss-text": { selector: "#goal-weight-loss", prop: "innerHTML", prefix: "<span>📉</span> " },
            "goal-muscle-text": { selector: "#goal-muscle", prop: "innerHTML", prefix: "<span>🏋️</span> " },
            "intensity-light-text": { selector: "#intensity-light", prop: "textContent" },
            "intensity-medium-text": { selector: "#intensity-medium", prop: "textContent" },
            "intensity-heavy-text": { selector: "#intensity-heavy", prop: "textContent" },
            "legend-cardio": { selector: ".schedule-legend .legend-item:nth-child(1)", prop: "innerHTML", prefix: "<span class=\"legend-dot cardio\"></span> " },
            "legend-strength": { selector: ".schedule-legend .legend-item:nth-child(2)", prop: "innerHTML", prefix: "<span class=\"legend-dot strength\"></span> " },
            "legend-flexibility": { selector: ".schedule-legend .legend-item:nth-child(3)", prop: "innerHTML", prefix: "<span class=\"legend-dot flexibility\"></span> " },
            "legend-rest": { selector: ".schedule-legend .legend-item:nth-child(4)", prop: "innerHTML", prefix: "<span class=\"legend-dot rest\"></span> " },

            "food-section-title": { selector: "#section-food .section-title", prop: "textContent" },
            "food-section-desc": { selector: "#section-food .section-desc", prop: "textContent" },
            "food-upload-header": { selector: ".food-upload-card h3", prop: "textContent" },
            "upload-text": { selector: ".upload-text", prop: "textContent" },
            "upload-hint": { selector: ".upload-hint", prop: "textContent" },
            "btn-camera-text": { selector: "#btn-camera", prop: "innerHTML", prefix: "<span>📷</span> " },
            "btn-gallery-text": { selector: "#btn-gallery", prop: "innerHTML", prefix: "<span>🖼️</span> " },
            "food-label-manual-name": { selector: "#food-name-input-section label", prop: "textContent" },
            "manual-food-name-placeholder": { selector: "#manual-food-name", prop: "placeholder" },
            "food-divider-text": { selector: ".food-divider span", prop: "textContent" },
            "food-search-placeholder": { selector: "#food-search-input", prop: "placeholder" },
            "food-label-portion": { selector: "#food-portion-group label", prop: "textContent" },
            "btn-initial-analyze": { selector: "#btn-initial-analyze", prop: "innerHTML", prefix: "<span class=\"btn-icon\">🔬</span> " },
            "food-result-header": { selector: "#food-result-card h3", prop: "textContent" },
            "food-placeholder-text": { selector: "#food-placeholder p", prop: "innerHTML" },
            "food-macro-protein-label": { selector: "#food-result-card .protein .fmc-label", prop: "textContent" },
            "food-macro-carbs-label": { selector: "#food-result-card .carbs .fmc-label", prop: "textContent" },
            "food-macro-fat-label": { selector: "#food-result-card .fat .fmc-label", prop: "textContent" },
            "food-macro-fiber-label": { selector: "#food-result-card .fiber .fmc-label", prop: "textContent" },
            "food-extra-sugar": { selector: "#food-result-card .extra-item:nth-child(1) .extra-label", prop: "textContent" },
            "food-extra-sodium": { selector: "#food-result-card .extra-item:nth-child(2) .extra-label", prop: "textContent" },
            "food-extra-serving": { selector: "#food-result-card .extra-item:nth-child(3) .extra-label", prop: "textContent" },
            "food-daily-log-title": { selector: "#food-result-card .food-daily-log h4", prop: "textContent" },
            "btn-add-log-text": { selector: "#btn-add-log", prop: "innerHTML", prefix: "<span>➕</span> " },

            "login-modal-title": { selector: "#loginModal h3", prop: "textContent" },
            "login-label-username": { selector: "#loginModal label[for=\"login-username\"]", prop: "textContent" },
            "login-username-placeholder": { selector: "#login-username", prop: "placeholder" },
            "login-btn-submit": { selector: "#loginModal .btn-primary", prop: "innerHTML", prefix: "<span>🚀</span> " },

            "profile-modal-title": { selector: "#profileModal h3", prop: "textContent" },
            "avatar-overlay-text": { selector: "#avatarOverlayText", prop: "textContent" },
            "profile-token-title": { selector: "#profileModal .token-title", prop: "textContent" },
            "profile-claim-title": { selector: "#profileModal .claim-header h4", prop: "textContent" },
            "profile-claim-desc": { selector: "#profileModal .claim-desc", prop: "textContent" },
            "btn-claim-tokens": { selector: "#btn-claim-tokens", prop: "innerHTML", prefix: "<span>🎉</span> " },
            "profile-countdown-prefix": { selector: "#claim-timer-container span", prop: "textContent" },
            "profile-btn-topup": { selector: "#profileModal .btn-topup-trigger", prop: "innerHTML", prefix: "<span>💳</span> " },
            "profile-btn-logout": { selector: "#profileModal .btn-logout", prop: "innerHTML", prefix: "<span>🚪</span> " },

            "topup-modal-title": { selector: "#topupModal h3", prop: "textContent" },
            "topup-desc-single": { selector: "#topupModal p.topup-desc:nth-of-type(1)", prop: "textContent" },
            "topup-desc-sub": { selector: "#topupModal p.topup-desc:nth-of-type(2)", prop: "textContent" },

            "payment-modal-title": { selector: "#paymentModal h3", prop: "textContent" },
            "pay-amount-label": { selector: "#paymentModal .pay-amount-label", prop: "textContent" },
            "btn-confirm-payment": { selector: "#paymentModal .btn-primary", prop: "textContent" },
            "nav-analysis": { selector: "#nav-analysis", prop: "innerHTML", prefix: "<span class=\"nav-icon\">📊</span> " },
            "tab-analysis-label": { selector: "#tab-analysis-label", prop: "textContent" },
            "analysis-section-title": { selector: "#analysis-section-title", prop: "textContent" },
            "analysis-section-desc": { selector: "#analysis-section-desc", prop: "textContent" },
            "btn-mock-history": { selector: "#btn-mock-history", prop: "textContent" },
            "lbl-analysis-avg-cal": { selector: "#lbl-analysis-avg-cal", prop: "textContent" },
            "lbl-analysis-goal-rate": { selector: "#lbl-analysis-goal-rate", prop: "textContent" },
            "lbl-analysis-weight-est": { selector: "#lbl-analysis-weight-est", prop: "textContent" },
            "lbl-analysis-chart-title": { selector: "#lbl-analysis-chart-title", prop: "textContent" },
            "lbl-analysis-insight-title": { selector: "#lbl-analysis-insight-title", prop: "textContent" },
            "lbl-analysis-avg-unit": { selector: "#lbl-analysis-avg-unit", prop: "textContent" },
            "lbl-analysis-weight-unit": { selector: "#lbl-analysis-weight-unit", prop: "textContent" },
            "lbl-custom-target": { selector: "#lbl-custom-target", prop: "textContent" },
            "custom-calorie-target": { selector: "#custom-calorie-target", prop: "placeholder" }
        };

        for (const [key, map] of Object.entries(mappings)) {
            const val = dict[key];
            if (val !== undefined) {
                try {
                    const el = document.querySelector(map.selector);
                    if (el) {
                        const prefix = map.prefix || '';
                        if (map.prop === 'innerHTML') {
                            el.innerHTML = prefix + val;
                        } else if (map.prop === 'placeholder') {
                            el.placeholder = val;
                        } else {
                            el.textContent = prefix + val;
                        }
                    }
                } catch (e) {
                    console.error("Translation fail for selector " + map.selector, e);
                }
            }
        }
        
        document.querySelectorAll('#topupModal .packages-grid:nth-of-type(1) .package-item').forEach((item, index) => {
            const badges = {
                th: ['ยอดนิยม 🔥', 'คุ้มค่า ⚡', 'เซฟหนัก 💎', 'สุดคุ้ม ⭐'],
                en: ['Popular 🔥', 'Value ⚡', 'Saver 💎', 'Best Value ⭐']
            };
            const prices = [19, 49, 179, 399];
            const tokens = [50, 150, 500, 1000];
            const badgeEl = item.querySelector('.package-badge');
            const tokenEl = item.querySelector('.package-tokens');
            const priceEl = item.querySelector('.package-price');
            if (badgeEl) badgeEl.textContent = badges[lang][index];
            if (tokenEl) tokenEl.textContent = `💎 ${tokens[index]}`;
            if (priceEl) priceEl.textContent = lang === 'th' ? `${prices[index]} บาท` : `${prices[index]} Baht`;
        });

        document.querySelectorAll('#topupModal .packages-grid:nth-of-type(2) .package-item').forEach((item, index) => {
            const badges = {
                th: ['แนะนำ ⭐', 'สุดคุ้ม 💖'],
                en: ['Hot ⭐', 'Best Deal 💖']
            };
            const names = {
                th: ['พรีเมี่ยม 7 วัน', 'พรีเมี่ยม 30 วัน'],
                en: ['7-Day Premium', '30-Day Premium']
            };
            const prices = [179, 499];
            const badgeEl = item.querySelector('.package-badge');
            const tokenEl = item.querySelector('.package-tokens');
            const priceEl = item.querySelector('.package-price');
            if (badgeEl) badgeEl.textContent = badges[lang][index];
            if (tokenEl) tokenEl.textContent = `📅 ${names[lang][index]}`;
            if (priceEl) priceEl.textContent = lang === 'th' ? `${prices[index]} บาท` : `${prices[index]} Baht`;
        });
    }

    renderSchedule();
    if (state.user) {
        updateDailyLogUI();
        updateSubscriptionUI();
    }
}

// ===== Overall Analysis Section Logic =====
function updateHistoryWithTodayCalories() {
    if (!state.user) return;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    const totalCal = dailyFoodLog.reduce((sum, item) => sum + item.totalCal, 0);
    
    let currentWeight = 70;
    const bmiWeightEl = document.getElementById('bmi-weight');
    const calWeightEl = document.getElementById('cal-weight');
    if (bmiWeightEl && bmiWeightEl.value) {
        currentWeight = parseFloat(bmiWeightEl.value);
    } else if (calWeightEl && calWeightEl.value) {
        currentWeight = parseFloat(calWeightEl.value);
    }
    
    let entry = state.historyLog.find(item => item.date === todayStr);
    if (entry) {
        entry.cal = totalCal;
        entry.weight = currentWeight;
    } else {
        state.historyLog.push({
            date: todayStr,
            cal: totalCal,
            weight: currentWeight
        });
    }
    
    state.historyLog.sort((a, b) => a.date.localeCompare(b.date));
    
    const userHistoryKey = `fitlife_user_history_${state.user.toLowerCase()}`;
    localStorage.setItem(userHistoryKey, JSON.stringify(state.historyLog));
    
    renderAnalysisDashboard();
}

function changeAnalysisTimeframe(days) {
    state.analysisTimeframe = days;
    
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'transparent';
        btn.style.color = 'var(--text-secondary)';
        btn.style.fontWeight = '600';
    });
    
    const activeBtn = document.getElementById(`tf-${days === 'all' ? 'all' : days + 'd'}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.background = 'var(--gradient-primary)';
        activeBtn.style.color = 'white';
        activeBtn.style.fontWeight = '700';
    }
    
    renderAnalysisDashboard();
}

function getActiveCalorieTarget() {
    if (state.customCalorieTarget && state.customCalorieTarget > 0) {
        return state.customCalorieTarget;
    }
    const tdeeValueEl = document.getElementById('cal-tdee-value');
    if (tdeeValueEl && !tdeeValueEl.parentElement.parentElement.classList.contains('hidden')) {
        const val = parseFloat(tdeeValueEl.textContent);
        if (!isNaN(val) && val > 0) return val;
    }
    return 2000;
}

function updateCustomCalorieTarget(val) {
    if (!state.user) return;
    const intVal = parseInt(val);
    if (!isNaN(intVal) && intVal > 0) {
        state.customCalorieTarget = intVal;
        const userCustomTargetKey = `fitlife_user_custom_target_${state.user.toLowerCase()}`;
        localStorage.setItem(userCustomTargetKey, intVal);
    } else {
        state.customCalorieTarget = null;
        const userCustomTargetKey = `fitlife_user_custom_target_${state.user.toLowerCase()}`;
        localStorage.removeItem(userCustomTargetKey);
    }
    renderAnalysisDashboard();
}

function generateMockHistoryData() {
    if (!state.user) {
        const lang = state.lang || 'th';
        showToast(lang === 'th' ? '⚠️ กรุณาเข้าสู่ระบบก่อนสร้างข้อมูลจำลอง' : '⚠️ Please login before generating mock data');
        openLoginModal();
        return;
    }
    
    const targetCal = getActiveCalorieTarget();
    const mockLog = [];
    const now = new Date();
    
    let currentWeight = 70;
    const bmiWeightEl = document.getElementById('bmi-weight');
    const calWeightEl = document.getElementById('cal-weight');
    if (bmiWeightEl && bmiWeightEl.value) {
        currentWeight = parseFloat(bmiWeightEl.value);
    } else if (calWeightEl && calWeightEl.value) {
        currentWeight = parseFloat(calWeightEl.value);
    }
    
    for (let i = 59; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const rand = Math.random();
        let dailyCal = targetCal;
        
        if (rand < 0.4) {
            dailyCal = Math.round(targetCal - 100 - Math.random() * 300);
        } else if (rand < 0.7) {
            dailyCal = Math.round(targetCal + (Math.random() - 0.5) * 200);
        } else {
            dailyCal = Math.round(targetCal + 150 + Math.random() * 350);
        }
        
        const calorieDiff = dailyCal - targetCal;
        const weightDiff = calorieDiff / 7700;
        currentWeight += weightDiff;
        
        const weightFluctuation = (Math.random() - 0.5) * 0.3;
        const displayWeight = Math.round((currentWeight + weightFluctuation) * 10) / 10;
        
        mockLog.push({
            date: dateStr,
            cal: Math.max(800, dailyCal),
            weight: displayWeight
        });
    }
    
    state.historyLog = mockLog;
    state.historyLog.sort((a, b) => a.date.localeCompare(b.date));
    
    const userHistoryKey = `fitlife_user_history_${state.user.toLowerCase()}`;
    localStorage.setItem(userHistoryKey, JSON.stringify(state.historyLog));
    
    renderAnalysisDashboard();
    
    const lang = state.lang || 'th';
    showToast(lang === 'th' ? '⚙️ จำลองประวัติย้อนหลัง 60 วันสำเร็จแล้ว!' : '⚙️ Successfully generated 60 days of mock history!');
}

function renderAnalysisDashboard() {
    const lang = state.lang || 'th';
    
    const insightContent = document.getElementById('analysis-insight-content');
    const chartWrapper = document.getElementById('analysis-chart-wrapper');
    const valAvgCal = document.getElementById('val-analysis-avg-cal');
    const valGoalRate = document.getElementById('val-analysis-goal-rate');
    const valWeightEst = document.getElementById('val-analysis-weight-est');
    
    if (!state.user) {
        if (valAvgCal) valAvgCal.textContent = '0';
        if (valGoalRate) valGoalRate.textContent = '0';
        if (valWeightEst) valWeightEst.textContent = '-0.0';
        if (chartWrapper) {
            chartWrapper.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary); text-align: center; font-family: var(--font-thai);">
                    <span style="font-size: 3rem; margin-bottom: 10px;">📊</span>
                    <p>${lang === 'th' ? 'กรุณาเข้าสู่ระบบเพื่อดูการวิเคราะห์ภาพรวมย้อนหลัง' : 'Please login to view your overall analysis'}</p>
                    <button class="btn-primary" onclick="openLoginModal()" style="margin-top: 15px; padding: 8px 20px;">${lang === 'th' ? 'เข้าสู่ระบบ' : 'Login'}</button>
                </div>
            `;
        }
        if (insightContent) {
            insightContent.innerHTML = `<p style="text-align: center; color: var(--text-muted);">${lang === 'th' ? 'ไม่มีข้อมูลการวิเคราะห์เนื่องจากยังไม่ได้เข้าสู่ระบบ' : 'No analysis data available because you are not logged in.'}</p>`;
        }
        return;
    }
    
    const timeframe = state.analysisTimeframe;
    let filteredLog = [...state.historyLog];
    
    if (timeframe !== 'all') {
        const limitDays = parseInt(timeframe);
        const now = new Date();
        const cutoffDate = new Date(now.getTime() - limitDays * 24 * 60 * 60 * 1000);
        const cutoffStr = cutoffDate.toISOString().split('T')[0];
        filteredLog = filteredLog.filter(item => item.date >= cutoffStr);
    }
    
    if (filteredLog.length === 0) {
        if (valAvgCal) valAvgCal.textContent = '0';
        if (valGoalRate) valGoalRate.textContent = '0';
        if (valWeightEst) valWeightEst.textContent = '-0.0';
        if (chartWrapper) {
            chartWrapper.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary); text-align: center; font-family: var(--font-thai);">
                    <span style="font-size: 3rem; margin-bottom: 10px;">📈</span>
                    <p>${lang === 'th' ? 'ยังไม่มีข้อมูลประวัติในระบบ กดปุ่มจำลองประวัติย้อนหลัง หรือเพิ่มบันทึกอาหารวันนี้เพื่อเริ่มแสดงผล' : 'No history data yet. Click Mock History or log today\'s food to start'}</p>
                </div>
            `;
        }
        if (insightContent) {
            insightContent.innerHTML = `<p style="text-align: center; color: var(--text-muted);">${lang === 'th' ? 'กรุณาบันทึกอาหารหรือสุ่มข้อมูลเพื่อดูข้อแนะนำสุขภาพ' : 'Please log food or generate mock data to see health recommendations.'}</p>`;
        }
        return;
    }
    
    const targetCal = getActiveCalorieTarget();
    const totalCalSum = filteredLog.reduce((sum, item) => sum + item.cal, 0);
    const avgCal = Math.round(totalCalSum / filteredLog.length);
    
    const successDays = filteredLog.filter(item => item.cal > 0 && item.cal <= targetCal).length;
    const activeDaysCount = filteredLog.filter(item => item.cal > 0).length || 1;
    const goalRate = Math.round((successDays / activeDaysCount) * 100);
    
    let weightDiff = 0;
    if (filteredLog.length >= 2) {
        const firstWeight = filteredLog[0].weight;
        const lastWeight = filteredLog[filteredLog.length - 1].weight;
        weightDiff = Math.round((lastWeight - firstWeight) * 10) / 10;
    } else {
        const netDeficit = filteredLog.reduce((sum, item) => sum + (item.cal - targetCal), 0);
        weightDiff = Math.round((netDeficit / 7700) * 10) / 10;
    }
    
    if (valAvgCal) valAvgCal.textContent = avgCal.toLocaleString();
    if (valGoalRate) {
        valGoalRate.textContent = goalRate;
        if (goalRate >= 70) {
            valGoalRate.parentElement.style.color = 'var(--accent-success)';
        } else if (goalRate >= 40) {
            valGoalRate.parentElement.style.color = 'var(--accent-warning)';
        } else {
            valGoalRate.parentElement.style.color = 'var(--accent-pink)';
        }
    }
    if (valWeightEst) {
        const sign = weightDiff >= 0 ? '+' : '';
        valWeightEst.textContent = `${sign}${weightDiff.toFixed(1)}`;
        if (weightDiff < 0) {
            valWeightEst.parentElement.style.color = 'var(--accent-success)';
        } else if (weightDiff === 0) {
            valWeightEst.parentElement.style.color = 'var(--text-primary)';
        } else {
            valWeightEst.parentElement.style.color = 'var(--accent-pink)';
        }
    }
    
    const containerHeight = 240;
    const containerWidth = chartWrapper.parentElement.clientWidth || 800;
    
    const barSpacing = 40;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 30;
    const paddingBottom = 40;
    
    const minWidth = filteredLog.length * barSpacing + paddingLeft + paddingRight;
    const chartWidth = Math.max(containerWidth, minWidth);
    
    chartWrapper.style.width = `${chartWidth}px`;
    chartWrapper.style.height = `${containerHeight}px`;
    
    const maxCalInLog = Math.max(...filteredLog.map(item => item.cal));
    const yMax = Math.max(maxCalInLog, targetCal * 1.3, 1500);
    
    const chartHeight = containerHeight - paddingTop - paddingBottom;
    const usableWidth = chartWidth - paddingLeft - paddingRight;
    
    let barsSvg = '';
    const barWidth = 18;
    
    filteredLog.forEach((item, index) => {
        const x = paddingLeft + (index / (filteredLog.length || 1)) * usableWidth + (usableWidth / filteredLog.length - barWidth) / 2;
        const barHeight = (item.cal / yMax) * chartHeight;
        const y = containerHeight - paddingBottom - barHeight;
        
        const isUnder = item.cal <= targetCal;
        const color = isUnder ? 'url(#greenGrad)' : 'url(#redGrad)';
        
        const dateObj = new Date(item.date);
        const dayNum = dateObj.getDate();
        const monthShort = dateObj.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { month: 'short' });
        const labelText = `${dayNum} ${monthShort}`;
        
        barsSvg += `
            <g class="chart-bar-group" style="cursor: pointer;">
                <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="${color}" style="transition: all 0.3s ease;">
                    <title>${item.date}\nCal: ${item.cal} kcal\nWeight: ${item.weight} kg</title>
                </rect>
                <text x="${x + barWidth/2}" y="${containerHeight - 15}" font-size="10" fill="var(--text-muted)" text-anchor="middle" font-family="var(--font-thai)">${labelText}</text>
                <text x="${x + barWidth/2}" y="${y - 8}" font-size="9" fill="var(--text-secondary)" font-weight="600" text-anchor="middle">${item.cal}</text>
            </g>
        `;
    });
    
    const targetY = containerHeight - paddingBottom - (targetCal / yMax) * chartHeight;
    const targetLineSvg = `
        <g>
            <line x1="${paddingLeft}" y1="${targetY}" x2="${chartWidth - paddingRight}" y2="${targetY}" stroke="var(--accent-warning)" stroke-width="2" stroke-dasharray="4,4" />
            <text x="${chartWidth - paddingRight - 10}" y="${targetY - 6}" font-size="10" font-weight="700" fill="var(--accent-warning)" text-anchor="end" font-family="var(--font-thai)">
                ${lang === 'th' ? `เป้าหมาย: ${targetCal} แคล` : `Target: ${targetCal} kcal`}
            </text>
        </g>
    `;
    
    chartWrapper.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 ${chartWidth} ${containerHeight}" preserveAspectRatio="none">
            <defs>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#10B981" />
                    <stop offset="100%" stop-color="#059669" />
                </linearGradient>
                <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#EF4444" stop-opacity="0.9" />
                    <stop offset="100%" stop-color="#DC2626" stop-opacity="0.9" />
                </linearGradient>
            </defs>
            <line x1="${paddingLeft}" y1="${containerHeight - paddingBottom}" x2="${chartWidth - paddingRight}" y2="${containerHeight - paddingBottom}" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
            <line x1="${paddingLeft}" y1="${paddingTop}" x2="${chartWidth - paddingRight}" y2="${paddingTop}" stroke="rgba(255,255,255,0.05)" stroke-width="1" stroke-dasharray="2,2" />
            ${barsSvg}
            ${targetLineSvg}
        </svg>
    `;
    
    let insightHtml = '';
    const successPercent = goalRate;
    
    if (lang === 'th') {
        let bmiStatusText = "";
        const bmiNumberEl = document.getElementById('bmi-number');
        if (bmiNumberEl && parseFloat(bmiNumberEl.textContent) > 0) {
            const bmi = parseFloat(bmiNumberEl.textContent);
            const statusObj = getBMIStatus(bmi);
            bmiStatusText = ` ปัจจุบันดัชนีมวลกาย (BMI) ของคุณจัดอยู่ในกลุ่ม <strong>"${statusObj.label}"</strong>`;
        }
        
        if (successPercent >= 70) {
            insightHtml = `
                <div style="display: flex; gap: 15px; align-items: flex-start; background: rgba(16, 185, 129, 0.08); border-left: 4px solid var(--accent-success); padding: 15px; border-radius: var(--radius-md);">
                    <span style="font-size: 1.5rem;">🎉</span>
                    <div>
                        <strong style="color: var(--accent-success); display: block; margin-bottom: 5px;">ยอดเยี่ยมมาก! คุณรักษาวินัยการกินได้ดีเยี่ยม</strong>
                        <span>คุณสามารถควบคุมพลังงานให้อยู่ในเกณฑ์เป้าหมายได้ถึง <strong>${successPercent}%</strong> ของจำนวนวันทั้งหมดในรอบนี้${bmiStatusText} การควบคุมแคลอรี่ที่มีประสิทธิภาพนี้จะช่วยให้ร่างกายของคุณพัฒนาไปในทิศทางที่ต้องการได้อย่างมั่นคง แนะนำให้เสริมการเวทเทรนนิ่งเพื่อสร้างกล้ามเนื้อและดื่มน้ำให้เพียงพอ</span>
                    </div>
                </div>
            `;
        } else if (successPercent >= 40) {
            insightHtml = `
                <div style="display: flex; gap: 15px; align-items: flex-start; background: rgba(245, 158, 11, 0.08); border-left: 4px solid var(--accent-warning); padding: 15px; border-radius: var(--radius-md);">
                    <span style="font-size: 1.5rem;">⚠️</span>
                    <div>
                        <strong style="color: var(--accent-warning); display: block; margin-bottom: 5px;">ทำได้ดีพอสมควร แต่มีบางวันที่กินพลังงานเกินเป้าหมาย</strong>
                        <span>คุณคุมอาหารได้สำเร็จ <strong>${successPercent}%</strong> ในช่วงเวลานี้ มีบางวันที่ได้รับแคลอรี่สะสมเกินเกณฑ์ TDEE${bmiStatusText} แนะนำให้ลองปรับสัดส่วนอาหารประเภทโปรตีนและไฟเบอร์สูงในวันที่ออกกำลังกายหนักเพื่อช่วยให้อิ่มนานขึ้น และจำกัดอาหารประเภทน้ำตาลโซเดียมลง</span>
                    </div>
                </div>
            `;
        } else {
            insightHtml = `
                <div style="display: flex; gap: 15px; align-items: flex-start; background: rgba(239, 68, 68, 0.08); border-left: 4px solid var(--accent-pink); padding: 15px; border-radius: var(--radius-md);">
                    <span style="font-size: 1.5rem;">💡</span>
                    <div>
                        <strong style="color: var(--accent-pink); display: block; margin-bottom: 5px;">ควรปรับปรุงการกินพลังงาน และควบคุมปริมาณอาหารให้บ่อยขึ้น</strong>
                        <span>อัตราการควบคุมอาหารให้อยู่ในเป้าหมายของคุณอยู่ที่ <strong>${successPercent}%</strong> เท่านั้น ซึ่งทำให้มีแคลอรี่ส่วนเกินสะสมค่อนข้างมาก${bmiStatusText} แนะนำให้เริ่มต้นใหม่ง่ายๆ โดยบันทึกอาหารทุกมื้ออย่างละเอียด และพยายามเลือกทานอาหารปรุงแต่งน้อย (Whole Foods) เพื่อช่วยลดแคลอรี่สะสมต่อวันลง</span>
                    </div>
                </div>
            `;
        }
    } else {
        let bmiStatusText = "";
        const bmiNumberEl = document.getElementById('bmi-number');
        if (bmiNumberEl && parseFloat(bmiNumberEl.textContent) > 0) {
            const bmi = parseFloat(bmiNumberEl.textContent);
            const statusObj = getBMIStatus(bmi);
            bmiStatusText = ` Currently, your Body Mass Index (BMI) is in the <strong>"${statusObj.label}"</strong> category.`;
        }
        
        if (successPercent >= 70) {
            insightHtml = `
                <div style="display: flex; gap: 15px; align-items: flex-start; background: rgba(16, 185, 129, 0.08); border-left: 4px solid var(--accent-success); padding: 15px; border-radius: var(--radius-md);">
                    <span style="font-size: 1.5rem;">🎉</span>
                    <div>
                        <strong style="color: var(--accent-success); display: block; margin-bottom: 5px;">Excellent work! Superb diet discipline.</strong>
                        <span>You successfully kept your calories within the target <strong>${successPercent}%</strong> of the days in this period.${bmiStatusText} Keeping this up will yield great progress toward your goals. We recommend incorporating strength training to build muscle mass and staying hydrated.</span>
                    </div>
                </div>
            `;
        } else if (successPercent >= 40) {
            insightHtml = `
                <div style="display: flex; gap: 15px; align-items: flex-start; background: rgba(245, 158, 11, 0.08); border-left: 4px solid var(--accent-warning); padding: 15px; border-radius: var(--radius-md);">
                    <span style="font-size: 1.5rem;">⚠️</span>
                    <div>
                        <strong style="color: var(--accent-warning); display: block; margin-bottom: 5px;">Fair progress, but watch out for high-calorie days.</strong>
                        <span>You met your calorie goal <strong>${successPercent}%</strong> of the time.${bmiStatusText} Some days exceeded your target/TDEE limits. Consider increasing lean protein and fiber intake on active days to feel full longer and avoid snacking.</span>
                    </div>
                </div>
            `;
        } else {
            insightHtml = `
                <div style="display: flex; gap: 15px; align-items: flex-start; background: rgba(239, 68, 68, 0.08); border-left: 4px solid var(--accent-pink); padding: 15px; border-radius: var(--radius-md);">
                    <span style="font-size: 1.5rem;">💡</span>
                    <div>
                        <strong style="color: var(--accent-pink); display: block; margin-bottom: 5px;">Action required: Calibrate food portions.</strong>
                        <span>You met your calorie goal only <strong>${successPercent}%</strong> of the time in this timeframe.${bmiStatusText} Focus on tracking every meal and prioritizing nutrient-dense whole foods to safely reduce daily calorie intake.</span>
                    </div>
                </div>
            `;
        }
    }
    
    if (insightContent) {
        insightContent.innerHTML = insightHtml;
    }
}

