document.addEventListener('DOMContentLoaded', () => {
  const registrationForm = document.getElementById('registrationForm');

  if (registrationForm) {
    registrationForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Form Elemanları
      const submitBtn = registrationForm.querySelector('button[type="submit"]');
      const tcNo = document.getElementById('tcNo').value.trim();
      const adSoyad = document.getElementById('adSoyad').value.trim();
      const dogumTarihi = document.getElementById('dogumTarihi').value;
      const okul = document.getElementById('okul').value.trim();
      const sinif = document.getElementById('sinif').value;
      const veliAdSoyad = document.getElementById('veliAdSoyad').value.trim();
      const veliTelefon = document.getElementById('veliTelefon').value.trim();
      const kanGrubu = document.getElementById('kanGrubu').value;
      const adres = document.getElementById('adres').value.trim();

      // Form Doğrulama (validation.js kontrolü)
      if (typeof validateForm === 'function') {
        const isValid = validateForm({
          tcNo,
          adSoyad,
          dogumTarihi,
          okul,
          sinif,
          veliAdSoyad,
          veliTelefon,
          kanGrubu,
          adres
        });

        if (!isValid) return;
      }

      // Butonu Pasife Al (Çift tıklamayı önlemek için)
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Kayıt Yapılıyor...';
      }

      try {
        // Firestore Kayıt Verisi
        const studentData = {
          tcNo,
          adSoyad,
          dogumTarihi,
          okul,
          sinif,
          veliAdSoyad,
          veliTelefon,
          kanGrubu,
          adres,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          status: 'Aktif'
        };

        // Firebase Firestore'a Kaydetme
        const docRef = await db.collection('students').add(studentData);
        const studentId = docRef.id;

        alert('Kayıt başarıyla oluşturuldu!');

        // QR Kodu ve PDF Oluşturma Fonksiyonları
        if (typeof generateQRCode === 'function') {
          await generateQRCode(studentId);
        }

        if (typeof generatePDF === 'function') {
          generatePDF({ ...studentData, id: studentId });
        }

        // Formu Sıfırla
        registrationForm.reset();

      } catch (error) {
        console.error('Kayıt sırasında bir hata oluştu:', error);
        alert('Kayıt işlemi başarısız oldu. Lütfen tekrar deneyiniz.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = 'Kayıt Ol';
        }
      }
    });
  }
});
