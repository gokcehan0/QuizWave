let optionCount = 0;
const pollOptionsDiv = document.getElementById('pollOptions');

function addPollOption() {
  if (pollOptionsDiv.children.length >= 6) return;
  optionCount++;
  const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
  const label = labels[pollOptionsDiv.children.length] || '';
  const optDiv = document.createElement('div');
  optDiv.className = 'mb-1 flex items-center gap-2';
  optDiv.innerHTML = `<span class="font-bold">${label}.</span> <input type="text" class="poll-option-input p-2 rounded bg-gray-900 text-white flex-1" placeholder="Option"> <button type="button" class="removePollOption bg-rose-600 hover:bg-rose-700 p-1 rounded flex items-center gap-1"><svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2' /></svg>Delete</button>`;
  pollOptionsDiv.appendChild(optDiv);
  optDiv.querySelector('.removePollOption').onclick = () => {
    pollOptionsDiv.removeChild(optDiv);
    Array.from(pollOptionsDiv.children).forEach((el, idx) => {
      const lbl = el.querySelector('span');
      if (lbl) lbl.textContent = labels[idx] + '.';
    });
  };
}

document.getElementById('addPollOption').onclick = addPollOption;
addPollOption();
addPollOption();

document.getElementById('pollForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const pollName = document.getElementById('pollName').value.trim();
  const pollQuestion = document.getElementById('pollQuestion').value.trim();
  if (!pollName) {
    document.getElementById('pollMsg').innerText = 'Enter poll name.';
    return;
  }
  if (!pollQuestion) {
    document.getElementById('pollMsg').innerText = 'Enter survey question.';
    return;
  }
  const optionInputs = Array.from(document.querySelectorAll('.poll-option-input'));
  const options = optionInputs.map(opt => opt.value.trim()).filter(opt => opt);
  if (options.length < 2 || options.length > 6) {
    document.getElementById('pollMsg').innerText = 'Please enter 2-6 options.';
    return;
  }
  if (auth.currentUser) {
    db.collection('polls').add({
      name: pollName,
      question: pollQuestion,
      options,
      owner: auth.currentUser.uid,
      createdAt: new Date()
    })
    .then(() => {
      document.getElementById('pollMsg').innerText = 'Survey created successfully!';
      document.getElementById('pollForm').reset();
      pollOptionsDiv.innerHTML = '';
      addPollOption();
      addPollOption();
    })
    .catch(e => {
      document.getElementById('pollMsg').innerText = e.message;
    });
  }
});
