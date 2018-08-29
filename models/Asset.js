import mongoose from 'mongoose';
const ObjectId = mongoose.Schema.Types.ObjectId;

const AssetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  barcode: String,
  description: String,
  category: {
    type: String,
    enum: ['Computer Hardware', 'Lab Equipment', 'Software', 'Lab Supplies'],
    required: true
  },
  location: {
    area: {
      type: ObjectId,
      required: true
    },
    sub_area: {
      type: ObjectId,
      required: true
    }
  },
  serial_number: String,
  model: String,
  brand: String,
  purchasing_info: {
    date: {
      type: Date,
      required: true
    },
    supplier: {
      type: String,
      required: true
    },
    warranty_exp: String,
    price: {
      type: Number,
      required: true
    }
  },
  shared: {
    type: String,
    enum: ['Yes', 'No'],
    required: true
  },
  grant: {
    funding_agency: {
      type: String,
      required: true
    },
    grant_number: {
      type: String,
      required: true
    },
    project_name: {
      type: String,
      required: true
    }
  },
  maintenance_log: [{
    service: {
      type: String,
      enum: ['Install', 'Repair', 'Prev. Maintenance', 'Calibration', 'Decommission'],
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    scheduled: {
      type: String
    },
    agent: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  users: [ObjectId],
  training_required: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    enum: ['Fully Operational', 'Needs Repair', 'Maintenance Due', 'Decommissioned', 'To Be Installed'],
    required: true
  },
  documents: [ObjectId],
  registration_event: {
    user: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      'default': Date.now
    }
  }
});

const Asset = mongoose.model('assets', AssetSchema);

export default Asset;
