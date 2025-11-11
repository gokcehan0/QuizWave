// Quiz istatistikleri backend
const urlParams = new URLSearchParams(window.location.search);
const quizId = urlParams.get('id');

if (!quizId) {
  document.getElementById('stats-content').innerHTML = '<div class="text-red-400">Quiz ID not found.</div>';
} else {
  auth.onAuthStateChanged(user => {
    if (!user) {
      document.getElementById('stats-content').innerHTML = '<div class="text-red-400">You must login to view statistics.</div>';
      return;
    }

    // Önce quiz'in sahibi olup olmadığını kontrol et
    db.collection('quizzes').doc(quizId).get().then(quizDoc => {
      if (!quizDoc.exists) {
        document.getElementById('stats-content').innerHTML = '<div class="text-red-400">Quiz not found.</div>';
        return;
      }

      const quizData = quizDoc.data();
      
      // Quiz sahibi değilse erişim engelle
      if (quizData.owner !== user.uid) {
        document.getElementById('stats-content').innerHTML = '<div class="text-red-400">You do not have permission to view these statistics.</div>';
        return;
      }

      // Quiz bilgilerini göster
      document.getElementById('quiz-name').textContent = quizData.name;

      // Metrikleri çek
      db.collection('quiz_metrics')
        .where('quizId', '==', quizId)
        .orderBy('completedAt', 'desc')
        .get()
        .then(snapshot => {
          if (snapshot.empty) {
            document.getElementById('stats-content').innerHTML = `
              <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700 p-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto mb-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 class="text-2xl font-bold text-gray-300 mb-2">No Statistics Available Yet</h3>
                <p class="text-gray-500">No one has taken this quiz yet. Share it with others to see statistics!</p>
              </div>
            `;
            return;
          }

          const metrics = [];
          snapshot.forEach(doc => {
            metrics.push(doc.data());
          });

          // İstatistikleri hesapla
          const totalAttempts = metrics.length;
          const avgScore = metrics.reduce((sum, m) => sum + m.percentage, 0) / totalAttempts;
          const maxScore = Math.max(...metrics.map(m => m.percentage));
          const minScore = Math.min(...metrics.map(m => m.percentage));

          // Özet istatistikler
          let summaryHtml = `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div class="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl shadow-lg border border-blue-500">
                <div class="text-blue-200 text-sm mb-1">Total Attempts</div>
                <div class="text-3xl font-bold text-white">${totalAttempts}</div>
              </div>
              <div class="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-xl shadow-lg border border-green-500">
                <div class="text-green-200 text-sm mb-1">Average Score</div>
                <div class="text-3xl font-bold text-white">${avgScore.toFixed(1)}%</div>
              </div>
              <div class="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-xl shadow-lg border border-purple-500">
                <div class="text-purple-200 text-sm mb-1">Highest Score</div>
                <div class="text-3xl font-bold text-white">${maxScore}%</div>
              </div>
              <div class="bg-gradient-to-br from-orange-600 to-orange-700 p-6 rounded-xl shadow-lg border border-orange-500">
                <div class="text-orange-200 text-sm mb-1">Lowest Score</div>
                <div class="text-3xl font-bold text-white">${minScore}%</div>
              </div>
            </div>
          `;

          // Kullanıcı bazlı tablo
          const userStats = {};
          metrics.forEach(m => {
            if (!userStats[m.userId]) {
              userStats[m.userId] = {
                username: m.username,
                attempts: 0,
                totalScore: 0,
                bestScore: 0,
                lastAttempt: m.completedAt
              };
            }
            userStats[m.userId].attempts++;
            userStats[m.userId].totalScore += m.percentage;
            userStats[m.userId].bestScore = Math.max(userStats[m.userId].bestScore, m.percentage);
          });

          let tableHtml = `
            <div class="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
              <div class="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4 border-b border-gray-600">
                <h3 class="text-xl font-bold text-white">User Statistics</h3>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-700">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Attempts</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Average</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Best Score</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-700">
          `;

          Object.values(userStats).forEach(stat => {
            const avgPercentage = (stat.totalScore / stat.attempts).toFixed(1);
            tableHtml += `
              <tr class="hover:bg-gray-700/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold mr-3">
                      ${stat.username.charAt(0).toUpperCase()}
                    </div>
                    <span class="text-gray-200 font-medium">${stat.username}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-300">${stat.attempts}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-3 py-1 rounded-full text-sm font-semibold ${avgPercentage >= 70 ? 'bg-green-600 text-white' : avgPercentage >= 50 ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'}">${avgPercentage}%</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-3 py-1 rounded-full text-sm font-semibold ${stat.bestScore >= 70 ? 'bg-green-600 text-white' : stat.bestScore >= 50 ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'}">${stat.bestScore}%</span>
                </td>
              </tr>
            `;
          });

          tableHtml += `
                  </tbody>
                </table>
              </div>
            </div>
          `;

          // Detaylı geçmiş
          let historyHtml = `
            <div class="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700 mt-6">
              <div class="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4 border-b border-gray-600">
                <h3 class="text-xl font-bold text-white">Attempt History</h3>
              </div>
              <div class="divide-y divide-gray-700 max-h-96 overflow-y-auto">
          `;

          metrics.forEach(m => {
            const date = m.completedAt ? new Date(m.completedAt.toDate()).toLocaleString('tr-TR') : 'Unknown';
            historyHtml += `
              <div class="px-6 py-4 hover:bg-gray-700/50 transition-colors">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      ${m.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div class="text-gray-200 font-medium">${m.username}</div>
                      <div class="text-gray-400 text-sm">${date}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-2xl font-bold ${m.percentage >= 70 ? 'text-green-400' : m.percentage >= 50 ? 'text-yellow-400' : 'text-red-400'}">${m.percentage}%</div>
                    <div class="text-gray-400 text-sm">${m.score} / ${m.totalQuestions}</div>
                  </div>
                </div>
              </div>
            `;
          });

          historyHtml += `
              </div>
            </div>
          `;

          document.getElementById('stats-content').innerHTML = summaryHtml + tableHtml + historyHtml;
        })
        .catch(err => {
          console.error('Error loading metrics:', err);
          // Firebase index hatası için özel mesaj
          if (err.code === 'failed-precondition' || err.message.includes('index')) {
            document.getElementById('stats-content').innerHTML = `
              <div class="bg-red-900/30 backdrop-blur-sm rounded-xl shadow-xl border border-red-700 p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 class="text-2xl font-bold text-red-400 mb-3">Firebase Index Required</h3>
                <p class="text-gray-300 mb-4">A database index needs to be created for statistics.</p>
                <div class="bg-gray-800/50 p-4 rounded-lg mb-4 text-left">
                  <p class="text-sm text-gray-400 mb-2">Steps to fix:</p>
                  <ol class="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                    <li>Open browser console (F12) and find the error message</li>
                    <li>Click the Firebase Console link in the error</li>
                    <li>Click "Create Index" button</li>
                    <li>Wait 2-5 minutes for index creation</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
                <p class="text-xs text-gray-500">Error: ${err.message}</p>
                <button onclick="location.reload()" class="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition">Refresh Page</button>
              </div>
            `;
          } else {
            document.getElementById('stats-content').innerHTML = `
              <div class="bg-red-900/30 backdrop-blur-sm rounded-xl shadow-xl border border-red-700 p-8 text-center">
                <h3 class="text-2xl font-bold text-red-400 mb-2">Error Loading Statistics</h3>
                <p class="text-gray-300">${err.message}</p>
                <button onclick="location.reload()" class="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition">Retry</button>
              </div>
            `;
          }
        });
    }).catch(err => {
      console.error('Error loading quiz:', err);
      document.getElementById('stats-content').innerHTML = '<div class="text-red-400">Error loading quiz: ' + err.message + '</div>';
    });
  });
}
