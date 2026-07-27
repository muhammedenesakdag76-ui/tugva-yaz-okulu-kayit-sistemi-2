document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registrationForm');

  if (!form) {
    console.error("Hata: 'registrationForm' id'li form bulunamadı!");
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');

    // 1. Form Verilerini Toplama
    const formData = {
      tcNo: document.getElementById('tcNo')?.value?.trim() || '',
      adSoyad: document.getElementById('adSoyad')?.value?.trim() || '',
      dogumTarihi: document.getElementById('dogumTarihi')?.value || '',
      okul: document.getElementById('okul')?.value?.trim() || '',
      sinif: document.getElementById('sinif')?.value || '',
      veliAdSoyad: document.getElementById('veliAdSoyad')?.value?.trim() || '',
      veliTelefon: document.getElementById('veliTelefon')?.value?.trim() || '',
      kanGrubu: document.getElementById('kanGrubu')?.value || '',
      adres: document.getElementById('adres')?.value?.trim() || '',
      createdAt: new Date().toISOString(),
      status: 'Aktif'
    };

    // 2. Temel Alan Kontrolü
    if (!formData.tcNo || !formData.adSoyad || !formData.veliTelefon) {
      alert('Lütfen T.C. Kimlik No, Ad Soyad ve Veli Telefon alanlarını doldurunuz.');
      return;
    }

    // Button Durumunu Güncelle
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Kayıt Yapılıyor...';
    }

    try {
      // 3. Firestore Veritabanına Kayıt
      // 'db' nesnesi firebase.js üzerinden geliyor
      let docRef;
      if (typeof db !== 'undefined') {
        docRef = await db.collection('students').add({
          ...formData,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } else {
        throw new Error("Firebase veritabanı bağlantısı (db) bulunamadı!");
      }

      const studentId = docRef.id;

      // 4. QR Kod Üretimi (Opsiyonel - Tanımlıysa çalışır)
      if (typeof generateQRCode === 'function') {
        try { await generateQRCode(studentId); } catch (e) { console.warn("QR oluşturulamadı:", e); }
      }

      // 5. PDF Üretimi (Opsiyonel - Tanımlıysa çalışır)
      if (typeof generatePDF === 'function') {
        try { generatePDF({ ...formData, id: studentId }); } catch (e) { console.warn("PDF oluşturulamadı:", e); }
      }

      alert('Kayıt başarıyla tamamlandı!');
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
