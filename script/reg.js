const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxLBliGtHDirHQlDLRPwCv9hYo2FzWhjuDLRvLHEiM9N8uxM14ECBx3oGnNuUKeGwwu1Q/exec';

const registerForm = document.getElementById('registerForm');

const prefix = document.getElementById('prefix');
const fullname = document.getElementById('fullname');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const reason = document.getElementById('reason');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');

registerForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  // ตรวจรหัสผ่าน
  if (password.value !== confirmPassword.value) {
    alert('รหัสผ่านไม่ตรงกัน');
    confirmPassword.focus();
    return;
  }

  if (password.value.length < 8) {
    alert('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
    password.focus();
    return;
  }

  // ป้องกันการกดสมัครซ้ำ
  const submitButton = registerForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'กำลังส่งใบสมัคร...';

  const fd = new FormData();

  fd.append('action', 'register');
  fd.append('prefix', prefix.value.trim());
  fd.append('fullname', fullname.value.trim());
  fd.append('email', email.value.trim().toLowerCase());
  fd.append('phone', phone.value.trim());
  fd.append('reason', reason.value.trim());
  fd.append('password', password.value);

  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: fd
    });

    if (!res.ok) {
      throw new Error('HTTP ' + res.status);
    }

    const data = await res.json();

    if (data.success) {
      alert('สมัครสมาชิกสำเร็จ กำลังพาไปหน้าแรก...');

      registerForm.reset();

      setTimeout(() => {
        window.location.href = '/index.html';
      }, 500);

    } else {
      alert(data.error || 'ไม่สามารถสมัครสมาชิกได้');
    }

  } catch (err) {
    console.error('Register Error:', err);
    alert('ไม่สามารถเชื่อมต่อระบบสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง');

  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'ส่งใบสมัคร';
  }
});

// const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxoDhmSPGJh5P7cEr-ggQJEf3eXvWq3AN-RPibPseYeaKMZL6RWOanCwrjv2km9NpJCOQ/exec';

// document.getElementById('registerForm').addEventListener('submit', async e => {
//   e.preventDefault();

//   const pw = password.value;
//   if (pw !== confirmPassword.value) {
//     alert('รหัสผ่านไม่ตรงกัน');
//     return;
//   }

//   const fd = new FormData();
//   fd.append('action', 'register');
//   fd.append('prefix', prefix.value);
//   fd.append('fullname', fullname.value);
//   fd.append('email', email.value);
//   fd.append('phone', phone.value);
//   fd.append('reason', reason.value);
//   fd.append('password', pw);

//   try {
//     const res = await fetch(SCRIPT_URL, {
//       method: 'POST',
//       body: fd
//     });

//     const data = await res.json();
//     if (data.success) {
//       alert('สมัครสมาชิกสำเร็จ กำลังพาไปหน้าแรก...');
//       setTimeout(() => {
//         window.location.href = '/index.html';
//       }, 500);
//     } else {
//       alert(data.error);
//     }

//   } catch (err) {
//     alert('เชื่อมต่อไม่ได้');
//     console.error(err);
//   }
// });
