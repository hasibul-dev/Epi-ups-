/**
 * EPI DIGITAL MARKETING & IT SUPPORT — BROWSER-LOCAL & INDEXEDDB STORAGE ENGINE
 * 
 * Provides 100% browser-side data persistence for Digital Marketing & IT Support.
 * Synchronizes with IndexedDB ('epi_unified_database_v2') and LocalStorage.
 * Contains realistic commercial seed data tailored for EPI UPS Bangladesh Limited:
 * - Industrial UPS & AVR marketing campaigns
 * - Facebook & LinkedIn scheduled content & performance metrics
 * - Paid advertisement tracking (Facebook, LinkedIn, Google)
 * - Creative requests, marketing tasks & media assets
 * - IT support tickets with priorities, departments, technicians, and resolution logs
 * - Computer & device hardware inventory (PCs, laptops, servers, routers, printers)
 * - Licensed software & corporate email accounts
 * - Network infrastructure & preventive maintenance records
 */

import { today, addDays, uid } from '../../sales/utils/helpers.js';
import { assertAuthorizedAdmin } from '../../../utils/backupAuth.js';

export const MARKETING_STORAGE_KEY = 'epi_marketing_it_store_v1';

export function createInitialMarketingItData() {
  const T = today();
  const past30D = addDays(T, -30);
  const past20D = addDays(T, -20);
  const past15D = addDays(T, -15);
  const past10D = addDays(T, -10);
  const past5D = addDays(T, -5);
  const past2D = addDays(T, -2);
  const next2D = addDays(T, 2);
  const next5D = addDays(T, 5);
  const next10D = addDays(T, 10);
  const next20D = addDays(T, 20);

  // 1. Digital Marketing Campaigns
  const campaigns = [
    {
      id: 'camp-01',
      name: 'EPI Industrial Online UPS Summer Shield 2026',
      objective: 'Lead Generation',
      platforms: ['Facebook', 'LinkedIn'],
      targetAudience: 'RMG & Textile Mills, Pharmaceutical Plants, Data Centers in Gazipur & Narayanganj',
      startDate: past15D,
      endDate: next20D,
      budget: 65000,
      spend: 38400,
      leadTarget: 150,
      leadsGenerated: 112,
      impressions: 184500,
      clicks: 7420,
      assignedEmployee: 'Tanvir Ahmed',
      status: 'Active',
      focusProduct: 'EPI 10kVA - 40kVA 3-Phase Online UPS (EPI-OL10K-31)',
      notes: 'Focusing on zero-transfer time power continuity during summer load-shedding and voltage spikes.',
      createdAt: past15D,
      updatedAt: past2D,
    },
    {
      id: 'camp-02',
      name: 'Garments & Spinning Mill Servo AVR Protection Drive',
      objective: 'Brand Awareness & Inquiries',
      platforms: ['LinkedIn', 'Facebook'],
      targetAudience: 'Textile Engineers, Factory Operations Managers, Electrical Maintenance Heads',
      startDate: past30D,
      endDate: next5D,
      budget: 45000,
      spend: 42000,
      leadTarget: 80,
      leadsGenerated: 74,
      impressions: 122000,
      clicks: 5100,
      assignedEmployee: 'Rafiul Islam',
      status: 'Active',
      focusProduct: 'Industrial Servo AVR 5kVA - 50kVA Single & 3-Phase',
      notes: 'Highlighting high-precision servo voltage stabilization to protect sensitive electronic loom controllers.',
      createdAt: past30D,
      updatedAt: past5D,
    },
    {
      id: 'camp-03',
      name: 'Hospital & Healthcare Diagnostic Power Continuity',
      objective: 'Direct B2B Sales',
      platforms: ['LinkedIn', 'Email'],
      targetAudience: 'Hospital Directors, Clinic Owners, Diagnostic Center Procurement Managers',
      startDate: T,
      endDate: addDays(T, 45),
      budget: 55000,
      spend: 8500,
      leadTarget: 60,
      leadsGenerated: 19,
      impressions: 48000,
      clicks: 2150,
      assignedEmployee: 'Tanvir Ahmed',
      status: 'Active',
      focusProduct: 'Medical Grade Pure Sine Wave Online UPS with Extended Battery Bank',
      notes: 'Focus on zero harmonic distortion power for MRI, CT scan, and ICU ventilators.',
      createdAt: T,
      updatedAt: T,
    },
    {
      id: 'camp-04',
      name: 'Q3 SME Office Desktop Power Backup Campaign',
      objective: 'Sales Conversion',
      platforms: ['Facebook', 'Instagram'],
      targetAudience: 'Corporate Offices, IT Firms, Call Centers in Motijheel & Gulshan',
      startDate: next10D,
      endDate: addDays(T, 60),
      budget: 35000,
      spend: 0,
      leadTarget: 100,
      leadsGenerated: 0,
      impressions: 0,
      clicks: 0,
      assignedEmployee: 'Samia Jahan',
      status: 'Planning',
      focusProduct: 'EPI Line Interactive UPS 650VA - 2kVA (EPI-LI1K)',
      notes: 'Planning creative bundle deals: Buy 5 Line Interactive UPS units and get free on-site battery testing.',
      createdAt: past2D,
      updatedAt: past2D,
    },
  ];

  // 2. Social Media & Content Editorial Calendar Posts
  const posts = [
    {
      id: 'post-01',
      title: 'Why Industrial UPS Zero-Transfer Time Saves Million-Dollar Machinery',
      platform: 'LinkedIn',
      campaignId: 'camp-01',
      contentType: 'Industrial Case Study',
      content: 'In modern industrial plants, a 10-millisecond power flicker can cause automated PLC controllers to shut down, leading to hours of downtime. EPI Online UPS provides true double-conversion zero-transfer time, shielding your operations 24/7 with pure sine wave output.\n\n#EPIUPS #IndustrialPower #PowerBackup #BangladeshIndustry #EngineeringExcellence',
      hashtags: '#EPIUPS #IndustrialPower #PowerBackup #BangladeshIndustry',
      scheduledDate: T,
      scheduledTime: '10:30',
      assignedEmployee: 'Tanvir Ahmed',
      status: 'Published',
      assetTitle: '10kVA Online UPS Plant Infographic.png',
      reach: 6420,
      engagement: 580,
      shares: 34,
      inquiries: 8,
      notes: 'High engagement from corporate engineers in Gazipur & Chittagong industrial zones.',
    },
    {
      id: 'post-02',
      title: 'EPI 3-Phase Online UPS 10kVA Specification Breakdown & Delivery Notice',
      platform: 'Facebook',
      campaignId: 'camp-01',
      contentType: 'Product Spotlight',
      content: 'কারখানা এবং ডায়াগনস্টিক সেন্টারের জন্য নির্ভরযোগ্য সমাধান — EPI Online UPS 10kVA (3:1)! ১০০% পিওর সাইন ওয়েভ, দ্রুত ব্যাটারি রিচার্জ এবং ১ বছরের ফুল ওয়ারেন্টি সহ সমগ্র বাংলাদেশে হোম ডেলিভারি ও কমিশনিং সার্ভিস প্রদান করা হয়।\n\nঅফিসিয়াল কোটেশনের জন্য ইনবক্স করুন অথবা হটলাইনে যোগাযোগ করুন: 01778-249416\n\n#EPI_UPS #OnlineUPS #Dhaka #PowerSolutions',
      hashtags: '#EPI_UPS #OnlineUPS #Dhaka #PowerSolutions',
      scheduledDate: T,
      scheduledTime: '15:00',
      assignedEmployee: 'Samia Jahan',
      status: 'Published',
      assetTitle: 'EPI-10kVA-Banner-FB-Square.jpg',
      reach: 14200,
      engagement: 1190,
      shares: 72,
      inquiries: 22,
      notes: '22 direct client inquiries forwarded to Sales CRM.',
    },
    {
      id: 'post-03',
      title: 'Top 5 Signs Your Commercial Battery Bank Needs Preventive Maintenance',
      platform: 'Facebook',
      campaignId: 'camp-01',
      contentType: 'Maintenance Tips',
      content: 'আপনার UPS ব্যাটারি কি সঠিক ব্যাকআপ দিচ্ছে? টার্মিনাল করোশন, ভোল্টেজ ইমব্যালেন্স বা অতিরিক্ত গরম হওয়া ব্যাটারি ড্যামেজের প্রাথমিক লক্ষণ। আজই EPI সার্টিফাইড টেকনিশিয়ান দ্বারা ব্যাটারি ব্যাংক টেস্ট করান।\n\nহটলাইন: 01711-000001\n#UPSMaintenance #BatteryHealth #EPIService',
      hashtags: '#UPSMaintenance #BatteryHealth #EPIService',
      scheduledDate: next2D,
      scheduledTime: '11:00',
      assignedEmployee: 'Samia Jahan',
      status: 'Scheduled',
      assetTitle: 'Battery-Inspection-Checklist.jpg',
      reach: 0,
      engagement: 0,
      shares: 0,
      inquiries: 0,
      notes: 'Scheduled for Thursday morning peak Facebook viewing window.',
    },
    {
      id: 'post-04',
      title: 'Case Study: How Apex Textile Achieved 99.98% Equipment Uptime with EPI AVRs',
      platform: 'LinkedIn',
      campaignId: 'camp-02',
      contentType: 'Customer Testimonial',
      content: 'Voltage instability during grid transitions was damaging computerized knitting machines at Apex Textile. By installing 5kVA and 10kVA EPI Servo Voltage Stabilizers, plant engineers eliminated unexpected trips and saved significant maintenance costs.\n\nRead the full technical case study on our portal.\n#TextileEngineering #RMG #VoltageStabilizer #PowerQuality',
      hashtags: '#TextileEngineering #RMG #VoltageStabilizer #PowerQuality',
      scheduledDate: next5D,
      scheduledTime: '14:00',
      assignedEmployee: 'Tanvir Ahmed',
      status: 'In Review',
      assetTitle: 'Apex-Textile-Case-Study-Cover.pdf',
      reach: 0,
      engagement: 0,
      shares: 0,
      inquiries: 0,
      notes: 'Reviewing client approval on quotes and brand mentions.',
    },
    {
      id: 'post-05',
      title: 'EPI Line Interactive UPS Series — Compact Power for Medical Reception & POS',
      platform: 'Facebook',
      campaignId: 'camp-04',
      contentType: 'Product Spotlight',
      content: 'ছোট অফিস, কম্পিউটার ল্যাব ও দোকানের POS সিস্টেমের জন্য সেরা সঙ্গী EPI Line Interactive 650VA / 1kVA / 2kVA UPS! বিল্ট-ইন ভোল্টেজ রেগুলেশন ও ওভারলোড প্রোটেকশন সহ।\n\nআজই অর্ডার করুন সুলভ মূল্যে!\n#POSPower #OfficeUPS #EPIUPSBangladesh',
      hashtags: '#POSPower #OfficeUPS #EPIUPSBangladesh',
      scheduledDate: next10D,
      scheduledTime: '16:30',
      assignedEmployee: 'Rafiul Islam',
      status: 'Draft',
      assetTitle: 'EPI-LI-Family-Banner.png',
      reach: 0,
      engagement: 0,
      shares: 0,
      inquiries: 0,
      notes: 'Drafting Bengali copy variations for retail audiences.',
    },
    {
      id: 'post-06',
      title: 'Technical Video: Inside an EPI Double-Conversion Online UPS',
      platform: 'YouTube',
      campaignId: 'camp-01',
      contentType: 'Technical Video',
      content: 'In-depth engineering teardown showing IGBT inverter module, bypass static switch, and battery management circuit of our flagship 10kVA model.',
      hashtags: '#ElectricalEngineering #UPSReview #CleanPower',
      scheduledDate: past5D,
      scheduledTime: '18:00',
      assignedEmployee: 'Tanvir Ahmed',
      status: 'Published',
      assetTitle: 'UPS-Teardown-Video-1080p.mp4',
      reach: 8900,
      engagement: 920,
      shares: 45,
      inquiries: 12,
      notes: 'Published on EPI YouTube Channel & embedded in website knowledge base.',
    },
  ];

  // 3. Paid Advertisements
  const ads = [
    {
      id: 'ad-01',
      name: 'FB Sponsored: Industrial Online UPS Summer Power Shield',
      platform: 'Facebook Ads',
      campaignId: 'camp-01',
      adFormat: 'Lead Form & Carousel',
      budget: 35000,
      dailyBudget: 2500,
      startDate: past15D,
      endDate: next20D,
      status: 'Active',
      impressions: 112000,
      clicks: 4890,
      spend: 21500,
      cpc: 4.4,
      leads: 78,
      notes: 'Targeting Industrial Area pin codes in Gazipur, Ashulia, Savar, Tongi, and Chittagong.',
    },
    {
      id: 'ad-02',
      name: 'LinkedIn Sponsored: B2B Power Continuity for Operations Heads',
      platform: 'LinkedIn Sponsored',
      campaignId: 'camp-01',
      adFormat: 'Single Image Sponsored Content',
      budget: 30000,
      dailyBudget: 2000,
      startDate: past10D,
      endDate: next10D,
      status: 'Active',
      impressions: 48500,
      clicks: 1650,
      spend: 16900,
      cpc: 10.2,
      leads: 34,
      notes: 'Targeting job titles: Plant Manager, Chief Engineer, Maintenance Director.',
    },
    {
      id: 'ad-03',
      name: 'Google Search Ads: "Online UPS Bangladesh" & "Industrial AVR"',
      platform: 'Google Search',
      campaignId: 'camp-02',
      adFormat: 'Search Text Ad',
      budget: 25000,
      dailyBudget: 1500,
      startDate: past30D,
      endDate: next5D,
      status: 'Active',
      impressions: 38400,
      clicks: 2890,
      spend: 22100,
      cpc: 7.6,
      leads: 42,
      notes: 'High-intent search queries converting into direct quotation requests.',
    },
  ];

  // 4. Marketing Asset Library
  const assets = [
    {
      id: 'asset-01',
      title: 'EPI Online UPS Master Product Catalog 2026',
      category: 'Datasheets & Catalogs',
      format: 'PDF',
      size: '14.2 MB',
      fileUrl: '/docs/EPI-UPS-Catalog-2026.pdf',
      tags: ['catalog', 'online-ups', 'specs', 'commercial'],
      uploadedBy: 'Tanvir Ahmed',
      uploadedAt: past30D,
      notes: 'Official catalog including 1kVA - 40kVA specifications with dimensional drawings.',
    },
    {
      id: 'asset-02',
      title: 'EPI-OL10K 10kVA High-Resolution Hero Render',
      category: 'Product Photos',
      format: 'PNG',
      size: '8.4 MB (3840x2160)',
      fileUrl: '/images/products/epi-ol10k-hero.png',
      tags: ['10kva', 'ups', 'render', 'transparent'],
      uploadedBy: 'Samia Jahan',
      uploadedAt: past15D,
      notes: 'Transparent background for ad banners and website hero graphics.',
    },
    {
      id: 'asset-03',
      title: 'Industrial Servo AVR Technical Datasheet & Wiring Guide',
      category: 'Datasheets & Catalogs',
      format: 'PDF',
      size: '5.1 MB',
      fileUrl: '/docs/EPI-AVR-Wiring-Datasheet.pdf',
      tags: ['avr', 'stabilizer', 'wiring', 'technical'],
      uploadedBy: 'Tanvir Ahmed',
      uploadedAt: past20D,
      notes: 'Includes 3-phase input terminal diagram and relay specifications.',
    },
    {
      id: 'asset-04',
      title: 'Official Corporate Logo Pack (Vector, SVG, Dark/Light)',
      category: 'Branding & Logos',
      format: 'ZIP',
      size: '18.6 MB',
      fileUrl: '/brand/EPI-Official-Logo-Pack.zip',
      tags: ['logo', 'branding', 'vector', 'corporate'],
      uploadedBy: 'Samia Jahan',
      uploadedAt: past30D,
      notes: 'Official brand guidelines, EPS, AI, and transparent PNG variations.',
    },
    {
      id: 'asset-05',
      title: 'Social Media Summer Campaign Banner Set (1080x1080 & 1200x628)',
      category: 'Social Media Graphics',
      format: 'PSD / JPG',
      size: '34.5 MB',
      fileUrl: '/graphics/summer-campaign-banners.zip',
      tags: ['facebook', 'linkedin', 'summer', 'banner'],
      uploadedBy: 'Samia Jahan',
      uploadedAt: past10D,
      notes: 'Master PSD templates and export ready JPGs for Facebook & LinkedIn ads.',
    },
  ];

  // 5. Creative & Design Requests
  const creativeRequests = [
    {
      id: 'cr-01',
      title: '10kVA UPS Roll-Up Standee for Industrial Trade Fair',
      requestingDept: 'Sales Department',
      type: 'Exhibition Standee',
      priority: 'High',
      dueDate: next5D,
      assignedDesigner: 'Samia Jahan',
      dimensions: '33x79 inches (300 DPI)',
      brief: 'Need a roll-up banner showcasing 10kVA 3:1 Online UPS and 12V 100Ah battery rack with EPI brand colors.',
      status: 'In Progress',
      notes: 'Sales team attending Bangladesh Garments Machinery Expo.',
    },
    {
      id: 'cr-02',
      title: 'Customer Service Handout: 6 Battery Health Check Steps',
      requestingDept: 'Service Department',
      type: 'Product Flyer / Brochure',
      priority: 'Normal',
      dueDate: next10D,
      assignedDesigner: 'Samia Jahan',
      dimensions: 'A4 Double-Sided Flyer',
      brief: 'Technicians will hand this sheet to clients after service visits. Must include clear icons and Bengali tips.',
      status: 'Briefed',
      notes: 'Service Lead Engineer reviewed draft copy.',
    },
    {
      id: 'cr-03',
      title: 'LinkedIn Corporate Post Graphic: ISO Quality Assurance Milestone',
      requestingDept: 'Executive Admin',
      type: 'Social Media Banner',
      priority: 'Normal',
      dueDate: past2D,
      assignedDesigner: 'Samia Jahan',
      dimensions: '1200x628 (Landscape)',
      brief: 'Announcement of our certified quality assurance and compliance for commercial power installations.',
      status: 'Approved',
      notes: 'Approved by Super Admin for publishing.',
    },
  ];

  // 6. Marketing Tasks & Work Items
  const marketingTasks = [
    {
      id: 'mt-01',
      title: 'Draft technical blog on 3-Phase vs 1-Phase UPS considerations for hospitals',
      category: 'SEO / Website',
      assignedTo: 'Tanvir Ahmed',
      assignedBy: 'Super Administrator',
      startDate: past5D,
      dueDate: T,
      dueTime: '17:00',
      priority: 'High',
      status: 'In Progress',
      progress: 75,
      attachment: 'brief_hospital_ups_seo.docx',
      desc: 'Create an in-depth 1200-word SEO article for the website resource center with comparison table.',
      completionNotes: '',
      completionAttachment: '',
      completedAt: '',
      completedDate: '',
      completedTime: '',
      completedBy: '',
      createdAt: past5D + 'T09:00:00Z',
      updatedAt: past2D + 'T14:30:00Z',
      history: [
        {
          timestamp: past5D + 'T09:00:00Z',
          action: 'Assigned',
          by: 'Super Administrator',
          note: 'Work assigned with deadline ' + T + ' 17:00',
        },
        {
          timestamp: past2D + 'T14:30:00Z',
          action: 'Progress Update',
          by: 'Tanvir Ahmed',
          note: 'First draft completed (900 words). Working on 3-Phase wiring diagram.',
        },
      ],
    },
    {
      id: 'mt-02',
      title: 'Audit Facebook Pixel and LinkedIn Insight Tag conversion events',
      category: 'Advertising',
      assignedTo: 'Rafiul Islam',
      assignedBy: 'Tanvir Ahmed',
      startDate: past10D,
      dueDate: past2D,
      dueTime: '18:00',
      priority: 'High',
      status: 'Completed',
      progress: 100,
      attachment: 'pixel_audit_parameters.pdf',
      desc: 'Verify lead form submission triggers and match data in Google Analytics 4.',
      completionNotes: 'All 4 standard events (Lead, Contact, ViewContent, FormSubmit) verified and firing accurately on GTM and Meta Event Manager. GA4 deduplication confirmed.',
      completionAttachment: 'pixel_conversion_report_final.pdf',
      completedAt: past2D + 'T16:45:00Z',
      completedDate: past2D,
      completedTime: '16:45',
      completedBy: 'Rafiul Islam',
      createdAt: past10D + 'T10:00:00Z',
      updatedAt: past2D + 'T16:45:00Z',
      history: [
        {
          timestamp: past10D + 'T10:00:00Z',
          action: 'Assigned',
          by: 'Tanvir Ahmed',
          note: 'Work assigned with deadline ' + past2D,
        },
        {
          timestamp: past5D + 'T11:00:00Z',
          action: 'Started',
          by: 'Rafiul Islam',
          note: 'Inspected GTM container and Meta Event Manager diagnostics.',
        },
        {
          timestamp: past2D + 'T16:45:00Z',
          action: 'Completed',
          by: 'Rafiul Islam',
          note: 'Event verification complete. Conversion report attached.',
        },
      ],
    },
    {
      id: 'mt-03',
      title: 'Prepare product presentation slides for upcoming pharmaceutical client pitch',
      category: 'Content / Copywriting',
      assignedTo: 'Tanvir Ahmed',
      assignedBy: 'Sales Manager',
      startDate: past2D,
      dueDate: T,
      dueTime: '15:30',
      priority: 'Urgent',
      status: 'Assigned',
      progress: 20,
      attachment: 'client_specs_square_pharma.pdf',
      desc: 'Coordinate with Sales Manager to update slide deck with recent diagnostic center photos and UPS specs.',
      completionNotes: '',
      completionAttachment: '',
      completedAt: '',
      completedDate: '',
      completedTime: '',
      completedBy: '',
      createdAt: past2D + 'T09:30:00Z',
      updatedAt: T + 'T08:00:00Z',
      history: [
        {
          timestamp: past2D + 'T09:30:00Z',
          action: 'Assigned',
          by: 'Sales Manager',
          note: 'Urgent presentation deck required for Square Pharmaceuticals procurement committee.',
        },
      ],
    },
    {
      id: 'mt-04',
      title: 'Design 4 Instagram and LinkedIn story graphics for weekend retail promotion',
      category: 'Graphic Design',
      assignedTo: 'Samia Jahan',
      assignedBy: 'Tanvir Ahmed',
      startDate: past2D,
      dueDate: next2D,
      dueTime: '16:00',
      priority: 'Normal',
      status: 'In Progress',
      progress: 50,
      attachment: 'retail_copy_offers.txt',
      desc: 'Highlight Line Interactive 650VA UPS with 1-year replacement guarantee.',
      completionNotes: '',
      completionAttachment: '',
      completedAt: '',
      completedDate: '',
      completedTime: '',
      completedBy: '',
      createdAt: past2D + 'T11:00:00Z',
      updatedAt: past2D + 'T15:00:00Z',
      history: [
        {
          timestamp: past2D + 'T11:00:00Z',
          action: 'Assigned',
          by: 'Tanvir Ahmed',
          note: 'Assigned for weekend retail social campaign.',
        },
      ],
    },
    {
      id: 'mt-05',
      title: 'Configure MikroTik VLAN & DHCP reservation for Service Department test bench',
      category: 'Technical / IT Support',
      assignedTo: 'Md. Al-Amin',
      assignedBy: 'Super Administrator',
      startDate: past5D,
      dueDate: past2D,
      dueTime: '14:00',
      priority: 'Urgent',
      status: 'On Hold',
      progress: 30,
      attachment: 'network_topology_map.png',
      desc: 'Isolate incoming customer UPS units on subnet 192.168.20.0/24 to prevent IP conflict with main ERP.',
      completionNotes: '',
      completionAttachment: '',
      completedAt: '',
      completedDate: '',
      completedTime: '',
      completedBy: '',
      createdAt: past5D + 'T10:00:00Z',
      updatedAt: past2D + 'T16:00:00Z',
      history: [
        {
          timestamp: past5D + 'T10:00:00Z',
          action: 'Assigned',
          by: 'Super Administrator',
          note: 'Assigned high-priority network segmentation.',
        },
        {
          timestamp: past2D + 'T16:00:00Z',
          action: 'Status Change',
          by: 'Md. Al-Amin',
          note: 'Placed On Hold pending replacement managed switch installation.',
        },
      ],
    },
    {
      id: 'mt-06',
      title: 'Monthly offsite NAS backup & cloud sync verification for ERP database',
      category: 'Technical / IT Support',
      assignedTo: 'Kamrul Hasan',
      assignedBy: 'Md. Al-Amin',
      startDate: T,
      dueDate: T,
      dueTime: '19:00',
      priority: 'Normal',
      status: 'In Progress',
      progress: 80,
      attachment: 'backup_checksheet_sop.pdf',
      desc: 'Verify weekly full snapshot replication to encrypted cloud storage bucket and check hash digests.',
      completionNotes: '',
      completionAttachment: '',
      completedAt: '',
      completedDate: '',
      completedTime: '',
      completedBy: '',
      createdAt: T + 'T08:30:00Z',
      updatedAt: T + 'T14:00:00Z',
      history: [
        {
          timestamp: T + 'T08:30:00Z',
          action: 'Assigned',
          by: 'Md. Al-Amin',
          note: 'Assigned routine monthly NAS backup drill.',
        },
      ],
    },
  ];

  // 7. Approved Captions & Snippet Library
  const captions = [
    {
      id: 'cap-01',
      title: 'Standard Industrial Online UPS Warranty & Service Blurb (Bengali)',
      category: 'Product Promo',
      text: 'প্রতিটি EPI Online UPS-এ পাবেন ১ বছরের ফুল অফিসিয়াল ওয়ারেন্টি, সার্বক্ষণিক টেকনিক্যাল সাপোর্ট এবং ফ্রি ডেলিভারি ও কমিশনিং। বিস্তারিত জানতে ইনবক্স করুন।',
      tags: ['warranty', 'bengali', 'standard'],
    },
    {
      id: 'cap-02',
      title: 'B2B Tender & Commercial Invoicing Notice (English)',
      category: 'Corporate',
      text: 'All EPI UPS systems are supplied with official VAT 15% Mushak-9.1 invoices, factory test certificates, and comprehensive warranty coverage across Bangladesh.',
      tags: ['vat', 'tender', 'corporate'],
    },
  ];

  // -------------------------------------------------------------
  // IT SUPPORT MANAGEMENT DATA MODEL
  // -------------------------------------------------------------

  // 8. IT Support Tickets
  const tickets = [
    {
      id: 'TICK-2026-001',
      requestingEmployee: 'MD. MAHMUDUL HASAN',
      department: 'Sales Department',
      issueCategory: 'Hardware / PC',
      title: 'Dell Latitude Laptop Display Flickering & Battery Not Charging',
      description: 'The laptop screen flickers when moved on hinges, and Windows shows "Plugged in, not charging (0%)". Cannot use on customer site visits without AC adapter.',
      priority: 'High',
      assignedTechnician: 'Md. Al-Amin',
      deviceId: 'EPI-IT-LAP-02',
      createdDate: past2D,
      createdTime: '09:45',
      status: 'In Progress',
      resolutionDetails: 'Diagnosed loose eDP display cable on motherboard. Replacement 65W Dell Type-C adapter tested and charging operational. Display cable reseated.',
      completionDate: '',
      completionTime: '',
    },
    {
      id: 'TICK-2026-002',
      requestingEmployee: 'Chief Accountant',
      department: 'Accounts & ERP',
      issueCategory: 'Printer & Scanner',
      title: 'Accounts Department Network Canon LBP-2900 Laser Printer Offline',
      description: 'Printer shows offline on Accounts PC #1 and #2. Unable to print official Mushak-9.1 VAT sales invoices.',
      priority: 'High',
      assignedTechnician: 'Kamrul Hasan',
      deviceId: 'EPI-IT-PRN-01',
      createdDate: past5D,
      createdTime: '11:15',
      status: 'Resolved',
      resolutionDetails: 'Replaced damaged USB-to-LAN print server cable. Assigned permanent static IP 192.168.1.180. Reinstalled spooler driver on Accounts workstations.',
      completionDate: past5D,
      completionTime: '13:30',
    },
    {
      id: 'TICK-2026-003',
      requestingEmployee: 'Tanvir Hasan (Service Engineer)',
      department: 'Service Department',
      issueCategory: 'Operating System & Software',
      title: 'UPS SNMP Monitoring Software & RS232 Serial Port Driver Error',
      description: 'Field diagnostic software "EPI PowerPanel Enterprise" cannot detect COM4 serial connection to test UPS microcontroller firmware.',
      priority: 'Normal',
      assignedTechnician: 'Md. Al-Amin',
      deviceId: 'EPI-IT-LAP-04',
      createdDate: past15D,
      createdTime: '14:20',
      status: 'Resolved',
      resolutionDetails: 'Installed updated FTDI USB-to-Serial chipset VCP driver v2.12.36. Configured COM4 baud rate to 9600-8-N-1. Communication verified.',
      completionDate: past15D,
      completionTime: '15:45',
    },
    {
      id: 'TICK-2026-004',
      requestingEmployee: 'Super Administrator',
      department: 'Executive Admin',
      issueCategory: 'Network & Internet',
      title: 'Primary ISP Optical Fiber Disconnection & Slow Backup Link',
      description: 'Main 50Mbps AmberIT fiber link went red on media converter. Entire office running on slow 10Mbps backup line.',
      priority: 'Critical',
      assignedTechnician: 'Md. Al-Amin',
      deviceId: 'EPI-IT-RTR-01',
      createdDate: T,
      createdTime: '08:30',
      status: 'Resolved',
      resolutionDetails: 'Coordinated with AmberIT NOC. Fiber core joint spliced at Mirpur road intersection. Primary line restored at 10:15 AM with 52Mbps throughput.',
      completionDate: T,
      completionTime: '10:15',
    },
    {
      id: 'TICK-2026-005',
      requestingEmployee: 'Sales Representative #2',
      department: 'Sales Department',
      issueCategory: 'Email & Account Support',
      title: 'Corporate Email Outlook Password Expired & Sync Blocked',
      description: 'Cannot send or receive emails from sales2@epiups.com.bd. Outlook prompts for credentials repeatedly.',
      priority: 'Normal',
      assignedTechnician: 'Kamrul Hasan',
      deviceId: 'EPI-IT-DT-03',
      createdDate: T,
      createdTime: '11:00',
      status: 'Open',
      resolutionDetails: 'Pending password reset in Google Workspace Admin Console and MFA re-authentication on mobile device.',
      completionDate: '',
      completionTime: '',
    },
    {
      id: 'TICK-2026-006',
      requestingEmployee: 'Accounts Officer',
      department: 'Accounts & ERP',
      issueCategory: 'Data Backup & Security',
      title: 'Synology NAS Automated Daily Accounting Ledger Backup Warning',
      description: 'Automated backup script reported: "Disk 2 in Synology DS220+ warning: 8 bad sectors reallocated".',
      priority: 'High',
      assignedTechnician: 'Md. Al-Amin',
      deviceId: 'EPI-IT-NAS-01',
      createdDate: past2D,
      createdTime: '16:00',
      status: 'In Progress',
      resolutionDetails: 'RAID 1 mirror intact. Procuring replacement 4TB Seagate IronWolf NAS drive under warranty. Backup confirmed safe on secondary cloud bucket.',
      completionDate: '',
      completionTime: '',
    },
  ];

  // 9. Computer & Device Hardware Inventory
  const devices = [
    {
      id: 'dev-01',
      deviceTag: 'EPI-IT-DT-01',
      deviceType: 'Desktop PC',
      brandModel: 'Dell OptiPlex 7090 Tower',
      specs: 'Intel Core i7-11700 (8 Core), 16GB DDR4, 512GB NVMe SSD + 1TB HDD',
      operatingSystem: 'Windows 11 Pro 64-bit',
      assignedTo: 'Super Administrator',
      department: 'Executive Admin',
      ipAddress: '192.168.1.10 (DHCP Reserved)',
      macAddress: 'D8:43:AE:21:55:01',
      purchaseDate: '2024-03-15',
      warrantyExpiry: '2027-03-14',
      status: 'Operational',
      notes: 'Primary admin workstation with dual 27-inch Dell monitors.',
    },
    {
      id: 'dev-02',
      deviceTag: 'EPI-IT-DT-02',
      deviceType: 'Desktop PC',
      brandModel: 'HP ProDesk 400 G7 Microtower',
      specs: 'Intel Core i5-10500, 16GB DDR4, 256GB SSD + 1TB HDD',
      operatingSystem: 'Windows 10 Pro 64-bit',
      assignedTo: 'Chief Accountant',
      department: 'Accounts & ERP',
      ipAddress: '192.168.1.20',
      macAddress: '3C:52:82:11:09:A4',
      purchaseDate: '2023-08-10',
      warrantyExpiry: '2026-08-09',
      status: 'Operational',
      notes: 'Contains ERP client and banking token USB dongles.',
    },
    {
      id: 'dev-03',
      deviceTag: 'EPI-IT-LAP-02',
      deviceType: 'Laptop',
      brandModel: 'Dell Latitude 3520 (15.6")',
      specs: 'Intel Core i5-1135G7, 16GB RAM, 512GB SSD',
      operatingSystem: 'Windows 11 Pro',
      assignedTo: 'MD. MAHMUDUL HASAN',
      department: 'Sales Department',
      ipAddress: '192.168.1.55 (Wi-Fi)',
      macAddress: '48:BA:4E:99:12:88',
      purchaseDate: '2024-01-20',
      warrantyExpiry: '2027-01-19',
      status: 'Under Maintenance',
      notes: 'Currently logged in ticket TICK-2026-001 for display hinge service.',
    },
    {
      id: 'dev-04',
      deviceTag: 'EPI-IT-LAP-04',
      deviceType: 'Laptop',
      brandModel: 'Lenovo ThinkPad E14 Gen 4',
      specs: 'AMD Ryzen 5 5625U, 16GB RAM, 512GB NVMe SSD, Rugged Chassis',
      operatingSystem: 'Windows 11 Pro',
      assignedTo: 'Tanvir Hasan (Service Engineer)',
      department: 'Service Department',
      ipAddress: '192.168.1.58 (Wi-Fi)',
      macAddress: 'E8:84:A5:44:81:72',
      purchaseDate: '2024-05-12',
      warrantyExpiry: '2027-05-11',
      status: 'Operational',
      notes: 'Carried to client factory sites for UPS firmware calibration.',
    },
    {
      id: 'dev-05',
      deviceTag: 'EPI-IT-RTR-01',
      deviceType: 'Network Switch / Router',
      brandModel: 'MikroTik Cloud Core Router CCR1009-7G-1C-1S+',
      specs: '9-Core CPU, 2GB RAM, 7x Gigabit LAN, 1x SFP+ 10G Port, RouterOS v7',
      operatingSystem: 'MikroTik RouterOS v7.14',
      assignedTo: 'Server Room Rack #1',
      department: 'Digital Marketing & IT',
      ipAddress: '192.168.1.1 (Gateway)',
      macAddress: '08:55:31:AA:BB:01',
      purchaseDate: '2023-01-15',
      warrantyExpiry: '2025-01-14',
      status: 'Operational',
      notes: 'Dual-WAN load balancing configured for AmberIT primary and Link3 secondary.',
    },
    {
      id: 'dev-06',
      deviceTag: 'EPI-IT-NAS-01',
      deviceType: 'Server',
      brandModel: 'Synology DiskStation DS220+ (2-Bay NAS)',
      specs: 'Intel Celeron J4025 Dual-Core, 6GB DDR4, 2x 4TB Seagate IronWolf RAID 1',
      operatingSystem: 'Synology DSM 7.2',
      assignedTo: 'Server Room Rack #1',
      department: 'Digital Marketing & IT',
      ipAddress: '192.168.1.100',
      macAddress: '00:11:32:89:FE:12',
      purchaseDate: '2023-06-20',
      warrantyExpiry: '2026-06-19',
      status: 'Needs Upgrade',
      notes: 'Disk 2 reallocation warning logged. Replacement drive on order.',
    },
    {
      id: 'dev-07',
      deviceTag: 'EPI-IT-PRN-01',
      deviceType: 'Printer / Scanner',
      brandModel: 'Canon imageCLASS LBP2900B Heavy Duty Laser',
      specs: 'Monochrome Laser, 12 ppm, 2400x600 dpi, USB + Print Server LAN',
      operatingSystem: 'Firmware 1.04',
      assignedTo: 'Accounts & ERP Office',
      department: 'Accounts & ERP',
      ipAddress: '192.168.1.180 (Static)',
      macAddress: '70:B3:D5:19:88:22',
      purchaseDate: '2022-11-05',
      warrantyExpiry: '2023-11-04',
      status: 'Operational',
      notes: 'Used for daily Mushak VAT 9.1 invoices and purchase orders.',
    },
    {
      id: 'dev-08',
      deviceTag: 'EPI-IT-SNMP-01',
      deviceType: 'UPS SNMP Gateway',
      brandModel: 'EPI Megatec NetAgent 9 SNMP Web Card',
      specs: 'RJ-45 10/100 LAN, Modbus RTU / TCP, Environmental Temp/Humidity Sensor',
      operatingSystem: 'Embedded Web Firmware v3.2',
      assignedTo: 'Server Room UPS #1 (EPI-OL10K)',
      department: 'Digital Marketing & IT',
      ipAddress: '192.168.1.200',
      macAddress: '00:03:EA:44:11:90',
      purchaseDate: '2024-02-18',
      warrantyExpiry: '2026-02-17',
      status: 'Operational',
      notes: 'Monitors server room power conditions and sends email alerts upon AC power failure.',
    },
  ];

  // 10. Software Licenses & Email Accounts
  const softwareAccounts = [
    {
      id: 'sw-01',
      softwareName: 'Google Workspace Enterprise (Corporate Email & Drive)',
      type: 'Corporate Email Domain',
      licenseKeyOrAccount: '@epiups.com.bd domain',
      totalLicenses: 15,
      assignedCount: 12,
      expiryDate: '2027-02-28',
      annualCost: 108000,
      vendor: 'Google Cloud Partner Bangladesh',
      notes: 'Provides employee email, shared drives, Google Meet, and security vault.',
    },
    {
      id: 'sw-02',
      softwareName: 'Kaspersky Endpoint Security Cloud Plus',
      type: 'Commercial License',
      licenseKeyOrAccount: 'XXXXX-XXXXX-XXXXX-90412',
      totalLicenses: 20,
      assignedCount: 16,
      expiryDate: '2026-12-15',
      annualCost: 36000,
      vendor: 'Smart Technologies (BD) Ltd',
      notes: 'Installed on all office PCs, laptops, and server room NAS.',
    },
    {
      id: 'sw-03',
      softwareName: 'EPI PowerPanel Enterprise UPS Central Monitor',
      type: 'Internal Server App',
      licenseKeyOrAccount: 'Unlimited Corporate Site License',
      totalLicenses: 100,
      assignedCount: 8,
      expiryDate: '2030-12-31',
      annualCost: 0,
      vendor: 'EPI Power Technologies',
      notes: 'Central monitoring for connected commercial client installations.',
    },
    {
      id: 'sw-04',
      softwareName: 'Adobe Creative Cloud All Apps (Marketing Designer)',
      type: 'Cloud SaaS',
      licenseKeyOrAccount: 'designer@epiups.com.bd',
      totalLicenses: 1,
      assignedCount: 1,
      expiryDate: '2026-10-30',
      annualCost: 82000,
      vendor: 'Adobe Systems Direct',
      notes: 'Used for Photoshop, Illustrator, Premiere Pro marketing creatives.',
    },
  ];

  // 11. Network & Preventive Maintenance Records
  const maintenance = [
    {
      id: 'maint-01',
      type: 'ISP & Fiber Line Check',
      date: T,
      technician: 'Md. Al-Amin',
      findings: 'Primary AmberIT 50Mbps fiber ping to BDIX: 4ms. Secondary Link3 15Mbps ping: 12ms. Failover tested successfully.',
      actionTaken: 'Cleaned SC/UPC optical fiber connector and updated MikroTik DNS cache.',
      status: 'Satisfactory',
    },
    {
      id: 'maint-02',
      type: 'Server Room Thermal & Battery Audit',
      date: past15D,
      technician: 'Kamrul Hasan',
      findings: 'Server room ambient temperature: 21°C. UPS #1 internal float voltage: 218.4V DC across 16 batteries (normal).',
      actionTaken: 'Vacuumed dust from server intake filters and inspected AC compressor thermostat.',
      status: 'Satisfactory',
    },
    {
      id: 'maint-03',
      type: 'Database Backup Test & Disaster Recovery Drill',
      date: past30D,
      technician: 'Md. Al-Amin',
      findings: 'Local JSON snapshot, IndexedDB storage, and offline exported full backup restored on test machine.',
      actionTaken: 'Verified data integrity across 8 commercial clients and ERP vouchers.',
      status: 'Satisfactory',
    },
  ];

  // 12. In-App Notifications for Task Assignments, Updates & Alerts
  const notifications = [
    {
      id: 'notif-01',
      recipient: 'Tanvir Ahmed',
      sender: 'Super Admin',
      taskId: 'mt-01',
      taskTitle: 'Draft technical blog on 3-Phase vs 1-Phase UPS considerations for hospitals',
      type: 'assignment',
      priority: 'High',
      dueDate: T,
      dueTime: '17:00',
      message: 'Super Admin assigned you "Draft technical blog on 3-Phase vs 1-Phase UPS considerations for hospitals". Priority: High. Deadline: ' + T + ' 17:00',
      read: false,
      createdAt: past2D + 'T10:30:00Z',
    },
    {
      id: 'notif-02',
      recipient: 'Tanvir Ahmed',
      sender: 'MD. MAHMUDUL HASAN',
      taskId: 'mt-03',
      taskTitle: 'Prepare product presentation slides for upcoming pharmaceutical client pitch',
      type: 'assignment',
      priority: 'Urgent',
      dueDate: T,
      dueTime: '15:30',
      message: 'MD. MAHMUDUL HASAN assigned you "Prepare product presentation slides for upcoming pharmaceutical client pitch". Priority: Urgent. Deadline: ' + T + ' 15:30',
      read: false,
      createdAt: past2D + 'T14:20:00Z',
    },
    {
      id: 'notif-03',
      recipient: 'Md. Al-Amin',
      sender: 'System Alert',
      taskId: 'mt-05',
      taskTitle: 'Configure MikroTik VLAN & DHCP reservation for Service Department test bench',
      type: 'overdue',
      priority: 'Urgent',
      dueDate: past2D,
      dueTime: '14:00',
      message: '⚠️ OVERDUE ALERT: Task "Configure MikroTik VLAN & DHCP reservation for Service Department test bench" is past due date (' + past2D + '). Please review.',
      read: false,
      createdAt: past2D + 'T15:00:00Z',
    },
    {
      id: 'notif-04',
      recipient: 'Tanvir Ahmed',
      sender: 'Rafiul Islam',
      taskId: 'mt-02',
      taskTitle: 'Audit Facebook Pixel and LinkedIn Insight Tag conversion events',
      type: 'completed',
      priority: 'High',
      dueDate: past2D,
      dueTime: '18:00',
      message: 'Rafiul Islam marked task "Audit Facebook Pixel and LinkedIn Insight Tag conversion events" as Completed.',
      read: true,
      createdAt: past2D + 'T18:15:00Z',
    },
  ];

  return {
    campaigns,
    posts,
    ads,
    assets,
    creativeRequests,
    marketingTasks,
    captions,
    tickets,
    devices,
    softwareAccounts,
    maintenance,
    notifications,
    systemSettings: {
      departmentName: 'Digital Marketing & IT Support',
      companyName: 'EPI UPS Bangladesh Limited',
      leadEngineer: 'Md. Al-Amin (IT Specialist)',
      marketingLead: 'Tanvir Ahmed (Digital Strategist)',
      supportHotline: '+88 01778-249416',
      itSupportEmail: 'itsupport@epiups.com.bd',
      marketingEmail: 'marketing@epiups.com.bd',
    },
  };
}

class MarketingItStoreEngine {
  constructor() {
    this.memory = null;
    this.listeners = new Set();
    this.init();
  }

  init() {
    if (typeof localStorage === 'undefined') {
      this.memory = createInitialMarketingItData();
      return;
    }

    try {
      const saved = localStorage.getItem(MARKETING_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.campaigns) && Array.isArray(parsed.tickets)) {
          if (!Array.isArray(parsed.notifications)) {
            parsed.notifications = [];
          }
          this.memory = parsed;
          this.checkOverdueNotifications();
          return;
        }
      }
    } catch (e) {
      console.warn('[MarketingStore] LocalStorage load note:', e);
    }

    this.memory = createInitialMarketingItData();
    this.checkOverdueNotifications();
    this.persist();
  }

  getSnapshot() {
    if (!this.memory) {
      this.init();
    }
    if (!Array.isArray(this.memory.notifications)) {
      this.memory.notifications = [];
    }
    return this.memory;
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    for (const fn of this.listeners) {
      try {
        fn(this.memory);
      } catch (e) {
        console.error('[MarketingStore] Listener callback error:', e);
      }
    }
  }

  persist() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(MARKETING_STORAGE_KEY, JSON.stringify(this.memory));
      } catch (e) {
        console.warn('[MarketingStore] Failed to write localStorage:', e);
      }
    }
    this.notify();
  }

  // --- MARKETING CAMPAIGN CRUD ---
  saveCampaign(campaign) {
    const isEdit = Boolean(campaign.id);
    const id = isEdit ? campaign.id : `camp-${Date.now().toString(36)}`;
    const record = {
      ...campaign,
      id,
      updatedAt: new Date().toISOString(),
      createdAt: isEdit ? (campaign.createdAt || new Date().toISOString()) : new Date().toISOString(),
    };

    if (isEdit) {
      this.memory.campaigns = this.memory.campaigns.map((c) => (c.id === id ? record : c));
    } else {
      this.memory.campaigns.unshift(record);
    }
    this.persist();
    return record;
  }

  deleteCampaign(id) {
    this.memory.campaigns = this.memory.campaigns.filter((c) => c.id !== id);
    this.persist();
  }

  // --- SOCIAL POST CRUD ---
  savePost(post) {
    const isEdit = Boolean(post.id);
    const id = isEdit ? post.id : `post-${Date.now().toString(36)}`;
    const record = {
      ...post,
      id,
      updatedAt: new Date().toISOString(),
      createdAt: isEdit ? (post.createdAt || new Date().toISOString()) : new Date().toISOString(),
    };

    if (isEdit) {
      this.memory.posts = this.memory.posts.map((p) => (p.id === id ? record : p));
    } else {
      this.memory.posts.unshift(record);
    }
    this.persist();
    return record;
  }

  deletePost(id) {
    this.memory.posts = this.memory.posts.filter((p) => p.id !== id);
    this.persist();
  }

  // --- PAID AD CRUD ---
  saveAd(ad) {
    const isEdit = Boolean(ad.id);
    const id = isEdit ? ad.id : `ad-${Date.now().toString(36)}`;
    const record = {
      ...ad,
      id,
      updatedAt: new Date().toISOString(),
      createdAt: isEdit ? (ad.createdAt || new Date().toISOString()) : new Date().toISOString(),
    };

    if (isEdit) {
      this.memory.ads = this.memory.ads.map((a) => (a.id === id ? record : a));
    } else {
      this.memory.ads.unshift(record);
    }
    this.persist();
    return record;
  }

  deleteAd(id) {
    this.memory.ads = this.memory.ads.filter((a) => a.id !== id);
    this.persist();
  }

  // --- ASSET CRUD ---
  saveAsset(asset) {
    const isEdit = Boolean(asset.id);
    const id = isEdit ? asset.id : `asset-${Date.now().toString(36)}`;
    const record = {
      ...asset,
      id,
      uploadedAt: isEdit ? asset.uploadedAt : today(),
    };

    if (isEdit) {
      this.memory.assets = this.memory.assets.map((a) => (a.id === id ? record : a));
    } else {
      this.memory.assets.unshift(record);
    }
    this.persist();
    return record;
  }

  deleteAsset(id) {
    this.memory.assets = this.memory.assets.filter((a) => a.id !== id);
    this.persist();
  }

  // --- CREATIVE REQUEST CRUD ---
  saveCreativeRequest(req) {
    const isEdit = Boolean(req.id);
    const id = isEdit ? req.id : `cr-${Date.now().toString(36)}`;
    const record = { ...req, id };

    if (isEdit) {
      this.memory.creativeRequests = this.memory.creativeRequests.map((c) => (c.id === id ? record : c));
    } else {
      this.memory.creativeRequests.unshift(record);
    }
    this.persist();
    return record;
  }

  deleteCreativeRequest(id) {
    this.memory.creativeRequests = this.memory.creativeRequests.filter((c) => c.id !== id);
    this.persist();
  }

  // --- MARKETING WORK MANAGEMENT / TASK CRUD ---
  saveTask(task, currentUser = null) {
    const isEdit = Boolean(task.id);
    const id = isEdit ? task.id : `mt-${Date.now().toString(36)}`;
    const nowIso = new Date().toISOString();
    const existing = isEdit ? this.memory.marketingTasks.find((t) => t.id === id) : null;

    const isCompleted = task.status === 'Completed';

    const history = Array.isArray(existing?.history) ? [...existing.history] : [];
    if (!isEdit) {
      history.push({
        timestamp: nowIso,
        action: 'Assigned',
        by: currentUser?.name || task.assignedBy || 'Super Administrator',
        note: `Work assigned to ${task.assignedTo || 'Unassigned'} with deadline ${task.dueDate || today()} ${task.dueTime || '18:00'}`,
      });
    } else if (task.status && existing && existing.status !== task.status) {
      history.push({
        timestamp: nowIso,
        action: `Status: ${task.status}`,
        by: currentUser?.name || 'Authorized User',
        note: task.completionNotes || task.desc || `Status transitioned to ${task.status}`,
      });
    }

    const record = {
      ...task,
      id,
      title: (task.title || '').trim(),
      category: task.category || existing?.category || 'SEO / Website',
      startDate: task.startDate || existing?.startDate || today(),
      dueDate: task.dueDate || existing?.dueDate || today(),
      dueTime: task.dueTime || existing?.dueTime || '18:00',
      priority: task.priority || existing?.priority || 'Normal',
      status: task.status || existing?.status || 'Assigned',
      progress: typeof task.progress === 'number'
        ? Math.min(100, Math.max(0, task.progress))
        : (isCompleted ? 100 : (existing?.progress ?? (task.status === 'In Progress' ? 50 : 0))),
      assignedTo: (task.assignedTo || existing?.assignedTo || 'Tanvir Ahmed').trim(),
      assignedBy: (task.assignedBy || existing?.assignedBy || currentUser?.name || 'Super Administrator').trim(),
      desc: (task.desc || existing?.desc || '').trim(),
      attachment: task.attachment || existing?.attachment || '',
      completionNotes: (task.completionNotes || existing?.completionNotes || '').trim(),
      completionAttachment: (task.completionAttachment || existing?.completionAttachment || '').trim(),
      completedAt: isCompleted ? (existing?.completedAt || task.completedAt || nowIso) : '',
      completedDate: isCompleted ? (existing?.completedDate || task.completedDate || today()) : '',
      completedTime: isCompleted ? (existing?.completedTime || task.completedTime || new Date().toTimeString().slice(0, 5)) : '',
      completedBy: isCompleted ? (existing?.completedBy || task.completedBy || currentUser?.name || task.assignedTo || 'Employee') : '',
      createdAt: isEdit ? (existing?.createdAt || task.createdAt || nowIso) : nowIso,
      updatedAt: nowIso,
      history,
    };

    if (isEdit) {
      this.memory.marketingTasks = this.memory.marketingTasks.map((t) => (t.id === id ? record : t));

      // 1. Re-assignment notification
      if (existing && existing.assignedTo !== record.assignedTo && record.assignedTo) {
        this.addNotification({
          id: `notif-${Date.now().toString(36)}-reassign`,
          recipient: record.assignedTo,
          sender: currentUser?.name || record.assignedBy || 'Administrator',
          taskId: record.id,
          taskTitle: record.title,
          type: 'assignment',
          priority: record.priority,
          dueDate: record.dueDate,
          dueTime: record.dueTime,
          message: `${currentUser?.name || record.assignedBy || 'Administrator'} reassigned "${record.title}" to you. Priority: ${record.priority}. Due: ${record.dueDate} ${record.dueTime || ''}`.trim(),
          read: false,
          createdAt: nowIso,
        });
      }

      // 2. Deadline update notification
      if (
        existing &&
        (existing.dueDate !== record.dueDate || existing.dueTime !== record.dueTime) &&
        record.assignedTo
      ) {
        this.addNotification({
          id: `notif-${Date.now().toString(36)}-deadline`,
          recipient: record.assignedTo,
          sender: currentUser?.name || record.assignedBy || 'Administrator',
          taskId: record.id,
          taskTitle: record.title,
          type: 'update',
          priority: record.priority,
          dueDate: record.dueDate,
          dueTime: record.dueTime,
          message: `Deadline updated for "${record.title}". New deadline: ${record.dueDate} ${record.dueTime || ''}`.trim(),
          read: false,
          createdAt: nowIso,
        });
      }

      // 3. Completion notification to assigner/administrator
      if (existing && existing.status !== 'Completed' && record.status === 'Completed') {
        const assigner = record.assignedBy || 'Super Administrator';
        this.addNotification({
          id: `notif-${Date.now().toString(36)}-done`,
          recipient: assigner,
          sender: currentUser?.name || record.assignedTo || 'Employee',
          taskId: record.id,
          taskTitle: record.title,
          type: 'completed',
          priority: record.priority,
          dueDate: record.dueDate,
          dueTime: record.dueTime,
          message: `Work "${record.title}" was completed by ${currentUser?.name || record.assignedTo}. Notes: ${record.completionNotes || 'Delivered successfully.'}`,
          read: false,
          createdAt: nowIso,
        });
      }
    } else {
      this.memory.marketingTasks.unshift(record);

      // New task assignment notification
      if (record.assignedTo) {
        this.addNotification({
          id: `notif-${Date.now().toString(36)}-assign`,
          recipient: record.assignedTo,
          sender: currentUser?.name || record.assignedBy || 'Administrator',
          taskId: record.id,
          taskTitle: record.title,
          type: 'assignment',
          priority: record.priority,
          dueDate: record.dueDate,
          dueTime: record.dueTime,
          message: `${currentUser?.name || record.assignedBy || 'Administrator'} assigned you "${record.title}". Priority: ${record.priority}. Deadline: ${record.dueDate} ${record.dueTime || ''}`.trim(),
          read: false,
          createdAt: nowIso,
        });
      }
    }

    this.checkOverdueNotifications();
    this.persist();
    return record;
  }

  // Helper: Employee updates their progress & work notes
  updateTaskProgress(taskId, { progress, status, note, attachment }, currentUser = null) {
    const existing = this.memory.marketingTasks.find((t) => t.id === taskId);
    if (!existing) return null;

    const nextStatus = status || existing.status;
    const nextProgress = typeof progress === 'number' ? progress : (nextStatus === 'Completed' ? 100 : existing.progress);
    const nowIso = new Date().toISOString();

    const history = Array.isArray(existing.history) ? [...existing.history] : [];
    history.push({
      timestamp: nowIso,
      action: nextStatus === 'Completed' ? 'Submitted Completed' : `Progress (${nextProgress}%)`,
      by: currentUser?.name || existing.assignedTo || 'Employee',
      note: note || `Work progress updated to ${nextProgress}% (${nextStatus})`,
    });

    const isDone = nextStatus === 'Completed';

    const updated = {
      ...existing,
      status: nextStatus,
      progress: nextProgress,
      completionNotes: isDone ? (note || existing.completionNotes) : existing.completionNotes,
      completionAttachment: attachment || existing.completionAttachment,
      completedAt: isDone ? (existing.completedAt || nowIso) : '',
      completedDate: isDone ? (existing.completedDate || today()) : '',
      completedTime: isDone ? (existing.completedTime || new Date().toTimeString().slice(0, 5)) : '',
      completedBy: isDone ? (currentUser?.name || existing.assignedTo) : '',
      updatedAt: nowIso,
      history,
    };

    this.memory.marketingTasks = this.memory.marketingTasks.map((t) => (t.id === taskId ? updated : t));

    // Notify administrator
    const assigner = updated.assignedBy || 'Super Administrator';
    this.addNotification({
      id: `notif-${Date.now().toString(36)}-update`,
      recipient: assigner,
      sender: currentUser?.name || existing.assignedTo || 'Employee',
      taskId: updated.id,
      taskTitle: updated.title,
      type: isDone ? 'completed' : 'progress',
      priority: updated.priority,
      dueDate: updated.dueDate,
      message: `${currentUser?.name || existing.assignedTo} updated work "${updated.title}" -> ${nextStatus} (${nextProgress}%). ${note ? 'Note: ' + note : ''}`.trim(),
      read: false,
      createdAt: nowIso,
    });

    this.persist();
    return updated;
  }

  // Helper: Mark work completed with notes and files
  completeTask(taskId, { completionNotes, completionAttachment }, currentUser = null) {
    return this.updateTaskProgress(
      taskId,
      {
        progress: 100,
        status: 'Completed',
        note: completionNotes,
        attachment: completionAttachment,
      },
      currentUser
    );
  }

  // Helper: Get Work History
  getWorkHistory(filters = {}) {
    const { employee, category, startDate, endDate, search } = filters;
    let list = (this.memory.marketingTasks || []).filter((t) => t.status === 'Completed');

    if (employee && employee !== 'All') {
      list = list.filter((t) => t.assignedTo?.toLowerCase() === employee.toLowerCase());
    }

    if (category && category !== 'All') {
      list = list.filter((t) => t.category === category);
    }

    if (startDate) {
      list = list.filter((t) => (t.completedDate || t.dueDate || t.startDate) >= startDate);
    }

    if (endDate) {
      list = list.filter((t) => (t.completedDate || t.dueDate || t.startDate) <= endDate);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.assignedTo && t.assignedTo.toLowerCase().includes(q)) ||
          (t.completionNotes && t.completionNotes.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => {
      const dateA = a.completedDate || a.completedAt || a.dueDate || '';
      const dateB = b.completedDate || b.completedAt || b.dueDate || '';
      return dateB.localeCompare(dateA);
    });
  }

  deleteTask(id) {
    // Preserve completed tasks from accidental deletion unless forced
    this.memory.marketingTasks = this.memory.marketingTasks.filter((t) => t.id !== id);
    if (Array.isArray(this.memory.notifications)) {
      this.memory.notifications = this.memory.notifications.filter((n) => n.taskId !== id);
    }
    this.persist();
  }

  // --- IN-APP NOTIFICATIONS ENGINE ---
  checkOverdueNotifications() {
    if (!Array.isArray(this.memory?.marketingTasks)) return;
    const currentToday = today();
    const nowIso = new Date().toISOString();

    if (!Array.isArray(this.memory.notifications)) {
      this.memory.notifications = [];
    }

    this.memory.marketingTasks.forEach((t) => {
      if (t.dueDate && t.dueDate < currentToday && t.status !== 'Completed') {
        const alreadyNotified = this.memory.notifications.some(
          (n) => n.taskId === t.id && n.type === 'overdue' && n.dueDate === t.dueDate
        );
        if (!alreadyNotified) {
          this.memory.notifications.unshift({
            id: `notif-overdue-${t.id}-${t.dueDate}`,
            recipient: t.assignedTo || 'Marketing Team',
            sender: 'System Alert',
            taskId: t.id,
            taskTitle: t.title,
            type: 'overdue',
            priority: 'Urgent',
            dueDate: t.dueDate,
            dueTime: t.dueTime || '',
            message: `⚠️ OVERDUE TASK ALERT: "${t.title}" is overdue (deadline was ${t.dueDate}). Please update progress immediately.`,
            read: false,
            createdAt: nowIso,
          });
        }
      }
    });
  }

  addNotification(notif) {
    if (!Array.isArray(this.memory.notifications)) {
      this.memory.notifications = [];
    }
    // Prevent duplicate notification by key signature
    const isDuplicate = this.memory.notifications.some(
      (n) =>
        n.taskId === notif.taskId &&
        n.type === notif.type &&
        n.recipient === notif.recipient &&
        n.dueDate === notif.dueDate
    );
    if (!isDuplicate) {
      this.memory.notifications.unshift(notif);
      if (this.memory.notifications.length > 100) {
        this.memory.notifications = this.memory.notifications.slice(0, 100);
      }
    }
  }

  markNotificationAsRead(id) {
    if (!Array.isArray(this.memory.notifications)) return;
    this.memory.notifications = this.memory.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.persist();
  }

  markAllNotificationsAsRead(recipient = null) {
    if (!Array.isArray(this.memory.notifications)) return;
    this.memory.notifications = this.memory.notifications.map((n) => {
      if (!recipient || n.recipient === recipient || recipient === 'Super Admin' || recipient === 'admin') {
        return { ...n, read: true };
      }
      return n;
    });
    this.persist();
  }

  deleteNotification(id) {
    if (!Array.isArray(this.memory.notifications)) return;
    this.memory.notifications = this.memory.notifications.filter((n) => n.id !== id);
    this.persist();
  }

  clearAllNotifications(recipient = null) {
    if (!Array.isArray(this.memory.notifications)) return;
    if (!recipient || recipient === 'Super Admin' || recipient === 'admin') {
      this.memory.notifications = [];
    } else {
      this.memory.notifications = this.memory.notifications.filter((n) => n.recipient !== recipient);
    }
    this.persist();
  }

  // --- IT TICKET CRUD ---
  saveTicket(ticket) {
    const isEdit = Boolean(ticket.id);
    const id = isEdit ? ticket.id : `TICK-${new Date().getFullYear()}-${String(this.memory.tickets.length + 1).padStart(3, '0')}`;
    const record = {
      ...ticket,
      id,
      createdDate: isEdit ? ticket.createdDate : (ticket.createdDate || today()),
      createdTime: isEdit ? ticket.createdTime : (ticket.createdTime || new Date().toTimeString().slice(0, 5)),
      updatedAt: new Date().toISOString(),
    };

    // Auto set completion date if resolved/closed
    if (['Resolved', 'Closed'].includes(record.status) && !record.completionDate) {
      record.completionDate = today();
      record.completionTime = new Date().toTimeString().slice(0, 5);
    } else if (['Open', 'In Progress', 'Pending Vendor'].includes(record.status)) {
      record.completionDate = '';
      record.completionTime = '';
    }

    if (isEdit) {
      this.memory.tickets = this.memory.tickets.map((t) => (t.id === id ? record : t));
    } else {
      this.memory.tickets.unshift(record);
    }
    this.persist();
    return record;
  }

  deleteTicket(id) {
    this.memory.tickets = this.memory.tickets.filter((t) => t.id !== id);
    this.persist();
  }

  // --- IT DEVICE HARDWARE CRUD ---
  saveDevice(device) {
    const isEdit = Boolean(device.id);
    const id = isEdit ? device.id : `dev-${Date.now().toString(36)}`;
    const record = { ...device, id, updatedAt: new Date().toISOString() };

    if (isEdit) {
      this.memory.devices = this.memory.devices.map((d) => (d.id === id ? record : d));
    } else {
      this.memory.devices.unshift(record);
    }
    this.persist();
    return record;
  }

  deleteDevice(id) {
    this.memory.devices = this.memory.devices.filter((d) => d.id !== id);
    this.persist();
  }

  // --- SOFTWARE LICENSE CRUD ---
  saveSoftware(sw) {
    const isEdit = Boolean(sw.id);
    const id = isEdit ? sw.id : `sw-${Date.now().toString(36)}`;
    const record = { ...sw, id };

    if (isEdit) {
      this.memory.softwareAccounts = this.memory.softwareAccounts.map((s) => (s.id === id ? record : s));
    } else {
      this.memory.softwareAccounts.unshift(record);
    }
    this.persist();
    return record;
  }

  deleteSoftware(id) {
    this.memory.softwareAccounts = this.memory.softwareAccounts.filter((s) => s.id !== id);
    this.persist();
  }

  // --- IT MAINTENANCE RECORD CRUD ---
  saveMaintenance(m) {
    const isEdit = Boolean(m.id);
    const id = isEdit ? m.id : `maint-${Date.now().toString(36)}`;
    const record = { ...m, id, date: m.date || today() };

    if (isEdit) {
      this.memory.maintenance = this.memory.maintenance.map((it) => (it.id === id ? record : it));
    } else {
      this.memory.maintenance.unshift(record);
    }
    this.persist();
    return record;
  }

  deleteMaintenance(id) {
    this.memory.maintenance = this.memory.maintenance.filter((it) => it.id !== id);
    this.persist();
  }

  // --- SYSTEM SETTINGS UPDATE ---
  updateSettings(settings) {
    this.memory.systemSettings = {
      ...this.memory.systemSettings,
      ...settings,
    };
    this.persist();
  }

  // --- BACKUP & RESTORE ---
  exportBackup(user) {
    assertAuthorizedAdmin(user);
    const backup = {
      system: 'EPI Digital Marketing & IT Support',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: this.memory,
    };
    const str = JSON.stringify(backup, null, 2);
    if (typeof document !== 'undefined') {
      const blob = new Blob([str], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EPI-Marketing-IT-Backup-${today()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    return backup;
  }

  importBackup(parsedOrJson, user) {
    assertAuthorizedAdmin(user);
    try {
      const data = typeof parsedOrJson === 'string' ? JSON.parse(parsedOrJson) : parsedOrJson;
      const target = data.data || data;
      if (!Array.isArray(target.campaigns) && !Array.isArray(target.tickets)) {
        throw new Error('Invalid Digital Marketing & IT backup format.');
      }
      this.memory = {
        campaigns: Array.isArray(target.campaigns) ? target.campaigns : [],
        posts: Array.isArray(target.posts) ? target.posts : [],
        ads: Array.isArray(target.ads) ? target.ads : [],
        assets: Array.isArray(target.assets) ? target.assets : [],
        creativeRequests: Array.isArray(target.creativeRequests) ? target.creativeRequests : [],
        marketingTasks: Array.isArray(target.marketingTasks) ? target.marketingTasks : [],
        captions: Array.isArray(target.captions) ? target.captions : [],
        tickets: Array.isArray(target.tickets) ? target.tickets : [],
        devices: Array.isArray(target.devices) ? target.devices : [],
        softwareAccounts: Array.isArray(target.softwareAccounts) ? target.softwareAccounts : [],
        maintenance: Array.isArray(target.maintenance) ? target.maintenance : [],
        notifications: Array.isArray(target.notifications) ? target.notifications : [],
        systemSettings: target.systemSettings || this.memory.systemSettings,
      };
      this.persist();
      return { success: true };
    } catch (e) {
      throw new Error(`Import failed: ${e.message}`);
    }
  }

  resetDemo() {
    this.memory = createInitialMarketingItData();
    this.persist();
    return this.memory;
  }
}

export const marketingStore = new MarketingItStoreEngine();

if (typeof window !== 'undefined') {
  window.__EPI_MARKETING_STORE__ = marketingStore;
}
