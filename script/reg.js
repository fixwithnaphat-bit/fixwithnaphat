const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxoDhmSPGJh5P7cEr-ggQJEf3eXvWq3AN-RPibPseYeaKMZL6RWOanCwrjv2km9NpJCOQ/exec';

document.getElementById('registerForm').addEventListener('submit', async e => {
  e.preventDefault();

  const pw = password.value;
  if (pw !== confirmPassword.value) {
    alert('รหัสผ่านไม่ตรงกัน');
    return;
  }

  const fd = new FormData();
  fd.append('action', 'register');
  fd.append('prefix', prefix.value);
  fd.append('fullname', fullname.value);
  fd.append('email', email.value);
  fd.append('phone', phone.value);
  fd.append('reason', reason.value);
  fd.append('password', pw);

  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: fd
    });

    const data = await res.json();
    if (data.success) {
      alert('สมัครสมาชิกสำเร็จ กำลังพาไปหน้าแรก...');
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 500);
    } else {
      alert(data.error);
    }

  } catch (err) {
    alert('เชื่อมต่อไม่ได้');
    console.error(err);
  }
});
