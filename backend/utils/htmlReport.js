
const getHtmlReport = (data) => {

    return `<!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8" />
            <title>${data?.type} Report - ${data?.companyName}</title>

            <style>
                /* ---------------- RESET ---------------- */
                * {
                box-sizing: border-box;
                }

                body {
                margin: 0;
                font-family: Helvetica, Arial, sans-serif;
                color: #111827;
                background: #ffffff;
                }

                /* ---------------- PRINT SETTINGS ---------------- */
                @media print {
                body {
                    margin: 0;
                }
                .page-break {
                    page-break-before: always;
                }
                }

                /* ---------------- PAGE WRAPPER ---------------- */
                table.page-wrapper {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
                }

                thead {
                display: table-header-group;
                }

                tfoot {
                display: table-footer-group;
                }

                /* ---------------- HEADER ---------------- */
                .report-header {
                padding: 24px 40px 16px 40px;
                border-bottom: 2px solid #2563eb;
                }

                .company-name {
                font-size: 22px;
                font-weight: 700;
                color: #1e40af;
                letter-spacing: 0.5px;
                }

                .company-details {
                margin-top: 6px;
                font-size: 12px;
                color: #374151;
                line-height: 1.6;
                }

                .header-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 20px;
                }

                .company-info {
                max-width: 75%;
                }

                /* ---------------- FOOTER ---------------- */
                .report-footer {
                padding: 12px 40px;
                font-size: 11px;
                color: #6b7280;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                }

                /* ---------------- CONTENT ---------------- */
                .report-content {
                padding: 40px;
                }

                /* ---------------- TITLE (FIRST PAGE) ---------------- */
                .report-title {
                font-size: 26px;
                font-weight: 700;
                color: #1e40af;
                margin-bottom: 8px;
                }

                .report-meta {
                font-size: 13px;
                color: #374151;
                margin-bottom: 30px;
                }

                /* ---------------- SECTIONS ---------------- */
                section {
                margin-bottom: 30px;
                }

                section h2 {
                font-size: 18px;
                color: #1e3a8a;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 6px;
                margin-bottom: 12px;
                }

                section p {
                font-size: 13px;
                line-height: 1.7;
                color: #111827;
                margin-bottom: 10px;
                }

                section ol, section ul {
                font-size: 13px;
                line-height: 1.7;
                color: #111827;
                margin-left: 20px;
                }

                section li {
                margin-bottom: 8px;
                }

                /* ---------------- TABLES ---------------- */
                table.data-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 12px;
                margin-bottom: 20px;
                font-size: 12px;
                }

                table.data-table th {
                background: #2563eb;
                color: #ffffff;
                padding: 8px;
                text-align: left;
                font-weight: 600;
                }

                table.data-table td {
                padding: 8px;
                border-bottom: 1px solid #e5e7eb;
                }

                table.data-table tr:nth-child(even) {
                background: #f8fafc;
                }

                /* ---------------- METRICS GRID ---------------- */
                .metrics-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 16px;
                margin-top: 16px;
                margin-bottom: 20px;
                }

                .metric-card {
                background: #f8fafc;
                border: 1px solid #e5e7eb;
                padding: 16px;
                border-radius: 6px;
                }

                .metric-title {
                font-size: 12px;
                color: #6b7280;
                margin-bottom: 4px;
                }

                .metric-value {
                font-size: 18px;
                font-weight: 700;
                color: #111827;
                }

                /* ---------------- PAGE BREAK ---------------- */
                .page-break {
                page-break-before: always;
                }

            </style>
            </head>

            <body>

            <table class="page-wrapper">
                <!-- ================= HEADER ================= -->
                <thead>
                <tr>
                    <td>
                    <div class="report-header">
                        <div class="header-row">
                        <div class="company-info">
                            <div class="company-name">
                            ${data?.companyName || 'Company Name'}
                            </div>
                            <div class="company-details">
                            ${data?.address}<br />
                            Contact: ${data?.email || ''} | ${data?.phone || ''}
                            </div>
                        </div>
                        </div>
                    </div>
                    </td>
                </tr>
                </thead>

                <!-- ================= FOOTER ================= -->
                <tfoot>
                <tr>
                    <td>
                    <div class="report-footer">
                        © ${data?.currentYear} ${data?.companyName || 'Company'} • Generated by ERP System
                    </div>
                    </td>
                </tr>
                </tfoot>

                <!-- ================= CONTENT ================= -->
                <tbody>
                <tr>
                    <td>
                    <div class="report-content">

                        <!-- ===== FIRST PAGE TITLE ===== -->
                        <div class="report-title">
                        ${data.type} Report
                        </div>

                        <div class="report-meta">
                        Report Type: ${data?.type}<br />
                        Period: ${data?.reportPeriod}<br />
                        Generated: ${data?.generatedAt}
                        </div>

                        <!-- ===== AI GENERATED CONTENT STARTS HERE ===== -->
                        ${data?.content}
                        <!-- ===== AI GENERATED CONTENT ENDS HERE ===== -->

                    </div>
                    </td>
                </tr>
                </tbody>
            </table>

            </body>
            </html>`;
}

module.exports = getHtmlReport