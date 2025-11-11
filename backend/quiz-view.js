// Firebase Firestore'dan quizleri çek
// Önce firebase ve firestore scriptlerini eklemelisiniz:
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
// <script src="firebase-config.js"></script>


auth.onAuthStateChanged(user => {
  if (!user) {
    document.getElementById('quiz-list').innerHTML = '<div class="text-red-400">You must login to view quizzes.</div>';
    return;
  }
  db.collection('quizzes').where('owner', '==', user.uid).get().then(snapshot => {
    let html = '';
    snapshot.forEach(doc => {
      const quiz = doc.data();
      html += `<div class="bg-gray-800 p-4 rounded-lg shadow mb-4 flex flex-col">
        <div class="flex items-center justify-between mb-2">
          <span class="font-bold text-lg">${quiz.name}</span>
          <div class="flex gap-1.5">
            <a href="quiz-solve.html?id=${doc.id}" target="_blank" class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1.5 rounded transition flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Solve
            </a>
            <a href="quiz-stats.html?id=${doc.id}" class="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1.5 rounded transition flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Stats
            </a>
            <button class="delete-quiz-btn bg-rose-600 hover:bg-rose-700 text-white text-sm px-3 py-1.5 rounded transition flex items-center gap-1.5" data-id="${doc.id}">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
              Delete
            </button>
          </div>
        </div>
        <span class="text-sm text-gray-400">Owner: ${quiz.ownerUsername ? quiz.ownerUsername.toUpperCase() : 'Unknown'}</span>
      </div>`;
    });
    if (!html) html = '<div class="text-yellow-400">No quizzes created yet.</div>';
    document.getElementById('quiz-list').innerHTML = html;

    // Seçim ve sonuç işlemleri
    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const qIdx = this.getAttribute('data-q');
        const quizId = this.getAttribute('data-quiz');
        const quizDiv = document.getElementById(`quiz-${quizId}`);
        quizDiv.querySelectorAll(`.option-btn[data-q='${qIdx}']`).forEach(b => {
          b.classList.remove('bg-blue-600', 'text-white', 'bg-red-600', 'bg-green-600');
          b.removeAttribute('data-selected');
        });
        this.classList.add('bg-indigo-600', 'text-white');
        this.setAttribute('data-selected', 'true');
      });
    });

    document.querySelectorAll('.show-answer-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const qIdx = parseInt(this.getAttribute('data-q'));
        const quizId = this.getAttribute('data-quiz');
        const quizDiv = document.getElementById(`quiz-${quizId}`);
        const quizIndex = Array.from(snapshot.docs).findIndex(d => d.id === quizId);
        const quizData = snapshot.docs[quizIndex].data();
        const correctIdx = parseInt(quizData.questions[qIdx].answer);
        const optionBtns = quizDiv.querySelectorAll(`.option-btn[data-q='${qIdx}']`);
        optionBtns.forEach((b, i) => {
          b.classList.remove('bg-green-600', 'bg-red-600', 'text-white');
          if (i === correctIdx) {
            b.classList.add('bg-green-600', 'text-white');
          }
        });
        const answerP = quizDiv.querySelector(`#answer-${quizId}-${qIdx}`);
        if (answerP) answerP.classList.remove('hidden');
      });
    });

    // Silme işlemi
    document.querySelectorAll('.delete-quiz-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const quizId = this.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this quiz?')) {
          db.collection('quizzes').doc(quizId).delete().then(() => {
            this.closest('.bg-gray-800').remove();
          }).catch(e => {
            alert('Quiz could not be deleted: ' + e.message);
          });
        }
      });
    });

    document.querySelectorAll('.finish-quiz-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const quizId = this.getAttribute('data-quiz');
        const quizDiv = document.getElementById(`quiz-${quizId}`);
        const quizIndex = Array.from(snapshot.docs).findIndex(d => d.id === quizId);
        const quizData = snapshot.docs[quizIndex].data();
        let score = 0;
        let total = quizData.questions.length;
        quizData.questions.forEach((q, idx) => {
          const selectedBtn = quizDiv.querySelector(`.option-btn[data-q='${idx}'][data-selected='true']`);
          const optionBtns = quizDiv.querySelectorAll(`.option-btn[data-q='${idx}']`);
          optionBtns.forEach(b => b.classList.remove('bg-green-600', 'bg-red-600', 'bg-blue-600', 'text-white'));
          if (selectedBtn) {
            if (parseInt(selectedBtn.getAttribute('data-i')) === parseInt(q.answer)) {
              score++;
              selectedBtn.classList.add('bg-green-600', 'text-white');
            } else {
              selectedBtn.classList.add('bg-red-600', 'text-white');
              optionBtns[parseInt(q.answer)].classList.add('bg-green-600', 'text-white');
            }
          } else {
            optionBtns[parseInt(q.answer)].classList.add('bg-green-600', 'text-white');
          }
        });
        const resultDiv = quizDiv.querySelector('.result');
        resultDiv.textContent = `Result: ${score} / ${total} correct! Score: ${Math.round((score/total)*100)}%`;
        resultDiv.classList.remove('hidden');
      });
    });
  });
});
