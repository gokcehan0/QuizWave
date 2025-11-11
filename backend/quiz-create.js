
let questionCount = 0;
const questionsDiv = document.getElementById('questions');

function createQuestionBlock(idx) {
  return `
    <div class="question-block mb-4 p-3 rounded bg-gray-700" data-idx="${idx}">
      <input type="text" class="question-input p-2 rounded bg-gray-800 text-white w-full mb-2" placeholder="Question">
      <div class="options-list"></div>
      <div class="flex flex-row gap-2 mb-2">
        <button type="button" class="removeQuestion bg-rose-600 hover:bg-rose-700 p-1 rounded flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
          Remove Question
        </button>
        <button type="button" class="addOption bg-emerald-600 hover:bg-emerald-700 p-1 rounded flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add Option
        </button>
      </div>
      <input type="text" class="answer-input p-2 rounded bg-gray-800 text-white w-full mb-2" maxlength="1" placeholder="True Option (A-F)">
    </div>
  `;
}

function addQuestion() {
  questionCount++;
  const div = document.createElement('div');
  div.innerHTML = createQuestionBlock(questionCount);
  questionsDiv.appendChild(div);
  const block = div.querySelector('.question-block');
  const optionsList = block.querySelector('.options-list');
  let optionCount = 0;

  function addOption() {
    if (optionsList.children.length >= 6) return;
    optionCount++;
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    const label = labels[optionsList.children.length] || '';
    const optDiv = document.createElement('div');
    optDiv.className = 'mb-1 flex items-center gap-2';
    optDiv.innerHTML = `<span class="font-bold">${label}.</span> <input type="text" class="option-input p-2 rounded bg-gray-900 text-white flex-1" placeholder="Option"> <button type="button" class="removeOption bg-rose-500 hover:bg-rose-600 p-1 rounded flex items-center gap-1"><svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2' /></svg>Delete</button>`;
    optionsList.appendChild(optDiv);
    optDiv.querySelector('.removeOption').onclick = () => {
      optionsList.removeChild(optDiv);
      // Update labels when options are deleted
      Array.from(optionsList.children).forEach((el, idx) => {
        const lbl = el.querySelector('span');
        if (lbl) lbl.textContent = labels[idx] + '.';
      });
    };
  }

  // En az 2 şık ile başla
  addOption();
  addOption();

  block.querySelector('.addOption').onclick = addOption;
  block.querySelector('.removeQuestion').onclick = () => {
    questionsDiv.removeChild(div);
  };
}

document.getElementById('addQuestion').onclick = addQuestion;
addQuestion(); // Sayfa açıldığında bir soru ile başla

document.getElementById('quizForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const quizName = document.getElementById('quizName').value.trim();
  if (!quizName) {
    document.getElementById('msg').innerText = 'Quiz adı giriniz.';
    return;
  }
  const questionBlocks = Array.from(document.querySelectorAll('.question-block'));
  if (questionBlocks.length === 0) {
    document.getElementById('msg').innerText = 'En az bir soru ekleyin.';
    return;
  }
  const questions = [];
  for (const block of questionBlocks) {
    const question = block.querySelector('.question-input').value.trim();
    const optionInputs = Array.from(block.querySelectorAll('.option-input'));
    const options = optionInputs.map(opt => opt.value.trim()).filter(opt => opt);
    const answerInput = block.querySelector('.answer-input').value.trim().toUpperCase();
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    const answer = labels.indexOf(answerInput);
    if (!question || options.length < 2 || options.length > 6 || answer === -1 || answer < 0 || answer >= options.length) {
      document.getElementById('msg').innerText = 'Her soru için geçerli bir metin, 2-6 şık ve doğru şık giriniz (A-F).';
      return;
    }
    questions.push({ question, options, answer });
  }
  if (auth.currentUser) {
    db.collection('users').doc(auth.currentUser.uid).get().then(doc => {
      let username = '';
      if (doc.exists && doc.data().username) {
        username = doc.data().username;
      }
      db.collection('quizzes').add({ name: quizName, questions, owner: auth.currentUser.uid, ownerUsername: username })
        .then(() => {
          document.getElementById('msg').innerText = 'Quiz created successfully!';
          document.getElementById('quizForm').reset();
          questionsDiv.innerHTML = '';
          addQuestion();
        })
        .catch(e => {
          document.getElementById('msg').innerText = e.message;
        });
    });
  }
});
