/**
 * EPI CENTRALIZED MANAGEMENT SYSTEM — UNIFIED PERSISTENT DATA ARCHITECTURE
 * Primary: IndexedDB ('epi_unified_database_v2')
 * Redundancy: LocalStorage sync for instant synchronous hydration and cross-tab reactivity
 * Complete data relationships across Sales, Service, Accounts ERP, and Admin.
 */

import { today, addDays, uid } from '../modules/sales/utils/helpers.js';
import { sync as syncServiceWorks } from '../modules/service/services/domain.js';
import { DEFAULT_COA } from '../modules/erp/services/erpStorage.js';

const IDB_NAME = 'epi_unified_database_v2';
const IDB_VERSION = 2;

const STORAGE_KEYS = {
  CLIENTS: 'epi_unified_clients_v2',
  SALES_WORK: 'epi_sales_work_v2',
  SALES_HISTORY: 'epi_sales_history_v2',
  SALES_OFFICE: 'epi_sales_office_v2',
  SERVICE_WORKS: 'epi_service_works_v2',
  SERVICE_SETTINGS: 'epi_service_settings_v2',
  ERP_STORE: 'epi_erp_storage_v1',
  CENTRAL_USERS: 'epi_central_users_v1',
  CENTRAL_AUDIT: 'epi_central_audit_logs_v1',
};

// --- INITIAL REALISTIC DEMO DATA SEED FACTORY ---
export function createRealisticSeedData() {
  const T = today();
  const past3M = addDays(T, -90);
  const past15D = addDays(T, -15);
  const past10D = addDays(T, -10);
  const past45D = addDays(T, -45);
  const past100D = addDays(T, -100);
  const past400D = addDays(T, -400);

  // 1. Shared Clients (Connected across Sales, Service, and ERP)
  const clients = [
    {
      id: 'c-trust-01',
      name: 'MD. MAHMUDUL HASAN (MOON)',
      company: 'TRUST MACHINERIES CO., LTD',
      desig: 'DIRECTOR',
      phone: '+88 01778-249416',
      email: 'hasan@trustmachineries.com',
      address: 'Flat #A-5, House #19, Lane #1, Block #A, Section #06, Mirpur, Dhaka-1216',
      clientType: 'Sales',
      category: 'Quotation',
      previousStatus: 'Potential',
      productType: 'UPS',
      product: 'Online UPS 10kVA 3:1',
      model: 'EPI-OL10K-31',
      serial: 'SN-EPI-904128',
      quantity: 1,
      saleDate: past15D,
      wUnit: 'years',
      wValue: 1,
      wType: '1',
      wMonths: 12,
      lastDate: T,
      lastMethod: 'Call',
      nextDate: T,
      notes: 'Requested official quotation with battery rack and installation commissioning.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'c-alpha-02',
      name: 'Engr. Rahim Uddin',
      company: 'Alpha Traders & Logistics',
      desig: 'General Manager (Operations)',
      phone: '+88 01711-000001',
      email: 'rahim@alphatraders.com.bd',
      address: 'Motijheel Commercial Area, Dhaka-1000',
      clientType: 'Sales',
      category: 'Order Won',
      previousStatus: 'Negotiation',
      productType: 'UPS',
      product: 'Online UPS 3kVA',
      model: 'EPI-OL3K',
      serial: 'SN-EPI-882194',
      quantity: 2,
      saleDate: past3M,
      wUnit: 'years',
      wValue: 1,
      wType: '1',
      wMonths: 12,
      lastDate: past3M,
      lastMethod: 'Visit',
      nextDate: addDays(T, 5),
      notes: 'Periodic maintenance scheduled. Client very satisfied with uptime.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'c-beta-03',
      name: 'Karim Hasan',
      company: 'Beta Pharmaceuticals Ltd',
      desig: 'Head of Quality Assurance',
      phone: '+88 01811-000002',
      email: 'k.hasan@betapharma.com',
      address: 'Plot 42, Tongi Industrial Area, Gazipur',
      clientType: 'Sales',
      category: 'Order Won',
      previousStatus: 'Quotation',
      productType: 'UPS',
      product: 'Line Interactive UPS 1kVA',
      model: 'EPI-LI1K',
      serial: 'SN-EPI-771923',
      quantity: 5,
      saleDate: addDays(past3M, 1),
      wUnit: 'years',
      wValue: 2,
      wType: '2',
      wMonths: 24,
      lastDate: past15D,
      lastMethod: 'Meeting',
      nextDate: addDays(T, 14),
      notes: 'Lab equipment protected by EPI UPS. Extended 2-year warranty active.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'c-gamma-04',
      name: 'Sultana Akter',
      company: 'Gamma Bank Ltd - Principal Branch',
      desig: 'Senior Executive (IT & Infra)',
      phone: '+88 01911-000003',
      email: 'sultana.akter@gammabank.com',
      address: 'Dilkusha Commercial Area, Dhaka',
      clientType: 'Servicing',
      category: 'Order Won',
      previousStatus: 'Negotiation',
      productType: 'UPS',
      product: 'Online UPS 10kVA',
      model: 'EPI-OL10K',
      serial: 'SN-EPI-664819',
      quantity: 1,
      saleDate: past100D,
      wUnit: 'years',
      wValue: 1,
      wType: '1',
      wMonths: 12,
      lastDate: addDays(T, -7),
      lastMethod: 'Visit',
      nextDate: addDays(T, 2),
      notes: 'Server room backup. Needs routine quarterly capacitor and battery load test.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'c-delta-05',
      name: 'Jamal Khan',
      company: 'Delta Mills & Spinning Ltd',
      desig: 'Chief Electrical Engineer',
      phone: '+88 01611-000004',
      email: 'jamal@deltamills.com.bd',
      address: 'Kachpur, Narayanganj',
      clientType: 'Maintenance',
      category: 'Order Won',
      previousStatus: 'Order Won',
      productType: 'UPS',
      product: 'Offline UPS 650VA',
      model: 'EPI-OF650',
      serial: 'SN-EPI-551930',
      quantity: 10,
      saleDate: past400D,
      wUnit: 'years',
      wValue: 1,
      wType: '1',
      wMonths: 12,
      lastDate: addDays(T, -30),
      lastMethod: 'Call',
      nextDate: addDays(T, 7),
      notes: 'Annual Maintenance Contract (AMC) active. Scheduled battery replacement.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'c-omega-06',
      name: 'Dr. Nadia Islam',
      company: 'Omega Diagnostic & Imaging Center',
      desig: 'Managing Director',
      phone: '+88 01511-000005',
      email: 'nadia@omegadiagnostic.org',
      address: 'Road #27, Dhanmondi, Dhaka',
      clientType: 'Sales',
      category: 'Negotiation',
      previousStatus: 'Quotation',
      productType: 'UPS',
      product: 'Online UPS 6kVA Isolation',
      model: 'EPI-OL6K-ISO',
      serial: 'SN-EPI-442187',
      quantity: 1,
      saleDate: past15D,
      wUnit: 'months',
      wValue: 18,
      wType: 'custom',
      wMonths: 18,
      lastDate: T,
      lastMethod: 'Meeting',
      nextDate: addDays(T, 3),
      notes: 'Protecting MRI & Ultrasound scanners. Price proposal under board review.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'c-apex-07',
      name: 'Faruk Ahmed',
      company: 'Apex Textile & Garments Ltd',
      desig: 'Deputy Manager (Procurement)',
      phone: '+88 01722-110022',
      email: 'faruk.ahmed@apexgarments.com',
      address: 'Ashulia, Savar, Dhaka',
      clientType: 'Servicing',
      category: 'Potential',
      previousStatus: 'Initial: Potential',
      productType: 'AVR',
      product: 'Industrial AVR 5kVA',
      model: 'EPI-AVR5K',
      serial: 'SN-EPI-339102',
      quantity: 2,
      saleDate: addDays(T, -20),
      wUnit: 'months',
      wValue: 6,
      wType: 'custom',
      wMonths: 6,
      lastDate: addDays(T, -5),
      lastMethod: 'Call',
      nextDate: addDays(T, 1),
      notes: 'High voltage fluctuations reported. Voltage calibration scheduled.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'c-horizon-08',
      name: 'Mina Chowdhury',
      company: 'Horizon Commercial Tower',
      desig: 'Facility Manager',
      phone: '+88 01833-220044',
      email: 'mina@horizontower.bd',
      address: 'Gulshan Avenue, Gulshan-2, Dhaka',
      clientType: 'Maintenance',
      category: 'Order Won',
      previousStatus: 'Negotiation',
      productType: 'Battery',
      product: 'SMF VRLA Battery 12V 100Ah',
      model: 'EPI-BAT100',
      serial: 'SN-EPI-221098',
      quantity: 16,
      saleDate: past45D,
      wUnit: 'years',
      wValue: 1,
      wType: '1',
      wMonths: 12,
      lastDate: addDays(T, -10),
      lastMethod: 'Visit',
      nextDate: addDays(T, 10),
      notes: '16-battery rack installed. Quarterly terminal torque and electrolyte test.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // 2. Sales Daily Tasks & Follow-ups
  const salesWork = [
    {
      id: 'sw-01',
      date: T,
      time: '10:30',
      text: 'Follow-up with Trust Machineries (Mr. Mahmudul Hasan) on 10kVA quotation & bank guarantee terms',
      clientId: 'c-trust-01',
      notes: 'Discuss payment installment schedule and delivery timeline.',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sw-02',
      date: T,
      time: '12:00',
      text: 'Submit revised technical specification sheet to Omega Diagnostic Center (Dr. Nadia Islam)',
      clientId: 'c-omega-06',
      notes: 'Emphasize medical isolation transformer features and zero transfer time.',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sw-03',
      date: T,
      time: '15:00',
      text: 'Site survey and power audit at Beximco Industrial Complex for new 20kVA Online UPS setup',
      clientId: '',
      notes: 'Inspect main distribution board, ground earthing, and room ventilation.',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sw-04',
      date: addDays(T, 1),
      time: '11:00',
      text: 'Meeting with Apex Textile regarding AVR 5kVA installation and voltage stabilizers',
      clientId: 'c-apex-07',
      notes: 'Prepare comparative ROI document against competitor brands.',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sw-05',
      date: addDays(T, -1),
      time: '14:30',
      text: 'Finalized purchase order agreement with Alpha Traders for 2 units of EPI-OL3K',
      clientId: 'c-alpha-02',
      notes: 'Client confirmed 50% advance check deposited.',
      status: 'Completed',
      actualTime: '15:10',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // 3. Sales History Log
  const salesHistory = [
    {
      id: 'sh-01',
      date: T,
      time: '10:45',
      type: 'Follow-up',
      clientId: 'c-trust-01',
      client: 'MD. MAHMUDUL HASAN (MOON)',
      company: 'TRUST MACHINERIES CO., LTD',
      desig: 'DIRECTOR',
      phone: '+88 01778-249416',
      email: 'hasan@trustmachineries.com',
      previousStatus: 'Potential',
      category: 'Quotation',
      followType: 'Call',
      nextDate: T,
      notes: 'Discussed revised quotation. Client requested tax clearance documentation.',
      status: 'Completed',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sh-02',
      date: addDays(T, -2),
      time: '14:00',
      type: 'Meeting',
      clientId: 'c-omega-06',
      client: 'Dr. Nadia Islam',
      company: 'Omega Diagnostic & Imaging Center',
      desig: 'Managing Director',
      phone: '+88 01511-000005',
      email: 'nadia@omegadiagnostic.org',
      previousStatus: 'Quotation',
      category: 'Negotiation',
      followType: 'Meeting',
      nextDate: addDays(T, 3),
      notes: 'Presented technical catalogue. Board requested discount for upfront payment.',
      status: 'Completed',
      createdAt: new Date().toISOString(),
    },
  ];

  // 4. Sales Office Attendance
  const salesOffice = [
    {
      date: T,
      in: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      out: '',
    },
    {
      date: addDays(T, -1),
      in: `${addDays(T, -1)}T09:15:00.000Z`,
      out: `${addDays(T, -1)}T18:30:00.000Z`,
    },
    {
      date: addDays(T, -2),
      in: `${addDays(T, -2)}T09:20:00.000Z`,
      out: `${addDays(T, -2)}T18:15:00.000Z`,
    },
  ];

  // 5. Service Department Work Orders (All 5 Categories)
  const serviceWorks = [
    {
      id: 'srv-01',
      title: 'Install & Commission 10kVA Online UPS with Battery Cabinet',
      category: 'Installation',
      priority: 'High',
      date: T,
      time: '11:00',
      engineer: 'Sabbir',
      clientId: 'c-trust-01',
      clientName: 'MD. MAHMUDUL HASAN (MOON)',
      clientCompany: 'TRUST MACHINERIES CO., LTD',
      clientPhone: '+88 01778-249416',
      clientAddress: 'Mirpur, Dhaka-1216',
      desc: 'Complete electrical rack mount, 3-phase input cabling, output PDU connection, and load bank test.',
      notes: 'Check neutral-to-ground voltage before power up. Bring 16mm copper cable lugs.',
      status: 'pending',
      doneAt: '',
    },
    {
      id: 'srv-02',
      title: 'Quarterly Battery Bank Voltage & Impedance Inspection',
      category: 'Maintenance',
      priority: 'Normal',
      date: T,
      time: '14:30',
      engineer: 'Tanvir',
      clientId: 'c-horizon-08',
      clientName: 'Mina Chowdhury',
      clientCompany: 'Horizon Commercial Tower',
      clientPhone: '+88 01833-220044',
      clientAddress: 'Gulshan Avenue, Gulshan-2, Dhaka',
      desc: 'Check 16x 12V 100Ah batteries. Clean terminals, apply petroleum jelly, and measure individual block float voltages.',
      notes: 'Record float voltage in AMC service book.',
      status: 'pending',
      doneAt: '',
    },
    {
      id: 'srv-03',
      title: 'AVR Voltage Step-Down & Relay Calibration',
      category: 'Servicing',
      priority: 'Urgent',
      date: addDays(T, 1),
      time: '10:30',
      engineer: 'Sabbir',
      clientId: 'c-apex-07',
      clientName: 'Faruk Ahmed',
      clientCompany: 'Apex Textile & Garments Ltd',
      clientPhone: '+88 01722-110022',
      clientAddress: 'Ashulia, Savar, Dhaka',
      desc: 'Servo motor calibration and control PCB sensor inspection on 5kVA industrial AVR.',
      notes: 'Client reported intermittent trip during peak morning power shifts.',
      status: 'pending',
      doneAt: '',
    },
    {
      id: 'srv-04',
      title: 'Server Room Main UPS Commissioning & Earthing Audit',
      category: 'Installation',
      priority: 'High',
      date: addDays(T, 2),
      time: '12:00',
      engineer: 'Sabbir',
      clientId: '',
      clientName: 'Rafiqul Islam',
      clientCompany: 'Vertex Power Solutions',
      clientPhone: '01799-334455',
      clientAddress: 'Plot 12, Gazipur Industrial Area, Dhaka',
      desc: 'Commissioning of 10kVA redundant UPS for high-speed fiber backbone.',
      notes: 'Ensure isolated earth resistance is below 1.5 Ohms.',
      status: 'pending',
      doneAt: '',
    },
    {
      id: 'srv-05',
      title: 'Warehouse Emergency Spare Parts Stock Audit & Battery Charging',
      category: 'General',
      priority: 'Normal',
      date: addDays(T, 1),
      time: '15:00',
      engineer: 'Rafi',
      clientId: '',
      clientName: 'Central Logistics Desk',
      clientCompany: 'EPI Central Hub - Warehouse',
      clientPhone: '02-988888',
      clientAddress: 'Motijheel C/A, Dhaka',
      desc: 'Top-up float charge on all stored backup batteries. Verify IGBT module inventory.',
      notes: 'Ensure 12V 7Ah, 100Ah, and 200Ah reserve stocks match system inventory.',
      status: 'pending',
      doneAt: '',
    },
    {
      id: 'srv-06',
      title: 'Semi-Annual UPS Deep Servicing & Dust Cleaning',
      category: 'Servicing',
      priority: 'Normal',
      date: addDays(T, -5),
      time: '11:00',
      engineer: 'Tanvir',
      clientId: 'c-gamma-04',
      clientName: 'Sultana Akter',
      clientCompany: 'Gamma Bank Ltd - Principal Branch',
      clientPhone: '+88 01911-000003',
      clientAddress: 'Dilkusha Commercial Area, Dhaka',
      desc: 'Clean heat sinks, test cooling fans, and inspect DC bus capacitors.',
      notes: 'Full service report signed by Bank IT Manager.',
      status: 'done',
      doneAt: addDays(T, -5),
    },
  ];

  const serviceSettings = {
    company: 'EPI UPS Bangladesh Limited — Technical Service Center',
    engineers: 'Sabbir, Tanvir, Rafi, Shanto',
  };

  // 6. Complete Accounts / ERP Balanced Double-Entry Ledger Store
  const erpAccounts = DEFAULT_COA.map(([code, name, type, subType, sysKey, cashFlowCategory], idx) => ({
    _id: `acc-${idx + 1}`,
    code,
    name,
    type,
    subType,
    sysKey: sysKey || undefined,
    cashFlowCategory,
    active: true,
    debit: 0,
    credit: 0,
    balance: 0,
  }));

  const erpParties = [
    {
      _id: 'party-cust-01',
      name: 'TRUST MACHINERIES CO., LTD',
      type: 'customer',
      phone: '+88 01778-249416',
      email: 'hasan@trustmachineries.com',
      address: 'Mirpur, Dhaka-1216',
      creditLimit: 500000,
      balance: 172500,
      active: true,
      createdAt: past15D,
    },
    {
      _id: 'party-cust-02',
      name: 'Alpha Traders & Logistics',
      type: 'customer',
      phone: '+88 01711-000001',
      email: 'rahim@alphatraders.com.bd',
      address: 'Motijheel C/A, Dhaka',
      creditLimit: 300000,
      balance: 55000,
      active: true,
      createdAt: past3M,
    },
    {
      _id: 'party-cust-03',
      name: 'Gamma Bank Ltd',
      type: 'customer',
      phone: '+88 01911-000003',
      email: 'sultana.akter@gammabank.com',
      address: 'Dilkusha, Dhaka',
      creditLimit: 1000000,
      balance: 0,
      active: true,
      createdAt: past100D,
    },
    {
      _id: 'party-supp-01',
      name: 'EPI Global Power Technologies HK Ltd',
      type: 'supplier',
      phone: '+852 2345 6789',
      email: 'orders@epi-power.hk',
      address: 'Kowloon Bay, Hong Kong',
      creditLimit: 2000000,
      balance: 450000,
      active: true,
      createdAt: past100D,
    },
    {
      _id: 'party-supp-02',
      name: 'Yuasa Battery Bangladesh Ltd',
      type: 'supplier',
      phone: '+88 02 9887766',
      email: 'sales@yuasabd.com',
      address: 'Tejgaon Industrial Area, Dhaka',
      creditLimit: 800000,
      balance: 120000,
      active: true,
      createdAt: past100D,
    },
  ];

  const erpItems = [
    {
      _id: 'item-01',
      code: 'UPS-OL-10KVA',
      name: 'EPI Online UPS 10kVA 3:1 (EPI-OL10K)',
      category: 'UPS Systems',
      costPrice: 110000,
      sellingPrice: 150000,
      stockOnHand: 4,
      unit: 'Unit',
      active: true,
    },
    {
      _id: 'item-02',
      code: 'UPS-OL-3KVA',
      name: 'EPI Online UPS 3kVA (EPI-OL3K)',
      category: 'UPS Systems',
      costPrice: 32000,
      sellingPrice: 48000,
      stockOnHand: 8,
      unit: 'Unit',
      active: true,
    },
    {
      _id: 'item-03',
      code: 'UPS-LI-1KVA',
      name: 'EPI Line Interactive 1kVA (EPI-LI1K)',
      category: 'UPS Systems',
      costPrice: 5500,
      sellingPrice: 8500,
      stockOnHand: 22,
      unit: 'Unit',
      active: true,
    },
    {
      _id: 'item-04',
      code: 'BAT-SMF-100AH',
      name: 'EPI VRLA SMF Deep Cycle Battery 12V 100Ah',
      category: 'Batteries',
      costPrice: 13500,
      sellingPrice: 18500,
      stockOnHand: 32,
      unit: 'Pcs',
      active: true,
    },
    {
      _id: 'item-05',
      code: 'AVR-IND-5KVA',
      name: 'Industrial Servo AVR 5kVA Single Phase',
      category: 'AVR / Regulators',
      costPrice: 18000,
      sellingPrice: 26000,
      stockOnHand: 6,
      unit: 'Unit',
      active: true,
    },
  ];

  const erpInvoices = [
    {
      _id: 'inv-001',
      invoiceNumber: 'INV-2026-0001',
      type: 'sale',
      partyId: 'party-cust-01',
      partyName: 'TRUST MACHINERIES CO., LTD',
      date: past15D,
      dueDate: addDays(past15D, 30),
      status: 'posted',
      lines: [
        {
          itemId: 'item-01',
          description: 'EPI Online UPS 10kVA 3:1 (EPI-OL10K)',
          quantity: 1,
          unitPrice: 150000,
          vatRate: 15,
          vatAmount: 22500,
          total: 172500,
        },
      ],
      subTotal: 150000,
      vatTotal: 22500,
      total: 172500,
      paidAmount: 0,
      balanceDue: 172500,
      notes: 'Sale of Online UPS with official Mushak-9.1 VAT invoice.',
      createdAt: past15D,
    },
    {
      _id: 'inv-002',
      invoiceNumber: 'INV-2026-0002',
      type: 'sale',
      partyId: 'party-cust-02',
      partyName: 'Alpha Traders & Logistics',
      date: past3M,
      dueDate: addDays(past3M, 30),
      status: 'paid',
      lines: [
        {
          itemId: 'item-02',
          description: 'EPI Online UPS 3kVA (EPI-OL3K)',
          quantity: 2,
          unitPrice: 48000,
          vatRate: 15,
          vatAmount: 14400,
          total: 110400,
        },
      ],
      subTotal: 96000,
      vatTotal: 14400,
      total: 110400,
      paidAmount: 110400,
      balanceDue: 0,
      notes: 'Full payment received via bank transfer.',
      createdAt: past3M,
    },
    {
      _id: 'bill-001',
      invoiceNumber: 'BILL-2026-0001',
      type: 'purchase',
      partyId: 'party-supp-01',
      partyName: 'EPI Global Power Technologies HK Ltd',
      date: past45D,
      dueDate: addDays(past45D, 45),
      status: 'posted',
      lines: [
        {
          itemId: 'item-01',
          description: 'Factory import 5x Online UPS 10kVA',
          quantity: 5,
          unitPrice: 110000,
          vatRate: 0,
          vatAmount: 0,
          total: 550000,
        },
      ],
      subTotal: 550000,
      vatTotal: 0,
      total: 550000,
      paidAmount: 100000,
      balanceDue: 450000,
      notes: 'Letter of credit import consignment #HK-8819.',
      createdAt: past45D,
    },
  ];

  const erpPayments = [
    {
      _id: 'pay-001',
      paymentNumber: 'REC-2026-0001',
      type: 'receipt',
      partyId: 'party-cust-02',
      partyName: 'Alpha Traders & Logistics',
      date: addDays(past3M, 10),
      amount: 110400,
      paymentMethod: 'bank',
      bankAccount: '1010', // Cash at Bank - Main
      invoiceId: 'inv-002',
      notes: 'Payment received via City Bank Online RTGS transfer.',
      createdAt: addDays(past3M, 10),
    },
    {
      _id: 'pay-002',
      paymentNumber: 'PAY-2026-0001',
      type: 'payment',
      partyId: 'party-supp-01',
      partyName: 'EPI Global Power Technologies HK Ltd',
      date: addDays(past45D, 15),
      amount: 100000,
      paymentMethod: 'bank',
      bankAccount: '1010',
      invoiceId: 'bill-001',
      notes: 'Part settlement for shipment invoice #BILL-2026-0001.',
      createdAt: addDays(past45D, 15),
    },
  ];

  const erpExpenses = [
    {
      _id: 'exp-001',
      expenseNumber: 'EXP-2026-0001',
      date: past15D,
      accountCode: '5020', // Rent
      accountName: 'Office Rent & Facilities',
      amount: 45000,
      paymentMethod: 'bank',
      payee: 'Motijheel Tower Management',
      notes: 'Monthly corporate office rent for EPI Bangladesh Headquarters.',
      createdAt: past15D,
    },
    {
      _id: 'exp-002',
      expenseNumber: 'EXP-2026-0002',
      date: past10D,
      accountCode: '5030', // Utilities
      accountName: 'Electricity & Utilities',
      amount: 12500,
      paymentMethod: 'bank',
      payee: 'DESCO - Dhaka Electric Supply',
      notes: 'Office and testing bench electricity bill.',
      createdAt: past10D,
    },
    {
      _id: 'exp-003',
      expenseNumber: 'EXP-2026-0003',
      date: addDays(T, -2),
      accountCode: '5050', // Travel & Transport
      accountName: 'Vehicle, Fuel & Conveyance',
      amount: 6800,
      paymentMethod: 'cash',
      payee: 'Service Engineering Dispatch Team',
      notes: 'Fuel and toll expenses for site visits at Mirpur, Tongi, and Ashulia.',
      createdAt: addDays(T, -2),
    },
  ];

  const erpJournals = [
    {
      _id: 'jv-001',
      entryNo: 'JV-2026-0001',
      date: new Date(past100D).toISOString(),
      voucherType: 'journal',
      narration: 'Opening Capital & Initial Bank Deposit',
      reference: 'OPEN-CAPITAL',
      source: { kind: 'Opening' },
      status: 'posted',
      lines: [
        { account: { code: '1010', name: 'Cash at Bank - Main', type: 'asset' }, debit: 1000000, credit: 0, memo: 'Bank deposit into corporate account' },
        { account: { code: '1000', name: 'Cash in Hand', type: 'asset' }, debit: 100000, credit: 0, memo: 'Petty cash opening' },
        { account: { code: '3000', name: "Owner's Capital", type: 'equity' }, debit: 0, credit: 1100000, memo: 'Shareholder equity' },
      ],
      totalDebit: 1100000,
      totalCredit: 1100000,
      createdAt: past100D,
    },
    {
      _id: 'jv-002',
      entryNo: 'JV-2026-0002',
      date: new Date(past15D).toISOString(),
      voucherType: 'sales',
      narration: 'Invoice Posting: INV-2026-0001 (TRUST MACHINERIES)',
      reference: 'INV-2026-0001',
      source: { kind: 'Invoice', id: 'inv-001' },
      status: 'posted',
      lines: [
        { account: { code: '1100', name: 'Accounts Receivable', type: 'asset' }, debit: 172500, credit: 0, memo: 'Trust Machineries 10kVA UPS' },
        { account: { code: '4000', name: 'Sales Revenue', type: 'income' }, debit: 0, credit: 150000, memo: 'Product sale' },
        { account: { code: '2100', name: 'VAT Payable (Output)', type: 'liability' }, debit: 0, credit: 22500, memo: '15% Mushak-9.1 output VAT' },
      ],
      totalDebit: 172500,
      totalCredit: 172500,
      createdAt: past15D,
    },
    {
      _id: 'jv-003',
      entryNo: 'JV-2026-0003',
      date: new Date(past3M).toISOString(),
      voucherType: 'sales',
      narration: 'Invoice Posting: INV-2026-0002 (Alpha Traders)',
      reference: 'INV-2026-0002',
      source: { kind: 'Invoice', id: 'inv-002' },
      status: 'posted',
      lines: [
        { account: { code: '1100', name: 'Accounts Receivable', type: 'asset' }, debit: 110400, credit: 0, memo: 'Alpha Traders 3kVA UPS' },
        { account: { code: '4000', name: 'Sales Revenue', type: 'income' }, debit: 0, credit: 96000, memo: 'Product sale' },
        { account: { code: '2100', name: 'VAT Payable (Output)', type: 'liability' }, debit: 0, credit: 14400, memo: '15% Mushak-9.1 output VAT' },
      ],
      totalDebit: 110400,
      totalCredit: 110400,
      createdAt: past3M,
    },
    {
      _id: 'jv-004',
      entryNo: 'JV-2026-0004',
      date: new Date(addDays(past3M, 10)).toISOString(),
      voucherType: 'payment',
      narration: 'Payment Receipt: REC-2026-0001 (Alpha Traders Full Settlement)',
      reference: 'REC-2026-0001',
      source: { kind: 'Payment', id: 'pay-001' },
      status: 'posted',
      lines: [
        { account: { code: '1010', name: 'Cash at Bank - Main', type: 'asset' }, debit: 110400, credit: 0, memo: 'Customer bank settlement' },
        { account: { code: '1100', name: 'Accounts Receivable', type: 'asset' }, debit: 0, credit: 110400, memo: 'Receivable cleared' },
      ],
      totalDebit: 110400,
      totalCredit: 110400,
      createdAt: addDays(past3M, 10),
    },
    {
      _id: 'jv-005',
      entryNo: 'JV-2026-0005',
      date: new Date(past15D).toISOString(),
      voucherType: 'expense',
      narration: 'Rent Expense Voucher: EXP-2026-0001',
      reference: 'EXP-2026-0001',
      source: { kind: 'Expense', id: 'exp-001' },
      status: 'posted',
      lines: [
        { account: { code: '5110', name: 'Office Rent', type: 'expense' }, debit: 45000, credit: 0, memo: 'Headquarters monthly rent' },
        { account: { code: '1010', name: 'Cash at Bank - Main', type: 'asset' }, debit: 0, credit: 45000, memo: 'Bank transfer payment' },
      ],
      totalDebit: 45000,
      totalCredit: 45000,
      createdAt: past15D,
    },
  ];

  // Post initial journal entries into account balances to ensure strictly balanced double-entry books
  for (const j of erpJournals) {
    if (j.lines) {
      for (const l of j.lines) {
        const code = l.account?.code || l.accountCode;
        const target = erpAccounts.find(a => a.code === code);
        if (target) {
          l.account = { _id: target._id, code: target.code, name: target.name, type: target.type };
          target.debit = Math.round((target.debit + (Number(l.debit) || 0)) * 100) / 100;
          target.credit = Math.round((target.credit + (Number(l.credit) || 0)) * 100) / 100;
          target.balance = ['asset', 'expense'].includes(target.type)
            ? Math.round((target.debit - target.credit) * 100) / 100
            : Math.round((target.credit - target.debit) * 100) / 100;
        }
      }
    }
  }

  const erpEmployees = [
    {
      _id: 'emp-01',
      employeeId: 'EPI-EMP-001',
      name: 'Engr. Sabbir Rahman',
      designation: 'Senior Service Engineer',
      department: 'Service',
      phone: '+88 01711-223344',
      email: 'sabbir@epiups.com.bd',
      joiningDate: '2025-01-15',
      basicSalary: 35000,
      houseRent: 15000,
      medicalAllowance: 5000,
      conveyance: 5000,
      grossSalary: 60000,
      active: true,
    },
    {
      _id: 'emp-02',
      employeeId: 'EPI-EMP-002',
      name: 'Tanvir Ahmed',
      designation: 'Service Specialist',
      department: 'Service',
      phone: '+88 01822-334455',
      email: 'tanvir@epiups.com.bd',
      joiningDate: '2025-06-01',
      basicSalary: 28000,
      houseRent: 12000,
      medicalAllowance: 4000,
      conveyance: 4000,
      grossSalary: 48000,
      active: true,
    },
    {
      _id: 'emp-03',
      employeeId: 'EPI-EMP-003',
      name: 'Rafiul Islam (Rafi)',
      designation: 'Field Technician',
      department: 'Service',
      phone: '+88 01933-445566',
      email: 'rafi@epiups.com.bd',
      joiningDate: '2025-09-01',
      basicSalary: 20000,
      houseRent: 8000,
      medicalAllowance: 3500,
      conveyance: 3500,
      grossSalary: 35000,
      active: true,
    },
    {
      _id: 'emp-04',
      employeeId: 'EPI-EMP-004',
      name: 'Shanto Mia',
      designation: 'Sales & Business Development Lead',
      department: 'Sales',
      phone: '+88 01644-556677',
      email: 'shanto@epiups.com.bd',
      joiningDate: '2024-11-01',
      basicSalary: 40000,
      houseRent: 18000,
      medicalAllowance: 6000,
      conveyance: 6000,
      grossSalary: 70000,
      active: true,
    },
  ];

  const erpAssets = [
    {
      _id: 'asset-01',
      code: 'AST-001',
      name: 'Service Testing Bench & High-Precision Oscilloscope',
      category: 'Equipment',
      purchaseDate: past100D,
      purchasePrice: 180000,
      salvageValue: 20000,
      usefulLifeYears: 5,
      depreciationMethod: 'straight_line',
      accumulatedDepreciation: 6000,
      currentBookValue: 174000,
      location: 'Service Testing Lab',
      status: 'active',
    },
    {
      _id: 'asset-02',
      code: 'AST-002',
      name: 'Service Engineering Dispatch Van (Toyota HiAce)',
      category: 'Vehicles',
      purchaseDate: past400D,
      purchasePrice: 1400000,
      salvageValue: 400000,
      usefulLifeYears: 8,
      depreciationMethod: 'straight_line',
      accumulatedDepreciation: 125000,
      currentBookValue: 1275000,
      location: 'Central Headquarters Garage',
      status: 'active',
    },
  ];

  // 7. Initial Users (All preloaded with bcrypt hash for 'password123')
  const defaultPwHash = '$2b$10$KalKOUb5ySkL5cNzchRM0OlFkdSGnCkkgzjgTcScWQxxViI0sXknK';
  const users = [
    {
      id: 'usr-admin-01',
      userId: 'admin',
      name: 'Super Administrator',
      email: 'admin@epiups.com.bd',
      passwordHash: defaultPwHash,
      role: 'superadmin',
      departments: ['sales', 'service', 'accounts'],
      departmentRoles: { sales: 'admin', service: 'admin', accounts: 'admin' },
      status: 'active',
      createdAt: new Date().toISOString(),
      loginHistory: [],
    },
    {
      id: 'usr-sales-01',
      userId: 'sales1',
      name: 'Shanto Mia (Sales Lead)',
      email: 'sales@epiups.com.bd',
      passwordHash: defaultPwHash,
      role: 'employee',
      departments: ['sales'],
      departmentRoles: { sales: 'sales' },
      status: 'active',
      createdAt: new Date().toISOString(),
      loginHistory: [],
    },
    {
      id: 'usr-service-01',
      userId: 'service1',
      name: 'Engr. Sabbir Rahman (Service)',
      email: 'service@epiups.com.bd',
      passwordHash: defaultPwHash,
      role: 'employee',
      departments: ['service'],
      departmentRoles: { service: 'engineer' },
      status: 'active',
      createdAt: new Date().toISOString(),
      loginHistory: [],
    },
    {
      id: 'usr-accounts-01',
      userId: 'accounts1',
      name: 'M. Rahman (Chief Accountant)',
      email: 'accounts@epiups.com.bd',
      passwordHash: defaultPwHash,
      role: 'employee',
      departments: ['accounts'],
      departmentRoles: { accounts: 'accountant' },
      status: 'active',
      createdAt: new Date().toISOString(),
      loginHistory: [],
    },
  ];

  return {
    clients,
    salesWork,
    salesHistory,
    salesOffice,
    serviceWorks: syncServiceWorks({ clients, works: serviceWorks }).works,
    serviceSettings,
    erpData: {
      accounts: erpAccounts,
      parties: erpParties,
      items: erpItems,
      invoices: erpInvoices,
      payments: erpPayments,
      expenses: erpExpenses,
      journal: erpJournals,
      journals: erpJournals,
      stockMovements: [],
      employees: erpEmployees,
      payrollRuns: [],
      assets: erpAssets,
      vatReturns: [],
      auditLogs: [],
      audit: [],
      users: users,
      settings: {
        key: 'main',
        companyName: 'EPI UPS Bangladesh Limited',
        company: 'EPI UPS Bangladesh Limited',
        currency: 'BDT',
        vatRate: 15,
        defaultVatRate: 15,
        vatRates: [0, 5, 7.5, 10, 15],
        fiscalYearStart: '07-01',
        fiscalYearStartMonth: 7,
      },
    },
    users,
  };
}

// --- INDEXEDDB HELPER ---
function openUnifiedIdb() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = window.indexedDB.open(IDB_NAME, IDB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        const stores = [
          'clients',
          'sales_work',
          'sales_history',
          'sales_office',
          'service_works',
          'erp_data',
          'users',
          'audit_logs',
        ];
        for (const s of stores) {
          if (!db.objectStoreNames.contains(s)) {
            db.createObjectStore(s, { keyPath: 'id' });
          }
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

// --- MASTER UNIFIED DATA STORE ENGINE ---
class UnifiedDataStoreEngine {
  constructor() {
    this.memory = this.loadInitialFromLocalStorage();
    this.idb = null;
    this.initialized = false;
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const fn of this.listeners) {
      try {
        fn(this.memory);
      } catch (e) {
        console.warn('[UnifiedStore] Listener notification error:', e);
      }
    }
  }

  loadInitialFromLocalStorage() {
    if (typeof localStorage === 'undefined') return null;
    try {
      const rawClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      if (rawClients) {
        const clients = JSON.parse(rawClients);
        const salesWork = JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES_WORK) || '[]');
        const salesHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES_HISTORY) || '[]');
        const salesOffice = JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES_OFFICE) || '[]');
        const serviceWorks = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICE_WORKS) || '[]');
        const serviceSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICE_SETTINGS) || '{}');
        const erpData = JSON.parse(localStorage.getItem(STORAGE_KEYS.ERP_STORE) || '{}');
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.CENTRAL_USERS) || '[]');

        if (Array.isArray(clients) && clients.length > 0) {
          return {
            clients,
            salesWork,
            salesHistory,
            salesOffice,
            serviceWorks,
            serviceSettings: serviceSettings.company ? serviceSettings : { company: 'EPI UPS Bangladesh Limited', engineers: 'Sabbir, Tanvir, Rafi, Shanto' },
            erpData: erpData.accounts ? erpData : null,
            users: Array.isArray(users) && users.length > 0 ? users : null,
          };
        }
      }
    } catch (e) {
      console.warn('[UnifiedStore] Failed to parse local storage cache:', e);
    }
    return null;
  }

  async init() {
    if (this.initialized && this.memory) return this.memory;

    try {
      this.idb = await openUnifiedIdb();
      if (this.idb) {
        const idbClients = await this.readAllFromStore('clients');
        if (idbClients && idbClients.length > 0) {
          const salesWork = await this.readAllFromStore('sales_work');
          const salesHistory = await this.readAllFromStore('sales_history');
          const salesOffice = await this.readAllFromStore('sales_office');
          const serviceWorks = await this.readAllFromStore('service_works');
          const erpRecords = await this.readAllFromStore('erp_data');
          const users = await this.readAllFromStore('users');

          this.memory = {
            clients: idbClients,
            salesWork: salesWork || [],
            salesHistory: salesHistory || [],
            salesOffice: salesOffice || [],
            serviceWorks: serviceWorks || [],
            serviceSettings: { company: 'EPI UPS Bangladesh Limited — Technical Service Center', engineers: 'Sabbir, Tanvir, Rafi, Shanto' },
            erpData: erpRecords && erpRecords.length > 0 ? erpRecords[0].data : null,
            users: users || [],
          };
          this.syncToLocalStorage(this.memory);
          this.initialized = true;
          return this.memory;
        }
      }
    } catch (err) {
      console.warn('[UnifiedStore] IndexedDB load note:', err);
    }

    // If memory not yet loaded, initialize with realistic seed data
    if (!this.memory || !this.memory.clients || this.memory.clients.length === 0) {
      const seed = createRealisticSeedData();
      this.memory = seed;
      this.syncToLocalStorage(seed);
      if (this.idb) {
        await this.syncToIndexedDB(seed);
      }
    }

    this.initialized = true;
    return this.memory;
  }

  syncToLocalStorage(data) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(data.clients || []));
      localStorage.setItem(STORAGE_KEYS.SALES_WORK, JSON.stringify(data.salesWork || []));
      localStorage.setItem(STORAGE_KEYS.SALES_HISTORY, JSON.stringify(data.salesHistory || []));
      localStorage.setItem(STORAGE_KEYS.SALES_OFFICE, JSON.stringify(data.salesOffice || []));
      localStorage.setItem(STORAGE_KEYS.SERVICE_WORKS, JSON.stringify(data.serviceWorks || []));
      localStorage.setItem(STORAGE_KEYS.SERVICE_SETTINGS, JSON.stringify(data.serviceSettings || {}));
      if (data.erpData) {
        localStorage.setItem(STORAGE_KEYS.ERP_STORE, JSON.stringify(data.erpData));
      }
      if (data.users) {
        localStorage.setItem(STORAGE_KEYS.CENTRAL_USERS, JSON.stringify(data.users));
      }
      // Cross-compatibility keys for legacy readers
      localStorage.setItem('epi_sales_data_v1', JSON.stringify({
        clients: data.clients || [],
        work: data.salesWork || [],
        history: data.salesHistory || [],
        office: data.salesOffice || [],
      }));
      localStorage.setItem('epi_ups_v1', JSON.stringify({
        clients: data.clients || [],
        works: data.serviceWorks || [],
        settings: data.serviceSettings || {},
      }));
    } catch (e) {
      console.warn('[UnifiedStore] LocalStorage sync note:', e);
    }
  }

  async syncToIndexedDB(data) {
    if (!this.idb) return;
    const writeStore = (storeName, items, isSingleDoc = false) => {
      return new Promise((resolve) => {
        try {
          const tx = this.idb.transaction(storeName, 'readwrite');
          const os = tx.objectStore(storeName);
          os.clear();
          if (isSingleDoc) {
            os.put({ id: 'main', data: items });
          } else {
            for (const it of items) {
              if (it && it.id) {
                os.put(it);
              }
            }
          }
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch {
          resolve(false);
        }
      });
    };

    await Promise.all([
      writeStore('clients', data.clients || []),
      writeStore('sales_work', data.salesWork || []),
      writeStore('sales_history', data.salesHistory || []),
      writeStore('sales_office', data.salesOffice || []),
      writeStore('service_works', data.serviceWorks || []),
      writeStore('erp_data', data.erpData, true),
      writeStore('users', data.users || []),
    ]);
  }

  readAllFromStore(storeName) {
    if (!this.idb) return Promise.resolve([]);
    return new Promise((resolve) => {
      try {
        const tx = this.idb.transaction(storeName, 'readonly');
        const os = tx.objectStore(storeName);
        const req = os.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  persist() {
    this.syncToLocalStorage(this.memory);
    if (this.idb) {
      this.syncToIndexedDB(this.memory).catch(() => {});
    }
    this.notify();
  }

  // --- ACTIONS: RESET DEMO DATA, BACKUP & EXPORT ---
  async resetDemoData() {
    const seed = createRealisticSeedData();
    this.memory = seed;
    this.persist();
    return seed;
  }

  exportFullBackup() {
    const backup = {
      system: 'EPI Centralized Management System',
      version: '2.0.0-unified',
      exportedAt: new Date().toISOString(),
      timestamp: Date.now(),
      data: { ...this.memory },
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EPI-Unified-FullBackup-${today()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  }

  async importFullBackup(jsonString) {
    try {
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      const data = parsed.data || parsed;
      if (!data.clients && !data.salesWork && !data.serviceWorks) {
        throw new Error('Invalid EPI backup file: missing core records.');
      }
      this.memory = {
        clients: Array.isArray(data.clients) ? data.clients : [],
        salesWork: Array.isArray(data.salesWork || data.work) ? (data.salesWork || data.work) : [],
        salesHistory: Array.isArray(data.salesHistory || data.history) ? (data.salesHistory || data.history) : [],
        salesOffice: Array.isArray(data.salesOffice || data.office) ? (data.salesOffice || data.office) : [],
        serviceWorks: Array.isArray(data.serviceWorks || data.works) ? (data.serviceWorks || data.works) : [],
        serviceSettings: data.serviceSettings || { company: 'EPI UPS Bangladesh Limited', engineers: 'Sabbir, Tanvir, Rafi, Shanto' },
        erpData: data.erpData || this.memory.erpData,
        users: Array.isArray(data.users) ? data.users : this.memory.users,
      };
      this.persist();
      return { success: true, message: 'Backup imported successfully.' };
    } catch (err) {
      throw new Error(`Import failed: ${err.message}`);
    }
  }

  clearAllData() {
    this.memory = {
      clients: [],
      salesWork: [],
      salesHistory: [],
      salesOffice: [],
      serviceWorks: [],
      serviceSettings: { company: 'EPI UPS Bangladesh Limited', engineers: '' },
      erpData: null,
      users: (this.memory.users || []).filter((u) => u.role === 'superadmin'),
    };
    this.persist();
  }
}

export const unifiedStore = new UnifiedDataStoreEngine();
if (typeof window !== 'undefined') {
  window.__EPI_UNIFIED_STORE__ = unifiedStore;
}
