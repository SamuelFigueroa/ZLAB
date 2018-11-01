import mongoose from 'mongoose';

const FieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  variable: {
    type: Boolean,
    required: true
  },
  kind: {
    type: String,
    enum: ['text', 'barcode', 'rfid', 'graphic'],
    required: true
  },
  data: {
    type: String,
    required: true
  },
  originX: Number,
  originY: Number,
  justify: Number,
  reverse: Boolean,
  orientation: {
    type: String,
    enum: ['N', 'R', 'I', 'B'],
  },
  fontHeight: Number,
  fontWidth: Number,
  direction: {
    type: String,
    enum: ['H', 'V', 'R']
  },
  gap: Number,
  clockEnabled: Boolean,
  clock: String,
  hexEnabled: Boolean,
  hexIndicator: String,

  moduleWidth : Number,
  barWidthRatio: Number,
  height: Number,
  barcode: {
    type: String,
    required: function() {return this.kind == 'barcode';},
  },
  //orientation
  checkDigit: Boolean,
  interpretation: Boolean,
  interpretationAbove: Boolean,

  moduleHeight: Number,
  columns: Number,
  rows: Number,
  aspectRatio: Number,

  operation: String,
  format: String,

  graphic: {
    type: String,
    enum: ['box', 'circle', 'diagonal', 'ellipse', 'upload'],
    required: function() {return this.kind == 'graphic';},
  },
  thickness: Number,
  color: String,
  roundness: Number,
  diameter: Number,
  diagonalOrientation: String,
  compression: String,
  byteCount: Number,
  fieldCount: Number,
  bytesPerRow: Number,
  graphicData: String,
});

const PrinterFormatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  defaults: {
    labelWidth: {
      type: Number,
      required: true
    },
    labelLength: {
      type: Number,
      required: true
    },
    fieldOrientation: {
      type: String,
      enum: ['N', 'R', 'I', 'B'],
    },
    fieldJustify: Number,
    dotsPerMm: {
      type: String,
      enum: ['A','B']
    },
    reverse: Boolean,
    mirror: Boolean,
    labelOrientation: {
      type: String,
      enum: ['N', 'I']
    },
  },
  fields: [FieldSchema]
});

const PrinterFormat = mongoose.model('printerFormats', PrinterFormatSchema);

export default PrinterFormat;
