export async function downloadPDF(kayitNo) {

    const kart = document.getElementById("downloadCard");

    if (!kart) {

        alert("PDF oluşturulacak alan bulunamadı.");

        return;

    }

    try {

        const canvas = await html2canvas(kart, {

            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff"

        });

        const imgData = canvas.toDataURL("image/png");

        const pdf = new jspdf.jsPDF({

            orientation: "portrait",
            unit: "mm",
            format: "a4"

        });

        const pageWidth = pdf.internal.pageSize.getWidth();

        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pageWidth - 20;

        const imgHeight = canvas.height * imgWidth / canvas.width;

        let y = 10;

        if (imgHeight > pageHeight - 20) {

            const oran = (pageHeight - 20) / imgHeight;

            pdf.addImage(
                imgData,
                "PNG",
                10,
                y,
                imgWidth * oran,
                imgHeight * oran
            );

        } else {

            pdf.addImage(
                imgData,
                "PNG",
                10,
                y,
                imgWidth,
                imgHeight
            );

        }

        pdf.save(`${kayitNo}.pdf`);

    } catch (err) {

        console.error(err);

        alert("PDF oluşturulurken hata oluştu.");

    }

}

window.downloadPDF = downloadPDF;