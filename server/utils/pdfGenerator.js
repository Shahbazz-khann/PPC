const PDFDocument = require('pdfkit');

const generateReportPdf = (reportData, res) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });

            // Pipe the PDF directly to the response
            doc.pipe(res);

            // Title
            doc.fontSize(20).text('Inspection Report', { align: 'center' });
            doc.moveDown();

            // Property Details
            doc.fontSize(16).text('Property Details');
            doc.fontSize(12)
                .text(`Title: ${reportData.property_title || 'N/A'}`)
                .text(`Address: ${reportData.property_address || 'N/A'}, ${reportData.property_city || 'N/A'}`);
            doc.moveDown();

            // Inspection Information
            doc.fontSize(16).text('Inspection Information');
            doc.fontSize(12)
                .text(`Inspection ID: ${reportData.inspection_id || 'N/A'}`)
                .text(`Report ID: ${reportData.inspection_report_id || 'N/A'}`)
                .text(`Inspection Date: ${reportData.inspection_date || 'N/A'}`)
                .text(`Submitted Date: ${reportData.reported_at ? new Date(reportData.reported_at).toLocaleString() : 'N/A'}`)
                .text(`Report Status: ${reportData.report_status || 'N/A'}`)
                .text(`Inspection Result: ${reportData.inspection_result || 'N/A'}`);
            doc.moveDown();

            // Report Content
            doc.fontSize(16).text('Report Content');
            doc.fontSize(12)
                .text('Overall Condition:', { underline: true })
                .text(reportData.overall_condition || 'No overall condition provided.')
                .moveDown()
                .text('Report Summary:', { underline: true })
                .text(reportData.report_summary || 'No summary provided.')
                .moveDown()
                .text('Findings:', { underline: true })
                .text(reportData.findings || 'No findings provided.')
                .moveDown()
                .text('Recommendations:', { underline: true })
                .text(reportData.recommendations || 'No recommendations provided.');
            doc.moveDown();

            // Audit Scores
            doc.fontSize(16).text('Audit Scores');
            if (reportData.audit_scores) {
                doc.fontSize(12)
                    .text(`Boundary & Land: ${reportData.audit_scores['Boundary & Land'] || 'N/A'}`)
                    .text(`Structure & Walls: ${reportData.audit_scores['Structure & Walls'] || 'N/A'}`)
                    .text(`Wiring & Solar: ${reportData.audit_scores['Wiring & Solar'] || 'N/A'}`)
                    .text(`Plumbing & Drainage: ${reportData.audit_scores['Plumbing & Drainage'] || 'N/A'}`);
            } else {
                doc.fontSize(12).text('No audit scores available.');
            }

            // Primary Image (Text link only to avoid blocking/crashing on unreachable URLs)
            doc.moveDown();
            if (reportData.primary_property_image) {
                doc.fontSize(12).fillColor('blue')
                    .text('View Primary Property Image', {
                        link: reportData.primary_property_image,
                        underline: true
                    })
                    .fillColor('black');
            }

            doc.end();
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generateReportPdf
};
