import gql from 'graphql-tag';

const GET_PRINTER_FORMATS = gql`
  query getPrinterFormats($withFields: Boolean!) {
    printerFormats {
      id
      name
      defaults @include(if: $withFields) {
        labelWidth
        labelLength
        fieldOrientation
        fieldJustify
        dotsPerMm
        reverse
        mirror
        labelOrientation
      }
      fields @include(if: $withFields) {
        name
        variable
        kind
        data
        originX
        originY
        justify
        reverse
        orientation
        fontHeight
        fontWidth
        direction
        gap
        clockEnabled
        clock
        hexEnabled
        hexIndicator

        moduleWidth
        barWidthRatio
        height
        barcode
        checkDigit
        interpretation
        interpretationAbove

        moduleHeight
        columns
        rows
        aspectRatio

        operation
        format

        graphic
        width
        thickness
        color
        roundness
        diameter
        diagonalOrientation
        compression
        byteCount
        fieldCount
        bytesPerRow
        graphicData
      }
    }
  }
`;



export default GET_PRINTER_FORMATS;
