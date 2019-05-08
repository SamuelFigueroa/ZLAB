const equipment = [
  {
    key:'profile',
    label: 'Profile',
    filters: [
      { key: 'location', path: 'location', label: 'Location', type: 'Multi' },
      { key: 'condition', path: 'condition', label: 'Condition', type: 'Multi' },
      { key: 'brand', path: 'brand', label: 'Brand', type: 'Multi' },
      { key: 'model', path: 'model', label: 'Model', type: 'Multi' },
      { key: 'registrationEventUser', path: 'registration_event.user', label: 'Registered By', type: 'Multi' },
      { key: 'registrationEventDate', path: 'registration_event.date', label: 'Date Registered', type: 'DateRange' },
    ]
  },{
    key: 'purchasing_info',
    label: 'Purchasing Info',
    filters: [
      { key: 'purchasingInfoSupplier', path: 'purchasing_info.supplier', label: 'Supplier', type: 'Multi' },
      { key: 'purchasingInfoPrice', path: 'purchasing_info.price', label: 'Price', type: 'CurrencyRange' },
      { key: 'purchasingInfoDate', path: 'purchasing_info.date', label: 'Date Purchased', type: 'DateRange' },
      { key: 'purchasingInfoWarrantyExp', path: 'purchasing_info.warranty_exp',label: 'Warranty Expires', type: 'DateRange' },
    ]
  },{
    key: 'grant',
    label: 'Grant Info',
    filters: [
      { key: 'grantNumber', path: 'grant.grant_number', label: 'Grant No.', type: 'Multi' },
      { key: 'grantFundingAgency', path: 'grant.funding_agency', label: 'Funding Agency', type: 'Multi' },
      { key: 'grantProjectName', path: 'grant.project_name', label: 'Project Name', type: 'Multi' },
    ]
  },{
    key: 'usage',
    label: 'Usage Info',
    filters: [
      { key: 'users', path: 'users', label: 'Users', type: 'Multi' },
      { key: 'shared', path: 'shared', label: 'Shared', type: 'Single' },
      { key: 'trainingRequired', path: 'training_required', label: 'Training Req.', type: 'Single' },
    ]
  },{
    key: 'maintenance_log',
    label: 'Maintenance Info',
    filters: [
      { key: 'maintenanceLogService', path: 'maintenance_log.service', label: 'Service', type: 'Multi' },
      { key: 'maintenanceLogAgent', path: 'maintenance_log.agent', label: 'Agent', type: 'Multi' },
      { key: 'maintenanceLogDate', path: 'maintenance_log.date', label: 'Events', type: 'DateRange' },
      { key: 'maintenanceLogScheduled', path: 'maintenance_log.scheduled', label: 'Scheduled', type: 'DateRange' },
    ]
  }
];
const consumables = [
  {
    key:'profile',
    label: 'Profile',
    filters: [
      { key: 'shared', path: 'shared', label: 'Shared', type: 'Single' },
      { key: 'registrationEventUser', path: 'registration_event.user', label: 'Registered By', type: 'Multi' },
      { key: 'registrationEventDate', path: 'registration_event.date', label: 'Date Registered', type: 'DateRange' },
    ]
  },{
    key: 'purchase_log',
    label: 'Resupply Info',
    filters: [
      { key: 'purchaseLogSupplier', path: 'purchase_log.supplier', label: 'Supplier', type: 'Multi' },
      { key: 'purchaseLogPrice', path: 'purchase_log.price', label: 'Price', type: 'CurrencyRange' },
      { key: 'purchaseLogDate', path: 'purchase_log.date', label: 'Purchases', type: 'DateRange' },
      { key: 'purchaseLogReceived', path: 'purchase_log.received', label: 'Received', type: 'DateRange' },
    ]
  }
];

export const EquipmentFilterGroups=equipment,
  ConsumablesFilterGroups=consumables;
