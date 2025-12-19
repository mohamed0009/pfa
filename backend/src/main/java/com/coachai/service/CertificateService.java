package com.coachai.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class CertificateService {

    public byte[] generateCertificate(String studentName, String courseName, String date) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);
            document.open();

            // Decorative Border
            document.add(new Paragraph("\n\n")); // Spacing

            // Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 36, BaseColor.DARK_GRAY);
            Paragraph title = new Paragraph("Certificat de Réussite", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(new Paragraph("\n\n"));

            // Content
            Font contentFont = FontFactory.getFont(FontFactory.HELVETICA, 18);
            Paragraph content = new Paragraph("Ce certificat est fièrement décerné à", contentFont);
            content.setAlignment(Element.ALIGN_CENTER);
            document.add(content);

            document.add(new Paragraph("\n"));

            Font nameFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 28, new BaseColor(1, 153, 109)); // Coursera Green
            Paragraph name = new Paragraph(studentName, nameFont);
            name.setAlignment(Element.ALIGN_CENTER);
            document.add(name);

            document.add(new Paragraph("\n"));

            Paragraph completed = new Paragraph("pour avoir complété avec succès le module", contentFont);
            completed.setAlignment(Element.ALIGN_CENTER);
            document.add(completed);

            document.add(new Paragraph("\n"));

            Font courseFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24);
            Paragraph course = new Paragraph(courseName, courseFont);
            course.setAlignment(Element.ALIGN_CENTER);
            document.add(course);

            document.add(new Paragraph("\n\n"));

            Paragraph datePara = new Paragraph("Délivré le " + date, contentFont);
            datePara.setAlignment(Element.ALIGN_CENTER);
            document.add(datePara);

            document.add(new Paragraph("\n\n\n"));

            // Signature
            Paragraph signature = new Paragraph("L'équipe Coach AI", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 14));
            signature.setAlignment(Element.ALIGN_RIGHT);
            signature.setIndentationRight(50);
            document.add(signature);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du certificat", e);
        }
    }
}
