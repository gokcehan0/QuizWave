auth.onAuthStateChanged(user => {
  if (!user) {
    document.getElementById('poll-list').innerHTML = '<div class="text-red-400">You must login to view polls.</div>';
    return;
  }
  db.collection('polls').orderBy('createdAt', 'desc').get().then(snapshot => {
    let html = '';
    snapshot.forEach(doc => {
      const poll = doc.data();
      const votes = poll.votes || Array(poll.options.length).fill(0);
      const totalVotes = votes.reduce((a, b) => a + b, 0);
      let maxVote = Math.max(...votes);
      let maxIndexes = votes.map((v, i) => v === maxVote ? i : -1).filter(i => i !== -1);
      html += `<div class="bg-gray-800 p-4 rounded-lg shadow mb-4 flex flex-col">
        <div class="flex items-center justify-between mb-2">
          <span class="font-bold text-lg">${poll.name || 'Unknown Poll'}</span>
          <div class="flex gap-2">
            <a href="poll-detail.html?id=${doc.id}" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition">Details</a>
            <button class="delete-poll-btn bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded transition flex items-center gap-2" data-id="${doc.id}">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
              Delete
            </button>
          </div>
        </div>
        <div class="mb-2">${poll.question}</div>
        <div class="flex flex-col gap-1 mb-2">
        ${poll.options.map((opt, i) => {
          const percent = totalVotes ? Math.round((votes[i] / totalVotes) * 100) : 0;
          const isMax = maxIndexes.includes(i) && totalVotes > 0;
          return `<div class='flex items-center justify-between bg-gray-700 rounded px-3 py-2'>
            <span>${opt}</span>
            <span class="text-sm ${isMax ? 'text-green-400 font-bold' : 'text-gray-400'}">%${percent}${isMax ? ' • Ahead' : ''}</span>
          </div>`;
        }).join('')}
        </div>
        <div class="text-xs text-gray-400 mt-2">Total votes: ${totalVotes}</div>
      </div>`;
    });
    document.getElementById('poll-list').innerHTML = html || '<div class="text-gray-400">No polls yet.</div>';

    // Delete operation
    document.querySelectorAll('.delete-poll-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const pollId = this.getAttribute('data-id');
        if (confirm('Bu anket silinsin mi?')) {
          db.collection('polls').doc(pollId).delete().then(() => {
            this.closest('.bg-gray-800').remove();
          }).catch(e => {
            alert('Poll could not be deleted: ' + e.message);
          });
        }
      });
    });
  });
});
