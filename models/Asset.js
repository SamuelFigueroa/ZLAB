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
      required: function () {return this.category == 'Lab Equipment';}
    },
    sub_area: {
      type: ObjectId,
      required: function () {return this.category == 'Lab Equipment';}
    }
  },
  serial_number: String,
  model: String,
  brand: String,
  purchasing_info: {
    date: {
      type: Date,
      required: function () {return this.category == 'Lab Equipment';}
    },
    supplier: {
      type: String,
      required: function () {return this.category == 'Lab Equipment';}
    },
    warranty_exp: Date,
    price: {
      type: Number,
      required: function () {return this.category == 'Lab Equipment';}
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
      required: function () {return this.category == 'Lab Equipment';}
    },
    grant_number: {
      type: String,
      required: function () {return this.category == 'Lab Equipment';}
    },
    project_name: {
      type: String,
      required: function () {return this.category == 'Lab Equipment';}
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
    scheduled: Date,
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
  training_required: String,
  condition: {
    type: String,
    enum: ['Fully Operational', 'Needs Repair', 'Maintenance Due', 'Decommissioned', 'To Be Installed', '']
  },
  purchase_log:[{
    date: {
      type: Date,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    supplier: {
      type: String,
      required: true
    },
    received: Date,
    catalog_number: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
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

AssetSchema.index({'$**': 'text'});
const Asset = mongoose.model('assets', AssetSchema);

export default Asset;
