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

    // DOM Elements - Actions
    const addPacketBtn = document.getElementById('addPacketBtn');
    const importPacketsInput = document.getElementById('importPacketsInput');
    const generateBillBtn = document.getElementById('generateBillBtn');
    const printBillBtn = document.getElementById('printBillBtn');
    const downloadBillBtn = document.getElementById('downloadBillBtn');
    const editBillBtn = document.getElementById('editBillBtn');

    // DOM Elements - Packet List
    const packetList = document.getElementById('packetList');
    const packetCountSpan = document.getElementById('packetCount');
    const totalWeightStrSpan = document.getElementById('totalWeightStr');

    // DOM Elements - Bill Section
    const billContainer = document.getElementById('billContainer');
    const emptyState = document.getElementById('emptyState');

    // DOM Elements - Bill Output
    const billDate = document.getElementById('billDate');
    const billInvoiceNo = document.getElementById('billInvoiceNo');
    const billSeller = document.getElementById('billSeller');
    const billBuyer = document.getElementById('billBuyer');
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

    let currentInvoiceNo = '';

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

        // Populate Breakdown
        const tablesContainer = document.getElementById('tablesContainer');
        tablesContainer.innerHTML = '';
        if (billGrandSummary) {
            billGrandSummary.innerHTML = '';
        }

        if (packets.length > 0) {
            // Adaptive ultra-compact layout:
            // For <= 40 packets: 4 columns x 10 rows (up to 40 per table)
            // For > 40 packets: 5 columns x up to 20 rows (up to 100 per table on 1 page!)
            const maxCols = packets.length <= 40 ? 4 : 5;
            const rows = packets.length <= 40 ? 10 : 20;
            const packetsPerTable = rows * maxCols; // 40 or 100
            const numTables = Math.ceil(packets.length / packetsPerTable);

            for (let t = 0; t < numTables; t++) {
                const tableStartIndex = t * packetsPerTable;
                const tableEndIndex = Math.min((t + 1) * packetsPerTable, packets.length);
                const tablePackets = packets.slice(tableStartIndex, tableEndIndex);
                const tableSubtotal = tablePackets.reduce((sum, w) => sum + w, 0);

                const actualRows = Math.min(rows, Math.ceil(tablePackets.length / maxCols));
                const cols = Math.min(maxCols, Math.ceil(tablePackets.length / actualRows));

                // Page break before continuation pages (only if > 1 table and t > 0)
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

                // Table Container Wrapper
                const tableWrapper = document.createElement('div');
                tableWrapper.className = 'packet-table-wrapper pdf-avoid-break';

                // Table Header Bar with subtotal
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

                // Create Header
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

                // Create Body
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

                // Create Footer (Subtotal of packets per column)
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
                    if (colSum > 0) {
                        tdSum.innerHTML = `<strong>${colSum.toFixed(2)}</strong>`;
                    } else {
                        tdSum.innerHTML = '-';
                    }

                    footerRow.appendChild(tdLabel);
                    footerRow.appendChild(tdSum);
                }
                tfoot.appendChild(footerRow);
                table.appendChild(tfoot);

                tableDiv.appendChild(table);
                tableWrapper.appendChild(tableDiv);
                tablesContainer.appendChild(tableWrapper);
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

                // Add page note for print/PDF
                const finalNote = document.createElement('div');
                finalNote.className = 'page-footer-note no-screen';
                if (numTables > 1) {
                    finalNote.textContent = `Page ${numTables} of ${numTables} • AgriBill`;
                } else {
                    finalNote.textContent = 'Page 1 of 1 • AgriBill Smart Billing System';
                }
                billGrandSummary.appendChild(finalNote);
            }
        }

        // Toggle UI
        emptyState.style.display = 'none';
        billContainer.style.display = 'block';

        // Scroll to bill on mobile
        if (window.innerWidth <= 768) {
            billContainer.scrollIntoView({ behavior: 'smooth' });
        }
    };

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
        window.print();
    });

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

        // Remember user scroll position
        const prevScrollX = window.scrollX;
        const prevScrollY = window.scrollY;

        try {
            // CRITICAL FIX 1: Scroll to (0,0) before capturing to prevent blank first page
            window.scrollTo(0, 0);

            // Hide action buttons during PDF render
            const actions = billElement.querySelector('.bill-actions');
            if (actions) actions.style.display = 'none';

            // CRITICAL FIX 2: Apply pdf-mode for fixed 750px A4 printable width and zero shadows
            billElement.classList.add('pdf-mode');

            // Wait 150ms for layout reflow
            await new Promise(resolve => setTimeout(resolve, 150));

            const seller = sellerNameInput.value.trim() || 'Bill';
            const safeSeller = seller.replace(/[^a-zA-Z0-9_-]/g, '_');
            const now = new Date();
            const dateStr = now.toISOString().slice(0, 10);
            const filename = `AgriBill_${safeSeller}_${dateStr}.pdf`;

            const opt = {
                margin: [5, 5, 5, 5], // 5mm compact margins
                filename: filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    scrollX: 0,
                    scrollY: 0,
                    logging: false,
                    backgroundColor: '#ffffff'
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { 
                    mode: ['css', 'legacy'],
                    before: '.html2pdf__page-break',
                    avoid: ['tr', '.pdf-avoid-break', '.breakdown-table', '.packet-table-wrapper', '.grand-summary-bar', '.bill-signatures']
                }
            };

            await html2pdf().set(opt).from(billElement).save();

        } catch (err) {
            console.error('Error generating PDF:', err);
            alert('PDF generation encountered an error. You can also use the "Print Bill" button to Save as PDF directly.');
        } finally {
            // Restore UI styles
            billElement.classList.remove('pdf-mode');
            const actions = billElement.querySelector('.bill-actions');
            if (actions) actions.style.display = 'flex';

            // Restore user scroll position
            window.scrollTo(prevScrollX, prevScrollY);
            downloadBillBtn.innerHTML = originalBtnText;
            downloadBillBtn.disabled = false;
        }
    });

    editBillBtn.addEventListener('click', () => {
        // Scroll back to top on mobile
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
