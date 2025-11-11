// Admin Panel - Tüm Yönetim İşlemleri

// Admin kontrolü
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  // Admin yetkisi kontrolü
  db.collection('users').doc(user.uid).get().then(doc => {
    if (!doc.exists || !doc.data().isAdmin) {
      document.getElementById('admin-content').innerHTML = `
        <div class="bg-red-900/30 backdrop-blur-sm rounded-xl shadow-xl border border-red-700 p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto mb-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 class="text-3xl font-bold text-red-400 mb-4">Access Denied</h3>
          <p class="text-gray-300 mb-6">You do not have administrator privileges.</p>
          <a href="main.html" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition inline-block">Go to Dashboard</a>
        </div>
      `;
      return;
    }

    // Admin ise paneli yükle
    loadAdminPanel();
  }).catch(err => {
    console.error('Admin check error:', err);
    window.location.href = 'index.html';
  });
});

function loadAdminPanel() {
  // Sekme değiştirme
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active', 'bg-blue-600'));
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.add('bg-gray-700'));
      btn.classList.remove('bg-gray-700');
      btn.classList.add('active', 'bg-blue-600');
      
      const tab = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
      document.getElementById(tab).classList.remove('hidden');
      
      // Tab açıldığında verileri yükle
      if (tab === 'users-tab') loadUsers();
      else if (tab === 'quizzes-tab') loadQuizzes();
      else if (tab === 'polls-tab') loadPolls();
      else if (tab === 'stats-tab') loadStats();
    });
  });

  // İlk tab'ı yükle
  loadUsers();
}

// KULLANICI YÖNETİMİ
function loadUsers() {
  const container = document.getElementById('users-list');
  container.innerHTML = '<div class="text-center py-8"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div></div>';

  db.collection('users').get().then(snapshot => {
    if (snapshot.empty) {
      container.innerHTML = '<div class="text-gray-400 text-center py-8">No users found.</div>';
      return;
    }

    let html = `
      <div class="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">User</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">User ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Role</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
    `;

    snapshot.forEach(doc => {
      const user = doc.data();
      const userId = doc.id;
      const isSuspended = user.suspended || false;
      const isAdmin = user.isAdmin || false;
      const username = user.username || 'Unknown';
      
      html += `
        <tr class="hover:bg-gray-700/50 transition-colors">
          <td class="px-6 py-4">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold mr-3">
                ${username.charAt(0).toUpperCase()}
              </div>
              <span class="text-gray-200 font-medium">${username}</span>
            </div>
          </td>
          <td class="px-6 py-4 text-gray-400 text-xs font-mono">${userId.substring(0, 8)}...</td>
          <td class="px-6 py-4">
            ${isSuspended 
              ? '<span class="px-3 py-1 rounded-full text-xs font-semibold bg-red-600 text-white">Suspended</span>'
              : '<span class="px-3 py-1 rounded-full text-xs font-semibold bg-green-600 text-white">Active</span>'
            }
          </td>
          <td class="px-6 py-4">
            ${isAdmin 
              ? '<span class="px-3 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white">Admin</span>'
              : '<span class="px-3 py-1 rounded-full text-xs font-semibold bg-gray-600 text-white">User</span>'
            }
          </td>
          <td class="px-6 py-4">
            <div class="flex gap-2 flex-wrap">
              ${!isSuspended 
                ? `<button onclick="suspendUser('${userId}')" class="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1.5 rounded transition">Suspend</button>`
                : `<button onclick="unsuspendUser('${userId}')" class="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded transition">Activate</button>`
              }
              <button onclick="viewUserData('${userId}', '${username}')" class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded transition">View</button>
              ${!isAdmin ? `<button onclick="deleteUser('${userId}', '${username}')" class="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded transition">Delete</button>` : ''}
            </div>
          </td>
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;
    container.innerHTML = html;
  }).catch(err => {
    console.error('Error loading users:', err);
    container.innerHTML = '<div class="text-red-400">Error loading users: ' + err.message + '</div>';
  });
}

function suspendUser(userId) {
  if (!confirm('Suspend this user? They will not be able to login.')) return;
  
  db.collection('users').doc(userId).update({
    suspended: true,
    suspendedAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    alert('User suspended successfully!');
    loadUsers();
  }).catch(err => {
    alert('Error: ' + err.message);
  });
}

function unsuspendUser(userId) {
  db.collection('users').doc(userId).update({
    suspended: false,
    suspendedAt: null
  }).then(() => {
    alert('User activated successfully!');
    loadUsers();
  }).catch(err => {
    alert('Error: ' + err.message);
  });
}

function viewUserData(userId, username) {
  // Kullanıcının quiz ve poll sayısını göster
  Promise.all([
    db.collection('quizzes').where('owner', '==', userId).get(),
    db.collection('polls').where('owner', '==', userId).get()
  ]).then(([quizSnap, pollSnap]) => {
    alert(`User: ${username}\n\nQuizzes: ${quizSnap.size}\nPolls: ${pollSnap.size}\nUser ID: ${userId}`);
  }).catch(err => {
    alert('Error loading user data: ' + err.message);
  });
}

function deleteUser(userId, username) {
  if (!confirm(`⚠️ DELETE USER "${username}"?\n\nThis will delete:\n- User account from Firestore\n- All their quizzes\n- All their polls\n- All their data\n\nThis action CANNOT be undone!`)) return;
  
  // Önce kullanıcının quiz ve polllerini sil
  Promise.all([
    db.collection('quizzes').where('owner', '==', userId).get(),
    db.collection('polls').where('owner', '==', userId).get()
  ]).then(([quizSnapshot, pollSnapshot]) => {
    const deletePromises = [];
    
    quizSnapshot.forEach(doc => deletePromises.push(doc.ref.delete()));
    pollSnapshot.forEach(doc => deletePromises.push(doc.ref.delete()));
    
    return Promise.all(deletePromises);
  }).then(() => {
    // Kullanıcı dokümanını sil
    return db.collection('users').doc(userId).delete();
  }).then(() => {
    alert('User and all their data deleted successfully!');
    loadUsers();
  }).catch(err => {
    alert('Error deleting user: ' + err.message);
  });
}

// QUIZ YÖNETİMİ
function loadQuizzes() {
  const container = document.getElementById('quizzes-list');
  container.innerHTML = '<div class="text-center py-8"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div></div>';

  db.collection('quizzes').get().then(snapshot => {
    let html = '<div class="space-y-4">';
    
    snapshot.forEach(doc => {
      const quiz = doc.data();
      html += `
        <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-white">${quiz.name}</h3>
            <p class="text-sm text-gray-400">Owner: ${quiz.ownerUsername || 'Unknown'} • ${quiz.questions?.length || 0} questions</p>
          </div>
          <div class="flex gap-2">
            <a href="quiz-solve.html?id=${doc.id}" target="_blank" class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded transition">View</a>
            <button onclick="deleteQuiz('${doc.id}')" class="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded transition">Delete</button>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html || '<div class="text-gray-400 text-center py-8">No quizzes found.</div>';
  }).catch(err => {
    container.innerHTML = '<div class="text-red-400">Error loading quizzes: ' + err.message + '</div>';
  });
}

function deleteQuiz(quizId) {
  if (!confirm('Delete this quiz? This action cannot be undone!')) return;
  
  db.collection('quizzes').doc(quizId).delete().then(() => {
    alert('Quiz deleted successfully!');
    loadQuizzes();
  }).catch(err => {
    alert('Error: ' + err.message);
  });
}

// POLL YÖNETİMİ
function loadPolls() {
  const container = document.getElementById('polls-list');
  container.innerHTML = '<div class="text-center py-8"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div></div>';

  db.collection('polls').get().then(snapshot => {
    let html = '<div class="space-y-4">';
    
    snapshot.forEach(doc => {
      const poll = doc.data();
      html += `
        <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-white">${poll.question}</h3>
            <p class="text-sm text-gray-400">Owner: ${poll.ownerUsername || 'Unknown'} • ${poll.options?.length || 0} options</p>
          </div>
          <div class="flex gap-2">
            <a href="poll-detail.html?id=${doc.id}" target="_blank" class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded transition">View</a>
            <button onclick="deletePoll('${doc.id}')" class="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded transition">Delete</button>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html || '<div class="text-gray-400 text-center py-8">No polls found.</div>';
  }).catch(err => {
    container.innerHTML = '<div class="text-red-400">Error loading polls: ' + err.message + '</div>';
  });
}

function deletePoll(pollId) {
  if (!confirm('Delete this poll? This action cannot be undone!')) return;
  
  db.collection('polls').doc(pollId).delete().then(() => {
    alert('Poll deleted successfully!');
    loadPolls();
  }).catch(err => {
    alert('Error: ' + err.message);
  });
}

// İSTATİSTİKLER
function loadStats() {
  const container = document.getElementById('stats-content');
  container.innerHTML = '<div class="text-center py-8"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div></div>';

  Promise.all([
    db.collection('users').get(),
    db.collection('quizzes').get(),
    db.collection('polls').get(),
    db.collection('quiz_metrics').get()
  ]).then(([userSnap, quizSnap, pollSnap, metricsSnap]) => {
    const totalUsers = userSnap.size;
    const totalQuizzes = quizSnap.size;
    const totalPolls = pollSnap.size;
    const totalAttempts = metricsSnap.size;

    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl shadow-lg border border-blue-500">
          <div class="text-blue-200 text-sm mb-1">Total Users</div>
          <div class="text-4xl font-bold text-white">${totalUsers}</div>
        </div>
        <div class="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-xl shadow-lg border border-green-500">
          <div class="text-green-200 text-sm mb-1">Total Quizzes</div>
          <div class="text-4xl font-bold text-white">${totalQuizzes}</div>
        </div>
        <div class="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-xl shadow-lg border border-purple-500">
          <div class="text-purple-200 text-sm mb-1">Total Polls</div>
          <div class="text-4xl font-bold text-white">${totalPolls}</div>
        </div>
        <div class="bg-gradient-to-br from-orange-600 to-orange-700 p-6 rounded-xl shadow-lg border border-orange-500">
          <div class="text-orange-200 text-sm mb-1">Quiz Attempts</div>
          <div class="text-4xl font-bold text-white">${totalAttempts}</div>
        </div>
      </div>
    `;
  }).catch(err => {
    container.innerHTML = '<div class="text-red-400">Error loading statistics: ' + err.message + '</div>';
  });
}
