document.addEventListener('DOMContentLoaded', () => {
    // State
    let packets = [];

    // DOM Elements - Inputs
    const sellerNameInput = document.getElementById('sellerName');
    const buyerNameInput = document.getElementById('buyerName');
    const commodityNameInput = document.getElementById('commodityName');
    const pricePerKgInput = document.getElementById('pricePerKg');
    const priceUnitInput = document.getElementById('priceUnit');
    const deductionPerPacketInput = document.getElementById('deductionPerPacket');
    const packetWeightInput = document.getElementById('packetWeightInput');
    const whatsappNumberInput = document.getElementById('whatsappNumber');

    // DOM Elements - Actions
    const addPacketBtn = document.getElementById('addPacketBtn');
    const importPacketsInput = document.getElementById('importPacketsInput');
    const generateBillBtn = document.getElementById('generateBillBtn');
    const printBillBtn = document.getElementById('printBillBtn');
    const downloadBillBtn = document.getElementById('downloadBillBtn');
    const whatsappBillBtn = document.getElementById('whatsappBillBtn');
    const editBillBtn = document.getElementById('editBillBtn');

    // DOM Elements - Packet List
    const packetList = document.getElementById('packetList');
    const packetCountSpan = document.getElementById('packetCount');
    const totalWeightStrSpan = document.getElementById('totalWeightStr');

    // DOM Elements - Bill Section
    const billContainer = document.getElementById('billContainer');
    const emptyState = document.getElementById('emptyState');
    const formatToolbar = document.getElementById('formatToolbar');
    const printFormatSelect = document.getElementById('printFormatSelect');
    const dynamicPrintStyle = document.getElementById('dynamicPrintStyle');

    // DOM Elements - Bill Output
    const billDate = document.getElementById('billDate');
    const billInvoiceNo = document.getElementById('billInvoiceNo');
    const billSeller = document.getElementById('billSeller');
    const billBuyer = document.getElementById('billBuyer');
    const billWhatsapp = document.getElementById('billWhatsapp');
    const billCommodity = document.getElementById('billCommodity');
    const billRate = document.getElementById('billRate');
    const billPackets = document.getElementById('billPackets');
    const billGrossWeight = document.getElementById('billGrossWeight');
    const billDeductionRate = document.getElementById('billDeductionRate');
    const billTotalDeduction = document.getElementById('billTotalDeduction');
    const billNetWeight = document.getElementById('billNetWeight');
    const billTotalAmount = document.getElementById('billTotalAmount');
    const billAmountInWords = document.getElementById('billAmountInWords');
    const billGrandSummary = document.getElementById('billGrandSummary');
    const billFooterNote = document.getElementById('billFooterNote');

    let currentInvoiceNo = '';
    let currentFormat = 'a4';

    // Utility: Format & Sanitize Phone Number for WhatsApp
    const formatWhatsAppPhone = (input) => {
        if (!input) return '';
        let digits = input.replace(/\D/g, '');
        if (!digits) return '';
        // If 10 digits (Standard Indian Mobile), prepend 91
        if (digits.length === 10) {
            return '91' + digits;
        }
        // If 11 digits starting with 0, replace 0 with 91
        if (digits.length === 11 && digits.startsWith('0')) {
            return '91' + digits.substring(1);
        }
        return digits;
    };

    // Utility: Format Currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Utility: Convert Number to Indian Currency Words
    const numberToWordsINR = (num) => {
        if (isNaN(num) || num <= 0) return '';
        const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
            'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const formatHundreds = (n) => {
            let str = '';
            if (n > 99) {
                str += a[Math.floor(n / 100)] + ' Hundred ';
                n %= 100;
            }
            if (n > 19) {
                str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
            } else if (n > 0) {
                str += a[n];
            }
            return str.trim();
        };

        const parts = num.toFixed(2).split('.');
        let n = parseInt(parts[0], 10);
        const paise = parseInt(parts[1], 10);

        if (n === 0 && paise === 0) return 'Zero Rupees';

        let words = '';
        const crore = Math.floor(n / 10000000);
        n %= 10000000;
        const lakh = Math.floor(n / 100000);
        n %= 100000;
        const thousand = Math.floor(n / 1000);
        n %= 1000;
        const hundreds = n;

        if (crore > 0) words += formatHundreds(crore) + ' Crore ';
        if (lakh > 0) words += formatHundreds(lakh) + ' Lakh ';
        if (thousand > 0) words += formatHundreds(thousand) + ' Thousand ';
        if (hundreds > 0) words += formatHundreds(hundreds);

        words = words.trim();
        let result = words ? 'Rupees ' + words : '';

        if (paise > 0) {
            const paiseWords = formatHundreds(paise);
            result += (result ? ' and ' : '') + paiseWords + ' Paise';
        }

        return result ? result + ' Only' : '';
    };

    // Utility: Generate Unique Invoice Number
    const generateInvoiceNumber = () => {
        const today = new Date();
        const datePart = today.getFullYear().toString() +
            String(today.getMonth() + 1).padStart(2, '0') +
            String(today.getDate()).padStart(2, '0');
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `AB-${datePart}-${rand}`;
    };

    // Add Packet Logic
    const addPacket = () => {
        const weight = parseFloat(packetWeightInput.value);
        if (isNaN(weight) || weight <= 0) {
            alert('Please enter a valid weight.');
            return;
        }

        packets.push(weight);
        packetWeightInput.value = '';
        packetWeightInput.focus();
        updatePacketList();
    };

    // Remove Packet Logic
    const removePacket = (index) => {
        packets.splice(index, 1);
        updatePacketList();
    };

    // Update Packet List UI
    const updatePacketList = () => {
        packetList.innerHTML = '';
        let totalWeight = 0;

        packets.forEach((weight, index) => {
            totalWeight += weight;

            const li = document.createElement('li');

            const infoDiv = document.createElement('div');
            const indexSpan = document.createElement('span');
            indexSpan.className = 'packet-index';
            indexSpan.textContent = `#${index + 1}`;

            const weightSpan = document.createElement('span');
            weightSpan.className = 'packet-weight';
            weightSpan.textContent = `${weight.toFixed(2)} Kg`;

            infoDiv.appendChild(indexSpan);
            infoDiv.appendChild(weightSpan);

            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-secondary';
            editBtn.style.padding = '0.25rem 0.5rem';
            editBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            `;
            editBtn.onclick = () => {
                const newWeight = prompt(`Enter new weight for packet #${index + 1}:`, packets[index]);
                if (newWeight !== null) {
                    const parsed = parseFloat(newWeight);
                    if (!isNaN(parsed) && parsed > 0) {
                        packets[index] = parsed;
                        updatePacketList();
                    } else {
                        alert('Invalid weight entered.');
                    }
                }
            };

            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn btn-danger';
            removeBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            `;
            removeBtn.onclick = () => removePacket(index);

            const actionsDiv = document.createElement('div');
            actionsDiv.style.display = 'flex';
            actionsDiv.style.gap = '0.5rem';
            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(removeBtn);

            li.appendChild(infoDiv);
            li.appendChild(actionsDiv);
            packetList.appendChild(li);
        });

        packetCountSpan.textContent = packets.length;
        totalWeightStrSpan.textContent = totalWeight.toFixed(2);

        // Scroll to bottom of list
        packetList.scrollTop = packetList.scrollHeight;
    };

    // Generate Bill Logic
    const generateBill = () => {
        // Validation
        const seller = sellerNameInput.value.trim() || 'Cash';
        const buyer = buyerNameInput.value.trim() || 'Cash';
        const commodity = commodityNameInput.value.trim() || 'Commodity';
        const rate = parseFloat(pricePerKgInput.value);
        const deduction = parseFloat(deductionPerPacketInput.value) || 0;
        const priceUnitVal = parseFloat(priceUnitInput.value);

        if (isNaN(rate) || rate <= 0) {
            alert('Please enter a valid Price rate.');
            return;
        }

        if (packets.length === 0) {
            alert('Please add at least one packet.');
            return;
        }

        // Calculations
        const count = packets.length;
        const grossWeight = packets.reduce((sum, w) => sum + w, 0);
        const totalDeduction = count * deduction;
        const netWeight = grossWeight - totalDeduction;
        const totalAmount = netWeight * (rate / priceUnitVal);

        // Populate Bill UI
        const today = new Date();
        const dateStr = today.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
        billDate.textContent = dateStr;

        if (!currentInvoiceNo) {
            currentInvoiceNo = generateInvoiceNumber();
        }
        if (billInvoiceNo) {
            billInvoiceNo.textContent = currentInvoiceNo;
        }

        billSeller.textContent = seller;
        billBuyer.textContent = buyer;

        if (billWhatsapp) {
            const rawPhone = whatsappNumberInput ? whatsappNumberInput.value.trim() : '';
            if (rawPhone) {
                const digits = rawPhone.replace(/\D/g, '');
                const displayPhone = digits.length === 10 ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` : rawPhone;
                billWhatsapp.textContent = `📱 WhatsApp: ${displayPhone}`;
                billWhatsapp.style.display = 'block';
            } else {
                billWhatsapp.style.display = 'none';
            }
        }

        billCommodity.textContent = commodity;

        const unitLabel = priceUnitInput.options[priceUnitInput.selectedIndex].text;
        billRate.textContent = `${formatCurrency(rate)} ${unitLabel.replace('per ', '/ ')}`;
        billPackets.textContent = count;
        billGrossWeight.textContent = `${grossWeight.toFixed(2)} Kg`;

        billDeductionRate.textContent = `${deduction.toFixed(2)} Kg`;
        billTotalDeduction.textContent = `- ${totalDeduction.toFixed(2)} Kg`;

        billNetWeight.textContent = `${netWeight.toFixed(2)} Kg`;
        billTotalAmount.textContent = formatCurrency(totalAmount);

        if (billAmountInWords) {
            billAmountInWords.textContent = numberToWordsINR(totalAmount);
        }

        // Set Print Format & Layout
        const formatToApply = printFormatSelect ? printFormatSelect.value : currentFormat;
        setPrintFormat(formatToApply);

        if (formatToolbar) {
            formatToolbar.style.display = 'flex';
        }

        renderBreakdownTables();

        // Toggle UI
        emptyState.style.display = 'none';
        billContainer.style.display = 'block';

        // Scroll to bill on mobile
        if (window.innerWidth <= 768) {
            billContainer.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Set Print Format & Switch Layout
    const setPrintFormat = (format) => {
        currentFormat = format;
        if (printFormatSelect) {
            printFormatSelect.value = format;
        }

        const formatBtns = document.querySelectorAll('.format-tab-btn');
        formatBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.format === format);
        });

        if (billContainer) {
            billContainer.classList.remove('format-a4', 'format-thermal80', 'format-thermal58');
            billContainer.classList.add(`format-${format}`);
        }

        if (dynamicPrintStyle) {
            if (format === 'thermal80') {
                dynamicPrintStyle.textContent = '@page { size: 80mm auto; margin: 2mm; }';
            } else if (format === 'thermal58') {
                dynamicPrintStyle.textContent = '@page { size: 58mm auto; margin: 1.5mm; }';
            } else {
                dynamicPrintStyle.textContent = '@page { size: A4 portrait; margin: 6mm; }';
            }
        }

        if (packets.length > 0 && billContainer && billContainer.style.display !== 'none') {
            renderBreakdownTables();
        }
    };

    // Render Breakdown Tables based on selected format
    const renderBreakdownTables = () => {
        const tablesContainer = document.getElementById('tablesContainer');
        if (!tablesContainer) return;
        tablesContainer.innerHTML = '';
        if (billGrandSummary) {
            billGrandSummary.innerHTML = '';
        }

        if (packets.length === 0) return;

        const count = packets.length;
        const grossWeight = packets.reduce((sum, w) => sum + w, 0);
        const deduction = parseFloat(deductionPerPacketInput.value) || 0;
        const totalDeduction = count * deduction;
        const netWeight = grossWeight - totalDeduction;
        const rate = parseFloat(pricePerKgInput.value) || 0;
        const priceUnitVal = parseFloat(priceUnitInput.value) || 1;
        const totalAmount = netWeight * (rate / priceUnitVal);
        const seller = sellerNameInput.value.trim() || 'Cash';
        const buyer = buyerNameInput.value.trim() || 'Cash';
        const dateStr = billDate.textContent;

        if (currentFormat === 'thermal80') {
            // Thermal 80mm (3-Inch): Continuous receipt with up to 3 column pairs
            const maxCols = packets.length <= 15 ? (packets.length <= 6 ? 1 : 2) : 3;
            const actualRows = Math.ceil(packets.length / maxCols);
            const cols = Math.min(maxCols, Math.ceil(packets.length / actualRows));

            const tableWrapper = document.createElement('div');
            tableWrapper.className = 'packet-table-wrapper';

            const headerBar = document.createElement('div');
            headerBar.className = 'table-header-bar';
            headerBar.innerHTML = `
                <span>Packet Breakdown (${packets.length} pkts)</span>
                <span class="table-subtotal-tag">${grossWeight.toFixed(2)} Kg</span>
            `;
            tableWrapper.appendChild(headerBar);

            const table = document.createElement('table');
            table.className = 'breakdown-table';
            table.style.width = '100%';

            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            for (let c = 0; c < cols; c++) {
                const th1 = document.createElement('th');
                th1.textContent = 'Sr';
                const th2 = document.createElement('th');
                th2.textContent = 'Kg';
                if (cols === 1) {
                    th1.style.width = '30%';
                    th2.style.width = '70%';
                } else if (cols === 2) {
                    th1.style.width = '18%';
                    th2.style.width = '32%';
                } else {
                    th1.style.width = '12%';
                    th2.style.width = '21.33%';
                }
                headerRow.appendChild(th1);
                headerRow.appendChild(th2);
            }
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            for (let r = 0; r < actualRows; r++) {
                const tr = document.createElement('tr');
                for (let c = 0; c < cols; c++) {
                    const localIdx = c * actualRows + r;
                    const tdSr = document.createElement('td');
                    const tdWt = document.createElement('td');

                    if (localIdx < packets.length) {
                        tdSr.textContent = localIdx + 1;
                        tdWt.textContent = packets[localIdx].toFixed(2);
                    } else {
                        tdSr.textContent = '-';
                        tdWt.textContent = '-';
                    }
                    tr.appendChild(tdSr);
                    tr.appendChild(tdWt);
                }
                tbody.appendChild(tr);
            }
            table.appendChild(tbody);

            // Subtotals per column
            const tfoot = document.createElement('tfoot');
            const footerRow = document.createElement('tr');
            for (let c = 0; c < cols; c++) {
                let colSum = 0;
                for (let r = 0; r < actualRows; r++) {
                    const localIdx = c * actualRows + r;
                    if (localIdx < packets.length) {
                        colSum += packets[localIdx];
                    }
                }
                const tdLabel = document.createElement('td');
                tdLabel.innerHTML = '<strong>Tot</strong>';
                const tdSum = document.createElement('td');
                tdSum.innerHTML = colSum > 0 ? `<strong>${colSum.toFixed(2)}</strong>` : '-';
                footerRow.appendChild(tdLabel);
                footerRow.appendChild(tdSum);
            }
            tfoot.appendChild(footerRow);
            table.appendChild(tfoot);

            tableWrapper.appendChild(table);
            tablesContainer.appendChild(tableWrapper);

        } else if (currentFormat === 'thermal58') {
            // Thermal 58mm (2-Inch): Continuous mini receipt with up to 2 column pairs
            const maxCols = packets.length <= 6 ? 1 : 2;
            const actualRows = Math.ceil(packets.length / maxCols);
            const cols = Math.min(maxCols, Math.ceil(packets.length / actualRows));

            const tableWrapper = document.createElement('div');
            tableWrapper.className = 'packet-table-wrapper';

            const headerBar = document.createElement('div');
            headerBar.className = 'table-header-bar';
            headerBar.innerHTML = `
                <span>Packets (${packets.length} pkts)</span>
                <span class="table-subtotal-tag">${grossWeight.toFixed(2)} Kg</span>
            `;
            tableWrapper.appendChild(headerBar);

            const table = document.createElement('table');
            table.className = 'breakdown-table';
            table.style.width = '100%';

            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            for (let c = 0; c < cols; c++) {
                const th1 = document.createElement('th');
                th1.textContent = '#';
                const th2 = document.createElement('th');
                th2.textContent = 'Kg';
                if (cols === 1) {
                    th1.style.width = '30%';
                    th2.style.width = '70%';
                } else {
                    th1.style.width = '18%';
                    th2.style.width = '32%';
                }
                headerRow.appendChild(th1);
                headerRow.appendChild(th2);
            }
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            for (let r = 0; r < actualRows; r++) {
                const tr = document.createElement('tr');
                for (let c = 0; c < cols; c++) {
                    const localIdx = c * actualRows + r;
                    const tdSr = document.createElement('td');
                    const tdWt = document.createElement('td');

                    if (localIdx < packets.length) {
                        tdSr.textContent = localIdx + 1;
                        tdWt.textContent = packets[localIdx].toFixed(2);
                    } else {
                        tdSr.textContent = '-';
                        tdWt.textContent = '-';
                    }
                    tr.appendChild(tdSr);
                    tr.appendChild(tdWt);
                }
                tbody.appendChild(tr);
            }
            table.appendChild(tbody);

            // Subtotals per column
            const tfoot = document.createElement('tfoot');
            const footerRow = document.createElement('tr');
            for (let c = 0; c < cols; c++) {
                let colSum = 0;
                for (let r = 0; r < actualRows; r++) {
                    const localIdx = c * actualRows + r;
                    if (localIdx < packets.length) {
                        colSum += packets[localIdx];
                    }
                }
                const tdLabel = document.createElement('td');
                tdLabel.innerHTML = '<strong>T</strong>';
                const tdSum = document.createElement('td');
                tdSum.innerHTML = colSum > 0 ? `<strong>${colSum.toFixed(2)}</strong>` : '-';
                footerRow.appendChild(tdLabel);
                footerRow.appendChild(tdSum);
            }
            tfoot.appendChild(footerRow);
            table.appendChild(tfoot);

            tableWrapper.appendChild(table);
            tablesContainer.appendChild(tableWrapper);

        } else {
            // A4 Standard: Ultra-compact adaptive 4/5 column grid
            const maxCols = packets.length <= 40 ? 4 : 5;
            const rows = packets.length <= 40 ? 10 : 20;
            const packetsPerTable = rows * maxCols;
            const numTables = Math.ceil(packets.length / packetsPerTable);

            for (let t = 0; t < numTables; t++) {
                const tableStartIndex = t * packetsPerTable;
                const tableEndIndex = Math.min((t + 1) * packetsPerTable, packets.length);
                const tablePackets = packets.slice(tableStartIndex, tableEndIndex);
                const tableSubtotal = tablePackets.reduce((sum, w) => sum + w, 0);

                const actualRows = Math.min(rows, Math.ceil(tablePackets.length / maxCols));
                const cols = Math.min(maxCols, Math.ceil(tablePackets.length / actualRows));

                // Page break before continuation pages
                if (numTables > 1 && t > 0) {
                    const pageBreakDiv = document.createElement('div');
                    pageBreakDiv.className = 'html2pdf__page-break pdf-page-break';
                    tablesContainer.appendChild(pageBreakDiv);

                    const contHeader = document.createElement('div');
                    contHeader.className = 'pdf-continuation-header';
                    contHeader.innerHTML = `
                        <div class="cont-brand">AgriBill • Weighing Memo (Packet Breakdown Contd.)</div>
                        <div class="cont-details">Seller: <strong>${seller}</strong> | Buyer: <strong>${buyer}</strong> | Date: <strong>${dateStr}</strong></div>
                    `;
                    tablesContainer.appendChild(contHeader);
                }

                const tableWrapper = document.createElement('div');
                tableWrapper.className = 'packet-table-wrapper pdf-avoid-break';

                const headerBar = document.createElement('div');
                headerBar.className = 'table-header-bar';
                headerBar.innerHTML = `
                    <span>Packets ${tableStartIndex + 1} &ndash; ${tableEndIndex} (${tablePackets.length} pkts)</span>
                    <span class="table-subtotal-tag">Subtotal: <strong>${tableSubtotal.toFixed(2)} Kg</strong></span>
                `;
                tableWrapper.appendChild(headerBar);

                const tableDiv = document.createElement('div');
                tableDiv.className = 'table-responsive';

                const table = document.createElement('table');
                table.className = 'breakdown-table';
                if (cols < maxCols) {
                    table.style.width = `${(cols / maxCols) * 100}%`;
                } else {
                    table.style.width = '100%';
                }

                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                for (let c = 0; c < cols; c++) {
                    const th1 = document.createElement('th');
                    th1.textContent = 'Sr.';
                    th1.style.width = '35%';
                    const th2 = document.createElement('th');
                    th2.textContent = 'Wt (kg)';
                    th2.style.width = '65%';
                    headerRow.appendChild(th1);
                    headerRow.appendChild(th2);
                }
                thead.appendChild(headerRow);
                table.appendChild(thead);

                const tbody = document.createElement('tbody');
                for (let r = 0; r < actualRows; r++) {
                    const tr = document.createElement('tr');
                    for (let c = 0; c < cols; c++) {
                        const localIdx = c * actualRows + r;
                        const globalIdx = tableStartIndex + localIdx;
                        const tdSr = document.createElement('td');
                        const tdWt = document.createElement('td');

                        if (localIdx < tablePackets.length) {
                            tdSr.textContent = globalIdx + 1;
                            tdWt.textContent = packets[globalIdx].toFixed(2);
                        } else {
                            tdSr.textContent = '-';
                            tdWt.textContent = '-';
                        }
                        tr.appendChild(tdSr);
                        tr.appendChild(tdWt);
                    }
                    tbody.appendChild(tr);
                }
                table.appendChild(tbody);

                const tfoot = document.createElement('tfoot');
                const footerRow = document.createElement('tr');
                for (let c = 0; c < cols; c++) {
                    let colSum = 0;
                    for (let r = 0; r < actualRows; r++) {
                        const localIdx = c * actualRows + r;
                        const globalIdx = tableStartIndex + localIdx;
                        if (localIdx < tablePackets.length) {
                            colSum += packets[globalIdx];
                        }
                    }
                    const tdLabel = document.createElement('td');
                    tdLabel.innerHTML = '<strong>Total</strong>';
                    const tdSum = document.createElement('td');
                    tdSum.innerHTML = colSum > 0 ? `<strong>${colSum.toFixed(2)}</strong>` : '-';
                    footerRow.appendChild(tdLabel);
                    footerRow.appendChild(tdSum);
                }
                tfoot.appendChild(footerRow);
                table.appendChild(tfoot);

                tableDiv.appendChild(table);
                tableWrapper.appendChild(tableDiv);
                tablesContainer.appendChild(tableWrapper);
            }
        }

        // Populate Grand Summary Bar
        if (billGrandSummary) {
            billGrandSummary.innerHTML = `
                <div class="grand-summary-bar pdf-avoid-break">
                    <div class="gs-item">
                        <span class="gs-lbl">Total Packets</span>
                        <span class="gs-val">${count}</span>
                    </div>
                    <div class="gs-item">
                        <span class="gs-lbl">Gross Weight</span>
                        <span class="gs-val">${grossWeight.toFixed(2)} Kg</span>
                    </div>
                    <div class="gs-item">
                        <span class="gs-lbl">Total Deductions</span>
                        <span class="gs-val text-danger">-${totalDeduction.toFixed(2)} Kg</span>
                    </div>
                    <div class="gs-item">
                        <span class="gs-lbl">Net Weight</span>
                        <span class="gs-val">${netWeight.toFixed(2)} Kg</span>
                    </div>
                    <div class="gs-item highlight">
                        <span class="gs-lbl">Total Amount</span>
                        <span class="gs-val">${formatCurrency(totalAmount)}</span>
                    </div>
                </div>
            `;
        }

        if (billFooterNote) {
            if (currentFormat === 'thermal80') {
                billFooterNote.textContent = '*** Thank You • AgriBill Thermal 80mm ***';
            } else if (currentFormat === 'thermal58') {
                billFooterNote.textContent = '*** Thank You • AgriBill 58mm ***';
            } else {
                billFooterNote.textContent = 'Page 1 of 1 • AgriBill Smart Billing System';
            }
        }
    };

    // Format Toolbar Switcher Listeners
    const formatBtns = document.querySelectorAll('.format-tab-btn');
    formatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setPrintFormat(btn.dataset.format);
        });
    });

    if (printFormatSelect) {
        printFormatSelect.addEventListener('change', (e) => {
            setPrintFormat(e.target.value);
        });
    }

    // Event Listeners
    addPacketBtn.addEventListener('click', addPacket);

    // Import Packets Logic
    importPacketsInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            const rawValues = content.split(/[\n,;\s]+/);

            let addedCount = 0;
            rawValues.forEach(val => {
                const weight = parseFloat(val.trim());
                if (!isNaN(weight) && weight > 0) {
                    packets.push(weight);
                    addedCount++;
                }
            });

            if (addedCount > 0) {
                updatePacketList();
                alert(`Successfully imported ${addedCount} packets.`);
            } else {
                alert('No valid weights found in the file.');
            }

            importPacketsInput.value = '';
        };
        reader.readAsText(file);
    });

    // Add packet on Enter key press
    packetWeightInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addPacket();
        }
    });

    generateBillBtn.addEventListener('click', generateBill);

    printBillBtn.addEventListener('click', () => {
        if (dynamicPrintStyle) {
            if (currentFormat === 'thermal80') {
                dynamicPrintStyle.textContent = '@page { size: 80mm auto; margin: 2mm; }';
            } else if (currentFormat === 'thermal58') {
                dynamicPrintStyle.textContent = '@page { size: 58mm auto; margin: 1.5mm; }';
            } else {
                dynamicPrintStyle.textContent = '@page { size: A4 portrait; margin: 6mm; }';
            }
        }
        window.print();
    });

    // Helper: Generate Bill PDF as a Blob
    const generateBillPdfBlob = async () => {
        const billElement = document.getElementById('billContainer');
        if (!billElement || billElement.style.display === 'none') {
            throw new Error('Please generate a bill first.');
        }

        // Remember user scroll position
        const prevScrollX = window.scrollX;
        const prevScrollY = window.scrollY;

        try {
            // Scroll to (0,0) before capturing to prevent blank first page
            window.scrollTo(0, 0);

            // Hide action buttons during PDF render
            const actions = billElement.querySelector('.bill-actions');
            if (actions) actions.style.display = 'none';

            // Apply pdf-mode for clean capture
            billElement.classList.add('pdf-mode');

            // Wait 150ms for layout reflow
            await new Promise(resolve => setTimeout(resolve, 150));

            const seller = sellerNameInput.value.trim() || 'Bill';
            const safeSeller = seller.replace(/[^a-zA-Z0-9_-]/g, '_');
            const now = new Date();
            const dateStr = now.toISOString().slice(0, 10);
            const filename = `AgriBill_${currentFormat}_${safeSeller}_${dateStr}.pdf`;

            let blob;

            if (currentFormat === 'thermal80' || currentFormat === 'thermal58') {
                const jsPdfConstructor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
                if (typeof window.html2canvas === 'function' && jsPdfConstructor) {
                    const is58 = currentFormat === 'thermal58';
                    const targetWidthMm = is58 ? 58 : 80;
                    const marginMm = is58 ? 1.5 : 2;
                    const printWidthMm = targetWidthMm - (marginMm * 2);

                    const canvas = await window.html2canvas(billElement, {
                        scale: 2, // Crisp on POS receipt rolls without ballooning file size
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff',
                        scrollX: 0,
                        scrollY: 0
                    });

                    const printHeightMm = (canvas.height * printWidthMm) / canvas.width;
                    const pageHeightMm = printHeightMm + (marginMm * 2);

                    const pdf = new jsPdfConstructor({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: [targetWidthMm, pageHeightMm],
                        compress: true
                    });

                    // Use compressed JPEG (0.82) instead of heavy uncompressed PNG to reduce size by 90%+
                    const imgData = canvas.toDataURL('image/jpeg', 0.82);
                    pdf.addImage(imgData, 'JPEG', marginMm, marginMm, printWidthMm, printHeightMm, undefined, 'FAST');
                    blob = pdf.output('blob');
                } else {
                    const is58 = currentFormat === 'thermal58';
                    const targetWidth = is58 ? 58 : 80;
                    const margin = is58 ? [1.5, 1.5, 1.5, 1.5] : [2, 2, 2, 2];
                    const innerWidth = is58 ? 55 : 76;
                    const elWidth = billElement.getBoundingClientRect().width || (is58 ? 290 : 380);
                    const elHeight = Math.max(billElement.scrollHeight, billElement.offsetHeight, Math.ceil(billElement.getBoundingClientRect().height));
                    const heightMm = Math.max(80, Math.ceil((elHeight * innerWidth) / elWidth) + 12);

                    const opt = {
                        margin: margin,
                        filename: filename,
                        image: { type: 'jpeg', quality: 0.82 },
                        html2canvas: {
                            scale: 2,
                            useCORS: true,
                            scrollX: 0,
                            scrollY: 0,
                            logging: false,
                            backgroundColor: '#ffffff'
                        },
                        jsPDF: { unit: 'mm', format: [targetWidth, heightMm], orientation: 'portrait', compress: true },
                        pagebreak: { mode: [] }
                    };
                    const worker = html2pdf().set(opt).from(billElement);
                    const pdf = await worker.toPdf().get('pdf');
                    blob = pdf.output('blob');
                }
            } else {
                // A4 Standard: Optimized 1.6 scale + 0.82 JPEG quality + stream compression
                const opt = {
                    margin: [5, 5, 5, 5], // 5mm compact margins
                    filename: filename,
                    image: { type: 'jpeg', quality: 0.82 },
                    html2canvas: {
                        scale: 1.6, // High clarity (~150 DPI) with 80%+ smaller footprint than scale 2
                        useCORS: true,
                        scrollX: 0,
                        scrollY: 0,
                        logging: false,
                        backgroundColor: '#ffffff'
                    },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
                    pagebreak: { 
                        mode: ['css', 'legacy'],
                        before: '.html2pdf__page-break',
                        avoid: ['tr', '.pdf-avoid-break', '.breakdown-table', '.packet-table-wrapper', '.grand-summary-bar', '.bill-signatures']
                    }
                };
                const worker = html2pdf().set(opt).from(billElement);
                const pdf = await worker.toPdf().get('pdf');
                blob = pdf.output('blob');
            }

            return { blob, filename };

        } finally {
            // Restore UI styles
            billElement.classList.remove('pdf-mode');
            const actions = billElement.querySelector('.bill-actions');
            if (actions) actions.style.display = 'flex';

            // Restore user scroll position
            window.scrollTo(prevScrollX, prevScrollY);
        }
    };

    // Helper: Show sleek desktop notification toast for WhatsApp Web
    const showWhatsAppToast = () => {
        let toast = document.getElementById('whatsappToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'whatsappToast';
            toast.className = 'whatsapp-toast';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `
            <div class="whatsapp-toast-content">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <div>
                    <strong>PDF Downloaded &amp; WhatsApp Opened!</strong>
                    <p>Simply drag and drop or attach the downloaded PDF into your WhatsApp chat.</p>
                </div>
                <button type="button" class="toast-close-btn" onclick="this.closest('.whatsapp-toast').classList.remove('show')">&times;</button>
            </div>
        `;
        toast.classList.add('show');
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 7000);
    };

    downloadBillBtn.addEventListener('click', async () => {
        const billElement = document.getElementById('billContainer');
        if (!billElement || billElement.style.display === 'none') {
            alert('Please generate a bill first.');
            return;
        }

        const originalBtnText = downloadBillBtn.innerHTML;
        downloadBillBtn.innerHTML = `
            <svg style="width:16px;height:16px;margin-right:6px;animation:spin 1s linear infinite;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity:0.25"></circle>
                <path fill="currentColor" style="opacity:0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg> Generating PDF...
        `;
        downloadBillBtn.disabled = true;

        try {
            const { blob, filename } = await generateBillPdfBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 1000);
        } catch (err) {
            console.error('Error generating PDF:', err);
            alert('PDF generation encountered an error. You can also use the "Print Bill" button to Save as PDF directly.');
        } finally {
            downloadBillBtn.innerHTML = originalBtnText;
            downloadBillBtn.disabled = false;
        }
    });

    whatsappBillBtn.addEventListener('click', async () => {
        const billElement = document.getElementById('billContainer');
        if (!billElement || billElement.style.display === 'none') {
            alert('Please generate a bill first.');
            return;
        }

        const originalBtnText = whatsappBillBtn.innerHTML;
        whatsappBillBtn.innerHTML = `
            <svg style="width:16px;height:16px;margin-right:6px;animation:spin 1s linear infinite;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity:0.25"></circle>
                <path fill="currentColor" style="opacity:0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg> Preparing WhatsApp...
        `;
        whatsappBillBtn.disabled = true;

        try {
            const { blob, filename } = await generateBillPdfBlob();
            const pdfFile = new File([blob], filename, { type: 'application/pdf' });

            const invoiceNo = billInvoiceNo ? billInvoiceNo.textContent : currentInvoiceNo;
            const dateStr = billDate ? billDate.textContent : '';
            const seller = sellerNameInput.value.trim() || 'Cash';
            const buyer = buyerNameInput.value.trim() || 'Cash';
            const commodity = commodityNameInput.value.trim() || 'Commodity';
            const totalAmountStr = billTotalAmount ? billTotalAmount.textContent : '';
            const netWeightStr = billNetWeight ? billNetWeight.textContent : '';
            const totalPkts = packets.length;

            const targetPhone = formatWhatsAppPhone(whatsappNumberInput ? whatsappNumberInput.value.trim() : '');

            const messageSummary = 
`🌾 *AgriBill - Invoice / Weighing Memo*
📄 *Invoice No:* ${invoiceNo}
📅 *Date:* ${dateStr}
👤 *Seller:* ${seller}
🛒 *Buyer:* ${buyer}
📦 *Commodity:* ${commodity}
⚖️ *Total Packets:* ${totalPkts} pkts
⚖️ *Net Weight:* ${netWeightStr}
💰 *Total Amount:* ${totalAmountStr}

Thank you for your business!`;

            let sharedViaNavigator = false;

            // Check if Web Share API with Files is supported (mobile browsers & supported platforms)
            if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
                try {
                    await navigator.share({
                        title: `Invoice ${invoiceNo} - AgriBill`,
                        text: messageSummary,
                        files: [pdfFile]
                    });
                    sharedViaNavigator = true;
                } catch (shareErr) {
                    if (shareErr.name === 'AbortError') {
                        // User cancelled the native share dialog
                        return;
                    }
                    console.warn('Navigator share error, falling back to WhatsApp Web:', shareErr);
                }
            }

            // Fallback for Desktop WhatsApp Web or browsers without direct file sharing
            if (!sharedViaNavigator) {
                // 1. Download PDF to device
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 1000);

                // 2. Open WhatsApp chat with pre-filled summary
                const noteMsg = `${messageSummary}\n\n*(📎 PDF Invoice is downloaded to your device - attach it here to send)*`;
                const encodedMsg = encodeURIComponent(noteMsg);
                const waUrl = targetPhone
                    ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedMsg}`
                    : `https://api.whatsapp.com/send?text=${encodedMsg}`;

                window.open(waUrl, '_blank');

                // 3. Show helpful toast prompt
                showWhatsAppToast();
            }

        } catch (err) {
            console.error('Error sharing via WhatsApp:', err);
            alert('Could not prepare PDF for WhatsApp. Please download the PDF and send it manually.');
        } finally {
            whatsappBillBtn.innerHTML = originalBtnText;
            whatsappBillBtn.disabled = false;
        }
    });

    editBillBtn.addEventListener('click', () => {
        // Scroll back to top on mobile
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
