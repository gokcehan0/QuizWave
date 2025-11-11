// Quiz çözme sayfası
const urlParams = new URLSearchParams(window.location.search);
const quizId = urlParams.get('id');
const systemQuizId = urlParams.get('system');

if (systemQuizId) {
  // Sistem quizlerini JSON'dan yükle
  const fileMap = {
    'system-philosophy': '/quizzes/Philosophy.json',
    'system-literature': '/quizzes/Literature.json',
    'system-geography': '/quizzes/Geography.json',
    'system-english': '/quizzes/English.json'

  };
  const file = fileMap[systemQuizId];
  if (!file) {
    document.getElementById('quiz-content').innerHTML = '<div class="text-red-400">Quiz not found.</div>';
  } else {
    fetch(file).then(res => res.json()).then(quiz => {
      document.getElementById('quiz-title').textContent = quiz.quizName;
      let html = '';
      quiz.questions.forEach((q, idx) => {
        html += `<div class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 w-full max-w-xl mb-6 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          <div class="bg-gray-700/50 backdrop-blur-sm p-4 rounded-xl mb-4 border border-gray-600/50">
            <p class="text-base leading-relaxed text-gray-200">${q.question}</p>
          </div>
          <div class="grid gap-2">`;
        const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
        q.options.forEach((opt, i) => {
          html += `<button type="button" class="group w-full bg-gray-700/70 hover:bg-gray-600/80 border border-gray-600 hover:border-gray-500 px-4 py-3 rounded-lg transition-all duration-200 option-btn text-left relative overflow-hidden" data-q="${idx}" data-i="${i}">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <div class="relative flex items-center">
              <span class="bg-gray-600 group-hover:bg-gray-500 text-white font-semibold w-7 h-7 rounded-md flex items-center justify-center mr-3 text-sm transition-colors duration-200">${labels[i]}</span>
              <span class="text-gray-200 group-hover:text-white transition-colors duration-200 text-sm">${opt}</span>
            </div>
          </button>`;
        });
        html += `</div></div>`;
      });
      document.getElementById('quiz-content').innerHTML = html;

      // Seçim işlemleri
      document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const qIdx = this.getAttribute('data-q');
          document.querySelectorAll(`.option-btn[data-q='${qIdx}']`).forEach(b => {
            b.classList.remove('bg-blue-600', 'text-white', 'bg-red-600', 'bg-green-600', 'border-blue-500', 'ring-2', 'ring-blue-400');
            b.removeAttribute('data-selected');
            // Orijinal stilleri geri yükle
            b.classList.add('bg-gray-700/70', 'hover:bg-gray-600/80', 'border-gray-600', 'hover:border-gray-500');
          });
          // Seçilen butona özel stil ver
          this.classList.remove('bg-gray-700/70', 'hover:bg-gray-600/80', 'border-gray-600', 'hover:border-gray-500');
          this.classList.add('bg-gradient-to-r', 'from-blue-600', 'to-blue-700', 'border-blue-500', 'ring-2', 'ring-blue-400', 'text-white');
          this.setAttribute('data-selected', 'true');
        });
      });

      document.getElementById('finish-quiz').onclick = function() {
        let score = 0;
        let total = quiz.questions.length;
        const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
        quiz.questions.forEach((q, idx) => {
          const selectedBtn = document.querySelector(`.option-btn[data-q='${idx}'][data-selected='true']`);
          const optionBtns = document.querySelectorAll(`.option-btn[data-q='${idx}']`);
          // Tüm butonların seçim stillerini temizle
          optionBtns.forEach(b => {
            b.classList.remove('bg-green-600', 'bg-red-600', 'bg-blue-600', 'text-white', 'border-blue-500', 'ring-2', 'ring-blue-400', 'from-blue-600', 'to-blue-700', 'bg-gradient-to-r');
            b.classList.add('bg-gray-700/70', 'border-gray-600');
          });
          let answerIdx = typeof q.answer === 'number' ? q.answer : q.options.findIndex(opt => opt === q.answer);
          if (selectedBtn) {
            if (parseInt(selectedBtn.getAttribute('data-i')) === answerIdx) {
              score++;
              selectedBtn.classList.remove('bg-gray-700/70', 'border-gray-600');
              selectedBtn.classList.add('bg-gradient-to-r', 'from-green-600', 'to-green-700', 'border-green-500', 'ring-2', 'ring-green-400', 'text-white');
            } else {
              selectedBtn.classList.remove('bg-gray-700/70', 'border-gray-600');
              selectedBtn.classList.add('bg-gradient-to-r', 'from-red-600', 'to-red-700', 'border-red-500', 'ring-2', 'ring-red-400', 'text-white');
              optionBtns[answerIdx].classList.remove('bg-gray-700/70', 'border-gray-600');
              optionBtns[answerIdx].classList.add('bg-gradient-to-r', 'from-green-600', 'to-green-700', 'border-green-500', 'ring-2', 'ring-green-400', 'text-white');
            }
          } else {
            optionBtns[answerIdx].classList.remove('bg-gray-700/70', 'border-gray-600');
            optionBtns[answerIdx].classList.add('bg-gradient-to-r', 'from-green-600', 'to-green-700', 'border-green-500', 'ring-2', 'ring-green-400', 'text-white');
          }
        });
        document.getElementById('result').textContent = `Result: ${score} / ${total} correct! Score: ${Math.round((score/total)*100)}%`;
        document.getElementById('result').classList.remove('hidden');
      };
    }).catch(() => {
      document.getElementById('quiz-content').innerHTML = '<div class="text-red-400">Quiz could not be loaded.</div>';
    });
  }
} else if (quizId) {
  db.collection('quizzes').doc(quizId).get().then(doc => {
    if (!doc.exists) {
      document.getElementById('quiz-content').innerHTML = '<div class="text-red-400">Quiz not found.</div>';
      return;
    }
    const quiz = doc.data();
    document.getElementById('quiz-title').textContent = quiz.name;
    let html = '';
    quiz.questions.forEach((q, idx) => {
      html += `<div class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 w-full max-w-xl mb-6 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div class="bg-gray-700/50 backdrop-blur-sm p-4 rounded-xl mb-4 border border-gray-600/50">
          <p class="text-base leading-relaxed text-gray-200">${q.question}</p>
        </div>
        <div class="grid gap-2">`;
      const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
      q.options.forEach((opt, i) => {
        html += `<button type="button" class="group w-full bg-gray-700/70 hover:bg-gray-600/80 border border-gray-600 hover:border-gray-500 px-4 py-3 rounded-lg transition-all duration-200 option-btn text-left relative overflow-hidden" data-q="${idx}" data-i="${i}">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          <div class="relative flex items-center">
            <span class="bg-gray-600 group-hover:bg-gray-500 text-white font-semibold w-7 h-7 rounded-md flex items-center justify-center mr-3 text-sm transition-colors duration-200">${labels[i]}</span>
            <span class="text-gray-200 group-hover:text-white transition-colors duration-200 text-sm">${opt}</span>
          </div>
        </button>`;
      });
      html += `</div></div>`;
    });
    document.getElementById('quiz-content').innerHTML = html;

    // Seçim işlemleri
    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const qIdx = this.getAttribute('data-q');
        document.querySelectorAll(`.option-btn[data-q='${qIdx}']`).forEach(b => {
          b.classList.remove('bg-blue-600', 'text-white', 'bg-red-600', 'bg-green-600', 'border-blue-500', 'ring-2', 'ring-blue-400', 'from-blue-600', 'to-blue-700');
          b.removeAttribute('data-selected');
          // Orijinal stilleri geri yükle
          b.classList.add('bg-gray-700/70', 'hover:bg-gray-600/80', 'border-gray-600', 'hover:border-gray-500');
        });
        // Seçilen butona özel stil ver
        this.classList.remove('bg-gray-700/70', 'hover:bg-gray-600/80', 'border-gray-600', 'hover:border-gray-500');
        this.classList.add('bg-gradient-to-r', 'from-blue-600', 'to-blue-700', 'border-blue-500', 'ring-2', 'ring-blue-400', 'text-white');
        this.setAttribute('data-selected', 'true');
      });
    });

    document.getElementById('finish-quiz').onclick = function() {
      let score = 0;
      let total = quiz.questions.length;
      const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
      quiz.questions.forEach((q, idx) => {
        const selectedBtn = document.querySelector(`.option-btn[data-q='${idx}'][data-selected='true']`);
        const optionBtns = document.querySelectorAll(`.option-btn[data-q='${idx}']`);
        // Tüm butonların seçim stillerini temizle
        optionBtns.forEach(b => {
          b.classList.remove('bg-green-600', 'bg-red-600', 'bg-blue-600', 'text-white', 'border-blue-500', 'ring-2', 'ring-blue-400', 'from-blue-600', 'to-blue-700', 'bg-gradient-to-r');
          b.classList.add('bg-gray-700/70', 'border-gray-600');
        });
        if (selectedBtn) {
          if (parseInt(selectedBtn.getAttribute('data-i')) === parseInt(q.answer)) {
            score++;
            selectedBtn.classList.remove('bg-gray-700/70', 'border-gray-600');
            selectedBtn.classList.add('bg-gradient-to-r', 'from-green-600', 'to-green-700', 'border-green-500', 'ring-2', 'ring-green-400', 'text-white');
          } else {
            selectedBtn.classList.remove('bg-gray-700/70', 'border-gray-600');
            selectedBtn.classList.add('bg-gradient-to-r', 'from-red-600', 'to-red-700', 'border-red-500', 'ring-2', 'ring-red-400', 'text-white');
            optionBtns[parseInt(q.answer)].classList.remove('bg-gray-700/70', 'border-gray-600');
            optionBtns[parseInt(q.answer)].classList.add('bg-gradient-to-r', 'from-green-600', 'to-green-700', 'border-green-500', 'ring-2', 'ring-green-400', 'text-white');
          }
        } else {
          optionBtns[parseInt(q.answer)].classList.remove('bg-gray-700/70', 'border-gray-600');
          optionBtns[parseInt(q.answer)].classList.add('bg-gradient-to-r', 'from-green-600', 'to-green-700', 'border-green-500', 'ring-2', 'ring-green-400', 'text-white');
        }
      });
      const percentage = Math.round((score/total)*100);
      document.getElementById('result').textContent = `Result: ${score} / ${total} correct! Score: ${percentage}%`;
      document.getElementById('result').classList.remove('hidden');

      // Metrikleri kaydet (sadece giriş yapmış kullanıcılar için)
      auth.currentUser && db.collection('quiz_metrics').add({
        quizId: quizId,
        userId: auth.currentUser.uid,
        username: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
        score: score,
        totalQuestions: total,
        percentage: percentage,
        completedAt: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(err => console.error('Metric save error:', err));
    };
  });
} else {
  document.getElementById('quiz-content').innerHTML = '<div class="text-red-400">Quiz not found.</div>';
}

