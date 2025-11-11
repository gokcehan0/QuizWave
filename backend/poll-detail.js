// poll-detail.js
// URL'den anket id'sini al
function getPollId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

auth.onAuthStateChanged(user => {
  if (!user) {
    document.getElementById('poll-detail').innerHTML = '<div class="text-red-400">You must login to view polls.</div>';
    return;
  }
  const pollId = getPollId();
  if (!pollId) {
    document.getElementById('poll-detail').innerHTML = '<div class="text-red-400">Poll not found.</div>';
    return;
  }
  db.collection('polls').doc(pollId).get().then(doc => {
    if (!doc.exists) {
      document.getElementById('poll-detail').innerHTML = '<div class="text-red-400">Poll not found.</div>';
      return;
    }
    const poll = doc.data();
    const votes = poll.votes || Array(poll.options.length).fill(0);
    const totalVotes = votes.reduce((a, b) => a + b, 0);
    let maxVote = Math.max(...votes);
    let maxIndexes = votes.map((v, i) => v === maxVote ? i : -1).filter(i => i !== -1);
    
    // Kullanıcı daha önce oy vermiş mi kontrolü
    const votesBy = poll.votesBy || {};
    const userId = user.uid;
    let alreadyVoted = votesBy[userId] !== undefined;
    
    let html = `<div class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 w-full max-w-xl mb-6 relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      <div class="bg-gray-700/50 backdrop-blur-sm p-4 rounded-xl mb-4 border border-gray-600/50">
        <h2 class="text-lg font-bold text-gray-100 mb-2">${poll.name || 'Unknown Poll'}</h2>
        <p class="text-base leading-relaxed text-gray-200">${poll.question}</p>
      </div>
      <div class="grid gap-2">`;
    poll.options.forEach((opt, i) => {
      const percent = totalVotes ? Math.round((votes[i] / totalVotes) * 100) : 0;
      const isMax = maxIndexes.includes(i) && totalVotes > 0;
      html += `<label class="group w-full bg-gray-700/70 hover:bg-gray-600/80 border border-gray-600 hover:border-gray-500 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer text-left relative overflow-hidden flex items-center justify-between">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        <div class="relative flex items-center flex-1">
          <input type='radio' name='poll' value='${i}' class="sr-only">
          <span class="bg-gray-600 group-hover:bg-gray-500 text-white font-semibold w-7 h-7 rounded-md flex items-center justify-center mr-3 text-sm transition-colors duration-200">${String.fromCharCode(65 + i)}</span>
          <span class="text-gray-200 group-hover:text-white transition-colors duration-200 text-sm flex-1">${opt}</span>
        </div>
        <span class="relative text-sm ${isMax ? 'text-green-400 font-bold' : 'text-gray-400'} ml-4">%${percent}${isMax ? ' • Ahead' : ''}</span>
      </label>`;
    });
    html += `</div>
      <div class="text-xs text-gray-400 mt-4 text-center">Vote: ${totalVotes}</div>
      <button id="voteBtn" class="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-2 rounded-xl mt-4 w-full font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ${alreadyVoted ? 'opacity-50 cursor-not-allowed' : ''}" ${alreadyVoted ? 'disabled' : ''}>${alreadyVoted ? 'You have voted' : 'Vote'}</button>
    </div>`;
    document.getElementById('poll-detail').innerHTML = html;
    
    // Radio button seçim efektleri
    document.querySelectorAll('input[name="poll"]').forEach(radio => {
      radio.addEventListener('change', function() {
        // Tüm poll seçeneklerinin stilini sıfırla
        document.querySelectorAll('label').forEach(label => {
          if (label.querySelector('input[name="poll"]')) {
            label.classList.remove('bg-gradient-to-r', 'from-blue-600', 'to-blue-700', 'border-blue-500', 'ring-2', 'ring-blue-400');
            label.classList.add('bg-gray-700/70', 'hover:bg-gray-600/80', 'border-gray-600', 'hover:border-gray-500');
          }
        });
        
        // Seçilen seçeneğe özel stil ver
        const selectedLabel = this.closest('label');
        selectedLabel.classList.remove('bg-gray-700/70', 'hover:bg-gray-600/80', 'border-gray-600', 'hover:border-gray-500');
        selectedLabel.classList.add('bg-gradient-to-r', 'from-blue-600', 'to-blue-700', 'border-blue-500', 'ring-2', 'ring-blue-400');
      });
    });
    
    document.getElementById('voteBtn').onclick = function() {
      if (alreadyVoted) return;
      const selected = document.querySelector('input[name="poll"]:checked');
      if (!selected) {
        alert('Please select an option!');
        return;
      }
      const idx = parseInt(selected.value);
      const newVotes = [...votes];
      newVotes[idx]++;
      const newVotesBy = Object.assign({}, votesBy, { [userId]: idx });
      db.collection('polls').doc(pollId).update({ votes: newVotes, votesBy: newVotesBy }).then(() => {
        location.reload();
      });
    };
  });
});
