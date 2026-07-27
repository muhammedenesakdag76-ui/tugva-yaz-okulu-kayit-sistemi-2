document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registrationForm');

  if (!form) {
    console.error("Hata: 'registrationForm' bulunamadı.");
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');

    // Form Değerlerini Alma
    const studentData = {
      tcNo: document.getElementById('tcNo').value.trim(),
      adSoyad: document.getElementById('adSoyad').value.trim(),
      dogumTarihi: document.getElementById('dogumTarihi').value,
      okul: document.getElementById('okul').value.trim(),
      sinif: document.getElementById('sinif').value,
      veliAdSoyad: document.getElementById('veliAdSoyad').value.trim(),
      veliTelefon: document.getElementById('veliTelefon').value.trim(),
      kanGrubu: document.getElementById('kanGrubu').value,
      adres: document.getElementById('adres').value.trim(),
      status: 'Aktif'
    };

    // Temel Doğrulama
    if (studentData.tcNo.length !== 11) {
      alert('T.C. Kimlik Numarası 11 haneli olmalıdır.');
      return;
    }

    // Butonu Kilitle
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Kayıt Yapılıyor...';
    }

    try {
      // Firebase Kontrolü ve Kayıt
      if (typeof db === 'undefined') {
        throw new Error("Firebase bağlantısı kurulamadı. firebase.js dosyanızı kontrol edin.");
      }

      await db.collection('students').add({
        ...studentData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      alert('Öğrenci kaydı başarıyla oluşturuldu!');
      form.reset();

    } catch (error) {
      console.error('Kayıt Hatası:', error);
      alert('Kayıt sırasında bir hata oluştu: ' + error.message);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Kayıt Ol';
      }
    }
  });
});
