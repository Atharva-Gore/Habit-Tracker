const habitForm = document.getElementById("habitForm");
const habitInput = document.getElementById("habitInput");
const habitList = document.getElementById("habitList");
const progressBar = document.getElementById("progressBar");
const toggleThemeBtn = document.getElementById("toggleTheme");

let habits = JSON.parse(localStorage.getItem("habits")) || [];

function saveHabits() {
  localStorage.setItem("habits", JSON.stringify(habits));
}

function getTodayKey() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

function toggleHabit(index) {
  const today = getTodayKey();
  const habit = habits[index];
  habit.completed[today] = !habit.completed[today];
  updateStreak(habit);
  saveHabits();
  renderHabits();
}

function updateStreak(habit) {
  const today = getTodayKey();
  if (habit.completed[today]) {
    habit.streak = (habit.streak || 0) + 1;
  } else {
    habit.streak = Math.max(0, (habit.streak || 1) - 1);
  }
}

function deleteHabit(index) {
  habits.splice(index, 1);
  saveHabits();
  renderHabits();
}

function renderHabits() {
  habitList.innerHTML = "";
  const today = getTodayKey();
  let completedCount = 0;

  habits.forEach((habit, index) => {
    const habitEl = document.createElement("div");
    habitEl.className = "habit";

    const label = document.createElement("label");
    label.textContent = habit.name;

    const actions = document.createElement("div");
    actions.className = "actions";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = habit.completed[today] || false;
    checkbox.addEventListener("change", () => toggleHabit(index));

    const streak = document.createElement("span");
    streak.className = "streak";
    streak.textContent = `🔥 ${habit.streak || 0}`;

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️";
    delBtn.onclick = () => deleteHabit(index);

    actions.appendChild(checkbox);
    actions.appendChild(streak);
    actions.appendChild(delBtn);

    habitEl.appendChild(label);
    habitEl.appendChild(actions);

    habitList.appendChild(habitEl);

    if (habit.completed[today]) completedCount++;
  });

  updateProgressBar(completedCount);
  updateChart();
}

function updateProgressBar(done) {
  const total = habits.length;
  const percent = total ? (done / total) * 100 : 0;
  progressBar.value = percent;
}

habitForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = habitInput.value.trim();
  if (!name) return;

  habits.push({ name, completed: {}, streak: 0 });
  habitInput.value = "";
  saveHabits();
  renderHabits();
});

toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
});

function updateChart() {
  const ctx = document.getElementById("chartCanvas").getContext("2d");
  const today = new Date();
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    days.push(key);
  }

  const data = days.map(date =>
    habits.reduce((sum, h) => sum + (h.completed[date] ? 1 : 0), 0)
  );

  if (window.chartInstance) window.chartInstance.destroy();

  window.chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: days.map(d => d.slice(5)),
      datasets: [{
        label: "# of Habits Completed",
        data,
        backgroundColor: "#00adb5",
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, precision: 0 }
      }
    }
  });
}

// Initialize
renderHabits();
