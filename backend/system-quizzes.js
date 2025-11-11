// system-quizzes.js
// Ana sayfada gösterilecek sistem quizlerini yükler ve kart olarak listeler

const systemQuizList = [
 {
    file: '/quizzes/English.json',
    id: 'system-english',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>',
    color: 'from-blue-600 to-blue-800'
  },
  {
    file: '/quizzes/Philosophy.json',
    id: 'system-philosophy',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>',
    color: 'from-purple-600 to-purple-800'
  },
  {
    file: '/quizzes/Literature.json',
    id: 'system-literature',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>',
    color: 'from-green-600 to-green-800'
  },
  {
    file: '/quizzes/Geography.json',
    id: 'system-geography',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
    color: 'from-amber-600 to-amber-800'
  }
];

async function fetchSystemQuiz(file) {
  const res = await fetch(file);
  return res.json();
}

async function renderSystemQuizzes() {
  const container = document.getElementById('system-quiz-list');
  if (!container) return;
  let html = '';
  for (const quizMeta of systemQuizList) {
    try {
      const quiz = await fetchSystemQuiz(quizMeta.file);
      html += `
      <div class="bg-gradient-to-r ${quizMeta.color} w-full p-6 rounded-xl shadow-lg flex items-center justify-between group transition cursor-pointer hover:shadow-xl transform hover:scale-105 hover:opacity-95" data-system-id="${quizMeta.id}">
        <div class="flex items-center gap-4">
          <div class="text-white opacity-80 group-hover:opacity-100 transition">
            ${quizMeta.icon}
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-lg text-white group-hover:text-gray-100">${quiz.quizName}</span>
            <span class="text-sm text-white opacity-75">System Quiz</span>
            <span class="text-xs text-white opacity-60 mt-1">${quiz.quizDescription || ''}</span>
          </div>
        </div>
        <div class="text-white opacity-70 group-hover:opacity-100 transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </div>
      </div>
      `;
    } catch (e) {
      html += `<div class="bg-gray-800 p-4 rounded-lg shadow">Quiz could not be loaded: ${quizMeta.file}</div>`;
    }
  }
  container.innerHTML = html;
  // Kartların tamamı tıklanabilir ve modal açar
  container.querySelectorAll('[data-system-id]').forEach(card => {
    card.addEventListener('click', function(e) {
      e.preventDefault();
      const id = this.getAttribute('data-system-id');
      window.open(`quiz-solve.html?system=${id}`, '_blank');
    });
    card.style.userSelect = 'none';
  });
}

// Modal açma ve quiz gösterme fonksiyonu
function showSystemQuizModal(quiz) {
  const modal = document.getElementById('system-quiz-modal');
  const content = document.getElementById('system-quiz-modal-content');
  if (!modal || !content) return;
  let html = `<h2 class="text-2xl font-bold mb-4 text-center">${quiz.quizName}</h2>`;
  html += `<div class="text-center text-gray-400 mb-6">${quiz.quizDescription || ''}</div>`;
  quiz.questions.forEach((q, idx) => {
    html += `<div class="bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-md mx-auto mb-8">
      <h3 class="text-lg font-semibold mb-4">Question ${idx+1}:</h3>
      <p class="mb-6">${q.question}</p>
      <div class="space-y-3">`;
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    q.options.forEach((opt, i) => {
      html += `<button type="button" class="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition option-btn" data-q="${idx}" data-i="${i}">${labels[i]}. ${opt}</button>`;
    });
    html += `</div></div>`;
  });
  html += `<div class="mt-6 text-center">
    <button id="finish-system-quiz" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold">Finish Quiz</button>
    <div id="system-quiz-result" class="mt-4 text-lg font-semibold hidden"></div>
  </div>`;
  content.innerHTML = html;
  modal.classList.remove('hidden');

  // Seçim işlemleri
  content.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const qIdx = this.getAttribute('data-q');
      content.querySelectorAll(`.option-btn[data-q='${qIdx}']`).forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white', 'bg-red-600', 'bg-green-600');
        b.removeAttribute('data-selected');
      });
      this.classList.add('bg-blue-600', 'text-white');
      this.setAttribute('data-selected', 'true');
    });
  });

  // Quiz bitir butonu
  const finishBtn = content.querySelector('#finish-system-quiz');
  if (finishBtn) {
    finishBtn.onclick = function() {
      let score = 0;
      let total = quiz.questions.length;
      quiz.questions.forEach((q, idx) => {
        const selectedBtn = content.querySelector(`.option-btn[data-q='${idx}'][data-selected='true']`);
        const optionBtns = content.querySelectorAll(`.option-btn[data-q='${idx}']`);
        optionBtns.forEach(b => b.classList.remove('bg-green-600', 'bg-red-600', 'bg-blue-600', 'text-white'));
        let answerIdx = typeof q.answer === 'number' ? q.answer : q.options.findIndex(opt => opt === q.answer);
        if (selectedBtn) {
          if (parseInt(selectedBtn.getAttribute('data-i')) === answerIdx) {
            score++;
            selectedBtn.classList.add('bg-green-600', 'text-white');
          } else {
            selectedBtn.classList.add('bg-red-600', 'text-white');
            optionBtns[answerIdx].classList.add('bg-green-600', 'text-white');
          }
        } else {
          optionBtns[answerIdx].classList.add('bg-green-600', 'text-white');
        }
      });
      const resultDiv = content.querySelector('#system-quiz-result');
      resultDiv.textContent = `Result: ${score} / ${total} correct! Score: ${Math.round((score/total)*100)}%`;
      resultDiv.classList.remove('hidden');
    };
  }
}

// Modal kapatma
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('close-system-quiz-modal');
  const modal = document.getElementById('system-quiz-modal');
  if (closeBtn && modal) {
    closeBtn.onclick = () => {
      modal.classList.add('hidden');
    };
  }
  // Modal dışında tıklayınca da kapansın
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  }
});

document.addEventListener('DOMContentLoaded', renderSystemQuizzes);
