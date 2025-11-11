document.addEventListener('DOMContentLoaded', () => {
  // Main page SVG'sini yükle
  function loadMainSVG() {
    const svgContainer = document.getElementById('main-svg');
    if (svgContainer) {
      fetch('/svg/mainpage.svg')
        .then(response => response.text())
        .then(svgContent => {
          // SVG'ye gerekli CSS sınıflarını ekle
          const modifiedSVG = svgContent.replace('<svg', '<svg width="300" height="150" class="opacity-90"');
          svgContainer.innerHTML = modifiedSVG;
        })
        .catch(() => {
          console.log('Main SVG could not be loaded, using fallback SVG');
          // Fallback SVG
          svgContainer.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 863.91732 364.20537" class="opacity-90" preserveAspectRatio="xMidYMid meet">
              <polygon points="311.959 119.745 0 119.745 0 222.156 11.817 222.156 11.817 248.941 38.601 222.156 311.959 222.156 311.959 119.745" fill="#374151"/>
              <rect x="8.66553" y="129.71814" width="294.62811" height="81.92868" fill="#1f2937"/>
              <rect x="34.72148" y="154.42552" width="141.85589" height="4.30497" fill="#60a5fa"/>
              <rect x="34.72148" y="169.31777" width="247.24292" height="4.30497" fill="#22d3ee"/>
              <rect x="34.72148" y="184.21003" width="247.00081" height="4.30497" fill="#60a5fa"/>
              <circle cx="666.92952" cy="180.07338" r="123.29665" fill="#1f2937"/>
              <circle cx="578.08341" cy="210.89752" r="14.50548" fill="#60a5fa"/>
              <circle cx="744.8965" cy="210.89752" r="14.5055" fill="#22d3ee"/>
              <polygon points="661.49 181.886 650.611 229.029 668.742 210.898 661.49 181.886" fill="#60a5fa"/>
              <polygon points="55.757 0 506 0 506 147.807 488.945 147.807 488.945 186.463 450.289 147.807 55.757 147.807 55.757 0" fill="#4b5563"/>
              <rect x="68.26381" y="14.39335" width="425.22943" height="118.24561" fill="#1f2937"/>
              <rect x="102.45877" y="48.91591" width="204.73707" height="6.21326" fill="#60a5fa"/>
              <rect x="102.45877" y="70.40954" width="356.83952" height="6.21326" fill="#22d3ee"/>
              <rect x="102.45877" y="91.90316" width="356.49009" height="6.21326" fill="#60a5fa"/>
            </svg>
          `;
        });
    }
  }

  // SVG'yi yükle
  loadMainSVG();

  auth.onAuthStateChanged(user => {
    if (user) {
      db.collection('users').doc(user.uid).get().then(doc => {
        if (doc.exists && doc.data().username) {
          document.getElementById('username').textContent = doc.data().username.toUpperCase();
          
          // Admin kontrolü - admin linkini göster/gizle
          if (doc.data().isAdmin === true) {
            document.getElementById('admin-link').classList.remove('hidden');
          }
        } else {
          document.getElementById('username').textContent = 'USER';
          console.warn('Username not found in Firestore document:', doc.data());
        }
      }).catch(e => {
        document.getElementById('username').textContent = 'USER';
        console.error('Firestore username fetch error:', e);
      });
    }
  });
  document.getElementById('logout-btn').onclick = function() {
    auth.signOut();
    window.location.href = 'index.html';
  };

  // Sidebar toggle functionality
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  const mainContent = document.getElementById('main-content');

  function toggleSidebar() {
    if (sidebar.style.transform === 'translateX(-100%)') {
      sidebar.style.transform = 'translateX(0)';
      mainContent.style.marginLeft = '0';
    } else {
      sidebar.style.transform = 'translateX(-100%)';
      mainContent.style.marginLeft = '0';
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleSidebar);
  }

  // Responsive sidebar - mobilde kapalı başlat
  function checkScreenSize() {
    if (window.innerWidth < 768) {
      sidebar.style.transform = 'translateX(-100%)';
      mainContent.style.marginLeft = '0';
    } else {
      sidebar.style.transform = 'translateX(0)';
      mainContent.style.marginLeft = '16rem'; // 64 * 0.25rem = 16rem
    }
  }

  window.addEventListener('resize', checkScreenSize);
  checkScreenSize(); // İlk yüklemede çalıştır
});
