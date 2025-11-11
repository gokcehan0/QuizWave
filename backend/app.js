// Firebase Auth ve Firestore ile tam entegrasyon
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
// <script src="firebase-config.js"></script>

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
  // SVG değiştirme fonksiyonları
  function loadLoginSVG() {
    const svgContainer = document.getElementById('auth-svg');
    if (svgContainer) {
      fetch('/svg/login.svg')
        .then(response => response.text())
        .then(svgContent => {
          // SVG'ye gerekli CSS sınıflarını ekle
          const modifiedSVG = svgContent.replace('<svg', '<svg width="350" height="350" class="opacity-90"');
          svgContainer.innerHTML = modifiedSVG;
        })
        .catch(() => {
          console.log('Login SVG could not be loaded');
        });
    }
  }

  function loadSignupSVG() {
    const svgContainer = document.getElementById('auth-svg');
    if (svgContainer) {
      fetch('/svg/signup.svg')
        .then(response => response.text())
        .then(svgContent => {
          // SVG'ye gerekli CSS sınıflarını ekle
          const modifiedSVG = svgContent.replace('<svg', '<svg width="350" height="350" class="opacity-90"');
          svgContainer.innerHTML = modifiedSVG;
        })
        .catch(() => {
          console.log('Signup SVG could not be loaded');
        });
    }
  }

  // Başlangıçta login SVG'sini yükle
  loadLoginSVG();

  // Formlar arası geçiş
  const regForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  document.getElementById('show-login').onclick = (e) => {
    e.preventDefault();
    regForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    loadLoginSVG(); // Login SVG'sine geç
  };
  document.getElementById('show-register').onclick = (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    regForm.classList.remove('hidden');
    loadSignupSVG(); // Signup SVG'sine geç
  };
  auth.onAuthStateChanged(user => {
    if (user) {
      currentUser = user;
      // Yönlendirme sadece login fonksiyonunda yapılacak
    } else {
      currentUser = null;
      document.getElementById('auth').classList.remove('hidden');
      document.getElementById('quiz').classList.add('hidden');
    }
  });
});

function register() {
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const msg = document.getElementById('register-msg');
  msg.innerText = '';
  if (!username) {
    msg.innerText = 'Username is required.';
    return;
  }
  if (!email || !password) {
    msg.innerText = 'Email and password are required.';
    return;
  }
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      // Oturum açıldıktan sonra Firestore'a yazmak için onAuthStateChanged kullan
      const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) {
          db.collection('users').doc(user.uid).set({ username })
            .then(() => {
              msg.innerText = '';
              document.getElementById('register-form').classList.add('hidden');
              document.getElementById('login-form').classList.remove('hidden');
              document.getElementById('login-msg').innerText = 'Registration successful. You can now login.';
              unsubscribe();
            })
            .catch(e => {
              msg.innerText = 'Username Firestore save failed: ' + e.message;
              console.error('Firestore username save error:', e);
              unsubscribe();
            });
        }
      });
    })
    .catch(e => {
      msg.innerText = e.message;
      console.error('Registration or Firestore username save error:', e);
    });
}

function login() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const msg = document.getElementById('login-msg');
  msg.innerText = '';
  if (!email || !password) {
    msg.innerText = 'Email and password are required.';
    return;
  }
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Kullanıcının askıya alınıp alınmadığını kontrol et
      const user = userCredential.user;
      db.collection('users').doc(user.uid).get().then(doc => {
        if (doc.exists && doc.data().suspended === true) {
          // Askıya alınmış kullanıcı - çıkış yap
          auth.signOut();
          msg.innerText = 'Your account has been suspended. Please contact support.';
          msg.classList.add('text-red-500');
        } else {
          msg.innerText = '';
          window.location.href = "main.html";
        }
      }).catch(e => {
        console.error('Error checking suspension:', e);
        window.location.href = "main.html";
      });
    })
    .catch(e => {
      msg.innerText = e.message;
    });
}

function showQuiz() {
  document.getElementById('auth').classList.add('hidden');
  document.getElementById('quiz').classList.remove('hidden');
  db.collection('quizzes').get().then(snapshot => {
    let html = '';
    snapshot.forEach(doc => {
      const q = doc.data();
      html += `<div class='mb-4'><div class='font-bold mb-2'>${q.question}</div>`;
      q.options.forEach((opt, i) => {
        html += `<div class='mb-1'><label><input type='radio' name='q${doc.id}' value='${i}'> ${opt}</label></div>`;
      });
      html += '</div>';
    });
    document.getElementById('quiz-content').innerHTML = html;
  });
}

function logout() {
  auth.signOut();
  document.getElementById('auth').classList.remove('hidden');
  document.getElementById('quiz').classList.add('hidden');
  document.getElementById('auth-msg').innerText = '';
}
